<template>
  <div class="rtc-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>加入频道</span>
      </div>
      <div class="box-body">
        <el-form ref="form" :model="form" :rules="rules" :disabled="isJoining" label-width="80px" label-position="top">
          <el-form-item label="频道号" prop="channel">
            <el-input v-model="form.channel"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="isJoining" class="btn-submit"  type="primary" @click="onSubmit">立即加入</el-button>
          </el-form-item>
        </el-form>
        <div class="text right small">sdk version: {{version}}</div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { loadStore, saveStore } from '../store/sessionStore'
import { getRTCInstance, version } from '../rtc'

export default {
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
      rtc,
      version,
      isJoining: false,
    }
  },
  methods: {
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const data = {
            channel: this.form.channel,
            username: this.form.username,
          }
          saveStore(data)
          this.isJoining = true
          this.rtc
            .join(this.form.channel, this.form.username)
            .then(() => {
              this.isJoining = false
              this.$router.push('/room')
            })
            .catch((err) => {
              this.isJoining = false
              console.error('加入房间失败', err)
              this.$notify.error({
                title: '加入房间失败',
                message: `${err}`
              })
            })
        }
      })
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
      max-height: 440px;

      .box-body {
        margin: 0 20px;

        .btn-submit {
          width: 100%;
        }
      }
    }
  }
</style>
