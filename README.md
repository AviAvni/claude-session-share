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
| `/session-share ask <question>` | Ask; your own Claude answers here and the answer goes to the room |
| `/session-share status` | Show the room, who is online, and open the panel |
| `/session-share leave` | Leave the room (the host stops publishing and closes it) |

After `start`, open the room link and use **Share** on claude.ai to share it with
teammates or your organization **as Contributor** (needed to ask questions and to
show as online). Only people you share it with can open it: claude.ai checks
their sign-in.

## How it works

- The room is a private claude.ai artifact with a database:
  `events` (host stream, only the owner writes), `qa` and `presence`
  (contributors write), `meta` (owner writes).
- The plugin reads and writes it through Claude Code's `ArtifactData` tool as the
  signed-in person, polling every 2.5 s (a read takes ~250 ms). No server, no
  tunnel, no model tokens for following along.
- Display names come from `git config user.name`.

## Limits

- Any Contributor can write any `qa` or `presence` entry, so names are not
  verified among the people you shared with. Outsiders cannot read or write.
- Anyone in the room sees everything the host's session publishes, including
  tool calls. Don't host sessions with data that must not be shared.
- Reloading the plugin keeps you in the room; ending the session leaves it.

## License

MIT, see [LICENSE](LICENSE).
