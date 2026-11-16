import { AnimatePresence } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useT } from '../i18n'
import { useStore } from '../store'
import { PEOPLE, type Person } from '../data/people'
import { photo } from '../data/photos'
import { SwipeDeck, type DeckHandle, type Dir } from '../components/SwipeDeck'
import { PersonCardInfo } from '../components/Cards'
import { PersonDetail } from '../components/Details'
import { RadarEmpty } from '../components/Empty'
import { IconBell, IconSliders, LogoMark } from '../components/icons'

export function Discover() {
  const { state, set, toast } = useStore()
  const { t } = useT()
  const deck = useRef<DeckHandle>(null)
  const [detail, setDetail] = useState<Person | null>(null)
  const [round, setRound] = useState(0)

  const getId = useCallback((p: Person) => p.id, [])
  const getPhotos = useCallback((p: Person) => p.photos.map((x) => photo(x.key, 700)), [])

  const onSwipe = (p: Person, dir: Dir) => {
    if (dir !== 'left' && p.likesYou) {
      // let the card leave first, then celebrate
      setTimeout(() => {
        set((s) => ({
          matches: [p.id, ...s.matches.filter((x) => x !== p.id)],
          chats: { ...s.chats, [p.id]: s.chats[p.id] ?? [{ from: 'them', text: p.hello }] },
          overlay: { type: 'match', personId: p.id },
        }))
      }, 380)
    } else if (dir === 'up') {
      toast({ text: t('superLikeSent') })
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <LogoMark size={30} />
          <span className="wordmark">roomix</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn muted" onClick={() => toast({ text: t('filterSoon') })} aria-label="notifications">
            <IconBell size={24} />
          </button>
          <button className="icon-btn muted" onClick={() => toast({ text: t('filterSoon') })} aria-label="filters">
            <IconSliders size={24} />
          </button>
        </div>
      </header>

      <SwipeDeck
        key={`${state.seed}-${round}`}
        ref={deck}
        items={PEOPLE}
        getId={getId}
        getPhotos={getPhotos}
        renderCard={(p, idx) => <PersonCardInfo person={p} photoIdx={idx} mine={state.answers} />}
        onSwipe={onSwipe}
        onInfo={setDetail}
        onBoost={() => toast({ text: t('boostOn') })}
        empty={
          <RadarEmpty
            avatar={photo('me', 200)}
            title={t('emptyPeople')}
            sub={t('emptyPeopleSub')}
            action={
              <button className="btn-outline" onClick={() => setRound((r) => r + 1)}>
                {t('restartDeck')}
              </button>
            }
          />
        }
      />

      <AnimatePresence>
        {detail && (
          <PersonDetail
            key={detail.id}
            person={detail}
            mine={state.answers}
            onClose={() => setDetail(null)}
            onAction={(d) => {
              setDetail(null)
              setTimeout(() => deck.current?.swipe(d), 260)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
