<template>
  <div class="login_container">
    <div class="login_box">
      <!-- login icon -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt srcset ondragstart="return false" />
      </div>

      <!-- login form -->
      <el-form ref="loginFormRef" class="login_form" abel-width="0px" :model="loginFormData" :rules="loginFormRules">
        <!-- login form - user -->
        <el-form-item prop="username">
          <el-input class="login_icon" prefix-icon="icon-user" placeholder="please input username" v-model="loginFormData.username"></el-input>
        </el-form-item>

        <!-- login form - passwd -->
        <el-form-item prop="password">
          <el-input class="login_icon" prefix-icon="icon-lock" placeholder="please input password" v-model="loginFormData.password" show-password></el-input>
        </el-form-item>

        <!-- login form - button -->
        <el-form-item class="login_btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // form data
      loginFormData: {
        username: 'admin',
        password: '123456'
      },
      // form rules
      loginFormRules: {
        username: [
          {
            required: true,
            message: 'Please input your user name',
            trigger: 'blur'
          },
          {
            min: 3,
            message: 'Length must bigger or equial 3',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please input your user password',
            trigger: 'blur'
          },
          {
            min: 6,
            message: 'Length must bigger or equial 6',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * login process
     */
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return

        const { data: result } = await this.$http.post('login', this.loginFormData)

        if (!result) {
          return console.log('result is null')
        } else if (result.meta.status !== 200) {
          return this.$message.error('login failed')
        } else {
          this.$message.success('login success')

          // save sessionStorage - token
          window.sessionStorage.setItem('token', result.data.token)

          // jump page to home
          this.$router.push('home')
        }
      })
    },

    /**
     * reset login form: username && password
     */
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  color: #fff;

  .login_box {
    position: absolute;
    width: 450px;
    height: 300px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 3px;

    .avatar_box {
      position: absolute;
      width: 130px;
      height: 130px;
      padding: 10px;
      box-shadow: 0 0 10px #dddddd;
      border-radius: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffffff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }

    .login_form {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 20px;
      box-sizing: border-box;

      .login_icon {
        font-size: 16px;
      }

      .login_btns {
        display: flex;
        justify-content: flex-end;

        button {
          width: 100px;
        }
      }
    }
  }
}
</style>
