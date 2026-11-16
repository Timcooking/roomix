import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LangContext, detectLang, useT, type Lang } from './i18n'
import { StoreContext, initialState, useStore, type State, type Tab, type ToastInput } from './store'
import { PEOPLE, PEOPLE_BY_ID } from './data/people'
import { ROOMS, ROOMS_BY_ID } from './data/rooms'
import { warmup } from './data/photos'
import { Welcome } from './screens/Welcome'
import { Quiz } from './screens/Quiz'
import { Reveal } from './screens/Reveal'
import { Discover } from './screens/Discover'
import { Rooms } from './screens/Rooms'
import { Chats } from './screens/Chats'
import { Me } from './screens/Me'
import { MatchOverlay, RoomMatchOverlay } from './components/MatchOverlays'
import { IconChat, IconPerson, IconRooms, LogoMark } from './components/icons'

type ToastItem = ToastInput & { id: number }

const HTML_LANG: Record<Lang, string> = { sc: 'zh-Hans', tc: 'zh-Hant-HK', en: 'en' }

export default function App() {
  const [state, setState] = useState<State>(() => initialState(detectLang()))
  const set = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), [])
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((x: ToastInput) => {
    const id = Date.now() + Math.random()
    setToasts((ts) => [...ts.slice(-1), { ...x, id }])
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), x.action ? 4200 : 2600)
  }, [])

  const setLang = (l: Lang) => {
    try {
      localStorage.setItem('roomix.lang', l)
    } catch {}
    set(() => ({ lang: l }))
  }

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[state.lang]
  }, [state.lang])

  // load what the next screen needs while the user is busy with this one
  useEffect(() => {
    if (state.screen === 'quiz') {
      warmup(['me', 'me2', 'me3'])
      warmup(PEOPLE.slice(0, 3).flatMap((p) => p.photos.map((x) => x.key)))
    }
    if (state.screen === 'main') {
      document.fonts?.load('40px "Kaushan Script"').catch(() => {})
      warmup(ROOMS.slice(0, 2).flatMap((r) => r.photos.map((x) => x.key)))
    }
  }, [state.screen])

  const store = useMemo(() => ({ state, set, toast }), [state, set, toast])

  return (
    <LangContext.Provider value={state.lang}>
      <StoreContext.Provider value={store}>
        <div className="app">
          <AnimatePresence mode="wait" initial={false}>
            {state.screen === 'welcome' && (
              <ScreenFade key="welcome">
                <Welcome onLang={setLang} onStart={() => set(() => ({ screen: 'quiz' }))} />
              </ScreenFade>
            )}
            {state.screen === 'quiz' && (
              <ScreenFade key="quiz">
                <Quiz
                  onExit={() => set((s) => ({ screen: Object.keys(s.answers).length ? 'main' : 'welcome' }))}
                  onDone={(answers) => set(() => ({ answers, screen: 'reveal' }))}
                />
              </ScreenFade>
            )}
            {state.screen === 'reveal' && (
              <ScreenFade key="reveal">
                <Reveal answers={state.answers} onStart={() => set(() => ({ screen: 'main', tab: 'discover' }))} />
              </ScreenFade>
            )}
            {state.screen === 'main' && (
              <ScreenFade key="main">
                <Main
                  onLang={setLang}
                  onRetake={() => set(() => ({ screen: 'quiz' }))}
                  onReset={() => setState((s) => ({ ...initialState(s.lang), seed: s.seed + 1 }))}
                />
              </ScreenFade>
            )}
          </AnimatePresence>

          <Overlays />
          <Toasts items={toasts} onDismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />
        </div>
      </StoreContext.Provider>
    </LangContext.Provider>
  )
}

function ScreenFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Main({ onLang, onRetake, onReset }: { onLang: (l: Lang) => void; onRetake: () => void; onReset: () => void }) {
  const { state, set } = useStore()
  const tabs: { id: Tab; icon: React.ReactNode }[] = [
    { id: 'discover', icon: <LogoMark size={28} gradient={state.tab === 'discover'} /> },
    { id: 'rooms', icon: <IconRooms size={27} /> },
    { id: 'chats', icon: <IconChat size={27} /> },
    { id: 'me', icon: <IconPerson size={27} /> },
  ]
  const { t } = useT()
  const labels: Record<Tab, string> = { discover: t('tabDiscover'), rooms: t('tabRooms'), chats: t('tabMatches'), me: t('tabMe') }

  return (
    <div className="main" key={state.seed}>
      <div className="tab-pages">
        <section className="tab-page" hidden={state.tab !== 'discover'}>
          <Discover />
        </section>
        <section className="tab-page" hidden={state.tab !== 'rooms'}>
          <Rooms />
        </section>
        <section className="tab-page" hidden={state.tab !== 'chats'}>
          <Chats />
        </section>
        <section className="tab-page" hidden={state.tab !== 'me'}>
          <Me onLang={onLang} onRetake={onRetake} onReset={onReset} />
        </section>
      </div>
      <nav className="tabbar">
        {tabs.map((tb) => (
          <motion.button
            key={tb.id}
            className={'tab' + (state.tab === tb.id ? ' on' : '')}
            whileTap={{ scale: 0.86 }}
            onClick={() => set(() => ({ tab: tb.id, openChat: tb.id === 'chats' ? state.openChat : null }))}
            aria-label={labels[tb.id]}
          >
            {tb.icon}
            {tb.id === 'rooms' && state.partnerId && state.tab !== 'rooms' && <span className="tab-dot" />}
            {tb.id === 'chats' && state.matches.length > 0 && state.tab !== 'chats' && (
              <motion.span className="tab-badge" key={state.matches.length} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {state.matches.length}
              </motion.span>
            )}
            <span className="tab-label">{labels[tb.id]}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  )
}

function Overlays() {
  const { state, set, toast } = useStore()
  const { t } = useT()
  const ov = state.overlay
  return (
    <AnimatePresence>
      {ov?.type === 'match' && (
        <MatchOverlay
          key={'m' + ov.personId}
          person={PEOPLE_BY_ID[ov.personId]}
          mine={state.answers}
          onClose={() => set(() => ({ overlay: null }))}
          onRooms={() => set(() => ({ overlay: null, partnerId: ov.personId, tab: 'rooms' }))}
          onSend={(text) =>
            set((s) => ({
              overlay: null,
              chats: { ...s.chats, [ov.personId]: [...(s.chats[ov.personId] ?? []), { from: 'me', text }] },
            }))
          }
        />
      )}
      {ov?.type === 'roomMatch' && (
        <RoomMatchOverlay
          key={'r' + ov.roomId}
          room={ROOMS_BY_ID[ov.roomId]}
          partner={PEOPLE_BY_ID[ov.partnerId]}
          onClose={() => set(() => ({ overlay: null }))}
          onBook={() => {
            set(() => ({ overlay: null }))
            toast({ text: t('viewingBooked'), tone: 'good' })
          }}
        />
      )}
    </AnimatePresence>
  )
}

function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts">
      <AnimatePresence initial={false}>
        {items.map((x) => (
          <motion.div
            key={x.id}
            layout
            className={'toast toast-' + (x.tone ?? 'default')}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            onClick={() => onDismiss(x.id)}
          >
            {x.avatar && <span className="avatar" style={{ backgroundImage: `url("${x.avatar}")`, width: 28, height: 28 }} />}
            <span className="toast-text">{x.text}</span>
            {x.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  x.action!.onClick()
                  onDismiss(x.id)
                }}
              >
                {x.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

