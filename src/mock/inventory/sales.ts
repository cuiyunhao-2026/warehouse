import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认销售订单数据 */
const defaultSalesOrders: Api.Inventory.SalesOrder[] = [
  {
    id: 1,
    orderNo: 'SO-20240116-001',
    customerName: '张三',
    customerPhone: '13900139001',
    totalAmount: 17998,
    status: 'completed',
    remark: '个人购买',
    items: [{ id: 1, productId: 1, quantity: 2, price: 8999, amount: 17998 }],
    createdAt: '2024-01-16 14:30:00'
  },
  {
    id: 2,
    orderNo: 'SO-20240117-002',
    customerName: '李四',
    customerPhone: '13900139002',
    totalAmount: 19797,
    status: 'completed',
    remark: '公司采购',
    items: [
      { id: 2, productId: 2, quantity: 1, price: 14999, amount: 14999 },
      { id: 3, productId: 12, quantity: 1, price: 1899, amount: 1899 },
      { id: 4, productId: 4, quantity: 40, price: 69, amount: 2760 }
    ],
    createdAt: '2024-01-17 10:15:00'
  },
  {
    id: 3,
    orderNo: 'SO-20240119-003',
    customerName: '王五',
    customerPhone: '13900139003',
    totalAmount: 4799,
    status: 'completed',
    remark: '',
    items: [{ id: 5, productId: 3, quantity: 1, price: 4799, amount: 4799 }],
    createdAt: '2024-01-19 16:40:00'
  },
  {
    id: 4,
    orderNo: 'SO-20240121-004',
    customerName: '赵六',
    customerPhone: '13900139004',
    totalAmount: 890,
    status: 'completed',
    remark: '办公用品团购',
    items: [{ id: 6, productId: 5, quantity: 10, price: 89, amount: 890 }],
    createdAt: '2024-01-21 09:20:00'
  },
  {
    id: 5,
    orderNo: 'SO-20240123-005',
    customerName: '钱七',
    customerPhone: '13900139005',
    totalAmount: 36997,
    status: 'pending',
    remark: '等待发货',
    items: [
      { id: 7, productId: 1, quantity: 3, price: 8999, amount: 26997 },
      { id: 8, productId: 12, quantity: 3, price: 1899, amount: 5697 },
      { id: 9, productId: 4, quantity: 50, price: 69, amount: 3450 }
    ],
    createdAt: '2024-01-23 11:30:00'
  },
  {
    id: 6,
    orderNo: 'SO-20240124-006',
    customerName: '孙八',
    customerPhone: '13900139006',
    totalAmount: 240,
    status: 'cancelled',
    remark: '客户取消',
    items: [
      { id: 10, productId: 9, quantity: 100, price: 2, amount: 200 },
      { id: 11, productId: 8, quantity: 3, price: 12, amount: 36 }
    ],
    createdAt: '2024-01-24 15:10:00'
  }
]

/** 销售订单数据（从localStorage加载或使用默认数据） */
export const salesOrderList = reactive<Api.Inventory.SalesOrder[]>(
  getMockData('salesOrders', defaultSalesOrders)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...salesOrderList],
  (newValue) => {
    setMockData('salesOrders', newValue)
  },
  { deep: true }
)

/** 获取销售订单信息 */
export function getSalesOrderById(id: number): Api.Inventory.SalesOrder | undefined {
  return salesOrderList.find((s) => s.id === id)
}

/** 重置销售订单数据 */
export function resetSalesOrders(): void {
  salesOrderList.splice(0, salesOrderList.length, ...defaultSalesOrders)
}
