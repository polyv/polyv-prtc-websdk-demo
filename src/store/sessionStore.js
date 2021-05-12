export function saveStore(data = {channel: '', username: ''}) {
  sessionStorage.setItem('prtc-store', JSON.stringify(data))
}

export function loadStore() {
  const data = sessionStorage.getItem('prtc-store')
  try {
    const p = JSON.parse(data) || {channel: '', username: ''}
    console.log('sssss ', p)
    return p
  } catch (err) {
    alert('数据读取失败，请重新输入频道号及用户名')
  }
}
