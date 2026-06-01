<!-- 库存盘点 -->
<template>
  <div class="check-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>库存盘点</span>
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
              :label="`${product.name} (${product.code})`"
              :value="product.id"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="系统库存" v-if="selectedProduct">
          <ElInput :model-value="String(selectedProduct.stock)" disabled>
            <template #append>{{ selectedProduct.unit }}</template>
          </ElInput>
        </ElFormItem>

        <ElFormItem label="所在仓库" v-if="selectedProduct">
          <ElInput :model-value="selectedProduct.warehouseName || ''" disabled />
        </ElFormItem>

        <ElFormItem label="实际库存" prop="actualStock">
          <ElInputNumber v-model="formData.actualStock" :min="0" style="width: 100%" />
        </ElFormItem>

        <ElFormItem label="差异" v-if="selectedProduct">
          <ElTag :type="difference === 0 ? 'success' : difference > 0 ? 'warning' : 'danger'">
            {{ difference > 0 ? `+${difference}` : difference }}
          </ElTag>
          <span class="ml-2">{{
            difference === 0 ? '无差异' : difference > 0 ? '盘盈' : '盘亏'
          }}</span>
        </ElFormItem>

        <ElFormItem label="备注" prop="remark">
          <ElInput
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入盘点备注"
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
            <ArtSvgIcon icon="ri:clipboard-line" class="mr-1" />
            提交盘点
          </ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 最近盘点记录 -->
    <ElCard shadow="never" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>最近盘点记录</span>
        </div>
      </template>

      <ElTable :data="recentLogs" border stripe>
        <ElTableColumn prop="productName" label="商品名称" min-width="120" />
        <ElTableColumn prop="beforeStock" label="系统库存" width="100" align="center" />
        <ElTableColumn prop="afterStock" label="实际库存" width="100" align="center" />
        <ElTableColumn label="差异" width="100" align="center">
          <template #default="{ row }">
            <ElTag
              :type="row.afterStock - row.beforeStock === 0 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.afterStock - row.beforeStock }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="reason" label="备注" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="createdAt" label="操作时间" width="160" />
        <ElTableColumn label="操作" width="80" align="center">
          <template #default="{ row }">
            <ElPopconfirm title="确定删除该记录吗？" @confirm="handleDeleteLog(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetAllProducts,
    fetchCheck,
    fetchGetInventoryLogList,
    fetchDeleteInventoryLog
  } from '@/api/inventory'

  defineOptions({ name: 'InventoryCheck' })

  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const productList = ref<any[]>([])
  const selectedProduct = ref<any>(null)
  const recentLogs = ref<any[]>([])

  const formData = reactive({
    productId: undefined as number | undefined,
    actualStock: 0,
    remark: ''
  })

  const formRules: FormRules = {
    productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
    actualStock: [{ required: true, message: '请输入实际库存', trigger: 'blur' }]
  }

  const difference = computed(() => {
    if (!selectedProduct.value) return 0
    return formData.actualStock - selectedProduct.value.stock
  })

  const loadProducts = async () => {
    try {
      productList.value = await fetchGetAllProducts()
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadRecentLogs = async () => {
    try {
      const result = await fetchGetInventoryLogList({ type: 'check', current: 1, size: 10 })
      recentLogs.value = result.records
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
  }

  const handleProductChange = (productId: number) => {
    selectedProduct.value = productList.value.find((p: any) => p.id === productId) || null
    if (selectedProduct.value) {
      formData.actualStock = selectedProduct.value.stock
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        await fetchCheck({
          productId: formData.productId,
          actualStock: formData.actualStock,
          remark: formData.remark
        })
        ElMessage.success('盘点完成')
        handleReset()
        loadProducts()
        loadRecentLogs()
      } catch (error) {
        ElMessage.error('盘点失败')
      } finally {
        submitLoading.value = false
      }
    })
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
    formData.actualStock = 0
    formData.remark = ''
    selectedProduct.value = null
  }

  onMounted(() => {
    loadProducts()
    loadRecentLogs()
  })
</script>

<style scoped lang="scss">
  .check-page {
    .card-header {
      font-weight: 600;
    }

    .mr-1 {
      margin-right: 4px;
    }

    .ml-2 {
      margin-left: 8px;
    }

    .mt-4 {
      margin-top: 20px;
    }
  }
</style>
