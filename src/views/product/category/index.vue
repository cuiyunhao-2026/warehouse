<!-- 分类管理 -->
<template>
  <div class="category-page art-full-height">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <ElButton type="primary" @click="handleAdd()" v-auth="'add'">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增分类
          </ElButton>
        </div>
      </template>

      <ElTable :data="categoryList" v-loading="loading" row-key="id" border default-expand-all>
        <ElTableColumn prop="name" label="分类名称" min-width="200" />
        <ElTableColumn prop="sort" label="排序" width="80" align="center" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" size="small">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200">
          <template #default="{ row }">
            <ElButton type="primary" link size="small" @click="handleAdd(row)" v-auth="'add'">
              添加子分类
            </ElButton>
            <ElButton type="primary" link size="small" @click="handleEdit(row)" v-auth="'edit'">
              编辑
            </ElButton>
            <ElPopconfirm title="确定删除该分类吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <ElButton type="danger" link size="small" v-auth="'delete'"> 删除 </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <ElFormItem label="上级分类">
          <ElTreeSelect
            v-model="formData.parentId"
            :data="categoryTreeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级分类（不选则为顶级分类）"
            clearable
            check-strictly
          />
        </ElFormItem>
        <ElFormItem label="分类名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入分类名称" />
        </ElFormItem>
        <ElFormItem label="排序" prop="sort">
          <ElInputNumber v-model="formData.sort" :min="0" :max="999" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="formData.status">
            <ElRadio value="1">启用</ElRadio>
            <ElRadio value="2">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetCategoryList,
    fetchAddCategory,
    fetchUpdateCategory,
    fetchDeleteCategory
  } from '@/api/inventory'

  defineOptions({ name: 'ProductCategory' })

  const loading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增分类')
  const formRef = ref<FormInstance>()
  const categoryList = ref<Api.Inventory.Category[]>([])

  const categoryTreeData = computed(() => {
    return [{ id: 0, name: '顶级分类', children: categoryList.value }]
  })

  const formData = reactive<Partial<Api.Inventory.Category>>({
    id: undefined,
    name: '',
    parentId: null,
    sort: 0,
    status: '1'
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  }

  const loadData = async () => {
    loading.value = true
    try {
      categoryList.value = await fetchGetCategoryList()
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      loading.value = false
    }
  }

  const handleAdd = (parent?: Api.Inventory.Category) => {
    dialogTitle.value = parent ? '新增子分类' : '新增分类'
    Object.assign(formData, {
      id: undefined,
      name: '',
      parentId: parent?.id || null,
      sort: 0,
      status: '1'
    })
    dialogVisible.value = true
  }

  const handleEdit = (row: Api.Inventory.Category) => {
    dialogTitle.value = '编辑分类'
    Object.assign(formData, row)
    dialogVisible.value = true
  }

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteCategory(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      submitLoading.value = true
      try {
        if (formData.id) {
          await fetchUpdateCategory(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await fetchAddCategory(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    })
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .category-page {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mr-1 {
      margin-right: 4px;
    }
  }
</style>
