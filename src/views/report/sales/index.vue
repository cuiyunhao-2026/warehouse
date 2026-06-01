<!-- 销售统计报表 -->
<template>
  <div class="report-sales-page art-full-height">
    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售统计概览</span>
            </div>
          </template>
          <ElRow :gutter="20">
            <ElCol :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalOrders }}</div>
                <div class="stat-label">销售订单数</div>
              </div>
            </ElCol>
            <ElCol :span="8">
              <div class="stat-item">
                <div class="stat-value">¥{{ stats.totalAmount.toLocaleString() }}</div>
                <div class="stat-label">销售总金额</div>
              </div>
            </ElCol>
            <ElCol :span="8">
              <div class="stat-item">
                <div class="stat-value">¥{{ stats.averageOrderAmount.toFixed(2) }}</div>
                <div class="stat-label">平均订单金额</div>
              </div>
            </ElCol>
          </ElRow>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mt-4">
      <ElCol :span="12">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>热销商品排名</span>
            </div>
          </template>
          <ElTable :data="stats.topProducts" border>
            <ElTableColumn type="index" label="排名" width="60" />
            <ElTableColumn prop="name" label="商品" min-width="120" />
            <ElTableColumn prop="quantity" label="销量" width="80" align="center" />
            <ElTableColumn prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>热销商品销量分布</span>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { fetchGetSalesStats } from '@/api/inventory'

  defineOptions({ name: 'ReportSales' })

  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const stats = reactive<Api.Inventory.SalesStats>({
    totalAmount: 0,
    totalOrders: 0,
    averageOrderAmount: 0,
    topProducts: []
  })

  const loadStats = async () => {
    try {
      const data = await fetchGetSalesStats()
      Object.assign(stats, data)
      initChart()
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const initChart = () => {
    if (!chartRef.value || stats.topProducts.length === 0) return
    chart = echarts.init(chartRef.value)

    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: stats.topProducts.map((p) => p.productName) },
      yAxis: { type: 'value' },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: stats.topProducts.map((p) => p.quantity),
          itemStyle: { color: '#409eff' }
        }
      ]
    })
  }

  const handleResize = () => chart?.resize()

  onMounted(() => {
    loadStats()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
  })
</script>

<style scoped lang="scss">
  .report-sales-page {
    .card-header {
      font-weight: 600;
    }

    .stat-item {
      text-align: center;
      padding: 20px;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }

    .chart-container {
      height: 300px;
    }

    .mt-4 {
      margin-top: 20px;
    }
  }
</style>
