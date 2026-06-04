Page({
  data: {
    isEdit: false,
    mealId: '',
    name: '',
    period: 'lunch',
    date: '',
    imageUrl: '',
    imageFileId: '',
    canSubmit: false
  },

  onLoad(options) {
    // 设置默认日期为今天
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ date: todayStr })

    if (options.id) {
      this.setData({ isEdit: true, mealId: options.id })
      this.loadMeal(options.id)
    }
  },

  async loadMeal(id) {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('meals').doc(id).get()
      const meal = res.data
      this.setData({
        name: meal.name,
        period: meal.period,
        date: meal.date,
        imageUrl: meal.image,
        imageFileId: meal.image
      })
      this.checkCanSubmit()
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
    this.checkCanSubmit()
  },

  setPeriod(e) {
    this.setData({ period: e.currentTarget.dataset.period })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({ imageUrl: tempFilePath, imageFileId: '' })
        this.checkCanSubmit()
      }
    })
  },

  async uploadImage() {
    if (!this.data.imageUrl || this.data.imageFileId) {
      // 如果已有 fileId 或没有新图片，直接返回
      return this.data.imageFileId || this.data.imageUrl
    }
    const ext = this.data.imageUrl.split('.').pop() || 'jpg'
    const cloudPath = `meals/${this.data.date}/${this.data.period}_${Date.now()}.${ext}`
    const res = await wx.cloud.uploadFile({
      cloudPath,
      filePath: this.data.imageUrl
    })
    return res.fileID
  },

  checkCanSubmit() {
    const canSubmit = this.data.name.trim() && this.data.date && this.data.period && this.data.imageUrl
    this.setData({ canSubmit })
  },

  async submitMeal() {
    if (!this.data.canSubmit) return
    wx.showLoading({ title: this.data.isEdit ? '保存中' : '添加中' })
    try {
      const imageFileId = await this.uploadImage()
      const fnName = this.data.isEdit ? 'updateMeal' : 'addMeal'
      const data = {
        name: this.data.name,
        period: this.data.period,
        date: this.data.date,
        image: imageFileId
      }
      if (this.data.isEdit) {
        data.mealId = this.data.mealId
      }
      await wx.cloud.callFunction({ name: fnName, data })
      wx.showToast({ title: this.data.isEdit ? '保存成功' : '添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1000)
    } catch (err) {
      console.error('提交失败', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  }
})
