/// <reference types="vite/client" />


/* 安装vite框架（Vue3）后，项目“main.ts” 文件中 “import App from ‘./App.vue’” 部分有红色报错提示，其他文件有些import引入文件也报错。
报错原因：vite使用的是ts，ts不识别 .vue 后缀的文件。
解决方法：
创建vite项目后，项目根目录会有一个 “env.d.ts” 文件，找到该文件，在里面添加一下代码： */
declare module "*.vue" {
    import { DefineComponent } from "vue"
    const component: DefineComponent<{}, {}, any>
    export default component
}