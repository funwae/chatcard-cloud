#!/bin/bash
# Smoke tests for ChatCard API
# Usage: ./scripts/smoke-tests.sh [API_URL]
# Example: ./scripts/smoke-tests.sh http://localhost:3001

set -e

API_URL="${1:-http://localhost:3001}"
TEST_EMAIL="smoketest-$(date +%s)@example.com"
PASSED=0
FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

# Test 1: Health check
log_test "1. Health check endpoint"
if curl -sf "$API_URL/healthz" > /dev/null; then
    log_pass "Health check returned 200"
else
    log_fail "Health check failed"
fi

# Test 2: Metrics endpoint
log_test "2. Metrics endpoint"
METRICS=$(curl -sf "$API_URL/metrics" || echo "")
if [ -n "$METRICS" ]; then
    log_pass "Metrics endpoint returned data"
else
    log_fail "Metrics endpoint failed or empty"
fi

# Test 3: Magic-link request
log_test "3. Magic-link request"
MAGIC_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/magic/request" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\"}")
if echo "$MAGIC_RESPONSE" | grep -q '"ok":true'; then
    log_pass "Magic-link request succeeded"
    echo "  Note: Check console/logs for magic link URL"
else
    log_fail "Magic-link request failed: $MAGIC_RESPONSE"
fi

# Test 4: Rate limiting (auth endpoints)
log_test "4. Rate limiting on auth endpoints"
RATE_LIMIT_HIT=false
for i in {1..12}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/magic/request" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"ratelimit-$i@example.com\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMIT_HIT=true
        break
    fi
    sleep 0.5
done
if [ "$RATE_LIMIT_HIT" = true ]; then
    log_pass "Rate limiting working (429 returned)"
else
    log_fail "Rate limiting not working (no 429 after 12 requests)"
fi

# Test 5: OpenAPI docs
log_test "5. OpenAPI documentation"
if curl -sf "$API_URL/docs/openapi.json" > /dev/null; then
    log_pass "OpenAPI docs accessible"
else
    log_fail "OpenAPI docs not accessible"
fi

# Test 6: CORS headers (if origin provided)
if [ -n "$CORS_ORIGIN" ]; then
    log_test "6. CORS headers"
    CORS_HEADERS=$(curl -s -I -H "Origin: $CORS_ORIGIN" "$API_URL/healthz" | grep -i "access-control" || echo "")
    if [ -n "$CORS_HEADERS" ]; then
        log_pass "CORS headers present"
    else
        log_fail "CORS headers missing"
    fi
fi

# Test 7: Public proof endpoint structure (if proof exists)
log_test "7. Public proof endpoint structure"
# This test requires a known proof multihash - skip if not available
if [ -n "$TEST_PROOF_MH" ]; then
    PROOF_RESPONSE=$(curl -sf "$API_URL/p/$TEST_PROOF_MH" || echo "")
    if [ -n "$PROOF_RESPONSE" ]; then
        # Check for required fields
        if echo "$PROOF_RESPONSE" | grep -q '"type"'; then
            log_pass "Proof endpoint returns valid structure"
        else
            log_fail "Proof endpoint missing required fields"
        fi
        # Verify no PII leakage
        if echo "$PROOF_RESPONSE" | grep -qi "email\|@"; then
            log_fail "Proof endpoint may leak PII (contains email-like strings)"
        else
            log_pass "Proof endpoint does not leak PII"
        fi
    else
        log_fail "Proof endpoint failed or proof not found"
    fi
else
    echo "  Skipping (set TEST_PROOF_MH env var to test)"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi

