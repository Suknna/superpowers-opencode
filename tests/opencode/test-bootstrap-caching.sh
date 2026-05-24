#!/usr/bin/env bash
# Test: Superpowers Agent Prompt Caching (#1202)
# Verifies the OpenCode plugin caches the superpowers agent prompt.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Test: Superpowers Agent Prompt Caching (#1202) ==="

source "$SCRIPT_DIR/setup.sh"
trap cleanup_test_env EXIT

run_present_file_check() {
    node "$SCRIPT_DIR/test-bootstrap-caching.mjs" "$SUPERPOWERS_PLUGIN_FILE" present
}

run_missing_file_check() {
    mv "$SUPERPOWERS_AGENT_FILE" "$TEST_HOME/superpowers-agent.md.bak"

    node "$SCRIPT_DIR/test-bootstrap-caching.mjs" "$SUPERPOWERS_PLUGIN_FILE" missing
}

echo "Test 1: Caches superpowers agent prompt after the first config load..."
run_present_file_check
echo "  [PASS] Superpowers agent prompt is cached between config loads"

echo "Test 2: Caches missing superpowers agent prompt result..."
run_missing_file_check
echo "  [PASS] Missing agent prompt file is cached and not re-probed every config load"

echo ""
echo "=== All superpowers agent prompt caching tests passed ==="
