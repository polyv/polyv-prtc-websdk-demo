<template>
  <div class="rtc-container">
    <el-card v-if="!rtc.isJoined" class="box-card">
      <div slot="header" class="clearfix">
        <span>加入频道</span>
      </div>
      <div class="box-body">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" label-position="top">
          <el-form-item label="频道号" prop="channel">
            <el-input v-model="form.channel"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item style="margin-top: 46px;">
            <el-button class="btn-submit"  type="primary" @click="onSubmit">立即加入</el-button>
          </el-form-item>
        </el-form>
        <div class="text right small">sdk version: {{version}}</div>
      </div>
    </el-card>
    <el-container v-if="rtc.isJoined">
      <el-header class="status-bar">频道号：{{form.channel}}</el-header>
      <el-container class="main-container">
        <el-main class="main-panel">
          <video v-if="chosenStream" muted autoplay ref="display"></video>
        </el-main>
        <el-aside class="streams-container">
          <div class="local-streams">
            <Stream :stream="rtc.localStream" v-on:choose-stream="onChooseStream"></Stream>
          </div>
          <div class="remote-streams">
            <Stream :stream="stream" :key="stream.id" v-for="stream in rtc.remoteStreams" v-on:choose-stream="onChooseStream"></Stream>
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
import { loadStore, saveStore } from '../store/sessionStore'
import { getRTCInstance, version } from '../rtc'
import Stream from './Stream.vue'

export default {
  components: {
    Stream
  },
  data() {
    const rtc = getRTCInstance(this)
    const store = loadStore()
    // 自动加入房间
    // if (store.channel && store.username) {
    //   rtc.join(store.channel, store.username)
    // }
    return {
      form: {
        channel: store.channel || '',
        username: store.username || '',
      },
      rules: {
        channel: [
          { required: true, message: '请输入频道号', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
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
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const data = {
            channel: this.form.channel,
            username: this.form.username
          }
          saveStore(data)
          this.rtc
            .join(this.form.channel, this.form.username)
            .then(() => {
              this.chosenStream = this.rtc.localStream
            })
            .catch((err) => {
              console.error('加入房间失败', err)
            })
        }
      })
    },
    onPub() {
      if (this.rtc.localStream) {
        if (this.chosenStream === this.rtc.localStream) {
          this.chosenStream = null
        }
        this.rtc.unpublish()
      } else {
        this.rtc.publish()
        if (!this.chosenStream) {
          this.chosenStream = this.rtc.localStream
        }
      }
    },
    onLeave() {
      this.rtc.leave()
    },
    onChooseStream: function(stream) {
      this.chosenStream = stream
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

    .box-card {
      margin: 0 auto;
      margin-top: 10%;
      min-width: 480px;
      max-width: 60%;
      max-height: 430px;

      .box-body {
        margin: 0 20px;

        .btn-submit {
          width: 100%;
        }
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
