#!/usr/bin/env bash
# Smoke test: start a session, play three chapters, verify state advances.
# Usage: ./scripts/smoke.sh [API_BASE_URL]

set -euo pipefail

API="${1:-http://localhost:3001}"
PLAYER_ID="smoke_$(date +%s)"

echo "=== QuestForge Smoke Test ==="
echo "API: $API"
echo "Player: $PLAYER_ID"
echo ""

# Start a session
echo "--- Starting session (fantasy / outsider) ---"
START_RESPONSE=$(curl -s -X POST "$API/sessions" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$PLAYER_ID\",\"genre\":\"fantasy\",\"archetype\":\"outsider\"}")

SESSION_ID=$(echo "$START_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionId'])")
VERSION=$(echo "$START_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])")
CHAPTER=$(echo "$START_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['chapter'])")

echo "Session: $SESSION_ID"
echo "Chapter: $CHAPTER, Version: $VERSION"

if [ "$CHAPTER" != "1" ]; then
  echo "FAIL: Expected chapter 1, got $CHAPTER"
  exit 1
fi

# Play chapter 2
echo ""
echo "--- Playing chapter 2 (choosing A) ---"
CH2_RESPONSE=$(curl -s -X POST "$API/sessions/$SESSION_ID/choices" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$PLAYER_ID\",\"choiceId\":\"A\",\"expectedVersion\":$VERSION}")

VERSION=$(echo "$CH2_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])")
CHAPTER=$(echo "$CH2_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['chapter'])")
echo "Chapter: $CHAPTER, Version: $VERSION"

if [ "$CHAPTER" != "2" ]; then
  echo "FAIL: Expected chapter 2, got $CHAPTER"
  exit 1
fi

# Play chapter 3
echo ""
echo "--- Playing chapter 3 (choosing B) ---"
CH3_RESPONSE=$(curl -s -X POST "$API/sessions/$SESSION_ID/choices" \
  -H "Content-Type: application/json" \
  -d "{\"playerId\":\"$PLAYER_ID\",\"choiceId\":\"B\",\"expectedVersion\":$VERSION}")

VERSION=$(echo "$CH3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])")
CHAPTER=$(echo "$CH3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['chapter'])")
HEALTH=$(echo "$CH3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['player']['health'])")
GOLD=$(echo "$CH3_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['player']['gold'])")

echo "Chapter: $CHAPTER, Version: $VERSION"
echo "Health: $HEALTH, Gold: $GOLD"

if [ "$CHAPTER" != "3" ]; then
  echo "FAIL: Expected chapter 3, got $CHAPTER"
  exit 1
fi

# Re-fetch session
echo ""
echo "--- Re-fetching session ---"
GET_RESPONSE=$(curl -s "$API/sessions/$SESSION_ID")
GET_CHAPTER=$(echo "$GET_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['chapter'])")

if [ "$GET_CHAPTER" != "3" ]; then
  echo "FAIL: GET returned chapter $GET_CHAPTER, expected 3"
  exit 1
fi

echo ""
echo "=== ALL CHECKS PASSED ==="
echo "Session $SESSION_ID played 3 chapters successfully."
