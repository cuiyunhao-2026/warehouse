<!-- 创建销售单 -->
<template>
  <div class="sales-create-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>创建销售单</span>
          <ElButton @click="router.back()">返回列表</ElButton>
        </div>
      </template>

      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElRow :gutter="20">
          <ElCol :span="8">
            <ElFormItem label="选择客户" prop="customerId">
              <ElSelect
                v-model="formData.customerId"
                placeholder="请选择客户"
                filterable
                style="width: 100%"
              >
                <ElOption
                  v-for="customer in customerList"
                  :key="customer.id"
                  :label="customer.name"
                  :value="customer.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="选择店铺" prop="shopId">
              <ElSelect v-model="formData.shopId" placeholder="请选择店铺" style="width: 100%">
                <ElOption
                  v-for="shop in shopList"
                  :key="shop.id"
                  :label="shop.name"
                  :value="shop.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="业务员">
              <ElInput v-model="formData.salesperson" placeholder="请输入业务员" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="备注">
          <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </ElFormItem>

        <ElDivider content-position="left">销售明细</ElDivider>

        <div class="items-container">
          <div v-for="(item, index) in formData.items" :key="index" class="item-row">
            <ElRow :gutter="12">
              <ElCol :span="5">
                <ElFormItem
                  :prop="`items.${index}.productId`"
                  :rules="{ required: true, message: '请选择商品', trigger: 'change' }"
                >
                  <ElSelect
                    v-model="item.productId"
                    placeholder="请选择商品"
                    filterable
                    style="width: 100%"
                    @change="(val: number) => handleProductChange(val, index)"
                  >
                    <ElOption
                      v-for="product in productList"
                      :key="product.id"
                      :label="`${product.name} (${product.code}) 库存:${product.stock}`"
                      :value="product.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="3">
                <ElFormItem :prop="`items.${index}.warehouseId`">
                  <ElSelect v-model="item.warehouseId" placeholder="仓库" style="width: 100%">
                    <ElOption
                      v-for="warehouse in warehouseList"
                      :key="warehouse.id"
                      :label="warehouse.name"
                      :value="warehouse.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="3">
                <ElFormItem :prop="`items.${index}.unit`">
                  <ElSelect
                    v-model="item.unit"
                    placeholder="单位"
                    style="width: 100%"
                    @change="(val: string) => handleUnitChange(val, index)"
                  >
                    <ElOption :label="item.baseUnit" :value="item.baseUnit" />
                    <ElOption
                      v-for="conv in item.conversions"
                      :key="conv.to_unit"
                      :label="conv.to_unit"
                      :value="conv.to_unit"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="3">
                <ElFormItem
                  :prop="`items.${index}.quantity`"
                  :rules="{ required: true, message: '数量', trigger: 'blur' }"
                >
                  <ElInputNumber
                    v-model="item.quantity"
                    :min="1"
                    placeholder="数量"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="3">
                <ElFormItem :prop="`items.${index}.priceName`">
                  <ElSelect
                    v-model="item.priceName"
                    placeholder="价格"
                    style="width: 100%"
                    @change="(val: string) => handlePriceChange(val, index)"
                  >
                    <ElOption
                      v-for="p in item.prices"
                      :key="p.price_name"
                      :label="p.price_name"
                      :value="p.price_name"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="3">
                <ElFormItem
                  :prop="`items.${index}.price`"
                  :rules="{ required: true, message: '单价', trigger: 'blur' }"
                >
                  <ElInputNumber
                    v-model="item.price"
                    :min="0"
                    :precision="2"
                    placeholder="单价"
                    style="width: 100%"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="2">
                <div class="item-amount">¥{{ (item.quantity * item.price).toFixed(2) }}</div>
              </ElCol>
              <ElCol :span="2">
                <ElButton
                  type="danger"
                  @click="handleRemoveItem(index)"
                  :disabled="formData.items.length <= 1"
                >
                  删除
                </ElButton>
              </ElCol>
            </ElRow>
          </div>
        </div>

        <ElButton type="primary" plain @click="handleAddItem" class="add-item-btn">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加商品
        </ElButton>

        <ElDivider />

        <div class="total-info">
          <div class="total-quantity">
            合计数量：<span>{{ totalQuantity }}</span>
          </div>
          <div class="total-amount">
            合计金额：<span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">
            提交销售单
          </ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetAllCustomers,
    fetchGetAllProducts,
    fetchGetWarehouseList,
    fetchGetAllShops,
    fetchGetProductPrices,
    fetchGetProductConversions,
    fetchAddSalesOrder
  } from '@/api/inventory'
  import { useUserStore } from '@/store/modules/user'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'SalesCreate' })

  const router = useRouter()
  const userStore = useUserStore()
  const submitLoading = ref(false)
  const formRef = ref<FormInstance>()
  const customerList = ref<any[]>([])
  const productList = ref<any[]>([])
  const warehouseList = ref<any[]>([])
  const shopList = ref<any[]>([])

  interface OrderItem {
    productId: number | undefined
    warehouseId: number | undefined
    baseUnit: string
    unit: string
    quantity: number
    priceName: string
    price: number
    amount: number
    prices: any[]
    conversions: any[]
  }

  const formData = reactive({
    customerId: undefined as number | undefined,
    shopId: userStore.getUserInfo?.shopId || (undefined as number | undefined),
    salesperson: userStore.getUserInfo?.userName || '',
    remark: '',
    items: [
      {
        productId: undefined,
        warehouseId: undefined,
        baseUnit: '',
        unit: '',
        quantity: 1,
        priceName: '零售价',
        price: 0,
        amount: 0,
        prices: [],
        conversions: []
      }
    ] as OrderItem[]
  })

  const formRules: FormRules = {
    customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
    shopId: [{ required: true, message: '请选择店铺', trigger: 'change' }]
  }

  const totalAmount = computed(() => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  })

  const totalQuantity = computed(() => {
    return formData.items.reduce((sum, item) => sum + item.quantity, 0)
  })

  const loadCustomers = async () => {
    try {
      customerList.value = await fetchGetAllCustomers()
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }

  const loadProducts = async () => {
    try {
      productList.value = await fetchGetAllProducts()
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadWarehouses = async () => {
    try {
      warehouseList.value = await fetchGetWarehouseList()
    } catch (error) {
      console.error('Failed to load warehouses:', error)
    }
  }

  const loadShops = async () => {
    try {
      shopList.value = await fetchGetAllShops()
    } catch (error) {
      console.error('Failed to load shops:', error)
    }
  }

  const handleProductChange = async (productId: number, index: number) => {
    const product = productList.value.find((p) => p.id === productId)
    if (product) {
      formData.items[index].baseUnit = product.unit
      formData.items[index].unit = product.unit
      formData.items[index].price = product.price || 0
      formData.items[index].priceName = '零售价'
      formData.items[index].warehouseId = product.warehouseId

      // 获取商品价格列表
      try {
        const prices = await fetchGetProductPrices(productId)
        formData.items[index].prices = [
          { price_name: '零售价', price: product.price || 0 },
          ...prices
        ]
      } catch {
        formData.items[index].prices = [{ price_name: '零售价', price: product.price || 0 }]
      }

      // 获取商品单位换算
      try {
        const conversions = await fetchGetProductConversions(productId)
        formData.items[index].conversions = conversions
      } catch {
        formData.items[index].conversions = []
      }
    }
  }

  const handleUnitChange = (unit: string, index: number) => {
    const item = formData.items[index]
    if (unit === item.baseUnit) {
      const defaultPrice = item.prices.find((p) => p.price_name === item.priceName)
      if (defaultPrice) {
        item.price = defaultPrice.price
      }
    } else {
      const conv = item.conversions.find((c) => c.to_unit === unit)
      if (conv) {
        item.price = conv.price
      }
    }
  }

  const handlePriceChange = (priceName: string, index: number) => {
    const item = formData.items[index]
    const priceItem = item.prices.find((p) => p.price_name === priceName)
    if (priceItem) {
      item.price = priceItem.price
    }
  }

  const handleAddItem = () => {
    formData.items.push({
      productId: undefined,
      warehouseId: undefined,
      baseUnit: '',
      unit: '',
      quantity: 1,
      priceName: '零售价',
      price: 0,
      amount: 0,
      prices: [],
      conversions: []
    })
  }

  const handleRemoveItem = (index: number) => {
    formData.items.splice(index, 1)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return

      const hasEmptyItem = formData.items.some((item) => !item.productId)
      if (hasEmptyItem) {
        ElMessage.warning('请选择商品')
        return
      }

      submitLoading.value = true
      try {
        await fetchAddSalesOrder({
          customerId: formData.customerId,
          shopId: formData.shopId,
          salesperson: formData.salesperson,
          operator: userStore.getUserInfo?.userName || '',
          remark: formData.remark,
          items: formData.items.map((item) => ({
            productId: item.productId!,
            warehouseId: item.warehouseId,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            amount: item.quantity * item.price
          }))
        })
        ElMessage.success('销售单创建成功')
        router.push('/sales/list')
      } catch (error) {
        ElMessage.error('创建失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  const handleReset = () => {
    formData.customerId = undefined
    formData.remark = ''
    formData.items = [
      {
        productId: undefined,
        warehouseId: undefined,
        baseUnit: '',
        unit: '',
        quantity: 1,
        priceName: '零售价',
        price: 0,
        amount: 0,
        prices: [],
        conversions: []
      }
    ]
  }

  onMounted(() => {
    loadCustomers()
    loadProducts()
    loadWarehouses()
    loadShops()
  })
</script>

<style scoped lang="scss">
  .sales-create-page {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .items-container {
      .item-row {
        margin-bottom: 16px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 4px;
      }

      .item-amount {
        line-height: 32px;
        font-weight: 600;
        color: #409eff;
      }
    }

    .add-item-btn {
      margin-bottom: 16px;
    }

    .total-info {
      display: flex;
      justify-content: flex-end;
      gap: 30px;
      font-size: 16px;
      margin-bottom: 20px;

      .total-quantity span {
        font-weight: 600;
        color: #409eff;
      }

      .total-amount .amount {
        font-size: 24px;
        font-weight: 600;
        color: #f56c6c;
      }
    }

    .mr-1 {
      margin-right: 4px;
    }
  }
</style>
