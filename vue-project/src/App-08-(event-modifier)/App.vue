<template>
  <!--  事件修饰符
    在处理事件时调用event.preventDefault() 或 event.stopPropagation() 是很常见的。
    尽管我们可以直接在方法内调用，但如果方法能更专注于数据罗杰而不用去处理DOM事件的细节
    会更好，为了解决这一问题，vue为 v-on 提供了事件修饰符，常用有以下几个： -->

  <!--  .stop   阻止事件冒泡  -->
  <!--  .prevent    阻止默认事件  -->
  <!--  .once   执行一次  -->
  <!--  .enter    回车按键触发  -->
  <!--  不止这些  -->

  <!--  阻止默认事件  -->
  <div>
    <a @click="clickHandle" href="https://baidu.com">阻止默认事件1</a>
  </div>
  <div>
    <!--  使用.preven 更简洁，函数中只需要关心函数本身的实现即可  -->
    <a @click.prevent="clickHandle2" href="https://baidu.com">阻止默认事件2</a>
  </div>

  <!--  阻止事件冒泡  -->
  <div @click="clickDiv">
    <!-- 点击P标签时事件向上冒泡，也触发了Div标签的点击事件 -->
    <p @click="clickP">测试冒泡（点我参看控制台）</p>
  </div>
  <div @click="clickDiv">
    <!-- 通过.stop 来阻止P标签向上冒泡 -->
    <p @click.stop="clickP">阻止P标签冒泡（点我参看控制台）</p>
  </div>


</template>

<script>
  export default {
    data() {
      return {

      }
    },

    methods: {

      clickHandle(e) {

        //  阻止默认事件 点击后可以阻止网页跳转的默认事件
        e.preventDefault();
        console.log("点击了1");
      },

      clickHandle2(e) {
        //  函数中只需要关心函数本身的实现即可
        console.log("点击了2")
      },

      clickDiv(){
        console.log("点击了DIV标签")
      },

      clickP(){
        console.log("点击了P标签")
      }
    }





  }
</script>