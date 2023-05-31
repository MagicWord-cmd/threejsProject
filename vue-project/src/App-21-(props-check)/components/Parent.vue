<template>
    <h3>Parent</h3>
    <Child :title="title" />

</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {
        data() {
            return {
                title: "标题",
            }
        },
        components: {
            Child
        }
    }

</script>