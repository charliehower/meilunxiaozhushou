const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // 获取我的评分记录
  const ratingsRes = await db.collection('ratings')
    .where({ _openid: OPENID })
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()

  const ratings = ratingsRes.data

  // 获取关联的餐品信息
  if (ratings.length === 0) {
    return { data: [] }
  }

  const mealIds = [...new Set(ratings.map(r => r.mealId))]
  const mealsRes = await db.collection('meals').where({
    _id: db.command.in(mealIds)
  }).get()
  const mealMap = {}
  mealsRes.data.forEach(m => { mealMap[m._id] = m })

  const periodMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }

  const result = ratings.map(r => {
    const meal = mealMap[r.mealId] || {}
    return {
      ...r,
      mealName: meal.name || '已删除的餐品',
      mealDate: meal.date || '',
      mealPeriod: meal.period || ''
    }
  })

  return { data: result }
}
