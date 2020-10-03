<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 分类列表 -->
      <tree-table
        class="treeTable"
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="todo" slot-scope="scope">
          <el-tooltip effect="dark" content="编辑分类" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)"
              >编辑</el-button
            >
          </el-tooltip>
          <el-tooltip effect="dark" content="删除分类" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)"
              >删除</el-button
            >
          </el-tooltip>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类弹窗 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="setAddCateDialogClosed">
      <!-- 添加分类表单区域 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selecedKeys"
            @change="parentCateChanged"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类弹窗 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="setEditCateDialogClosed">
      <!-- 编辑分类表单区域 -->
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      categoriesList: [],
      // 数据总条数
      total: 0,
      //
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          prop: '',
          type: 'template',
          template: 'todo',
          width: '200px'
        }
      ],
      // 添加分类对话框显示隐藏标识
      addDialogVisible: false,
      // 添加分类表单参数
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类表单验证配置
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称的长度在2-10个字符之间', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      selecedKeys: [],

      // 编辑分类对话框显示隐藏标识
      editDialogVisible: false,
      // 编辑分类表单参数
      editCateForm: {
        cat_id: 0,
        cat_name: ''
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称的长度在2-10个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoriesList()
  },
  methods: {
    /**
     * 获取商品列表
     */
    async getCategoriesList() {
      const { data: result } = await this.$http.get('categories', { params: this.queryInfo })

      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.total = result.data.total
      this.categoriesList = result.data.result
    },

    /**
     * 监听pagesize改变事件
     */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoriesList()
    },

    /**
     * 监听pagenum改变事件
     */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoriesList()
    },

    /**
     * 点击添加分类展示对话框
     */
    showAddCateDialog() {
      // 获取父级分类列表
      this.getParentCateList()
      // 展示对话框
      this.addDialogVisible = true
    },

    /**
     * 获取父级分类的数据列表
     */
    async getParentCateList() {
      const { data: result } = await this.$http.get('categories', { params: { type: 2 } })
      if (result.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }

      this.parentCateList = result.data
    },

    /**
     * 级联选择器中选择项发生变化的监听函数
     */
    parentCateChanged() {
      // 如果selecedKeys长度大于0，证明选中了父级分类
      if (this.selecedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selecedKeys[this.selecedKeys.length - 1]
        this.addCateForm.cat_level = this.selecedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    /**
     * 添加分类函数
     */
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加分类的信息验证失败')
        }
        const { data: result } = await this.$http.post('categories', this.addCateForm)

        if (result.meta.status != 201) {
          return this.$message.error('添加分类失败')
        }

        this.$message.success('添加分类成功')
        this.getCategoriesList()
        this.addDialogVisible = false
      })
    },

    /**
     * 展示编辑分类对话框并获取当前数据
     */
    async showEditDialog(cat_id) {
      const { data: result } = await this.$http.get('categories/' + cat_id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }

      this.editCateForm.cat_id = cat_id
      this.editCateForm.cat_name = result.data.cat_name
      this.editDialogVisible = true
    },

    /**
     * 监听添加分类对话框的关闭事件，重置表单数据
     */
    setAddCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selecedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_name = ''
      this.addCateForm.cat_level = 0
    },

    /**
     * 编辑分类函数
     */
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('编辑分类的信息验证失败')
        }
        const { data: result } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })

        if (result.meta.status !== 200) {
          return this.$message.error('更新分类信息失败')
        }

        this.$message.success('更新分类信息成功')
        this.getCategoriesList()
        this.editDialogVisible = false
      })
    },

    /**
     * 监听编辑分类对话框的关闭事件，重置表单数据
     */
    setEditCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_id = 0
      this.editCateForm.cat_name = ''
    },

    /**
     * 根据类型id删除类型
     */
    async removeCateById(cat_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: result } = await this.$http.delete('categories/' + cat_id)

        if (result.meta.status !== 200) {
          return this.$message.error('删除类型失败')
        }

        this.$message.success('删除类型成功')
        this.getCategoriesList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.treeTable {
  margin-top: 12px;
}
.el-cascader {
  width: 100%;
}
</style>
