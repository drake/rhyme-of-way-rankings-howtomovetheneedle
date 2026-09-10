#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"
npx --yes wrangler deploy
echo "Live: https://rhyme-of-way-rankings.howtomovetheneedle.com/"
