<!-- 插槽 slot 传递数据
  在某些场景下插槽的内容可能想要同时使用父组件域内和子组件域内的数据，
  要做到这一点，我们需要一种方法来让子组件在渲染时将一部分数据提供给插槽。
  我们可以像对组件传递props那样，向一个插槽的出口上传递属性 attributes -->

<template>
  <h3>插槽 slot 传递数据</h3>

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