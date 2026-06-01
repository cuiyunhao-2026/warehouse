<!-- 库存趋势图 -->
<template>
  <ElCard shadow="hover">
    <template #header>
      <div class="card-header">
        <span>库存趋势（近7天）</span>
      </div>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { fetchGetStockTrend } from '@/api/inventory'

  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const initChart = async () => {
    if (!chartRef.value) return

    chart = echarts.init(chartRef.value)
    const data = await fetchGetStockTrend()

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['入库', '出库']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '入库',
          type: 'bar',
          data: data.map((d) => d.inbound),
          itemStyle: {
            color: '#67c23a'
          }
        },
        {
          name: '出库',
          type: 'bar',
          data: data.map((d) => d.outbound),
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }

    chart.setOption(option)
  }

  const handleResize = () => {
    chart?.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
  })
</script>

<style scoped lang="scss">
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .chart-container {
    height: 300px;
  }
</style>
