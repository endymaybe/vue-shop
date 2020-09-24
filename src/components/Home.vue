<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/e-logo.svg" alt srcset />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">登出</el-button>
    </el-header>

    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button icon-embed" @click="toggleCollapse"></div>
        <!-- left menu -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu v-for="item in menulist" :index="item.path + ''" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span class="menu-text">{{ item.authName }}</span>
            </template>

            <el-menu-item v-for="subItem in item.children" :index="'/' + subItem.path" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- Redirect placeholder -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // left menu list data
      menulist: [],
      // menu list icon
      iconsObj: {
        125: 'icon icon-users',
        103: 'icon icon-drive',
        101: 'icon icon-cart',
        102: 'icon icon-make-group',
        145: 'icon icon-pie-chart'
      },
      // menu whether collapse
      isCollapse: false,
      // activated link path
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.getActivePath()
  },
  methods: {
    /**
     * logout
     */
    logout() {
      // remove sessionStorage - token
      window.sessionStorage.removeItem('token')
      // remove sessionStorage - activePath
      window.sessionStorage.removeItem('activePath')
      // jump to login
      this.$router.push('/login')
    },
    /**
     * get all menu list
     */
    async getMenuList() {
      const { data: result } = await this.$http.get('menus')
      if (result.meta.status === 200) {
        this.menulist = result.data
        console.log(result.data)
      } else {
        return this.$message.error(result.meta.mag)
      }
    },

    /**
     * click menu icon toggle open/close
     */
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    /**
     * save nav path state
     */
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.getActivePath()
    },

    /**
     * get active path and assign value
     */
    getActivePath() {
      this.activePath = window.sessionStorage.getItem('activePath')
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #373d41;

    div {
      display: flex;
      align-items: center;

      img {
        width: 40px;
        height: 40px;
      }
      span {
        margin-left: 20px;
        color: #ffffff;
        font-size: 20px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .toggle-button {
      cursor: pointer;
      display: block;
      font-size: 18px;
      line-height: 24px;
      color: #ffffff;
      text-align: center;
    }

    .el-menu {
      border-right: none;

      .icon {
        font-size: 16px;
        margin-left: 2px;
      }
      .menu-text {
        margin-left: 10px;
      }
    }
  }

  .el-main {
    background-color: #eaedf1;
  }
}
</style>
