<template>
  <!--  事件处理
    v-on指令（简写@）用来监听DOM事件，并在事件触发时执行对应的javascript。
    用法：v-on:click="methodName"或@click="handler" -->

  <!--  事件处理的值可以是：
    内联事件处理器：事件被触发时执行的内联JavaScript语句（与onclick类似）
    方法事件处理器：一个指向组件上定义的方法的属性名或者是路径  -->


  <!--  内联事件处理器：通常用于简单场景  -->
  <div>
    <button v-on:click="count++">Add 1 v-on</button>
  </div>
  <div>
    <button @click="count--">Sub 1 @</button>
  </div>


  <!--  方法事件处理器：可以调用一个函数事件  -->
  <div>
    <button @click="addCount">addCount()</button>
  </div>

  <p>count is:{{count}}</p>

</template>

<script>
  export default {
    data() {
      return {
        count: 0,
      }
    },

    // 所有的的方法（函数）都写在methods对象中
    methods: {
      addCount() {
        console.log("addCount()已执行")
        // 所有data里面的数据，可以通过this指向进行读取
        this.count += 1
      }
    }
  }
</script>