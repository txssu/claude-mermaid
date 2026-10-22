import { expect, test } from "bun:test";
import { closeSync, mkdtempSync, openSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK = join(import.meta.dir, "dist", "mermaid_display.js");

// Feeds chunks as consecutive flushes of one message, returns what is shown.
function run(chunks) {
  const runtime = mkdtempSync(join(tmpdir(), "claude-mermaid-test-"));
  const messageId = crypto.randomUUID();
  const shown = [];
  try {
    [...chunks, ""].forEach((delta, index) => {
      const event = { message_id: messageId, turn_id: "t", index, final: index === chunks.length, delta };
      const proc = Bun.spawnSync([process.execPath, HOOK], {
        stdin: Buffer.from(JSON.stringify(event)),
        env: { ...process.env, XDG_RUNTIME_DIR: runtime },
      });
      expect(proc.exitCode).toBe(0);
      const stdout = proc.stdout.toString();
      shown.push(stdout ? JSON.parse(stdout).hookSpecificOutput.displayContent : delta);
    });
    expect([...new Bun.Glob("**").scanSync(runtime)]).toEqual([]);
  } finally {
    rmSync(runtime, { recursive: true, force: true });
  }
  return shown.join("");
}

test("text without diagrams passes through", () => {
  expect(run(["hello\n", "```elixir\nx = 1\n```\n"])).toBe("hello\n```elixir\nx = 1\n```\n");
});

test("block split across flushes is rendered", () => {
  const shown = run(["before\n```mermaid\ngraph LR\n", "  A --> B\n```\nafter\n"]);
  expect(shown.startsWith("before\n```\n┌───┐")).toBe(true);
  expect(shown).toContain("│ A ");
  expect(shown).not.toContain("A --> B");
  expect(shown.endsWith("┘\n```\nafter\n")).toBe(true);
});

test("fullwidth labels keep box borders aligned", () => {
  expect(run(["```mermaid\ngraph LR\n  A[中文] --> B\n```\n"])).toBe(
    "```\n┌──────┐   ┌───┐\n│ 中文 ├──►│ B │\n└──────┘   └───┘\n```\n",
  );
});

const hasTerminal = (() => {
  try {
    closeSync(openSync("/dev/tty", "w"));
    return true;
  } catch {
    return false;
  }
})();

// The desktop app runs hooks without a controlling terminal.
test.skipIf(hasTerminal)("without a terminal, a diagram wider than 80 columns is shown raw", () => {
  const wide = "```mermaid\ngraph LR\n  A[" + "a".repeat(40) + "] --> B[" + "b".repeat(40) + "]\n```\n";
  expect(run([wide])).toBe(wide);
});

test("invalid diagram is shown raw", () => {
  expect(run(["```mermaid\ngraph TD; A-->\n```\n"])).toBe("```mermaid\ngraph TD; A-->\n```\n");
});

test("unclosed block is shown raw", () => {
  expect(run(["```mermaid\ngraph LR\n"])).toBe("```mermaid\ngraph LR\n");
});
