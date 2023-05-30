<template>
  <h3>Style绑定</h3>

  <!-- 数据绑定的一个常见需求场景是操纵元素的CSS style列表，因为 style 是 attribute，
    可以使用和其他attribute一样使用 v-bind 将他们和动态的字符串绑定。但是，在处理比较
    复杂的绑定时，通过拼接生成字符串是麻烦且容易出错的。因此，vue专门为 style 的 v-bind
    用法提供了特殊的功能增强。除了字符串外，表达式的值也可以是对象或数组。
  
    style绑定的权重太高了，后期需要修改比较麻烦，使用最多的还是class绑定-->

  <!-- 绑定一个对象 -->
  <!-- fontSize使用驼峰命名法可以不带引号，不然要写成"font-size" -->
  <div :style="{color:activeColor,fontSize:fontSize+'px'}">style绑定1</div>
  <!-- 多个属性的绑定通过绑定对象使代码更易读  -->
  <div :style="styleObject">style绑定1</div>

  <!-- 绑定一个数组,一般不使用，因为style本身就是一个对象类型 -->
  <div :style="[styleObject]">style绑定2</div>
</template>

<script>
  export default {
    data() {
      return {

        activeColor: 'red',
        fontSize: 30,

        styleObject: {
          color: 'green',
          'font-size': 30 + 'px', //也可写成fontSize:30+'px'
        }
      }
    }
  }

</script>

<style>

</style>