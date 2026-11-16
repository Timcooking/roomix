import { createContext, useContext } from 'react'
import type { L, Lang } from './i18n'
import type { Answers } from './data/questions'

export type Screen = 'welcome' | 'quiz' | 'reveal' | 'main'
export type Tab = 'discover' | 'rooms' | 'chats' | 'me'
/** localized messages (L) stay translatable when the language changes */
export type Msg = { from: 'me' | 'them'; text: string | L }

export type Overlay =
  | { type: 'match'; personId: string }
  | { type: 'roomMatch'; roomId: string; partnerId: string }
  | null

export type State = {
  lang: Lang
  screen: Screen
  tab: Tab
  answers: Answers
  /** matched person ids, newest first */
  matches: string[]
  /** who you are browsing rooms with */
  partnerId: string | null
  roomMatches: { roomId: string; partnerId: string }[]
  chats: Record<string, Msg[]>
  openChat: string | null
  overlay: Overlay
  /** bump to remount decks (reset demo) */
  seed: number
}

export const initialState = (lang: Lang): State => ({
  lang,
  screen: 'welcome',
  tab: 'discover',
  answers: {},
  matches: [],
  partnerId: null,
  roomMatches: [],
  chats: {},
  openChat: null,
  overlay: null,
  seed: 0,
})

type Ctx = {
  state: State
  set: (fn: (s: State) => Partial<State>) => void
  toast: (content: ToastInput) => void
}

export type ToastInput = {
  text: string
  avatar?: string
  action?: { label: string; onClick: () => void }
  tone?: 'default' | 'good' | 'warn'
}

export const StoreContext = createContext<Ctx>(null!)

export function useStore() {
  return useContext(StoreContext)
}
