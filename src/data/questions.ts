import type { L } from '../i18n'

export type QuestionId =
  | 'sleep' | 'shower' | 'clean' | 'food' | 'guests'
  | 'calls' | 'pets' | 'smoke' | 'budget' | 'area'

export type Option = {
  id: string
  emoji: string
  label: L
  /** short form shown as a chip on cards */
  chip: L
}

export type Question = {
  id: QuestionId
  title: L
  sub?: L
  multi?: boolean
  /** options are ordered: neighbours count as "close" when scoring */
  ordered?: boolean
  options: Option[]
}

export type Answers = Partial<Record<QuestionId, string[]>>

const o = (id: string, emoji: string, label: L, chip: L): Option => ({ id, emoji, label, chip })

export const QUESTIONS: Question[] = [
  {
    id: 'sleep',
    ordered: true,
    title: { sc: '你的作息是？', tc: '你嘅作息係？', en: "What's your sleep schedule?" },
    sub: { sc: '室友矛盾第一名，先说清楚。', tc: '室友矛盾第一位，講清楚先。', en: 'The #1 roommate fight. Get it out of the way.' },
    options: [
      o('early', '🌅', { sc: '早睡早起（11 点前睡）', tc: '早瞓早起（11 點前瞓）', en: 'Early bird (asleep by 11)' }, { sc: '早睡早起', tc: '早瞓早起', en: 'Early bird' }),
      o('normal', '🙂', { sc: '正常（12 点左右）', tc: '正常（12 點左右）', en: 'Normal (around midnight)' }, { sc: '作息正常', tc: '作息正常', en: 'Regular hours' }),
      o('night', '🦉', { sc: '夜猫子（2 点以后）', tc: '夜貓子（2 點之後）', en: 'Night owl (after 2 AM)' }, { sc: '夜猫子', tc: '夜貓子', en: 'Night owl' }),
    ],
  },
  {
    id: 'shower',
    title: { sc: '你一般几点洗澡？', tc: '你通常幾點沖涼？', en: 'When do you usually shower?' },
    sub: { sc: '没人想早上 6 点被水声吵醒。', tc: '冇人想朝早 6 點俾水聲嘈醒。', en: 'Nobody wants to wake up to a 6 AM shower.' },
    options: [
      o('morning', '🚿', { sc: '早上', tc: '朝早', en: 'Morning' }, { sc: '早上洗澡', tc: '朝早沖涼', en: 'Morning shower' }),
      o('night', '🌙', { sc: '晚上', tc: '夜晚', en: 'Night' }, { sc: '晚上洗澡', tc: '夜晚沖涼', en: 'Night shower' }),
      o('both', '💦', { sc: '早晚都洗', tc: '朝晚都沖', en: 'Both' }, { sc: '早晚都洗', tc: '朝晚都沖', en: 'Twice a day' }),
    ],
  },
  {
    id: 'clean',
    ordered: true,
    title: { sc: '你有多爱干净？', tc: '你有幾愛乾淨？', en: 'How tidy are you?' },
    options: [
      o('spotless', '✨', { sc: '每天都收拾', tc: '每日都執', en: 'I tidy every day' }, { sc: '洁癖级', tc: '潔癖級', en: 'Spotless' }),
      o('tidy', '🧹', { sc: '每周大扫除', tc: '每星期大掃除', en: 'Weekly deep clean' }, { sc: '定期打扫', tc: '定期打掃', en: 'Tidy' }),
      o('chill', '🌀', { sc: '乱中有序', tc: '亂中有序', en: 'Organised chaos' }, { sc: '乱中有序', tc: '亂中有序', en: 'Organised chaos' }),
    ],
  },
  {
    id: 'food',
    title: { sc: '冰箱里的食物？', tc: '雪櫃入面啲嘢食？', en: "Food in the fridge?" },
    sub: { sc: '你的饺子还安全吗？🥟', tc: '你啲餃子仲安全嗎？🥟', en: 'Are your dumplings safe? 🥟' },
    options: [
      o('share', '🥟', { sc: '大家一起吃', tc: '大家一齊食', en: "What's mine is yours" }, { sc: '食物共享', tc: '嘢食共享', en: 'Shares food' }),
      o('ask', '🙋', { sc: '吃之前问一声', tc: '食之前問一聲', en: 'Ask before eating' }, { sc: '吃前先问', tc: '食前先問', en: 'Asks first' }),
      o('label', '🏷️', { sc: '各自贴名字，别碰', tc: '各自貼名，唔好掂', en: 'Labelled. Hands off.' }, { sc: '食物分开', tc: '嘢食分開', en: 'Food is labelled' }),
    ],
  },
  {
    id: 'guests',
    ordered: true,
    title: { sc: '朋友或另一半来过夜？', tc: '朋友或另一半嚟過夜？', en: 'Friends or partners staying over?' },
    options: [
      o('often', '🎉', { sc: '经常，家里热闹点好', tc: '經常，屋企熱鬧啲好', en: 'Often, the more the merrier' }, { sc: '常有访客', tc: '常有訪客', en: 'Frequent guests' }),
      o('sometimes', '🛋️', { sc: '偶尔，会提前说', tc: '間中，會預早講', en: 'Sometimes, with a heads-up' }, { sc: '偶尔访客', tc: '間中訪客', en: 'Occasional guests' }),
      o('never', '🚪', { sc: '尽量不要', tc: '盡量唔好', en: 'Rather not' }, { sc: '不带人回家', tc: '唔帶人返屋企', en: 'No overnight guests' }),
    ],
  },
  {
    id: 'calls',
    ordered: true,
    title: { sc: '你在家会打很久的电话吗？', tc: '你喺屋企會講好耐電話嗎？', en: 'Long calls at home?' },
    sub: { sc: '比如每天跟异地恋另一半视频。', tc: '例如每日同異地戀另一半視像。', en: 'Like a nightly video call with a long-distance partner.' },
    options: [
      o('daily', '📞', { sc: '每天都会', tc: '每日都會', en: 'Every day' }, { sc: '每天视频通话', tc: '每日視像通話', en: 'Daily video calls' }),
      o('sometimes', '💬', { sc: '偶尔', tc: '間中', en: 'Sometimes' }, { sc: '偶尔通话', tc: '間中通話', en: 'Some calls' }),
      o('rarely', '🤫', { sc: '很少，我很安静', tc: '好少，我好靜', en: "Rarely, I'm quiet" }, { sc: '安静党', tc: '安靜派', en: 'Quiet type' }),
    ],
  },
  {
    id: 'pets',
    ordered: true,
    title: { sc: '宠物呢？', tc: '寵物呢？', en: 'Pets?' },
    options: [
      o('have', '🐱', { sc: '我有宠物', tc: '我有寵物', en: 'I have a pet' }, { sc: '有宠物', tc: '有寵物', en: 'Has a pet' }),
      o('ok', '🐶', { sc: '没有，但很欢迎', tc: '冇，但好歡迎', en: "None, but I'd love one" }, { sc: '欢迎宠物', tc: '歡迎寵物', en: 'Pet-friendly' }),
      o('no', '🤧', { sc: '不行 / 过敏', tc: '唔得 / 敏感', en: 'No / allergic' }, { sc: '不要宠物', tc: '唔要寵物', en: 'No pets' }),
    ],
  },
  {
    id: 'smoke',
    ordered: true,
    title: { sc: '吸烟或喝酒？', tc: '食煙或者飲酒？', en: 'Smoking or drinking?' },
    options: [
      o('none', '🚭', { sc: '都不', tc: '都唔', en: 'Neither' }, { sc: '不烟不酒', tc: '唔煙唔酒', en: 'Sober & smoke-free' }),
      o('drink', '🍷', { sc: '偶尔小酌', tc: '間中飲番杯', en: 'A drink now and then' }, { sc: '偶尔喝酒', tc: '間中飲酒', en: 'Social drinker' }),
      o('smoke', '🚬', { sc: '我吸烟', tc: '我食煙', en: 'I smoke' }, { sc: '吸烟', tc: '食煙', en: 'Smoker' }),
    ],
  },
  {
    id: 'budget',
    ordered: true,
    title: { sc: '每人每月租金预算？', tc: '每人每月租金預算？', en: 'Your monthly rent budget?' },
    sub: { sc: '只算你自己那一份。', tc: '只計你自己嗰份。', en: 'Just your share.' },
    options: [
      o('lt6', '💵', { sc: 'HK$6,000 以下', tc: 'HK$6,000 以下', en: 'Under HK$6,000' }, { sc: '< HK$6k', tc: '< HK$6k', en: '< HK$6k' }),
      o('6to9', '💰', { sc: 'HK$6,000 – 9,000', tc: 'HK$6,000 – 9,000', en: 'HK$6,000 – 9,000' }, { sc: 'HK$6–9k', tc: 'HK$6–9k', en: 'HK$6–9k' }),
      o('9to12', '💎', { sc: 'HK$9,000 – 12,000', tc: 'HK$9,000 – 12,000', en: 'HK$9,000 – 12,000' }, { sc: 'HK$9–12k', tc: 'HK$9–12k', en: 'HK$9–12k' }),
      o('gt12', '👑', { sc: 'HK$12,000 以上', tc: 'HK$12,000 以上', en: 'Over HK$12,000' }, { sc: 'HK$12k+', tc: 'HK$12k+', en: 'HK$12k+' }),
    ],
  },
  {
    id: 'area',
    multi: true,
    title: { sc: '想住哪一区？', tc: '想住邊區？', en: 'Where do you want to live?' },
    options: [
      o('hki', '🏙️', { sc: '港岛（上环 / 西营盘 / 湾仔）', tc: '港島（上環 / 西營盤 / 灣仔）', en: 'HK Island (Sheung Wan, SYP, Wan Chai)' }, { sc: '港岛', tc: '港島', en: 'HK Island' }),
      o('kln', '🌃', { sc: '九龙（旺角 / 深水埗 / 何文田）', tc: '九龍（旺角 / 深水埗 / 何文田）', en: 'Kowloon (Mong Kok, SSP, Ho Man Tin)' }, { sc: '九龙', tc: '九龍', en: 'Kowloon' }),
      o('nt', '🌳', { sc: '新界（沙田 / 将军澳 / 荃湾）', tc: '新界（沙田 / 將軍澳 / 荃灣）', en: 'New Territories (Sha Tin, TKO, Tsuen Wan)' }, { sc: '新界', tc: '新界', en: 'New Territories' }),
      o('any', '🗺️', { sc: '都可以，近港铁就行', tc: '都得，近港鐵就得', en: 'Anywhere near the MTR' }, { sc: '近港铁就行', tc: '近港鐵就得', en: 'Anywhere on the MTR' }),
    ],
  },
]

export const Q = Object.fromEntries(QUESTIONS.map((q) => [q.id, q])) as Record<QuestionId, Question>

export function optionOf(qid: QuestionId, oid: string): Option | undefined {
  return Q[qid].options.find((x) => x.id === oid)
}

/** Sample answers for "Skip" during a live demo */
export const DEMO_ANSWERS: Answers = {
  sleep: ['normal'],
  shower: ['night'],
  clean: ['tidy'],
  food: ['ask'],
  guests: ['sometimes'],
  calls: ['sometimes'],
  pets: ['ok'],
  smoke: ['none'],
  budget: ['6to9'],
  area: ['hki', 'kln'],
}

export type Verdict = 'same' | 'close' | 'differ'

export function compareAnswer(qid: QuestionId, a?: string[], b?: string[]): Verdict | null {
  if (!a?.length || !b?.length) return null
  const q = Q[qid]
  if (q.multi) {
    if (a.includes('any') || b.includes('any') || a.some((x) => b.includes(x))) return 'same'
    return 'differ'
  }
  if (a[0] === b[0]) return 'same'
  if (qid === 'shower' && (a[0] === 'both' || b[0] === 'both')) return 'close'
  if (qid === 'food' && (a[0] === 'ask' || b[0] === 'ask')) return 'close'
  if (q.ordered) {
    const ia = q.options.findIndex((x) => x.id === a[0])
    const ib = q.options.findIndex((x) => x.id === b[0])
    if (Math.abs(ia - ib) === 1) {
      // a smoker or a pet owner next to someone who'd "rather not" is still a conflict
      if (qid === 'smoke' && (a[0] === 'smoke' || b[0] === 'smoke')) return 'differ'
      if (qid === 'pets' && (a[0] === 'no' || b[0] === 'no')) return 'differ'
      return 'close'
    }
  }
  return 'differ'
}

/** Compatibility 0–100 used on cards */
export function compatibility(a: Answers, b: Answers): number {
  const weights: Record<QuestionId, number> = {
    sleep: 1.4, shower: 1, clean: 1.4, food: 1, guests: 1.1,
    calls: 1, pets: 1.2, smoke: 1.3, budget: 1.3, area: 1.2,
  }
  let sum = 0
  let total = 0
  for (const q of QUESTIONS) {
    const v = compareAnswer(q.id, a[q.id], b[q.id])
    if (!v) continue
    const w = weights[q.id]
    total += w
    sum += w * (v === 'same' ? 1 : v === 'close' ? 0.55 : 0)
  }
  if (!total) return 80
  return Math.round(52 + 46 * (sum / total))
}
