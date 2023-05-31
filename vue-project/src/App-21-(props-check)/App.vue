<!-- 组件传递props校验
  vue组件可以更细致的声明对传入的props的校验要求（验证传递的数据类型是否为指定类型） -->


<template>
  <h3>组件传递props校验</h3>

</template>

<script>
  import Parent from "./components/Parent.vue"

  // 使用export default时，components和setup不能混用，不然会报错
  export default {
    data() {

    },

    components: {
      Parent
    }
  }

</script>