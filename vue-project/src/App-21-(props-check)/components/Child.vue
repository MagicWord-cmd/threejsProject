<template>
    <h3>Child</h3>

    <!-- 渲染父级传递过来的数据:number -->
    <p>{{age}}</p>

    <!-- 渲染父级传递过来的数据:array -->
    <ul>
        <li v-for="(item,index) of names" :key="index">{{item}}</li>
    </ul>

    <!-- 渲染父级传递过来的数据:object -->
    <p>{{userInfo.name}}</p>
    <p>{{userInfo.age}}</p>

</template>

<script>

    export default {
        data() {

        },

        // 接收父级传递过来的数据(支持多个数据的传递)
        props: ["age", "names", "userInfo"]
    }

</script>