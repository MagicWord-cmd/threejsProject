<!-- 组件传递多种数据类型
  通过 props 传递数据，不仅可以传递字符串类型数据，还可以是其他类型，如数字、
  对象、数组等，实际上任何类型的值都可以作为 props 的值被传递。 -->

      
<template>
  <h3>组件传递多种数据类型</h3>

  <!-- number -->
<h3></h3>



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