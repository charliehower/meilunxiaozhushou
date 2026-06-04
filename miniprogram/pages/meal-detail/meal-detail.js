Page({
  data: {
    meal: null,
    periodLabel: '',
    myRating: null,
    tempScore: 0,
    comment: '',
    ratings: []
  },

  onLoad(options) {
    this.mealId = options.id
    this.loadMealDetail()
  },

  async loadMealDetail() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMealDetail',
        data: { mealId: this.mealId }
      })
      const { meal, ratings, myRating } = res.result
      const periodMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
      const processedRatings = (ratings || []).map(r => ({
        ...r,
        timeStr: this.formatTime(r.createdAt)
      }))
      this.setData({
        meal,
        periodLabel: periodMap[meal.period] || '',
        ratings: processedRatings,
        myRating,
        tempScore: myRating ? myRating.score : 0,
        comment: myRating ? (myRating.comment || '') : ''
      })
    } catch (err) {
      console.error('加载详情失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },

  setScore(e) {
    const score = e.currentTarget.dataset.score
    this.setData({ tempScore: score })
  },

  onCommentInput(e) {
    this.setData({ comment: e.detail.value })
  },

  async submitRating() {
    if (this.data.tempScore === 0) return
    wx.showLoading({ title: '提交中' })
    try {
      const fnName = this.data.myRating ? 'updateRating' : 'rateMeal'
      const data = {
        mealId: this.mealId,
        score: this.data.tempScore,
        comment: this.data.comment
      }
      if (this.data.myRating) {
        data.ratingId = this.data.myRating._id
      }
      await wx.cloud.callFunction({ name: fnName, data })
      wx.showToast({ title: this.data.myRating ? '修改成功' : '评分成功', icon: 'success' })
      this.loadMealDetail()
    } catch (err) {
      console.error('评分失败', err)
      wx.showToast({ title: '评分失败', icon: 'none' })
    }
  },

  previewImage() {
    if (this.data.meal && this.data.meal.image) {
      wx.previewImage({
        urls: [this.data.meal.image],
        current: this.data.meal.image
      })
    }
  }
})
