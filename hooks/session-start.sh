#!/bin/sh
cat <<'JSON'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "The user's terminal renders ```mermaid code blocks as diagrams (flowchart, state, sequence, class, ER, xychart-beta). When a diagram would help, write a mermaid block instead of drawing ASCII art by hand. Keep it narrow enough for the terminal: labels of a few words, no full URLs or parameter lists, <br/> to break a longer label, details in text below the diagram. A diagram wider than the terminal is shown as source."
  }
}
JSON
