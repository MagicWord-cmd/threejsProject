<template>
    <h3>Parent</h3>

    <!-- 组件传递多种数据类型
  通过 props 传递数据，不仅可以传递字符串类型数据，还可以是其他类型，如数字、
  对象、数组等，实际上任何类型的值都可以作为 props 的值被传递。 -->
    <Child :age="age" :names="names" :userInfo="userInfo" />

</template>

<script>

    import Child from "./Child.vue"

    // 使用export default时，components和setup不能混用，不然会报错
    export default {
        data() {
            return {
                age: 20,

                names: ['C', 'Java', 'Python'],

                userInfo: {
                    name: "MagicWord",
                    age: 20
                }
            }
        },
        components: {
            Child
        }
    }

</script>