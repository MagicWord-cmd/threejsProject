<template>
  <h3>表单输入绑定</h3>
  <!-- 在前端处理表单时，我们常常需要将表单输入框的内容同步给JS中响应的变量。
  手动链接值绑定和更改时间侦听器可能会很麻烦，v-model 指令有助简化这一步骤 -->

  <!-- 只要有用户输入的地方都离不开表单 from -->
  <form>
    <input type="text" v-model="message">
    <p>{{message}}</p>

    <!-- 复选框  单一的复选框，绑定布尔值类型 -->
    <div>
      <input type="checkbox" id="checkbox" v-model="checked">
      <label for="checkbox">{{checked}}</label>
    </div>


    <!-- 修饰符
      v-model也提供了修饰符：.lazy   .number    .trim -->

    <!-- .lazy
        默认情况下，v-model会在每次input事件后更新数据。你可以添加 .lazy 修饰符来
        改为每次 change 事件后更新数据。 message2在输入完毕之后才会更新 -->
    <h3>修饰符</h3>
    <h4>.lazy 每次 change 事件后更新数据</h4>
    <input type="text" v-model.lazy="message2">

    <p>{{message2}}</p>

    <!-- .number
        提取前置数字类型 -->
    <h4>.number 提取前置数字类型</h4>
    <input type="text" v-model.number="message3">
    <p>{{message3}}</p>

    <!-- .trim
        除去首尾空格 -->
    <h4>.trim 除去首尾空格</h4>
    <input type="text" v-model.trim="message4">
    <p>{{message4}}</p>
  </form>
</template>

<script>
  export default {
    data() {
      return {
        message: "xxxx",
        checked: true,
        message2: "xxxx",
        message3: "000aaa",
        message4: "xxxx",
      }
    }
  }
</script>