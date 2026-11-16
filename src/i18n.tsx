import { createContext, useContext } from 'react'

export type Lang = 'sc' | 'tc' | 'en'
/** A localized string: Simplified Chinese / Traditional Chinese (HK) / English */
export type L = { sc: string; tc: string; en: string }

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'sc', label: '简' },
  { id: 'tc', label: '繁' },
  { id: 'en', label: 'EN' },
]

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('roomix.lang') as Lang | null
    if (saved === 'sc' || saved === 'tc' || saved === 'en') return saved
  } catch {}
  const nav = (navigator.language || 'en').toLowerCase()
  if (nav.startsWith('zh')) {
    return /hk|tw|mo|hant/.test(nav) ? 'tc' : 'sc'
  }
  return 'en'
}

const ui = {
  tagline: {
    sc: '在香港，找室友比找 fwb 还尴尬。',
    tc: '在香港，搵室友比搵 fwb 仲尷尬。',
    en: 'In Hong Kong, finding a roommate is more awkward than finding a fwb.',
  },
  taglineSub: {
    sc: '回答 10 个问题，然后开始滑。',
    tc: '答 10 條問題，然後開始滑。',
    en: 'Answer ten questions. Then swipe.',
  },
  start: { sc: '开始', tc: '開始', en: 'Get started' },
  welcomeLegal: {
    sc: '演示版本 · 所有资料均为虚构',
    tc: '示範版本 · 所有資料均為虛構',
    en: 'Demo build · all profiles are fictional',
  },
  continue: { sc: '继续', tc: '繼續', en: 'Continue' },
  skipDemo: { sc: '跳过', tc: '略過', en: 'Skip' },
  multiHint: { sc: '可多选', tc: '可多選', en: 'Pick all that apply' },
  stepOf: { sc: '第 {n} / 10 题', tc: '第 {n} / 10 題', en: 'Question {n} of 10' },
  buildingCard: { sc: '正在生成你的卡片…', tc: '正在生成你嘅卡片…', en: 'Building your card…' },
  cardReady: { sc: '这就是别人会看到的你', tc: '呢張就係人哋會見到嘅你', en: 'This is what others will see' },
  cardReadySub: { sc: '准备好开始了吗？', tc: '準備好開始未？', en: 'Ready to start?' },
  startSwiping: { sc: '开始滑', tc: '開始滑', en: 'Start swiping' },
  me: { sc: '我', tc: '我', en: 'Me' },

  tabDiscover: { sc: '室友', tc: '室友', en: 'Roommates' },
  tabRooms: { sc: '房源', tc: '房源', en: 'Rooms' },
  tabMatches: { sc: '消息', tc: '訊息', en: 'Chats' },
  tabMe: { sc: '我的', tc: '我的', en: 'Profile' },

  compat: { sc: '合拍', tc: '夾得來', en: 'match' },
  verified: { sc: '已认证', tc: '已認證', en: 'Verified' },
  livesIn: { sc: '现住', tc: '現住', en: 'Lives in' },
  budget: { sc: '预算', tc: '預算', en: 'Budget' },
  moveIn: { sc: '入住', tc: '入住', en: 'Move-in' },
  perMonth: { sc: '/月', tc: '/月', en: '/mo' },
  each: { sc: '每人约', tc: '每人約', en: 'about' },
  eachSuffix: { sc: '', tc: '', en: ' each' },

  emptyPeople: { sc: '附近暂时没有新的室友了', tc: '附近暫時冇新嘅室友', en: "There's no one new around you" },
  emptyPeopleSub: { sc: '稍后再来看看，或者放宽一下条件。', tc: '遲啲再嚟睇，或者放寬少少條件。', en: 'Check back later or widen your filters.' },
  emptyRooms: { sc: '这批房源都刷完啦', tc: '呢批房源已經刷晒', en: "You've seen every room for now" },
  emptyRoomsSub: { sc: '每天都有新房源统一格式后加入。', tc: '每日都有新房源統一格式後加入。', en: 'New listings are unified and added every day.' },
  restartDeck: { sc: '重新开始', tc: '重新開始', en: 'Start over' },

  itsA: { sc: '', tc: '', en: "It's a" },
  match: { sc: '配对成功！', tc: '配對成功！', en: 'Match!' },
  matchSub: { sc: '你和 {name} 互相看中了对方', tc: '你同 {name} 互相睇中咗對方', en: 'You and {name} liked each other' },
  saySomething: { sc: '打个招呼…', tc: '打個招呼…', en: 'Say something nice…' },
  swipeRoomsTogether: { sc: '一起刷房', tc: '一齊刷房', en: 'Swipe rooms together' },
  keepSwiping: { sc: '继续滑', tc: '繼續滑', en: 'Keep swiping' },

  roomMatchTitle: { sc: '你们都看中了！', tc: '你哋都睇中咗！', en: 'Room Match!' },
  roomMatchSub: { sc: '你和 {name} 都想住这间', tc: '你同 {name} 都想住呢間', en: 'You and {name} both want this place' },
  bookViewing: { sc: '预约一起看房', tc: '預約一齊睇樓', en: 'Book a viewing together' },
  viewingBooked: { sc: '已向房东发送看房请求 · 周六 14:00', tc: '已向業主發送睇樓請求 · 星期六 14:00', en: 'Viewing request sent · Sat 2:00 PM' },
  keepBrowsing: { sc: '继续刷房', tc: '繼續刷房', en: 'Keep browsing' },

  roomsWith: { sc: '与 {name} 一起刷房', tc: '同 {name} 一齊刷房', en: 'Browsing with {name}' },
  partnerOnline: { sc: '在线 · 正在看第 {n} 间', tc: '在線 · 睇緊第 {n} 間', en: 'Online · on room {n}' },
  partnerLooking: { sc: '正在看…', tc: '睇緊…', en: 'Looking…' },
  partnerDecided: { sc: '已决定', tc: '已決定', en: 'Decided' },
  partnerLiked: { sc: '{name} 也喜欢这间', tc: '{name} 都鍾意呢間', en: '{name} liked this one too' },
  partnerPassed: { sc: '{name} 跳过了：{reason}', tc: '{name} 跳過咗：{reason}', en: '{name} passed: {reason}' },
  partnerLikedYouPassed: { sc: '{name} 其实很喜欢这间', tc: '{name} 其實好鍾意呢間', en: '{name} actually liked this one' },
  undo: { sc: '撤回', tc: '撤回', en: 'Undo' },
  noPartnerTitle: { sc: '先找到室友，再一起刷房', tc: '先搵到室友，再一齊刷房', en: 'Find a roommate first, then browse together' },
  noPartnerSub: {
    sc: '配对成功后，你们会一起刷同一组房源。两个人都右滑，才算配对。',
    tc: '配對成功之後，你哋會一齊刷同一組房源。兩個人都右滑先算配對。',
    en: 'Once you match, you both swipe through one shared deck of rooms. It only counts when you both swipe right.',
  },
  goDiscover: { sc: '去找室友', tc: '去搵室友', en: 'Find roommates' },
  unified: { sc: 'Roomix 统一格式', tc: 'Roomix 統一格式', en: 'Unified by Roomix' },
  source: { sc: '来源', tc: '來源', en: 'via' },
  fitsBoth: { sc: '符合你们俩的预算', tc: '啱你哋兩個嘅預算', en: 'Fits both budgets' },
  overBudget: { sc: '略超预算', tc: '略超預算', en: 'Slightly over budget' },

  newMatches: { sc: '新配对', tc: '新配對', en: 'New Matches' },
  messages: { sc: '消息', tc: '訊息', en: 'Messages' },
  roomMatches: { sc: '房源配对', tc: '房源配對', en: 'Room Matches' },
  noMatchesYet: { sc: '还没有配对，去右滑几个吧', tc: '仲未有配對，去右滑幾個啦', en: 'No matches yet. Go swipe right on a few.' },
  startChat: { sc: '开始聊天吧', tc: '開始傾偈啦', en: 'Start the conversation' },
  typeMessage: { sc: '输入消息…', tc: '輸入訊息…', en: 'Type a message…' },
  send: { sc: '发送', tc: '發送', en: 'Send' },
  matchedOn: { sc: '你们在 Roomix 上配对了', tc: '你哋喺 Roomix 配對咗', en: 'You matched on Roomix' },
  autoReply: {
    sc: '哈哈你好！看了你的卡片，感觉我们作息挺合的 😆 要不要一起刷几间房？',
    tc: '哈哈你好！睇咗你張卡，覺得我哋作息幾夾 😆 不如一齊刷幾間房？',
    en: 'Haha hi! Saw your card, I think our routines line up 😆 Want to swipe some rooms together?',
  },
  bothLiked: { sc: '你们都喜欢', tc: '你哋都鍾意', en: 'You both liked' },

  myCard: { sc: '我的卡片', tc: '我嘅卡片', en: 'My card' },
  myAnswers: { sc: '我的答案', tc: '我嘅答案', en: 'My answers' },
  language: { sc: '语言', tc: '語言', en: 'Language' },
  resetDemo: { sc: '重置演示', tc: '重置示範', en: 'Reset demo' },
  editAnswers: { sc: '重新回答', tc: '重新回答', en: 'Retake quiz' },

  lifestyle: { sc: '生活习惯', tc: '生活習慣', en: 'Lifestyle' },
  aboutMe: { sc: '关于我', tc: '關於我', en: 'About me' },
  you: { sc: '你', tc: '你', en: 'You' },
  same: { sc: '一致', tc: '一致', en: 'Same' },
  close: { sc: '接近', tc: '接近', en: 'Close' },
  differ: { sc: '注意', tc: '留意', en: 'Heads up' },
  details: { sc: '房源详情', tc: '房源詳情', en: 'Details' },
  boostOn: { sc: '⚡ Boost 已开启：未来 30 分钟优先展示', tc: '⚡ Boost 已開啟：未來 30 分鐘優先顯示', en: '⚡ Boost on: you’re top of the deck for 30 min' },
  filterSoon: { sc: '筛选：港岛 · HK$6k–12k · 不吸烟', tc: '篩選：港島 · HK$6k–12k · 唔食煙', en: 'Filters: HK Island · HK$6k–12k · non-smoking' },
  superLikeSent: { sc: '⭐ 已发送超级喜欢', tc: '⭐ 已發送超級喜歡', en: '⭐ Super Like sent' },
  mustSee: { sc: '⭐ 已标记为必看', tc: '⭐ 已標記為必睇', en: '⭐ Marked as must-see' },
} satisfies Record<string, L>

export type UIKey = keyof typeof ui

export const uiL = (key: UIKey): L => ui[key]

export const LangContext = createContext<Lang>('sc')

export function useLang() {
  return useContext(LangContext)
}

/** Returns t(key, vars) for UI strings and tx(L) for data strings. */
export function useT() {
  const lang = useContext(LangContext)
  const fill = (s: string, vars?: Record<string, string | number>) =>
    vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s
  return {
    lang,
    t: (key: UIKey, vars?: Record<string, string | number>) => fill(ui[key][lang], vars),
    tx: (l: L, vars?: Record<string, string | number>) => fill(l[lang], vars),
  }
}
