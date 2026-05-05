import { MenuCategory, MenuItem } from '@/types'

function item(id: string, catId: string, price: number, avail = true, redChar?: string): MenuItem {
  return { id, categoryId: catId, name: id, price, isAvailable: avail, redChar }
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'pan-fried', name: '煎類', sortOrder: 1,
    items: [
      item('pf-01', 'pan-fried', 80),
      item('pf-02', 'pan-fried', 80),
      item('pf-03', 'pan-fried', 95),
      item('pf-04', 'pan-fried', 75),
      item('pf-05', 'pan-fried', 30),
      item('pf-06', 'pan-fried', 120),
      item('pf-07', 'pan-fried', 120),
      item('pf-09', 'pan-fried', 190),
    ],
  },
  {
    id: 'noodle-soup', name: '湯麵類', sortOrder: 2,
    items: [
      item('ns-oy-oil',   'noodle-soup', 100),
      item('ns-oy-rice',  'noodle-soup', 100),
      item('ns-oy-misua', 'noodle-soup', 100),
      item('ns-oy-board', 'noodle-soup', 100),
      item('ns-sf-oil',   'noodle-soup', 120),
      item('ns-sf-rice',  'noodle-soup', 120),
      item('ns-sf-misua', 'noodle-soup', 120),
      item('ns-sf-board', 'noodle-soup', 120),
      item('ns-mb-oil',   'noodle-soup', 130),
      item('ns-mb-rice',  'noodle-soup', 130),
      item('ns-mb-board', 'noodle-soup', 130),
      item('ns-mb-misua', 'noodle-soup', 130),
      item('ns-ms-oil',   'noodle-soup', 120),
      item('ns-ms-rice',  'noodle-soup', 120),
      item('ns-ms-misua', 'noodle-soup', 120),
      item('ns-ms-board', 'noodle-soup', 120),
      item('ns-sk-oil',   'noodle-soup', 110),
      item('ns-sk-rice',  'noodle-soup', 110),
      item('ns-sk-board', 'noodle-soup', 110),
      item('ns-sk-misua', 'noodle-soup', 110),
      item('ns-cl-oil',   'noodle-soup', 110),
      item('ns-cl-rice',  'noodle-soup', 110),
      item('ns-cl-board', 'noodle-soup', 110),
      item('ns-cl-misua', 'noodle-soup', 110),
    ],
  },
  {
    id: 'noodle-dry', name: '乾麵類', sortOrder: 3,
    items: [
      item('nd-oy-oil',   'noodle-dry', 100),
      item('nd-oy-rice',  'noodle-dry', 100),
      item('nd-oy-misua', 'noodle-dry', 100),
      item('nd-oy-board', 'noodle-dry', 100),
      item('nd-pl-oil',   'noodle-dry', 55),
      item('nd-pl-rice',  'noodle-dry', 55),
      item('nd-pl-misua', 'noodle-dry', 55),
      item('nd-pl-board', 'noodle-dry', 55),
    ],
  },
  {
    id: 'porridge', name: '粥類', sortOrder: 4,
    items: [
      item('po-01', 'porridge', 100),
      item('po-02', 'porridge', 120),
      item('po-03', 'porridge', 130),
      item('po-04', 'porridge', 120),
      item('po-05', 'porridge', 120),
      item('po-06', 'porridge', 110),
      item('po-07', 'porridge', 200),
    ],
  },
  {
    id: 'soup', name: '湯類', sortOrder: 5,
    items: [
      item('sp-01', 'soup', 80),
      item('sp-02', 'soup', 95),
      item('sp-03', 'soup', 95),
      item('sp-04', 'soup', 90),
      item('sp-05', 'soup', 90),
      item('sp-06', 'soup', 80),
      item('sp-07', 'soup', 60),
    ],
  },
  {
    id: 'fried', name: '炸物類', sortOrder: 6,
    items: [
      item('fr-01', 'fried', 140),
      item('fr-02', 'fried', 150),
      item('fr-03', 'fried', 130),
      item('fr-04', 'fried', 90),
      item('fr-09', 'fried', 90),
      item('fr-05', 'fried', 90),
      item('fr-06', 'fried', 90),
      item('fr-07', 'fried', 70),
      item('fr-08', 'fried', 60),
    ],
  },
  {
    id: 'rice', name: '飯類', sortOrder: 7,
    items: [
      item('ri-01', 'rice', 90),
      item('ri-02', 'rice', 90),
      item('ri-03', 'rice', 40),
      item('ri-04', 'rice', 55),
      item('ri-05', 'rice', 20),
    ],
  },
  {
    id: 'garlic-boil', name: '蒜泥/川燙', sortOrder: 8,
    items: [
      item('gb-08', 'garlic-boil', 140),
      item('gb-02', 'garlic-boil', 80),
      item('gb-03', 'garlic-boil', 110),
      item('gb-04', 'garlic-boil', 110),
      item('gb-06', 'garlic-boil', 100),
    ],
  },
  {
    id: 'side', name: '小菜', sortOrder: 9,
    items: [
      item('sd-06', 'side', 100, true, '魯'),
      item('sd-07', 'side', 95, true, '魯'),
      item('sd-08', 'side', 80),
      item('sd-01', 'side', 55),
      item('sd-02', 'side', 45),
      item('sd-04', 'side', 20),
      item('sd-05', 'side', 20),
    ],
  },
  {
    id: 'bento', name: '便當類', sortOrder: 10,
    items: [
      item('bn-03', 'bento', 100),
      item('bn-04', 'bento', 135),
      item('bn-05', 'bento', 140),
      item('bn-06', 'bento', 40),
      item('bn-07', 'bento', 40),
    ],
  },
]

export const ALL_MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items)
