const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { days } = event

  // 校验管理员身份
  const adminRes = await db.collection('admins').where({ _openid: OPENID }).get()
  if (adminRes.data.length === 0) {
    return { stats: {}, rankList: [], recentComments: [] }
  }

  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`

  // 获取时间范围内的餐品
  const mealsRes = await db.collection('meals')
    .where({ date: _.gte(startDateStr) })
    .orderBy('avgScore', 'desc')
    .limit(100)
    .get()

  const meals = mealsRes.data
  const totalMeals = meals.length
  const totalRatings = meals.reduce((sum, m) => sum + (m.ratingCount || 0), 0)
  const scoredMeals = meals.filter(m => m.avgScore > 0)
  const avgScore = scoredMeals.length > 0
    ? (scoredMeals.reduce((sum, m) => sum + m.avgScore, 0) / scoredMeals.length).toFixed(1)
    : '-'

  // 排行榜（取前20）
  const rankList = meals
    .filter(m => m.avgScore > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 20)

  // 获取最新评论
  const mealIds = meals.map(m => m._id)
  let recentComments = []
  if (mealIds.length > 0) {
    const commentsRes = await db.collection('ratings')
      .where({ mealId: _.in(mealIds), comment: _.neq('') })
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
    recentComments = commentsRes.data
  }

  // 获取评论对应的餐品名和用户名
  const commentMealIds = [...new Set(recentComments.map(c => c.mealId))]
  const commentOpenids = [...new Set(recentComments.map(c => c._openid))]

  const [mealNameRes, usersRes] = await Promise.all([
    db.collection('meals').where({ _id: _.in(commentMealIds) }).get(),
    db.collection('users').where({ _openid: _.in(commentOpenids) }).get()
  ])

  const mealNameMap = {}
  mealNameRes.data.forEach(m => { mealNameMap[m._id] = m.name })
  const userMap = {}
  usersRes.data.forEach(u => { userMap[u._openid] = u.nickName || '匿名同学' })

  recentComments = recentComments.map(c => ({
    ...c,
    mealName: mealNameMap[c.mealId] || '未知餐品',
    nickName: userMap[c._openid] || '匿名同学'
  }))

  return {
    stats: { totalMeals, totalRatings, avgScore },
    rankList,
    recentComments
  }
}
