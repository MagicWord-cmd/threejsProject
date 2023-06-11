<template>
    <h3>Child</h3>

    <!-- slot 标签用于接收父组件传递过来的模板内容 -->
    <slot></slot>
    <hr>


    <!-- 插槽可以指定默认内容，当没有指定任何内容的情况下插槽将显示默认内容 -->
    <!-- <slot>插槽默认内容是这样定义的</slot> -->
    <hr>

    <h3>具名插槽</h3>
    <slot name="name1">插槽默认值</slot>
    <slot name="name2">插槽默认值</slot>
    
</template>

<script>

    export default {
        data() {

            return {
                /*  在 vue 组件中即使没有任何参数也需要添加 return{} 返回值，
                  如果不加上则当前组件的数据会变成全局可视，则造成变量污染。
                  加上 return{} 则组件数据只能当前组件可视，不会影响到其他组件 */
            }

        },
    }

</script>