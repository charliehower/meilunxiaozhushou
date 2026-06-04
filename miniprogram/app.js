App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'meilunxiaozhushou-d8dek87faf8ef4',
        traceUser: true
      })
    }
    // 登录并获取用户信息
    this.getUserInfo()
  },

  getUserInfo() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.userInfo = res.result.userInfo
        this.globalData.isAdmin = res.result.userInfo.role === 'admin'
      },
      fail: err => {
        console.error('登录失败', err)
      }
    })
  },

  globalData: {
    userInfo: null,
    isAdmin: false
  }
})
