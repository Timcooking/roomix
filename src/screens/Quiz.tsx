import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useT } from '../i18n'
import { DEMO_ANSWERS, QUESTIONS, type Answers } from '../data/questions'
import { IconBack, IconCheck } from '../components/icons'

export function Quiz({ onDone, onExit }: { onDone: (a: Answers) => void; onExit: () => void }) {
  const { t, tx } = useT()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<Answers>({})
  const advancing = useRef(false)
  const q = QUESTIONS[step]
  const picked = answers[q.id] ?? []
  const currentQ = useRef(q.id)
  currentQ.current = q.id

  const go = (next: number, a = answers) => {
    advancing.current = false
    if (next < 0) return onExit()
    if (next >= QUESTIONS.length) return onDone(a)
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const pick = (qid: string, oid: string) => {
    // taps landing on the outgoing question while it animates away are ignored
    if (advancing.current || qid !== currentQ.current) return
    if (q.multi) {
      let next = picked.includes(oid) ? picked.filter((x) => x !== oid) : [...picked, oid]
      // "anywhere" is exclusive
      if (oid === 'any') next = next.includes('any') ? ['any'] : []
      else next = next.filter((x) => x !== 'any')
      setAnswers({ ...answers, [q.id]: next })
      return
    }
    const a = { ...answers, [q.id]: [oid] }
    setAnswers(a)
    // single choice: auto-advance after the selection animates in
    advancing.current = true
    setTimeout(() => go(step + 1, a), 320)
  }

  return (
    <div className="quiz">
      <div className="quiz-progress">
        <motion.div className="quiz-progress-bar" animate={{ width: `${((step + (picked.length ? 1 : 0)) / QUESTIONS.length) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
      </div>
      <div className="quiz-top">
        <button className="icon-btn" onClick={() => go(step - 1)} aria-label="back">
          <IconBack size={26} />
        </button>
        <button className="link-btn" onClick={() => onDone(DEMO_ANSWERS)}>
          {t('skipDemo')}
        </button>
      </div>

      <div className="quiz-body">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={q.id}
            className="quiz-q"
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1, pointerEvents: 'auto' as const },
              exit: (d: number) => ({ x: d * -60, opacity: 0, pointerEvents: 'none' as const }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="quiz-step">{t('stepOf', { n: step + 1 })}</div>
            <h1>{tx(q.title)}</h1>
            {q.sub && <p className="quiz-sub">{tx(q.sub)}</p>}
            {q.multi && <p className="quiz-hint">{t('multiHint')}</p>}
            <div className="quiz-options">
              {q.options.map((o, i) => {
                const on = picked.includes(o.id)
                return (
                  <motion.button
                    key={o.id}
                    className={'quiz-opt' + (on ? ' on' : '')}
                    onClick={() => pick(q.id, o.id)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.045 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="quiz-emoji">{o.emoji}</span>
                    <span className="quiz-label">{tx(o.label)}</span>
                    <span className="quiz-check">{on && <IconCheck size={16} />}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="quiz-bottom">
        <motion.button
          className="btn-grad"
          disabled={!picked.length}
          whileTap={{ scale: 0.97 }}
          onClick={() => go(step + 1)}
        >
          {t('continue')}
        </motion.button>
      </div>
    </div>
  )
}
