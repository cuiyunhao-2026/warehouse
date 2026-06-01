<!-- 库存查询 -->
<template>
  <div class="query-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="art-search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="商品名称">
          <ElInput v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </ElFormItem>
        <ElFormItem label="商品编码">
          <ElInput v-model="searchForm.code" placeholder="请输入商品编码" clearable />
        </ElFormItem>
        <ElFormItem label="商品分类">
          <ElSelect v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
            <ElOption
              v-for="category in allCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="所在仓库">
          <ElSelect v-model="searchForm.warehouseId" placeholder="请选择仓库" clearable>
            <ElOption
              v-for="warehouse in allWarehouses"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" class="mr-1" />
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ElTable :data="tableData" v-loading="loading" border stripe>
        <ElTableColumn prop="code" label="商品编码" width="120" />
        <ElTableColumn prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="categoryName" label="分类" width="100" />
        <ElTableColumn prop="warehouseName" label="所在仓库" width="100" />
        <ElTableColumn prop="unit" label="单位" width="60" align="center" />
        <ElTableColumn prop="price" label="售价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="cost" label="成本价" width="100" align="right">
          <template #default="{ row }">¥{{ row.cost?.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="stock" label="当前库存" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.stock <= row.minStock }">{{ row.stock }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="minStock" label="最低库存" width="80" align="center" />
        <ElTableColumn label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStockStatusType(row)" size="small">
              {{ getStockStatusText(row) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="库存价值" width="120" align="right">
          <template #default="{ row }"> ¥{{ (row.stock * row.cost).toFixed(2) }} </template>
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
  import { fetchGetProductList, getAllCategories, fetchGetWarehouseList } from '@/api/inventory'

  defineOptions({ name: 'InventoryQuery' })

  const loading = ref(false)
  const allCategories = ref<any[]>([])
  const allWarehouses = ref<any[]>([])

  const searchForm = reactive({
    name: '',
    code: '',
    categoryId: undefined as number | undefined,
    warehouseId: undefined as number | undefined
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const tableData = ref<any[]>([])

  const getStockStatusType = (row: any) => {
    if (row.stock <= 0) return 'danger'
    if (row.stock <= row.minStock) return 'warning'
    return 'success'
  }

  const getStockStatusText = (row: any) => {
    if (row.stock <= 0) return '缺货'
    if (row.stock <= row.minStock) return '低库存'
    return '正常'
  }

  const loadData = async () => {
    loading.value = true
    try {
      const result = await fetchGetProductList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = result.records.map((item: any) => ({
        ...item,
        categoryName: allCategories.value.find((c: any) => c.id === item.categoryId)?.name || '',
        warehouseName: allWarehouses.value.find((w: any) => w.id === item.warehouseId)?.name || ''
      }))
      pagination.total = result.total
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      allCategories.value = await getAllCategories()
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadWarehouses = async () => {
    try {
      allWarehouses.value = await fetchGetWarehouseList()
    } catch (error) {
      console.error('Failed to load warehouses:', error)
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.code = ''
    searchForm.categoryId = undefined
    searchForm.warehouseId = undefined
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

  onMounted(() => {
    loadCategories()
    loadWarehouses()
    loadData()
  })
</script>

<style scoped lang="scss">
  .query-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .art-search-card {
    margin-bottom: 0;
  }

  .art-table-card {
    flex: 1;
  }

  .art-pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .danger-text {
    color: #f56c6c;
    font-weight: 600;
  }

  .mr-1 {
    margin-right: 4px;
  }
</style>
