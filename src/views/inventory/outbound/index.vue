<!-- 出库管理 -->
<template>
  <div class="outbound-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>出库操作</span>
        </div>
      </template>

      <ElForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        style="max-width: 600px"
      >
        <ElFormItem label="选择商品" prop="productId">
          <ElSelect
            v-model="formData.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
            @change="handleProductChange"
          >
            <ElOption
              v-for="product in productList"
              :key="product.id"
              :label="`${product.name} (${product.code}) 库存:${product.stock}`"
              :value="product.id"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="当前库存" v-if="selectedProduct">
          <ElInput :model-value="String(selectedProduct.stock)" disabled>
            <template #append>{{ selectedProduct.unit }}</template>
          </ElInput>
        </ElFormItem>

        <ElFormItem label="所在仓库" v-if="selectedProduct">
          <ElInput :model-value="selectedProduct.warehouseName || ''" disabled />
        </ElFormItem>

        <ElFormItem label="出库数量" prop="quantity">
          <ElInputNumber
            v-model="formData.quantity"
            :min="1"
            :max="selectedProduct?.stock || 999999"
            style="width: 100%"
          />
        </ElFormItem>

        <ElFormItem label="出库原因" prop="reason">
          <ElInput
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入出库原因"
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
            <ArtSvgIcon icon="ri:logout-box-line" class="mr-1" />
            确认出库
          </ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 最近出库记录 -->
    <ElCard shadow="never" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>最近出库记录</span>
          <ElButton
            v-if="selectedLogs.length > 0"
            type="danger"
            size="small"
            @click="handleBatchDeleteLog"
          >
            批量删除 ({{ selectedLogs.length }})
          </ElButton>
        </div>
      </template>

      <ElTable :data="recentLogs" border stripe @selection-change="handleLogSelectionChange">
        <ElTableColumn type="selection" width="50" />
        <ElTableColumn prop="productName" label="商品名称" min-width="120" />
        <ElTableColumn prop="quantity" label="出库数量" width="100" align="center" />
        <ElTableColumn prop="beforeStock" label="出库前库存" width="100" align="center" />
        <ElTableColumn prop="afterStock" label="出库后库存" width="100" align="center" />
        <ElTableColumn prop="reason" label="出库原因" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="createdAt" label="操作时间" width="160" />
        <ElTableColumn label="操作" width="80" align="center">
          <template #default="{ row }">
            <ElPopconfirm title="确定删除该记录吗？" @confirm="handleDeleteLog(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small">删除</ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetAllProducts,
    fetchOutbound,
    fetchGetInventoryLogList,
    fetchDeleteInventoryLog
  } from '@/api/inventory'

  defineOptions({ name: 'InventoryOutbound' })

  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const productList = ref<any[]>([])
  const selectedProduct = ref<any>(null)
  const recentLogs = ref<any[]>([])
  const selectedLogs = ref<any[]>([])

  const formData = reactive({
    productId: undefined as number | undefined,
    quantity: 1,
    reason: ''
  })

  const formRules: FormRules = {
    productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
    reason: [{ required: true, message: '请输入出库原因', trigger: 'blur' }]
  }

  const loadProducts = async () => {
    try {
      productList.value = await fetchGetAllProducts()
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadRecentLogs = async () => {
    try {
      const result = await fetchGetInventoryLogList({ type: 'outbound', current: 1, size: 10 })
      recentLogs.value = result.records
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
  }

  const handleProductChange = (productId: number) => {
    selectedProduct.value = productList.value.find((p: any) => p.id === productId) || null
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        await fetchOutbound({
          productId: formData.productId,
          quantity: formData.quantity,
          reason: formData.reason
        })
        ElMessage.success('出库成功')
        handleReset()
        loadProducts()
        loadRecentLogs()
      } catch (error: any) {
        ElMessage.error(error.message || '出库失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleLogSelectionChange = (rows: any[]) => {
    selectedLogs.value = rows
  }

  const handleBatchDeleteLog = async () => {
    if (selectedLogs.value.length === 0) return
    try {
      await ElMessageBox.confirm(
        `确定要批量删除 ${selectedLogs.value.length} 条记录吗？`,
        '批量删除确认',
        { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    try {
      for (const row of selectedLogs.value) {
        await fetchDeleteInventoryLog(row.id)
      }
      ElMessage.success(`成功删除 ${selectedLogs.value.length} 条记录`)
      selectedLogs.value = []
      loadRecentLogs()
    } catch {
      ElMessage.error('批量删除失败')
    }
  }

  const handleDeleteLog = async (id: number) => {
    try {
      await fetchDeleteInventoryLog(id)
      ElMessage.success('删除成功')
      loadRecentLogs()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  const handleReset = () => {
    formData.productId = undefined
    formData.quantity = 1
    formData.reason = ''
    selectedProduct.value = null
  }

  onMounted(() => {
    loadProducts()
    loadRecentLogs()
  })
</script>

<style scoped lang="scss">
  .outbound-page {
    .card-header {
      font-weight: 600;
    }

    .mr-1 {
      margin-right: 4px;
    }

    .mt-4 {
      margin-top: 20px;
    }
  }
</style>
