import { appId, appKey } from './config'
import { createClient, createStream, generateToken, version } from '../lib'
import { store } from './store'

function log(...args) {
  console.log((new Date()).toLocaleString(), ...args)
}

let instance = undefined

class RTC {
  constructor() {
    this.client = createClient(appId)
  }

  localStream = undefined
  remoteStreams = []

  isJoined = false

  vm = undefined

  async join(channel, username) {
    if (this.isJoined) return
    this.bindEvents()
    await this.initLocalStream()
    try {
      const token = generateToken(appId, appKey, channel, username)
      await this.client.join(channel, username, token, {type: 'live'})
      log('加入房间成功')
      this.watchUplinkDelay()
      this.isJoined = true
    } catch (err) {
      log('加入房间失败', err)
      throw err
    }
  }
  async leave() {
    if (!this.isJoined) return
    try {
      await this.client.leave()
      log('离开房间成功')
      this.unbindEvents()
      this.reset()
    } catch (err) {
      log('离开房间失败', err)
    }
  }


  getUplinkDelayTimer = 0
  watchUplinkDelay() {
    this.unwatchUplinkDelay()
    this.getUplinkDelayTimer = window.setInterval(async () => {
      if (this.localStream) {
        const stats = await this.localStream.getStats()
        if (stats.network) {
          store.commit('updateUplinkDelay', stats.network.rtt)
        }
      } else {
        store.commit('updateUplinkDelay', -1)
      }
    }, 1000)
  }
  unwatchUplinkDelay() {
    if (this.getUplinkDelayTimer) {
      window.clearInterval(this.getUplinkDelayTimer)
    }
    this.getUplinkDelayTimer = 0
  }

  async initLocalStream() {
    const stream = createStream({audio: true, video: true, screen: false})
    this.localStream = stream
    try {
      await stream.init()
    } catch (err) {
      log('初始化本地流失败', err)
      this.vm && this.vm.$notify.error({
        title: '初始化本地流失败',
        message: `${err}`
      })
      throw err
    }
    return stream
  }
  async publish() {
    if (!this.localStream) {
      await this.initLocalStream()
    }
    try {
      await this.client.publish(this.localStream)
    } catch (err) {
      log('发布失败', err)
      throw err
    }
  }
  async unpublish() {
    if (this.localStream) {
      await this.client.unpublish(this.localStream)
      this.localStream.destroy()
      this.localStream = undefined
    }
  }

  handleUserJoin = (evt) => {
    log('用户加入 ', evt)
  }
  handleUserLeave = (evt) => {
    log('用户离开 ', evt)
  }
  handleStreamPublished = (evt) => {
    log('流已发布 ', evt)
  }
  handleStreamAdded = (evt) => {
    log('流已加入 ', evt)
    let stream = evt.data
    this.remoteStreams.push(evt.data)
    this.client.subscribe(stream).catch((err) => {
      log(`${stream.userId} 订阅失败 ${err}`)
    })
  }
  handleStreamSubscribed = (evt) => {
    log('流已订阅 ', evt)
    const stream = evt.data
    stream.play(stream.id).catch((err) => {
      log(`${stream.userId} 播放失败 ${err}`)
      this.vm && this.vm.$notify.warning({
        title: '播放失败',
        message: `${err}`
      })
    })
  }
  handleStreamRemoved = (evt) => {
    log('流已移除 ', evt)
    const stream = evt.data
    this.remoteStreams = this.remoteStreams.filter((item) => item !== stream)
  }
  handleAudioMuted = (evt) => {
    log('流的音频已 mute ', evt)
  }
  handleAudioUnmuted = (evt) => {
    log('流的音频已 unmute ', evt)
  }
  handleVideoMuted = (evt) => {
    log('流的视频已 mute ', evt)
  }
  handleVideoUnmuted = (evt) => {
    log('流的视频已 unmute ', evt)
  }
  handleKickoff = (evt) => {
    log('当前账号已在异地登录 ', evt)
    this.vm && this.vm.$notify.error({
      title: '警告',
      message: `当前账号已在异地登录`
    })
    this.reset()
  }
  handleNetworkQuality = (evt) => {
    console.log(`上行 / 下行网络质量：${evt.data.uplink} / ${evt.data.downlink}`)
    store.commit('updateUplinkQuality', evt.data.uplink)
    store.commit('updateDownlinkQuality', evt.data.downlink)
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
      .on('network-quality', this.handleNetworkQuality)
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
      .off('network-quality', this.handleNetworkQuality)
  }

  reset() {
    this.isJoined = false
    if (this.localStream) {
      this.localStream.destroy()
    }
    this.unwatchUplinkDelay()
    this.localStream = undefined
    this.remoteStreams = []
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

export {
  version
}
