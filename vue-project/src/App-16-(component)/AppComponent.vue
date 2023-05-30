<template>
    <h3>组件组成</h3>
    <!-- 组件的最大优势时可复用性
      当使用构建步骤时，我们一般会将vue组件定义在一个单独的 .vue 文件中，
      这被叫做单文件组件（简称SFC（single file component）） -->

    <!-- 一个最简单的组件至少要包含一个<template></template>标签 -->
    <!-- <script></script>和<style></style>标签为可选项标签 -->
  
    <div class="container">{{message}}</div>
  </template>
  
  <script>
    export default {
      //  所有的JS代码写在这里
      data() {
        return {
          message: "组件基础组成"
        }
      }
    }
  
  </script>
  


  <style scoped>
    /* scoped的作用是：生效作用域，让当前样式只在当前组件内生效 */
    .container {
      font-size: 30px;
      color: red;
    }
  </style>