import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'motion/react'
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import { preload } from '../data/photos'
import { IconBolt, IconHeart, IconRewind, IconStar, IconX } from './icons'

export type Dir = 'left' | 'right' | 'up'
export type DeckHandle = { swipe: (d: Dir) => void; rewind: () => void }

type DeckProps<T> = {
  ref?: Ref<DeckHandle>
  items: T[]
  getId: (t: T) => string
  getPhotos: (t: T) => string[]
  renderCard: (t: T, photoIdx: number, isTop: boolean) => ReactNode
  /** called the moment a card is decided (before it finishes flying out) */
  onSwipe: (t: T, dir: Dir, index: number) => void
  onRewind?: (t: T) => void
  onInfo: (t: T) => void
  onIndexChange?: (i: number) => void
  empty: ReactNode
  onBoost?: () => void
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function SwipeDeck<T>(props: DeckProps<T>) {
  const { items, getId, getPhotos, renderCard, onSwipe, onRewind, onInfo, onIndexChange, empty, onBoost } = props
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState<string[]>([])
  const [history, setHistory] = useState<{ id: string; dir: Dir }[]>([])
  const [enter, setEnter] = useState<{ id: string; dir: Dir; n: number } | null>(null)
  const [pulse, setPulse] = useState<{ kind: Dir | 'rewind' | 'boost'; n: number } | null>(null)

  const indexRef = useRef(index)
  indexRef.current = index
  const historyRef = useRef(history)
  historyRef.current = history

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef(new Map<string, CardHandle>())
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const progress = useTransform(() => clamp01(Math.hypot(dragX.get(), dragY.get()) / 140))

  const byId = useMemo(() => new Map(items.map((it) => [getId(it), it])), [items, getId])

  useEffect(() => {
    onIndexChange?.(index)
    preload(items.slice(index, index + 3).flatMap(getPhotos))
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const decide = (id: string, dir: Dir) => {
    const i = indexRef.current
    const item = items[i]
    if (!item || getId(item) !== id) return
    indexRef.current = i + 1
    setIndex(i + 1)
    setLeaving((l) => [...l, id])
    setHistory((h) => [...h, { id, dir }])
    setPulse({ kind: dir, n: Date.now() })
    animate(dragX, 0, { duration: 0.2 })
    animate(dragY, 0, { duration: 0.2 })
    navigator.vibrate?.(8)
    onSwipe(item, dir, i)
  }

  const gone = (id: string) => setLeaving((l) => l.filter((x) => x !== id))

  const swipe = (dir: Dir) => {
    const item = items[indexRef.current]
    if (!item) return
    cardRefs.current.get(getId(item))?.fly(dir)
  }

  const rewind = () => {
    const last = historyRef.current[historyRef.current.length - 1]
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    setLeaving((l) => l.filter((x) => x !== last.id))
    indexRef.current = Math.max(0, indexRef.current - 1)
    setIndex((i) => Math.max(0, i - 1))
    setEnter({ id: last.id, dir: last.dir, n: Date.now() })
    setPulse({ kind: 'rewind', n: Date.now() })
    const item = byId.get(last.id)
    if (item) onRewind?.(item)
  }

  useImperativeHandle(props.ref, () => ({ swipe, rewind }))

  // keyboard control for presenting on a laptop: ← → ↑ and Backspace to rewind
  const keyRef = useRef({ swipe, rewind })
  keyRef.current = { swipe, rewind }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current
      if (!el || el.offsetParent === null || e.repeat) return
      if (document.querySelector('.sheet, .overlay, .chat') || (e.target as HTMLElement)?.tagName === 'INPUT') return
      const map: Record<string, () => void> = {
        ArrowLeft: () => keyRef.current.swipe('left'),
        ArrowRight: () => keyRef.current.swipe('right'),
        ArrowUp: () => keyRef.current.swipe('up'),
        Backspace: () => keyRef.current.rewind(),
      }
      const fn = map[e.key]
      if (fn) {
        e.preventDefault()
        fn()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = items.slice(index, index + 3).map((it, d) => ({ it, depth: d }))
  const leavingItems = leaving
    .map((id) => byId.get(id))
    .filter((x): x is T => !!x)
    .map((it) => ({ it, depth: -1 }))
  // DOM order = paint order: deepest first, flying cards last (on top)
  const stack = [...visible.slice().reverse(), ...leavingItems]
  const isEmpty = index >= items.length

  return (
    <div className="deck">
      <div className="deck-cards" ref={containerRef}>
        {isEmpty && <div className="deck-empty">{empty}</div>}
        {stack.map(({ it, depth }) => {
          const id = getId(it)
          return (
            <SwipeCard
              key={id}
              handleRef={(h) => {
                if (h) cardRefs.current.set(id, h)
                else cardRefs.current.delete(id)
              }}
              depth={depth}
              enter={enter && enter.id === id ? enter : null}
              dragX={dragX}
              dragY={dragY}
              progress={progress}
              containerRef={containerRef}
              photos={getPhotos(it)}
              render={(p, top) => renderCard(it, p, top)}
              onDecide={(dir) => decide(id, dir)}
              onGone={() => gone(id)}
              onInfo={() => onInfo(it)}
            />
          )
        })}
      </div>
      <ActionBar
        dragX={dragX}
        dragY={dragY}
        pulse={pulse}
        disabled={isEmpty}
        canRewind={history.length > 0}
        onRewind={rewind}
        onNope={() => swipe('left')}
        onSuper={() => swipe('up')}
        onLike={() => swipe('right')}
        onBoost={
          onBoost
            ? () => {
                setPulse({ kind: 'boost', n: Date.now() })
                onBoost()
              }
            : undefined
        }
      />
    </div>
  )
}

/* ───────────────────────── Card ───────────────────────── */

type CardHandle = { fly: (dir: Dir) => void }

type CardProps = {
  handleRef: Ref<CardHandle>
  depth: number
  enter: { dir: Dir; n: number } | null
  dragX: MotionValue<number>
  dragY: MotionValue<number>
  progress: MotionValue<number>
  containerRef: RefObject<HTMLDivElement | null>
  photos: string[]
  render: (photoIdx: number, isTop: boolean) => ReactNode
  onDecide: (dir: Dir) => void
  onGone: () => void
  onInfo: () => void
}

function SwipeCard(p: CardProps) {
  const { depth, dragX, dragY, progress, containerRef, photos } = p
  const isTop = depth === 0
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(depth <= 0 ? 1 : 0.94)
  const tilt = useMotionValue(0)
  const grabSign = useRef(1)
  const dragged = useRef(false)
  const flying = useRef(false)
  const token = useRef(0)
  const elRef = useRef<HTMLDivElement>(null)
  const [photoIdx, setPhotoIdx] = useState(0)

  // grabbing the bottom half rotates the other way, like holding a real card
  const rotate = useTransform(x, (v) => Math.max(-38, Math.min(38, v * 0.075 * grabSign.current)))
  const likeO = useTransform(x, [24, 110], [0, 1])
  const nopeO = useTransform(x, [-110, -24], [1, 0])
  const superO = useTransform(() => clamp01((-y.get() - 30) / 90) * (1 - clamp01(Math.abs(x.get()) / 90)))

  // the top card drives the shared drag values (buttons + next-card scale)
  useEffect(() => {
    if (!isTop) return
    const a = x.on('change', (v) => dragX.set(v))
    const b = y.on('change', (v) => dragY.set(v))
    return () => {
      a()
      b()
    }
  }, [isTop]) // eslint-disable-line react-hooks/exhaustive-deps

  // stack depth → scale
  useEffect(() => {
    if (depth < 0) return
    if (depth === 0) {
      animate(scale, 1, { type: 'spring', stiffness: 320, damping: 30 })
      return
    }
    if (depth === 1) {
      animate(scale, 0.94 + 0.06 * progress.get(), { duration: 0.2 })
      return progress.on('change', (v) => scale.set(0.94 + 0.06 * v))
    }
    scale.set(0.94)
  }, [depth]) // eslint-disable-line react-hooks/exhaustive-deps

  // rewind: come back from where it left
  useLayoutEffect(() => {
    if (!p.enter) return
    token.current++
    flying.current = false
    const rect = containerRef.current?.getBoundingClientRect()
    const W = rect?.width ?? 400
    const H = rect?.height ?? 700
    if (Math.abs(x.get()) < 1 && Math.abs(y.get()) < 1) {
      grabSign.current = 1
      if (p.enter.dir === 'up') y.set(-H * 1.3)
      else x.set((p.enter.dir === 'right' ? 1 : -1) * (W * 1.4))
    }
    animate(x, 0, { type: 'spring', stiffness: 260, damping: 26 })
    animate(y, 0, { type: 'spring', stiffness: 260, damping: 26 })
  }, [p.enter?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  const fly = (dir: Dir, vel?: { x: number; y: number }) => {
    if (flying.current) return
    flying.current = true
    const t = ++token.current
    const rect = containerRef.current?.getBoundingClientRect()
    const W = rect?.width ?? 400
    const H = rect?.height ?? 700
    p.onDecide(dir)

    let tx: number
    let ty: number
    let dur: number
    if (dir === 'up') {
      ty = -(H * 1.5)
      dur = vel ? Math.min(0.45, Math.max(0.22, Math.abs(ty - y.get()) / Math.max(-vel.y, 1700))) : 0.5
      tx = x.get() + (vel ? vel.x * dur * 0.5 : 0)
    } else {
      const s = dir === 'right' ? 1 : -1
      tx = s * (W * 1.55 + 120)
      dur = vel ? Math.min(0.42, Math.max(0.2, Math.abs(tx - x.get()) / Math.max(Math.abs(vel.x), 1300))) : 0.5
      ty = vel ? y.get() + vel.y * dur * 0.6 : y.get() - 60
    }
    // flick: ease-out continuing the finger's velocity; button: ease-in-out "throw"
    const ease: [number, number, number, number] = vel ? [0.15, 0.55, 0.35, 1] : [0.5, 0, 0.55, 1]
    animate(x, tx, { duration: dur, ease })
    animate(y, ty, { duration: dur, ease }).then(() => {
      if (t === token.current) p.onGone()
    })
  }

  useImperativeHandle(p.handleRef, () => ({ fly: (d) => fly(d) }))

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const W = rect?.width ?? 400
    const H = rect?.height ?? 700
    const ox = x.get()
    const oy = y.get()
    const { velocity: v } = info
    let dir: Dir | null = null
    const upish = -oy > Math.abs(ox) * 1.1
    if (upish && (oy < -H * 0.2 || v.y < -800)) dir = 'up'
    else if (ox > W * 0.3 || (v.x > 650 && ox > 30)) dir = 'right'
    else if (ox < -W * 0.3 || (v.x < -650 && ox < -30)) dir = 'left'

    if (dir) {
      fly(dir, v)
    } else {
      // snap back with a little overshoot
      animate(x, 0, { type: 'spring', stiffness: 420, damping: 24, velocity: v.x })
      animate(y, 0, { type: 'spring', stiffness: 420, damping: 24, velocity: v.y })
    }
  }

  const onTap = (e: MouseEvent | TouchEvent | PointerEvent) => {
    if (!isTop || dragged.current || flying.current) return
    const el = elRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const pt = 'clientX' in e ? e : (e as TouchEvent).changedTouches[0]
    const rx = (pt.clientX - r.left) / r.width
    const ry = (pt.clientY - r.top) / r.height
    if (ry > 0.68) {
      p.onInfo()
      return
    }
    const step = rx < 0.5 ? -1 : 1
    const next = photoIdx + step
    if (next < 0 || next >= photos.length) {
      // end of photos: Tinder-style 3D nudge toward the tapped side
      animate(tilt, [0, step * 7, 0], { duration: 0.32, ease: 'easeOut' })
      return
    }
    setPhotoIdx(next)
  }

  return (
    <motion.div
      ref={elRef}
      className={'card' + (isTop ? ' is-top' : '') + (depth < 0 ? ' is-leaving' : '')}
      style={{ x, y, rotate, scale, rotateY: tilt, transformPerspective: 1200, zIndex: depth < 0 ? 10 : 5 - depth }}
      drag={isTop}
      dragMomentum={false}
      dragElastic={1}
      onPointerDown={(e) => {
        dragged.current = false
        if (Math.abs(x.get()) < 4 && elRef.current) {
          const r = elRef.current.getBoundingClientRect()
          grabSign.current = e.clientY - r.top < r.height * 0.55 ? 1 : -1
        }
      }}
      onDragStart={() => {
        dragged.current = true
      }}
      onDragEnd={onDragEnd}
      onTap={onTap}
    >
      {photos.map((src, i) => (
        <div
          key={i}
          className="card-photo"
          style={{ backgroundImage: `url("${src}")`, opacity: i === photoIdx ? 1 : 0 }}
        />
      ))}
      {photos.length > 1 && (
        <div className="card-bars">
          {photos.map((_, i) => (
            <span key={i} className={i === photoIdx ? 'on' : ''} />
          ))}
        </div>
      )}
      {p.render(photoIdx, isTop)}
      <motion.div className="stamp stamp-like" style={{ opacity: likeO }}>LIKE</motion.div>
      <motion.div className="stamp stamp-nope" style={{ opacity: nopeO }}>NOPE</motion.div>
      <motion.div className="stamp stamp-super" style={{ opacity: superO }}>
        SUPER
        <br />
        LIKE
      </motion.div>
    </motion.div>
  )
}

/* ───────────────────────── Action bar ───────────────────────── */

type BarProps = {
  dragX: MotionValue<number>
  dragY: MotionValue<number>
  pulse: { kind: Dir | 'rewind' | 'boost'; n: number } | null
  disabled: boolean
  canRewind: boolean
  onRewind: () => void
  onNope: () => void
  onSuper: () => void
  onLike: () => void
  onBoost?: () => void
}

function ActionBar(b: BarProps) {
  const likeF = useTransform(b.dragX, [0, 110], [0, 1])
  const nopeF = useTransform(b.dragX, [-110, 0], [1, 0])
  const superF = useTransform(
    () => clamp01((-b.dragY.get() - 20) / 90) * (1 - clamp01(Math.abs(b.dragX.get()) / 90)),
  )
  const anyF = useTransform(() => Math.max(likeF.get(), nopeF.get(), superF.get()))
  const zero = useMotionValue(0)
  // the button you're dragging toward grows; the others fade back
  const dimNope = useTransform(() => 1 - 0.55 * Math.max(0, anyF.get() - nopeF.get()))
  const dimLike = useTransform(() => 1 - 0.55 * Math.max(0, anyF.get() - likeF.get()))
  const dimSuper = useTransform(() => 1 - 0.55 * Math.max(0, anyF.get() - superF.get()))
  const dimSmall = useTransform(() => 1 - 0.55 * anyF.get())

  return (
    <div className="action-bar">
      <RoundBtn kind="rewind" small fill={zero} dim={dimSmall} pulse={b.pulse} disabled={!b.canRewind} onClick={b.onRewind}>
        <IconRewind size={22} />
      </RoundBtn>
      <RoundBtn kind="left" fill={nopeF} dim={dimNope} pulse={b.pulse} disabled={b.disabled} onClick={b.onNope}>
        <IconX size={30} />
      </RoundBtn>
      <RoundBtn kind="up" small fill={superF} dim={dimSuper} pulse={b.pulse} disabled={b.disabled} onClick={b.onSuper}>
        <IconStar size={24} />
      </RoundBtn>
      <RoundBtn kind="right" fill={likeF} dim={dimLike} pulse={b.pulse} disabled={b.disabled} onClick={b.onLike}>
        <IconHeart size={30} />
      </RoundBtn>
      {b.onBoost && (
        <RoundBtn kind="boost" small fill={zero} dim={dimSmall} pulse={b.pulse} disabled={false} onClick={b.onBoost}>
          <IconBolt size={22} />
        </RoundBtn>
      )}
    </div>
  )
}

function RoundBtn(props: {
  kind: Dir | 'rewind' | 'boost'
  small?: boolean
  fill: MotionValue<number>
  dim: MotionValue<number>
  pulse: BarProps['pulse']
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  const { kind, small, fill, dim, pulse, disabled } = props
  const scale = useTransform(fill, (f) => 1 + f * 0.16)
  const pulsing = pulse && pulse.kind === kind ? pulse.n : null
  return (
    <motion.div className={`rbtn-wrap ${small ? 'sm' : 'lg'}`} style={{ scale, opacity: dim }}>
      <motion.button
        type="button"
        className={`rbtn rbtn-${kind}`}
        disabled={disabled}
        whileTap={{ scale: 0.84 }}
        transition={{ type: 'spring', stiffness: 600, damping: 22 }}
        onClick={props.onClick}
      >
        <motion.span className="rbtn-fill" style={{ opacity: fill }} />
        <span className="rbtn-icon">{props.children}</span>
        <motion.span className="rbtn-icon rbtn-icon-white" style={{ opacity: fill }}>
          {props.children}
        </motion.span>
        {pulsing && (
          <motion.span
            key={pulsing}
            className="rbtn-ripple"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </motion.div>
  )
}
