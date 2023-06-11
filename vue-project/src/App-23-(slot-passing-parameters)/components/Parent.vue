<template>
    <h3>Parent</h3>
    <hr>
    <h3>传递数据</h3>
    <!-- 第三步：v-slot="slotProps" 接收子组件传递过来的数据 -->
    <!-- 第四步：slotProps.msg 调用子组件传递过来的数据 -->
    <Child v-slot="slotProps">{{parentMessage}}-{{slotProps.msg}}</Child>
    <hr>
    
    <Child>
        <h3>具名插槽传递数据</h3>
        <template #header="slotProps">
            <h3>{{parentMessage}}-{{slotProps.msg}}</h3>
        </template>
    
    </Child>
    


</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {
        data() {
            return {

                
                parentMessage: "插槽传递数据:父组件信息"
            }
        },
        components: {
            Child
        }
    }

</script>