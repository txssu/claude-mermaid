# claude-mermaid

Claude Code renders tables, lists and syntax highlighting in the terminal, but ` ```mermaid ` blocks come out as raw source. So Claude falls back to hand-drawn ASCII diagrams, and they drift out of alignment.

This hook fixes that. Claude writes plain Mermaid, and the terminal shows a real diagram drawn by [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid):

![A sequence diagram rendered in Claude Code](assets/screenshot.png)

## Install

Requires [Bun](https://bun.sh) and Claude Code 2.1.277 or later.

```sh
git clone https://github.com/txssu/claude-mermaid ~/.claude/claude-mermaid
cd ~/.claude/claude-mermaid && bun install
```

Add the hook to `~/.claude/settings.json`, using absolute paths:

```json
{
  "hooks": {
    "MessageDisplay": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/home/you/.bun/bin/bun /home/you/.claude/claude-mermaid/mermaid_display.js",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Running sessions pick it up without a restart.

## Usage

Ask Claude for a diagram, e.g. "draw a mermaid sequence diagram of this project". Flowcharts, state, sequence, class, ER and XY charts are supported.

Only the screen changes: the transcript and Claude's context keep the Mermaid source. If a diagram fails to render, the source is shown as is.

`MessageDisplay` is an undocumented hook, so a Claude Code update may break this. A block split across streaming chunks is kept in `$XDG_RUNTIME_DIR/claude-mermaid/` until it closes.

## Development

```sh
bun test
```

## License

MIT
