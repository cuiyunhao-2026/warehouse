<!-- 供应商列表 -->
<template>
  <div class="supplier-list-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="art-search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="供应商名称">
          <ElInput v-model="searchForm.name" placeholder="请输入供应商名称" clearable />
        </ElFormItem>
        <ElFormItem label="联系人">
          <ElInput v-model="searchForm.contact" placeholder="请输入联系人" clearable />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="启用" value="1" />
            <ElOption label="禁用" value="2" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader>
        <template #left>
          <ElButton type="primary" @click="handleAdd" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增供应商
          </ElButton>
        </template>
      </ArtTableHeader>

      <ElTable :data="tableData" v-loading="loading" border stripe>
        <ElTableColumn prop="name" label="供应商名称" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="contact" label="联系人" width="100" />
        <ElTableColumn prop="phone" label="联系电话" width="130" />
        <ElTableColumn prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <ElTableColumn prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" size="small">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="创建时间" width="160" />
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleEdit(row)" v-auth="'edit'">
              编辑
            </ElButton>
            <ElPopconfirm title="确定删除该供应商吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small" v-auth="'delete'"> 删除 </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="art-pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="供应商名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入供应商名称" />
        </ElFormItem>
        <ElFormItem label="联系人" prop="contact">
          <ElInput v-model="formData.contact" placeholder="请输入联系人" />
        </ElFormItem>
        <ElFormItem label="联系电话" prop="phone">
          <ElInput v-model="formData.phone" placeholder="请输入联系电话" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="formData.email" placeholder="请输入邮箱" />
        </ElFormItem>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="formData.address" type="textarea" :rows="2" placeholder="请输入地址" />
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
  import {
    fetchGetSupplierList,
    fetchAddSupplier,
    fetchUpdateSupplier,
    fetchDeleteSupplier
  } from '@/api/inventory'

  defineOptions({ name: 'SupplierList' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增供应商')
  const formRef = ref<FormInstance>()

  const searchForm = reactive({
    name: '',
    contact: '',
    status: undefined as Api.Inventory.SupplierStatus | undefined
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const tableData = ref<Api.Inventory.Supplier[]>([])

  const formData = reactive<Partial<Api.Inventory.Supplier>>({
    id: undefined,
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    status: '1'
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      const result = await fetchGetSupplierList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = result.records
      pagination.total = result.total
    } catch (error) {
      console.error('Failed to load suppliers:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.contact = ''
    searchForm.status = undefined
    handleSearch()
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    loadData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadData()
  }

  const handleAdd = () => {
    dialogTitle.value = '新增供应商'
    Object.assign(formData, {
      id: undefined,
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      status: '1'
    })
    dialogVisible.value = true
  }

  const handleEdit = (row: Api.Inventory.Supplier) => {
    dialogTitle.value = '编辑供应商'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteSupplier(id)
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
          await fetchUpdateSupplier(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddSupplier(formData)
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
  .supplier-list-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .art-search-card {
    margin-bottom: 0;
  }

  .art-table-card {
    flex: 1;
  }

  .art-pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .mr-1 {
    margin-right: 4px;
  }
</style>
