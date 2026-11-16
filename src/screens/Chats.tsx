import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { uiL, useT } from '../i18n'
import { useStore, type Msg } from '../store'
import { PEOPLE_BY_ID } from '../data/people'
import { photo } from '../data/photos'
import { ROOMS_BY_ID, hkd } from '../data/rooms'
import { Avatar } from '../components/Cards'
import { IconBack, IconRooms, IconSend, LogoMark } from '../components/icons'

export function Chats() {
  const { state, set } = useStore()
  const { t, tx } = useT()
  const open = (id: string) => set(() => ({ openChat: id }))
  const msgText = (m: Msg) => (typeof m.text === 'string' ? m.text : tx(m.text))

  return (
    <div className="page chats">
      <header className="topbar">
        <div className="brand">
          <LogoMark size={30} />
          <span className="wordmark">roomix</span>
        </div>
      </header>
      <div className="chats-scroll">
        <h4 className="section-title">{t('newMatches')}</h4>
        {state.matches.length === 0 ? (
          <p className="chats-empty">{t('noMatchesYet')}</p>
        ) : (
          <div className="match-row">
            {state.matches.map((id) => {
              const p = PEOPLE_BY_ID[id]
              return (
                <motion.button key={id} className="match-tile" whileTap={{ scale: 0.95 }} onClick={() => open(id)} layout>
                  <span className="match-tile-img" style={{ backgroundImage: `url("${photo(p.photos[0].key, 240)}")` }} />
                  <span>{p.name}</span>
                </motion.button>
              )
            })}
          </div>
        )}

        {state.roomMatches.length > 0 && (
          <>
            <h4 className="section-title">{t('roomMatches')}</h4>
            <div className="match-row">
              {state.roomMatches.map((m) => {
                const r = ROOMS_BY_ID[m.roomId]
                const p = PEOPLE_BY_ID[m.partnerId]
                return (
                  <div key={m.roomId} className="room-tile">
                    <span className="room-tile-img" style={{ backgroundImage: `url("${photo(r.photos[0].key, 300)}")` }}>
                      <span className="room-tile-duo">
                        <Avatar src={photo('me', 80)} size={22} />
                        <Avatar src={photo(p.photos[0].key, 80)} size={22} />
                      </span>
                    </span>
                    <b>{hkd(r.rent)}</b>
                    <small>{tx(r.title).split(' · ')[0]}</small>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {state.matches.length > 0 && <h4 className="section-title">{t('messages')}</h4>}
        <div className="msg-list">
          {state.matches.map((id) => {
            const p = PEOPLE_BY_ID[id]
            const msgs = state.chats[id] ?? []
            const last = msgs[msgs.length - 1]
            return (
              <motion.button key={id} className="msg-item" onClick={() => open(id)} whileTap={{ backgroundColor: 'rgba(0,0,0,.04)' }} layout>
                <Avatar src={photo(p.photos[0].key, 160)} size={60} />
                <span className="msg-item-text">
                  <b>{p.name}</b>
                  <span>{last ? (last.from === 'me' ? '↩ ' : '') + msgText(last) : t('startChat')}</span>
                </span>
                {state.partnerId === id && <IconRooms size={18} className="msg-item-badge" />}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>{state.openChat && <ChatView key={state.openChat} personId={state.openChat} />}</AnimatePresence>
    </div>
  )
}

function ChatView({ personId }: { personId: string }) {
  const { state, set } = useStore()
  const { t, tx } = useT()
  const p = PEOPLE_BY_ID[personId]
  const msgs = state.chats[personId] ?? []
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 1e6, behavior: 'smooth' })
  }, [msgs.length, typing])

  const send = () => {
    const v = text.trim()
    if (!v) return
    setText('')
    set((s) => ({ chats: { ...s.chats, [personId]: [...(s.chats[personId] ?? []), { from: 'me', text: v }] } }))
    const theirs = msgs.filter((m) => m.from === 'them').length
    if (theirs < 2) {
      setTimeout(() => setTyping(true), 700)
      setTimeout(() => {
        setTyping(false)
        set((s) => ({ chats: { ...s.chats, [personId]: [...(s.chats[personId] ?? []), { from: 'them', text: uiL('autoReply') }] } }))
      }, 2300)
    }
  }

  return (
    <motion.div
      className="chat"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
    >
      <header className="chat-head">
        <button className="icon-btn" onClick={() => set(() => ({ openChat: null }))} aria-label="back">
          <IconBack size={26} />
        </button>
        <Avatar src={photo(p.photos[0].key, 120)} size={40} />
        <b>{p.name}</b>
        <button
          className="pill-grad"
          onClick={() => set(() => ({ partnerId: personId, tab: 'rooms', openChat: null }))}
        >
          <IconRooms size={15} /> {t('swipeRoomsTogether')}
        </button>
      </header>
      <div className="chat-body" ref={scroller}>
        <div className="chat-system">
          <Avatar src={photo(p.photos[0].key, 200)} size={88} ring />
          <span>{t('matchedOn')}</span>
        </div>
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            className={'bubble ' + (m.from === 'me' ? 'bubble-me' : 'bubble-them')}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {typeof m.text === 'string' ? m.text : tx(m.text)}
          </motion.div>
        ))}
        {typing && (
          <motion.div className="bubble bubble-them typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          </motion.div>
        )}
      </div>
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('typeMessage')} />
        <button type="submit" disabled={!text.trim()} aria-label={t('send')}>
          <IconSend size={20} />
        </button>
      </form>
    </motion.div>
  )
}
