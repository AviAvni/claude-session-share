// What the session keeps across a reload of the plugin: the room it is in.
export type SavedRoom = {
  role: 'host' | 'guest'
  room: string
  me: { id: string; sid: string; name: string }
  hostName: string
  nextSeq: number
  paused: boolean
  lastChangesKey: string
}

declare module 'claude-code' {
  interface PluginState {
    'session-share': { saved: Shaped<SavedRoom | null> }
  }
}
