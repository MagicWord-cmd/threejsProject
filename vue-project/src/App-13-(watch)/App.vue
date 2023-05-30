<template>
  <h3>侦听器</h3>
  <!-- 侦听器是用来侦听数据的变化，不是页面中的所有数据都可侦听，只有响应式的数据可被侦听 -->
  <!-- 响应式的数据是指在data()函数中return的动态数据，当然还有其他数据（如组件传参数据） -->

  <!-- 我们可以使用 watch 选项在每次响应式属性放生变化时触发一个函数 -->
  <p>{{message}}</p>
  <button @click="updateHandle">修改数据查看控制台</button>

</template>

<script>
  export default {
    data() {
      return {
        message: 'Hellow！'
      }
    },

    methods:{
      updateHandle(){
        this.message = "Hi,Vue!"
      }
    },

    //  watch 侦听器
    watch:{
      //  此处的方法名需要与模板语法（{{}}）中的名称保存一致
      message(newValue,oldValue){
        // 这里的方法在侦听到数据发生变化时会自动执行
        console.log('newValue',newValue);
        console.log('oldValue',oldValue);
      }
    }
  }
</script>