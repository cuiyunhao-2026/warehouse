import { reactive } from 'vue'

/** 商品单位数据 */
export const unitList = reactive<Api.Inventory.Unit[]>([
  { id: 1, name: '个', symbol: '个' },
  { id: 2, name: '台', symbol: '台' },
  { id: 3, name: '箱', symbol: '箱' },
  { id: 4, name: '包', symbol: '包' },
  { id: 5, name: '瓶', symbol: '瓶' },
  { id: 6, name: '盒', symbol: '盒' },
  { id: 7, name: '件', symbol: '件' },
  { id: 8, name: '套', symbol: '套' },
  { id: 9, name: '本', symbol: '本' },
  { id: 10, name: '支', symbol: '支' }
])

/** 获取单位名称 */
export function getUnitName(id: number): string {
  return unitList.find((u) => u.id === id)?.name || ''
}
