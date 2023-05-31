<!-- 组件传递多种数据类型
  通过 props 传递数据，不仅可以传递字符串类型数据，还可以是其他类型，如数字、
  对象、数组等，实际上任何类型的值都可以作为 props 的值被传递。 -->


<template>
  <h3>组件传递多种数据类型</h3>

  <!-- number -->
  <h3></h3>



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