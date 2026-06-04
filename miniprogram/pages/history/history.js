Page({
  data: {
    selectedDate: '',
    quickDates: [
      { label: '昨天', offset: -1, active: false },
      { label: '前天', offset: -2, active: false },
      { label: '3天前', offset: -3, active: false },
      { label: '一周前', offset: -7, active: false }
    ],
    periodList: [
      { key: 'breakfast', label: '🌅 早餐', meals: [] },
      { key: 'lunch', label: '☀️ 午餐', meals: [] },
      { key: 'dinner', label: '🌙 晚餐', meals: [] }
    ],
    loaded: false,
    hasNoMeals: false
  },

  onLoad() {
    // 默认选昨天
    this.selectQuickDate({ currentTarget: { dataset: { offset: -1 } } })
  },

  getDateStr(offset) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  selectQuickDate(e) {
    const offset = e.currentTarget.dataset.offset
    const dateStr = this.getDateStr(offset)
    const quickDates = this.data.quickDates.map(q => ({
      ...q,
      active: q.offset === offset
    }))
    this.setData({ selectedDate: dateStr, quickDates })
    this.loadMeals(dateStr)
  },

  onDateChange(e) {
    const dateStr = e.detail.value
    const quickDates = this.data.quickDates.map(q => ({ ...q, active: false }))
    this.setData({ selectedDate: dateStr, quickDates })
    this.loadMeals(dateStr)
  },

  async loadMeals(date) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMealsByDate',
        data: { date }
      })
      const meals = res.result.data || []
      const periodMap = { breakfast: 0, lunch: 1, dinner: 2 }
      const periodList = this.data.periodList.map(p => ({ ...p, meals: [] }))
      meals.forEach(meal => {
        const idx = periodMap[meal.period]
        if (idx !== undefined) periodList[idx].meals.push(meal)
      })
      this.setData({
        periodList,
        loaded: true,
        hasNoMeals: meals.length === 0
      })
    } catch (err) {
      console.error('加载历史餐品失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/meal-detail/meal-detail?id=${e.currentTarget.dataset.id}` })
  }
})
