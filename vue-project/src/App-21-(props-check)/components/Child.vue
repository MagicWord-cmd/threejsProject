<template>
    <h3>Child</h3>
    <p>{{title}}</p>
    <p>{{age}}</p>
    <p v-for="(item,index) of names" :key="index">{{item}}</p>


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

        // 常规的props数据传递
        // props: ["title", "userInfo"]

        //  props校验,注意！！！props是只读的，是属于父级的数据，是不允许被修改的
        props:{
            title:{
                //  指定校验数据类型（类型不匹控制台会弹出警告信息）
                // type:String

                //  也可指定多个校验类型
                type:[String,Number,Array,Object],

                //必选项 required,添加了必选项的未传值会报警告
                required:true

            },

            //  默认值, 数字和字符串可以直接default，
            age:{
                type:Number,
                //  当未接收到有值传入是显示默认值
                default:0
            },

            //  但是如果是数组和对象，必须通过工厂函数返回默认值
            names:{
                type:Array,
                default(){
                    return["空"]
                }
            },



        }
    }

</script>