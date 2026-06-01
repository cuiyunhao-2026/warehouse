/**
 * 库存管理系统类型定义
 */

declare namespace Api {
  namespace Inventory {
    /** 商品状态 */
    type ProductStatus = '1' | '2'

    /** 商品 */
    interface Product {
      id: number
      name: string
      code: string
      categoryId: number
      categoryName?: string
      warehouseId: number
      warehouseName?: string
      unit: string
      price: number
      cost: number
      stock: number
      minStock: number
      description: string
      status: ProductStatus
      createdAt: string
      updatedAt?: string
    }

    /** 商品搜索参数 */
    type ProductSearchParams = Partial<
      Pick<Product, 'name' | 'code' | 'categoryId' | 'status' | 'warehouseId'>
    > &
      Api.Common.CommonSearchParams

    /** 商品列表 */
    type ProductList = Api.Common.PaginatedResponse<Product>

    /** 商品分类 */
    interface Category {
      id: number
      name: string
      parentId: number | null
      sort: number
      status: ProductStatus
      children?: Category[]
    }

    /** 分类搜索参数 */
    type CategorySearchParams = Partial<Pick<Category, 'name' | 'status'>>

    /** 商品单位 */
    interface Unit {
      id: number
      name: string
      symbol: string
    }

    /** 供应商状态 */
    type SupplierStatus = '1' | '2'

    /** 供应商 */
    interface Supplier {
      id: number
      name: string
      contact: string
      phone: string
      email: string
      address: string
      status: SupplierStatus
      createdAt: string
    }

    /** 供应商搜索参数 */
    type SupplierSearchParams = Partial<Pick<Supplier, 'name' | 'contact' | 'status'>> &
      Api.Common.CommonSearchParams

    /** 供应商列表 */
    type SupplierList = Api.Common.PaginatedResponse<Supplier>

    /** 采购订单状态 */
    type PurchaseOrderStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

    /** 采购明细 */
    interface PurchaseItem {
      id?: number
      productId: number
      productName?: string
      quantity: number
      price: number
      amount: number
    }

    /** 采购订单 */
    interface PurchaseOrder {
      id: number
      orderNo: string
      supplierId: number
      supplierName?: string
      totalAmount: number
      status: PurchaseOrderStatus
      remark?: string
      items: PurchaseItem[]
      createdAt: string
      updatedAt?: string
    }

    /** 采购订单搜索参数 */
    type PurchaseOrderSearchParams = Partial<
      Pick<PurchaseOrder, 'orderNo' | 'supplierId' | 'status'>
    > &
      Api.Common.CommonSearchParams

    /** 采购订单列表 */
    type PurchaseOrderList = Api.Common.PaginatedResponse<PurchaseOrder>

    /** 销售订单状态 */
    type SalesOrderStatus = 'pending' | 'completed' | 'cancelled'

    /** 销售明细 */
    interface SalesItem {
      id?: number
      productId: number
      productName?: string
      quantity: number
      price: number
      amount: number
    }

    /** 销售订单 */
    interface SalesOrder {
      id: number
      orderNo: string
      customerName: string
      customerPhone: string
      totalAmount: number
      status: SalesOrderStatus
      remark?: string
      items: SalesItem[]
      createdAt: string
      updatedAt?: string
    }

    /** 销售订单搜索参数 */
    type SalesOrderSearchParams = Partial<Pick<SalesOrder, 'orderNo' | 'customerName' | 'status'>> &
      Api.Common.CommonSearchParams

    /** 销售订单列表 */
    type SalesOrderList = Api.Common.PaginatedResponse<SalesOrder>

    /** 库存操作类型 */
    type InventoryLogType = 'inbound' | 'outbound' | 'check'

    /** 库存记录 */
    interface InventoryLog {
      id: number
      productId: number
      productName?: string
      type: InventoryLogType
      quantity: number
      beforeStock: number
      afterStock: number
      reason: string
      operatorId: number
      operatorName?: string
      createdAt: string
    }

    /** 库存记录搜索参数 */
    type InventoryLogSearchParams = Partial<
      Pick<InventoryLog, 'productId' | 'type' | 'operatorId'>
    > &
      Api.Common.CommonSearchParams

    /** 库存记录列表 */
    type InventoryLogList = Api.Common.PaginatedResponse<InventoryLog>

    /** 盘点记录 */
    interface CheckRecord {
      id: number
      productId: number
      productName?: string
      systemStock: number
      actualStock: number
      difference: number
      remark?: string
      operatorId: number
      operatorName?: string
      createdAt: string
    }

    /** 盘点记录搜索参数 */
    type CheckRecordSearchParams = Partial<Pick<CheckRecord, 'productId' | 'operatorId'>> &
      Api.Common.CommonSearchParams

    /** 盘点记录列表 */
    type CheckRecordList = Api.Common.PaginatedResponse<CheckRecord>

    /** 仓库 */
    interface Warehouse {
      id: number
      name: string
      location: string
      status: ProductStatus
      createdAt: string
    }

    /** 仓库搜索参数 */
    type WarehouseSearchParams = Partial<Pick<Warehouse, 'name' | 'status'>> &
      Api.Common.CommonSearchParams

    /** 仓库列表 */
    type WarehouseList = Api.Common.PaginatedResponse<Warehouse>

    /** 仪表盘统计数据 */
    interface DashboardStats {
      totalProducts: number
      totalStock: number
      totalValue: number
      lowStockCount: number
      todayInbound: number
      todayOutbound: number
      monthInbound: number
      monthOutbound: number
    }

    /** 低库存预警商品 */
    interface LowStockProduct {
      id: number
      name: string
      code: string
      stock: number
      minStock: number
      unit: string
    }

    /** 库存趋势数据 */
    interface StockTrend {
      date: string
      inbound: number
      outbound: number
      stock: number
    }

    /** 分类库存统计 */
    interface CategoryStock {
      categoryId: number
      categoryName: string
      productCount: number
      totalStock: number
      totalValue: number
    }

    /** 销售统计 */
    interface SalesStats {
      totalAmount: number
      totalOrders: number
      averageOrderAmount: number
      topProducts: TopProduct[]
    }

    /** 热销商品 */
    interface TopProduct {
      productId: number
      productName: string
      quantity: number
      amount: number
    }

    /** 采购统计 */
    interface PurchaseStats {
      totalAmount: number
      totalOrders: number
      averageOrderAmount: number
      topSuppliers: TopSupplier[]
    }

    /** 主要供应商 */
    interface TopSupplier {
      supplierId: number
      supplierName: string
      orderCount: number
      totalAmount: number
    }
  }
}
