<template>
    <h3>Parent</h3>

    <!-- 父级向子级传递数据,支持多个数据的传递，也支持动态数据的传递 -->
    <Child title="父级向子级传递数据" :dynaData="message" />

</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {
        data() {
            return {
                message: "Parent动态传递过来的数据"
            }
        },
        components: {
            Child
        }
    }

</script>