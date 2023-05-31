<!-- 组件注册方式 -->
<!-- 一个vue组件在使用前需要先被”注册“ ，这样vue才能在渲染模板时找到其对应的实现。
  组件的注册有两种方式：全局注册和局部注册 -->

<!-- 全局注册组件
    全局注册组件在main.js中引入。下面的例子中将<script>标签的MyHeader组件注释掉，然后在main.js中引入
    全局注册组件可在任意组件中直接使用，不需要再引入和注入了
    全局注册组件虽然很方便，但有以下几个问题：
    1.全局注册，但并没有的组件无法在生成打包时被自动移除（也叫做”tree-shaking“）。如果全局注册了一个组件，
      即使它并没有被实际使用，它仍然会出现在打包后的JS文件中
    2.全局注册在大型项目中使项目的依赖关系变得不那么明确。在父组件中使用子组件时，不太容易定位子组件的实现。
      和使用过多的全局变量一样，这可能会影响应用的长期维护 -->


<!-- 局部注册需要使用 components 选项。不知道是不是更新了，使用<script setup>好像更简单？？？-->
<!-- 使用export default时，components和setup不能混用，不然会报错 -->
<template>
  <h3>组件嵌套关系</h3>

  <MyHeader />
  <MyMain />
  <MyAside />


</template>


<!-- 使用export default时，components和setup不能混用，不然会报错 -->
<script setup>

  // import MyHeader from "./components/MyHeader.vue"
  import MyMain from "./components/MyMain.vue"
  import MyAside from "./components/MyAside.vue"

</script>


<style>

</style>