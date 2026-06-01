import { AppRouteRecord } from '@/types/router'

export const inventoryRoutes: AppRouteRecord = {
  name: 'Inventory',
  path: '/inventory',
  component: '/index/index',
  meta: {
    title: 'menus.inventory.title',
    icon: 'ri:warehouse-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'inbound',
      name: 'InventoryInbound',
      component: '/inventory/inbound',
      meta: {
        title: 'menus.inventory.inbound',
        icon: 'ri:login-box-line',
        keepAlive: true,
        authList: [{ title: '新增', authMark: 'add' }]
      }
    },
    {
      path: 'outbound',
      name: 'InventoryOutbound',
      component: '/inventory/outbound',
      meta: {
        title: 'menus.inventory.outbound',
        icon: 'ri:logout-box-line',
        keepAlive: true,
        authList: [{ title: '新增', authMark: 'add' }]
      }
    },
    {
      path: 'check',
      name: 'InventoryCheck',
      component: '/inventory/check',
      meta: {
        title: 'menus.inventory.check',
        icon: 'ri:clipboard-line',
        keepAlive: true,
        authList: [{ title: '新增', authMark: 'add' }]
      }
    },
    {
      path: 'query',
      name: 'InventoryQuery',
      component: '/inventory/query',
      meta: {
        title: 'menus.inventory.query',
        icon: 'ri:search-line',
        keepAlive: true
      }
    }
  ]
}
