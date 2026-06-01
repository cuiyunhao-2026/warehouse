<!-- 单位管理 -->
<template>
  <div class="unit-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品单位管理</span>
          <ElButton type="primary" @click="handleAdd" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增单位
          </ElButton>
        </div>
      </template>

      <ElTable :data="unitList" v-loading="loading" border stripe>
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="name" label="单位名称" min-width="150" />
        <ElTableColumn prop="symbol" label="符号" width="100" />
        <ElTableColumn label="操作" width="150">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleEdit(row)" v-auth="'edit'">
              编辑
            </ElButton>
            <ElPopconfirm title="确定删除该单位吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small" v-auth="'delete'"> 删除 </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="400px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <ElFormItem label="单位名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入单位名称" />
        </ElFormItem>
        <ElFormItem label="符号" prop="symbol">
          <ElInput v-model="formData.symbol" placeholder="请输入单位符号" />
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
  import { fetchGetUnitList, fetchAddUnit, fetchUpdateUnit, fetchDeleteUnit } from '@/api/inventory'

  defineOptions({ name: 'ProductUnit' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增单位')
  const formRef = ref<FormInstance>()
  const unitList = ref<Api.Inventory.Unit[]>([])

  const formData = reactive<Partial<Api.Inventory.Unit>>({
    id: undefined,
    name: '',
    symbol: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
    symbol: [{ required: true, message: '请输入单位符号', trigger: 'blur' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      unitList.value = await fetchGetUnitList()
    } catch (error) {
      console.error('Failed to load units:', error)
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    dialogTitle.value = '新增单位'
    Object.assign(formData, { id: undefined, name: '', symbol: '' })
    dialogVisible.value = true
  }

  const handleEdit = (row: Api.Inventory.Unit) => {
    dialogTitle.value = '编辑单位'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteUnit(id)
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
          await fetchUpdateUnit(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddUnit(formData)
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
  .unit-page {
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
