import type { L } from '../i18n'
import type { CardPhoto } from './people'

export type Room = {
  id: string
  title: L
  district: L
  /** total monthly rent in HKD */
  rent: number
  beds: number
  baths: number
  sizeFt: number
  floor: L
  mtr: L
  available: L
  features: { emoji: string; label: L }[]
  /** listing platform the deck pulled this from (fictional names for the demo) */
  source: L
  photos: CardPhoto[]
  /** demo script: what your matched roommate decides */
  partnerLikes: boolean
  partnerReason?: L
}

const c = {
  living: { sc: '客厅', tc: '客廳', en: 'Living room' },
  bed: { sc: '主人房', tc: '主人房', en: 'Main bedroom' },
  bed2: { sc: '第二间房', tc: '第二間房', en: 'Second bedroom' },
  kitchen: { sc: '厨房', tc: '廚房', en: 'Kitchen' },
  bath: { sc: '浴室', tc: '浴室', en: 'Bathroom' },
  view: { sc: '窗外景观', tc: '窗外景觀', en: 'The view' },
  area: { sc: '附近', tc: '附近', en: 'Neighbourhood' },
}

const f = {
  pets: { emoji: '🐾', label: { sc: '可养宠物', tc: '可養寵物', en: 'Pets OK' } },
  washer: { emoji: '🧺', label: { sc: '洗衣机', tc: '洗衣機', en: 'Washer' } },
  cook: { emoji: '🔥', label: { sc: '可明火煮食', tc: '可明火煮食', en: 'Gas stove' } },
  lift: { emoji: '🛗', label: { sc: '有电梯', tc: '有電梯', en: 'Lift' } },
  noLift: { emoji: '🪜', label: { sc: '唐楼走楼梯', tc: '唐樓行樓梯', en: 'Walk-up' } },
  furnished: { emoji: '🛋️', label: { sc: '全新家私', tc: '全新傢俬', en: 'Furnished' } },
  gym: { emoji: '🏋️', label: { sc: '会所健身房', tc: '會所健身室', en: 'Gym' } },
  view: { emoji: '🌊', label: { sc: '海景', tc: '海景', en: 'Sea view' } },
  quiet: { emoji: '🤫', label: { sc: '向内楼安静', tc: '向內樓清靜', en: 'Quiet side' } },
  aircon: { emoji: '❄️', label: { sc: '每房冷气', tc: '每房冷氣', en: 'A/C in each room' } },
  fiber: { emoji: '📶', label: { sc: '1000M 光纤', tc: '1000M 光纖', en: '1 Gbps fibre' } },
  balcony: { emoji: '🪴', label: { sc: '露台', tc: '露台', en: 'Balcony' } },
}

export const ROOMS: Room[] = [
  {
    id: 'ssp',
    title: { sc: '深水埗 · 福华街唐楼', tc: '深水埗 · 福華街唐樓', en: 'Sham Shui Po · Fuk Wa St walk-up' },
    district: { sc: '九龙', tc: '九龍', en: 'Kowloon' },
    rent: 12800, beds: 2, baths: 1, sizeFt: 420,
    floor: { sc: '5 楼', tc: '5 樓', en: '5/F' },
    mtr: { sc: '深水埗站 4 分钟', tc: '深水埗站 4 分鐘', en: '4 min to Sham Shui Po' },
    available: { sc: '即时入住', tc: '即時入住', en: 'Available now' },
    features: [f.noLift, f.cook, f.pets, f.washer],
    source: { sc: '业主直租', tc: '業主直租', en: 'Owner direct' },
    photos: [
      { key: 'living7', caption: c.living },
      { key: 'bed5', caption: c.bed },
      { key: 'hkDense', caption: c.view },
    ],
    partnerLikes: false,
    partnerReason: { sc: '没电梯，搬家会累死', tc: '冇電梯，搬屋會攰死', en: 'no lift, moving day would kill us' },
  },
  {
    id: 'syp',
    title: { sc: '西营盘 · 第三街', tc: '西營盤 · 第三街', en: 'Sai Ying Pun · Third St' },
    district: { sc: '港岛', tc: '港島', en: 'HK Island' },
    rent: 17600, beds: 2, baths: 1, sizeFt: 460,
    floor: { sc: '中层', tc: '中層', en: 'Mid floor' },
    mtr: { sc: '西营盘站 3 分钟', tc: '西營盤站 3 分鐘', en: '3 min to Sai Ying Pun' },
    available: { sc: '10 月 15 日', tc: '10 月 15 日', en: 'Oct 15' },
    features: [f.lift, f.aircon, f.washer, f.cook],
    source: { sc: 'SquareNest', tc: 'SquareNest', en: 'SquareNest' },
    photos: [
      { key: 'living1', caption: c.living },
      { key: 'bed1', caption: c.bed },
      { key: 'kitchen1', caption: c.kitchen },
      { key: 'hkPeakSunset', caption: c.area },
    ],
    partnerLikes: true,
  },
  {
    id: 'tko',
    title: { sc: '将军澳 · 日出康城', tc: '將軍澳 · 日出康城', en: 'Tseung Kwan O · LOHAS Park' },
    district: { sc: '新界', tc: '新界', en: 'New Territories' },
    rent: 19800, beds: 2, baths: 2, sizeFt: 560,
    floor: { sc: '高层', tc: '高層', en: 'High floor' },
    mtr: { sc: '康城站楼上', tc: '康城站上蓋', en: 'Above LOHAS Park MTR' },
    available: { sc: '11 月 1 日', tc: '11 月 1 日', en: 'Nov 1' },
    features: [f.gym, f.view, f.lift, f.furnished],
    source: { sc: 'HomeHub HK', tc: 'HomeHub HK', en: 'HomeHub HK' },
    photos: [
      { key: 'living8', caption: c.living },
      { key: 'bed4', caption: c.bed },
      { key: 'bath2', caption: c.bath },
      { key: 'hkHarbourDay', caption: c.view },
    ],
    partnerLikes: false,
    partnerReason: { sc: '离公司太远了', tc: '離公司太遠', en: 'too far from work' },
  },
  {
    id: 'wc',
    title: { sc: '湾仔 · 星街小区', tc: '灣仔 · 星街小區', en: 'Wan Chai · Star Street' },
    district: { sc: '港岛', tc: '港島', en: 'HK Island' },
    rent: 21500, beds: 2, baths: 1, sizeFt: 480,
    floor: { sc: '18 楼', tc: '18 樓', en: '18/F' },
    mtr: { sc: '金钟站 5 分钟', tc: '金鐘站 5 分鐘', en: '5 min to Admiralty' },
    available: { sc: '11 月中', tc: '11 月中', en: 'Mid-November' },
    features: [f.lift, f.fiber, f.balcony, f.aircon],
    source: { sc: 'Spacebox', tc: 'Spacebox', en: 'Spacebox' },
    photos: [
      { key: 'living3', caption: c.living },
      { key: 'bed2', caption: c.bed },
      { key: 'kitchen2', caption: c.kitchen },
      { key: 'hkIsland', caption: c.view },
    ],
    partnerLikes: true,
  },
  {
    id: 'mk',
    title: { sc: '旺角 · 洗衣街', tc: '旺角 · 洗衣街', en: 'Mong Kok · Sai Yee St' },
    district: { sc: '九龙', tc: '九龍', en: 'Kowloon' },
    rent: 15200, beds: 2, baths: 1, sizeFt: 390,
    floor: { sc: '12 楼', tc: '12 樓', en: '12/F' },
    mtr: { sc: '旺角东站 2 分钟', tc: '旺角東站 2 分鐘', en: '2 min to Mong Kok East' },
    available: { sc: '即时入住', tc: '即時入住', en: 'Available now' },
    features: [f.lift, f.fiber, f.washer, f.quiet],
    source: { sc: 'SquareNest', tc: 'SquareNest', en: 'SquareNest' },
    photos: [
      { key: 'studio', caption: c.living },
      { key: 'bed3', caption: c.bed2 },
      { key: 'bath1', caption: c.bath },
      { key: 'hkNightPeak', caption: c.area },
    ],
    partnerLikes: true,
  },
  {
    id: 'hmt',
    title: { sc: '何文田 · 窝打老道', tc: '何文田 · 窩打老道', en: 'Ho Man Tin · Waterloo Rd' },
    district: { sc: '九龙', tc: '九龍', en: 'Kowloon' },
    rent: 18900, beds: 2, baths: 1, sizeFt: 510,
    floor: { sc: '低层', tc: '低層', en: 'Low floor' },
    mtr: { sc: '何文田站 6 分钟', tc: '何文田站 6 分鐘', en: '6 min to Ho Man Tin' },
    available: { sc: '12 月', tc: '12 月', en: 'December' },
    features: [f.pets, f.balcony, f.lift, f.furnished],
    source: { sc: 'HomeHub HK', tc: 'HomeHub HK', en: 'HomeHub HK' },
    photos: [
      { key: 'living4', caption: c.living },
      { key: 'bed1', caption: c.bed },
      { key: 'kitchen1', caption: c.kitchen },
    ],
    partnerLikes: false,
    partnerReason: { sc: '低层太吵了', tc: '低層太嘈', en: 'low floor, too noisy' },
  },
  {
    id: 'sw',
    title: { sc: '上环 · 太平山街', tc: '上環 · 太平山街', en: 'Sheung Wan · Tai Ping Shan St' },
    district: { sc: '港岛', tc: '港島', en: 'HK Island' },
    rent: 16800, beds: 2, baths: 1, sizeFt: 400,
    floor: { sc: '8 楼', tc: '8 樓', en: '8/F' },
    mtr: { sc: '上环站 7 分钟', tc: '上環站 7 分鐘', en: '7 min to Sheung Wan' },
    available: { sc: '10 月底', tc: '10 月尾', en: 'Late October' },
    features: [f.quiet, f.cook, f.lift, f.pets],
    source: { sc: 'Spacebox', tc: 'Spacebox', en: 'Spacebox' },
    photos: [
      { key: 'living2', caption: c.living },
      { key: 'bed5', caption: c.bed },
      { key: 'hkHarbourNight', caption: c.view },
    ],
    partnerLikes: true,
  },
  {
    id: 'tw',
    title: { sc: '荃湾 · 海滨花园', tc: '荃灣 · 海濱花園', en: 'Tsuen Wan · Riviera Gardens' },
    district: { sc: '新界', tc: '新界', en: 'New Territories' },
    rent: 14500, beds: 2, baths: 1, sizeFt: 450,
    floor: { sc: '22 楼', tc: '22 樓', en: '22/F' },
    mtr: { sc: '荃湾西站 8 分钟', tc: '荃灣西站 8 分鐘', en: '8 min to Tsuen Wan West' },
    available: { sc: '即时入住', tc: '即時入住', en: 'Available now' },
    features: [f.view, f.gym, f.lift, f.washer],
    source: { sc: '业主直租', tc: '業主直租', en: 'Owner direct' },
    photos: [
      { key: 'living6', caption: c.living },
      { key: 'bed4', caption: c.bed },
      { key: 'hkHarbourDay', caption: c.view },
    ],
    partnerLikes: false,
    partnerReason: { sc: '想住市区一点', tc: '想住近市區啲', en: 'wants somewhere more central' },
  },
]

export const ROOMS_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<string, Room>

export const BUDGET_MAX: Record<string, number> = { lt6: 6000, '6to9': 9000, '9to12': 12000, gt12: 99999 }

export function hkd(n: number) {
  return 'HK$' + n.toLocaleString('en-US')
}
