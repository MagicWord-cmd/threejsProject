<!-- 组件事件
  在组件的模板表达式中，可以直接使用 $emit 方法触发自定义事件，
  触发自定义事件的目的是组件之间传递数据，可实现 子组件向父组件 的数据传递 -->


<template>
  <h3>组件事件</h3>
  
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