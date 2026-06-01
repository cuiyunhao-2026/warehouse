import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认采购订单数据 */
const defaultPurchaseOrders: Api.Inventory.PurchaseOrder[] = [
  {
    id: 1,
    orderNo: 'PO-20240115-001',
    supplierId: 1,
    totalAmount: 325000,
    status: 'completed',
    remark: '苹果产品补货',
    items: [
      { id: 1, productId: 1, quantity: 20, price: 6500, amount: 130000 },
      { id: 2, productId: 2, quantity: 10, price: 11000, amount: 110000 },
      { id: 3, productId: 3, quantity: 15, price: 3500, amount: 52500 },
      { id: 4, productId: 12, quantity: 20, price: 1200, amount: 24000 }
    ],
    createdAt: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    orderNo: 'PO-20240118-002',
    supplierId: 3,
    totalAmount: 15600,
    status: 'completed',
    remark: '办公用品采购',
    items: [
      { id: 5, productId: 5, quantity: 100, price: 55, amount: 5500 },
      { id: 6, productId: 6, quantity: 5000, price: 1, amount: 5000 },
      { id: 7, productId: 7, quantity: 500, price: 3, amount: 1500 }
    ],
    createdAt: '2024-01-18 14:30:00'
  },
  {
    id: 3,
    orderNo: 'PO-20240120-003',
    supplierId: 4,
    totalAmount: 28000,
    status: 'approved',
    remark: '食品饮料补货',
    items: [
      { id: 8, productId: 8, quantity: 1000, price: 7, amount: 7000 },
      { id: 9, productId: 9, quantity: 5000, price: 0.8, amount: 4000 }
    ],
    createdAt: '2024-01-20 09:15:00'
  },
  {
    id: 4,
    orderNo: 'PO-20240122-004',
    supplierId: 5,
    totalAmount: 8500,
    status: 'pending',
    remark: '日用品采购',
    items: [
      { id: 9, productId: 10, quantity: 500, price: 8, amount: 4000 },
      { id: 10, productId: 11, quantity: 500, price: 10, amount: 5000 }
    ],
    createdAt: '2024-01-22 16:45:00'
  },
  {
    id: 5,
    orderNo: 'PO-20240125-005',
    supplierId: 1,
    totalAmount: 75000,
    status: 'cancelled',
    remark: '已取消-价格未谈拢',
    items: [{ id: 11, productId: 1, quantity: 10, price: 6500, amount: 65000 }],
    createdAt: '2024-01-25 11:20:00'
  }
]

/** 采购订单数据（从localStorage加载或使用默认数据） */
export const purchaseOrderList = reactive<Api.Inventory.PurchaseOrder[]>(
  getMockData('purchaseOrders', defaultPurchaseOrders)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...purchaseOrderList],
  (newValue) => {
    setMockData('purchaseOrders', newValue)
  },
  { deep: true }
)

/** 获取采购订单信息 */
export function getPurchaseOrderById(id: number): Api.Inventory.PurchaseOrder | undefined {
  return purchaseOrderList.find((p) => p.id === id)
}

/** 重置采购订单数据 */
export function resetPurchaseOrders(): void {
  purchaseOrderList.splice(0, purchaseOrderList.length, ...defaultPurchaseOrders)
}
