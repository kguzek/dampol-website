# Offer Mailer Backend

Small internal Go service for Directus Flows. It accepts offer data, renders `templates/offer.typ` with Typst, generates a PDF, and sends it by SMTP.

## Endpoints

- `GET /healthz`
- `POST /webhooks/offer`
- `GET /dev/offer.pdf`, `POST /dev/offer.pdf`, `POST /dev/render` when `DEV_MODE=true` and `APP_ENV!=production`

## Webhook Body

```json
{
  "to": "customer@example.com",
  "subject": "Oferta Dampol",
  "text": "W załączniku przesyłamy ofertę.",
  "offer": {
    "event": "offer.items.create",
    "payload": {},
    "key": "offer-id",
    "collection": "offer"
  }
}
```

Directus can also post `event`, `payload`, `key`, and `collection` at the top level if `to`, `subject`, and `text` are included alongside them.

If `WEBHOOK_TOKEN` is set, include either `Authorization: Bearer <token>` or `X-Webhook-Token: <token>`.

## Local Development

Install Typst and run:

```sh
DEV_MODE=true SMTP_HOST=localhost SMTP_FROM=offers@example.com go run .
```

Preview the built-in sample as PDF:

```sh
curl -o offer.pdf http://localhost:8080/dev/offer.pdf
```

Preview a custom payload without sending email:

```sh
curl -X POST -H 'Content-Type: application/json' --data-binary @samples/offer-webhook.json http://localhost:8080/dev/offer.pdf -o offer.pdf
```
