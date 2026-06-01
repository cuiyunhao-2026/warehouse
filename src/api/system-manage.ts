import { AppRouteRecord } from '@/types/router'
import { ACCOUNT_TABLE_DATA, ROLE_LIST_DATA } from '@/mock/temp/formData'
import { getMockData, setMockData } from '@/utils/mock-storage'

/** 模拟延迟 */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/** 生成分页数据 */
function paginate<T>(list: T[], current: number, size: number): Api.Common.PaginatedResponse<T> {
  const start = (current - 1) * size
  const end = start + size
  return {
    records: list.slice(start, end),
    current,
    size,
    total: list.length
  }
}

// 用户数据存储（使用localStorage持久化）
const defaultUserData = [...ACCOUNT_TABLE_DATA]
const userData = getMockData('users', defaultUserData)

// 保存用户数据到localStorage
function saveUserData() {
  setMockData('users', userData)
}

// 角色数据存储（使用localStorage持久化）
const defaultRoleData = [...ROLE_LIST_DATA]
const roleData = getMockData('roles', defaultRoleData)

// 保存角色数据到localStorage
function saveRoleData() {
  setMockData('roles', roleData)
}

// 转换用户数据格式
function transformUser(user: (typeof ACCOUNT_TABLE_DATA)[0]): Api.SystemManage.UserListItem {
  return {
    id: user.id,
    avatar: user.avatar,
    status: user.status,
    userName: user.username,
    userGender: user.gender === 1 ? '男' : '女',
    nickName: user.username,
    userPhone: user.mobile,
    userEmail: user.email,
    userRoles: ['R_ADMIN'],
    createBy: 'system',
    createTime: user.create_time,
    updateBy: 'system',
    updateTime: user.create_time
  }
}

// 转换用户列表数据格式
function transformUserData(users: typeof ACCOUNT_TABLE_DATA): Api.SystemManage.UserListItem[] {
  return users.map(transformUser)
}

// 转换角色数据格式
function transformRoleData(roles: typeof ROLE_LIST_DATA): Api.SystemManage.RoleListItem[] {
  return roles.map((r, index) => ({
    roleId: index + 1,
    roleName: r.roleName,
    roleCode: r.roleCode,
    description: r.des,
    enabled: r.enable,
    createTime: r.date
  }))
}

// 获取用户列表
export async function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  await delay()
  let filtered = [...userData]
  if (params.userName) {
    filtered = filtered.filter((u) => u.username.includes(params.userName!))
  }
  if (params.status) {
    filtered = filtered.filter((u) => u.status === params.status)
  }
  const transformed = transformUserData(filtered)
  return paginate(transformed, params.current || 1, params.size || 10)
}

// 添加用户
export async function fetchAddUser(params: Partial<Api.SystemManage.UserListItem>) {
  await delay()
  const newUser = {
    id: Math.max(...userData.map((u) => u.id)) + 1,
    username: params.userName || '',
    gender: (params.userGender === '男' ? 1 : 0) as 0 | 1,
    mobile: params.userPhone || '',
    email: params.userEmail || '',
    dep: '默认部门',
    status: params.status || '1',
    create_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    avatar: ACCOUNT_TABLE_DATA[0].avatar
  }
  userData.push(newUser)
  saveUserData()
  return transformUser(newUser)
}

// 更新用户
export async function fetchUpdateUser(
  userId: number,
  params: Partial<Api.SystemManage.UserListItem>
) {
  await delay()
  const index = userData.findIndex((u) => u.id === userId)
  if (index !== -1) {
    userData[index] = {
      ...userData[index],
      username: params.userName || userData[index].username,
      gender:
        params.userGender === '男' ? 1 : params.userGender === '女' ? 0 : userData[index].gender,
      mobile: params.userPhone || userData[index].mobile,
      email: params.userEmail || userData[index].email,
      status: params.status || userData[index].status
    }
    saveUserData()
    return transformUser(userData[index])
  }
  throw new Error('用户不存在')
}

// 删除用户
export async function fetchDeleteUser(userId: number) {
  await delay()
  const index = userData.findIndex((u) => u.id === userId)
  if (index !== -1) {
    userData.splice(index, 1)
    saveUserData()
    return true
  }
  throw new Error('用户不存在')
}

// 获取角色列表
export async function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  await delay()
  const transformed = transformRoleData(roleData)
  return paginate(transformed, params.current || 1, params.size || 10)
}

// 添加角色
export async function fetchAddRole(params: Partial<Api.SystemManage.RoleListItem>) {
  await delay()
  const newRole = {
    roleName: params.roleName || '',
    roleCode: params.roleCode || '',
    des: params.description || '',
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    enable: params.enabled !== false
  }
  roleData.push(newRole)
  saveRoleData()
  return newRole
}

// 更新角色
export async function fetchUpdateRole(
  roleId: number,
  params: Partial<Api.SystemManage.RoleListItem>
) {
  await delay()
  const index = roleId - 1
  if (index >= 0 && index < roleData.length) {
    roleData[index] = {
      ...roleData[index],
      roleName: params.roleName || roleData[index].roleName,
      roleCode: params.roleCode || roleData[index].roleCode,
      des: params.description || roleData[index].des,
      enable: params.enabled !== undefined ? params.enabled : roleData[index].enable
    }
    saveRoleData()
    return roleData[index]
  }
  throw new Error('角色不存在')
}

// 删除角色
export async function fetchDeleteRole(roleId: number) {
  await delay()
  const index = roleId - 1
  if (index >= 0 && index < roleData.length) {
    roleData.splice(index, 1)
    saveRoleData()
    return true
  }
  throw new Error('角色不存在')
}

// 获取菜单列表
export async function fetchGetMenuList() {
  await delay()
  return [] as AppRouteRecord[]
}
