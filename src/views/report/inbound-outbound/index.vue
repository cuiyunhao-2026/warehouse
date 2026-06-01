<!-- 进出明细报表 -->
<template>
  <div class="report-io-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>进出明细</span>
        </div>
      </template>

      <ElForm :model="searchForm" inline class="mb-4">
        <ElFormItem label="类型">
          <ElSelect v-model="searchForm.type" placeholder="全部" clearable>
            <ElOption label="入库" value="inbound" />
            <ElOption label="出库" value="outbound" />
            <ElOption label="盘点" value="check" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>

      <ElTable :data="tableData" v-loading="loading" border stripe>
        <ElTableColumn prop="productName" label="商品名称" min-width="120" />
        <ElTableColumn prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <ElTag :type="getTypeTag(row.type)" size="small">{{ getTypeName(row.type) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="quantity" label="数量" width="80" align="center" />
        <ElTableColumn prop="beforeStock" label="操作前库存" width="100" align="center" />
        <ElTableColumn prop="afterStock" label="操作后库存" width="100" align="center" />
        <ElTableColumn prop="reason" label="原因" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="createdAt" label="操作时间" width="160" />
        <ElTableColumn label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <ElPopconfirm title="确定删除该记录吗？" @confirm="handleDelete(row.id)">
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
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchGetInventoryLogList, fetchDeleteInventoryLog } from '@/api/inventory'

  defineOptions({ name: 'ReportInboundOutbound' })

  const loading = ref(false)
  const searchForm = reactive({ type: undefined as Api.Inventory.InventoryLogType | undefined })
  const pagination = reactive({ current: 1, size: 10, total: 0 })
  const tableData = ref<Api.Inventory.InventoryLog[]>([])

  const getTypeTag = (type: string): 'success' | 'primary' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'primary' | 'warning' | 'info'> = {
      inbound: 'success',
      outbound: 'primary',
      check: 'warning'
    }
    return map[type] || 'info'
  }

  const getTypeName = (type: string) => {
    const map: Record<string, string> = { inbound: '入库', outbound: '出库', check: '盘点' }
    return map[type] || type
  }

  const loadData = async () => {
    loading.value = true
    try {
      const result = await fetchGetInventoryLogList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = result.records
      pagination.total = result.total
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.type = undefined
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

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteInventoryLog(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .report-io-page {
    .card-header {
      font-weight: 600;
    }

    .mb-4 {
      margin-bottom: 16px;
    }

    .art-pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }
</style>
