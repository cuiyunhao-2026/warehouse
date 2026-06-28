<!-- 账号管理页面 -->
<template>
  <div class="account-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="art-search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="用户名">
          <ElInput v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </ElFormItem>
        <ElFormItem label="邮箱">
          <ElInput v-model="searchForm.email" placeholder="请输入邮箱" clearable />
        </ElFormItem>
        <ElFormItem label="手机号">
          <ElInput v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="searchForm.role" placeholder="请选择角色" clearable style="width:150px">
            <ElOption label="超级管理员" value="R_SUPER" />
            <ElOption label="管理员" value="R_ADMIN" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="handleResetSearch">
            <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span>账号列表</span>
            <ElTag type="info" class="ml-2">共 {{ filteredUserList.length }} 个账号</ElTag>
          </div>
          <div>
            <ElButton
              v-if="isSuperAdmin && selectedRows.length > 0"
              type="danger"
              @click="handleBatchDelete"
              class="mr-2"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              批量删除 ({{ selectedRows.length }})
            </ElButton>
            <ElButton type="primary" @click="handleAddUser" v-if="isSuperAdmin">
              <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
              添加账号
            </ElButton>
          </div>
        </div>
      </template>

      <ElTable :data="pagedUserList" v-loading="loading" border stripe @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="50" />
        <ElTableColumn prop="username" label="用户名" width="120" />
        <ElTableColumn prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="phone" label="手机号" width="130" />
        <ElTableColumn prop="shopName" label="所属店铺" width="120" />
        <ElTableColumn prop="roles" label="角色" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="row.roles?.includes('R_SUPER') ? 'danger' : 'primary'" size="small">
              {{ row.roles?.includes('R_SUPER') ? '超级管理员' : '管理员' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="buttons" label="权限" min-width="150">
          <template #default="{ row }">
            <ElTag v-for="btn in row.buttons || []" :key="btn" size="small" class="mr-1">
              {{ getButtonName(btn) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
              :disabled="!canEditUser(row)"
            >
              编辑
            </ElButton>
            <ElButton
              type="warning"
              link
              size="small"
              @click="handlePermission(row)"
              v-if="isSuperAdmin"
            >
              权限
            </ElButton>
            <ElButton
              type="info"
              link
              size="small"
              @click="handleChangePassword(row)"
              v-if="isSuperAdmin"
            >
              修改密码
            </ElButton>
            <ElPopconfirm
              v-if="!isDefaultUser(row.username) && isSuperAdmin"
              title="确定删除该账号吗？"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <ElButton type="danger" link size="small">删除</ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="art-pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="filteredUserList.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </ElCard>

    <!-- 添加用户弹窗 -->
    <ElDialog v-model="addUserVisible" title="添加账号" width="500px">
      <ElForm ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="addForm.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password">
          <ElInput
            v-model="addForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="addForm.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="addForm.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="所属店铺" prop="shopId">
          <ElSelect v-model="addForm.shopId" placeholder="请选择店铺" style="width: 100%">
            <ElOption v-for="shop in shopList" :key="shop.id" :label="shop.name" :value="shop.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="addForm.roles" multiple placeholder="请选择角色" style="width: 100%">
            <ElOption label="超级管理员" value="R_SUPER" />
            <ElOption label="管理员" value="R_ADMIN" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限">
          <ElCheckboxGroup v-model="addForm.buttons">
            <ElCheckbox label="add">新增</ElCheckbox>
            <ElCheckbox label="edit">编辑</ElCheckbox>
            <ElCheckbox label="delete">删除</ElCheckbox>
            <ElCheckbox label="export">导出</ElCheckbox>
            <ElCheckbox label="print">打印</ElCheckbox>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addUserVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddUserSubmit" :loading="submitLoading"
          >确定</ElButton
        >
      </template>
    </ElDialog>

    <!-- 编辑弹窗 -->
    <ElDialog v-model="editVisible" title="编辑用户信息" width="500px">
      <ElForm ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <ElFormItem label="用户名">
          <ElInput v-model="editForm.username" disabled />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="editForm.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="editForm.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="所属店铺" v-if="isSuperAdmin">
          <ElSelect v-model="editForm.shopId" placeholder="请选择店铺" style="width: 100%">
            <ElOption v-for="shop in shopList" :key="shop.id" :label="shop.name" :value="shop.id" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEditSubmit" :loading="submitLoading">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 权限弹窗 -->
    <ElDialog v-model="permissionVisible" title="设置权限" width="500px">
      <ElForm label-width="80px">
        <ElFormItem label="用户名">
          <ElInput v-model="permissionForm.username" disabled />
        </ElFormItem>
        <ElFormItem label="角色">
          <ElSelect v-model="permissionForm.roles" multiple placeholder="请选择角色">
            <ElOption label="超级管理员" value="R_SUPER" />
            <ElOption label="管理员" value="R_ADMIN" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="权限">
          <ElCheckboxGroup v-model="permissionForm.buttons">
            <ElCheckbox label="add">新增</ElCheckbox>
            <ElCheckbox label="edit">编辑</ElCheckbox>
            <ElCheckbox label="delete">删除</ElCheckbox>
            <ElCheckbox label="export">导出</ElCheckbox>
            <ElCheckbox label="print">打印</ElCheckbox>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="permissionVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handlePermissionSubmit" :loading="submitLoading"
          >保存</ElButton
        >
      </template>
    </ElDialog>

    <!-- 修改密码弹窗 -->
    <ElDialog v-model="passwordVisible" title="修改密码" width="500px">
      <ElForm
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <ElFormItem label="用户名">
          <ElInput v-model="passwordForm.username" disabled />
        </ElFormItem>
        <ElFormItem label="新密码" prop="newPassword">
          <ElInput
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="确认新密码" prop="confirmPassword">
          <ElInput
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="passwordVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handlePasswordSubmit" :loading="submitLoading"
          >保存</ElButton
        >
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetAllUsers,
    fetchAddUser,
    fetchUpdateUser,
    fetchDeleteUser,
    fetchAdminChangePassword
  } from '@/api/auth'
  import { fetchGetAllShops } from '@/api/inventory'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'AccountManage' })

  const userStore = useUserStore()
  const currentUserInfo = computed(() => userStore.getUserInfo)
  const isSuperAdmin = computed(() => currentUserInfo.value.roles?.includes('R_SUPER'))

  const loading = ref(false)
  const submitLoading = ref(false)
  const editVisible = ref(false)
  const permissionVisible = ref(false)
  const passwordVisible = ref(false)
  const addUserVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const addFormRef = ref<FormInstance>()
  const passwordFormRef = ref<FormInstance>()
  const userList = ref<any[]>([])
  const shopList = ref<any[]>([])
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = reactive({
    username: '',
    email: '',
    phone: '',
    role: ''
  })

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10
  })

  // 过滤后的用户列表
  const filteredUserList = computed(() => {
    let list = userList.value
    if (searchForm.username) {
      const kw = searchForm.username.toLowerCase()
      list = list.filter(u => (u.username || '').toLowerCase().includes(kw))
    }
    if (searchForm.email) {
      const kw = searchForm.email.toLowerCase()
      list = list.filter(u => (u.email || '').toLowerCase().includes(kw))
    }
    if (searchForm.phone) {
      list = list.filter(u => (u.phone || '').includes(searchForm.phone))
    }
    if (searchForm.role) {
      list = list.filter(u => (u.roles || []).includes(searchForm.role))
    }
    return list
  })

  // 分页后的用户列表
  const pagedUserList = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    return filteredUserList.value.slice(start, start + pagination.size)
  })

  const handleSearch = () => {
    pagination.current = 1
  }

  const handleResetSearch = () => {
    searchForm.username = ''
    searchForm.email = ''
    searchForm.phone = ''
    searchForm.role = ''
    pagination.current = 1
  }

  const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows
  }

  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的账号')
      return
    }
    // 过滤掉默认用户
    const deletableIds = selectedRows.value
      .filter(row => !isDefaultUser(row.username))
      .map(row => row.id)
    
    if (deletableIds.length === 0) {
      ElMessage.warning('选中的账号均不可删除（admin/user为默认账号）')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要批量删除 ${deletableIds.length} 个账号吗？此操作不可恢复！`,
        '批量删除确认',
        { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
      )
    } catch {
      return
    }

    loading.value = true
    try {
      for (const id of deletableIds) {
        await fetchDeleteUser(id)
      }
      ElMessage.success(`成功删除 ${deletableIds.length} 个账号`)
      selectedRows.value = []
      loadUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '批量删除失败')
    } finally {
      loading.value = false
    }
  }

  const editForm = reactive({
    id: 0,
    username: '',
    email: '',
    phone: '',
    shopId: undefined as number | undefined
  })

  const addForm = reactive({
    username: '',
    password: '123456',
    email: '',
    phone: '',
    shopId: undefined as number | undefined,
    roles: ['R_ADMIN'] as string[],
    buttons: ['add', 'edit', 'export'] as string[]
  })

  const permissionForm = reactive({
    id: 0,
    username: '',
    roles: [] as string[],
    buttons: [] as string[]
  })

  const passwordForm = reactive({
    id: 0,
    username: '',
    newPassword: '',
    confirmPassword: ''
  })

  const editRules: FormRules = {
    email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }]
  }

  const addRules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 1, message: '用户名不能为空', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
  }

  const passwordRules: FormRules = {
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: any) => {
          if (value !== passwordForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  const isDefaultUser = (username: string) => {
    return username === 'admin' || username === 'user'
  }

  const canEditUser = (row: any) => {
    if (isSuperAdmin.value) return true
    return row.username === currentUserInfo.value.userName
  }

  const getButtonName = (button: string) => {
    const map: Record<string, string> = {
      add: '新增',
      edit: '编辑',
      delete: '删除',
      export: '导出',
      print: '打印'
    }
    return map[button] || button
  }

  const loadUsers = async () => {
    loading.value = true
    try {
      userList.value = await fetchGetAllUsers()
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      loading.value = false
    }
  }

  const loadShops = async () => {
    try {
      shopList.value = await fetchGetAllShops()
    } catch (error) {
      console.error('Failed to load shops:', error)
    }
  }

  const handleAddUser = () => {
    Object.assign(addForm, {
      username: '',
      password: '123456',
      email: '',
      phone: '',
      shopId: undefined,
      roles: ['R_ADMIN'],
      buttons: ['add', 'edit', 'export']
    })
    addUserVisible.value = true
  }

  const handleAddUserSubmit = async () => {
    if (!addFormRef.value) return
    await addFormRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        await fetchAddUser(addForm)
        ElMessage.success('添加成功')
        addUserVisible.value = false
        loadUsers()
      } catch (error: any) {
        ElMessage.error(error.message || '添加失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleEdit = (row: any) => {
    Object.assign(editForm, {
      id: row.id,
      username: row.username,
      email: row.email || '',
      phone: row.phone || '',
      shopId: row.shop_id
    })
    editVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        await fetchUpdateUser(editForm.id, {
          email: editForm.email,
          phone: editForm.phone,
          shopId: editForm.shopId
        })
        ElMessage.success('更新成功')
        editVisible.value = false
        loadUsers()
      } catch (error) {
        ElMessage.error('更新失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handlePermission = (row: any) => {
    Object.assign(permissionForm, {
      id: row.id,
      username: row.username,
      roles: [...(row.roles || [])],
      buttons: [...(row.buttons || [])]
    })
    permissionVisible.value = true
  }

  const handlePermissionSubmit = async () => {
    submitLoading.value = true
    try {
      await fetchUpdateUser(permissionForm.id, {
        roles: permissionForm.roles,
        buttons: permissionForm.buttons
      })
      ElMessage.success('权限更新成功')
      permissionVisible.value = false
      loadUsers()
    } catch (error) {
      ElMessage.error('权限更新失败')
    } finally {
      submitLoading.value = false
    }
  }

  const handleChangePassword = (row: any) => {
    Object.assign(passwordForm, {
      id: row.id,
      username: row.username,
      newPassword: '',
      confirmPassword: ''
    })
    passwordVisible.value = true
  }

  const handlePasswordSubmit = async () => {
    if (!passwordFormRef.value) return
    await passwordFormRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        await fetchAdminChangePassword(passwordForm.id, passwordForm.newPassword)
        ElMessage.success('密码修改成功')
        passwordVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteUser(id)
      ElMessage.success('删除成功')
      loadUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }

  onMounted(() => {
    loadUsers()
    loadShops()
  })
</script>

<style scoped lang="scss">
  .account-page {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .art-search-card {
      margin-bottom: 0;
    }

    .art-table-card {
      flex: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .art-pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .mr-1 {
      margin-right: 4px;
    }

    .mr-2 {
      margin-right: 8px;
    }

    .ml-2 {
      margin-left: 8px;
    }
  }
</style>
