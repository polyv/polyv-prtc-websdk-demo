<template>
  <div id="app">
    <ClassRoom msg="Welcome to WebRTC Demo"/>
  </div>
</template>

<script>
import ClassRoom from './components/ClassRoom.vue'

export default {
  name: 'App',
  components: {
    ClassRoom
  }
}
</script>

<style>
#app {
  display: flex;
  width: 100%;
}
</style>
