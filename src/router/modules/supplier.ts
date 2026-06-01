import { AppRouteRecord } from '@/types/router'

export const supplierRoutes: AppRouteRecord = {
  name: 'Supplier',
  path: '/supplier',
  component: '/index/index',
  meta: {
    title: 'menus.supplier.title',
    icon: 'ri:group-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'SupplierList',
      component: '/supplier/list',
      meta: {
        title: 'menus.supplier.list',
        icon: 'ri:contacts-line',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    }
  ]
}
