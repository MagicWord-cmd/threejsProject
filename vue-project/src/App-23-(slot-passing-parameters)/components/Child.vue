<template>

    <!-- 第二步：:msg="childMessage"可以将子组件数据传递给父组件 -->
    <slot :msg="childMessage"></slot>

    <slot name="header" :msg="childMessage"></slot>
    
</template>

<script>

    export default {
        data() {

            return {
                // 第一步：要实现父组件调用该属性，需要先将该值传递给父组件
                childMessage:"插槽传递数据:子组件信息"
            }

        },
    }

</script>