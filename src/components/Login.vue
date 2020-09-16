<template>
  <div class="login_container">
    <div class="login_box"></div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
  color: #fff;
}

.login_box {
  position: absolute;
  width: 450px;
  height: 300px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 3px;
}
</style>
