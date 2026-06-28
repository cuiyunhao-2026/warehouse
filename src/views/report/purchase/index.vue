<!-- 采购统计报表 -->
<template>
  <div class="report-purchase-page art-full-height">
    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>采购统计概览</span>
            </div>
          </template>
          <ElRow :gutter="20">
            <ElCol :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalOrders }}</div>
                <div class="stat-label">采购订单数</div>
              </div>
            </ElCol>
            <ElCol :span="8">
              <div class="stat-item">
                <div class="stat-value">¥{{ stats.totalAmount.toLocaleString() }}</div>
                <div class="stat-label">采购总金额</div>
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
              <span>主要供应商排名</span>
            </div>
          </template>
          <ElTable :data="stats.topSuppliers" border>
            <ElTableColumn type="index" label="排名" width="60" />
            <ElTableColumn prop="supplierName" label="供应商" min-width="150" />
            <ElTableColumn prop="orderCount" label="订单数" width="80" align="center" />
            <ElTableColumn prop="totalAmount" label="总金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.totalAmount.toLocaleString() }}</template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>供应商采购金额分布</span>
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
  import { fetchGetPurchaseStats } from '@/api/inventory'

  defineOptions({ name: 'ReportPurchase' })

  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const stats = reactive<Api.Inventory.PurchaseStats>({
    totalAmount: 0,
    totalOrders: 0,
    averageOrderAmount: 0,
    topSuppliers: []
  })

  const loadStats = async () => {
    try {
      const data = await fetchGetPurchaseStats()
      Object.assign(stats, data)
      initChart()
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const initChart = () => {
    if (!chartRef.value || stats.topSuppliers.length === 0) return
    chart = echarts.init(chartRef.value)

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '采购金额',
          type: 'pie',
          radius: '50%',
          data: stats.topSuppliers.map((s) => ({ value: s.totalAmount, name: s.supplierName })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
          }
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
  .report-purchase-page {
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
