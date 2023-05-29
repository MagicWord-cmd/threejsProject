<template>
  <!--  通过key来管理状态 -->
  <!--  vue默认按照“就地更新”的策略来更新通过v-for渲染的元素，当数据顺序发生改变时；vue
    不会随之移动DOM元素的顺序，而是就地更新每一个元素，确保他们在原本指定的索引位置渲染。
    为了给vue一个提示，以便它可以跟踪每个节点的标识，从而重用和重新排列现有元素，需要为
    每个元素对应的块提供一个唯一的key attribute -->

  <!-- key 是一个通过v-bind 绑定的特殊attribute，推荐在任何可行的时候为v-for提供该attribute，
    key绑定的值期望是一个基础类型的值，例如string或者number类型 -->

  <p v-for="(item,index) in items" :key="index">{{item}}</p>

  <!-- key的来源
  请不要使用index作为key的值，我们要确保每一条数据的唯一索引不会发生变化，应该使用id -->
  <div v-for="result in results" :key="result.id">
    <p>{{result.title}}</p>
    <p v-html="result.avator" :alt="result.id"></p>
  </div>
</template>

<script>
  export default {
    data() {

      // 通过key来管理状态不是重新渲染，而是调换位置，可以节省内存消耗
      return {
        items: ["C++", "Java", "python"],

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
      }
    }
  }
</script>