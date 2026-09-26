#!/usr/bin/env bash
# review-scanners.sh — summarize suspicious nginx traffic for manual IP review.
#
# Usage (on EC2 via SSM session manager):
#   docker compose exec nginx cat /var/log/nginx/scanner/suspicious.log | ./scripts/review-scanners.sh
#
# Filter by date first:
#   docker compose exec nginx grep "2026-06-22" /var/log/nginx/scanner/suspicious.log | ./scripts/review-scanners.sh
#
# Or pass a local copy:
#   ./scripts/review-scanners.sh /path/to/suspicious.log
#
# Log format expected (set in nginx default.conf scanner_fmt):
#   <timestamp> | <ip> | <method> <path> <proto> | <status> | "<ua>" | "<referer>"

set -euo pipefail

INPUT="${1:-/dev/stdin}"

if [[ "$INPUT" != "/dev/stdin" && ! -f "$INPUT" ]]; then
    echo "File not found: $INPUT" >&2
    exit 1
fi

DATA=$(cat "$INPUT")

if [[ -z "$DATA" ]]; then
    echo "No data. Suspicious log is empty or not yet written."
    echo "Trigger some 444/503 responses (e.g. curl http://your-host/.env) to populate it."
    exit 0
fi

TOTAL=$(echo "$DATA" | wc -l | tr -d ' ')

echo "======================================================"
echo " SCANNER / BAD ACTOR REVIEW — $TOTAL suspicious lines"
echo "======================================================"
echo ""

echo "--- TOP 20 IPs BY SUSPICIOUS REQUEST COUNT ---"
echo "$DATA" | awk -F' \\| ' '{print $2}' | sort | uniq -c | sort -rn | head -20
echo ""

TOP_IPS=$(echo "$DATA" | awk -F' \\| ' '{print $2}' | sort | uniq -c | sort -rn | head -5 | awk '{print $2}')

for IP in $TOP_IPS; do
    COUNT=$(echo "$DATA" | grep -F "| $IP |" | wc -l | tr -d ' ')
    echo "======================================================"
    echo " $IP  ($COUNT requests)"
    echo "======================================================"

    echo "  User-Agents:"
    echo "$DATA" | grep -F "| $IP |" | awk -F'"' '{print "    "$2}' | sort -u | head -5

    echo "  Status codes:"
    echo "$DATA" | grep -F "| $IP |" | awk -F' \\| ' '{print $4}' | sort | uniq -c | awk '{printf "    %s × %s\n", $1, $2}'

    echo "  Paths attempted (up to 30):"
    echo "$DATA" | grep -F "| $IP |" | awk -F' \\| ' '{print $3}' \
        | sed 's/^GET //' | sed 's/ HTTP.*//' \
        | sort -u | head -30 | awk '{print "    "$0}'
    echo ""
done

echo "======================================================"
echo " HOW TO BLOCK AN IP"
echo "======================================================"
echo ""
echo "  1. Review the IP above at https://ipinfo.io/<IP> or https://www.abuseipdb.com/check/<IP>"
echo "  2. Edit docker/nginx/blocklist.conf — add a deny line:"
echo "       deny <IP>;  # [$(date +%Y-%m-%d)] reason"
echo "  3. Reload nginx (zero downtime):"
echo "       docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload"
echo "  4. Verify it stopped:"
echo "       docker compose exec nginx grep '<IP>' /var/log/nginx/scanner/suspicious.log | tail -5"
echo ""
