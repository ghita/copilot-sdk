#!/usr/bin/env bash
# create-omni-repo.sh
#
# Extracts the omni/ directory with its full git history from this repository
# and pushes it as a new standalone GitHub repository called "omni".
#
# Prerequisites:
#   - git filter-repo  (pip install git-filter-repo  OR  brew install git-filter-repo)
#   - gh CLI           (https://cli.github.com/)  — authenticated with `gh auth login`
#
# Usage:
#   ./scripts/create-omni-repo.sh [--org <org-or-user>] [--private]
#
# Examples:
#   ./scripts/create-omni-repo.sh
#   ./scripts/create-omni-repo.sh --org myorg --private

set -euo pipefail

REPO_NAME="omni"
VISIBILITY="--public"
ORG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --org)      ORG="$2";       shift 2 ;;
    --private)  VISIBILITY="--private"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ── 1. Verify prerequisites ──────────────────────────────────────────────────
if ! command -v git-filter-repo &>/dev/null; then
  echo "Error: git-filter-repo is not installed."
  echo "  Install with:  pip install git-filter-repo"
  echo "              or brew install git-filter-repo"
  exit 1
fi

if ! command -v gh &>/dev/null; then
  echo "Error: gh CLI is not installed. See https://cli.github.com/"
  exit 1
fi

# ── 2. Work in a temporary clone so the original repo is untouched ───────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
WORK_DIR="$(mktemp -d)"

echo "Working directory: $WORK_DIR"
echo "Cloning $SOURCE_REPO ..."
git clone "$SOURCE_REPO" "$WORK_DIR/$REPO_NAME"
cd "$WORK_DIR/$REPO_NAME"

# ── 3. Rewrite history — keep only the omni/ subtree, remap to repo root ─────
echo "Rewriting history to extract omni/ ..."
git filter-repo --path omni/ --path-rename omni/:

# ── 4. Create the new GitHub repository ──────────────────────────────────────
CREATE_ARGS=("$REPO_NAME" "$VISIBILITY" "--description" "CLI tool for running tasks with configurable Copilot agents")
if [[ -n "$ORG" ]]; then
  CREATE_ARGS+=("--org" "$ORG")
fi

echo "Creating GitHub repository '$REPO_NAME' ..."
gh repo create "${CREATE_ARGS[@]}" --source . --push

echo ""
echo "✅ Done! The new repository has been created and the extracted history pushed."
echo "   $(gh repo view "${ORG:+$ORG/}$REPO_NAME" --json url -q .url 2>/dev/null || true)"

# ── 5. Clean up ───────────────────────────────────────────────────────────────
cd "$SOURCE_REPO"
rm -rf "$WORK_DIR"
