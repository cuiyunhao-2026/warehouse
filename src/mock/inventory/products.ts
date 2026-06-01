import { reactive, watch } from 'vue'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 默认商品数据 */
const defaultProducts: Api.Inventory.Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    code: 'PHONE-001',
    categoryId: 11,
    warehouseId: 1,
    unit: '台',
    price: 8999,
    cost: 6500,
    stock: 150,
    minStock: 20,
    description: 'Apple iPhone 15 Pro 256GB',
    status: '1',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'MacBook Pro 14',
    code: 'PC-001',
    categoryId: 12,
    warehouseId: 1,
    unit: '台',
    price: 14999,
    cost: 11000,
    stock: 80,
    minStock: 10,
    description: 'Apple MacBook Pro 14英寸 M3芯片',
    status: '1',
    createdAt: '2024-01-16 09:20:00'
  },
  {
    id: 3,
    name: 'iPad Air',
    code: 'PAD-001',
    categoryId: 13,
    warehouseId: 2,
    unit: '台',
    price: 4799,
    cost: 3500,
    stock: 120,
    minStock: 15,
    description: 'Apple iPad Air M1芯片 256GB',
    status: '1',
    createdAt: '2024-01-17 14:10:00'
  },
  {
    id: 4,
    name: 'USB-C数据线',
    code: 'ACC-001',
    categoryId: 14,
    warehouseId: 2,
    unit: '条',
    price: 69,
    cost: 25,
    stock: 500,
    minStock: 100,
    description: 'USB-C to USB-C 1米数据线',
    status: '1',
    createdAt: '2024-01-18 11:00:00'
  },
  {
    id: 5,
    name: 'A4打印纸',
    code: 'PAPER-001',
    categoryId: 21,
    warehouseId: 1,
    unit: '箱',
    price: 89,
    cost: 55,
    stock: 200,
    minStock: 30,
    description: 'A4复印纸 70g 500张/包 5包/箱',
    status: '1',
    createdAt: '2024-01-19 08:30:00'
  },
  {
    id: 6,
    name: '中性笔',
    code: 'PEN-001',
    categoryId: 22,
    warehouseId: 3,
    unit: '支',
    price: 3,
    cost: 1,
    stock: 1000,
    minStock: 200,
    description: '黑色中性笔 0.5mm',
    status: '1',
    createdAt: '2024-01-20 15:40:00'
  },
  {
    id: 7,
    name: '文件夹',
    code: 'FOLDER-001',
    categoryId: 23,
    warehouseId: 3,
    unit: '个',
    price: 8,
    cost: 3,
    stock: 300,
    minStock: 50,
    description: 'A4双夹文件夹',
    status: '1',
    createdAt: '2024-01-21 10:20:00'
  },
  {
    id: 8,
    name: '薯片',
    code: 'SNACK-001',
    categoryId: 31,
    warehouseId: 1,
    unit: '包',
    price: 12,
    cost: 7,
    stock: 5,
    minStock: 50,
    description: '原味薯片 100g',
    status: '1',
    createdAt: '2024-01-22 09:15:00'
  },
  {
    id: 9,
    name: '矿泉水',
    code: 'DRINK-001',
    categoryId: 32,
    warehouseId: 1,
    unit: '瓶',
    price: 2,
    cost: 0.8,
    stock: 2000,
    minStock: 300,
    description: '纯净水 550ml',
    status: '1',
    createdAt: '2024-01-23 14:30:00'
  },
  {
    id: 10,
    name: '洗洁精',
    code: 'CLEAN-001',
    categoryId: 41,
    warehouseId: 2,
    unit: '瓶',
    price: 15,
    cost: 8,
    stock: 150,
    minStock: 30,
    description: '柠檬洗洁精 500ml',
    status: '1',
    createdAt: '2024-01-24 11:45:00'
  },
  {
    id: 11,
    name: '保鲜膜',
    code: 'KITCHEN-001',
    categoryId: 42,
    warehouseId: 3,
    unit: '卷',
    price: 18,
    cost: 10,
    stock: 8,
    minStock: 20,
    description: 'PE保鲜膜 30cm*30m',
    status: '1',
    createdAt: '2024-01-25 16:20:00'
  },
  {
    id: 12,
    name: 'AirPods Pro',
    code: 'ACC-002',
    categoryId: 14,
    warehouseId: 1,
    unit: '个',
    price: 1899,
    cost: 1200,
    stock: 25,
    minStock: 15,
    description: 'Apple AirPods Pro 第二代',
    status: '1',
    createdAt: '2024-01-26 13:10:00'
  }
]

/** 商品数据（从localStorage加载或使用默认数据） */
export const productList = reactive<Api.Inventory.Product[]>(
  getMockData('products', defaultProducts)
)

// 监听数据变化，自动保存到localStorage
watch(
  () => [...productList],
  (newValue) => {
    setMockData('products', newValue)
  },
  { deep: true }
)

/** 获取商品名称 */
export function getProductName(id: number): string {
  return productList.find((p) => p.id === id)?.name || ''
}

/** 获取商品信息 */
export function getProductById(id: number): Api.Inventory.Product | undefined {
  return productList.find((p) => p.id === id)
}

/** 重置商品数据 */
export function resetProducts(): void {
  productList.splice(0, productList.length, ...defaultProducts)
}
