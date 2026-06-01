<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.userName || 'Admin' }}</h2>
          <p class="mt-5 text-sm">{{ form.des || '库存管理系统用户' }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ userInfo.email || '未设置邮箱' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.sex === '1' ? '男' : '女' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.address || '未设置地址' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:shield-user-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ roleName }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">权限</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in userButtons"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ getButtonName(item) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="姓名" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="性别" prop="sex" class="ml-5">
                <ElSelect v-model="form.sex" placeholder="Select" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="昵称" prop="nikeName">
                <ElInput v-model="form.nikeName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="地址" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem label="个人介绍" prop="des" class="h-32">
              <ElInput type="textarea" :rows="4" v-model="form.des" :disabled="!isEdit" />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="edit">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">更改密码</h1>

          <ElForm :model="pwdForm" class="box-border p-5" label-width="86px" label-position="top">
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="editPwd">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { fetchUpdateProfile, fetchChangePassword } from '@/api/auth'
  import { getMockData, setMockData } from '@/utils/mock-storage'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const ruleFormRef = ref<FormInstance>()

  // 计算角色名称
  const roleName = computed(() => {
    const roles = userInfo.value.roles || []
    if (roles.includes('R_SUPER')) return '超级管理员'
    if (roles.includes('R_ADMIN')) return '管理员'
    return '普通用户'
  })

  // 获取用户权限
  const userButtons = computed(() => userInfo.value.buttons || [])

  // 权限名称映射
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

  // 从localStorage加载用户资料
  const savedProfile = getMockData('userProfile_' + userInfo.value.userName, {}) as Record<
    string,
    any
  >

  /**
   * 用户信息表单
   */
  const form = reactive({
    realName: savedProfile.realName || userInfo.value.userName || '',
    nikeName: savedProfile.nikeName || userInfo.value.userName || '',
    email: savedProfile.email || userInfo.value.email || '',
    mobile: savedProfile.mobile || '',
    address: savedProfile.address || '',
    sex: savedProfile.sex || '1',
    des: savedProfile.des || '库存管理系统用户'
  })

  /**
   * 密码修改表单
   */
  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    realName: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    nikeName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    sex: [{ required: true, message: '请选择性别', trigger: 'blur' }]
  })

  /**
   * 性别选项
   */
  const options = [
    { value: '1', label: '男' },
    { value: '2', label: '女' }
  ]

  /**
   * 切换用户信息编辑状态
   */
  const edit = async () => {
    if (isEdit.value) {
      // 保存数据
      if (ruleFormRef.value) {
        ruleFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              // 更新到API
              await fetchUpdateProfile({
                email: form.email
              })

              // 保存到localStorage
              setMockData('userProfile_' + userInfo.value.userName, {
                realName: form.realName,
                nikeName: form.nikeName,
                email: form.email,
                mobile: form.mobile,
                address: form.address,
                sex: form.sex,
                des: form.des
              })

              // 更新用户信息到store
              userStore.setUserInfo({
                userId: userInfo.value.userId || 0,
                userName: userInfo.value.userName || '',
                email: form.email,
                roles: userInfo.value.roles || [],
                buttons: userInfo.value.buttons || [],
                avatar: userInfo.value.avatar || ''
              })

              ElMessage.success('保存成功')
              isEdit.value = false
            } catch (error) {
              ElMessage.error('保存失败')
            }
          }
        })
      }
    } else {
      isEdit.value = true
    }
  }

  /**
   * 切换密码编辑状态
   */
  const editPwd = async () => {
    if (isEditPwd.value) {
      // 保存密码
      if (!pwdForm.password) {
        ElMessage.error('请输入当前密码')
        return
      }
      if (pwdForm.newPassword !== pwdForm.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      if (pwdForm.newPassword.length < 6) {
        ElMessage.error('密码长度不能少于6位')
        return
      }

      try {
        await fetchChangePassword(
          userInfo.value.userName || '',
          pwdForm.password,
          pwdForm.newPassword
        )
        ElMessage.success('密码修改成功')
        pwdForm.password = ''
        pwdForm.newPassword = ''
        pwdForm.confirmPassword = ''
        isEditPwd.value = false
      } catch (error: any) {
        ElMessage.error(error.message || '密码修改失败')
      }
    } else {
      isEditPwd.value = true
    }
  }
</script>
