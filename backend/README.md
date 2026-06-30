# Offer Mailer Backend

Small internal Go service for Directus Flows. It accepts offer data, renders `templates/offer.typ` with Typst, generates a PDF, and sends it by SMTP.

## Endpoints

- `GET /healthz`
- `POST /webhooks/offer`
- `GET /dev/offer.pdf`, `POST /dev/offer.pdf`, `POST /dev/render` when `DEV_MODE=true` and `APP_ENV!=production`

## Webhook Body

```json
{
  "replyTo": "karolina@example.com",
  "cc": [],
  "bcc": [],
  "payload": {
    "event": "offer.items.create",
    "key": "offer-id",
    "keys": null,
    "collection": "offer",
    "offer": {
      "send_to_address": "customer@example.com"
    }
  }
}
```

`payload.offer.windows` should contain the deep-fetched window rows used in the PDF.
Email is sent to `payload.offer.send_to_address`. The top-level `to` field is only used as a fallback.
The subject and body are generated from `payload.offer.language` and the offer key. `replyTo`, `cc`, and `bcc` are optional.

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
