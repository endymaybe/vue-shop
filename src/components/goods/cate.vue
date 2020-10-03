<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加分类</el-button>

      <!-- 分类列表 -->
      <tree-table class="treeTable" :data="categoriesList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
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
        <template slot="todo">
          <el-tooltip effect="dark" content="编辑分类" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除分类" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
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
        pagesize: 10
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
      addDialogVisible: false
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

      console.log(result)

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
    }
  }
}
</script>

<style lang="scss" scoped>
.treeTable {
  margin-top: 12px;
}
</style>
