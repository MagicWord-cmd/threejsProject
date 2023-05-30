<template>
  <h3>Class绑定</h3>
  <!-- 数据绑定的一个常见需求场景是操纵元素的CSS class列表，因为 class 是attribute，
      我们可以和其他attribute一样使用 v-bind 将它们和动态的字符串绑定。但是，在处理比较
      复杂的绑定时，通过拼接生成字符串是麻烦且容易出错的。因此，VUE专门为 class 的 v-bind
      用法提供了特色的功能增强。除了字符串外，表达式的值也可以是对象或者数组。 -->

  <!-- 绑定一个对象 -->
  <!-- 这里class的属性值接收了一个对象，对象的值可以动态变化从而影响class     -->
  <p :class="{'active':isActive,'text-danger':hasError}">class样式绑定</p>
  <!-- 多个属性的绑定通过绑定对象使代码更易读  -->
  <p :class="classObject">class样式绑定2</p>

  <!-- 绑定一个数组的值  -->
  <p :class="[arrActive]">class样式绑定3</p>
  <p :class="[arrHasError]">class样式绑定3</p>
  <p :class="[arrActive,arrHasError]">class样式绑定3</p>

  <p :class="[isActive? 'active':'']">class样式绑定4</p>
  <p :class="[hasError? 'text-danger':'']">class样式绑定4</p>

  <!-- 数组和对象嵌套使用  “”“必须是 数组 嵌套 对象 ”“” -->
  <p :class="[{'active':isActive},arrHasError]">class样式绑定5</p>

</template>

<script>
  export default {
    data() {
      return {
        isActive: true,
        hasError: false,

        classObject: {
          'active': false,
          'text-danger': true
        },

        arrActive: 'active',
        arrHasError: 'text-danger'
      }
    }
  }

</script>

<style>
  .active {
    font-size: 30px;
  }

  .text-danger {
    color: red;
  }
</style>