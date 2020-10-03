<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>

      <el-table :data="rolesList" stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- <el-table :data="scope.row.children" stripe>
              <el-table-column type="index" label="#"> </el-table-column>
            </el-table> -->
            <el-row
              :class="[i1 === 0 ? 'bd-top' : '', 'bd-bottom', 'v-center']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)"> {{ item1.authName }} </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bd-top', 'v-center']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      type="warning"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>

        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"
                >编辑</el-button
              >
            </el-tooltip>
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)"
                >删除</el-button
              >
            </el-tooltip>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)"
                >分配权限</el-button
              >
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- add role dialog -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- edit role dialog -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      // 添加角色表单项
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户表单的用户规则项
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3-10个字符之间', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      // 添加角色表单项
      editForm: {},
      // 添加用户表单的用户规则项
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3-10个字符之间', trigger: 'blur' }
        ]
      },
      setRightDialogVisible: false,
      rightslist: {},
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    /**
     * 获取角色列表
     */
    async getRolesList() {
      const { data: result } = await this.$http.get('roles')

      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.rolesList = result.data
    },

    /**
     * 根据id删除角色
     */
    async removeRoleById(roleId) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: result } = await this.$http.delete('roles/' + roleId)
        if (result.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }

        this.$message.success('删除用户成功')
        this.getRolesList()
      }
    },

    /**
     * 根据权限id删除权限
     */
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: result } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (result.meta.status === 200) {
          this.$message.success('删除权限成功')

          // 当前角色权限
          role.children = result.data
        } else {
          return this.$message.error('删除权限失败')
        }
      }
    },

    /**
     * 获取需要编辑的角色信息
     */
    async showEditDialog(roleId) {
      const { data: result } = await this.$http.get('roles/' + roleId)
      if (result.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }

      this.editForm = result.data
      this.editDialogVisible = true
    },

    /**
     * 展示分配权限的对话框
     */
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: result } = await this.$http.get('rights/tree')

      if (result.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }

      this.rightslist = result.data
      this.getLeftKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },

    /**
     * 添加角色
     */
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post('roles', this.addForm)

          if (result.meta.status !== 201) {
            return this.$message.error('添加角色失败')
          }

          this.addDialogVisible = false
          this.getRolesList()
        } else {
          return this.$message.error('添加角色失败')
        }
      })
    },

    /**
     * 修改角色
     */
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })

          if (result.meta.status !== 200) {
            return this.$message.error('修改角色失败')
          }

          this.editDialogVisible = false
          this.getRolesList()
        } else {
          return this.$message.error('修改角色失败')
        }
      })
    },

    /**
     * 通过递归形式获取角色下所有三级权限
     */
    getLeftKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeftKeys(item, arr))
    },

    /**
     * 监听分配权限对话框的关闭事件
     */
    setRightDialogClosed() {
      this.defKeys = []
    },

    /**
     * 点击确定按钮为角色分配权限
     */
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]

      const idStr = keys.join(',')
      const { data: result } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (result.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 8px;
}

.bd-top {
  border-top: 1px solid #eeeeee;
}

.bd-bottom {
  border-bottom: 1px solid #eeeeee;
}
</style>
