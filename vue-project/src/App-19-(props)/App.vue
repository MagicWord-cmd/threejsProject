<!-- 组件传递数据props
  组件与组件之间不是完全独立的，而是有交集的，那就是组件之间是可以传递数据的
  传递数据的解决方案就是： props -->
<!-- 注意事项：
      props 传递数据，只能从父级传递到子级，不能反向传递。 -->

<template>
  <h3>组件传递数据props</h3>


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