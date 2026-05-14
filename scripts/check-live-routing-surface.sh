#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://www.edgemarketplacehub.com}"
ROUTES=(
  "/api/plain.txt"
  "/api/probe"
  "/"
)

for route in "${ROUTES[@]}"; do
  url="${BASE_URL}${route}"
  headers_file=$(mktemp)
  body_file=$(mktemp)

  echo "=== ${url} ==="
  curl -sS -D "$headers_file" "$url" -o "$body_file"

  awk 'toupper($1) ~ /^HTTP\// {status=$2} END{print "status=" status}' "$headers_file"
  awk 'BEGIN{IGNORECASE=1}
    /^content-type:/ || /^server:/ || /^x-powered-by:/ || /^x-vercel-cache:/ || /^cache-control:/ || /^content-length:/ || /^x-api-probe:/ {
      sub(/\r$/, "", $0); print $0
    }' "$headers_file"

  echo "body_prefix=$(head -c 120 "$body_file" | tr '\n' ' ' | tr '\r' ' ')"
  echo

  rm -f "$headers_file" "$body_file"
done
