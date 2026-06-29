package main

import (
	"bytes"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"mime/multipart"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type config struct {
	Addr                   string
	AppEnv                 string
	DevMode                bool
	WebhookToken           string
	TemplatePath           string
	TypstPath              string
	SMTPHost               string
	SMTPPort               string
	SMTPUser               string
	SMTPPassword           string
	SMTPFrom               string
	SMTPSecure             bool
	SMTPIgnoreTLS          bool
	SMTPInsecureSkipVerify bool
}

type server struct {
	config config
}

type webhookRequest struct {
	To      string          `json:"to"`
	Subject string          `json:"subject"`
	Text    string          `json:"text"`
	Offer   json.RawMessage `json:"offer"`

	Event      string          `json:"event"`
	Payload    json.RawMessage `json:"payload"`
	Key        string          `json:"key"`
	Collection string          `json:"collection"`
}

type directusOffer struct {
	Event      string       `json:"event,omitempty"`
	Payload    offerPayload `json:"payload"`
	Key        string       `json:"key,omitempty"`
	Collection string       `json:"collection,omitempty"`
}

type offerPayload struct {
	Language      string          `json:"language"`
	Doors         []string        `json:"doors"`
	Windows       windowsChange   `json:"windows"`
	DoorPump      bool            `json:"door_pump"`
	SteelHandle   bool            `json:"steel_handle"`
	TintedGlass   bool            `json:"tinted_glass"`
	Shutters      bool            `json:"shutters"`
	WindowNotes   string          `json:"window_notes"`
	Other         string          `json:"other"`
	Aircon        bool            `json:"aircon"`
	ExternalLED   int             `json:"external_led"`
	Kitchen       string          `json:"kitchen"`
	Toilet        bool            `json:"toilet"`
	Bathroom      bool            `json:"bathroom"`
	PartitionWall bool            `json:"partition_wall"`
	ExternalDecor string          `json:"external_decor"`
	DeliveryDate  string          `json:"delivery_date"`
	Price         string          `json:"price"`
	Extra         json.RawMessage `json:"-"`
}

type windowsChange struct {
	Create []windowItem      `json:"create"`
	Update []json.RawMessage `json:"update"`
	Delete []json.RawMessage `json:"delete"`
}

type windowItem struct {
	Material string `json:"material"`
	Size     string `json:"size"`
}

type templateData struct {
	GeneratedAt  string            `json:"generated_at"`
	Language     string            `json:"language"`
	OfferID      string            `json:"offer_id"`
	Labels       map[string]string `json:"labels"`
	Doors        []string          `json:"doors"`
	Windows      []windowView      `json:"windows"`
	Options      []optionView      `json:"options"`
	Notes        []noteView        `json:"notes"`
	DeliveryDate string            `json:"delivery_date"`
	Price        string            `json:"price"`
	Raw          offerPayload      `json:"raw"`
}

type windowView struct {
	Material string `json:"material"`
	Size     string `json:"size"`
}

type optionView struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

type noteView struct {
	Label string `json:"label"`
	Text  string `json:"text"`
}

func main() {
	cfg := loadConfig()
	srv := server{config: cfg}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", srv.health)
	mux.HandleFunc("POST /webhooks/offer", srv.offerWebhook)

	if cfg.DevMode && cfg.AppEnv != "production" {
		mux.HandleFunc("GET /dev/offer.pdf", srv.devOfferPDF)
		mux.HandleFunc("POST /dev/offer.pdf", srv.devOfferPDF)
		mux.HandleFunc("POST /dev/render", srv.devRenderJSON)
		log.Printf("dev template endpoints enabled")
	}

	log.Printf("offer mailer listening on %s", cfg.Addr)
	if err := http.ListenAndServe(cfg.Addr, logging(mux)); err != nil {
		log.Fatal(err)
	}
}

func loadConfig() config {
	return config{
		Addr:                   getEnv("ADDR", ":8080"),
		AppEnv:                 getEnv("APP_ENV", "development"),
		DevMode:                parseBool(getEnv("DEV_MODE", "false")),
		WebhookToken:           os.Getenv("WEBHOOK_TOKEN"),
		TemplatePath:           getEnv("TYPST_TEMPLATE_PATH", "templates/offer.typ"),
		TypstPath:              getEnv("TYPST_PATH", "typst"),
		SMTPHost:               getFirstEnv("SMTP_HOST", "EMAIL_SMTP_HOST"),
		SMTPPort:               getFirstEnvWithDefault("587", "SMTP_PORT", "EMAIL_SMTP_PORT"),
		SMTPUser:               getFirstEnv("SMTP_USER", "EMAIL_SMTP_USER"),
		SMTPPassword:           getFirstEnv("SMTP_PASSWORD", "EMAIL_SMTP_PASSWORD"),
		SMTPFrom:               getFirstEnv("SMTP_FROM", "EMAIL_FROM"),
		SMTPSecure:             parseBool(getFirstEnv("SMTP_SECURE", "EMAIL_SMTP_SECURE")),
		SMTPIgnoreTLS:          parseBool(getFirstEnv("SMTP_IGNORE_TLS", "EMAIL_SMTP_IGNORE_TLS")),
		SMTPInsecureSkipVerify: parseBool(getEnv("SMTP_INSECURE_SKIP_VERIFY", "false")),
	}
}

func (s server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s server) offerWebhook(w http.ResponseWriter, r *http.Request) {
	if err := s.authorize(r); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var req webhookRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := validateEmailRequest(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	offer, err := req.directusOffer()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pdf, err := s.renderPDF(normalizeOffer(offer))
	if err != nil {
		log.Printf("render failed: %v", err)
		http.Error(w, "failed to render PDF", http.StatusInternalServerError)
		return
	}

	filename := "offer.pdf"
	if offer.Key != "" {
		filename = "offer-" + sanitizeFilename(offer.Key) + ".pdf"
	}

	if err := s.sendMail(req.To, req.Subject, req.Text, filename, pdf); err != nil {
		log.Printf("mail failed: %v", err)
		http.Error(w, "failed to send email", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusAccepted, map[string]string{"status": "sent"})
}

func (s server) devOfferPDF(w http.ResponseWriter, r *http.Request) {
	offer, err := offerFromDevRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pdf, err := s.renderPDF(normalizeOffer(offer))
	if err != nil {
		log.Printf("dev render failed: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `inline; filename="offer-dev.pdf"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(pdf)
}

func (s server) devRenderJSON(w http.ResponseWriter, r *http.Request) {
	offer, err := offerFromDevRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, http.StatusOK, normalizeOffer(offer))
}

func offerFromDevRequest(r *http.Request) (directusOffer, error) {
	if r.Method == http.MethodGet || r.Body == nil {
		return sampleOffer(), nil
	}

	var req webhookRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		return directusOffer{}, err
	}
	return req.directusOffer()
}

func (s server) authorize(r *http.Request) error {
	if s.config.WebhookToken == "" {
		return nil
	}

	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") && strings.TrimPrefix(auth, "Bearer ") == s.config.WebhookToken {
		return nil
	}
	if r.Header.Get("X-Webhook-Token") == s.config.WebhookToken {
		return nil
	}
	return errors.New("invalid webhook token")
}

func (r webhookRequest) directusOffer() (directusOffer, error) {
	if len(r.Offer) > 0 && string(r.Offer) != "null" {
		var wrapped directusOffer
		if err := json.Unmarshal(r.Offer, &wrapped); err == nil && len(wrapped.Payload.Language) > 0 {
			return wrapped, nil
		}

		var payload offerPayload
		if err := json.Unmarshal(r.Offer, &payload); err != nil {
			return directusOffer{}, fmt.Errorf("invalid offer: %w", err)
		}
		return directusOffer{Payload: payload}, nil
	}

	if len(r.Payload) == 0 || string(r.Payload) == "null" {
		return directusOffer{}, errors.New("missing offer payload")
	}

	var payload offerPayload
	if err := json.Unmarshal(r.Payload, &payload); err != nil {
		return directusOffer{}, fmt.Errorf("invalid payload: %w", err)
	}

	return directusOffer{
		Event:      r.Event,
		Payload:    payload,
		Key:        r.Key,
		Collection: r.Collection,
	}, nil
}

func validateEmailRequest(req webhookRequest) error {
	if _, err := mail.ParseAddress(req.To); err != nil {
		return fmt.Errorf("invalid to address: %w", err)
	}
	if strings.TrimSpace(req.Subject) == "" {
		return errors.New("missing subject")
	}
	if strings.TrimSpace(req.Text) == "" {
		return errors.New("missing text")
	}
	return nil
}

func normalizeOffer(offer directusOffer) templateData {
	lang := offer.Payload.Language
	if lang != "en" && lang != "pl" {
		lang = "pl"
	}
	t := translations[lang]

	data := templateData{
		GeneratedAt:  time.Now().Format("2006-01-02"),
		Language:     lang,
		OfferID:      offer.Key,
		Labels:       labels[lang],
		Doors:        translateList(t.doors, offer.Payload.Doors),
		DeliveryDate: offer.Payload.DeliveryDate,
		Price:        offer.Payload.Price,
		Raw:          offer.Payload,
	}

	for _, item := range offer.Payload.Windows.Create {
		data.Windows = append(data.Windows, windowView{
			Material: translate(t.windowMaterials, item.Material),
			Size:     item.Size,
		})
	}

	addBoolOption(&data, offer.Payload.DoorPump, "door_pump")
	addBoolOption(&data, offer.Payload.SteelHandle, "steel_handle")
	addBoolOption(&data, offer.Payload.TintedGlass, "tinted_glass")
	addBoolOption(&data, offer.Payload.Shutters, "shutters")
	addBoolOption(&data, offer.Payload.Aircon, "aircon")
	addBoolOption(&data, offer.Payload.Toilet, "toilet")
	addBoolOption(&data, offer.Payload.Bathroom, "bathroom")
	addBoolOption(&data, offer.Payload.PartitionWall, "partition_wall")

	if offer.Payload.ExternalLED > 0 {
		data.Options = append(data.Options, optionView{Label: labels[lang]["external_led"], Value: strconv.Itoa(offer.Payload.ExternalLED)})
	}
	if offer.Payload.Kitchen != "" {
		data.Options = append(data.Options, optionView{Label: labels[lang]["kitchen"], Value: translate(t.kitchens, offer.Payload.Kitchen)})
	}
	if offer.Payload.ExternalDecor != "" {
		data.Options = append(data.Options, optionView{Label: labels[lang]["external_decor"], Value: translate(t.externalDecor, offer.Payload.ExternalDecor)})
	}
	if strings.TrimSpace(offer.Payload.WindowNotes) != "" {
		data.Notes = append(data.Notes, noteView{Label: labels[lang]["window_notes"], Text: offer.Payload.WindowNotes})
	}
	if strings.TrimSpace(offer.Payload.Other) != "" {
		data.Notes = append(data.Notes, noteView{Label: labels[lang]["other"], Text: offer.Payload.Other})
	}

	return data
}

func addBoolOption(data *templateData, enabled bool, key string) {
	if !enabled {
		return
	}
	data.Options = append(data.Options, optionView{Label: data.Labels[key], Value: data.Labels["yes"]})
}

func (s server) renderPDF(data templateData) ([]byte, error) {
	dir, err := os.MkdirTemp("", "offer-*")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(dir)

	dataPath := filepath.Join(dir, "offer.json")
	templatePath := filepath.Join(dir, "offer.typ")
	outPath := filepath.Join(dir, "offer.pdf")

	dataJSON, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(dataPath, dataJSON, 0o600); err != nil {
		return nil, err
	}
	templateBytes, err := os.ReadFile(s.config.TemplatePath)
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(templatePath, templateBytes, 0o600); err != nil {
		return nil, err
	}

	cmd := exec.Command(s.config.TypstPath, "compile", "--input", "data=offer.json", templatePath, outPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("typst compile failed: %w: %s", err, stderr.String())
	}

	return os.ReadFile(outPath)
}

func (s server) sendMail(to, subject, text, filename string, pdf []byte) error {
	if s.config.SMTPHost == "" || s.config.SMTPFrom == "" {
		return errors.New("SMTP_HOST and SMTP_FROM are required")
	}

	from, err := mail.ParseAddress(s.config.SMTPFrom)
	if err != nil {
		return fmt.Errorf("invalid SMTP_FROM: %w", err)
	}
	toAddr, err := mail.ParseAddress(to)
	if err != nil {
		return fmt.Errorf("invalid recipient: %w", err)
	}

	message, err := buildEmail(from.String(), toAddr.String(), subject, text, filename, pdf)
	if err != nil {
		return err
	}

	addr := netJoinHostPort(s.config.SMTPHost, s.config.SMTPPort)
	return sendSMTP(addr, s.config, []string{toAddr.Address}, message)
}

func buildEmail(from, to, subject, text, filename string, pdf []byte) ([]byte, error) {
	var body bytes.Buffer
	boundary := randomBoundary()

	headers := map[string]string{
		"From":         from,
		"To":           to,
		"Subject":      mime.QEncoding.Encode("utf-8", subject),
		"MIME-Version": "1.0",
		"Content-Type": `multipart/mixed; boundary="` + boundary + `"`,
		"Date":         time.Now().Format(time.RFC1123Z),
	}

	for key, value := range headers {
		fmt.Fprintf(&body, "%s: %s\r\n", key, value)
	}
	body.WriteString("\r\n")

	writer := multipart.NewWriter(&body)
	if err := writer.SetBoundary(boundary); err != nil {
		return nil, err
	}

	textPart, err := writer.CreatePart(map[string][]string{
		"Content-Type":              {`text/plain; charset="utf-8"`},
		"Content-Transfer-Encoding": {"quoted-printable"},
	})
	if err != nil {
		return nil, err
	}
	_, _ = textPart.Write([]byte(quotedPrintable(text)))

	attachmentHeader := map[string][]string{
		"Content-Type":              {`application/pdf; name="` + escapeHeader(filename) + `"`},
		"Content-Disposition":       {`attachment; filename="` + escapeHeader(filename) + `"`},
		"Content-Transfer-Encoding": {"base64"},
	}
	attachment, err := writer.CreatePart(attachmentHeader)
	if err != nil {
		return nil, err
	}
	encoder := base64.NewEncoder(base64.StdEncoding, newBase64LineWriter(attachment))
	if _, err := encoder.Write(pdf); err != nil {
		return nil, err
	}
	if err := encoder.Close(); err != nil {
		return nil, err
	}

	if err := writer.Close(); err != nil {
		return nil, err
	}

	return body.Bytes(), nil
}

func sendSMTP(addr string, cfg config, recipients []string, message []byte) error {
	var client *smtp.Client
	var err error
	if cfg.SMTPSecure {
		conn, tlsErr := tls.Dial("tcp", addr, &tls.Config{ServerName: cfg.SMTPHost, InsecureSkipVerify: cfg.SMTPInsecureSkipVerify})
		if tlsErr != nil {
			return tlsErr
		}
		client, err = smtp.NewClient(conn, cfg.SMTPHost)
	} else {
		client, err = smtp.Dial(addr)
	}
	if err != nil {
		return err
	}
	defer client.Close()

	if !cfg.SMTPSecure && !cfg.SMTPIgnoreTLS {
		ok, _ := client.Extension("STARTTLS")
		if !ok {
			return errors.New("SMTP server does not support STARTTLS; set EMAIL_SMTP_IGNORE_TLS=true to allow plaintext SMTP")
		}
		if err := client.StartTLS(&tls.Config{ServerName: cfg.SMTPHost, InsecureSkipVerify: cfg.SMTPInsecureSkipVerify}); err != nil {
			return err
		}
	}

	if cfg.SMTPUser != "" {
		auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
		if err := client.Auth(auth); err != nil {
			return err
		}
	}

	from, err := mail.ParseAddress(cfg.SMTPFrom)
	if err != nil {
		return err
	}
	if err := client.Mail(from.Address); err != nil {
		return err
	}
	for _, recipient := range recipients {
		if err := client.Rcpt(recipient); err != nil {
			return err
		}
	}
	writer, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := writer.Write(message); err != nil {
		_ = writer.Close()
		return err
	}
	if err := writer.Close(); err != nil {
		return err
	}
	return client.Quit()
}

func decodeJSON(body io.Reader, target any) error {
	decoder := json.NewDecoder(io.LimitReader(body, 1<<20))
	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Millisecond))
	})
}

func sampleOffer() directusOffer {
	return directusOffer{
		Event:      "offer.items.create",
		Key:        "bf372199-a99c-4e1a-b4dc-a60e9f849b6d",
		Collection: "offer",
		Payload: offerPayload{
			Language:      "pl",
			Doors:         []string{"glass", "full", "double"},
			Windows:       windowsChange{Create: []windowItem{{Material: "pcv", Size: "100x60"}, {Material: "aluminium", Size: "97x210"}}},
			DoorPump:      true,
			SteelHandle:   true,
			TintedGlass:   true,
			Shutters:      true,
			WindowNotes:   "testing this is a long text input",
			Other:         "testing this is another long text input",
			Aircon:        true,
			ExternalLED:   4,
			Kitchen:       "premium",
			Toilet:        true,
			Bathroom:      true,
			PartitionWall: true,
			ExternalDecor: "front_and_sides",
			DeliveryDate:  "4 tygodnie",
			Price:         "80 599 zł",
		},
	}
}

type dictionary struct {
	doors           map[string]string
	windowMaterials map[string]string
	kitchens        map[string]string
	externalDecor   map[string]string
}

var translations = map[string]dictionary{
	"pl": {
		doors: map[string]string{
			"glass":  "przeszklone",
			"full":   "pełne",
			"double": "podwójne",
		},
		windowMaterials: map[string]string{
			"pcv":       "PCV",
			"aluminium": "aluminiowe",
		},
		kitchens: map[string]string{
			"standard": "standardowa",
			"premium":  "premium",
		},
		externalDecor: map[string]string{
			"front":           "front",
			"front_and_sides": "front i boki",
			"none":            "brak",
		},
	},
	"en": {
		doors: map[string]string{
			"glass":  "glazed",
			"full":   "solid",
			"double": "double",
		},
		windowMaterials: map[string]string{
			"pcv":       "PVC",
			"aluminium": "aluminium",
		},
		kitchens: map[string]string{
			"standard": "standard",
			"premium":  "premium",
		},
		externalDecor: map[string]string{
			"front":           "front",
			"front_and_sides": "front and sides",
			"none":            "none",
		},
	},
}

var labels = map[string]map[string]string{
	"pl": {
		"title":          "Oferta na pawilon",
		"date":           "Data",
		"offer_no":       "Numer oferty",
		"configuration":  "Konfiguracja",
		"doors":          "Drzwi",
		"windows":        "Okna",
		"material":       "Materiał",
		"size":           "Wymiar",
		"options":        "Wyposażenie i opcje",
		"notes":          "Uwagi",
		"delivery_date":  "Termin realizacji",
		"price":          "Cena łączna netto",
		"yes":            "tak",
		"door_pump":      "samozamykacz drzwiowy",
		"steel_handle":   "pochwyt stalowy",
		"tinted_glass":   "szyby przyciemniane",
		"shutters":       "rolety zewnętrzne",
		"aircon":         "klimatyzacja",
		"external_led":   "zewnętrzne punkty LED",
		"kitchen":        "aneks kuchenny",
		"toilet":         "toaleta",
		"bathroom":       "łazienka",
		"partition_wall": "ścianka działowa",
		"external_decor": "dekor zewnętrzny",
		"window_notes":   "Uwagi do stolarki",
		"other":          "Pozostałe uwagi",
		"footer":         "Oferta jest ważna 7 dni. Przedstawione informacje wymagają potwierdzenia w zamówieniu.",
	},
	"en": {
		"title":          "Container offer",
		"date":           "Date",
		"offer_no":       "Offer number",
		"configuration":  "Configuration",
		"doors":          "Doors",
		"windows":        "Windows",
		"material":       "Material",
		"size":           "Size",
		"options":        "Equipment and options",
		"notes":          "Notes",
		"delivery_date":  "Delivery date",
		"price":          "Total net price",
		"yes":            "yes",
		"door_pump":      "door closer",
		"steel_handle":   "steel handle",
		"tinted_glass":   "tinted glass",
		"shutters":       "external shutters",
		"aircon":         "air conditioning",
		"external_led":   "external LED points",
		"kitchen":        "kitchenette",
		"toilet":         "toilet",
		"bathroom":       "bathroom",
		"partition_wall": "partition wall",
		"external_decor": "external decor",
		"window_notes":   "Window notes",
		"other":          "Other notes",
		"footer":         "This offer is valid for 7 days. The presented information must be confirmed in the order.",
	},
}

func translateList(dict map[string]string, values []string) []string {
	translated := make([]string, 0, len(values))
	for _, value := range values {
		translated = append(translated, translate(dict, value))
	}
	return translated
}

func translate(dict map[string]string, value string) string {
	if translated, ok := dict[value]; ok {
		return translated
	}
	return value
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getFirstEnv(keys ...string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			return value
		}
	}
	return ""
}

func getFirstEnvWithDefault(fallback string, keys ...string) string {
	if value := getFirstEnv(keys...); value != "" {
		return value
	}
	return fallback
}

func parseBool(value string) bool {
	parsed, err := strconv.ParseBool(value)
	return err == nil && parsed
}

func netJoinHostPort(host, port string) string {
	if strings.Contains(host, ":") {
		return host
	}
	return host + ":" + port
}

func sanitizeFilename(value string) string {
	value = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '-'
	}, value)
	return strings.Trim(value, "-")
}

func randomBoundary() string {
	var buf [24]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return fmt.Sprintf("boundary-%d", time.Now().UnixNano())
	}
	return "boundary-" + base64.RawURLEncoding.EncodeToString(buf[:])
}

func escapeHeader(value string) string {
	return strings.ReplaceAll(value, `"`, `'`)
}

func quotedPrintable(value string) string {
	var out strings.Builder
	for _, r := range value {
		switch {
		case r == '\n':
			out.WriteString("\r\n")
		case r == '\r':
			continue
		case r >= 33 && r <= 126 && r != '=':
			out.WriteRune(r)
		case r == ' ' || r == '\t':
			out.WriteRune(r)
		default:
			for _, b := range []byte(string(r)) {
				fmt.Fprintf(&out, "=%02X", b)
			}
		}
	}
	return out.String()
}

type base64LineWriter struct {
	writer io.Writer
	count  int
}

func newBase64LineWriter(writer io.Writer) io.Writer {
	return &base64LineWriter{writer: writer}
}

func (w *base64LineWriter) Write(p []byte) (int, error) {
	written := 0
	for _, b := range p {
		if w.count == 76 {
			if _, err := w.writer.Write([]byte("\r\n")); err != nil {
				return written, err
			}
			w.count = 0
		}
		if _, err := w.writer.Write([]byte{b}); err != nil {
			return written, err
		}
		w.count++
		written++
	}
	return written, nil
}
