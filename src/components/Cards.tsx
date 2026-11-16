import { motion } from 'motion/react'
import { useT } from '../i18n'
import type { Person } from '../data/people'
import { Q, compareAnswer, compatibility, optionOf, type Answers, type QuestionId, type Verdict } from '../data/questions'
import { BUDGET_MAX, hkd, type Room } from '../data/rooms'
import { IconCalendar, IconCheck, IconInfo, IconPin, IconTrain, IconVerified, IconBag } from './icons'

export type Chip = { qid: QuestionId; emoji: string; label: string; verdict: Verdict | null }

export function useChips(answers: Answers, mine: Answers) {
  const { tx } = useT()
  return (qids: QuestionId[]): Chip[] =>
    qids.flatMap((qid) => {
      const ids = answers[qid] ?? []
      if (!ids.length) return []
      const verdict = compareAnswer(qid, mine[qid], ids)
      if (Q[qid].multi) {
        const labels = ids.map((id) => tx(optionOf(qid, id)!.chip)).join(' · ')
        return [{ qid, emoji: optionOf(qid, ids[0])!.emoji, label: labels, verdict }]
      }
      const opt = optionOf(qid, ids[0])
      return opt ? [{ qid, emoji: opt.emoji, label: tx(opt.chip), verdict }] : []
    })
}

export function ChipList({ chips, dark = true, stagger = false }: { chips: Chip[]; dark?: boolean; stagger?: boolean }) {
  return (
    <div className={'chips' + (dark ? ' chips-dark' : ' chips-light')}>
      {chips.map((c, i) => (
        <motion.span
          key={c.qid}
          className={'chip' + (c.verdict ? ` chip-${c.verdict}` : '')}
          initial={stagger ? { opacity: 0, scale: 0.6, y: 8 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={stagger ? { delay: 0.35 + i * 0.09, type: 'spring', stiffness: 500, damping: 24 } : undefined}
        >
          <span className="chip-emoji">{c.emoji}</span>
          {c.label}
          {c.verdict === 'same' && <IconCheck size={13} className="chip-mark" />}
        </motion.span>
      ))}
    </div>
  )
}

export function Avatar({ src, size = 40, ring = false, className = '' }: { src: string; size?: number; ring?: boolean; className?: string }) {
  return (
    <span
      className={'avatar' + (ring ? ' avatar-ring' : '') + (className ? ' ' + className : '')}
      style={{ width: size, height: size, backgroundImage: `url("${src}")` }}
    />
  )
}

export function CompatRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="compat-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.22)" strokeWidth={4} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-g)"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand-1)" />
            <stop offset="1" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
      </svg>
      <b>{value}</b>
    </span>
  )
}

/* ───────── Roommate card overlay ───────── */

export function PersonCardInfo({ person, photoIdx, mine }: { person: Person; photoIdx: number; mine: Answers }) {
  const { t, tx } = useT()
  const chips = useChips(person.answers, mine)
  const score = compatibility(mine, person.answers)
  const caption = person.photos[photoIdx]?.caption

  return (
    <>
      <div className="card-shade" />
      {caption && (
        <motion.div key={photoIdx} className="card-caption" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          {tx(caption)}
        </motion.div>
      )}
      <div className="compat-pill">
        <CompatRing value={score} size={34} />
        <span>{t('compat')}</span>
      </div>
      <div className="card-info">
        <div className="card-name-row">
          <h2>
            {person.name}
            <span className="age">{person.age}</span>
            {person.verified && <IconVerified size={24} className="verified" />}
          </h2>
          <IconInfo size={30} className="card-info-btn" />
        </div>
        {photoIdx === 0 && (
          <>
            <div className="card-line">
              <IconBag size={15} /> {tx(person.job)}
            </div>
            <div className="card-line">
              <IconPin size={15} /> {t('livesIn')} {tx(person.livesIn)}
            </div>
            <ChipList chips={chips(['sleep', 'shower', 'food', 'calls', 'pets'])} />
          </>
        )}
        {photoIdx === 1 && <p className="card-bio">{tx(person.bio)}</p>}
        {photoIdx >= 2 && (
          <>
            <div className="card-line">
              <IconCalendar size={15} /> {t('moveIn')} {tx(person.moveIn)}
            </div>
            <ChipList chips={chips(['clean', 'guests', 'smoke', 'budget', 'area'])} />
          </>
        )}
      </div>
    </>
  )
}

/* ───────── Room card overlay ───────── */

export type PartnerStatus = 'looking' | 'decided' | 'idle'

export function budgetFits(room: Room, a: Answers, b?: Answers) {
  const share = room.rent / 2
  const maxA = BUDGET_MAX[a.budget?.[0] ?? 'gt12']
  const maxB = BUDGET_MAX[b?.budget?.[0] ?? 'gt12']
  // small tolerance: HK$9,250 still "fits" a HK$9k budget
  return share <= Math.min(maxA, maxB) * 1.05
}

export function RoomCardInfo({
  room,
  photoIdx,
  partnerName,
  partnerPhoto,
  status,
  mine,
  partnerAnswers,
}: {
  room: Room
  photoIdx: number
  partnerName: string
  partnerPhoto: string
  status: PartnerStatus
  mine: Answers
  partnerAnswers?: Answers
}) {
  const { t, tx } = useT()
  const caption = room.photos[photoIdx]?.caption
  const fits = budgetFits(room, mine, partnerAnswers)
  return (
    <>
      <div className="card-shade" />
      <div className="room-top">
        <div className={'partner-chip partner-' + status}>
          <span className="avatar" style={{ backgroundImage: `url("${partnerPhoto}")` }} />
          <span className="partner-chip-text">
            {partnerName}
            <small>
              {status === 'looking' ? (
                <>
                  {t('partnerLooking')}
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                </>
              ) : status === 'decided' ? (
                <>
                  <IconCheck size={11} /> {t('partnerDecided')}
                </>
              ) : (
                '·'
              )}
            </small>
          </span>
        </div>
        <div className="source-pill">
          {t('source')} <b>{tx(room.source)}</b>
        </div>
      </div>
      {caption && (
        <motion.div key={photoIdx} className="card-caption room-caption" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          {tx(caption)}
        </motion.div>
      )}
      <div className="card-info">
        <div className="card-name-row">
          <h2 className="room-price">
            {hkd(room.rent)}
            <span className="per">{t('perMonth')}</span>
          </h2>
          <IconInfo size={30} className="card-info-btn" />
        </div>
        <div className="room-split">
          {t('each')} <b>{hkd(Math.round(room.rent / 2))}</b>
          {t('eachSuffix')}
        </div>
        <div className="room-title">{tx(room.title)}</div>
        {photoIdx === 0 ? (
          <>
            <div className="card-line">
              {room.beds}
              {tx({ sc: ' 房', tc: ' 房', en: ' bd' })} · {room.baths}
              {tx({ sc: ' 浴', tc: ' 廁', en: ' ba' })} · {room.sizeFt}
              {tx({ sc: ' 呎', tc: ' 呎', en: ' ft²' })} · {tx(room.floor)}
            </div>
            <div className="chips chips-dark">
              {room.features.map((f, i) => (
                <span className="chip" key={i}>
                  <span className="chip-emoji">{f.emoji}</span>
                  {tx(f.label)}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="card-line">
              <IconTrain size={15} /> {tx(room.mtr)}
            </div>
            <div className="card-line">
              <IconCalendar size={15} /> {t('moveIn')} {tx(room.available)}
            </div>
            <div className="chips chips-dark">
              <span className={'chip ' + (fits ? 'chip-same' : 'chip-differ')}>
                <span className="chip-emoji">{fits ? '✅' : '⚠️'}</span>
                {fits ? t('fitsBoth') : t('overBudget')}
              </span>
              <span className="chip chip-unified">
                <span className="chip-emoji">🧩</span>
                {t('unified')}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
