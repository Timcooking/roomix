import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { useStore } from '../store'
import { PEOPLE_BY_ID } from '../data/people'
import { photo } from '../data/photos'
import { ROOMS, type Room } from '../data/rooms'
import { SwipeDeck, type DeckHandle, type Dir } from '../components/SwipeDeck'
import { Avatar, RoomCardInfo, type PartnerStatus } from '../components/Cards'
import { RoomDetail } from '../components/Details'
import { RadarEmpty } from '../components/Empty'
import { IconRooms } from '../components/icons'

export function Rooms() {
  const { state, set } = useStore()
  const { t } = useT()
  const partner = state.partnerId ? PEOPLE_BY_ID[state.partnerId] : null

  if (!partner) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="brand">
            <IconRooms size={26} className="brand-icon" />
            <span className="topbar-title">{t('tabRooms')}</span>
          </div>
        </header>
        <div className="no-partner">
          <div className="no-partner-art">
            <motion.div className="np-card np-a" style={{ backgroundImage: `url("${photo('living1', 300)}")` }} animate={{ rotate: [-8, -11, -8] }} transition={{ repeat: Infinity, duration: 3 }} />
            <motion.div className="np-card np-b" style={{ backgroundImage: `url("${photo('bed2', 300)}")` }} animate={{ rotate: [7, 10, 7] }} transition={{ repeat: Infinity, duration: 3.4 }} />
            <span className="np-q np-q1">?</span>
            <span className="np-q np-q2">?</span>
          </div>
          <h3>{t('noPartnerTitle')}</h3>
          <p>{t('noPartnerSub')}</p>
          <button className="btn-grad" onClick={() => set(() => ({ tab: 'discover' }))}>
            {t('goDiscover')}
          </button>
        </div>
      </div>
    )
  }

  return <SharedDeck key={partner.id + state.seed} partnerId={partner.id} />
}

function SharedDeck({ partnerId }: { partnerId: string }) {
  const { state, set, toast } = useStore()
  const { t, tx } = useT()
  const partner = PEOPLE_BY_ID[partnerId]
  const deck = useRef<DeckHandle>(null)
  const [detail, setDetail] = useState<Room | null>(null)
  const [myIdx, setMyIdx] = useState(0)
  // the partner is "swiping" too, usually a card or two ahead of you
  const [pIdx, setPIdx] = useState(1)
  const [round, setRound] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPIdx((p) => (p < myIdx + 2 && p < ROOMS.length ? p + 1 : p))
    }, 2600)
    return () => clearInterval(id)
  }, [myIdx])

  const getId = useCallback((r: Room) => r.id, [])
  const getPhotos = useCallback((r: Room) => r.photos.map((x) => photo(x.key, 700)), [])
  const partnerPhoto = photo(partner.photos[0].key, 120)

  const statusOf = (r: Room): PartnerStatus => {
    const i = ROOMS.indexOf(r)
    return i < pIdx ? 'decided' : i === pIdx ? 'looking' : 'idle'
  }

  const onSwipe = (room: Room, dir: Dir, i: number) => {
    setPIdx((p) => Math.max(p, i + 1))
    const liked = dir !== 'left'
    if (liked && room.partnerLikes) {
      setTimeout(() => {
        set((s) => ({
          roomMatches: [{ roomId: room.id, partnerId }, ...s.roomMatches.filter((m) => m.roomId !== room.id)],
          overlay: { type: 'roomMatch', roomId: room.id, partnerId },
        }))
      }, 380)
    } else if (liked) {
      toast({
        avatar: partnerPhoto,
        tone: 'warn',
        text: t('partnerPassed', { name: partner.name, reason: room.partnerReason ? tx(room.partnerReason) : '…' }),
      })
    } else if (room.partnerLikes) {
      toast({
        avatar: partnerPhoto,
        text: t('partnerLikedYouPassed', { name: partner.name }),
        action: { label: t('undo'), onClick: () => deck.current?.rewind() },
      })
    }
  }

  const shownIdx = Math.min(pIdx + 1, ROOMS.length)

  return (
    <div className="page">
      <header className="topbar rooms-topbar">
        <div className="duo">
          <Avatar src={photo('me', 120)} size={36} />
          <Avatar src={partnerPhoto} size={36} className="duo-b" />
          <span className="online-dot" />
        </div>
        <div className="duo-text">
          <b>{t('roomsWith', { name: partner.name })}</b>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.small key={shownIdx} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>
              {t('partnerOnline', { n: shownIdx })}
            </motion.small>
          </AnimatePresence>
        </div>
      </header>

      <SwipeDeck
        key={round}
        ref={deck}
        items={ROOMS}
        getId={getId}
        getPhotos={getPhotos}
        onIndexChange={setMyIdx}
        renderCard={(r, idx) => (
          <RoomCardInfo
            room={r}
            photoIdx={idx}
            partnerName={partner.name}
            partnerPhoto={partnerPhoto}
            status={statusOf(r)}
            mine={state.answers}
            partnerAnswers={partner.answers}
          />
        )}
        onSwipe={onSwipe}
        onInfo={setDetail}
        empty={
          <RadarEmpty
            avatar={partnerPhoto}
            title={t('emptyRooms')}
            sub={t('emptyRoomsSub')}
            action={
              <button
                className="btn-outline"
                onClick={() => {
                  setPIdx(1)
                  setRound((r) => r + 1)
                }}
              >
                {t('restartDeck')}
              </button>
            }
          />
        }
      />

      <AnimatePresence>
        {detail && (
          <RoomDetail
            key={detail.id}
            room={detail}
            mine={state.answers}
            partner={partner}
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
