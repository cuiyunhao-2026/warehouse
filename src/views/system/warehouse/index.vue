<!-- 仓库管理 -->
<template>
  <div class="warehouse-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>仓库管理</span>
          <ElButton type="primary" @click="handleAdd" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增仓库
          </ElButton>
        </div>
      </template>

      <ElTable :data="warehouseList" v-loading="loading" border stripe>
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="name" label="仓库名称" min-width="150" />
        <ElTableColumn prop="location" label="位置" min-width="250" show-overflow-tooltip />
        <ElTableColumn prop="shopName" label="所属店铺" width="120" />
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
            <ElPopconfirm title="确定删除该仓库吗？" @confirm="handleDelete(row.id)">
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
        <ElFormItem label="仓库名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入仓库名称" />
        </ElFormItem>
        <ElFormItem label="位置" prop="location">
          <ElInput
            v-model="formData.location"
            type="textarea"
            :rows="2"
            placeholder="请输入仓库位置"
          />
        </ElFormItem>
        <ElFormItem label="所属店铺" prop="shopId">
          <ElSelect v-model="formData.shopId" placeholder="请选择店铺" style="width: 100%">
            <ElOption v-for="shop in shopList" :key="shop.id" :label="shop.name" :value="shop.id" />
          </ElSelect>
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
    fetchGetWarehouseList,
    fetchAddWarehouse,
    fetchUpdateWarehouse,
    fetchDeleteWarehouse,
    fetchGetAllShops
  } from '@/api/inventory'

  defineOptions({ name: 'SystemWarehouse' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增仓库')
  const formRef = ref<FormInstance>()
  const warehouseList = ref<any[]>([])
  const shopList = ref<any[]>([])

  const formData = reactive({
    id: undefined as number | undefined,
    name: '',
    location: '',
    shopId: undefined as number | undefined,
    status: '1'
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
    location: [{ required: true, message: '请输入仓库位置', trigger: 'blur' }],
    shopId: [{ required: true, message: '请选择所属店铺', trigger: 'change' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      warehouseList.value = await fetchGetWarehouseList()
    } catch (error) {
      console.error('Failed to load warehouses:', error)
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

  const handleAdd = () => {
    dialogTitle.value = '新增仓库'
    Object.assign(formData, {
      id: undefined,
      name: '',
      location: '',
      shopId: undefined,
      status: '1'
    })
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    dialogTitle.value = '编辑仓库'
    Object.assign(formData, { ...row, shopId: row.shop_id })
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteWarehouse(id)
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
          await fetchUpdateWarehouse(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddWarehouse(formData)
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
    loadShops()
  })
</script>

<style scoped lang="scss">
  .warehouse-page {
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
