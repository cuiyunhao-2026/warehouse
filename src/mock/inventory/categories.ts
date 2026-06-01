import { reactive } from 'vue'

/** 商品分类数据 */
export const categoryList = reactive<Api.Inventory.Category[]>([
  {
    id: 1,
    name: '电子产品',
    parentId: null,
    sort: 1,
    status: '1',
    children: [
      { id: 11, name: '手机', parentId: 1, sort: 1, status: '1' },
      { id: 12, name: '电脑', parentId: 1, sort: 2, status: '1' },
      { id: 13, name: '平板', parentId: 1, sort: 3, status: '1' },
      { id: 14, name: '配件', parentId: 1, sort: 4, status: '1' }
    ]
  },
  {
    id: 2,
    name: '办公用品',
    parentId: null,
    sort: 2,
    status: '1',
    children: [
      { id: 21, name: '纸张', parentId: 2, sort: 1, status: '1' },
      { id: 22, name: '笔类', parentId: 2, sort: 2, status: '1' },
      { id: 23, name: '文件夹', parentId: 2, sort: 3, status: '1' }
    ]
  },
  {
    id: 3,
    name: '食品饮料',
    parentId: null,
    sort: 3,
    status: '1',
    children: [
      { id: 31, name: '零食', parentId: 3, sort: 1, status: '1' },
      { id: 32, name: '饮料', parentId: 3, sort: 2, status: '1' }
    ]
  },
  {
    id: 4,
    name: '日用百货',
    parentId: null,
    sort: 4,
    status: '1',
    children: [
      { id: 41, name: '清洁用品', parentId: 4, sort: 1, status: '1' },
      { id: 42, name: '厨房用品', parentId: 4, sort: 2, status: '1' }
    ]
  }
])

/** 获取所有分类（扁平化） */
export function getAllCategories(): Api.Inventory.Category[] {
  const result: Api.Inventory.Category[] = []
  const flatten = (list: Api.Inventory.Category[]) => {
    list.forEach((item) => {
      result.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }
  flatten(categoryList)
  return result
}

/** 获取分类名称 */
export function getCategoryName(id: number): string {
  const categories = getAllCategories()
  return categories.find((c) => c.id === id)?.name || ''
}
