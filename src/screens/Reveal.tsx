import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { photo } from '../data/photos'
import type { Answers } from '../data/questions'
import { ChipList, useChips } from '../components/Cards'
import { LogoMark } from '../components/icons'

const MY_PHOTOS = ['me', 'me2', 'me3'] as const

export function MyCard({ answers, stagger = false }: { answers: Answers; stagger?: boolean }) {
  const { t } = useT()
  const [idx, setIdx] = useState(0)
  // compare with itself → no verdict marks on your own card
  const chips = useChips(answers, {})
  return (
    <div
      className="card my-card"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const step = e.clientX - r.left < r.width / 2 ? -1 : 1
        setIdx((i) => Math.min(MY_PHOTOS.length - 1, Math.max(0, i + step)))
      }}
    >
      {MY_PHOTOS.map((k, i) => (
        <div key={k} className="card-photo" style={{ backgroundImage: `url("${photo(k, 600)}")`, opacity: i === idx ? 1 : 0 }} />
      ))}
      <div className="card-bars">
        {MY_PHOTOS.map((k, i) => (
          <span key={k} className={i === idx ? 'on' : ''} />
        ))}
      </div>
      <div className="card-shade" />
      <div className="card-info">
        <div className="card-name-row">
          <h2>{t('me')}</h2>
        </div>
        <ChipList chips={chips(['sleep', 'shower', 'clean', 'food', 'guests', 'calls', 'pets', 'smoke', 'budget', 'area'])} stagger={stagger} />
      </div>
    </div>
  )
}

export function Reveal({ answers, onStart }: { answers: Answers; onStart: () => void }) {
  const { t } = useT()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1300)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="reveal">
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div key="load" className="reveal-loading" exit={{ opacity: 0, scale: 0.9 }}>
            <div className="radar">
              <span />
              <span />
              <span />
              <motion.div className="radar-center" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}>
                <LogoMark size={44} gradient={false} />
              </motion.div>
            </div>
            <p>{t('buildingCard')}</p>
          </motion.div>
        ) : (
          <motion.div key="card" className="reveal-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="reveal-card-wrap"
              initial={{ y: 80, scale: 0.8, rotate: -6, opacity: 0 }}
              animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <MyCard answers={answers} stagger />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              {t('cardReady')}
            </motion.h2>
            <motion.p className="reveal-ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35 }}>
              {t('cardReadySub')}
            </motion.p>
            <motion.button
              className="btn-grad"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
            >
              {t('startSwiping')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
