import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认仓库数据 */
const defaultWarehouses: Api.Inventory.Warehouse[] = [
  {
    id: 1,
    name: '主仓库',
    location: '北京市朝阳区仓储中心A栋',
    status: '1',
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    name: '东区分仓',
    location: '北京市通州区物流园B区',
    status: '1',
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    name: '南区分仓',
    location: '北京市大兴区仓储基地C栋',
    status: '1',
    createdAt: '2024-01-01 00:00:00'
  },
  {
    id: 4,
    name: '临时仓库',
    location: '北京市顺义区临时存储点',
    status: '2',
    createdAt: '2024-01-15 10:00:00'
  }
]

/** 仓库数据（从localStorage加载或使用默认数据） */
export const warehouseList = reactive<Api.Inventory.Warehouse[]>(
  getMockData('warehouses', defaultWarehouses)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...warehouseList],
  (newValue) => {
    setMockData('warehouses', newValue)
  },
  { deep: true }
)

/** 获取仓库名称 */
export function getWarehouseName(id: number): string {
  return warehouseList.find((w) => w.id === id)?.name || ''
}

/** 重置仓库数据 */
export function resetWarehouses(): void {
  warehouseList.splice(0, warehouseList.length, ...defaultWarehouses)
}
