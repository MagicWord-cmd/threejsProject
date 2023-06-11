<!-- 插槽 slot
  在某些场景场景中我们可能想要为子组件传递一些模板片段，让子组件在他们的组件中渲染这些片段 -->


<template>
  <h3>插槽 slot</h3>
  
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