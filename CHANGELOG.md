# Changelog

## 0.3.0

- The panel renders the host's prompts, Claude's replies, answers and diffs as Markdown.
- Ask from the panel's input box; reply to an answer to ask a follow-up in the same thread.
- **Forward to host:** a guest can ask for the host's own Claude (which has the host's files)
  to answer their question. The host gets a notification and approves or denies it in the panel.
- **Change summaries:** after each turn the host publishes which files changed and by how much
  (`+added −removed`), never their contents.
- **Diffs on request:** a guest can ask for one changed file's diff; it is published only when
  the host approves, and only for files in the published change summary.
- **Pause / resume** publishing (`/session-share pause`, `/session-share resume`).
- **Redaction:** tokens, keys, passwords and credentials in URLs are removed from everything the
  host publishes; tool calls show file paths, never file contents.
- **Room cleanup:** `/session-share rooms` lists your rooms; `rooms delete <link>` and
  `rooms delete-closed` remove old ones.
- **Notifications** when someone joins or leaves, asks, gets an answer, or when the host approves
  or declines a request.
- Each session is its own member (two sessions of one person no longer share one presence entry).
- Room context reaches the asker's Claude reliably (it is attached as a model-only note, since a
  plugin's own prompt hook does not see the prompts it submits).
- Polling slows to every ~10 s when the room is idle (2.5 s while active).
- Database reads are checked: output the plugin does not recognize is reported, never read as empty.
- Tests (`claude plugin test`) and CI.

## 0.2.0

- First release: rooms are private claude.ai artifacts; live panel with presence; questions answered
  by each person's own Claude; teammates' Q&A given to the host's Claude.
