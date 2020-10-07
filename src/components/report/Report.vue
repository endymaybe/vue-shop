<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="{path: /home}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 导入echarts
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并的对象
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  /**
   * 当组件被创建后执行的钩子函数
   */
  created() {},
  /**
   * 当页面上的DOM元素被渲染完毕后执行的钩子函数
   */
  async mounted() {
    // 初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    const { data: result } = await this.$http.get('reports/type/1')
    if (result.meta.status !== 200) {
      return this.$message('获取报表数据失败')
    }

    const resOps = _.merge(result.data, this.options)

    // 展示数据
    myChart.setOption(resOps)
  },
  methods: {}
}
</script>

<style lang="scss" scoped></style>
