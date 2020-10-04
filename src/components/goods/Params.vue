<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"> </el-alert>

      <!-- 选中商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="goodsCateChanged"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数页 -->
        <el-tab-pane label="动态参数" name="dynamic">
          <!-- 添加参数按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="dynamicTableData" border stripe>
            <el-table-column type="expand">
              <!-- 作用域插槽接收数据 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleValueClose(i, scope.row)"
                >
                  {{ val }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="cateParamNewValueRef"
                  size="small"
                  @keyup.enter.native="handleNewValueInputConfirm(scope.row)"
                  @blur="handleNewValueInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showNewValueInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽接收数据 -->
              <template slot-scope="scope">
                <el-tooltip effect="dark" content="修改参数" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)"
                    >修改</el-button
                  >
                </el-tooltip>
                <el-tooltip effect="dark" content="删除参数" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeAttrById(scope.row.attr_id)"
                    >删除</el-button
                  >
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性页 -->
        <el-tab-pane label="静态属性" name="static">
          <!-- 添加属性按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="staticTableData" border stripe>
            <el-table-column type="expand">
              <!-- 作用域插槽接收数据 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleValueClose(i, scope.row)"
                >
                  {{ val }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="cateParamNewValueRef"
                  size="small"
                  @keyup.enter.native="handleNewValueInputConfirm(scope.row)"
                  @blur="handleNewValueInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showNewValueInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽接收数据 -->
              <template slot-scope="scope">
                <el-tooltip effect="dark" content="修改属性" placement="top" :enterable="false">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)"
                    >修改</el-button
                  >
                </el-tooltip>
                <el-tooltip effect="dark" content="删除属性" placement="top" :enterable="false">
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeAttrById(scope.row.attr_id)"
                    >删除</el-button
                  >
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性对话框 -->
    <el-dialog :title="'添加' + dialogLabel" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
        <el-form-item :label="dialogLabel" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑动态参数/静态属性对话框 -->
    <el-dialog :title="'修改' + dialogLabel" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
        <el-form-item :label="dialogLabel" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品类型列表
      cateList: [],
      // 商品类型级联选择框配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品分类级联选择框选中的cat_id
      selectedCateKeys: [],
      // tab页签选择的页名
      activeName: 'dynamic',
      // 商品分类动态参数数据
      dynamicTableData: [],
      // 商品分类静态属性数据
      staticTableData: [],
      // 添加参数的对话框显示和隐藏配置
      addDialogVisible: false,
      // 添加参数的表单对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 100, message: '参数名称长度在2-100个字符之间', trigger: 'blur' }
        ]
      },
      // 修改参数的对话框显示和隐藏配置
      editDialogVisible: false,
      // 修改参数的表单对象
      editForm: {},
      // 修改参数的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 2, max: 100, message: '参数名称长度在2-100个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /**
     * 获取类型列表
     */
    async getCateList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }

      this.cateList = result.data
    },

    /**
     * 商品分类变更的监听事件
     */
    goodsCateChanged() {
      this.getCateParams()
    },

    /**
     * tab页签点击页签名称监听事件
     */
    handleTabClick() {
      this.getCateParams()
    },

    /**
     * 获取类型的参数
     */
    async getCateParams() {
      if (this.selectedCateKeys.length != 3) {
        this.selectedCateKeys = []
        this.dynamicTableData = []
        this.staticTableData = []
        return
      }

      // 根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.cateSel }
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取类型参数失败')
      }

      result.data.forEach(item => {
        // 将字符标签从string转为数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中的输入值
        item.inputValue = ''
      })

      if (this.activeName === 'dynamic') {
        this.dynamicTableData = result.data
      } else if (this.activeName === 'static') {
        this.staticTableData = result.data
      }
    },

    /**
     * 监听添加参数对话框的关闭事件
     */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    /**
     * 点击确定按钮，添加参数
     */
    addCateParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加类型参数前验证失败')
        }

        const { data: result } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.cateSel
        })
        if (result.meta.status !== 201) {
          return this.$message.error('添加类型参数失败')
        }

        this.$message.success('添加类型参数成功')
        this.getCateParams()
        this.addDialogVisible = false
      })
    },

    /**
     * 点击修改按钮展示编辑对话框
     */
    async showEditDialog(attr_id) {
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: { attr_sel: this.cateSel }
      })
      if (result.meta.status !== 200) {
        return this.$message.error(`获取需要修改${this.dialogLabel}失败`)
      }

      this.editForm = result.data
      this.editDialogVisible = true
    },

    /**
     * 监听修改对话框的关闭事件
     */
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    /**
     * 点击确定按钮，修改参数
     */
    editCateParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error(`修改${this.dialogLabel}提交前验证失败`)
        }

        const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.cateSel
        })
        if (result.meta.status !== 200) {
          return this.$message.error(`修改${this.dialogLabel}失败`)
        }

        this.$message.success(`修改${this.dialogLabel}成功`)
        this.getCateParams()
        this.editDialogVisible = false
      })
    },

    /**
     * 根据id删除参数
     */
    async removeAttrById(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: result } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error(`删除${this.dialogLabel}失败`)
        }

        this.$message.success(`删除${this.dialogLabel}成功`)
        this.getCateParams()
      }
    },

    /**
     * 将对attr_vals的操作保存到数据库
     */
    async saveAttrValues(cateParam) {
      const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${cateParam.attr_id}`, {
        attr_name: cateParam.attr_name,
        attr_sel: cateParam.attr_sel,
        attr_vals: cateParam.attr_vals.join(' ')
      })
      if (result.meta.status !== 200) {
        return this.$message.error('修改类型参数标签失败')
      }

      this.$message.success('修改类型参数标签成功')
    },
    /**
     * 参数val标签删除按钮监听事件
     */
    handleValueClose(index, cateParam) {
      cateParam.attr_vals.splice(index, 1)

      this.saveAttrValues(cateParam)
    },

    /**
     * 参数val添加标签监听事件
     */
    handleNewValueInputConfirm(cateParam) {
      if (!cateParam.inputValue.split(' ').join('')) {
        cateParam.inputValue = ''
        return (cateParam.inputVisible = false)
      }

      cateParam.attr_vals.push(cateParam.inputValue.trim())
      cateParam.inputValue = ''
      cateParam.inputVisible = false

      this.saveAttrValues(cateParam)
    },

    /**
     * 展示新增参数标签的输入框
     */
    showNewValueInput(cateParam) {
      cateParam.inputVisible = true

      // $nextTick：当页面上元素被重新渲染后才会执行回调函数中的代码
      this.$nextTick(() => {
        // 文本框获得焦点
        this.$refs.cateParamNewValueRef.$refs.input.focus()
      })
    }
  },
  computed: {
    // 如果按钮需要被禁用，返回true
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }

      return null
    },
    // 需要获取动态参数还是静态属性
    cateSel() {
      if (this.activeName === 'dynamic') {
        return 'many'
      } else if (this.activeName === 'static') {
        return 'only'
      }

      return null
    },
    /**
     * 根据当前标签页获取添加参数/属性弹窗的展示title
     */
    dialogLabel() {
      if (this.activeName === 'dynamic') {
        return '动态参数'
      } else if (this.activeName === 'static') {
        return '静态属性'
      }

      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin: 5px 10px 5px 0;
}
.el-input {
  width: 120px;
}
</style>
