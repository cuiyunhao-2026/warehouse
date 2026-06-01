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
    fetchGetAllCustomers
  } from '@/api/inventory'
  import { useRouter } from 'vue-router'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'

  defineOptions({ name: 'SalesList' })

  const router = useRouter()
  const loading = ref(false)
  const detailVisible = ref(false)
  const customerList = ref<any[]>([])
  const currentOrder = ref<any>(null)
  const selectedRows = ref<any[]>([])

  const searchForm = reactive({
    orderNo: '',
    customerId: undefined as number | undefined,
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

      const amountToChinese = (amount: number): string => {
        const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
        const units = ['', '拾', '佰', '仟']
        const bigUnits = ['', '万', '亿']

        const intPart = Math.floor(amount)
        const decPart = Math.round((amount - intPart) * 100)

        let result = ''
        let num = intPart
        let unitIndex = 0

        while (num > 0) {
          const digit = num % 10
          if (digit > 0) {
            result =
              digits[digit] + units[unitIndex % 4] + bigUnits[Math.floor(unitIndex / 4)] + result
          }
          num = Math.floor(num / 10)
          unitIndex++
        }

        result += '元'

        if (decPart > 0) {
          const jiao = Math.floor(decPart / 10)
          const fen = decPart % 10
          if (jiao > 0) result += digits[jiao] + '角'
          if (fen > 0) result += digits[fen] + '分'
        } else {
          result += '整'
        }

        return result
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>销售单 - ${row.orderNo}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: SimSun, serif; font-size: 12px; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { font-size: 18px; margin: 0; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; font-size: 11px; }
            th { background-color: #f0f0f0; text-align: center; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 20px; }
            .note { margin-top: 15px; border: 1px solid #000; padding: 8px; font-size: 11px; }
            .remark { margin-top: 10px; }
            .page-info { text-align: right; margin-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>销 售 单</h2>
          </div>
          
          <div class="info-row">
            <span>客户：${row.customerName || '________________'}</span>
            <span>单据日期：${row.createdAt?.split(' ')[0] || '________________'}</span>
          </div>
          <div class="info-row">
            <span>单据编号：${row.orderNo || '________________'}</span>
            <span>店铺：${row.shopName || '________________'}</span>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width:40px">编号</th>
                <th style="width:80px">仓库名称</th>
                <th>商品名称</th>
                <th style="width:50px">数量</th>
                <th style="width:40px">单位</th>
                <th style="width:80px">单价</th>
                <th style="width:100px">金额</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item: any, index: number) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.warehouseName || ''}</td>
                  <td>${item.productName || ''}</td>
                  <td class="text-center">${item.quantity || 0}</td>
                  <td class="text-center">${item.unit || ''}</td>
                  <td class="text-right">${item.price?.toFixed(2) || '0.00'}</td>
                  <td class="text-right">${item.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              `
                )
                .join('')}
              ${
                items.length < 10
                  ? Array(10 - items.length)
                      .fill(
                        '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
                      )
                      .join('')
                  : ''
              }
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" class="text-right">小计：</td>
                <td class="text-center">${totalQuantity}</td>
                <td></td>
                <td></td>
                <td class="text-right">¥${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="info-row total-row">
            <span>合计：人民币 ${amountToChinese(totalAmount)}</span>
            <span>件数：${totalQuantity}件</span>
          </div>
          
          <div class="footer">
            <div class="info-row">
              <span>制单人：${row.operator || '（填写）'}</span>
              <span>业务员：${row.salesperson || '（账号名）'}</span>
              <span>联系电话：0434-76787333 1564343300</span>
            </div>
          </div>
          
          <div class="note">
            <strong>注意：</strong>惊爆价、特价、儿童产品、二次封箱、外箱破损、写字、不退不换！
          </div>
          
          <div class="remark">
            备注：${row.remark || '（填写）'}
          </div>
          
          <div class="page-info">
            第（1）页/共（1）页
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
