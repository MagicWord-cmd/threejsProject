<template>
    <div class="myaside">
        <h3>MyAside</h3>
        <MyItem />
        <MyItem />
        <MyItem />
    </div> 
</template>


<!-- 使用export default时，components和setup不能混用，不然会报错 -->
<script setup>

    import MyItem from "./MyItem.vue"

</script>


<style scoped>
    .myaside {
        float: right;
        width: 29%;
        height:600px;
        border: 5px solid #999;
    }
</style>