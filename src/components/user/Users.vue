<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card -->
    <el-card>
      <!-- search and add -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @input="getUserList" @clear="getUserList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- user list -->
      <el-table :data="userList" style="width: 100%" :stripe="true">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180px"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="setUserInfo(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- page size -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- add user dialog -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="resetAddDialogForm">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- edit user dialog -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="resetEditDialogForm">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    /**
     * 验证邮箱
     */
    let checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法邮箱'))
      }
    }
    /**
     * 验证手机
     */
    let checkMobile = (rule, value, cb) => {
      // 验证手机的正则表达式
      const regEmail = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法手机'))
      }
    }

    return {
      // 获取用户信息的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 用户列表
      userList: [],
      // 用户总数
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 添加用户表单项
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单项
      editForm: {},
      // 添加用户表单的用户规则项
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在6-15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户表单的用户规则项
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    /**
     * get user list by ajax
     */
    async getUserList() {
      const { data: result } = await this.$http.get('users', { params: this.queryInfo })

      if (result.meta.status === 200) {
        this.userList = result.data.users
        this.total = result.data.total
      } else {
        return this.$message.error('获取用户列表失败')
      }
    },

    /**
     * set user info by ajax
     */
    async setUserInfo(userinfo) {
      const { data: result } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)

      if (result.meta.status === 200) {
        this.$message.success('设置用户状态成功')
      } else {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('设置用户状态失败')
      }
    },

    /**
     * listen size value change event
     */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    /**
     * listen page value change event
     */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    /**
     * listen add user dialog closed event
     */
    resetAddDialogForm() {
      this.$refs.addFormRef.resetFields()
    },

    /**
     * click button add user
     */
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post('users', this.addForm)
          console.log(result)

          if (result.meta.status === 201) {
            this.$message.success('添加用户成功')

            // 隐藏弹窗
            this.addDialogVisible = false
            // 更新用户列表
            this.getUserList()
          } else {
            return this.$message.error('添加用户失败')
          }
        } else {
          return this.$message.error('添加用户失败-接口访问失败')
        }
      })
    },

    /**
     * click button get user info and show edit dialog
     */
    async showEditDialog(id) {
      const { data: result } = await this.$http.get('users/' + id)

      if (result.meta.status === 200) {
        this.editForm = result.data
        this.editDialogVisible = true
      } else {
        return this.$message.error('查询用户信息失败')
      }
    },

    /**
     * listen edit user info dialog closed event
     */
    resetEditDialogForm() {
      this.$refs.editFormRef.resetFields()
    },

    /**
     * click button edit user
     */
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })

          if (result.meta.status === 200) {
            this.$message.success('编辑用户成功')

            // 隐藏弹窗
            this.editDialogVisible = false
            // 更新用户列表
            this.getUserList()
          } else {
            this.$message.error('编辑用户失败')
          }
        } else {
          return this.$message.error('编辑用户失败-接口访问失败')
        }
      })
    },

    /**
     * click button and remove user by id
     */
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: result } = await this.$http.delete('users/' + id)
        if (result.meta.status === 200) {
          this.$message.success('删除用户成功')

          // 更新用户列表
          this.getUserList()
        } else {
          return this.$message.error('删除用户失败')
        }
      }
    }
  }
}
</script>

<style lang="sass" scoped></style>>
