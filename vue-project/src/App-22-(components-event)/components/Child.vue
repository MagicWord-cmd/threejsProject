<template>
    <h3>Child</h3>
    <button @click="clickEventHandle">传递数据</button>
</template>

<script>

    export default {

        data() {
            return {
                msg: "传递数据2"
            }
        },


        methods: {
            clickEventHandle() {
                //  自定义事件
                // this.$emit("someEvent", "传递的数据");
                this.$emit("someEvent2", this.msg)

            }
        }
    }

</script>