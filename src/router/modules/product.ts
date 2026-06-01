import { AppRouteRecord } from '@/types/router'

export const productRoutes: AppRouteRecord = {
  name: 'Product',
  path: '/product',
  component: '/index/index',
  meta: {
    title: 'menus.product.title',
    icon: 'ri:shopping-bag-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'ProductList',
      component: '/product/list',
      meta: {
        title: 'menus.product.list',
        icon: 'ri:list-check',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'category',
      name: 'ProductCategory',
      component: '/product/category',
      meta: {
        title: 'menus.product.category',
        icon: 'ri:folder-line',
        keepAlive: true,
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'unit',
      name: 'ProductUnit',
      component: '/product/unit',
      meta: {
        title: 'menus.product.unit',
        icon: 'ri:ruler-line',
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
