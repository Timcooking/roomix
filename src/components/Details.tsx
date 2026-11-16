import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useT, type L } from '../i18n'
import type { Person } from '../data/people'
import { photo } from '../data/photos'
import { QUESTIONS, compareAnswer, compatibility, optionOf, type Answers, type QuestionId } from '../data/questions'
import { hkd, type Room } from '../data/rooms'
import { CompatRing, budgetFits } from './Cards'
import type { Dir } from './SwipeDeck'
import {
  IconBag,
  IconCalendar,
  IconDown,
  IconHeart,
  IconPin,
  IconStar,
  IconTrain,
  IconVerified,
  IconX,
} from './icons'

const SHORT: Record<QuestionId, L> = {
  sleep: { sc: '作息', tc: '作息', en: 'Sleep' },
  shower: { sc: '洗澡', tc: '沖涼', en: 'Shower' },
  clean: { sc: '整洁', tc: '整潔', en: 'Tidiness' },
  food: { sc: '冰箱食物', tc: '雪櫃嘢食', en: 'Fridge food' },
  guests: { sc: '访客过夜', tc: '訪客過夜', en: 'Guests' },
  calls: { sc: '通话', tc: '講電話', en: 'Calls' },
  pets: { sc: '宠物', tc: '寵物', en: 'Pets' },
  smoke: { sc: '烟酒', tc: '煙酒', en: 'Smoke/drink' },
  budget: { sc: '预算', tc: '預算', en: 'Budget' },
  area: { sc: '地区', tc: '地區', en: 'Area' },
}

const sheetMotion = {
  initial: { opacity: 0, y: 70, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 90, scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 360, damping: 34 },
}

function Gallery({ srcs, captions }: { srcs: string[]; captions: (string | undefined)[] }) {
  const [i, setI] = useState(0)
  return (
    <div
      className="gallery"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const step = e.clientX - r.left < r.width / 2 ? -1 : 1
        setI((v) => Math.min(srcs.length - 1, Math.max(0, v + step)))
      }}
    >
      {srcs.map((s, k) => (
        <div key={k} className="card-photo" style={{ backgroundImage: `url("${s}")`, opacity: k === i ? 1 : 0 }} />
      ))}
      {srcs.length > 1 && (
        <div className="card-bars">
          {srcs.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
      )}
      {captions[i] && <div className="card-caption">{captions[i]}</div>}
    </div>
  )
}

function SheetActions({ onAction }: { onAction: (d: Dir) => void }) {
  return (
    <div className="sheet-actions">
      <motion.button whileTap={{ scale: 0.85 }} className="rbtn rbtn-left solo lg" onClick={() => onAction('left')}>
        <span className="rbtn-icon">
          <IconX size={28} />
        </span>
      </motion.button>
      <motion.button whileTap={{ scale: 0.85 }} className="rbtn rbtn-up solo sm" onClick={() => onAction('up')}>
        <span className="rbtn-icon">
          <IconStar size={22} />
        </span>
      </motion.button>
      <motion.button whileTap={{ scale: 0.85 }} className="rbtn rbtn-right solo lg" onClick={() => onAction('right')}>
        <span className="rbtn-icon">
          <IconHeart size={28} />
        </span>
      </motion.button>
    </div>
  )
}

function Sheet({ children, onClose, onAction }: { children: ReactNode; onClose: () => void; onAction: (d: Dir) => void }) {
  return (
    <motion.div className="sheet" {...sheetMotion}>
      <div className="sheet-scroll">
        {children}
        <div style={{ height: 120 }} />
      </div>
      <motion.button className="sheet-close" whileTap={{ scale: 0.88 }} onClick={onClose} aria-label="close">
        <IconDown size={22} />
      </motion.button>
      <SheetActions onAction={onAction} />
    </motion.div>
  )
}

export function PersonDetail({
  person,
  mine,
  onClose,
  onAction,
}: {
  person: Person
  mine: Answers
  onClose: () => void
  onAction: (d: Dir) => void
}) {
  const { t, tx } = useT()
  const score = compatibility(mine, person.answers)
  return (
    <Sheet onClose={onClose} onAction={onAction}>
      <Gallery srcs={person.photos.map((p) => photo(p.key, 800))} captions={person.photos.map((p) => (p.caption ? tx(p.caption) : undefined))} />
      <div className="sheet-body">
        <h1 className="sheet-name">
          {person.name} <span className="age">{person.age}</span>
          {person.verified && <IconVerified size={24} />}
        </h1>
        <div className="sheet-line">
          <IconBag size={16} /> {tx(person.job)}
        </div>
        <div className="sheet-line">
          <IconPin size={16} /> {t('livesIn')} {tx(person.livesIn)}
        </div>
        <div className="sheet-line">
          <IconCalendar size={16} /> {t('moveIn')} {tx(person.moveIn)}
        </div>

        <div className="sheet-compat">
          <CompatRing value={score} size={56} />
          <div>
            <b>
              {score}% {t('compat')}
            </b>
            <span>
              {QUESTIONS.filter((q) => compareAnswer(q.id, mine[q.id], person.answers[q.id]) === 'same').length} / 10 {t('same')}
            </span>
          </div>
        </div>

        <h3>{t('aboutMe')}</h3>
        <p className="sheet-bio">{tx(person.bio)}</p>

        <h3>{t('lifestyle')}</h3>
        <div className="compare">
          <div className="compare-head">
            <span />
            <span>{person.name}</span>
            <span>{t('you')}</span>
          </div>
          {QUESTIONS.map((q) => {
            const theirs = person.answers[q.id] ?? []
            const ours = mine[q.id] ?? []
            const v = compareAnswer(q.id, ours, theirs)
            const fmt = (ids: string[]) => ids.map((id) => optionOf(q.id, id)).filter(Boolean).map((o) => `${o!.emoji} ${tx(o!.chip)}`).join(' / ') || '—'
            return (
              <div className={'compare-row' + (v ? ' v-' + v : '')} key={q.id}>
                <span className="compare-q">
                  {tx(SHORT[q.id])}
                  {v && <i className={'verdict verdict-' + v}>{t(v)}</i>}
                </span>
                <span>{fmt(theirs)}</span>
                <span>{fmt(ours)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Sheet>
  )
}

export function RoomDetail({
  room,
  mine,
  partner,
  onClose,
  onAction,
}: {
  room: Room
  mine: Answers
  partner?: Person
  onClose: () => void
  onAction: (d: Dir) => void
}) {
  const { t, tx } = useT()
  const fits = budgetFits(room, mine, partner?.answers)
  const facts: [string, string][] = [
    [tx({ sc: '格局', tc: '間隔', en: 'Layout' }), `${room.beds} ${tx({ sc: '房', tc: '房', en: 'bd' })} · ${room.baths} ${tx({ sc: '浴', tc: '廁', en: 'ba' })}`],
    [tx({ sc: '实用面积', tc: '實用面積', en: 'Size' }), `${room.sizeFt} ${tx({ sc: '呎', tc: '呎', en: 'ft²' })}`],
    [tx({ sc: '楼层', tc: '樓層', en: 'Floor' }), tx(room.floor)],
    [tx({ sc: '地区', tc: '地區', en: 'District' }), tx(room.district)],
  ]
  return (
    <Sheet onClose={onClose} onAction={onAction}>
      <Gallery srcs={room.photos.map((p) => photo(p.key, 800))} captions={room.photos.map((p) => (p.caption ? tx(p.caption) : undefined))} />
      <div className="sheet-body">
        <h1 className="sheet-name">
          {hkd(room.rent)}
          <span className="age">{t('perMonth')}</span>
        </h1>
        <div className="sheet-split">
          {t('each')} <b>{hkd(Math.round(room.rent / 2))}</b>
          {t('eachSuffix')}
          <span className={'verdict ' + (fits ? 'verdict-same' : 'verdict-differ')}>{fits ? t('fitsBoth') : t('overBudget')}</span>
        </div>
        <div className="sheet-title">{tx(room.title)}</div>
        <div className="sheet-line">
          <IconTrain size={16} /> {tx(room.mtr)}
        </div>
        <div className="sheet-line">
          <IconCalendar size={16} /> {t('moveIn')} {tx(room.available)}
        </div>
        <div className="facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <b>{v}</b>
            </div>
          ))}
        </div>
        <div className="chips chips-light">
          {room.features.map((f, i) => (
            <span className="chip" key={i}>
              <span className="chip-emoji">{f.emoji}</span>
              {tx(f.label)}
            </span>
          ))}
        </div>
        <div className="unified-box">
          <span className="unified-logo">🧩</span>
          <div>
            <b>{t('unified')}</b>
            <span>
              {t('source')} {tx(room.source)}
            </span>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
