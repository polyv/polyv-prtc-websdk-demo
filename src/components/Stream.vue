<template>
  <div class="stream">
    <div :id="stream && stream.id" style="width: 100%;height: 100%;" @click="$emit('choose-stream', stream)"></div>
    <div v-if="stream" class="info-bar">
      <div class="info">
        {{stream.userId}}
      </div>
    </div>
    <div v-if="stream && stream.isLocal" class="state-bar">
      <div v-if="stream.hasAudio()" class="state micphone" @click="muteAudio">
        <i v-show="stream.audioMuted" title="开麦" class="el-icon-turn-off-microphone clickable"></i>
        <i v-show="!stream.audioMuted" title="关麦" class="el-icon-microphone clickable"></i>
      </div>
      <div v-if="stream.hasVideo()" class="state camera" @click="muteVideo">
        <i v-show="stream.videoMuted" title="打开开摄像头" class="iconfont icon-shexiangtou_guanbi clickable"></i>
        <i v-show="!stream.videoMuted" title="关闭摄像头" class="iconfont icon-shexiangtou clickable"></i>
      </div>
    </div>
    <div v-if="stream && !stream.isLocal" class="state-bar">
      <div v-if="stream.hasAudio()" class="state micphone" @click="muteAudio">
        <i v-show="stream.audioMuted" title="打开声音" class="iconfont icon-shengyinjingyin clickable"></i>
        <i v-show="!stream.audioMuted" title="关闭声音" class="iconfont icon-shengyinkai clickable"></i>
      </div>
      <div v-if="stream.hasVideo()" class="state camera" @click="muteVideo">
        <i v-show="stream.videoMuted" title="打开画面" class="iconfont icon-live_fill clickable"></i>
        <i v-show="!stream.videoMuted" title="关闭画面" class="iconfont icon-live clickable"></i>
      </div>
      <div v-if="stream.hasAudio()" class="state micphone">
        <i v-show="stream.sourceAudioMuted" title="远端已关麦" class="el-icon-turn-off-microphone unclickable"></i>
        <i v-show="!stream.sourceAudioMuted" title="远端已开麦" class="el-icon-microphone unclickable"></i>
      </div>
      <div v-if="stream.hasVideo()" class="state camera">
        <i v-show="stream.sourceVideoMuted" title="远端已关闭摄像头" class="iconfont icon-shexiangtou_guanbi unclickable"></i>
        <i v-show="!stream.sourceVideoMuted" title="远端已打开摄像头" class="iconfont icon-shexiangtou unclickable"></i>
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
      this.$emit('reload-chosen-stream', this.stream)
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

  .clickable {
    cursor: pointer;
  }
  .unclickable {
    color: #ccc;
    cursor: not-allowed;
  }

  .info-bar {
    position: absolute;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.2);
    color: #fff;

    .info {
      display: inline-block;
      line-height: 20px;
      margin: 0 4px;
    }

    .opt {
      float: right;
    }
  }

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
