<template>
  <!--  事件传参
    事件参数可以获取 event 对象和通过事件传递参数  -->

  <!--  获取 event 对象  -->
  <div>
    <button @click="addCount">addCount()</button>
    <p>count is:{{count}}</p>
  </div>

  <!-- 传递参数  -->
  <div>
    <button @click="passParameters('hellow')">passParameters()</button>
  </div>

    <!-- 传递参数的同时获取 event 对象  -->
    <div>
      <button @click="passParameters2('hellow',$event)">passParameters2()</button>
    </div>


</template>

<script>
  export default {
    data() {
      return {
        count: 0,
      }
    },

    // 所有的的方法（函数）都写在methods对象中
    methods: {

      // 获取 event 对象
      addCount(e) {
        console.log('e', e);
        e.target.innerHTML = "addCount()" + this.count;
        this.count += 1;
      },

      // 传递参数
      passParameters(message) {
        console.log('count', this.count);
        console.log('message', message);

        this.count ++;

        
      },

      // 传递参数并获取 event 对象
      passParameters2(message,e) {
        console.log('count', this.count);
        console.log('message', message);

        this.count ++;

        e.target.innerHTML = "passParameters2(Hellow)" + this.count;
      }
    }
  }
</script>