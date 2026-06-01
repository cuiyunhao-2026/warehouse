import api from '@/utils/http'

/** 用户信息接口 */
interface UserRecord {
  id?: number
  username: string
  password?: string
  roles: string[]
  buttons: string[]
  email?: string
  phone?: string
  avatar?: string
  shopId?: number
  shopName?: string
}

/**
 * 登录
 */
export function fetchLogin(params: Api.Auth.LoginParams): Promise<any> {
  return api.post<any>({
    url: '/api/auth/login',
    data: params,
    showErrorMessage: true
  })
}

/**
 * 注册
 */
export function fetchRegister(params: {
  username: string
  password: string
  shopId?: number
}): Promise<void> {
  return api.post<void>({
    url: '/api/auth/register',
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 获取用户信息
 */
export function fetchGetUserInfo(): Promise<any> {
  return api.get<any>({
    url: '/api/auth/userInfo'
  })
}

/**
 * 获取所有用户列表
 */
export function fetchGetAllUsers(): Promise<UserRecord[]> {
  return api.get<UserRecord[]>({
    url: '/api/auth/users'
  })
}

/**
 * 添加用户
 */
export function fetchAddUser(params: any): Promise<void> {
  return api.post<void>({
    url: '/api/auth/users',
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 更新用户信息
 */
export function fetchUpdateUser(id: number, params: Partial<UserRecord>): Promise<void> {
  return api.put<void>({
    url: `/api/auth/users/${id}`,
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 删除用户
 */
export function fetchDeleteUser(id: number): Promise<void> {
  return api.del<void>({
    url: `/api/auth/users/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 更新当前用户的个人资料
 */
export function fetchUpdateProfile(params: Partial<UserRecord>): Promise<void> {
  return api.put<void>({
    url: '/api/auth/profile',
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 修改密码
 */
export function fetchChangePassword(
  username: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  return api.put<void>({
    url: '/api/auth/password',
    data: { oldPassword, newPassword },
    showSuccessMessage: true
  })
}

/**
 * 管理员修改指定用户密码
 */
export function fetchAdminChangePassword(id: number, newPassword: string): Promise<void> {
  return api.put<void>({
    url: `/api/auth/users/${id}/password`,
    data: { newPassword },
    showSuccessMessage: true
  })
}
