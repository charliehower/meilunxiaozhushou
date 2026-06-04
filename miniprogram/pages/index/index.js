Page({
  data: {
    todayStr: '',
    weekdayStr: '',
    periodList: [
      { key: 'breakfast', label: '🌅 早餐', meals: [] },
      { key: 'lunch', label: '☀️ 午餐', meals: [] },
      { key: 'dinner', label: '🌙 晚餐', meals: [] }
    ],
    isAdmin: false
  },

  onLoad() {
    this.setData({ isAdmin: getApp().globalData.isAdmin })
    this.setTodayInfo()
    this.loadMeals()
  },

  onShow() {
    const isAdmin = getApp().globalData.isAdmin
    if (isAdmin !== this.data.isAdmin) {
      this.setData({ isAdmin })
    }
  },

  onPullDownRefresh() {
    this.loadMeals().then(() => wx.stopPullDownRefresh())
  },

  setTodayInfo() {
    const now = new Date()
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    this.setData({
      todayStr: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
      weekdayStr: weekdays[now.getDay()]
    })
  },

  async loadMeals() {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMealsByDate',
        data: { date: dateStr }
      })
      const meals = res.result.data || []
      const periodMap = { breakfast: 0, lunch: 1, dinner: 2 }
      const periodList = this.data.periodList.map(p => ({ ...p, meals: [] }))
      meals.forEach(meal => {
        const idx = periodMap[meal.period]
        if (idx !== undefined) {
          periodList[idx].meals.push(meal)
        }
      })
      this.setData({ periodList })
    } catch (err) {
      console.error('加载餐品失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onImageError(e) {
    // 图片加载失败时不做特殊处理，wxss 中设了默认背景色
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/meal-detail/meal-detail?id=${id}` })
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/dashboard/dashboard' })
  }
})
