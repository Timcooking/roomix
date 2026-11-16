import type { L } from '../i18n'
import type { PhotoKey } from './photos'
import type { Answers } from './questions'

export type CardPhoto = { key: PhotoKey; caption?: L }

export type Person = {
  id: string
  name: string
  age: number
  job: L
  livesIn: L
  moveIn: L
  bio: L
  photos: CardPhoto[]
  answers: Answers
  verified?: boolean
  /** demo script: this person already swiped right on you */
  likesYou?: boolean
  /** first message they send after a match */
  hello: L
}

const cap = {
  myRoom: { sc: '我现在的房间', tc: '我而家間房', en: 'My current room' },
  myPet: { sc: '会一起搬过来', tc: '會一齊搬過嚟', en: 'Moving in with me' },
  weekend: { sc: '周末的我', tc: '週末嘅我', en: 'Me on weekends' },
  cooking: { sc: '每周日包饺子', tc: '逢星期日包餃子', en: 'Dumpling Sundays' },
  wfh: { sc: '在家办公的角落', tc: '喺屋企返工嘅角落', en: 'My WFH corner' },
}

export const PEOPLE: Person[] = [
  {
    id: 'wing',
    name: 'Wing',
    age: 24,
    job: { sc: '插画师 · 自由职业', tc: '插畫師 · 自由工作者', en: 'Illustrator · Freelance' },
    livesIn: { sc: '深水埗', tc: '深水埗', en: 'Sham Shui Po' },
    moveIn: { sc: '11 月', tc: '11 月', en: 'November' },
    bio: {
      sc: '凌晨两点是我灵感最好的时候。会戴耳机，保证安静。有一只叫豆腐的猫。',
      tc: '凌晨兩點係我靈感最好嘅時候。會戴耳筒，保證安靜。有隻叫豆腐嘅貓。',
      en: "My best ideas come at 2 AM. Headphones on, promise I'm quiet. I have a cat called Tofu.",
    },
    photos: [
      { key: 'wing' },
      { key: 'cat', caption: cap.myPet },
      { key: 'shelfRoom', caption: cap.myRoom },
    ],
    answers: {
      sleep: ['night'], shower: ['night'], clean: ['chill'], food: ['share'], guests: ['sometimes'],
      calls: ['rarely'], pets: ['have'], smoke: ['none'], budget: ['lt6'], area: ['kln'],
    },
    verified: true,
    hello: { sc: '嗨！豆腐说它也想认识你 🐱', tc: '嗨！豆腐話佢都想識你 🐱', en: 'Hi! Tofu says hi too 🐱' },
  },
  {
    id: 'kaylee',
    name: 'Kaylee',
    age: 26,
    job: { sc: 'UX 设计师 @ 鲗鱼涌', tc: 'UX 設計師 @ 鰂魚涌', en: 'UX Designer @ Quarry Bay' },
    livesIn: { sc: '西营盘', tc: '西營盤', en: 'Sai Ying Pun' },
    moveIn: { sc: '10 月 15 日', tc: '10 月 15 日', en: 'Oct 15' },
    bio: {
      sc: '平日上班，周末爬山。冰箱里的东西想吃就问我，我也会问你。晚上洗澡，不会六点吵醒你。',
      tc: '平日返工，週末行山。雪櫃啲嘢想食就問我，我都會問你。夜晚沖涼，唔會六點嘈醒你。',
      en: "Office on weekdays, hiking on weekends. Ask before you eat my stuff and I'll do the same. I shower at night, so no 6 AM wake-ups.",
    },
    photos: [
      { key: 'kaylee' },
      { key: 'tidyCorner', caption: cap.myRoom },
      { key: 'dumplings', caption: cap.cooking },
    ],
    answers: {
      sleep: ['normal'], shower: ['night'], clean: ['tidy'], food: ['ask'], guests: ['sometimes'],
      calls: ['sometimes'], pets: ['ok'], smoke: ['none'], budget: ['6to9'], area: ['hki'],
    },
    verified: true,
    likesYou: true,
    hello: { sc: '哈喽！我们的答案几乎一样欸 😂', tc: '哈囉！我哋嘅答案差唔多一樣喎 😂', en: 'Hey! Our answers are almost identical 😂' },
  },
  {
    id: 'tom',
    name: 'Tom',
    age: 29,
    job: { sc: '投行分析师 · 中环', tc: '投行分析師 · 中環', en: 'IB Analyst · Central' },
    livesIn: { sc: '湾仔', tc: '灣仔', en: 'Wan Chai' },
    moveIn: { sc: '尽快', tc: '越快越好', en: 'ASAP' },
    bio: {
      sc: '从伦敦搬来两年。每天早上 6 点去健身然后洗澡，晚上基本不在家。',
      tc: '由倫敦搬嚟兩年。每朝 6 點做 gym 然後沖涼，夜晚基本唔喺屋企。',
      en: "Moved from London two years ago. Gym at 6 AM then shower, rarely home in the evenings.",
    },
    photos: [
      { key: 'tom' },
      { key: 'gym', caption: cap.weekend },
      { key: 'living6', caption: cap.myRoom },
    ],
    answers: {
      sleep: ['early'], shower: ['morning'], clean: ['tidy'], food: ['label'], guests: ['often'],
      calls: ['daily'], pets: ['no'], smoke: ['drink'], budget: ['gt12'], area: ['hki'],
    },
    verified: true,
    hello: { sc: 'Hey! 想找个靠近中环的地方', tc: 'Hey! 想搵個近中環嘅地方', en: 'Hey! Looking for somewhere near Central' },
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 27,
    job: { sc: '软件工程师 · 远程', tc: '軟件工程師 · 遙距', en: 'Software Engineer · Remote' },
    livesIn: { sc: '旺角', tc: '旺角', en: 'Mong Kok' },
    moveIn: { sc: '11 月 1 日', tc: '11 月 1 日', en: 'Nov 1' },
    bio: {
      sc: '在家办公，所以很在意安静和网速。周末会做饭，做多了就分你。',
      tc: '喺屋企返工，所以好在意安靜同網速。週末會煮飯，煮多咗就分你。',
      en: "I work from home, so quiet and fast Wi-Fi matter. I cook on weekends and always make too much.",
    },
    photos: [
      { key: 'marcus' },
      { key: 'deskLamp', caption: cap.wfh },
      { key: 'cooking', caption: cap.weekend },
    ],
    answers: {
      sleep: ['normal'], shower: ['night'], clean: ['spotless'], food: ['share'], guests: ['never'],
      calls: ['sometimes'], pets: ['ok'], smoke: ['none'], budget: ['6to9'], area: ['kln', 'hki'],
    },
    verified: true,
    likesYou: true,
    hello: { sc: '你好！你那边网速一般多少 😂', tc: '你好！你嗰邊網速大概幾多 😂', en: "Hi! Important question: what's your Wi-Fi speed 😂" },
  },
  {
    id: 'chloe',
    name: 'Chloe',
    age: 28,
    job: { sc: '护士 · 玛丽医院', tc: '護士 · 瑪麗醫院', en: 'Nurse · Queen Mary Hospital' },
    livesIn: { sc: '薄扶林', tc: '薄扶林', en: 'Pok Fu Lam' },
    moveIn: { sc: '12 月', tc: '12 月', en: 'December' },
    bio: {
      sc: '轮班工作，有时白天睡觉。每天和在多伦多的男朋友视频，会关门小声讲。',
      tc: '輪班工作，有時日頭瞓覺。每日同喺多倫多嘅男朋友視像，會閂門細聲講。',
      en: "Shift work, so sometimes I sleep during the day. Daily video calls with my boyfriend in Toronto, door closed, quiet voice.",
    },
    photos: [
      { key: 'chloe' },
      { key: 'books', caption: cap.weekend },
      { key: 'bed3', caption: cap.myRoom },
    ],
    answers: {
      sleep: ['night'], shower: ['both'], clean: ['spotless'], food: ['label'], guests: ['never'],
      calls: ['daily'], pets: ['no'], smoke: ['none'], budget: ['9to12'], area: ['hki'],
    },
    verified: true,
    hello: { sc: '嗨～我轮班，希望你不介意 🙏', tc: '嗨～我輪班，希望你唔介意 🙏', en: "Hi~ I work shifts, hope that's okay 🙏" },
  },
  {
    id: 'ethan',
    name: 'Ethan',
    age: 23,
    job: { sc: '港大研究生', tc: '港大研究生', en: 'HKU Postgrad' },
    livesIn: { sc: '沙田', tc: '沙田', en: 'Sha Tin' },
    moveIn: { sc: '9 月', tc: '9 月', en: 'September' },
    bio: {
      sc: '研究生，预算有限但很爱干净。会弹吉他（有电子静音那种）。',
      tc: '研究生，預算有限但好愛乾淨。識彈結他（有電子靜音嗰種）。',
      en: 'Grad student on a budget but very tidy. I play guitar (the silent electric kind).',
    },
    photos: [
      { key: 'ethan' },
      { key: 'guitarRoom', caption: cap.myRoom },
      { key: 'bike', caption: cap.weekend },
    ],
    answers: {
      sleep: ['normal'], shower: ['morning'], clean: ['tidy'], food: ['ask'], guests: ['sometimes'],
      calls: ['rarely'], pets: ['ok'], smoke: ['none'], budget: ['lt6'], area: ['any'],
    },
    likesYou: true,
    hello: { sc: '你好呀！一起找个近港铁的吧', tc: '你好呀！一齊搵個近港鐵嘅啦', en: "Hey! Let's find something near the MTR" },
  },
  {
    id: 'mika',
    name: 'Mika',
    age: 25,
    job: { sc: '咖啡师 & 摄影师', tc: '咖啡師 & 攝影師', en: 'Barista & Photographer' },
    livesIn: { sc: '上环', tc: '上環', en: 'Sheung Wan' },
    moveIn: { sc: '10 月底', tc: '10 月尾', en: 'Late October' },
    bio: {
      sc: '早上 6 点开店，所以 10 点就睡。家里会一直有好咖啡。有只柯基。',
      tc: '朝早 6 點開舖，所以 10 點就瞓。屋企一定有好咖啡。有隻柯基。',
      en: 'I open the café at 6 AM, so lights out at 10. There will always be good coffee. I have a corgi.',
    },
    photos: [
      { key: 'mika' },
      { key: 'coffee', caption: cap.weekend },
      { key: 'dog', caption: cap.myPet },
    ],
    answers: {
      sleep: ['early'], shower: ['morning'], clean: ['tidy'], food: ['share'], guests: ['often'],
      calls: ['sometimes'], pets: ['have'], smoke: ['drink'], budget: ['6to9'], area: ['hki'],
    },
    verified: true,
    hello: { sc: '嗨！先请你喝一杯咖啡 ☕️', tc: '嗨！請你飲杯咖啡先 ☕️', en: 'Hi! First coffee is on me ☕️' },
  },
  {
    id: 'daniel',
    name: 'Daniel',
    age: 30,
    job: { sc: '国际学校老师', tc: '國際學校老師', en: 'International School Teacher' },
    livesIn: { sc: '何文田', tc: '何文田', en: 'Ho Man Tin' },
    moveIn: { sc: '11 月中', tc: '11 月中', en: 'Mid-November' },
    bio: {
      sc: '在香港教书五年了，会一点粤语。喜欢打游戏，但 11 点后一定戴耳机。',
      tc: '喺香港教書五年，識少少廣東話。鍾意打機，但 11 點後一定戴耳筒。',
      en: "Five years teaching in HK, a little Cantonese. I game, but headphones after 11, always.",
    },
    photos: [
      { key: 'daniel' },
      { key: 'gaming', caption: cap.weekend },
      { key: 'living5', caption: cap.myRoom },
    ],
    answers: {
      sleep: ['normal'], shower: ['night'], clean: ['tidy'], food: ['ask'], guests: ['sometimes'],
      calls: ['sometimes'], pets: ['ok'], smoke: ['drink'], budget: ['9to12'], area: ['kln'],
    },
    verified: true,
    likesYou: true,
    hello: { sc: 'Hello! 我粤语还在学，可以教我吗 😄', tc: 'Hello! 我廣東話仲學緊，可唔可以教我 😄', en: "Hello! Still learning Cantonese, mind teaching me? 😄" },
  },
]

export const PEOPLE_BY_ID = Object.fromEntries(PEOPLE.map((p) => [p.id, p])) as Record<string, Person>
