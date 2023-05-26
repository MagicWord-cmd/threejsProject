<template>

  <!-- 最基本的数据绑定形式：文本插值 -->
  <p>{{msg}}</p>
  <p>{{hello}}</p>

  <!-- javascript文本表达式 -->
  <!-- 每个绑定仅支持单一表达式（能够被求值的JS代码） -->
  <!-- 简单的判断方式是：是否可以合法的写在return后面 -->
  <p>{{number +1}}</p>
  <p>{{ok? 'yes':'no'}}</p>  <!-- 三目运算 -->
  <p>{{message.split('').reverse().join('')}}</p>   <!-- 拆分反转重组字符串 -->
  <!-- <p>{{var a = 1}}</p>   语句不支持 -->
  <!-- <p>{{if（ok） return message}}</p>   不支持多行表达式 -->

  <!-- 原始HTML -->
  <p>{{rawHtml}}</p>
  <p v-html="rawHtml"></p>     <!-- 正解 -->

<!-- ################################################################################ -->

  <!-- 属性绑定 -->



</template>

<script>
  export default {
    data() {
      return {
        msg: "神奇的语法",
        hello: "hello world",
        number: 10,
        ok:true,
        message:"大家好",
        rawHtml:"<a href = 'https://baidu.com'>百度</a>",
      }
    }
  }
</script>