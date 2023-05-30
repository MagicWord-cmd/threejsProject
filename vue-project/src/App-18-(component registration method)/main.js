// import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'

import MyHeader from "./components/MyHeader.vue"

const app = createApp(App)

// 在这中间写全局注册组件(const app之后和app.mount('#app')之前)
app.component("MyHeader", MyHeader)

app.mount('#app')