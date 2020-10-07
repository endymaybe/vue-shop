<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center> </el-alert>
      <!-- 步骤条区 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区 -->
      <el-form
        :model="goodAddForm"
        :rules="goodAddFormRules"
        ref="goodAddFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodAddForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodAddForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodAddForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodAddForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cateProps"
                v-model="goodAddForm.goods_cat"
                @change="goodsCateChanged"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTabData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(val, i) in item.attr_vals" :key="i" :label="val" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="goodAddForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览区 -->
    <el-dialog title="预览图片" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt="" style="width:100%" />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash工具库 - 这里需要用到深拷贝
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条和tab栏的下标
      activeIndex: '0',
      // 基本信息：添加商品 - 添加对象
      goodAddForm: {
        goods_name: '', // 商品名称
        goods_price: 0, // 商品价格
        goods_number: 0, // 商品数量
        goods_weight: 0, // 商品重量
        goods_cat: [], // 商品分类
        goods_introduce: '', // 商品描述
        pics: [], // 商品图片
        attrs: []
      },
      // 基本信息：添加商品 - 表单验证规则
      goodAddFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 基本信息：类型列表
      cateList: [],
      // 基本信息：商品类型级联选择框配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数：动态参数列表数据
      manyTabData: [],
      // 商品属性：静态属性列表数据
      onlyTabData: [],
      // 商品图片：上传图片的URL地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 商品图片：图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 商品图片：预览图片地址
      previewPath: '',
      // 商品图片：预览图片显示和隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /**
     * 点击标签页的标签项离开前监听事件
     */
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.goodAddForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },

    /**
     * 点击标签页的标签项监听事件
     */
    async tabClicked() {
      // 访问动态参数面板
      if (this.activeIndex === '1') {
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取商品动态参数失败')
        }

        result.data.forEach(item => {
          // 将字符标签从string转为数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTabData = result.data
      } else if (this.activeIndex === '2') {
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取商品静态属性失败')
        }

        this.onlyTabData = result.data
      }
    },

    /**
     * 基本信息：获取所商品数据
     */
    async getCateList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类信息失败')
      }

      this.cateList = result.data
    },

    /**
     * 基本信息：商品分类变更的监听事件
     */
    goodsCateChanged() {
      // 只允许选中三级分类
      if (this.goodAddForm.goods_cat.length !== 3) {
        this.goodAddForm.goods_cat = []
      }
    },

    /**
     * 商品图片：处理图片预览事件
     */
    handlePreview(file) {
      const response = file.response

      if (response.meta.status !== 200) {
        return this.$message.error('图片预览失败')
      }

      // 构建上传成功的对象并插入到商品添加的图片参数中
      this.previewPath = response.data.url
      this.previewDialogVisible = true
    },

    /**
     * 商品图片：处理图片删除事件
     */
    handleRemove(file) {
      const response = file.response

      if (response.meta.status !== 200) {
        return this.$message.error('图片移除失败')
      }

      // 构建上传成功的对象并插入到商品添加的图片参数中
      const filePath = response.data.tmp_path
      const index = this.goodAddForm.pics.findIndex(item => item.pic === filePath)
      this.goodAddForm.pics.splice(index, 1)
    },

    /**
     * 商品图片：图片上传成功事件
     */
    handleSuccess(response) {
      if (response.meta.status !== 200) {
        return this.$message.error('图片上传失败')
      }

      // 构建上传成功的对象并插入到商品添加的图片参数中
      const picInfo = { pic: response.data.tmp_path }
      this.goodAddForm.pics.push(picInfo)
    },

    /**
     * 添加商品
     */
    add() {
      this.activeIndex = '5'

      this.$refs.goodAddFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }

        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodAddForm.attrs.push(newInfo)
        })

        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.goodAddForm.attrs.push(newInfo)
        })

        // 深拷贝表单数据
        const form = _.cloneDeep(this.goodAddForm)

        // 处理商品分类
        form.goods_cat = form.goods_cat.join(',')

        const { data: result } = await this.$http.post('goods', form)
        if (result.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 当前选中的三级分类的id
    cateId() {
      if (this.goodAddForm.goods_cat.length === 3) {
        return this.goodAddForm.goods_cat[2]
      }

      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 5px !important;
}
</style>
