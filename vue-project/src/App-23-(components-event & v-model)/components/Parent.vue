<template>
    <h3>Parent</h3>
    <p>搜索内容为：{{ search }}</p>
    <Child @searchEvent="getSearch"/>
</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {

        data() {
            return {
                search:""
            }
        },

        components: {
            Child
        },
        
        methods:{
            getSearch(data){
                this.search = data;
            }
        }
    }

</script>