<!-- 组件嵌套关系 -->
<!-- 组件允许我们将UI划分为独立的、可重用的部分，并且可以对每个部分进行单独的思考。
  在实际应用中，组件常常被组织成层层嵌套的树状结构。
  这和我们嵌套HTML元素的方式类似，vue实现了自己的组件模型，让我们可以在每个组件
  内封装自定义内容与逻辑。 -->

<template>
  <h3>组件嵌套关系</h3>

  <MyHeader />
  <MyMain />
  <MyAside />


</template>


<!-- 使用export default时，components和setup不能混用，不然会报错 -->
<script setup>

  import MyHeader from "./components/MyHeader.vue"
  import MyMain from "./components/MyMain.vue"
  import MyAside from "./components/MyAside.vue"

</script>


<style>

</style>