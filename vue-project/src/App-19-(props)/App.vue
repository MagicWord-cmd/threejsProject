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

    },
    components: {
      Parent
    }
  }

</script>