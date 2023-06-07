<template>
    <h3>Parent</h3>

    <!-- <Child @someEvent="getHandle" /> -->
    <Child @someEvent2="getHandle" />
    <p>子元素通过组件事件传递过来的数据：{{message}}</p>
</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {

        data() {
            return {
                message: ""
            }
        },

        components: {
            Child
        },
        methods: {
            getHandle(data) {
                //  data用于接收传递的数据
                console.log("自定义事件触发了", data);

                this.message = data;
            }
        }
    }

</script>