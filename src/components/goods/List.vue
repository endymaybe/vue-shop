<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 搜索/添加商品区 -->
      <el-row :gutter="20">
        <!-- 搜索输入框 -->
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @input="getGoodsList"
            @clear="getGoodsList"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>

        <!-- 搜索按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <el-table :data="goodsList" style="width:100%" stripe>
        <el-table-column type="index" label="#" width="40px"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改商品" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除商品" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeGoodById(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleCurrentPagesizeChange"
        @current-change="handleCurrentPagenumChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品列表 - 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表 - 列表
      goodsList: [],
      // 商品列表 - 总量
      goodsTotal: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    /**
     * 获取商品列表
     */
    async getGoodsList() {
      const { data: result } = await this.$http.get('goods', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      this.goodsTotal = result.data.total
      this.goodsList = result.data.goods
    },

    /**
     * 监听事件：每页显示数量变更
     */
    handleCurrentPagesizeChange(newSize) {
      this.queryInfo.pagenum = 1
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    /**
     * 监听事件：页数变更
     */
    handleCurrentPagenumChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    /**
     * 跳转到添加商品页面
     */
    goAddPage() {
      this.$router.push({ path: '/goods/add' })
    },

    /**
     * 删除商品
     */
    async removeGoodById(goodId) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: result } = await this.$http.delete('goods/' + goodId)
      if (result.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }

      this.$message.success('删除商品成功')
      this.getGoodsList()
    }
  }
}
</script>

<style lang="scss" scoped></style>
