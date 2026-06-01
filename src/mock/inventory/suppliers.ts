import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认供应商数据 */
const defaultSuppliers: Api.Inventory.Supplier[] = [
  {
    id: 1,
    name: '苹果官方授权经销商',
    contact: '张经理',
    phone: '13800138001',
    email: 'zhang@apple-dealer.com',
    address: '北京市朝阳区建国路88号',
    status: '1',
    createdAt: '2024-01-10 10:00:00'
  },
  {
    id: 2,
    name: '联想批发中心',
    contact: '李经理',
    phone: '13800138002',
    email: 'li@lenovo-wholesale.com',
    address: '上海市浦东新区陆家嘴路100号',
    status: '1',
    createdAt: '2024-01-11 09:30:00'
  },
  {
    id: 3,
    name: '办公用品总汇',
    contact: '王经理',
    phone: '13800138003',
    email: 'wang@office-supply.com',
    address: '广州市天河区天河路385号',
    status: '1',
    createdAt: '2024-01-12 14:20:00'
  },
  {
    id: 4,
    name: '食品批发城',
    contact: '赵经理',
    phone: '13800138004',
    email: 'zhao@food-wholesale.com',
    address: '深圳市福田区深南大道6008号',
    status: '1',
    createdAt: '2024-01-13 11:15:00'
  },
  {
    id: 5,
    name: '日用品批发市场',
    contact: '刘经理',
    phone: '13800138005',
    email: 'liu@daily-goods.com',
    address: '成都市武侯区人民南路四段',
    status: '1',
    createdAt: '2024-01-14 16:30:00'
  },
  {
    id: 6,
    name: '电子产品集散中心',
    contact: '陈经理',
    phone: '13800138006',
    email: 'chen@electronics.com',
    address: '杭州市西湖区文三路478号',
    status: '2',
    createdAt: '2024-01-15 08:45:00'
  }
]

/** 供应商数据（从localStorage加载或使用默认数据） */
export const supplierList = reactive<Api.Inventory.Supplier[]>(
  getMockData('suppliers', defaultSuppliers)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...supplierList],
  (newValue) => {
    setMockData('suppliers', newValue)
  },
  { deep: true }
)

/** 获取供应商名称 */
export function getSupplierName(id: number): string {
  return supplierList.find((s) => s.id === id)?.name || ''
}

/** 获取供应商信息 */
export function getSupplierById(id: number): Api.Inventory.Supplier | undefined {
  return supplierList.find((s) => s.id === id)
}

/** 重置供应商数据 */
export function resetSuppliers(): void {
  supplierList.splice(0, supplierList.length, ...defaultSuppliers)
}
