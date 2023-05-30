<template>
    <div class="myaside">
        <h3>MyAside</h3>
        <MyItem />
        <MyItem />
        <MyItem />
    </div> 
</template>

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