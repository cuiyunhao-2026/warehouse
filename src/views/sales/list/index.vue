<!-- 销售订单列表 -->
<template>
  <div class="sales-list-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="art-search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="订单编号">
          <ElInput v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </ElFormItem>
        <ElFormItem label="客户">
          <ElSelect v-model="searchForm.customerId" placeholder="请选择客户" clearable filterable>
            <ElOption
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="商品分类">
          <ElSelect v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
            <ElOption
              v-for="category in categoryList"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="待处理" value="pending" />
            <ElOption label="已完成" value="completed" />
            <ElOption label="已取消" value="cancelled" />
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
          <ElButton type="primary" @click="handleCreate" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            创建销售单
          </ElButton>
          <ElButton type="success" @click="handleExport" v-auth="'export'">
            <ArtSvgIcon icon="ri:download-line" class="mr-1" />
            导出Excel
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
        <ElTableColumn prop="orderNo" label="订单编号" width="160" />
        <ElTableColumn prop="customerName" label="客户" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="shopName" label="店铺" width="100" />
        <ElTableColumn prop="totalAmount" label="总金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.totalAmount?.toFixed(2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="totalQuantity" label="总数量" width="100" align="center" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="operator" label="制单人" width="100" />
        <ElTableColumn prop="salesperson" label="业务员" width="100" />
        <ElTableColumn prop="createdAt" label="创建时间" width="160" />
        <ElTableColumn label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleView(row)"> 查看 </ElButton>
            <ElButton type="info" link size="small" @click="handlePrint(row)"> 打印 </ElButton>
            <ElButton
              v-if="row.status === 'pending'"
              type="success"
              link
              size="small"
              @click="handleComplete(row)"
            >
              完成
            </ElButton>
            <ElPopconfirm title="确定删除该订单吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small"> 删除 </ElButton>
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

    <!-- 详情弹窗 -->
    <ElDialog v-model="detailVisible" title="销售单详情" width="800px">
      <div id="printArea">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="订单编号">{{ currentOrder?.orderNo }}</ElDescriptionsItem>
          <ElDescriptionsItem label="客户">{{ currentOrder?.customerName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="店铺">{{ currentOrder?.shopName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="getStatusType(currentOrder?.status || '')">
              {{ getStatusText(currentOrder?.status || '') }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="制单人">{{ currentOrder?.operator }}</ElDescriptionsItem>
          <ElDescriptionsItem label="业务员">{{ currentOrder?.salesperson }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间" :span="2">{{
            currentOrder?.createdAt
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备注" :span="2">{{
            currentOrder?.remark || '-'
          }}</ElDescriptionsItem>
        </ElDescriptions>

        <ElDivider content-position="left">销售明细</ElDivider>

        <ElTable :data="currentOrder?.items || []" border size="small">
          <ElTableColumn type="index" label="序号" width="60" />
          <ElTableColumn prop="warehouseName" label="仓库" width="100" />
          <ElTableColumn prop="productName" label="商品名称" min-width="150" />
          <ElTableColumn prop="quantity" label="数量" width="80" align="center" />
          <ElTableColumn prop="unit" label="单位" width="60" align="center" />
          <ElTableColumn prop="price" label="单价" width="100" align="right">
            <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
          </ElTableColumn>
        </ElTable>

        <div class="text-right mt-4">
          <strong>合计金额：¥{{ currentOrder?.totalAmount?.toFixed(2) }}</strong>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetSalesOrderList,
    fetchUpdateSalesOrderStatus,
    fetchDeleteSalesOrder,
    fetchGetAllCustomers,
    getAllCategories
  } from '@/api/inventory'
  import { useRouter } from 'vue-router'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'

  defineOptions({ name: 'SalesList' })

  const router = useRouter()
  const loading = ref(false)
  const detailVisible = ref(false)
  const customerList = ref<any[]>([])
  const categoryList = ref<any[]>([])
  const currentOrder = ref<any>(null)
  const selectedRows = ref<any[]>([])

  const searchForm = reactive({
    orderNo: '',
    customerId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    status: undefined as string | undefined
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const tableData = ref<any[]>([])

  const getStatusType = (status: string): 'warning' | 'success' | 'danger' | 'info' => {
    const map: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger'
    }
    return map[status] || 'info'
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const loadCustomers = async () => {
    try {
      customerList.value = await fetchGetAllCustomers()
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }

  const loadCategories = async () => {
    try {
      categoryList.value = await getAllCategories()
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadData = async () => {
    loading.value = true
    try {
      const result = await fetchGetSalesOrderList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = result.records
      pagination.total = result.total
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.orderNo = ''
    searchForm.customerId = undefined
    searchForm.categoryId = undefined
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

  const handleCreate = () => {
    router.push('/sales/create')
  }

  const handleView = (row: any) => {
    currentOrder.value = row
    detailVisible.value = true
  }

  const handleComplete = async (row: any) => {
    try {
      await fetchUpdateSalesOrderStatus(row.id, 'completed')
      ElMessage.success('订单已完成，已自动出库')
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteSalesOrder(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  // 选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个订单吗？`,
        '批量删除确认',
        { type: 'warning' }
      )

      loading.value = true
      for (const row of selectedRows.value) {
        await fetchDeleteSalesOrder(row.id)
      }
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个订单`)
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

  const handleExport = () => {
    const exportData = tableData.value.map((item, index) => ({
      序号: index + 1,
      订单编号: item.orderNo,
      客户: item.customerName,
      店铺: item.shopName,
      总金额: item.totalAmount?.toFixed(2),
      总数量: item.totalQuantity,
      状态: getStatusText(item.status),
      制单人: item.operator,
      业务员: item.salesperson,
      创建时间: item.createdAt
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '销售订单')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `销售订单_${new Date().toLocaleDateString()}.xlsx`
    )
    ElMessage.success('导出成功')
  }

  const handlePrint = (row: any) => {
    currentOrder.value = row
    detailVisible.value = true
    setTimeout(() => {
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      const items = row.items || []
      const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
      const totalAmount = row.totalAmount || 0

      const now = new Date()
      const printTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      // 构建商品行HTML - 只显示有数据的商品，不留空行
      const itemRows = items.map((item: any) => `
        <tr>
          <td style="text-align:center">${item.warehouseName || ''}</td>
          <td>${item.productName || ''}</td>
          <td style="text-align:center">${item.spec || ''}</td>
          <td style="text-align:center">${item.brand || ''}</td>
          <td style="text-align:center">${item.unit || ''}</td>
          <td style="text-align:center">${item.quantity || 0}</td>
          <td style="text-align:right">${item.price?.toFixed(2) || ''}</td>
          <td style="text-align:right">${item.boxPrice?.toFixed(2) || ''}</td>
          <td style="text-align:right">${item.amount?.toFixed(2) || ''}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>销货单 - ${row.orderNo}</title>
          <style>
            @page { 
              size: 21.5cm 9.5cm; 
              margin: 5mm; 
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: SimSun, 宋体, serif; 
              font-size: 9pt; 
              line-height: 1.4;
              width: 21.5cm;
              padding: 5mm;
            }
            .title {
              text-align: center;
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            .subtitle {
              text-align: center;
              font-size: 8pt;
              margin-bottom: 3mm;
            }
            table.info {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2mm;
              font-size: 8pt;
            }
            table.info td {
              padding: 1mm 2mm;
              white-space: nowrap;
            }
            table.info .label {
              font-weight: bold;
            }
            table.info .value {
              border-bottom: 1px solid #000;
              min-width: 20mm;
              display: inline-block;
            }
            table.detail {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2mm;
              font-size: 8pt;
            }
            table.detail th,
            table.detail td {
              border: 1px solid #000;
              padding: 1mm 2mm;
            }
            table.detail th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
              white-space: nowrap;
            }
            table.detail td {
              white-space: nowrap;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              margin-top: 3mm;
              font-size: 8pt;
            }
            .signature {
              display: flex;
              justify-content: space-between;
              margin-top: 5mm;
            }
            .signature-item {
              flex: 1;
              text-align: center;
            }
            .signature-item .line {
              border-bottom: 1px solid #000;
              height: 8mm;
              margin-bottom: 1mm;
            }
          </style>
        </head>
        <body>
          <div class="title">农安县烟花爆竹销货单（焰火老王店)</div>
          <div class="subtitle">烟花爆竹属特殊商品，售出后如无质量问题，概不退货换货</div>
          
          <table class="info">
            <tr>
              <td><span class="label">客户名称:</span> <span class="value">${row.customerName || ''}</span></td>
              <td><span class="label">单据日期:</span> <span class="value">${row.createdAt?.split(' ')[0] || ''}</span></td>
              <td><span class="label">单据编号</span> <span class="value">${row.orderNo || ''}</span></td>
            </tr>
            <tr>
              <td><span class="label">联系电话:</span> <span class="value">${row.customerPhone || ''}</span></td>
              <td><span class="label">打印时间:</span> <span class="value">${printTime}</span></td>
              <td><span class="label">应收余额:</span> <span class="value"></span></td>
            </tr>
            <tr>
              <td><span class="label">送货地址:</span> <span class="value">${row.deliveryAddress || ''}</span></td>
              <td><span class="label">销售订单号:</span> <span class="value">${row.orderNo || ''}</span></td>
              <td><span class="label">来源单据:</span> <span class="value"></span></td>
            </tr>
            <tr>
              <td colspan="3"><span class="label">备注:</span> <span class="value">${row.remark || ''}</span></td>
            </tr>
          </table>
          
          <table class="detail">
            <thead>
              <tr>
                <th>仓库</th>
                <th>存货名称</th>
                <th>规格</th>
                <th>品牌</th>
                <th>单位</th>
                <th>数量</th>
                <th>单价</th>
                <th>箱价</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" style="text-align:right">小计</td>
                <td style="text-align:center">${totalQuantity}</td>
                <td></td>
                <td></td>
                <td style="text-align:right">${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <div class="signature">
              <div class="signature-item">
                <div class="line"></div>
                <div>制单人: ${row.operator || ''}</div>
              </div>
              <div class="signature-item">
                <div class="line"></div>
                <div>司机签字:</div>
              </div>
              <div class="signature-item">
                <div class="line"></div>
                <div>库管签字:</div>
              </div>
              <div class="signature-item">
                <div class="line"></div>
                <div>客户签字:</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }, 300)
  }

  onMounted(() => {
    loadCustomers()
    loadCategories()
    loadData()
  })
</script>

<style scoped lang="scss">
  .sales-list-page {
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

  .mr-1 {
    margin-right: 4px;
  }

  .text-right {
    text-align: right;
  }

  .mt-4 {
    margin-top: 16px;
  }
</style>
