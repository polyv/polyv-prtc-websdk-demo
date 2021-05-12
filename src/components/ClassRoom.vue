<template>
  <div class="prtc-container">
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
      <el-container class="stream-container">
        <el-main :class="['remote', `streams-${rtc.remoteStreams.length}`]" style="padding: 0;">
          <div :id="stream.id" :key="stream.id" v-for="stream in rtc.remoteStreams" class="stream"></div>
        </el-main>
        <el-aside class="local">
          <div id="local-stream" class="stream local"></div>
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
import { version } from '../../lib'
import { getRTCInstance } from '../rtc'

export default {
  data() {
    const rtc = getRTCInstance(this);
    const store = loadStore();
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
      rtc,
      version,
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
          this.rtc.join(this.form.channel, this.form.username)
        }
      })
    },
    onPub() {
      if (this.rtc.localStream) {
        this.rtc.unpublish()
      } else {
        this.rtc.publish()
      }
    },
    onLeave() {
      this.rtc.leave()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .prtc-container {
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

    .stream-container {
      height: calc(100% - 120px);

      .stream {
        flex: 1;
        min-width: 300px;
      }

      .remote {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        background-color: #000;
        overflow: auto;

        .stream {
          max-width: 20%;
          max-height: 20%;
        }

        &.streams-1 {
          .stream {
            max-width: 100%;
            max-height: 100%;
          }
        }
        &.streams-2,
        &.streams-3,
        &.streams-4 {
          .stream {
            max-width: 50%;
            max-height: 50%;
          }
        }
        &.streams-5,
        &.streams-6 {
          .stream {
            max-width: 50%;
            max-height: 30%;
          }
        }
        &.streams-7,
        &.streams-8,
        &.streams-9 {
          .stream {
            max-width: 30%;
            max-height: 30%;
          }
        }
      }
      @media screen and (min-width: 720px) and (max-width: 799px) {
        .remote {
          .stream {
            min-width: 200px;
          }
        }
      }
      @media screen and (min-width: 800px) and (max-width: 899px) {
        .remote {
          .stream {
            min-width: 250px;
          }
        }
      }
      @media screen and (min-width: 900px) and (max-width: 1199px) {
        .remote {
          .stream {
            min-width: 300px;
          }
        }
      }
      @media screen and (min-width: 1200px) {
        .remote {
          .stream {
            min-width: 450px;
          }
        }
      }

      .local {
        display: flex;
        background-color: #333;
        flex-direction: column;
        .stream {
          max-height: 200px;
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
