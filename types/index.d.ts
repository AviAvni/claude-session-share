// What the session keeps across a reload of the mod: the room this session is in.
export type SavedRoom = {
  role: 'host' | 'guest'
  room: string
  me: { id: string; name: string }
  hostName: string
  nextSeq: number
}

declare module 'claude-code' {
  interface PluginState {
    'session-share': { saved: Shaped<SavedRoom | null> }
  }
}
