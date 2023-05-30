<template>
    <div class="mymain">
        <h3>MyMain</h3>
        <MyArticle />
        <MyArticle />
    </div> 
</template>

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