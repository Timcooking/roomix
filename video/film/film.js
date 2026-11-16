/* Roomix intro film. Everything on screen is a pure function of time t (seconds),
   so the renderer can step frame by frame: window.__film(t, pointer, dark).

   Query string: ?aspect=h|v  &lang=en|zh  (&ui=sc|tc|en  language used inside the phone mockup) */

const Q = new URLSearchParams(location.search)
const V = Q.get('aspect') === 'v'
const CN = Q.get('lang') === 'zh'
const UI = Q.get('ui') || (CN ? 'sc' : 'en')
document.body.classList.add(V ? 'v' : 'h', `ui-${UI}`)
document.documentElement.lang = UI === 'en' ? 'en' : UI === 'tc' ? 'zh-Hant' : 'zh-Hans'
const W = V ? 1080 : 1920
const H = V ? 1920 : 1080

/* ───────── easing ───────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const prog = (t, a, d) => clamp((t - a) / d)
const outCubic = (x) => 1 - Math.pow(1 - x, 3)
const inCubic = (x) => x * x * x
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const outBack = (x) => {
  const c = 1.55
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)
}

const LOGO_PATH =
  'M10.6 2.55a2.3 2.3 0 0 1 2.8 0l7.2 5.6c.56.44.9 1.12.9 1.83v9.27A2.75 2.75 0 0 1 18.75 22H5.25A2.75 2.75 0 0 1 2.5 19.25V9.98c0-.71.34-1.39.9-1.83l7.2-5.6ZM12 18.7c.2 0 4.6-2.7 4.6-5.8a2.45 2.45 0 0 0-4.6-1.2 2.45 2.45 0 0 0-4.6 1.2c0 3.1 4.4 5.8 4.6 5.8Z'
const logoHTML = (size = 150) =>
  `<div class="logo" style="font-size:${size}px"><svg viewBox="0 0 24 24"><path fill="#fff" fill-rule="evenodd" d="${LOGO_PATH}"/></svg><span>roomix</span></div>`

/* ───────── script ─────────
   Each line: { t, size, text | html, item, gap }.  *words* get the brand gradient.
   Chinese has no word spacing, so it reveals per 2 characters instead. */
const n = (k) => `<span class="num">${k}</span>`

const EN = [
  { t0: 0, t1: 5.8, at: 'center', lines: [
    { t: 0.3, size: 'm', text: 'In Hong Kong,' },
    { t: 0.8, size: 'l', text: 'finding a roommate' },
    { t: 1.3, size: 'l', text: 'is more awkward than' },
    { t: 2.0, size: 'xl', text: 'finding a *fwb.*' },
  ] },
  { t0: 5.8, t1: 8.5, at: 'side', lines: [{ t: 6.0, size: 'l', text: 'You post in the group chat.' }] },
  { t0: 8.5, t1: 12.2, at: 'side', lines: [
    { t: 8.6, size: 'm', text: '…and still end up with someone who' },
    { t: 9.3, size: 'l', text: '*showers at 6 AM*' },
    { t: 10.1, size: 'l', text: 'and *eats your dumplings.*' },
  ] },
  { t0: 12.2, t1: 13.7, at: 'center', lines: [{ t: 12.35, size: 'xl', text: 'Have you used *Tinder?*' }] },
  { t0: 13.7, t1: 15.2, at: 'center', lines: [
    { t: 13.75, size: 'm', text: "That's it." },
    { t: 13.95, html: logoHTML(150), pop: true },
  ] },
  { t0: 15.4, t1: 23.9, at: 'side', lines: [
    { t: 15.6, size: 'l', text: 'Answer *ten questions.*' },
    { t: 16.3, size: 'm', text: 'Sleep. Showers. Guests.' },
    { t: 16.7, size: 'm', text: 'Pets. Rent. Your dumplings.' },
  ] },
  { t0: 24.0, t1: 27.4, at: 'side', lines: [
    { t: 24.2, size: 'l', text: "You don't ask how they look." },
    { t: 25.1, size: 'l', text: '*But you care.*', gap: true },
  ] },
  { t0: 27.4, t1: 30.6, at: 'side', lines: [
    { t: 27.6, size: 'l', text: "You don't ask if they video-call a long-distance partner every night." },
    { t: 28.8, size: 'l', text: '*But you care.*', gap: true },
  ] },
  { t0: 30.6, t1: 33.4, at: 'side', lines: [
    { t: 30.8, size: 'l', text: "Now it's all" },
    { t: 31.2, size: 'xl', text: '*on the card.*' },
  ] },
  { t0: 33.4, t1: 39.2, at: 'side', lines: [
    { t: 33.6, size: 'xl', text: 'Then you *swipe.*' },
    { t: 34.3, size: 'm', text: 'Every habit that matters,' },
    { t: 34.6, size: 'm', text: 'right there on the card.' },
  ] },
  { t0: 39.2, t1: 42.6, at: 'side', lines: [{ t: 39.4, size: 'l', text: 'Once two people *match…*' }] },
  { t0: 42.6, t1: 47.0, at: 'side', lines: [
    { t: 42.8, size: 'l', text: '…they swipe again.' },
    { t: 43.4, size: 'xl', text: '*Together.*' },
    { t: 44.0, size: 'm', text: 'One shared deck of rooms.', gap: true },
  ] },
  { t0: 47.0, t1: 52.2, at: 'side', lines: [
    { t: 47.2, size: 'l', text: "It's only a match" },
    { t: 47.6, size: 'l', text: 'when you *both* swipe right.' },
  ] },
  { t0: 52.6, t1: 56.0, at: 'center', lines: [
    { t: 52.8, size: 'l', text: 'So how does Roomix' },
    { t: 53.1, size: 'l', text: 'make money?' },
    { t: 54.2, size: 'xl', text: '*Three ways.*', gap: true },
  ] },
  { t0: 56.0, t1: 62.0, at: 'center', lines: [
    { t: 56.2, size: 'l', html: `${n(1)}Users pay <span class="acc">2%</span> of rent.` },
    { t: 56.6, size: 'm', text: 'Unnoticeable. Six months, max.' },
    { t: 57.3, item: '📝', text: 'We handle the tenancy agreement.' },
    { t: 57.9, item: '🔎', text: 'Room nothing like the listing? We take action.' },
    { t: 58.5, item: '🤝', text: "Roommate didn't work out? Refund once a new contract is uploaded." },
  ] },
  { t0: 62.0, t1: 66.6, at: 'center', lines: [
    { t: 62.2, size: 'l', text: "They don't have to pay us." },
    { t: 62.9, size: 'm', text: "They could sign privately. We'd never know." },
    { t: 64.0, size: 'm', text: "It's like Xianyu — the deal can happen outside,", gap: true },
    { t: 64.9, size: 'xl', text: 'and most people *still don’t.*' },
  ] },
  { t0: 66.6, t1: 71.0, at: 'top', lines: [
    { t: 66.8, size: 'l', html: `${n(2)}Platforms pay to list in our deck.` },
    { t: 67.3, size: 'm', text: 'Every listing we can find, unified into one format.' },
  ] },
  { t0: 71.0, t1: 74.6, at: 'top', lines: [
    { t: 71.2, size: 'l', html: `${n(3)}Add-ons.` },
    { t: 71.5, size: 'm', text: 'Everything you need once you’ve matched.' },
  ] },
]

// 简体中文：换成大众更能接受的说法（不提 fwb / Tinder）
const ZH = [
  { t0: 0, t1: 5.8, at: 'center', lines: [
    { t: 0.3, size: 'm', text: '在香港，' },
    { t: 0.8, size: 'l', text: '找一个靠谱室友' },
    { t: 1.4, size: 'l', text: '比找对象还难。' },
  ] },
  { t0: 5.8, t1: 8.5, at: 'side', lines: [{ t: 6.0, size: 'l', text: '群里发一条消息，' }] },
  { t0: 8.5, t1: 12.2, at: 'side', lines: [
    { t: 8.6, size: 'm', text: '最后来的人，' },
    { t: 9.2, size: 'l', text: '早上 6 点*洗澡*' },
    { t: 10.1, size: 'l', text: '还*吃你的饺子。*' },
  ] },
  { t0: 12.2, t1: 13.7, at: 'center', lines: [{ t: 12.35, size: 'xl', text: '你用过*交友软件*吗？' }] },
  { t0: 13.7, t1: 15.2, at: 'center', lines: [
    { t: 13.75, size: 'l', text: '就是*左右滑*那种。' },
    { t: 14.15, html: logoHTML(150), pop: true },
  ] },
  { t0: 15.4, t1: 23.9, at: 'side', lines: [
    { t: 15.6, size: 'l', text: '回答*十个问题。*' },
    { t: 16.3, size: 'm', text: '作息、洗澡时间、访客、' },
    { t: 16.8, size: 'm', text: '宠物、预算，还有你的饺子。' },
  ] },
  { t0: 24.0, t1: 27.4, at: 'side', lines: [
    { t: 24.2, size: 'l', text: '你不会问对方长什么样，' },
    { t: 25.1, size: 'l', text: '*但你很在意。*', gap: true },
  ] },
  { t0: 27.4, t1: 30.6, at: 'side', lines: [
    { t: 27.6, size: 'l', text: '你不会问对方是不是每晚都和异地的另一半视频，' },
    { t: 28.9, size: 'l', text: '*但你很在意。*', gap: true },
  ] },
  { t0: 30.6, t1: 33.4, at: 'side', lines: [
    { t: 30.8, size: 'l', text: '现在，这些都写在' },
    { t: 31.3, size: 'xl', text: '*卡片上。*' },
  ] },
  { t0: 33.4, t1: 39.2, at: 'side', lines: [
    { t: 33.6, size: 'xl', text: '然后*开始滑。*' },
    { t: 34.3, size: 'm', text: '所有你在意的习惯，' },
    { t: 34.6, size: 'm', text: '都写在卡片上。' },
  ] },
  { t0: 39.2, t1: 42.6, at: 'side', lines: [{ t: 39.4, size: 'l', text: '两个人*配对成功*之后…' }] },
  { t0: 42.6, t1: 47.0, at: 'side', lines: [
    { t: 42.8, size: 'l', text: '…再滑一次。' },
    { t: 43.4, size: 'xl', text: '*一起滑。*' },
    { t: 44.0, size: 'm', text: '同一组房源，同一个卡组。', gap: true },
  ] },
  { t0: 47.0, t1: 52.2, at: 'side', lines: [
    { t: 47.2, size: 'l', text: '两个人都右滑，' },
    { t: 47.6, size: 'l', text: '才算是*真的配上了。*' },
  ] },
  { t0: 52.6, t1: 56.0, at: 'center', lines: [
    { t: 52.8, size: 'l', text: '那 Roomix' },
    { t: 53.1, size: 'l', text: '怎么赚钱？' },
    { t: 54.2, size: 'xl', text: '*三种方式。*', gap: true },
  ] },
  { t0: 56.0, t1: 62.0, at: 'center', lines: [
    { t: 56.2, size: 'l', html: `${n(1)}用户付租金的 <span class="acc">2%</span>。` },
    { t: 56.6, size: 'm', text: '几乎感觉不到。最多收六个月。' },
    { t: 57.3, item: '📝', text: '租约我们来处理。' },
    { t: 57.9, item: '🔎', text: '房子和照片不一样？我们来解决。' },
    { t: 58.5, item: '🤝', text: '室友合不来？上传新合约后退款。' },
  ] },
  { t0: 62.0, t1: 66.6, at: 'center', lines: [
    { t: 62.2, size: 'l', text: '他们也可以不付钱。' },
    { t: 62.9, size: 'm', text: '私下签约，我们根本不会知道。' },
    { t: 64.0, size: 'm', text: '就像二手交易平台——交易可以在平台外发生，', gap: true },
    { t: 64.9, size: 'xl', text: '但大多数人*还是不会。*' },
  ] },
  { t0: 66.6, t1: 71.0, at: 'top', lines: [
    { t: 66.8, size: 'l', html: `${n(2)}平台付费，把房源放进我们的卡组。` },
    { t: 67.3, size: 'm', text: '我们能找到的房源，全部统一成一种格式。' },
  ] },
  { t0: 71.0, t1: 74.6, at: 'top', lines: [
    { t: 71.2, size: 'l', html: `${n(3)}增值服务。` },
    { t: 71.5, size: 'm', text: '配对成功之后，你需要的一切。' },
  ] },
]

const BLOCKS = CN ? ZH : EN

/* ───────── on-screen copy (captions, chat, visuals) ───────── */
const TXT = {
  en: {
    tagline: 'Swipe for a roommate.<br>Then swipe for a room.',
    group: 'HK Flatshare Group',
    members: '2,481 members',
    rcard: '<b>HK$17,600<small style="display:inline;font-size:20px"> /mo</small></b><small>Sai Ying Pun · 2 bd · 460 ft²</small><span>🧩 Unified by Roomix</span>',
    photoTile: 'LISTING',
    photoTile2: 'HOT!! 🔥 MUST SEE',
    addons: ['Cleaning', 'Moving', 'Internet', 'Insurance'],
    chat: [
      { t: 6.1, name: 'Jason', text: 'Room in Mong Kok, $6.5k. DM 🙏' },
      { t: 6.7, name: 'Vivian', text: 'Anyone need a flatmate in Sai Ying Pun??' },
      { t: 7.3, name: 'Ken', text: 'still available?' },
      { t: 7.9, me: true, text: "Me! I'm interested 🙋" },
      { t: 9.4, name: 'Alex · your roommate', text: 'btw I shower at 6 AM 🚿 hope that’s ok', warn: true },
      { t: 10.2, me: true, text: 'Alex… did you eat my dumplings?? 🥟' },
    ],
  },
  zh: {
    tagline: '先滑到一个室友，<br>再一起滑到一间房。',
    group: '香港找室友群',
    members: '2,481 位成员',
    rcard: '<b>HK$17,600<small style="display:inline;font-size:20px"> /月</small></b><small>西营盘 · 2 房 · 460 呎</small><span>🧩 Roomix 统一格式</span>',
    photoTile: '房源照片',
    photoTile2: '超值！！🔥 必看',
    addons: ['清洁', '搬家', '网络', '保险'],
    chat: [
      { t: 6.1, name: 'Jason', text: '旺角有房，$6,500，私聊 🙏' },
      { t: 6.7, name: 'Vivian', text: '西营盘有人找室友吗？？' },
      { t: 7.3, name: 'Ken', text: '还有吗？' },
      { t: 7.9, me: true, text: '我我我！我有兴趣 🙋' },
      { t: 9.4, name: 'Alex · 你的室友', text: '对了，我早上 6 点洗澡 🚿 没问题吧', warn: true },
      { t: 10.2, me: true, text: 'Alex……我的饺子是你吃的吗？？🥟' },
    ],
  },
}
const T = CN ? TXT.zh : TXT.en

/* ───────── build DOM ───────── */
const layer = document.getElementById('layer')
const el = (tag, cls, html) => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html != null) e.innerHTML = html
  return e
}

function wordsHTML(text) {
  // *accent* spans can cover several words
  let acc = false
  return text
    .split(' ')
    .map((w, i, arr) => {
      const open = w.startsWith('*')
      if (open) acc = true
      const close = w.endsWith('*')
      const clean = w.replace(/\*/g, '')
      const html = `<span class="w${acc ? ' acc' : ''}">${clean}${i < arr.length - 1 ? ' ' : ''}</span>`
      if (close) acc = false
      return html
    })
    .join('')
}

/** Chinese has no spaces: one reveal unit per 2 characters, keeping *accent* runs together */
function zhUnitsHTML(text) {
  const segs = []
  let buf = ''
  let acc = false
  for (const ch of text) {
    if (ch === '*') {
      if (buf) segs.push({ s: buf, acc })
      buf = ''
      acc = !acc
      continue
    }
    buf += ch
  }
  if (buf) segs.push({ s: buf, acc })
  const units = []
  for (const { s, acc: a } of segs) {
    const step = 2
    for (let i = 0; i < s.length; i += step) units.push({ s: s.slice(i, i + step), acc: a })
  }
  return units.map((u, i) => `<span class="w${u.acc ? ' acc' : ''}">${u.s}${i < units.length - 1 ? '' : ''}</span>`).join('')
}

for (const b of BLOCKS) {
  b.el = el('div', 'block ' + b.at)
  b.parts = []
  for (const l of b.lines) {
    let node
    if (l.item) {
      node = el('div', 'item', `<span class="ic">${l.item}</span><span>${l.text}</span>`)
      b.parts.push({ node, t: l.t, kind: 'item' })
    } else if (l.html) {
      node = el('div', l.size ? `line s-${l.size}` : 'line', l.html)
      b.parts.push({ node, t: l.t, kind: l.pop ? 'pop' : 'whole' })
    } else {
      node = el('div', `line s-${l.size}`, CN ? zhUnitsHTML(l.text) : wordsHTML(l.text))
      ;[...node.querySelectorAll('.w')].forEach((w, i) =>
        b.parts.push({ node: w, t: l.t + i * (CN ? 0.09 : 0.045), kind: 'word' }),
      )
    }
    if (l.gap) node.classList.add('gap')
    b.el.appendChild(node)
  }
  layer.appendChild(b.el)
}

const chat = el(
  'div',
  'chat',
  `<div class="chat-head"><span class="chat-ava">🏠</span><div>${T.group}<small>${T.members}</small></div></div><div class="chat-body"></div>`,
)
const chatBody = chat.querySelector('.chat-body')
for (const m of T.chat) {
  m.el = el('div', 'msg' + (m.me ? ' me' : '') + (m.warn ? ' warn' : ''), (m.name ? `<b>${m.name}</b>` : '') + m.text)
  chatBody.appendChild(m.el)
}
layer.appendChild(chat)

const unify = el('div', 'unify')
const tiles = [
  el('div', 'tile tile-ad', '<b>FLAT TO LET</b>MK 2-bed, 390ft²<br>$15,200 nego<br>no agent fee!!<br>call 9xxx xxxx'),
  el(
    'div',
    'tile tile-sheet',
    '<div><span>Area</span><span>Rent</span><span>Size</span></div>' +
      ['SYP|17,600|460', 'MK|15,200|390', 'WC|21,500|480', 'TKO|19,800|560', 'SW|16,800|400', 'TW|14,500|450', 'HMT|18,900|510', 'SSP|12,800|420']
        .map((r) => '<div>' + r.split('|').map((c) => `<span>${c}</span>`).join('') + '</div>')
        .join(''),
  ),
  el('div', 'tile tile-photo', `<i>${T.photoTile}</i><em>${T.photoTile2}</em>`),
]
tiles[2].style.backgroundImage = 'url("/photos/living3-sm.webp")'
const rcard = el('div', 'rcard', `<div>${T.rcard}</div>`)
rcard.style.backgroundImage = 'url("/photos/living1.webp")'
tiles.forEach((t) => unify.appendChild(t))
unify.appendChild(rcard)
layer.appendChild(unify)

const addons = el('div', 'addons')
addons.parts = []
for (const [i, label] of T.addons.entries()) {
  const glyph = ['🧹', '🚚', '📶', '🛡️'][i]
  const node = el('div', 'addon', `<i>${glyph}</i>${label}`)
  addons.appendChild(node)
  addons.parts.push({ el: node })
}
layer.appendChild(addons)

const wipe = el('div', 'wipe')
const endcard = el('div', 'endcard', `${logoHTML(170)}<div class="tag">${T.tagline}</div><div class="url">roomix-demo.mywhole.workers.dev</div>`)
layer.appendChild(wipe)
layer.appendChild(endcard)
const endParts = [...endcard.children]

const phone = document.getElementById('phone')
const pointer = document.getElementById('pointer')
const fade = document.getElementById('fade')
const glowA = document.querySelector('.glow-a')
const glowB = document.querySelector('.glow-b')

/* ───────── phone placement ───────── */
const PH = V ? { cx: 540, cy: 1180, s: 1.6 } : { cx: 1395, cy: 540, s: 1.08 }
function phoneState(t) {
  let dx = 0
  let dy = 0
  let rot = 0
  const enter = prog(t, 15.0, 0.85)
  const exit = prog(t, 52.1, 0.7)
  const k = outBack(enter)
  if (V) dy += (1 - k) * 1500
  else dx += (1 - k) * 950
  rot += (1 - k) * (V ? 6 : 10)
  const e = inCubic(exit)
  if (V) dy += e * 1600
  else dx += e * 1000
  rot -= e * 8
  const visible = enter > 0 && exit < 1
  return { x: PH.cx + dx, y: PH.cy + dy, rot, s: PH.s, visible }
}

/** where the 390x844 app screen sits on the stage (used by the renderer for input) */
window.__phoneMap = () => {
  const r = document.querySelector('.screen').getBoundingClientRect()
  return { left: r.left, top: r.top, scale: r.width / 390 }
}

/* ───────── per-frame ───────── */
const show = (e, on) => (e.style.display = on ? '' : 'none')

window.__film = (t, ptr, dark) => {
  glowA.style.transform = `translate(${W * 0.15 + Math.sin(t * 0.25) * 120 - 450}px, ${H * 0.25 + Math.cos(t * 0.2) * 90 - 450}px)`
  glowB.style.transform = `translate(${W * 0.8 + Math.cos(t * 0.22) * 140 - 400}px, ${H * 0.75 + Math.sin(t * 0.3) * 100 - 400}px)`

  for (const b of BLOCKS) {
    const on = t >= b.t0 && t <= b.t1
    show(b.el, on)
    if (!on) continue
    const ex = outCubic(prog(t, b.t1 - 0.4, 0.4))
    b.el.style.opacity = String(1 - ex)
    b.el.style.transform = `translateY(${-34 * ex}px)`
    for (const p of b.parts) {
      const q = prog(t, p.t, p.kind === 'item' ? 0.5 : 0.55)
      const e = outCubic(q)
      p.node.style.opacity = String(e)
      if (p.kind === 'word') p.node.style.transform = `translateY(${(1 - e) * 0.45}em)`
      else if (p.kind === 'item') p.node.style.transform = `translateX(${(1 - e) * -50}px)`
      else if (p.kind === 'pop') p.node.style.transform = `scale(${0.4 + 0.6 * outBack(prog(t, p.t, 0.6))})`
      else p.node.style.transform = `translateY(${(1 - e) * 30}px)`
    }
  }

  {
    const on = t >= 5.8 && t <= 12.2
    show(chat, on)
    if (on) {
      const i = outCubic(prog(t, 5.8, 0.5))
      const o = outCubic(prog(t, 11.8, 0.4))
      chat.style.opacity = String(i * (1 - o))
      chat.style.transform = `translateY(${(1 - i) * 70 - o * 40}px)`
      for (const m of T.chat) {
        show(m.el, t >= m.t)
        const k = outBack(prog(t, m.t, 0.4))
        m.el.style.transform = `scale(${0.5 + 0.5 * k})`
        m.el.style.opacity = String(clamp(k * 1.4))
      }
    }
  }

  {
    const on = t >= 66.6 && t <= 71.0
    show(unify, on)
    if (on) {
      const o = outCubic(prog(t, 70.6, 0.4))
      unify.style.opacity = String(1 - o)
      const spread = V ? 300 : 430
      const start = [
        [-spread, 10, -9],
        [0, -20, 3],
        [spread, 0, 10],
      ]
      tiles.forEach((tile, i) => {
        const a = outBack(prog(t, 67.6 + i * 0.2, 0.5))
        const m = inOut(prog(t, 68.7 + i * 0.08, 0.8))
        const [x, y, r] = start[i]
        tile.style.opacity = String(clamp(a) * (1 - clamp((m - 0.6) / 0.4)))
        tile.style.transform = `translate(${x * (1 - m)}px, ${y * (1 - m) + (1 - a) * 80}px) rotate(${r * (1 - m)}deg) scale(${(0.7 + 0.3 * a) * (1 - 0.45 * m)})`
      })
      const c = prog(t, 69.45, 0.65)
      rcard.style.opacity = String(clamp(c * 2))
      rcard.style.transform = `scale(${0.55 + 0.45 * outBack(c)}) rotate(${(1 - outCubic(c)) * -6}deg)`
    }
  }

  {
    const on = t >= 71.0 && t <= 74.6
    show(addons, on)
    if (on) {
      addons.style.opacity = String(1 - outCubic(prog(t, 74.2, 0.4)))
      addons.parts.forEach((a, i) => {
        const k = outBack(prog(t, 71.75 + i * 0.16, 0.45))
        a.el.style.opacity = String(clamp(k * 1.5))
        a.el.style.transform = `scale(${0.5 + 0.5 * k})`
      })
    }
  }

  {
    const on = t >= 74.5
    show(wipe, on)
    show(endcard, on)
    if (on) {
      const r = Math.hypot(W, H) * inOut(prog(t, 74.5, 0.65))
      wipe.style.width = wipe.style.height = `${2 * r}px`
      wipe.style.margin = `${-r}px 0 0 ${-r}px`
      endParts.forEach((p, i) => {
        const k = prog(t, 75.0 + i * 0.5, 0.6)
        p.style.opacity = String(outCubic(k))
        p.style.transform = i === 0 ? `scale(${0.4 + 0.6 * outBack(k)})` : `translateY(${(1 - outCubic(k)) * 40}px)`
      })
    }
  }

  const ps = phoneState(t)
  // keep the iframe laid out even off-screen
  phone.style.visibility = ps.visible ? 'visible' : 'hidden'
  phone.style.transform = `translate(${ps.x - 209}px, ${ps.y - 436}px) rotate(${ps.rot}deg) scale(${ps.s})`
  phone.classList.toggle('dark', !!dark)

  if (ptr && ptr.vis > 0) {
    pointer.style.opacity = String(ptr.vis)
    pointer.style.transform = `translate(${ptr.x}px, ${ptr.y}px) scale(${PH.s * 0.85 * (1 - 0.18 * ptr.press)})`
    pointer.style.background = `rgba(255,255,255,${0.32 + 0.3 * ptr.press})`
  } else pointer.style.opacity = '0'

  fade.style.opacity = String(inCubic(prog(t, 79.2, 0.8)))
}

window.__filmDuration = 80
window.__film(0, null, true)
