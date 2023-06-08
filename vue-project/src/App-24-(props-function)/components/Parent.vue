<template>
    <h3>Parent</h3>
    <p>{{ message }}</p>
    <Child title="标题" :sendFunction="dataFn"/>
    
</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {

        data() {
            return {
                message:""
            }
        },

        components: {
            Child
        },

        methods:{
            dataFn(data){
                console.log(data);
                this.message = data;
            }
        }
    }

</script>