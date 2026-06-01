<!-- 最近操作记录 -->
<template>
  <ElCard shadow="hover">
    <template #header>
      <div class="card-header">
        <span>最近操作记录</span>
      </div>
    </template>
    <ElTable :data="recentLogs" style="width: 100%" max-height="260">
      <ElTableColumn prop="productName" label="商品" min-width="100" show-overflow-tooltip />
      <ElTableColumn prop="type" label="类型" width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="getTypeTag(row.type)" size="small">{{ getTypeName(row.type) }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="quantity" label="数量" width="70" align="center" />
      <ElTableColumn prop="reason" label="原因" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="createdAt" label="时间" width="150" />
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { fetchGetInventoryLogList } from '@/api/inventory'

  const recentLogs = ref<Api.Inventory.InventoryLog[]>([])

  const getTypeTag = (type: string): 'success' | 'primary' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'primary' | 'warning' | 'info'> = {
      inbound: 'success',
      outbound: 'primary',
      check: 'warning'
    }
    return map[type] || 'info'
  }

  const getTypeName = (type: string) => {
    const map: Record<string, string> = {
      inbound: '入库',
      outbound: '出库',
      check: '盘点'
    }
    return map[type] || type
  }

  const loadRecentLogs = async () => {
    try {
      const result = await fetchGetInventoryLogList({ current: 1, size: 10 })
      recentLogs.value = result.records
    } catch (error) {
      console.error('Failed to load recent logs:', error)
    }
  }

  onMounted(() => {
    loadRecentLogs()
  })
</script>

<style scoped lang="scss">
  .card-header {
    font-weight: 600;
  }
</style>
