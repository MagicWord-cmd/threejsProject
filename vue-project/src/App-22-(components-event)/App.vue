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
       
      }
    },

    components: {
      Parent
    }
  }

</script>