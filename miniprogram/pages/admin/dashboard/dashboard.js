Page({
  data: {
    todayMeals: [],
    todayMealCount: 0,
    todayRatingCount: 0,
    todayAvgScore: '-'
  },

  onShow() {
    this.loadDashboard()
  },

  getTodayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  async loadDashboard() {
    const date = this.getTodayStr()
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMealsByDate',
        data: { date }
      })
      const meals = res.result.data || []
      const periodMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
      const todayMeals = meals.map(m => ({
        ...m,
        periodLabel: periodMap[m.period] || m.period
      }))
      const totalRatings = meals.reduce((sum, m) => sum + (m.ratingCount || 0), 0)
      const scoredMeals = meals.filter(m => m.avgScore > 0)
      const avgScore = scoredMeals.length > 0
        ? (scoredMeals.reduce((sum, m) => sum + m.avgScore, 0) / scoredMeals.length).toFixed(1)
        : '-'

      this.setData({
        todayMeals,
        todayMealCount: meals.length,
        todayRatingCount: totalRatings,
        todayAvgScore: avgScore
      })
    } catch (err) {
      console.error('加载管理面板失败', err)
    }
  },

  goAddMeal() {
    wx.navigateTo({ url: '/pages/admin/meal-edit/meal-edit' })
  },

  goStats() {
    wx.navigateTo({ url: '/pages/admin/stats/stats' })
  },

  editMeal(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/admin/meal-edit/meal-edit?id=${id}` })
  },

  deleteMeal(e) {
    const id = e.currentTarget.dataset.id
    const image = e.currentTarget.dataset.image
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除该餐品？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' })
          try {
            await wx.cloud.callFunction({
              name: 'deleteMeal',
              data: { mealId: id, imageFileId: image }
            })
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadDashboard()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
