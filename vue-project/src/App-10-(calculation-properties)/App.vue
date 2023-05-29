<template>
  <h3>计算属性</h3>
  <!-- 模板（{{}}）中的表达式虽然很方便，但也只能用来做简单的操作。如果在模板中
    写太多逻辑，会让模板变得臃肿，难以维护。因此我们推荐使用计算属性来
    描述依赖响应式状态的复杂逻辑 -->

    <!-- 计算属性缓存computed VS 方法methods -->
    <!-- 你可能注意到我们在表达式中像这样用一个函数也会获得和计算属性相同的结果 -->
    <!-- 重点区别在于：
      计算属性会基于其响应式依赖被《缓存》 。一个计算属性仅会在其响应式依赖更新时
      才重新计算，多次调用时可以重复使用已缓存的数据。
      方法调用总是会在重渲染发生时再次执行，每次调用需要重新计算 -->

  <h3>{{IT.name}}</h3>
  <!-- 常规写法 -->
  <p>{{IT.language.length > 0 ? 'yes' : 'no'}}</p>
  <!-- 计算属性 -->
  <p>{{returnIT}}</p>

</template>

<script>
  export default {
    data() {
      return {

        IT: {
          name: "MagicWord",
          language: ['C', 'Java', 'Python']
        }
      }
    },

    //  计算属性
    computed: {

      returnIT() {
        return this.IT.language.length > 0 ? 'YES' : 'NO'
      }

    }
  }

</script>