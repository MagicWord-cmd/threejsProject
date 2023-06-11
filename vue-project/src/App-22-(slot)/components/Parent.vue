<template>
    <h3>Parent</h3>
    <hr>

    <!-- 使用双标签以向子组件传递模板内容，之后需要在子组件中使用 slot 标签进行渲染 -->
    <Child>
        <h3>插槽标题</h3>
        <p>插槽内容</p>
        <hr>
        <h3>渲染作用域</h3>
        <!-- 插槽内容可以访问到父组件的数据作用域，因为插槽内容本身是在父组件模板中定义的 -->
        <p>{{message}}</p>

        <!-- 具名插槽 -->
        <!-- <template v-slot:name1>
            <p>具名插槽1</p>
        </template> -->
        <!-- v-slot:可以简写为# -->
        <template #name1>
            <p>具名插槽1</p>
        </template>
        <template #name2>
            <p>具名插槽2</p>
        </template>

    </Child>

</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {
        data() {
            return {
                message: "插槽作用域"
            }
        },
        components: {
            Child
        }
    }

</script>