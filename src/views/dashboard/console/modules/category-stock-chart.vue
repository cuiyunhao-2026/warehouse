<!-- 分类库存统计 -->
<template>
  <ElCard shadow="hover">
    <template #header>
      <div class="card-header">
        <span>分类库存统计</span>
      </div>
    </template>
    <div ref="chartRef" class="chart-container"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { fetchGetCategoryStock } from '@/api/inventory'

  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const initChart = async () => {
    if (!chartRef.value) return

    chart = echarts.init(chartRef.value)
    const data = await fetchGetCategoryStock()

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map((d) => d.categoryName)
      },
      series: [
        {
          name: '库存数量',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((d) => ({
            value: d.totalStock,
            name: d.categoryName
          }))
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
    font-weight: 600;
  }

  .chart-container {
    height: 300px;
  }
</style>
