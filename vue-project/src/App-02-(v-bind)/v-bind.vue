<template>
    <!-- 双大括号不能在HTML attributes中使用 -->
    <!-- 想要响应式的绑定一个attribute,应使用 v-bind指令 -->
    <!-- <div v-bind:id="dynamicID" v-bind:class="dynamicclass" v-bind:title="dynamicTitle">test</div> -->

    <!-- v-bind指令非常常用，可以简写成 ： -->
    <div :id="dynamicID" :class="dynamicclass" :title="dynamicTitle">v-bind test</div>

    <!-- 布尔型attribute -->
    <button :disabled="isButtonDisabled">这是一个按钮</button>

    <!-- 动态绑定多个值 -->
    <div v-bind="objectAttributes">动态绑定多个值</div>
</template>

<script>
    export default {
        data() {
            return {
                dynamicclass: "appClass",
                dynamicID: 'appID',

                // 如果绑定属性值被设为null或undefind，该属性将被移除
                dynamicTitle: null,

                // 布尔型attribute
                isButtonDisabled: false,

                // 动态绑定多个值
                objectAttributes: {
                    class: "appClass",
                    id: 'appID',
                }

            }
        }
    }
</script>

<style>
    .appClass {
        color: red;
        font-size: 30px;
    }
</style>