<template>
  <div><el-button type="info" @click="logout">logout</el-button></div>
</template>

<script>
export default {
  methods: {
    logout: function() {
      // remove sessionStorage - token
      window.sessionStorage.removeItem('token')
      // jump to login
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped></style>
