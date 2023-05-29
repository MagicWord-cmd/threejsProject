<template>
  <h3>数组变化侦听</h3>
  <!-- 变更方法 -->
  <!-- vue能够侦听响应式数组的变更方法，并在他们被调用时触发相关更新。这些变更的方法包括：
    push()
    pop()
    shift()
    unshift()
    splice()
    sort()
    reverse() -->

  <!-- 替换一个数组 -->
  <!-- 变更方法是对调用它们的 原数组 进行变更。相对的也有一些不可变（immutable）方法。
    如 filter(), concat(),  slice(),这些都不会更改原数组，而总是返回一个新数组。当
    遇到的是非变更方法时，我们需要将旧的数组替换为新的 -->


  <button @click="addListHandle">变更方法添加数据</button>
  <button @click="addListHandle2">不可变方法添加数据</button>
  <li v-for="(name,index) in names" :key="index">{{name}}</li>
</template>

<script>
  export default {
    data() {
      return {
        names: ['C++', 'Java', 'Python']
      }
    },

    methods: {
      addListHandle() {

        //  变更方法会引起当前渲染的更新
        this.names.push('C#')
        console.log(this.names);
      },
      addListHandle2() {

        //  不可变方法添加数据不会引起当前渲染的更新
        this.names.concat(['C']);
        console.log(this.names.concat(['C']));
        //  要想让原数组发生变化并更新渲染需要对原数组重新赋值
        this.names = this.names.concat(['C']);
      }
    }
  }

</script>