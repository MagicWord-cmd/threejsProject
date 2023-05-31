<template>
    <h3>Child</h3>

    <!-- 渲染父级传递过来的数据 -->
    <p>{{title}}</p>

    <p>{{dynaData}}</p>


</template>

<script>

    export default {
        data() {

        },

        // 接收父级传递过来的数据(支持多个数据的传递)
        props: ["title", "dynaData"]
    }

</script>