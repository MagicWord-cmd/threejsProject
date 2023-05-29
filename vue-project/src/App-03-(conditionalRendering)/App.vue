<template>

  <!-- v-if 指令用于条件性的渲染一块内容。这块内容只会在指令的表达式返回真时才会被渲染 -->
  <div v-if="flag">can you see me?</div>
  <div v-else="flag">just see me!</div>


  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else-if="type === 'C'">C</div>
  <div v-else="type === 'D'">Not A/B/C</div>

  <!-- v-show 没有else指令，只能判定自身的渲染 -->
  <div v-show="flag">can you see me?</div>

  <!-- v-if是“真实的”按条件渲染，因为他确保了在切换时，条件区块内的事件监听和子组件
  会被销毁与重建。v-if也是惰性的；如果初次渲染时条件为false，则不会做任何事。条件区块
  只有当条件为true时才被渲染。
  相比之下，v-show简单许多，元素无论条件如何，始终被渲染，只有CSS display属性会被切换，
  总的来说，v-if有更高的切换开销，而v-show有更高的初始渲染开销。因此，如果需要频繁切换，
  则使用v-show较好，如果在运行时的绑定条件很少变化，则v-if更合适 -->

</template>

<script>
  export default {
    data() {
      return {
        flag: true,
        // flag:false,
        type: "D",
      }
    }
  }
</script>