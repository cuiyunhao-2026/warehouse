import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认库存记录数据 */
const defaultInventoryLogs: Api.Inventory.InventoryLog[] = [
  {
    id: 1,
    productId: 1,
    type: 'inbound',
    quantity: 20,
    beforeStock: 130,
    afterStock: 150,
    reason: '采购入库-PO-20240115-001',
    operatorId: 1,
    createdAt: '2024-01-15 15:00:00'
  },
  {
    id: 2,
    productId: 2,
    type: 'inbound',
    quantity: 10,
    beforeStock: 70,
    afterStock: 80,
    reason: '采购入库-PO-20240115-001',
    operatorId: 1,
    createdAt: '2024-01-15 15:05:00'
  },
  {
    id: 3,
    productId: 3,
    type: 'inbound',
    quantity: 15,
    beforeStock: 105,
    afterStock: 120,
    reason: '采购入库-PO-20240115-001',
    operatorId: 1,
    createdAt: '2024-01-15 15:10:00'
  },
  {
    id: 4,
    productId: 1,
    type: 'outbound',
    quantity: 2,
    beforeStock: 150,
    afterStock: 148,
    reason: '销售出库-SO-20240116-001',
    operatorId: 2,
    createdAt: '2024-01-16 16:00:00'
  },
  {
    id: 5,
    productId: 2,
    type: 'outbound',
    quantity: 1,
    beforeStock: 80,
    afterStock: 79,
    reason: '销售出库-SO-20240117-002',
    operatorId: 2,
    createdAt: '2024-01-17 12:00:00'
  },
  {
    id: 6,
    productId: 12,
    type: 'outbound',
    quantity: 1,
    beforeStock: 26,
    afterStock: 25,
    reason: '销售出库-SO-20240117-002',
    operatorId: 2,
    createdAt: '2024-01-17 12:05:00'
  },
  {
    id: 7,
    productId: 5,
    type: 'inbound',
    quantity: 100,
    beforeStock: 100,
    afterStock: 200,
    reason: '采购入库-PO-20240118-002',
    operatorId: 1,
    createdAt: '2024-01-18 17:00:00'
  },
  {
    id: 8,
    productId: 6,
    type: 'inbound',
    quantity: 5000,
    beforeStock: 500,
    afterStock: 5500,
    reason: '采购入库-PO-20240118-002',
    operatorId: 1,
    createdAt: '2024-01-18 17:05:00'
  },
  {
    id: 9,
    productId: 3,
    type: 'outbound',
    quantity: 1,
    beforeStock: 120,
    afterStock: 119,
    reason: '销售出库-SO-20240119-003',
    operatorId: 2,
    createdAt: '2024-01-19 18:00:00'
  },
  {
    id: 10,
    productId: 1,
    type: 'outbound',
    quantity: 5,
    beforeStock: 148,
    afterStock: 143,
    reason: '销售出库',
    operatorId: 2,
    createdAt: '2024-01-20 10:00:00'
  },
  {
    id: 11,
    productId: 5,
    type: 'outbound',
    quantity: 10,
    beforeStock: 200,
    afterStock: 190,
    reason: '销售出库-SO-20240121-004',
    operatorId: 2,
    createdAt: '2024-01-21 11:00:00'
  },
  {
    id: 12,
    productId: 1,
    type: 'inbound',
    quantity: 7,
    beforeStock: 143,
    afterStock: 150,
    reason: '补货入库',
    operatorId: 1,
    createdAt: '2024-01-22 09:00:00'
  },
  {
    id: 13,
    productId: 6,
    type: 'outbound',
    quantity: 4500,
    beforeStock: 5500,
    afterStock: 1000,
    reason: '批量出库',
    operatorId: 2,
    createdAt: '2024-01-23 14:00:00'
  },
  {
    id: 14,
    productId: 9,
    type: 'inbound',
    quantity: 1000,
    beforeStock: 1000,
    afterStock: 2000,
    reason: '补货入库',
    operatorId: 1,
    createdAt: '2024-01-24 08:30:00'
  },
  {
    id: 15,
    productId: 8,
    type: 'check',
    quantity: 0,
    beforeStock: 10,
    afterStock: 5,
    reason: '库存盘点-盘亏5件',
    operatorId: 3,
    createdAt: '2024-01-25 16:00:00'
  },
  {
    id: 16,
    productId: 11,
    type: 'check',
    quantity: 0,
    beforeStock: 10,
    afterStock: 8,
    reason: '库存盘点-盘亏2件',
    operatorId: 3,
    createdAt: '2024-01-25 16:30:00'
  }
]

/** 库存记录数据（从localStorage加载或使用默认数据） */
export const inventoryLogList = reactive<Api.Inventory.InventoryLog[]>(
  getMockData('inventoryLogs', defaultInventoryLogs)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...inventoryLogList],
  (newValue) => {
    setMockData('inventoryLogs', newValue)
  },
  { deep: true }
)

/** 获取库存记录 */
export function getInventoryLogsByProductId(productId: number): Api.Inventory.InventoryLog[] {
  return inventoryLogList.filter((log) => log.productId === productId)
}

/** 重置库存记录数据 */
export function resetInventoryLogs(): void {
  inventoryLogList.splice(0, inventoryLogList.length, ...defaultInventoryLogs)
}
