/**
 * 路由全局前置守卫模块（简化版）
 */
import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { nextTick } from 'vue'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle } from '@/utils/router'
import { RoutesAlias } from '../routesAlias'
import { staticRoutes } from '../routes/staticRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/hooks/core/useCommon'
import { useWorktabStore } from '@/store/modules/worktab'
import { fetchGetUserInfo } from '@/api/auth'
import { RouteRegistry, MenuProcessor, IframeRouteManager, RoutePermissionValidator } from '../core'

// 路由注册器实例
let routeRegistry: RouteRegistry | null = null

// 菜单处理器实例
const menuProcessor = new MenuProcessor()

// 跟踪是否需要关闭 loading
let pendingLoading = false

// 路由初始化失败标记
let routeInitFailed = false

// 路由初始化进行中标记
let routeInitInProgress = false

/**
 * 获取 pendingLoading 状态
 */
export function getPendingLoading(): boolean {
  return pendingLoading
}

/**
 * 重置 pendingLoading 状态
 */
export function resetPendingLoading(): void {
  pendingLoading = false
}

/**
 * 重置路由初始化状态
 */
export function resetRouteInitState(): void {
  routeInitFailed = false
  routeInitInProgress = false
}

/**
 * 设置路由全局前置守卫
 */
export function setupBeforeEachGuard(router: Router): void {
  routeRegistry = new RouteRegistry(router)

  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        const settingStore = useSettingStore()
        const userStore = useUserStore()

        // 启动进度条
        if (settingStore.showNprogress) {
          NProgress.start()
        }

        // 1. 未登录且不是访问登录页，跳转到登录页
        if (!userStore.isLogin && to.path !== '/auth/login' && !isStaticRoute(to.path)) {
          next({ name: 'Login', query: { redirect: to.fullPath } })
          return
        }

        // 2. 已登录且路由未初始化
        if (userStore.isLogin && !routeRegistry?.isRegistered() && !routeInitInProgress) {
          routeInitInProgress = true
          pendingLoading = true
          loadingService.showLoading()

          try {
            // 获取用户信息
            await fetchUserInfo()

            // 获取菜单数据
            const menuList = await menuProcessor.getMenuList()

            // 验证菜单数据
            if (!menuProcessor.validateMenuList(menuList)) {
              throw new Error('获取菜单列表失败')
            }

            // 注册动态路由
            routeRegistry?.register(menuList)

            // 保存菜单数据到 store
            const menuStore = useMenuStore()
            menuStore.setMenuList(menuList)
            menuStore.addRemoveRouteFns(routeRegistry?.getRemoveRouteFns() || [])

            // 保存 iframe 路由
            IframeRouteManager.getInstance().save()

            // 验证工作标签页
            useWorktabStore().validateWorktabs(router)

            routeInitInProgress = false

            // 关闭 loading
            closeLoading()

            // 重新导航
            const { homePath } = useCommon()
            const targetPath = to.path === '/' ? homePath.value || '/dashboard/console' : to.path

            next({
              path: targetPath,
              query: to.query,
              hash: to.hash,
              replace: true
            })
            return
          } catch (error) {
            console.error('[RouteGuard] 动态路由注册失败:', error)
            routeInitInProgress = false
            closeLoading()

            // 使用默认菜单
            const menuStore = useMenuStore()
            const menuList = await menuProcessor.getMenuList()
            menuStore.setMenuList(menuList)

            const { homePath } = useCommon()
            const targetPath = to.path === '/' ? homePath.value || '/dashboard/console' : to.path

            next({
              path: targetPath,
              replace: true
            })
            return
          }
        }

        // 3. 处理根路径重定向
        if (to.path === '/' && userStore.isLogin) {
          const { homePath } = useCommon()
          if (homePath.value && homePath.value !== '/') {
            next({ path: homePath.value, replace: true })
            return
          }
          next({ path: '/dashboard/console', replace: true })
          return
        }

        // 4. 已匹配的路由，正常放行
        if (to.matched.length > 0) {
          setWorktab(to)
          setPageTitle(to)
          next()
          return
        }

        // 5. 未匹配到路由，跳转到 404
        next({ name: 'Exception404' })
      } catch (error) {
        console.error('[RouteGuard] 路由守卫处理失败:', error)
        closeLoading()
        next()
      }
    }
  )
}

/**
 * 关闭 loading 效果
 */
function closeLoading(): void {
  if (pendingLoading) {
    nextTick(() => {
      loadingService.hideLoading()
      pendingLoading = false
    })
  }
}

/**
 * 获取用户信息
 */
async function fetchUserInfo(): Promise<void> {
  const userStore = useUserStore()
  try {
    const data = await fetchGetUserInfo()
    userStore.setUserInfo(data)
    userStore.checkAndClearWorktabs()
  } catch (error) {
    console.error('[fetchUserInfo] 获取用户信息失败，使用默认信息:', error)
    userStore.setUserInfo({
      userId: 1,
      userName: 'Admin',
      email: 'admin@example.com',
      avatar: '',
      roles: ['R_SUPER'],
      buttons: ['add', 'edit', 'delete']
    })
  }
}

/**
 * 重置路由相关状态
 */
export function resetRouterState(delay: number): void {
  setTimeout(() => {
    routeRegistry?.unregister()
    IframeRouteManager.getInstance().clear()

    const menuStore = useMenuStore()
    menuStore.removeAllDynamicRoutes()
    menuStore.setMenuList([])

    resetRouteInitState()
  }, delay)
}

/**
 * 检查路由是否为静态路由
 */
function isStaticRoute(path: string): boolean {
  const checkRoute = (routes: any[], targetPath: string): boolean => {
    return routes.some((route) => {
      if (route.name === 'Exception404') {
        return false
      }
      const routePath = route.path
      const pattern = routePath.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(targetPath)) {
        return true
      }
      if (route.children && route.children.length > 0) {
        return checkRoute(route.children, targetPath)
      }
      return false
    })
  }
  return checkRoute(staticRoutes, path)
}
