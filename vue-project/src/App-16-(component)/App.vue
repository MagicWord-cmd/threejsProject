<!-- 组件的最大优势时可复用性
    当使用构建步骤时，我们一般会将vue组件定义在一个单独的 .vue 文件中，
    这被叫做单文件组件（简称SFC（single file component）） -->

<!-- 一个最简单的组件至少要包含一个<template></template>标签 -->
<!-- <script></script>和<style></style>标签为可选项标签 -->

<script>
  //  第一步：引入组件
  import AppComponent from "./AppComponent.vue";


  export default {

    //  第二步：注入组件
    components: {
      AppComponent  //  AppComponent:AppComponent ES6语法的简写  
    }
  }


</script>

<template>

  <!-- 第三步：显示组件 -->
  <AppComponent />

  <div class="container">scoped测试</div>
  
</template>

<style>

</style>