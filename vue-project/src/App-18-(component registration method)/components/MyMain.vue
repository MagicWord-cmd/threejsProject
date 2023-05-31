<template>
    <div class="mymain">
        <h3>MyMain</h3>
        <MyArticle />
        <MyArticle />
    </div> 
</template>


<!-- 使用export default时，components和setup不能混用，不然会报错 -->
<script setup>

    import MyArticle from "./MyArticle.vue"

</script>

<style scoped>
    .mymain {
        float: left;
        width: 69%;
        height: 600px;
        border: 5px solid #999;
    }
</style>