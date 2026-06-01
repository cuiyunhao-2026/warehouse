import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { productRoutes } from './product'
import { inventoryRoutes } from './inventory'
import { customerRoutes } from './customer'
import { purchaseRoutes } from './purchase'
import { salesRoutes } from './sales'
import { reportRoutes } from './report'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  productRoutes,
  inventoryRoutes,
  customerRoutes,
  purchaseRoutes,
  salesRoutes,
  reportRoutes
]
