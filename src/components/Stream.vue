<template>
  <div class="stream">
    <div :id="stream && stream.id" style="width: 100%;height: 100%;" @click="$emit('choose-stream', stream)"></div>
    <div v-if="stream && stream.isLocal" class="state-bar">
      <div class="state micphone" @click="muteAudio">
        <i v-show="stream && stream.audioMuted" title="开麦" class="el-icon-turn-off-microphone"></i>
        <i v-show="stream && !stream.audioMuted" title="关麦" class="el-icon-microphone"></i>
      </div>
      <div class="state camera" @click="muteVideo">
        <i v-show="stream && stream.videoMuted" title="打开开摄像头" class="el-icon-camera-solid"></i>
        <i v-show="stream && !stream.videoMuted" title="关闭摄像头" class="el-icon-camera"></i>
      </div>
    </div>
    <div v-if="stream && !stream.isLocal" class="state-bar">
      <div class="state micphone" @click="muteAudio">
        <i v-show="stream && stream.audioMuted" title="打开声音" class="el-icon-close-notification"></i>
        <i v-show="stream && !stream.audioMuted" title="关闭声音" class="el-icon-bell"></i>
      </div>
      <div class="state camera" @click="muteVideo">
        <i v-show="stream && stream.videoMuted" title="打开画面" class="el-icon-picture-outline"></i>
        <i v-show="stream && !stream.videoMuted" title="关闭画面" class="el-icon-picture"></i>
      </div>
      <div class="state micphone">
        <i v-show="stream && stream.sourceAudioMuted" title="远端已关麦" class="el-icon-turn-off-microphone"></i>
        <i v-show="stream && !stream.sourceAudioMuted" title="远端已开麦" class="el-icon-microphone"></i>
      </div>
      <div class="state camera">
        <i v-show="stream && stream.sourceVideoMuted" title="远端已关闭摄像头" class="el-icon-camera-solid"></i>
        <i v-show="stream && !stream.sourceVideoMuted" title="远端已打开摄像头" class="el-icon-camera"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: ['stream'],
  methods: {
    muteAudio() {
      if (this.stream.audioMuted) {
        this.stream.unmuteAudio()
      } else {
        this.stream.muteAudio()
      }
    },
    muteVideo() {
      if (this.stream.videoMuted) {
        this.stream.unmuteVideo()
      } else {
        this.stream.muteVideo()
      }
    }
  }
}
</script>

<style scoped  lang="less">
.stream {
  position: relative;
  min-height: 200px; 
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;

  .state-bar {
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.2);
    color: #fff;
    text-align: right;

    .state {
      display: inline-block;
      line-height: 20px;
      margin: 0 4px;
    }
  }
}
</style>
