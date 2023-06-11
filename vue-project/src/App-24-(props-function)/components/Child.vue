<template>
    <h3>Child</h3>
    <p>{{ title }}</p>
    <!-- 子组件通过props调用父组件的函数，并传入数据给父组件 -->
    <p>{{ sendFunction('传递数据') }}</p>   
</template>

<script>

export default {

    data() {
        return {

        }
    },

    props:{
        title:String,
        sendFunction:Function
    }
}

</script>