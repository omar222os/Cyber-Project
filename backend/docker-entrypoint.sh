#!/bin/sh
set -e

host="${DB_HOST:-mysql}"
port="${DB_PORT:-3306}"
max_attempts="${DB_WAIT_ATTEMPTS:-60}"
attempt=0

echo "Waiting for MySQL at ${host}:${port}..."
while ! nc -z "$host" "$port" 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "ERROR: MySQL not reachable at ${host}:${port} after ${max_attempts} attempts."
    echo "Ensure the mysql service is on the same Docker network (sqli-net)."
    exit 1
  fi
  sleep 2
done
echo "MySQL is reachable."

exec "$@"
