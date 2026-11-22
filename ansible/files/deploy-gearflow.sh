#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR=/opt/gearflow
TAG="${IMAGE_TAG:?IMAGE_TAG must contain an immutable image tag}"
CURRENT_FILE="$APP_DIR/.current-image-tag"
PREVIOUS=""
if [[ -s "$CURRENT_FILE" ]]; then
  PREVIOUS="$(cat "$CURRENT_FILE")"
fi

cd "$APP_DIR"
export IMAGE_TAG="$TAG"
if docker compose --env-file .env pull \
  && docker compose --env-file .env up -d --wait --remove-orphans \
  && curl --fail --silent --show-error http://127.0.0.1/actuator/health >/dev/null; then
  printf '%s\n' "$TAG" > "$CURRENT_FILE"
  exit 0
fi

echo "Deployment failed for $TAG; attempting rollback." >&2
if [[ -n "$PREVIOUS" ]]; then
  export IMAGE_TAG="$PREVIOUS"
  docker compose --env-file .env pull || true
  docker compose --env-file .env up -d --wait --remove-orphans || true
fi
exit 1
