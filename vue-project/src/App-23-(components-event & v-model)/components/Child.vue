<template>
    搜索：<input type="text" v-model="search">
</template>

<script>

    export default {

        data() {
            return {
                search:""
            }
        },

        //  侦听器
        watch:{
            search(newValue,oldValue){
                this.$emit("searchEvent",newValue)
            }
        }
    }

</script>