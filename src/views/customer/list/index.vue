<!-- 客户管理 -->
<template>
  <div class="customer-list-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="art-search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="客户名称">
          <ElInput v-model="searchForm.name" placeholder="请输入客户名称" clearable />
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
            新增客户
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            type="danger"
            @click="handleBatchDelete"
            v-auth="'delete'"
          >
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
            批量删除 ({{ selectedRows.length }})
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            type="warning"
            @click="handleBatchExport"
            v-auth="'export'"
          >
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            批量导出 ({{ selectedRows.length }})
          </ElButton>
        </template>
      </ArtTableHeader>

      <ElTable
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="name" label="客户名称" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="contact" label="联系人" width="100" />
        <ElTableColumn prop="phone" label="电话" width="130" />
        <ElTableColumn prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <ElTableColumn prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="shopName" label="所属店铺" width="120" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
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
            <ElPopconfirm title="确定删除该客户吗？" @confirm="handleDelete(row.id)">
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
        <ElFormItem label="客户名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入客户名称" />
        </ElFormItem>
        <ElFormItem label="联系人" prop="contact">
          <ElInput v-model="formData.contact" placeholder="请输入联系人" />
        </ElFormItem>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="电话" prop="phone">
              <ElInput v-model="formData.phone" placeholder="请输入电话" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="邮箱" prop="email">
              <ElInput v-model="formData.email" placeholder="请输入邮箱" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="地址" prop="address">
          <ElInput v-model="formData.address" placeholder="请输入地址" />
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
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetCustomerList,
    fetchAddCustomer,
    fetchUpdateCustomer,
    fetchDeleteCustomer
  } from '@/api/inventory'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'

  defineOptions({ name: 'CustomerList' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增客户')
  const formRef = ref<FormInstance>()
  const selectedRows = ref<any[]>([])

  const searchForm = reactive({
    name: '',
    contact: '',
    status: undefined as string | undefined
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const tableData = ref<any[]>([])

  const formData = reactive({
    id: undefined as number | undefined,
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    status: '1'
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      const result = await fetchGetCustomerList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = result.records
      pagination.total = result.total
    } catch (error) {
      console.error('Failed to load customers:', error)
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
    dialogTitle.value = '新增客户'
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

  const handleEdit = (row: any) => {
    dialogTitle.value = '编辑客户'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteCustomer(id)
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
          await fetchUpdateCustomer(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddCustomer(formData)
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

  // 选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个客户吗？`,
        '批量删除确认',
        { type: 'warning' }
      )

      loading.value = true
      for (const row of selectedRows.value) {
        await fetchDeleteCustomer(row.id)
      }
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个客户`)
      selectedRows.value = []
      loadData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 批量导出
  const handleBatchExport = () => {
    const exportData = selectedRows.value.map((item, index) => ({
      序号: index + 1,
      客户名称: item.name,
      联系人: item.contact,
      电话: item.phone,
      邮箱: item.email,
      地址: item.address,
      所属店铺: item.shopName,
      状态: item.status === '1' ? '启用' : '禁用'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '客户列表')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `客户列表_${new Date().toLocaleDateString()}.xlsx`
    )
    ElMessage.success('导出成功')
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .customer-list-page {
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
