Page({
  data: {
    filterDays: 7,
    stats: {
      totalMeals: 0,
      totalRatings: 0,
      avgScore: '-'
    },
    rankList: [],
    recentComments: []
  },

  onLoad() {
    this.loadStats()
  },

  setFilter(e) {
    const days = Number(e.currentTarget.dataset.days)
    this.setData({ filterDays: days })
    this.loadStats()
  },

  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getStats',
        data: { days: this.data.filterDays }
      })
      const result = res.result
      const periodMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
      const rankList = (result.rankList || []).map(item => ({
        ...item,
        periodLabel: periodMap[item.period] || item.period
      }))
      const recentComments = (result.recentComments || []).map(item => ({
        ...item,
        timeStr: this.formatTime(item.createdAt)
      }))
      this.setData({
        stats: result.stats || { totalMeals: 0, totalRatings: 0, avgScore: '-' },
        rankList,
        recentComments
      })
    } catch (err) {
      console.error('加载统计失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },

  deleteComment(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确认删除该评论？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'deleteComment',
              data: { ratingId: id }
            })
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadStats()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
