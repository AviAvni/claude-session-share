# session-share

Share a Claude Code session (CLI or VS Code) with teammates through a private
claude.ai room. Everyone stays in their own Claude Code:

- The host's prompts, tool calls and replies stream into the room.
- Everyone in the room sees a live panel beside the chat, with who is online.
- Anyone can ask a question; **their own** Claude answers it in their own chat
  (their tokens, no waiting for the host) and the answer is posted to the room.
- The host's Claude gets teammates' questions and answers as context with the
  host's next prompt.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install session-share --marketplace AviAvni/claude-session-share
```

From a shell:

```
claude plugin install session-share --marketplace AviAvni/claude-session-share
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box,
then Plugins, Add marketplace with `AviAvni/claude-session-share`, then Add plugin.

Everyone who hosts or joins installs it. Readers without the plugin can open the
room link in a browser for a read-only view.

## Use

| Command | What it does |
| --- | --- |
| `/session-share start` | Create a room for this session and start publishing it |
| `/session-share join <link>` | Join a room from its claude.ai link |
| `/session-share ask <question>` | Ask; your own Claude answers here and the answer goes to the room (or type in the panel) |
| `/session-share diff <file>` | Ask the host to show one changed file's diff (the host approves) |
| `/session-share pause` / `resume` | Host: stop / restart publishing |
| `/session-share status` | Show the room, who is online, and open the panel |
| `/session-share rooms` | List your rooms; `rooms delete <link>`, `rooms delete-closed` |
| `/session-share leave` | Leave the room (the host stops publishing and closes it) |

After `start`, open the room link and use **Share** on claude.ai to share it with
teammates or your organization **as Contributor** (needed to ask questions and to
show as online). Only people you share it with can open it: claude.ai checks
their sign-in.

### The panel

- Who is online, the host's stream (Markdown), tool calls, and a summary of changed
  files with `+added −removed` after each turn.
- Questions and each asker's Claude's answer; **reply** to ask a follow-up in the thread.
- Guests: **ask host's Claude** on an answered question, and **request diff** on a changed
  file. Both wait for the host.
- Host: an **Approve / Deny** card for each request, plus a notification when it arrives.
- An input box at the bottom to ask.

### What the host shares

- Prompts, Claude's replies, and tool calls (commands and file paths, never file contents).
- After each turn, which files changed and by how many lines.
- A file's diff only when a guest asks and the host approves, and only for a file in that summary.
- Everything is passed through a redactor first (tokens, API keys, passwords, credentials in URLs).
- `/session-share pause` publishes nothing until `resume`.

## How it works

- The room is a private claude.ai artifact with a database: `events` and `meta` (only the
  owner writes), `qa`, `requests` and `presence` (contributors write).
- The plugin reads and writes it through Claude Code's `ArtifactData` tool as the
  signed-in person: every 2.5 s while the room is active, every ~10 s when idle (a read
  takes ~250 ms). No server, no tunnel, no model tokens for following along.
- A question goes to the asker's own Claude as a normal turn, with the room attached as
  a model-only note; the answer is written back when the turn ends.
- Display names come from `git config user.name`.

## Limits

- Any Contributor can write any `qa`, `requests` or `presence` entry, so names are not
  verified among the people you shared with. Outsiders cannot read or write.
- Redaction is pattern-based: it catches common token and key formats, not every secret.
- Updates are polled, not pushed: a Claude Code session can't receive the room's live
  events without the web page open.
- Reloading the plugin keeps you in the room; ending the session leaves it.

## Development

```
claude plugin validate .
claude plugin test .
```

CI runs both on every push. See [CHANGELOG.md](CHANGELOG.md).

## License

MIT, see [LICENSE](LICENSE).
