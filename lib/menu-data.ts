import { MenuCategory, MenuItem } from '@/types'

function makeItem(
  id: string,
  categoryId: string,
  name: string,
  price: number,
  description?: string,
  isAvailable = true
): MenuItem {
  return { id, categoryId, name, price, description, isAvailable }
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'pan-fried',
    name: '煎類',
    sortOrder: 1,
    items: [
      makeItem('pf-01', 'pan-fried', '蚵仔煎', 80),
      makeItem('pf-02', 'pan-fried', '蝦仁煎', 80),
      makeItem('pf-03', 'pan-fried', '綜合煎', 95),
      makeItem('pf-04', 'pan-fried', '雙蛋煎', 75),
      makeItem('pf-05', 'pan-fried', '蔥花煎蛋(1人份)', 30),
      makeItem('pf-06', 'pan-fried', '蝦仁蔥蛋', 120),
      makeItem('pf-07', 'pan-fried', '蝦仁惹蛋', 120),
      makeItem('pf-08', 'pan-fried', '無刺虱目魚煎蛋', 190),
    ],
  },
  {
    id: 'noodle',
    name: '湯麵／乾麵類',
    sortOrder: 2,
    items: [
      makeItem('nd-01', 'noodle', '蚵仔湯麵', 100, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-02', 'noodle', '蚵仔乾麵', 100, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-03', 'noodle', '海鮮湯麵', 120, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-04', 'noodle', '無刺虱目魚肚湯麵', 130, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-05', 'noodle', '無刺虱目魚(去皮)湯麵', 120, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-06', 'noodle', '虱目魚皮湯麵', 110, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-07', 'noodle', '蛤蠣湯麵', 110, '麵種可選：油麵／米粉／麵線／板條'),
      makeItem('nd-08', 'noodle', '乾油麵', 55),
      makeItem('nd-09', 'noodle', '乾米粉', 55),
      makeItem('nd-10', 'noodle', '乾麵線', 55),
      makeItem('nd-11', 'noodle', '乾板條', 55),
    ],
  },
  {
    id: 'porridge',
    name: '粥類',
    sortOrder: 3,
    items: [
      makeItem('po-01', 'porridge', '蚵仔粥', 100),
      makeItem('po-02', 'porridge', '海鮮粥', 120),
      makeItem('po-03', 'porridge', '無刺虱目魚肚粥', 130),
      makeItem('po-04', 'porridge', '無刺虱目魚(去皮)粥', 130),
      makeItem('po-05', 'porridge', '虱目魚皮粥', 120),
      makeItem('po-06', 'porridge', '蛤蠣粥', 120),
      makeItem('po-07', 'porridge', '★痛風海鮮粥', 200, '豐盛海鮮滿料'),
    ],
  },
  {
    id: 'soup',
    name: '湯類',
    sortOrder: 4,
    items: [
      makeItem('sp-01', 'soup', '蚵仔湯', 95),
      makeItem('sp-02', 'soup', '海鮮湯', 95),
      makeItem('sp-03', 'soup', '無刺魚肚湯', 95),
      makeItem('sp-04', 'soup', '無刺虱目魚(去皮)湯', 90),
      makeItem('sp-05', 'soup', '虱目魚皮湯', 90),
      makeItem('sp-06', 'soup', '蛤蠣湯', 80),
      makeItem('sp-07', 'soup', '虱目魚丸湯', 60),
    ],
  },
  {
    id: 'fried',
    name: '炸物類',
    sortOrder: 5,
    items: [
      makeItem('fr-01', 'fried', '蚵仔酥', 140),
      makeItem('fr-02', 'fried', '泰式月亮蝦餅', 150),
      makeItem('fr-03', 'fried', '沙拉蝦球', 130),
      makeItem('fr-04', 'fried', '炸虱目魚柳', 90),
      makeItem('fr-05', 'fried', '炸魷魚', 90),
      makeItem('fr-06', 'fried', '炸蝦捲', 90),
      makeItem('fr-07', 'fried', '炸虱目魚丸', 70),
      makeItem('fr-08', 'fried', '招牌炸豆腐', 60),
    ],
  },
  {
    id: 'rice',
    name: '飯類',
    sortOrder: 6,
    items: [
      makeItem('ri-01', 'rice', '蚵仔魯肉飯', 90),
      makeItem('ri-02', 'rice', '蒸蝦魯肉飯', 90),
      makeItem('ri-03', 'rice', '魯肉飯(小)', 40),
      makeItem('ri-04', 'rice', '魯肉飯(大)', 55),
      makeItem('ri-05', 'rice', '白飯', 20),
    ],
  },
  {
    id: 'garlic-boil',
    name: '蒜泥／川燙類',
    sortOrder: 7,
    items: [
      makeItem('gb-01', 'garlic-boil', '蒜泥蝦蛄', 140),
      makeItem('gb-02', 'garlic-boil', '蒜泥白肉', 80),
      makeItem('gb-03', 'garlic-boil', '川燙魷魚', 110),
      makeItem('gb-04', 'garlic-boil', '川燙鮮蝦', 110),
      makeItem('gb-05', 'garlic-boil', '川燙虱目魚皮', 90),
      makeItem('gb-06', 'garlic-boil', '虱目魚皮', 100),
      makeItem('gb-07', 'garlic-boil', '蛤蠣濃菇羹', 130),
    ],
  },
  {
    id: 'side',
    name: '小菜',
    sortOrder: 8,
    items: [
      makeItem('sd-01', 'side', '胡麻苦瓜', 55),
      makeItem('sd-02', 'side', '燙青菜', 45),
      makeItem('sd-03', 'side', '皮蛋', 20),
      makeItem('sd-04', 'side', '荷包蛋', 20),
    ],
  },
  {
    id: 'bento',
    name: '便當類',
    sortOrder: 9,
    items: [
      makeItem('bn-01', 'bento', '魚批便當', 140),
      makeItem('bn-02', 'bento', '熱魚批便當', 135),
      makeItem('bn-03', 'bento', '滷肉肉便當', 100),
    ],
  },
]

export const ALL_MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items)
