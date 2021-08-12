<template>
  <div class="rtc-container"
    v-loading="isIniting"
    element-loading-text="正在初始化..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    >
    <el-container>
      <el-header class="status-bar">
        <div class="room-id">频道号：{{channel}}</div>
        <Status/>
      </el-header>
      <el-container class="main-container">
        <el-main class="main-panel">
          <video v-if="chosenStream" muted autoplay ref="display"></video>
        </el-main>
        <el-aside class="streams-container">
          <div class="local-streams">
            <Stream :stream="rtc.localStream" v-on:choose-stream="onChooseStream"></Stream>
          </div>
          <div class="remote-streams">
            <Stream :stream="stream" :key="stream.id" v-for="stream in rtc.remoteStreams" v-on:choose-stream="onChooseStream" v-on:reload-chosen-stream="reloadChosenStream"></Stream>
          </div>
        </el-aside>
      </el-container>
      <el-footer class="menu-bar">
        <el-button type="primary" @click="onLeave">离开房间</el-button>
        <el-button type="success" @click="onPub">{{rtc.localStream ? '下麦' : '上麦'}}</el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { loadStore } from '../store/sessionStore'
import { getRTCInstance, version } from '../rtc'
import Stream from './Stream.vue'
import Status from './Status.vue'

export default {
  components: {
    Stream,
    Status,
  },
  data() {
    const rtc = getRTCInstance(this)
    const store = loadStore()
    if (!rtc.isJoined || !store.channel || !store.username) {
      rtc.leave()
        .catch((err) => {
          console.error('返回异常 ', err)
        })
      this.$router.replace('/')
    } else {
      // 自动发布
      rtc.publish()
        .then(() => {
          this.isIniting = false
        })
        .catch((err) => {
          this.$notify.error({
            title: '发布失败',
            message: `${err}`
          })
        })
      const localStream = rtc.localStream
      this.$nextTick(() => {
        if (localStream) {
          this.chosenStream = localStream
          localStream.play(localStream.id)
        }
      })
    }
    return {
      channel: store.channel || '',
      username: store.username || '',
      isIniting: true,
      chosenStream: null,
      rtc,
      version,
    }
  },
  watch: {
    chosenStream: function () {
      this.$nextTick(() => {
        const display = this.$refs['display']
        if (this.chosenStream) {
          display.srcObject = this.chosenStream.mediaStream
        }
      })
    }
  },
  methods: {
    onPub() {
      if (this.rtc.localStream) {
        if (this.chosenStream === this.rtc.localStream) {
          this.chosenStream = null
        }
        this.rtc
          .unpublish()
          .catch((err) => {
            this.$notify.error({
              title: '取消发布失败',
              message: `${err}`
            })
          })
      } else {
        this.rtc
          .publish()
          .then(() => {
            const localStream = this.rtc.localStream
            if (localStream) {
              this.$nextTick(() => {
                if (!this.chosenStream) {
                  this.chosenStream = this.rtc.localStream
                }
                localStream.play(localStream.id)
              })
            }
          })
          .catch((err) => {
            this.$notify.error({
              title: '发布失败',
              message: `${err}`
            })
          })
      }
    },
    onLeave() {
      this.rtc.leave()
      this.$router.replace('/')
    },
    onChooseStream: function(stream) {
      this.chosenStream = stream
    },
    reloadChosenStream: function(stream) {
      if (stream && stream === this.chosenStream) {
        this.$nextTick(() => {
          this.$refs['display'].srcObject = stream.mediaStream
        })
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .rtc-container {
    display: flex;
    flex: 1;

    .text {
      font-size: 14px;

      &.small {
        transform: scale(.7);
      }

      &.left {
        text-align: left;
        transform-origin: 0%;
      }

      &.right {
        text-align: right;
        transform-origin: 100%;
      }
    }

    .main-container {
      display: flex;
      width: 100%;
      height: calc(100% - 120px);

      .main-panel {
        padding: 0;
        height: 100%;
        background-color: #000;
        border-radius: 4px;
        overflow: hidden;
        video {
          width: 100%;
          height: 100%;
        }
      }
      .streams-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding:0 4px;
        .local-streams,
        .remote-streams {
          display: flex;
          flex-direction: column;
          padding: 0 4px;
        }
        .local-streams {
          height: 210px;
        }
        .remote-streams {
          margin-top: 10px;
          overflow-y: auto;
          .stream {
            margin-bottom: 4px;
          }
        }
      }
    }

    .status-bar {
      display: flex;
      padding: 10px;
      line-height: 30px;
      color: #eee;

      .status {
        margin-left: 20px;
        padding-left: 20px;
        border-left: 1px solid #333;
      }
    }

    .menu-bar {
      display: flex;
      flex-flow: row-reverse;
      padding: 10px;

      button {
        margin: 0 6px;
      }
    }
  }
</style>
