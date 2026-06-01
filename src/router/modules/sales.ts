import { AppRouteRecord } from '@/types/router'

export const salesRoutes: AppRouteRecord = {
  name: 'Sales',
  path: '/sales',
  component: '/index/index',
  meta: {
    title: 'menus.sales.title',
    icon: 'ri:money-cny-circle-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'SalesList',
      component: '/sales/list',
      meta: {
        title: 'menus.sales.list',
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
      name: 'SalesCreate',
      component: '/sales/create',
      meta: {
        title: 'menus.sales.create',
        icon: 'ri:add-circle-line',
        keepAlive: false
      }
    }
  ]
}
