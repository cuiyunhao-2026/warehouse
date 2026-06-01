import api from '@/utils/http'

/** ==================== 店铺管理 API ==================== */

/** 获取店铺列表 */
export function fetchGetShopList() {
  return api.get<any[]>({ url: '/api/shops' })
}

/** 获取所有店铺 */
export function fetchGetAllShops() {
  return api.get<any[]>({ url: '/api/shops/all' })
}

/** 添加店铺 */
export function fetchAddShop(params: any) {
  return api.post<void>({ url: '/api/shops', data: params, showSuccessMessage: true })
}

/** 更新店铺 */
export function fetchUpdateShop(id: number, params: any) {
  return api.put<void>({ url: `/api/shops/${id}`, data: params, showSuccessMessage: true })
}

/** 删除店铺 */
export function fetchDeleteShop(id: number) {
  return api.del<void>({ url: `/api/shops/${id}`, showSuccessMessage: true })
}

/** ==================== 客户管理 API ==================== */

/** 获取客户列表 */
export function fetchGetCustomerList(params: any) {
  return api.get<any>({ url: '/api/customers', params })
}

/** 获取所有客户 */
export function fetchGetAllCustomers() {
  return api.get<any[]>({ url: '/api/customers/all' })
}

/** 添加客户 */
export function fetchAddCustomer(params: any) {
  return api.post<void>({ url: '/api/customers', data: params, showSuccessMessage: true })
}

/** 更新客户 */
export function fetchUpdateCustomer(id: number, params: any) {
  return api.put<void>({ url: `/api/customers/${id}`, data: params, showSuccessMessage: true })
}

/** 删除客户 */
export function fetchDeleteCustomer(id: number) {
  return api.del<void>({ url: `/api/customers/${id}`, showSuccessMessage: true })
}

/** ==================== 商品管理 API ==================== */

/** 获取商品列表 */
export function fetchGetProductList(params: any) {
  return api.get<any>({ url: '/api/products', params })
}

/** 获取所有商品 */
export function fetchGetAllProducts() {
  return api.get<any[]>({ url: '/api/products/all' })
}

/** 添加商品 */
export function fetchAddProduct(params: any) {
  return api.post<void>({ url: '/api/products', data: params, showSuccessMessage: true })
}

/** 更新商品 */
export function fetchUpdateProduct(id: number, params: any) {
  return api.put<void>({ url: `/api/products/${id}`, data: params, showSuccessMessage: true })
}

/** 删除商品 */
export function fetchDeleteProduct(id: number) {
  return api.del<void>({ url: `/api/products/${id}`, showSuccessMessage: true })
}

/** 获取商品价格 */
export function fetchGetProductPrices(productId: number) {
  return api.get<any[]>({ url: `/api/products/${productId}/prices` })
}

/** 获取商品单位换算 */
export function fetchGetProductConversions(productId: number) {
  return api.get<any[]>({ url: `/api/products/${productId}/conversions` })
}

/** ==================== 分类管理 API ==================== */

/** 获取分类列表 */
export function fetchGetCategoryList() {
  return api.get<any[]>({ url: '/api/categories' })
}

/** 获取所有分类 */
export function getAllCategories() {
  return api.get<any[]>({ url: '/api/categories/all' })
}

/** 添加分类 */
export function fetchAddCategory(params: any) {
  return api.post<void>({ url: '/api/categories', data: params, showSuccessMessage: true })
}

/** 更新分类 */
export function fetchUpdateCategory(id: number, params: any) {
  return api.put<void>({ url: `/api/categories/${id}`, data: params, showSuccessMessage: true })
}

/** 删除分类 */
export function fetchDeleteCategory(id: number) {
  return api.del<void>({ url: `/api/categories/${id}`, showSuccessMessage: true })
}

/** ==================== 单位管理 API ==================== */

/** 获取单位列表 */
export function fetchGetUnitList() {
  return api.get<any[]>({ url: '/api/units' })
}

/** 添加单位 */
export function fetchAddUnit(params: any) {
  return api.post<void>({ url: '/api/units', data: params, showSuccessMessage: true })
}

/** 更新单位 */
export function fetchUpdateUnit(id: number, params: any) {
  return api.put<void>({ url: `/api/units/${id}`, data: params, showSuccessMessage: true })
}

/** 删除单位 */
export function fetchDeleteUnit(id: number) {
  return api.del<void>({ url: `/api/units/${id}`, showSuccessMessage: true })
}

/** ==================== 仓库管理 API ==================== */

/** 获取仓库列表 */
export function fetchGetWarehouseList() {
  return api.get<any[]>({ url: '/api/warehouses' })
}

/** 添加仓库 */
export function fetchAddWarehouse(params: any) {
  return api.post<void>({ url: '/api/warehouses', data: params, showSuccessMessage: true })
}

/** 更新仓库 */
export function fetchUpdateWarehouse(id: number, params: any) {
  return api.put<void>({ url: `/api/warehouses/${id}`, data: params, showSuccessMessage: true })
}

/** 删除仓库 */
export function fetchDeleteWarehouse(id: number) {
  return api.del<void>({ url: `/api/warehouses/${id}`, showSuccessMessage: true })
}

/** ==================== 采购订单 API ==================== */

/** 获取采购订单列表 */
export function fetchGetPurchaseOrderList(params: any) {
  return api.get<any>({ url: '/api/purchases', params })
}

/** 添加采购订单 */
export function fetchAddPurchaseOrder(params: any) {
  return api.post<void>({ url: '/api/purchases', data: params, showSuccessMessage: true })
}

/** 更新采购订单状态 */
export function fetchUpdatePurchaseOrderStatus(id: number, status: string) {
  return api.put<void>({
    url: `/api/purchases/${id}/status`,
    data: { status },
    showSuccessMessage: true
  })
}

/** 删除采购订单 */
export function fetchDeletePurchaseOrder(id: number) {
  return api.del<void>({ url: `/api/purchases/${id}`, showSuccessMessage: true })
}

/** ==================== 销售订单 API ==================== */

/** 获取销售订单列表 */
export function fetchGetSalesOrderList(params: any) {
  return api.get<any>({ url: '/api/sales', params })
}

/** 添加销售订单 */
export function fetchAddSalesOrder(params: any) {
  return api.post<void>({ url: '/api/sales', data: params, showSuccessMessage: true })
}

/** 更新销售订单状态 */
export function fetchUpdateSalesOrderStatus(id: number, status: string) {
  return api.put<void>({
    url: `/api/sales/${id}/status`,
    data: { status },
    showSuccessMessage: true
  })
}

/** 删除销售订单 */
export function fetchDeleteSalesOrder(id: number) {
  return api.del<void>({ url: `/api/sales/${id}`, showSuccessMessage: true })
}

/** ==================== 库存操作 API ==================== */

/** 入库 */
export function fetchInbound(params: any) {
  return api.post<void>({ url: '/api/inventory/inbound', data: params, showSuccessMessage: true })
}

/** 出库 */
export function fetchOutbound(params: any) {
  return api.post<void>({ url: '/api/inventory/outbound', data: params, showSuccessMessage: true })
}

/** 盘点 */
export function fetchCheck(params: any) {
  return api.post<void>({ url: '/api/inventory/check', data: params, showSuccessMessage: true })
}

/** 获取库存记录 */
export function fetchGetInventoryLogList(params: any) {
  return api.get<any>({ url: '/api/inventory/logs', params })
}

/** 删除库存记录 */
export function fetchDeleteInventoryLog(id: number) {
  return api.del<void>({ url: `/api/inventory/logs/${id}`, showSuccessMessage: true })
}

/** ==================== 仪表盘 API ==================== */

/** 获取统计数据 */
export function fetchGetDashboardStats() {
  return api.get<any>({ url: '/api/dashboard/stats' })
}

/** 获取低库存预警商品 */
export function fetchGetLowStockProducts() {
  return api.get<any[]>({ url: '/api/dashboard/low-stock' })
}

/** 获取库存趋势 */
export function fetchGetStockTrend() {
  return api.get<any[]>({ url: '/api/dashboard/stock-trend' })
}

/** 获取分类库存统计 */
export function fetchGetCategoryStock() {
  return api.get<any[]>({ url: '/api/dashboard/category-stock' })
}

/** 获取销售统计 */
export function fetchGetSalesStats() {
  return api.get<any>({ url: '/api/dashboard/sales-stats' })
}

/** 获取采购统计 */
export function fetchGetPurchaseStats() {
  return api.get<any>({ url: '/api/dashboard/purchase-stats' })
}
