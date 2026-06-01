/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 */
import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'Console'
    },
    {
      name: '商品管理',
      description: '商品列表与分类管理',
      icon: 'ri:shopping-bag-line',
      iconColor: '#ff3b30',
      enabled: true,
      order: 2,
      routeName: 'ProductList'
    },
    {
      name: '库存查询',
      description: '库存信息查询',
      icon: 'ri:database-2-line',
      iconColor: '#7A7FFF',
      enabled: true,
      order: 3,
      routeName: 'InventoryQuery'
    },
    {
      name: '采购管理',
      description: '采购订单管理',
      icon: 'ri:shopping-cart-line',
      iconColor: '#13DEB9',
      enabled: true,
      order: 4,
      routeName: 'PurchaseList'
    },
    {
      name: '销售管理',
      description: '销售订单管理',
      icon: 'ri:money-cny-circle-line',
      iconColor: '#ffb100',
      enabled: true,
      order: 5,
      routeName: 'SalesList'
    },
    {
      name: '官方文档',
      description: '使用指南与开发文档',
      icon: 'ri:bill-line',
      iconColor: '#ff6b6b',
      enabled: true,
      order: 6,
      link: WEB_LINKS.DOCS
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '登录',
      enabled: true,
      order: 1,
      routeName: 'Login'
    },
    {
      name: '注册',
      enabled: true,
      order: 2,
      routeName: 'Register'
    },
    {
      name: '忘记密码',
      enabled: true,
      order: 3,
      routeName: 'ForgetPassword'
    },
    {
      name: '个人中心',
      enabled: true,
      order: 4,
      routeName: 'UserCenter'
    },
    {
      name: '供应商管理',
      enabled: true,
      order: 5,
      routeName: 'SupplierList'
    },
    {
      name: '仓库设置',
      enabled: true,
      order: 6,
      routeName: 'Warehouse'
    }
  ]
}

export default Object.freeze(fastEnterConfig)
