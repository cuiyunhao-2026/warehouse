<!-- 店铺管理 -->
<template>
  <div class="shop-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>店铺管理</span>
          <ElButton type="primary" @click="handleAdd" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增店铺
          </ElButton>
        </div>
      </template>

      <ElTable :data="shopList" v-loading="loading" border stripe>
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="code" label="店铺编码" width="120" />
        <ElTableColumn prop="name" label="店铺名称" min-width="150" />
        <ElTableColumn prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="phone" label="电话" width="130" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" size="small">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleEdit(row)" v-auth="'edit'">
              编辑
            </ElButton>
            <ElPopconfirm title="确定删除该店铺吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small" v-auth="'delete'"> 删除 </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="店铺编码" prop="code">
          <ElInput v-model="formData.code" placeholder="请输入店铺编码" />
        </ElFormItem>
        <ElFormItem label="店铺名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入店铺名称" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="formData.address" placeholder="请输入地址" />
        </ElFormItem>
        <ElFormItem label="电话" prop="phone">
          <ElInput v-model="formData.phone" placeholder="请输入电话" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="formData.status">
            <ElRadio value="1">启用</ElRadio>
            <ElRadio value="2">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchGetShopList, fetchAddShop, fetchUpdateShop, fetchDeleteShop } from '@/api/inventory'

  defineOptions({ name: 'SystemShop' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增店铺')
  const formRef = ref<FormInstance>()
  const shopList = ref<any[]>([])

  const formData = reactive({
    id: undefined as number | undefined,
    code: '',
    name: '',
    address: '',
    phone: '',
    status: '1'
  })

  const formRules: FormRules = {
    code: [{ required: true, message: '请输入店铺编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      shopList.value = await fetchGetShopList()
    } catch (error) {
      console.error('Failed to load shops:', error)
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    dialogTitle.value = '新增店铺'
    Object.assign(formData, {
      id: undefined,
      code: '',
      name: '',
      address: '',
      phone: '',
      status: '1'
    })
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    dialogTitle.value = '编辑店铺'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteShop(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        if (formData.id) {
          await fetchUpdateShop(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddShop(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .shop-page {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mr-1 {
      margin-right: 4px;
    }
  }
</style>
