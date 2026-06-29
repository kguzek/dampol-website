FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY . ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/offer-mailer .

FROM alpine:3.21 AS typst
ARG TYPST_VERSION=0.12.0
ARG TARGETARCH
RUN apk add --no-cache ca-certificates curl tar \
  && case "$TARGETARCH" in \
    amd64) typst_arch="x86_64-unknown-linux-musl" ;; \
    arm64) typst_arch="aarch64-unknown-linux-musl" ;; \
    *) echo "unsupported architecture: $TARGETARCH" >&2; exit 1 ;; \
  esac \
  && curl -fsSL "https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-${typst_arch}.tar.xz" -o /tmp/typst.tar.xz \
  && tar -xJf /tmp/typst.tar.xz -C /tmp \
  && mv "/tmp/typst-${typst_arch}/typst" /usr/local/bin/typst

FROM alpine:3.21
RUN apk add --no-cache ca-certificates font-liberation \
  && addgroup -S app \
  && adduser -S -G app app
WORKDIR /app
COPY --from=build /out/offer-mailer /usr/local/bin/offer-mailer
COPY --from=typst /usr/local/bin/typst /usr/local/bin/typst
COPY templates ./templates
USER app
ENV ADDR=:8080 \
  APP_ENV=production \
  DEV_MODE=false \
  TYPST_PATH=/usr/local/bin/typst \
  TYPST_TEMPLATE_PATH=/app/templates/offer.typ
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/offer-mailer"]
