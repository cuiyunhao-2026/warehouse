<!-- 统计卡片 -->
<template>
  <ElRow :gutter="20">
    <ElCol :sm="12" :lg="6" v-for="item in statsCards" :key="item.title">
      <ElCard class="stats-card" shadow="hover">
        <div class="card-content">
          <div class="card-info">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-value">{{ item.value }}</div>
            <div class="card-desc">{{ item.desc }}</div>
          </div>
          <div class="card-icon" :style="{ backgroundColor: item.color }">
            <ArtSvgIcon :icon="item.icon" :size="28" color="#fff" />
          </div>
        </div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { fetchGetDashboardStats } from '@/api/inventory'

  const statsCards = ref([
    {
      title: '商品总数',
      value: '0',
      desc: '种商品',
      icon: 'ri:shopping-bag-line',
      color: '#409eff'
    },
    { title: '库存总量', value: '0', desc: '件商品', icon: 'ri:database-2-line', color: '#67c23a' },
    {
      title: '库存总值',
      value: '¥0',
      desc: '成本价',
      icon: 'ri:money-cny-circle-line',
      color: '#e6a23c'
    },
    {
      title: '低库存预警',
      value: '0',
      desc: '种商品需要补货',
      icon: 'ri:alarm-warning-line',
      color: '#f56c6c'
    }
  ])

  const loadStats = async () => {
    try {
      const stats = await fetchGetDashboardStats()
      statsCards.value[0].value = String(stats.totalProducts)
      statsCards.value[1].value = String(stats.totalStock)
      statsCards.value[2].value = `¥${stats.totalValue.toLocaleString()}`
      statsCards.value[3].value = String(stats.lowStockCount)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    }
  }

  onMounted(() => {
    loadStats()
  })
</script>

<style scoped lang="scss">
  .stats-card {
    margin-bottom: 20px;

    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-info {
      flex: 1;
    }

    .card-title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 12px;
      color: #c0c4cc;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
