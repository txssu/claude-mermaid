#!/bin/sh
cat <<'JSON'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "The user's terminal renders ```mermaid code blocks as diagrams (flowchart, state, sequence, class, ER, xychart-beta). When a diagram would help, write a mermaid block instead of drawing ASCII art by hand."
  }
}
JSON
