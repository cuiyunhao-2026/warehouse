import { AppRouteRecord } from '@/types/router'

export const reportRoutes: AppRouteRecord = {
  name: 'Report',
  path: '/report',
  component: '/index/index',
  meta: {
    title: 'menus.report.title',
    icon: 'ri:bar-chart-grouped-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'inventory',
      name: 'ReportInventory',
      component: '/report/inventory',
      meta: {
        title: 'menus.report.inventory',
        icon: 'ri:database-2-line',
        keepAlive: false
      }
    },
    {
      path: 'inbound-outbound',
      name: 'ReportInboundOutbound',
      component: '/report/inbound-outbound',
      meta: {
        title: 'menus.report.inboundOutbound',
        icon: 'ri:arrow-up-down-line',
        keepAlive: false
      }
    },
    {
      path: 'purchase',
      name: 'ReportPurchase',
      component: '/report/purchase',
      meta: {
        title: 'menus.report.purchase',
        icon: 'ri:shopping-bag-line',
        keepAlive: false
      }
    },
    {
      path: 'sales',
      name: 'ReportSales',
      component: '/report/sales',
      meta: {
        title: 'menus.report.sales',
        icon: 'ri:line-chart-line',
        keepAlive: false
      }
    }
  ]
}
