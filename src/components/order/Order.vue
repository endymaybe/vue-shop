<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="{path: /home}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @input="getOrderList"
            @blur="getOrderList"
            clearable
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button
          ></el-input>
        </el-col>
      </el-row>

      <!-- 列表区 -->
      <el-table :data="orderList" style="width:100%" stripe border>
        <el-table-column type="index" label="#" width="40px"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
        <el-table-column label="是否付款" width="100px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="140px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <!-- 作用域插槽 -->
          <template>
            <el-tooltip effect="dark" content="修改订单" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="物流信息" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showProgressBox('1106975712662')"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 修改订单弹窗 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="handleEditDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="area">
          <el-cascader v-model="editForm.area" :options="cityList" :props="cascaderProp"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address"> <el-input v-model="editForm.address"></el-input> </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息弹窗 -->
    <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 订单查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 订单总量
      total: 0,
      // 修改订单显示和隐藏
      editDialogVisible: false,
      // 修改订单表单
      editForm: {
        area: [],
        address: ''
      },
      // 表单验证规则
      editFormRules: {
        area: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      // 省市区/县数据
      cityList: cityData,
      // 级联选择器配置
      cascaderProp: {
        expandTrigger: 'hover'
      },
      // 物流信息显示和隐藏
      progressDialogVisible: false,
      // 物流信息列表
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    /**
     * 获取订单列表
     */
    async getOrderList() {
      const { data: result } = await this.$http.get('orders', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取订单失败')
      }

      this.orderList = result.data.goods
      this.total = result.data.total
    },

    /**
     * 条数变更监听事件
     */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },

    /**
     * 页数变更监听事件
     */
    handlePageChange(newPage) {
      this.queryInfo.pagenum = newPage
      console.log(newPage)
      this.getOrderList()
    },

    /**
     * 展示修改订单的对话框
     */
    showBox() {
      this.editDialogVisible = true
    },

    /**
     * 编辑订单对话框关闭事件
     */
    handleEditDialogClose() {
      this.$refs.editFormRef.resetFields()
    },

    /**
     * 物流信息对话框关闭事件
     */
    async showProgressBox(id) {
      const { data: result } = await this.$http.get('/kuaidi/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }

      this.progressInfo = result.data
      this.progressDialogVisible = true
    }
  },
  computed: {}
}
</script>

<style lang="scss" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-cascader {
  width: 100%;
}
</style>
