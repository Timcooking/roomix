import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import type { Person } from '../data/people'
import { photo } from '../data/photos'
import { hkd, type Room } from '../data/rooms'
import { compatibility, type Answers } from '../data/questions'
import { IconHeart, IconSend } from './icons'

const spring = { type: 'spring' as const, stiffness: 260, damping: 20 }

function Burst({ count = 26, delay = 0.45 }: { count?: number; delay?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4
        const d = 120 + Math.random() * 170
        return {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d - 40,
          s: 0.5 + Math.random() * 0.9,
          r: Math.random() * 120 - 60,
          kind: i % 3 === 0 ? 'spark' : 'heart',
          dl: delay + Math.random() * 0.15,
        }
      }),
    [count, delay],
  )
  return (
    <div className="burst" aria-hidden>
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className={'burst-' + p.kind}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 60], scale: [0, p.s, p.s * 0.6], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 1.5, delay: p.dl, ease: [0.1, 0.7, 0.3, 1], times: [0, 0.55, 1] }}
        >
          {p.kind === 'heart' ? <IconHeart size={18} /> : null}
        </motion.span>
      ))}
    </div>
  )
}

function Title({ text, sub }: { text: { en: string; zh: string }; sub: string }) {
  const { lang } = useT()
  return (
    <>
      <motion.div
        className="match-title"
        initial={{ scale: 2.4, opacity: 0, rotate: -14 }}
        animate={{ scale: 1, opacity: 1, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
      >
        {lang === 'en' ? (
          <>
            <span className="its">{text.en.split('|')[0]}</span>
            <span className="script">{text.en.split('|')[1]}</span>
          </>
        ) : (
          <span className="zh-title">{text.zh}</span>
        )}
      </motion.div>
      <motion.p className="match-sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        {sub}
      </motion.p>
    </>
  )
}

export function MatchOverlay({
  person,
  mine,
  onRooms,
  onClose,
  onSend,
}: {
  person: Person
  mine: Answers
  onRooms: () => void
  onClose: () => void
  onSend: (text: string) => void
}) {
  const { t } = useT()
  const [msg, setMsg] = useState('')
  const score = compatibility(mine, person.answers)
  return (
    <motion.div className="overlay match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div
        className="match-bg"
        style={{ backgroundImage: `url("${photo(person.photos[0].key, 500)}")` }}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <div className="match-scrim" />
      <Burst />
      <div className="match-content">
        <Title
          text={{ en: "It's a|Match!", zh: t('match') }}
          sub={`${t('matchSub', { name: person.name })} · ${score}% ${t('compat')}`}
        />
        <div className="match-photos">
          <motion.div
            className="mp mp-left"
            style={{ backgroundImage: `url("${photo('me', 400)}")` }}
            initial={{ x: -280, rotate: -40, opacity: 0 }}
            animate={{ x: 0, rotate: -10, opacity: 1 }}
            transition={{ ...spring, delay: 0.2 }}
          />
          <motion.div
            className="mp mp-right"
            style={{ backgroundImage: `url("${photo(person.photos[0].key, 400)}")` }}
            initial={{ x: 280, rotate: 40, opacity: 0 }}
            animate={{ x: 0, rotate: 9, opacity: 1 }}
            transition={{ ...spring, delay: 0.28 }}
          />
          <motion.div
            className="match-heart"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.35, 1], rotate: 0 }}
            transition={{ delay: 0.62, duration: 0.5, times: [0, 0.6, 1] }}
          >
            <IconHeart size={30} />
          </motion.div>
        </div>
        <motion.div className="match-actions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ...spring }}>
          <form
            className="match-input"
            onSubmit={(e) => {
              e.preventDefault()
              if (msg.trim()) onSend(msg.trim())
            }}
          >
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t('saySomething')} />
            <button type="submit" disabled={!msg.trim()} aria-label={t('send')}>
              <IconSend size={20} />
            </button>
          </form>
          <button className="btn-grad" onClick={onRooms}>
            {t('swipeRoomsTogether')} →
          </button>
          <button className="btn-ghost" onClick={onClose}>
            {t('keepSwiping')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function RoomMatchOverlay({
  room,
  partner,
  onBook,
  onClose,
}: {
  room: Room
  partner: Person
  onBook: () => void
  onClose: () => void
}) {
  const { t, tx } = useT()
  return (
    <motion.div className="overlay match room-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div
        className="match-bg"
        style={{ backgroundImage: `url("${photo(room.photos[0].key, 500)}")` }}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <div className="match-scrim" />
      <Burst count={22} />
      <div className="match-content">
        <Title text={{ en: "It's a|Room Match!", zh: t('roomMatchTitle') }} sub={t('roomMatchSub', { name: partner.name })} />
        <motion.div
          className="rm-card"
          initial={{ y: 80, scale: 0.7, opacity: 0, rotate: 6 }}
          animate={{ y: 0, scale: 1, opacity: 1, rotate: -2 }}
          transition={{ ...spring, delay: 0.2 }}
        >
          <div className="rm-photo" style={{ backgroundImage: `url("${photo(room.photos[0].key, 600)}")` }} />
          <div className="rm-body">
            <b>{tx(room.title)}</b>
            <span>
              {hkd(room.rent)}
              {t('perMonth')} · {t('each')} {hkd(Math.round(room.rent / 2))}
              {t('eachSuffix')}
            </span>
          </div>
          <motion.div className="rm-avatars" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.55 }}>
            <span className="avatar" style={{ backgroundImage: `url("${photo('me', 160)}")` }} />
            <span className="rm-heart">
              <IconHeart size={16} />
            </span>
            <span className="avatar" style={{ backgroundImage: `url("${photo(partner.photos[0].key, 160)}")` }} />
          </motion.div>
        </motion.div>
        <motion.div className="match-actions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ...spring }}>
          <button className="btn-grad" onClick={onBook}>
            {t('bookViewing')}
          </button>
          <button className="btn-ghost" onClick={onClose}>
            {t('keepBrowsing')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
