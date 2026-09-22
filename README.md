# claude-mermaid

Mermaid diagrams, rendered right in the Claude Code terminal.

![A sequence diagram rendered in Claude Code](assets/screenshot.png)

Claude Code renders markdown tables but shows ` ```mermaid ` blocks as raw source, so Claude draws diagrams as ASCII art by hand, character by character. With this plugin, Claude writes a few lines of Mermaid and [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) draws the picture:

- Answers come faster: Claude writes the short source, not every space and box character of the drawing.
- Edits are cheap: "add PKCE to the diagram" changes a line of Mermaid instead of redrawing everything.
- The layout never drifts, even on diagrams too tangled to draw by hand.
- The diagram is reusable: paste the source into a README, PR or issue, and GitHub renders it too.

## Install

Requires Claude Code 2.1.277 or later, and Bun or Node.js on `PATH`.

Add this repo as a plugin marketplace, then install the plugin from it:

```sh
claude plugin marketplace add txssu/claude-mermaid
claude plugin install claude-mermaid@claude-mermaid
```

Restart Claude Code to apply. The same commands work inside Claude Code as `/plugin marketplace add …` and `/plugin install …`.

To update later:

```sh
claude plugin update claude-mermaid@claude-mermaid
```

## Usage

Ask Claude for a diagram, e.g. "draw a sequence diagram of this project". The plugin tells Claude at session start that Mermaid is rendered, so it writes Mermaid instead of ASCII art. Flowcharts, state, sequence, class, ER and XY charts are supported.

Only the screen changes: the transcript and Claude's context keep the Mermaid source. If a diagram fails to render or is wider than the terminal, the source is shown as is.

A block split across streaming chunks is kept in `$XDG_RUNTIME_DIR/claude-mermaid/` until it closes.

## Development

```sh
bun install
bun run test
```

`dist/` is committed, since plugins are installed without `bun install`. Rebuild it with `bun run build`.

## License

MIT
