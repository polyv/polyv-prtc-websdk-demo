import { appId, appKey } from './config'
import { createClient, createStream, generateToken } from '../lib'

let instance = undefined

class RTC {
  constructor() {
    this.client = createClient(appId)
  }

  localStream = undefined
  remoteStreams = []

  isJoined = false

  vm = undefined

  join(channel, username) {
    if (this.isJoined) return
    this.bindEvents()
    this.initLocalStream()
      .then((stream) => {
        const token = generateToken(appId, appKey, channel, username)
        this.client
          .join(channel, username, token)
          .then(() => {
            console.log('加入房间成功')
            this.isJoined = true

            this.vm && this.vm.$nextTick(() => {
              stream.play('local-stream')
            })
            // 自动发布
            this.publish()
          })
          .catch((err) => {
            console.log('加入房间失败', err)
            this.vm && this.vm.$notify.error({
              title: '加入房间失败',
              message: `${err}`
            })
          })
      })
      .catch((err) => {
        console.log('初始化本地流失败', err)
        this.vm && this.vm.$notify.error({
          title: '初始化本地流失败',
          message: `${err}`
        })
      })
  }
  leave() {
    if (!this.isJoined) return
    this.client
      .leave()
      .then(() => {
        console.log('离开房间成功')
        this.unbindEvents()
        this.reset()
      })
      .catch((err) => {
        console.log('离开房间失败', err)
      })
  }

  initLocalStream() {
    const stream = createStream({audio: true, video: true, screen: false})
    this.localStream = stream
    return stream.init().then(() => { return stream })
  }
  publish() {
    if (!this.localStream) {
      this.initLocalStream()
        .then((stream) => {
          stream.play('local-stream')
          this.client
            .publish(stream)
            .then(() => {
              console.log('发布成功')
            })
            .catch((err) => {
              console.log('发布失败', err)
              this.vm && this.vm.$notify.error({
                title: '发布失败',
                message: `${err}`
              })
            })
        })
        .catch((err) => {
          console.log('初始化本地流失败', err)
          this.vm && this.vm.$notify.error({
            title: '初始化本地流失败',
            message: `${err}`
          })
        })
    } else {
      this.client
        .publish(this.localStream)
        .then(() => {
          console.log('发布成功')
        })
        .catch((err) => {
          console.log('发布失败', err)
          this.vm && this.vm.$notify.error({
            title: '发布失败',
            message: `${err}`
          })
        })
    }
  }
  unpublish() {
    if (this.localStream) {
      this.client.unpublish(this.localStream)
      this.localStream.destroy()
      this.localStream = undefined
    }
  }

  handleUserJoin = (evt) => {
    console.log('用户加入 ', evt)
  }
  handleUserLeave = (evt) => {
    console.log('用户离开 ', evt)
  }
  handleStreamPublished = (evt) => {
    console.log('流已发布 ', evt)
  }
  handleStreamAdded = (evt) => {
    console.log('流已加入 ', evt)
    const stream = evt.data
    this.remoteStreams.push(evt.data)
    // 自动订阅
    this.client
      .subscribe(stream)
      .then(() => {
        stream.play(stream.id).catch((err) => {
          console.log(`${stream.userId} 播放失败`, err)
          this.vm && this.vm.$notify.warning({
            title: '播放失败',
            message: `${err}`
          })
        })
        console.log(`${stream.userId} 订阅成功`)
      })
      .catch((err) => {
        console.log(`${stream.userId} 订阅失败`, err)
      })
  }
  handleStreamSubscribed = (evt) => {
    console.log('流已订阅 ', evt)
  }
  handleStreamRemoved = (evt) => {
    console.log('流已移除 ', evt)
    const stream = evt.data
    this.remoteStreams = this.remoteStreams.filter((item) => item !== stream)
  }
  handleAudioMuted = (evt) => {
    console.log('流的音频已 mute ', evt)
  }
  handleAudioUnmuted = (evt) => {
    console.log('流的音频已 unmute ', evt)
  }
  handleVideoMuted = (evt) => {
    console.log('流的视频已 mute ', evt)
  }
  handleVideoUnmuted = (evt) => {
    console.log('流的视频已 unmute ', evt)
  }
  handleKickoff = (evt) => {
    console.log('当前账号已在异地登录 ', evt)
    this.vm && this.vm.$notify.error({
      title: '警告',
      message: `当前账号已在异地登录`
    })
    this.reset()
  }

  bindEvents() {
    this.client
      .on('user-joined', this.handleUserJoin)
      .on('user-left', this.handleUserLeave)
      .on('stream-published', this.handleStreamPublished)
      .on('stream-added', this.handleStreamAdded)
      .on('stream-subscribed', this.handleStreamSubscribed)
      .on('stream-removed', this.handleStreamRemoved)
      .on('mute-audio', this.handleAudioMuted)
      .on('unmute-audio', this.handleAudioUnmuted)
      .on('mute-video', this.handleVideoMuted)
      .on('unmute-video', this.handleVideoUnmuted)
      .on('kick-off', this.handleKickoff)
  }
  unbindEvents() {
    this.client
      .off('user-joined', this.handleUserJoin)
      .off('user-left', this.handleUserLeave)
      .off('stream-published', this.handleStreamPublished)
      .off('stream-added', this.handleStreamAdded)
      .off('stream-subscribed', this.handleStreamSubscribed)
      .off('stream-removed', this.handleStreamRemoved)
      .off('mute-audio', this.handleAudioMuted)
      .off('unmute-audio', this.handleAudioUnmuted)
      .off('mute-video', this.handleVideoMuted)
      .off('unmute-video', this.handleVideoUnmuted)
      .off('kick-off', this.handleKickoff)
  }

  reset() {
    this.isJoined = false;
    if (this.localStream) {
      this.localStream.destroy()
    }
    this.localStream = undefined;
    this.remoteStreams = [];
    this.client = createClient(appId)
  }
}

export function getRTCInstance(vm) {
  if (!instance) {
    instance = new RTC()
  }
  instance.vm = vm
  return instance
}
