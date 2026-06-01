<!-- 库存报表 -->
<template>
  <div class="report-inventory-page art-full-height">
    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>库存概览</span>
            </div>
          </template>
          <ElRow :gutter="20">
            <ElCol :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalProducts }}</div>
                <div class="stat-label">商品总数</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalStock }}</div>
                <div class="stat-label">库存总量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-item">
                <div class="stat-value">¥{{ stats.totalValue.toLocaleString() }}</div>
                <div class="stat-label">库存总值</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-item danger">
                <div class="stat-value">{{ stats.lowStockCount }}</div>
                <div class="stat-label">低库存预警</div>
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
              <span>分类库存分布</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="never">
          <template #header>
            <div class="card-header">
              <span>库存价值分布</span>
            </div>
          </template>
          <div ref="valueChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { fetchGetDashboardStats, fetchGetCategoryStock } from '@/api/inventory'

  defineOptions({ name: 'ReportInventory' })

  const categoryChartRef = ref<HTMLElement>()
  const valueChartRef = ref<HTMLElement>()
  let categoryChart: echarts.ECharts | null = null
  let valueChart: echarts.ECharts | null = null

  const stats = reactive({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0
  })

  const loadStats = async () => {
    try {
      const data = await fetchGetDashboardStats()
      Object.assign(stats, data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const initCategoryChart = async () => {
    if (!categoryChartRef.value) return
    categoryChart = echarts.init(categoryChartRef.value)
    const data = await fetchGetCategoryStock()

    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '库存数量',
          type: 'pie',
          radius: '50%',
          data: data.map((d) => ({ value: d.totalStock, name: d.categoryName })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
          }
        }
      ]
    })
  }

  const initValueChart = async () => {
    if (!valueChartRef.value) return
    valueChart = echarts.init(valueChartRef.value)
    const data = await fetchGetCategoryStock()

    valueChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '库存价值',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
          labelLine: { show: false },
          data: data.map((d) => ({ value: d.totalValue, name: d.categoryName }))
        }
      ]
    })
  }

  const handleResize = () => {
    categoryChart?.resize()
    valueChart?.resize()
  }

  onMounted(() => {
    loadStats()
    initCategoryChart()
    initValueChart()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    categoryChart?.dispose()
    valueChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .report-inventory-page {
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

      &.danger {
        .stat-value {
          color: #f56c6c;
        }
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
