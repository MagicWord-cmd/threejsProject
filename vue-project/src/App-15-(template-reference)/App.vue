<template>
  <h3>模板引用</h3>
  <!-- 内容改变：{{模板语法}}
       属性改变：v-bind:
       事件    ：v-on: -->

  <!-- 虽然vue的声明性渲染模型为你抽象了大部分对DOM的直接操作，但在某些情况下，我们仍然需要
    直接访问底层的DOM元素。要实现这一点，我们可以使用特殊的 ref 属性。 -->

  <!-- 挂载结束后引用都会被暴露在 this.$refs 之上 -->
  <div ref="container" class="container">{{content}}</div>
  <input type="text" ref="userInput">
  <button @click="getElementHandle">获取元素</button>

  <!-- 如果没有特殊需求不建议操作DOM，因为ref会有更多开销，且不方便，
    除非有非操作不可才能实现的需求时才使用 -->
 
</template>

<script>
  export default {
    data() {
      return {
        content: "内容",
      }
    },

    methods: {
      getElementHandle() {
        //  innerHTML是原生JS的属性
        console.log(this.$refs.container);
        this.$refs.container.innerHTML = this.$refs.userInput.value
        console.log( this.$refs.userInput.value);
  
      }
    }
  }

</script>