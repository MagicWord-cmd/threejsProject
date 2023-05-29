<template>

  <!-- v-for 指令用于基于一个数组来渲染一个列表，需要使用item in items形式的特殊语法 -->
  <!-- items是源数据的数组，item是迭代项的别名 -->
  <div v-for="item in items">{{item}}</div>
  <div v-for="name in names">{{name}}</div>

  <!-- 复杂数据 -->
  <!-- 大多数情况下渲染的数据源于网络请求，也就是json格式 -->
  <div v-for="result in results">
    <p>{{result.title}}</p>
    <!-- <p :src="result.avator" :alt="result.id">{{result.avator}}</p> -->
    <p v-html="result.avator" :alt="result.id"></p>
  </div>

  <!-- v-for也支持使用可选项的第二个参数表示当前项的位置索引 -->
  <div>
    <p v-for="(name,index) in names">{{index}}:{{name}}</p>
    <!-- 也可以使用 of 作为分隔符来替代 in ，这更接近JS的迭代器语法 -->
    <p v-for="(item,index) of items">{{index}}:{{item}}</p>
  </div>

  <!-- v-for与对象 -->
  <!-- 你也可以使用v-for来遍历一个对象的所有属性 -->
  <div>
    <p v-for="(value,key,index) of userInfo">({{index}}).{{key}}:{{value}}</p>
  </div>

</template>

<script>
  export default {
    data() {

      // 简单的v-for 指令
      return {
        items: ["C++", "Java", "python"],
        names: ["C", "js", "C#"],

        // 复杂的v-for 指令
        // 模拟网络请求数据
        results: [

          {
            "id": 11111111,
            "title": "学编程，痛并快乐",
            "avator": "<a href = 'https://baidu.com'>百度</a>",

          },

          {
            "id": 2222222,
            "title": "学编程，使我快乐",
            "avator": " <a href = 'https://www.bilibili.com/'>B站</a>",

          },

          {
            "id": 3333333,
            "title": "学编程，我很快乐",
            "avator": "<a href = 'https://www.javascriptcn.com/'>javaScript中文网</a>",

          }
        ],

        // v-for与对象
        userInfo: {
          姓名: "小明",
          年龄: 20,
          性别:"男"
        }
      }
    }
  }
</script>