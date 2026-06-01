import { AppRouteRecord } from '@/types/router'

export const purchaseRoutes: AppRouteRecord = {
  name: 'Purchase',
  path: '/purchase',
  component: '/index/index',
  meta: {
    title: 'menus.purchase.title',
    icon: 'ri:shopping-cart-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'PurchaseList',
      component: '/purchase/list',
      meta: {
        title: 'menus.purchase.list',
        icon: 'ri:file-list-line',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' },
          { title: '导出', authMark: 'export' },
          { title: '打印', authMark: 'print' }
        ]
      }
    },
    {
      path: 'create',
      name: 'PurchaseCreate',
      component: '/purchase/create',
      meta: {
        title: 'menus.purchase.create',
        icon: 'ri:add-circle-line',
        keepAlive: false
      }
    }
  ]
}
