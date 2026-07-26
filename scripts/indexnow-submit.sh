#!/usr/bin/env bash
set -euo pipefail

HOST="travel-tracker.org"
KEY="e66d7d36701179f1bd7e88c94feae951"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
ENDPOINT="https://api.indexnow.org/indexnow"

URLS=(
  "https://${HOST}/world"
  "https://${HOST}/usa"
  "https://${HOST}/usa-parks"
  "https://${HOST}/europe"
  "https://${HOST}/china"
  "https://${HOST}/india"
  "https://${HOST}/download"
  "https://${HOST}/about"
)

url_list=$(printf '"%s",' "${URLS[@]}")
url_list="[${url_list%,}]"

payload=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": ${url_list}
}
EOF
)

echo "Submitting ${#URLS[@]} URLs to IndexNow..."
response=$(curl -s -w "\n%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${payload}")

http_code=$(echo "${response}" | tail -1)
body=$(echo "${response}" | sed '$d')

if [ "${http_code}" -ge 200 ] && [ "${http_code}" -lt 300 ]; then
  echo "Success (HTTP ${http_code}): URLs submitted for indexing."
else
  echo "Failed (HTTP ${http_code}): ${body}" >&2
  exit 1
fi
