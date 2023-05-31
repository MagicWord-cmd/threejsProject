<template>
    <h3>Child</h3>

    <!-- 渲染父级传递过来的数据:number -->
    <p>{{age}}</p>

    <!-- 渲染父级传递过来的数据:array -->
    <ul>
        <li v-for="(item,index) of names" :key="index">{{item}}</li>
    </ul>

    <!-- 渲染父级传递过来的数据:object -->
    <p>{{userInfo.name}}</p>
    <p>{{userInfo.age}}</p>

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

        // 接收父级传递过来的数据(支持多个数据的传递)
        props: ["age", "names", "userInfo"]
    }

</script>