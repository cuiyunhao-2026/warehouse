import { AppRouteRecord } from '@/types/router'

export const customerRoutes: AppRouteRecord = {
  name: 'Customer',
  path: '/customer',
  component: '/index/index',
  meta: {
    title: 'menus.customer.title',
    icon: 'ri:user-star-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'CustomerList',
      component: '/customer/list',
      meta: {
        title: 'menus.customer.list',
        icon: 'ri:contacts-book-line',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' },
          { title: '导出', authMark: 'export' }
        ]
      }
    }
  ]
}
