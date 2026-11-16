import { LANGS, useT, type Lang } from '../i18n'
import { useStore } from '../store'
import { QUESTIONS, optionOf } from '../data/questions'
import { MyCard } from './Reveal'
import { IconGlobe, LogoMark } from '../components/icons'

export function Me({ onLang, onRetake, onReset }: { onLang: (l: Lang) => void; onRetake: () => void; onReset: () => void }) {
  const { state } = useStore()
  const { t, tx, lang } = useT()
  return (
    <div className="page me">
      <header className="topbar">
        <div className="brand">
          <LogoMark size={30} />
          <span className="wordmark">roomix</span>
        </div>
      </header>
      <div className="me-scroll">
        <h4 className="section-title">{t('myCard')}</h4>
        <div className="me-card">
          <MyCard answers={state.answers} />
        </div>

        <h4 className="section-title">{t('myAnswers')}</h4>
        <div className="me-list">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="me-row">
              <span>{tx(q.title)}</span>
              <b>
                {(state.answers[q.id] ?? [])
                  .map((id) => optionOf(q.id, id))
                  .filter(Boolean)
                  .map((o) => `${o!.emoji} ${tx(o!.chip)}`)
                  .join(' / ') || '—'}
              </b>
            </div>
          ))}
        </div>

        <h4 className="section-title">
          <IconGlobe size={15} /> {t('language')}
        </h4>
        <div className="seg">
          {LANGS.map((l) => (
            <button key={l.id} className={l.id === lang ? 'on' : ''} onClick={() => onLang(l.id)}>
              {l.id === 'sc' ? '简体中文' : l.id === 'tc' ? '繁體中文' : 'English'}
            </button>
          ))}
        </div>

        <div className="me-actions">
          <button className="btn-outline" onClick={onRetake}>
            {t('editAnswers')}
          </button>
          <button className="btn-text-danger" onClick={onReset}>
            {t('resetDemo')}
          </button>
        </div>
      </div>
    </div>
  )
}
