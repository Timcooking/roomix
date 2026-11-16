import { motion } from 'motion/react'
import { LANGS, useT, type Lang } from '../i18n'
import { photo, type PhotoKey } from '../data/photos'
import { LogoMark } from '../components/icons'

const COLS: PhotoKey[][] = [
  ['kaylee', 'living1', 'cat', 'marcus', 'hkNightPeak', 'bed1'],
  ['living3', 'wing', 'dumplings', 'hkIsland', 'chloe', 'kitchen1'],
  ['ethan', 'bed2', 'mika', 'living2', 'tom', 'hkHarbourNight'],
]

export function Welcome({ onStart, onLang }: { onStart: () => void; onLang: (l: Lang) => void }) {
  const { t, lang } = useT()
  return (
    <div className="welcome">
      <div className="welcome-wall" aria-hidden>
        {COLS.map((col, ci) => (
          <div key={ci} className={'wall-col wall-col-' + ci}>
            {[...col, ...col].map((k, i) => (
              <div key={i} className="wall-tile" style={{ backgroundImage: `url("${photo(k, 200)}")` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="welcome-scrim" />

      <div className="welcome-top">
        <div className="lang-pills">
          {LANGS.map((l) => (
            <button key={l.id} className={l.id === lang ? 'on' : ''} onClick={() => onLang(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="welcome-center">
        <motion.div
          className="welcome-logo"
          initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        >
          <LogoMark size={64} gradient={false} />
          <span>roomix</span>
        </motion.div>
        <motion.h1 key={lang + 'h'} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {t('tagline')}
        </motion.h1>
        <motion.p key={lang + 'p'} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {t('taglineSub')}
        </motion.p>
      </div>

      <motion.div className="welcome-bottom" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <motion.button className="btn-white" whileTap={{ scale: 0.96 }} onClick={onStart}>
          {t('start')}
        </motion.button>
        <small>{t('welcomeLegal')}</small>
      </motion.div>
    </div>
  )
}
