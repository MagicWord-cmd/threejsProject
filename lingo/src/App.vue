<script setup lang="ts">
import { TypeScriptPluginOptions } from "@babel/parser";
import { World,LingoEditor,Setup,Cube,ThirdPersonCamera,Dummy,types,keyboard } from "lingo3d-vue";
import {ref} from "vue";

const dummyRef = ref<types.Dummy>()

keyboard.onKeyPress = (key) =>{
  const dummy = dummyRef.value;
  if (!dummy){
    return
  }
  console.log(key);
  if(key.keys.has('w')){
    dummy.strideForward = -5;
  }
  if(key.keys.has('s')){
    dummy.strideForward = 5;
  }
  if(key.keys.has('a')){
    dummy.strideRight = 5;
  }
  if(key.keys.has('d')){
    dummy.strideRight = -5;
  }
}

keyboard.onKeyDown = (key) =>{
  const dummy = dummyRef.value;
  if (!dummy){
    return
  }
  if (key.keys.has('Space')){
    dummy.jump(5)
  }
}

keyboard.onKeyUp = (key) =>{
  const dummy = dummyRef.value;
  if (!dummy){
    return
  }
  if(!key.keys.has('w') && !key.keys.has('s')){
    dummy.strideForward = 0;
  }
  if(!key.keys.has('a') && !key.keys.has('d')){
    dummy.strideRight = 0;
  }
}

</script>

<!-- <template>
  <World>
    <LingoEditor />
    <Cube />
  </World>
</template> -->


<template>
  <World>
    <LingoEditor />
    <Setup :default-light="false" environment="studio" />
    <Cube
      uuid="NmXFJASB74rjutNcFAaKx"
      :y="-20"
      :scale-x="20"
      :scale-y="0.1"
      :scale-z="20"
      :mass="0"
      physics="map"
    />
    <Cube
      uuid="NmXFJASB74rjutNcFAaKx"
      :x="10"
      :y="1"
      :z="1"
      :scale-x="0.1"
      :scale-y="5"
      :scale-z="5"
      :mass="0"
      physics="map"
    />
    <Cube
      uuid="NmXFJASB74rjutNcFAaKx"
      :x="100"
      :y="1"
      :z="100"
      :scale-x="0.1"
      :scale-y="5"
      :scale-z="5"
      :mass="0"
      physics="map"
    />

    <ThirdPersonCamera
      uuid="ZdTMvDqTsmK_1ofvpIPA8"
      :y="80"
      mouse-control
      active
    >
      <Dummy
        uuid="rq___-LlJKjI4WTT6bOHl"
        :animations='{"idle":"http://ec2-69-230-242-89.cn-northwest-1.compute.amazonaws.com.cn:8080/dummy/idle.fbx","running":"http://ec2-69-230-242-89.cn-northwest-1.compute.amazonaws.com.cn:8080/dummy/running.fbx","runningBackwards":"http://ec2-69-230-242-89.cn-northwest-1.compute.amazonaws.com.cn:8080/dummy/running-backwards.fbx","jumping":"http://ec2-69-230-242-89.cn-northwest-1.compute.amazonaws.com.cn:8080/dummy/falling.fbx","death":"http://ec2-69-230-242-89.cn-northwest-1.compute.amazonaws.com.cn:8080/dummy/death.fbx"}'
        :y="90"
        :rotation-y="41.36"
        :width="20"
        :depth="20"
        :inner-y="2"
        :frustum-culled="false"
        physics="character"
        ref = "dummyRef"
        stride-move
      />
    </ThirdPersonCamera>
  </World>
</template>