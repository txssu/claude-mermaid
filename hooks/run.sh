#!/bin/sh
exec "$(command -v bun || command -v node)" "$(dirname "$0")/../dist/mermaid_display.js"
