#!/usr/bin/env node
// MessageDisplay hook for Claude Code: renders ```mermaid blocks as ASCII diagrams.
// It is called once per batch of completed lines of a streaming message, so a
// block can span several calls; the unclosed block is kept in a per-message file.

import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WriteStream } from "node:tty";

const isOpenFence = (line) => /^\s*```mermaid/i.test(line);
const isCloseFence = (line) => /^\s*`{3,}\s*$/.test(line);

// stdout is a pipe to Claude Code, so ask the controlling terminal directly.
function terminalWidth() {
  try {
    const tty = new WriteStream(openSync("/dev/tty", "w"));
    const { columns } = tty;
    tty.destroy();
    return columns || Infinity;
  } catch {
    return Infinity;
  }
}

async function render(block, closeFence) {
  try {
    // Imported lazily: most calls have no diagram and must stay fast.
    const { renderMermaidASCII } = await import("beautiful-mermaid");
    const source = block.slice(block.indexOf("\n") + 1);
    // Tightest spacing before edges and labels start colliding with boxes.
    // boxBorderPaddingX comes from patches/: one-line boxes, one space around text.
    const options = { colorMode: "none", paddingX: 3, paddingY: 3, boxBorderPadding: 0, boxBorderPaddingX: 1 };
    const ascii = renderMermaidASCII(source, options).trimEnd();
    const width = Math.max(...ascii.split("\n").map((line) => line.trimEnd().length));
    // A diagram wider than the terminal wraps into garbage; the source reads better.
    // 4 columns go to the indent Claude Code puts before a message.
    // Fenced, otherwise markdown joins the lines into one paragraph.
    if (ascii && width <= terminalWidth() - 4) return "```\n" + ascii + "\n```\n";
  } catch {}
  return block + closeFence;
}

const event = JSON.parse(readFileSync(0, "utf8"));
const delta = event.delta ?? "";
const stateDir = join(process.env.XDG_RUNTIME_DIR || tmpdir(), "claude-mermaid");
const stateFile = join(stateDir, `${event.message_id}.json`);

// The unclosed block as received, opening fence included, so it can be shown raw.
let block = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : null;
let display = "";

for (const line of delta.split(/(?<=\n)/)) {
  if (block === null) {
    if (isOpenFence(line)) block = line;
    else display += line;
  } else if (isCloseFence(line)) {
    display += await render(block, line);
    block = null;
  } else {
    block += line;
  }
}

if (event.final && block !== null) {
  display += block;
  block = null;
}

if (block === null) {
  rmSync(stateFile, { force: true });
} else {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(stateFile, JSON.stringify(block));
}

if (display !== delta) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "MessageDisplay", displayContent: display } }));
}
