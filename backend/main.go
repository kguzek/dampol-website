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
	SMTPName               string
	SMTPSecure             bool
	SMTPIgnoreTLS          bool
	SMTPInsecureSkipVerify bool
}

type server struct {
	config config
}

type webhookRequest struct {
	To      string         `json:"to"`
	ReplyTo string         `json:"replyTo"`
	CC      []string       `json:"cc"`
	BCC     []string       `json:"bcc"`
	Payload webhookPayload `json:"payload"`
}

type webhookPayload struct {
	Event      string          `json:"event"`
	Key        nullableString  `json:"key"`
	Keys       stringList      `json:"keys"`
	Collection string          `json:"collection"`
	Offer      json.RawMessage `json:"offer"`
}

type directusOffer struct {
	Event      string       `json:"event,omitempty"`
	Payload    offerPayload `json:"payload"`
	Key        string       `json:"key,omitempty"`
	Collection string       `json:"collection,omitempty"`
}

type offerPayload struct {
	ID            string          `json:"id"`
	Size          string          `json:"size"`
	Date          string          `json:"date"`
	SendToAddress string          `json:"send_to_address"`
	Language      string          `json:"language"`
	Doors         []string        `json:"doors"`
	Windows       []windowItem    `json:"windows"`
	Electricity   string          `json:"electricity"`
	Structure     string          `json:"structure"`
	Walls         string          `json:"walls"`
	Roof          string          `json:"roof"`
	Floor         string          `json:"floor"`
	Gutter        bool            `json:"gutter"`
	HydraulicOut  bool            `json:"hydraulic_output"`
	CraneReach    int             `json:"crane_reach"`
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

type windowItem struct {
	Material string `json:"material"`
	Size     string `json:"size"`
}

type nullableString string

func (s *nullableString) UnmarshalJSON(data []byte) error {
	trimmed := strings.TrimSpace(string(data))
	if trimmed == "" || trimmed == "null" {
		*s = ""
		return nil
	}

	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	if value == "undefined" || value == "null" {
		value = ""
	}
	*s = nullableString(value)
	return nil
}

type stringList []string

func (s *stringList) UnmarshalJSON(data []byte) error {
	trimmed := strings.TrimSpace(string(data))
	if trimmed == "" || trimmed == "null" {
		*s = nil
		return nil
	}

	var values []string
	if err := json.Unmarshal(data, &values); err == nil {
		*s = filterStrings(values)
		return nil
	}

	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	if value == "" || value == "undefined" || value == "null" {
		*s = nil
		return nil
	}
	*s = []string{value}
	return nil
}

type templateData struct {
	GeneratedAt  string            `json:"generated_at"`
	HeaderDate   string            `json:"header_date"`
	Language     string            `json:"language"`
	OfferID      string            `json:"offer_id"`
	Labels       map[string]string `json:"labels"`
	Intro        string            `json:"intro"`
	Features     []string          `json:"features"`
	TaxNotice    []string          `json:"tax_notice"`
	ExtrasTitle  string            `json:"extras_title"`
	Extras       []string          `json:"extras"`
	Sections     []contentSection  `json:"sections"`
	PriceSuffix  string            `json:"price_suffix"`
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

type contentSection struct {
	Title      string   `json:"title"`
	Paragraphs []string `json:"paragraphs"`
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
		SMTPName:               getFirstEnv("SMTP_NAME", "EMAIL_SMTP_NAME"),
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

	offer, err := req.directusOffer()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if offer.Key == "" {
		offer.Key = offer.Payload.ID
	}
	recipient := strings.TrimSpace(offer.Payload.SendToAddress)
	if recipient == "" {
		recipient = strings.TrimSpace(req.To)
	}
	if _, err := mail.ParseAddress(recipient); err != nil {
		http.Error(w, "invalid offer.send_to_address", http.StatusBadRequest)
		return
	}
	if err := validateReplyTo(req.ReplyTo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	cc, err := parseAddressList("cc", req.CC)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	bcc, err := parseAddressList("bcc", req.BCC)
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

	if err := s.sendMail(recipient, req.ReplyTo, cc, bcc, offerSubject(offer), offerBody(offer.Payload.Language), filename, pdf); err != nil {
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
	if len(r.Payload.Offer) == 0 || string(r.Payload.Offer) == "null" {
		return directusOffer{}, errors.New("missing offer payload")
	}

	var payload offerPayload
	if err := unmarshalObjectOrSingleItem(r.Payload.Offer, &payload); err != nil {
		return directusOffer{}, fmt.Errorf("invalid payload.offer: %w", err)
	}

	key := string(r.Payload.Key)
	if key == "" && len(r.Payload.Keys) > 0 {
		key = r.Payload.Keys[0]
	}

	return directusOffer{
		Event:      r.Payload.Event,
		Payload:    payload,
		Key:        key,
		Collection: r.Payload.Collection,
	}, nil
}

func unmarshalObjectOrSingleItem(data []byte, target any) error {
	trimmed := bytes.TrimSpace(data)
	if len(trimmed) == 0 || bytes.Equal(trimmed, []byte("null")) {
		return errors.New("missing object")
	}
	if trimmed[0] != '[' {
		return json.Unmarshal(trimmed, target)
	}

	var items []json.RawMessage
	if err := json.Unmarshal(trimmed, &items); err != nil {
		return err
	}
	if len(items) == 0 {
		return errors.New("empty array")
	}
	return json.Unmarshal(items[0], target)
}

func validateReplyTo(replyTo string) error {
	if strings.TrimSpace(replyTo) == "" {
		return nil
	}
	if _, err := mail.ParseAddress(replyTo); err != nil {
		return fmt.Errorf("invalid replyTo address: %w", err)
	}
	return nil
}

func parseAddressList(field string, values []string) ([]mail.Address, error) {
	addresses := make([]mail.Address, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		address, err := mail.ParseAddress(value)
		if err != nil {
			return nil, fmt.Errorf("invalid %s address %q: %w", field, value, err)
		}
		addresses = append(addresses, *address)
	}
	return addresses, nil
}

func offerSubject(offer directusOffer) string {
	suffix := offerSubjectSuffix(offer.Key)
	if offer.Payload.Language == "en" {
		return "Dampol Offer #" + suffix
	}
	return "Oferta Dampol #" + suffix
}

func offerSubjectSuffix(key string) string {
	clean := sanitizeFilename(key)
	clean = strings.ReplaceAll(clean, "-", "")
	if clean == "" {
		return "offer"
	}
	if len(clean) <= 8 {
		return clean
	}
	return clean[len(clean)-8:]
}

func offerBody(lang string) string {
	if lang == "en" {
		return "Good morning,\n\nPlease find the offer attached.\n\nBest regards,\n\nDampol Investment Sp. z o. o."
	}
	return "Dzień dobry,\n\nW załączniku przesyłamy ofertę.\n\nPozdrawiamy,\n\nDampol Investment Sp. z o. o."
}

func normalizeOffer(offer directusOffer) templateData {
	lang := offer.Payload.Language
	if lang != "en" && lang != "pl" {
		lang = "pl"
	}
	t := translations[lang]
	now := time.Now()

	data := templateData{
		GeneratedAt:  now.Format("2006-01-02"),
		HeaderDate:   formatHeaderDate(lang, now),
		Language:     lang,
		OfferID:      offer.Key,
		Labels:       labels[lang],
		Intro:        labels[lang]["intro"],
		Features:     []string{},
		TaxNotice:    localizedTaxNotice(lang),
		ExtrasTitle:  labels[lang]["extras_title"],
		Extras:       optionalExtras(lang, offer.Payload),
		Sections:     localizedSections(lang, offer.Payload),
		PriceSuffix:  labels[lang]["price_suffix"],
		Doors:        translateList(t.doors, offer.Payload.Doors),
		Windows:      []windowView{},
		Options:      []optionView{},
		Notes:        []noteView{},
		DeliveryDate: offer.Payload.DeliveryDate,
		Price:        offer.Payload.Price,
		Raw:          offer.Payload,
	}

	data.Features = buildFeatures(lang, offer.Payload, t)

	return data
}

func addBoolOption(data *templateData, enabled bool, key string) {
	if !enabled {
		return
	}
	data.Options = append(data.Options, optionView{Label: data.Labels[key], Value: data.Labels["yes"]})
}

func formatHeaderDate(lang string, value time.Time) string {
	if lang == "en" {
		return value.Format("01/02/2006")
	}
	return "dn. " + value.Format("01.02.2006") + " r."
}

func buildFeatures(lang string, payload offerPayload, t dictionary) []string {
	features := make([]string, 0, 32)
	external, internal := formattedDimensions(payload.Size)
	if external != "" {
		features = append(features, featureText(lang, "external_dimensions", external))
	}
	if internal != "" {
		features = append(features, featureText(lang, "internal_dimensions", internal))
	}
	features = append(features, baseFeatures(lang, payload)...)

	if len(payload.Doors) > 0 {
		features = append(features, featureText(lang, "doors", strings.Join(translateList(t.doors, payload.Doors), ", ")))
	}
	for _, window := range payload.Windows {
		features = append(features, featureText(lang, "window", translate(t.windowMaterials, window.Material), formatSize(window.Size)))
	}
	if payload.Electricity != "" {
		features = append(features, featureText(lang, "electricity", translate(t.electricity, payload.Electricity)))
	}
	if payload.ExternalLED > 0 {
		features = append(features, featureText(lang, "external_led_count", strconv.Itoa(payload.ExternalLED)))
	}
	if payload.Aircon {
		features = append(features, featureText(lang, "aircon"))
	}
	if payload.Kitchen != "" && payload.Kitchen != "none" {
		features = append(features, featureText(lang, "kitchen", translate(t.kitchens, payload.Kitchen)))
	}
	if payload.Toilet {
		features = append(features, featureText(lang, "toilet"))
	}
	if payload.Bathroom {
		features = append(features, featureText(lang, "bathroom"))
	}
	if payload.PartitionWall {
		features = append(features, featureText(lang, "partition_wall"))
	}
	if payload.DoorPump {
		features = append(features, featureText(lang, "door_pump"))
	}
	if payload.SteelHandle {
		features = append(features, featureText(lang, "steel_handle"))
	}
	if payload.TintedGlass {
		features = append(features, featureText(lang, "tinted_glass"))
	}
	if payload.Shutters {
		features = append(features, featureText(lang, "shutters"))
	}
	if payload.Gutter {
		features = append(features, featureText(lang, "gutter"))
	}
	if payload.HydraulicOut {
		features = append(features, featureText(lang, "hydraulic_output"))
	}
	if payload.ExternalDecor != "" {
		features = append(features, featureText(lang, "external_decor", translate(t.externalDecor, payload.ExternalDecor)))
	}
	if strings.TrimSpace(payload.WindowNotes) != "" {
		features = append(features, featureText(lang, "window_notes", payload.WindowNotes))
	}
	if strings.TrimSpace(payload.Other) != "" {
		features = append(features, featureText(lang, "other", payload.Other))
	}
	features = append(features, featureText(lang, "transport"))
	features = append(features, featureText(lang, "unloading"))
	features = append(features, featureText(lang, "warranty"))
	return features
}

func baseFeatures(lang string, payload offerPayload) []string {
	walls := translatePanelValue(payload.Walls)
	roof := translatePanelValue(payload.Roof)
	floor := translatePanelValue(payload.Floor)
	if lang == "en" {
		return []string{
			"internal height 260 cm lowered to 250 cm",
			"dimension tolerance 1.5%",
			"WALLS made of sandwich panels with a " + walls + " core. The thermal transmittance is " + panelUValue(payload.Walls) + " W/m²K.",
			"Exterior colour: graphite RAL 7016",
			"ROOF made of sandwich panels with a " + roof + " core.",
			"FLOOR made of sandwich panels with a " + floor + " core + OSB board 12 mm + PVC vinyl flooring.",
			structureFeature(lang, payload.Structure),
		}
	}
	return []string{
		"Wysokość wewnętrzna 262 cm -> 252 cm (dach jednospadowy)",
		"Tolerancja wymiarów 1.5%",
		structureFeature(lang, payload.Structure),
		"Podłoga wykonana z płyty warstwowej z rdzeniem " + floor + " + płyta OSB 12 mm + wykładzina PCV obiektowa. Przenikalność cieplna dla płyty wynosi " + panelUValue(payload.Floor) + " W/m²K",
		"Ściany wykonane z płyty warstwowej z rdzeniem " + walls + ". Przenikalność cieplna dla płyty wynosi " + panelUValue(payload.Walls) + " W/m²K. Kolor zewnętrzny: grafit RAL 7016",
		"Dach wykonany z płyty warstwowej z rdzeniem " + roof + ".",
	}
}

func structureFeature(lang, structure string) string {
	profile := formatStructureProfile(structure)
	if profile == "" {
		profile = "50 cm x 50 cm"
	}
	if lang == "en" {
		return "Steel structure - made of steel angle bar " + profile + " with truss, welded, including crane hooks on top of structure for transport and unloading."
	}
	return "Konstrukcja stalowa spawana, wykonana z kątownika " + profile + " z kratownicą wraz z zaczepami HDS do przewozu oraz rozładunku."
}

func formatStructureProfile(structure string) string {
	base, _, ok := strings.Cut(strings.TrimSpace(structure), "-")
	if !ok || base == "" {
		return ""
	}
	if _, err := strconv.Atoi(base); err != nil {
		return ""
	}
	return base + " cm x " + base + " cm"
}

func panelUValue(panelValue string) string {
	parts := strings.Split(strings.TrimSpace(panelValue), "-")
	if len(parts) >= 1 && strings.EqualFold(parts[0], "eps") {
		return "0.38"
	}
	return "0.22"
}

func translatePanelValue(value string) string {
	if value == "" {
		return "PIR 100"
	}
	parts := strings.Split(strings.TrimSpace(value), "-")
	if len(parts) != 2 {
		return value
	}
	return strings.ToUpper(parts[0]) + " " + parts[1]
}

func featureText(lang, key string, values ...string) string {
	format := featureFormats[lang][key]
	if format == "" {
		format = key
	}
	args := make([]any, len(values))
	for i, value := range values {
		args[i] = value
	}
	return fmt.Sprintf(format, args...)
}

func formattedDimensions(size string) (string, string) {
	length, width, ok := parseSize(size)
	if !ok {
		return "", ""
	}
	return fmt.Sprintf("%d cm x %d cm", length, width), fmt.Sprintf("%d cm x %d cm", length-20, width-25)
}

func formatSize(size string) string {
	length, width, ok := parseSize(size)
	if !ok {
		return size
	}
	return fmt.Sprintf("%d cm x %d cm", length, width)
}

func parseSize(size string) (int, int, bool) {
	parts := strings.Split(strings.ToLower(strings.TrimSpace(size)), "x")
	if len(parts) != 2 {
		return 0, 0, false
	}
	length, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil {
		return 0, 0, false
	}
	width, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil {
		return 0, 0, false
	}
	return length, width, true
}

func optionalExtras(lang string, payload offerPayload) []string {
	extras := append([]string{}, defaultExtras[lang]...)
	for _, option := range boolExtras[lang] {
		if !option.enabled(payload) {
			extras = append(extras, option.text)
		}
	}
	return extras
}

func localizedTaxNotice(lang string) []string {
	if lang == "en" {
		return []string{
			"*Net price is for companies with a valid and active EU tax number (BE002...)",
			"For private customers, 21% tax applies.",
		}
	}
	return []string{"Wszystkie ceny netto - należy doliczyć 23% podatku VAT"}
}

func localizedSections(lang string, payload offerPayload) []contentSection {
	if lang == "en" {
		return []contentSection{
			{Title: "PAYMENT", Paragraphs: []string{"15% deposit by bank transfer to our account (downpayment)", "The remaining amount due on the day of delivery at the latest, before the container is unloaded - by bank transfer to our account. Cash upon delivery is also possible."}},
			{Title: "DELIVERY DATE", Paragraphs: []string{"The exact delivery date is to be arranged. Approximately " + deliveryDateValue(payload, "10-12 weeks") + " from the receipt of deposit."}},
			{Title: "DELIVERY AND UNLOADING", Paragraphs: []string{"The buyer is responsible for ensuring that there is enough space to drive in with a truck and set up the crane supports. Minimum width required: 3.50 m.", "Unloading with our auto-crane is only possible if there is a paved access road for a 28 tonne vehicle. Exceptions only after written agreement. Additionally, the direct access road must be free of trees, branches and wires in order not to damage the container. The height of the cabin with the container is 4 m. The container can be unloaded from the vehicle only from the right and left side. It is impossible to unload the container in front / or behind the vehicle. Hydraulic arm reach: " + craneReach(payload, "3.0") + " m.", "In the work area of the auto crane no wires/ trees/ branches can be present"}},
			{Title: "FOUNDATION PREPARATION", Paragraphs: []string{"Customer is responsible for preparation of the foundation, where container is to be placed. The substrate must be prepared according to the specifications attached to the offer.", "Particular attention should be paid to the fact that the subsurface must be hardened, stable and, above all, even. The container can be placed on paving/concrete slabs, block paving, asphalt or concrete blocks."}},
			{Title: "ATTENTION !", Paragraphs: []string{"The offer and price do not include any types of permits or approvals, as well as structural or engineering designs. The container is not intended for multi-storey buildings or the use of photovoltaic systems.", "Please read the 'Terms and Conditions of sale' and in particular the information contained therein about the guarantee and the use of the container. Payment of deposit is equivalent to understanding and full acceptance of the offer and its Terms and Conditions."}},
		}
	}
	return []contentSection{
		{Title: "DATA DOSTAWY", Paragraphs: []string{"Termin dostawy do uzgodnienia. Około " + deliveryDateValue(payload, "8-10 tygodni") + " od daty wpływu zaliczki."}},
		{Title: "PŁATNOŚĆ", Paragraphs: []string{"30% zaliczka przelewem. Pozostała kwota jest płatna najpóźniej w dniu dostawy pawilonu."}},
		{Title: "DOSTAWA", Paragraphs: []string{"Kupujący jest odpowiedzialny za zapewnienie wystarczającej ilości miejsca do wjazdu 28-tonową ciężarówką i ustawienia podpór dźwigu. Droga dojazdowa: Minimalna wymagana szerokość dojazdu: 3.50 m.", "Dodatkowo droga dojazdowa musi być wolna od drzew, gałęzi i drutów, aby nie uszkodzić pawilonu. Wysokość kabiny z kontenerem to 4.0 m. Rozładunek: tylko na prawą lub lewą stronę samochodu. Maksymalny wysięg HDS to " + craneReach(payload, "1.00") + " m."}},
		{Title: "PRZYGOTOWANIE PODŁOŻA", Paragraphs: []string{"Klient jest odpowiedzialny za przygotowanie podłoża, na którym ma stanąć kontener. Podłoże należy przygotować zgodnie ze specyfikacją załączoną do oferty.", "Szczególną uwagę należy zwrócić na to, aby podłoże było utwardzone, stabilne, a przede wszystkim wypoziomowane. Pawilon można ustawić na kostce brukowej, płytach betonowych, asfalcie lub bloczkach betonowych."}},
		{Title: "UWAGA !", Paragraphs: []string{"Oferta i cena nie zawierają żadnego rodzaju pozwoleń i zezwoleń, a także projektów konstrukcyjnych i technicznych.", "Kontener nie jest przeznaczony do piętrowania ani do stosowania systemów fotowoltaicznych.", "Maksymalne obciążenie instalacji elektrycznej to 25A. Jeśli zapotrzebowanie na moc jest wyższe, należy rozważyć instalację trójfazową.", "Ze względu na brak możliwości sprawdzenia instalacji hydraulicznej oraz sprzętów w toalecie / kuchni - nie udzielamy na nie gwarancji. Szczelność instalacji jest sprawdzana jedynie sprężonym powietrzem. Sanitariaty montowane w pawilonach nie są przeznaczone do masowego użytku.", "Prosimy o zapoznanie się z warunkami sprzedaży, a w szczególności z zawartymi w nich informacjami dotyczącymi gwarancji i użytkowania pawilonu. Wpłata zaliczki jest równoznaczna ze zrozumieniem i pełną akceptacją oferty oraz jej warunków.", "Wszelkie zmiany w ofercie wymagają formy pisemnej, potwierdzonej przez obie strony. Po wpłacie zaliczki, zmiany w projekcie nie będą już możliwe."}},
	}
}

func craneReach(payload offerPayload, fallback string) string {
	if payload.CraneReach <= 0 {
		return fallback
	}
	return fmt.Sprintf("%d.0", payload.CraneReach)
}

func deliveryDateValue(payload offerPayload, fallback string) string {
	if payload.DeliveryDate == "" {
		return fallback
	}
	return payload.DeliveryDate
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

func (s server) sendMail(to, replyTo string, cc, bcc []mail.Address, subject, text, filename string, pdf []byte) error {
	if s.config.SMTPHost == "" || s.config.SMTPFrom == "" {
		return errors.New("SMTP_HOST and SMTP_FROM are required")
	}

	from, err := mail.ParseAddress(s.config.SMTPFrom)
	if err != nil {
		return fmt.Errorf("invalid SMTP_FROM: %w", err)
	}
	if strings.TrimSpace(s.config.SMTPName) != "" {
		from.Name = strings.TrimSpace(s.config.SMTPName)
	}
	toAddr, err := mail.ParseAddress(to)
	if err != nil {
		return fmt.Errorf("invalid recipient: %w", err)
	}

	message, err := buildEmail(from.String(), toAddr.String(), strings.TrimSpace(replyTo), cc, subject, text, filename, pdf)
	if err != nil {
		return err
	}

	addr := netJoinHostPort(s.config.SMTPHost, s.config.SMTPPort)
	recipients := []string{toAddr.Address}
	for _, address := range cc {
		recipients = append(recipients, address.Address)
	}
	for _, address := range bcc {
		recipients = append(recipients, address.Address)
	}
	return sendSMTP(addr, s.config, recipients, message)
}

func buildEmail(from, to, replyTo string, cc []mail.Address, subject, text, filename string, pdf []byte) ([]byte, error) {
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
	if replyTo != "" {
		headers["Reply-To"] = replyTo
	}
	if len(cc) > 0 {
		headers["Cc"] = formatAddressList(cc)
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

func formatAddressList(addresses []mail.Address) string {
	values := make([]string, 0, len(addresses))
	for _, address := range addresses {
		values = append(values, address.String())
	}
	return strings.Join(values, ", ")
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
			Windows:       []windowItem{{Material: "pcv", Size: "100x60"}, {Material: "aluminium", Size: "97x210"}},
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
	electricity     map[string]string
	kitchens        map[string]string
	externalDecor   map[string]string
}

type optionalExtra struct {
	text    string
	enabled func(offerPayload) bool
}

var translations = map[string]dictionary{
	"pl": {
		doors: map[string]string{
			"glass":  "szklane",
			"full":   "pełna",
			"double": "dwuskrzydłowe",
		},
		windowMaterials: map[string]string{
			"pcv":       "PCV",
			"aluminium": "aluminiowe",
		},
		electricity: map[string]string{
			"one":   "Jednofazowa",
			"three": "Trójfazowa",
		},
		kitchens: map[string]string{
			"none":    "Brak",
			"simple":  "Podstawowy",
			"premium": "Premium",
		},
		externalDecor: map[string]string{
			"all":             "wszystkie strony",
			"front_and_sides": "front i boki",
			"front_and_side":  "front i jeden bok",
			"front_only":      "tylko front",
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
		electricity: map[string]string{
			"one":   "Single-phase",
			"three": "Three-phase",
		},
		kitchens: map[string]string{
			"none":    "None",
			"simple":  "Basic",
			"premium": "Premium",
		},
		externalDecor: map[string]string{
			"all":             "all sides",
			"front_and_sides": "front and sides",
			"front_and_side":  "front and one side",
			"front_only":      "front only",
			"none":            "none",
		},
	},
}

var labels = map[string]map[string]string{
	"pl": {
		"title":          "Oferta na pawilon",
		"intro":          "Oferta dotyczy pawilonu o parametrach:",
		"contact":        "Kontakt",
		"valid_for":      "Ważność oferty",
		"valid_days":     "7 dni",
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
		"price":          "CENA łączna",
		"price_suffix":   "netto",
		"extras_title":   "OPCJE DODATKOWEGO DOPOSAŻENIA : (dodatkowo płatne)",
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
		"intro":          "This offer includes the following pavilion:",
		"contact":        "Contact",
		"valid_for":      "Offer Valid for",
		"valid_days":     "7 days",
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
		"price":          "TOTAL",
		"price_suffix":   "net",
		"extras_title":   "OPTIONAL EXTRAS:",
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

var featureFormats = map[string]map[string]string{
	"pl": {
		"external_dimensions": "Wymiar zewnętrzny %s",
		"internal_dimensions": "Wymiar wewnętrzny %s",
		"doors":               "Drzwi: %s",
		"window":              "Stolarka %s %s",
		"electricity":         "Instalacja elektryczna: %s, kompletna instalacja z lampami LED, gniazdami, włącznikiem, rozdzielnią elektryczną i przyłączem zewnętrznym",
		"external_led_count":  "Zewnętrzne punkty LED: %s",
		"aircon":              "Klimatyzacja Sinclair 3.4 kW z funkcją grzania i chłodzenia",
		"kitchen":             "Aneks kuchenny: %s",
		"toilet":              "Toaleta",
		"bathroom":            "Kompletna łazienka",
		"partition_wall":      "Ścianka działowa / osobne pomieszczenie zgodnie z planem",
		"door_pump":           "Samozamykacz drzwiowy",
		"steel_handle":        "Pochwyt stalowy",
		"tinted_glass":        "Szyby przyciemniane",
		"shutters":            "Rolety zewnętrzne",
		"gutter":              "Orynnowanie",
		"hydraulic_output":    "Wyprowadzenie hydrauliczne",
		"external_decor":      "Elementy dekoracyjne: %s",
		"window_notes":        "Uwagi do stolarki: %s",
		"other":               "Pozostałe uwagi: %s",
		"transport":           "Transport wliczony w cenę końcową",
		"unloading":           "Rozładunek HDS",
		"warranty":            "Gwarancja 12 miesięcy",
	},
	"en": {
		"external_dimensions": "external dimensions %s",
		"internal_dimensions": "internal dimensions %s",
		"doors":               "Aluminium door: %s",
		"window":              "%s window with tilt and turn function %s",
		"electricity":         "Electrical wiring: %s, complete installation with sockets, LED lamps, light switch, fuse box and external power connection",
		"external_led_count":  "external LED points: %s",
		"aircon":              "Air conditioner Sinclair 3.4 kW with heat and cool options",
		"kitchen":             "Kitchen annexe: %s",
		"toilet":              "Toilet",
		"bathroom":            "Complete bathroom: internal walls, WC compact, sink, tap, undersink storage, electric water heater, shower cabin, complete plumbing (no warranty for watertightness)",
		"partition_wall":      "Separate room: internal wall with internal doors - as per plan",
		"door_pump":           "Door closer",
		"steel_handle":        "Steel handle",
		"tinted_glass":        "Tinted glass",
		"shutters":            "External roller shutters",
		"gutter":              "Guttering",
		"hydraulic_output":    "Hydraulic output",
		"external_decor":      "External decoration: %s, galvanized metal decor",
		"window_notes":        "Window notes: %s",
		"other":               "Other notes: %s",
		"transport":           "TRANSPORT included in the final price",
		"unloading":           "Unloading with our auto-crane",
		"warranty":            "12 MONTH WARRANTY",
	},
}

var boolExtras = map[string][]optionalExtra{
	"pl": {
		{text: "Klimatyzacja Sinclair 3.4 kW z funkcją grzania, chłodzenia i jonizacji powietrza 3999 zł", enabled: func(p offerPayload) bool { return p.Aircon }},
		{text: "Rolety elektryczne od 1400 zł/ szt (do 1m szerokości)", enabled: func(p offerPayload) bool { return p.Shutters }},
		{text: "Toaleta", enabled: func(p offerPayload) bool { return p.Toilet }},
		{text: "Łazienka", enabled: func(p offerPayload) bool { return p.Bathroom }},
		{text: "Ścianka działowa", enabled: func(p offerPayload) bool { return p.PartitionWall }},
		{text: "Samozamykacz drzwiowy", enabled: func(p offerPayload) bool { return p.DoorPump }},
		{text: "Pochwyt stalowy", enabled: func(p offerPayload) bool { return p.SteelHandle }},
		{text: "Szyby przyciemniane", enabled: func(p offerPayload) bool { return p.TintedGlass }},
		{text: "Orynnowanie", enabled: func(p offerPayload) bool { return p.Gutter }},
		{text: "Wyprowadzenie hydrauliczne", enabled: func(p offerPayload) bool { return p.HydraulicOut }},
	},
	"en": {
		{text: "Air conditioner Sinclair 3.4 kW with heat and cool options", enabled: func(p offerPayload) bool { return p.Aircon }},
		{text: "External roller shutters €400 each", enabled: func(p offerPayload) bool { return p.Shutters }},
		{text: "Toilet", enabled: func(p offerPayload) bool { return p.Toilet }},
		{text: "Complete bathroom", enabled: func(p offerPayload) bool { return p.Bathroom }},
		{text: "Separate room: internal wall with internal doors", enabled: func(p offerPayload) bool { return p.PartitionWall }},
		{text: "Door closer", enabled: func(p offerPayload) bool { return p.DoorPump }},
		{text: "Steel handle", enabled: func(p offerPayload) bool { return p.SteelHandle }},
		{text: "Tinted glass", enabled: func(p offerPayload) bool { return p.TintedGlass }},
		{text: "Guttering", enabled: func(p offerPayload) bool { return p.Gutter }},
		{text: "Hydraulic output", enabled: func(p offerPayload) bool { return p.HydraulicOut }},
	},
}

var defaultExtras = map[string][]string{
	"pl": {
		"Dodatkowe Okno Rozwierno-uchylne 100x100 cm 1000 zł",
		"Dodatkowe Okno Rozwierno-uchylne 100x210 cm 1800 zł",
		"Dodatkowe gniazdo 230V: 250 zł",
		"Aneks kuchenny standard 120 cm ze zlewem i baterią 2400 zł",
		"Aneks kuchenny premium 153 cm wraz z lodówką i płytą indukcyjną 7200 zł",
	},
	"en": {
		"Additional window 100x210 cm with tilt and turn function €500",
		"Kitchen annexe: top cabinets, bottom cabinets, worktop 120 cm, sink, tap €800",
		"Static structure - steel construction made of closed steel profile 100x100 mm, welded and sealed with anti-corrosion paint, including four crane hooks for transport/unloading €1800",
		"External décor from €200 per linear meter",
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

func filterStrings(values []string) []string {
	filtered := make([]string, 0, len(values))
	for _, value := range values {
		if value == "" || value == "undefined" || value == "null" {
			continue
		}
		filtered = append(filtered, value)
	}
	return filtered
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
