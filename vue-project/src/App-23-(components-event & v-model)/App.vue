<!-- 组件事件配合 v-model 使用
  如果是用户输入，我们希望在获取数据的同时发送数据配合 v-model 来使用 -->


<template>
  <h3>组件事件配合 v-model 使用</h3>
  
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