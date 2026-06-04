Page({
  data: {
    ratings: [],
    loaded: false
  },

  onShow() {
    this.loadMyRatings()
  },

  async loadMyRatings() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMyRatings',
        data: {}
      })
      const periodMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
      const ratings = (res.result.data || []).map(r => ({
        ...r,
        timeStr: this.formatTime(r.createdAt),
        mealPeriod: periodMap[r.mealPeriod] || ''
      }))
      this.setData({ ratings, loaded: true })
    } catch (err) {
      console.error('加载评分记录失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },

  goDetail(e) {
    const mealId = e.currentTarget.dataset.mealId
    wx.navigateTo({ url: `/pages/meal-detail/meal-detail?id=${mealId}` })
  }
})
