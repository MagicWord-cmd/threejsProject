<!-- 组件传递props校验
  vue组件可以更细致地声明对传入的 props 的校验要求。（验证传入数据类型是否符合指定类型） -->


<template>
  <h3>组件传递props校验</h3>
  
  <Parent />
</template>

<script>
  import Parent from "./components/Parent.vue"

  // 使用export default时，components和setup不能混用，不然会报错
  export default {
    data() {
      return {
        /*  在 vue 组件中即使没有任何参数也需要添加 return{} 返回值，
          如果不加上则当前组件的数据会变成全局可视，则造成变量污染。
          加上 return{} 则组件数据只能当前组件可视，不会影响到其他组件 */
      }
    },

    components: {
      Parent
    }
  }

</script>