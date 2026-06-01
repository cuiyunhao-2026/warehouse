<!-- 库存管理仪表盘 -->
<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <StatsCards />

    <ElRow :gutter="20" class="mt-4">
      <!-- 库存趋势图 -->
      <ElCol :sm="24" :lg="14">
        <StockTrendChart />
      </ElCol>
      <!-- 低库存预警 -->
      <ElCol :sm="24" :lg="10">
        <LowStockAlert />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mt-4">
      <!-- 分类库存统计 -->
      <ElCol :sm="24" :lg="12">
        <CategoryStockChart />
      </ElCol>
      <!-- 最近操作记录 -->
      <ElCol :sm="24" :lg="12">
        <RecentOperations />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import StatsCards from './modules/stats-cards.vue'
  import StockTrendChart from './modules/stock-trend-chart.vue'
  import LowStockAlert from './modules/low-stock-alert.vue'
  import CategoryStockChart from './modules/category-stock-chart.vue'
  import RecentOperations from './modules/recent-operations.vue'

  defineOptions({ name: 'Console' })
</script>

<style scoped lang="scss">
  .dashboard-page {
    padding-bottom: 20px;
  }

  .mt-4 {
    margin-top: 20px;
  }
</style>
