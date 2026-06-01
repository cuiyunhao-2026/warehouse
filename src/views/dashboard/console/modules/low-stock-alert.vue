<!-- 低库存预警 -->
<template>
  <ElCard shadow="hover">
    <template #header>
      <div class="card-header">
        <span>低库存预警</span>
        <ElTag type="danger" size="small">{{ lowStockList.length }} 种商品</ElTag>
      </div>
    </template>
    <ElTable :data="lowStockList" style="width: 100%" max-height="260">
      <ElTableColumn prop="name" label="商品名称" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="code" label="商品编码" width="100" />
      <ElTableColumn prop="stock" label="当前库存" width="80" align="center">
        <template #default="{ row }">
          <span class="danger-text">{{ row.stock }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="minStock" label="最低库存" width="80" align="center" />
      <ElTableColumn prop="unit" label="单位" width="60" align="center" />
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { fetchGetLowStockProducts } from '@/api/inventory'

  const lowStockList = ref<Api.Inventory.LowStockProduct[]>([])

  const loadLowStock = async () => {
    try {
      lowStockList.value = await fetchGetLowStockProducts()
    } catch (error) {
      console.error('Failed to load low stock products:', error)
    }
  }

  onMounted(() => {
    loadLowStock()
  })
</script>

<style scoped lang="scss">
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .danger-text {
    color: #f56c6c;
    font-weight: 600;
  }
</style>
