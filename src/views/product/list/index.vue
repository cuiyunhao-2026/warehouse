<!-- 商品列表 -->
<template>
  <div class="product-list-page art-full-height">
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
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="启用" value="1" />
            <ElOption label="禁用" value="2" />
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
      <ArtTableHeader>
        <template #left>
          <ElButton type="primary" @click="handleAdd" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增商品
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            type="danger"
            @click="handleBatchDelete"
            v-auth="'delete'"
          >
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
            批量删除 ({{ selectedRows.length }})
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            type="warning"
            @click="handleBatchExport"
            v-auth="'export'"
          >
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            批量导出 ({{ selectedRows.length }})
          </ElButton>
        </template>
      </ArtTableHeader>

      <ElTable
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="code" label="商品编码" width="120" />
        <ElTableColumn prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="categoryName" label="分类" width="100" />
        <ElTableColumn prop="warehouseName" label="所在仓库" width="100" />
        <ElTableColumn prop="unit" label="基本单位" width="80" align="center" />
        <ElTableColumn prop="price" label="零售价" width="100" align="right">
          <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="cost" label="成本价" width="100" align="right">
          <template #default="{ row }">¥{{ row.cost?.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.stock <= row.minStock }">{{ row.stock }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="多价格" width="120">
          <template #default="{ row }">
            <ElTag v-for="p in row.prices" :key="p.id" size="small" class="mr-1 mb-1">
              {{ p.price_name }}:¥{{ p.price }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="复合单位" width="150">
          <template #default="{ row }">
            <div v-for="u in row.unitConversions" :key="u.id" class="text-xs">
              1{{ u.to_unit }}={{ u.conversion_rate }}{{ u.from_unit }} ¥{{ u.price }}
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" size="small">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleEdit(row)" v-auth="'edit'">
              编辑
            </ElButton>
            <ElPopconfirm title="确定删除该商品吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small" v-auth="'delete'"> 删除 </ElButton>
              </template>
            </ElPopconfirm>
          </template>
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

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="商品编码" prop="code">
              <ElInput v-model="formData.code" placeholder="请输入商品编码" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="商品名称" prop="name">
              <ElInput v-model="formData.name" placeholder="请输入商品名称" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="商品分类" prop="categoryId">
              <ElSelect v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
                <ElOption
                  v-for="category in allCategories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="所在仓库" prop="warehouseId">
              <ElSelect v-model="formData.warehouseId" placeholder="请选择仓库" style="width: 100%">
                <ElOption
                  v-for="warehouse in allWarehouses"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="8">
            <ElFormItem label="基本单位" prop="unit">
              <ElSelect v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <ElOption
                  v-for="unit in unitList"
                  :key="unit.id"
                  :label="unit.name"
                  :value="unit.name"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="零售价" prop="price">
              <ElInputNumber v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="成本价" prop="cost">
              <ElInputNumber v-model="formData.cost" :min="0" :precision="2" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="库存" prop="stock">
              <ElInputNumber v-model="formData.stock" :min="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="最低库存" prop="minStock">
              <ElInputNumber v-model="formData.minStock" :min="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="描述">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入商品描述"
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="formData.status">
            <ElRadio value="1">启用</ElRadio>
            <ElRadio value="2">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <!-- 多价格设置 -->
        <ElDivider content-position="left">多价格设置</ElDivider>
        <div v-for="(price, index) in formData.prices" :key="index" class="flex items-center mb-2">
          <ElInput v-model="price.price_name" placeholder="价格名称" style="width: 150px" />
          <ElInputNumber
            v-model="price.price"
            :min="0"
            :precision="2"
            style="width: 150px; margin-left: 10px"
          />
          <ElButton type="danger" link @click="removePrice(index)" class="ml-2">
            <ArtSvgIcon icon="ri:delete-bin-line" />
          </ElButton>
        </div>
        <ElButton type="primary" link @click="addPrice">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加价格
        </ElButton>

        <!-- 复合单位设置 -->
        <ElDivider content-position="left">复合单位设置</ElDivider>
        <div
          v-for="(conv, index) in formData.unitConversions"
          :key="index"
          class="flex items-center mb-2"
        >
          <span class="text-sm mr-2">1</span>
          <ElSelect v-model="conv.to_unit" placeholder="大单位" style="width: 100px">
            <ElOption v-for="u in unitList" :key="u.id" :label="u.name" :value="u.name" />
          </ElSelect>
          <span class="text-sm mx-2">=</span>
          <ElInputNumber v-model="conv.conversion_rate" :min="1" style="width: 100px" />
          <span class="text-sm mx-2">{{ formData.unit }}</span>
          <ElInputNumber
            v-model="conv.price"
            :min="0"
            :precision="2"
            placeholder="换算价格"
            style="width: 150px; margin-left: 10px"
          />
          <ElButton type="danger" link @click="removeConversion(index)" class="ml-2">
            <ArtSvgIcon icon="ri:delete-bin-line" />
          </ElButton>
        </div>
        <ElButton type="primary" link @click="addConversion">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加换算单位
        </ElButton>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetProductList,
    fetchAddProduct,
    fetchUpdateProduct,
    fetchDeleteProduct,
    getAllCategories,
    fetchGetWarehouseList,
    fetchGetUnitList
  } from '@/api/inventory'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'

  defineOptions({ name: 'ProductList' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增商品')
  const formRef = ref<FormInstance>()
  const allCategories = ref<any[]>([])
  const allWarehouses = ref<any[]>([])
  const unitList = ref<any[]>([])
  const selectedRows = ref<any[]>([])

  const searchForm = reactive({
    name: '',
    code: '',
    categoryId: undefined as number | undefined,
    warehouseId: undefined as number | undefined,
    status: undefined as string | undefined
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const tableData = ref<any[]>([])

  interface PriceItem {
    price_name: string
    price: number
    is_default?: number
  }

  interface ConversionItem {
    from_unit: string
    to_unit: string
    conversion_rate: number
    price: number
  }

  const formData = reactive({
    id: undefined as number | undefined,
    code: '',
    name: '',
    categoryId: undefined as number | undefined,
    warehouseId: undefined as number | undefined,
    unit: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    description: '',
    status: '1',
    prices: [] as PriceItem[],
    unitConversions: [] as ConversionItem[]
  })

  const formRules: FormRules = {
    code: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
    warehouseId: [{ required: true, message: '请选择所在仓库', trigger: 'change' }],
    unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
    price: [{ required: true, message: '请输入零售价', trigger: 'blur' }],
    cost: [{ required: true, message: '请输入成本价', trigger: 'blur' }]
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

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.name = ''
    searchForm.code = ''
    searchForm.categoryId = undefined
    searchForm.warehouseId = undefined
    searchForm.status = undefined
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

  const addPrice = () => {
    formData.prices.push({ price_name: '', price: 0 })
  }

  const removePrice = (index: number) => {
    formData.prices.splice(index, 1)
  }

  const addConversion = () => {
    formData.unitConversions.push({
      from_unit: formData.unit,
      to_unit: '',
      conversion_rate: 1,
      price: 0
    })
  }

  const removeConversion = (index: number) => {
    formData.unitConversions.splice(index, 1)
  }

  const handleAdd = () => {
    dialogTitle.value = '新增商品'
    Object.assign(formData, {
      id: undefined,
      code: '',
      name: '',
      categoryId: undefined,
      warehouseId: undefined,
      unit: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      description: '',
      status: '1',
      prices: [{ price_name: '零售价', price: 0, is_default: 1 }],
      unitConversions: []
    })
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    dialogTitle.value = '编辑商品'
    Object.assign(formData, {
      ...row,
      prices: row.prices || [{ price_name: '零售价', price: row.price, is_default: 1 }],
      unitConversions: row.unitConversions || []
    })
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteProduct(id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    } finally {
      loadData()
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        // 确保第一个价格为默认价格
        if (formData.prices.length > 0) {
          formData.prices[0].is_default = 1
        }

        if (formData.id) {
          await fetchUpdateProduct(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddProduct(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
        loadData()
      }
    })
  }

  // 选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个商品吗？`,
        '批量删除确认',
        { type: 'warning' }
      )

      loading.value = true
      for (const row of selectedRows.value) {
        await fetchDeleteProduct(row.id)
      }
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个商品`)
      selectedRows.value = []
      loadData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 批量导出
  const handleBatchExport = () => {
    const exportData = selectedRows.value.map((item, index) => ({
      序号: index + 1,
      商品编码: item.code,
      商品名称: item.name,
      分类: item.categoryName,
      仓库: item.warehouseName,
      单位: item.unit,
      零售价: item.price?.toFixed(2),
      成本价: item.cost?.toFixed(2),
      库存: item.stock,
      最低库存: item.minStock,
      状态: item.status === '1' ? '启用' : '禁用'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '商品列表')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `商品列表_${new Date().toLocaleDateString()}.xlsx`
    )
    ElMessage.success('导出成功')
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

  const loadUnits = async () => {
    try {
      unitList.value = await fetchGetUnitList()
    } catch (error) {
      console.error('Failed to load units:', error)
    }
  }

  onMounted(() => {
    loadCategories()
    loadWarehouses()
    loadUnits()
    loadData()
  })
</script>

<style scoped lang="scss">
  .product-list-page {
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

  .mb-1 {
    margin-bottom: 4px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .mx-2 {
    margin-left: 8px;
    margin-right: 8px;
  }

  .mr-2 {
    margin-right: 8px;
  }

  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .mb-2 {
    margin-bottom: 8px;
  }

  .text-sm {
    font-size: 14px;
  }

  .text-xs {
    font-size: 12px;
  }
</style>
