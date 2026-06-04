const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { ratingId } = event

  // 校验管理员身份
  const adminRes = await db.collection('admins').where({ _openid: OPENID }).get()
  if (adminRes.data.length === 0) {
    return { success: false, message: '无管理员权限' }
  }

  if (!ratingId) {
    return { success: false, message: '缺少评论ID' }
  }

  // 获取评分记录，以便更新餐品统计
  const ratingRes = await db.collection('ratings').doc(ratingId).get()
  const rating = ratingRes.data

  // 删除评论内容（保留评分，或完全删除）
  await db.collection('ratings').doc(ratingId).remove()

  // 更新餐品统计
  const mealId = rating.mealId
  const mealRes = await db.collection('meals').doc(mealId).get()
  const meal = mealRes.data
  const newRatingCount = Math.max(0, (meal.ratingCount || 0) - 1)
  const newTotalScore = Math.max(0, (meal.totalScore || 0) - rating.score)
  const newAvgScore = newRatingCount > 0
    ? Math.round((newTotalScore / newRatingCount) * 10) / 10
    : 0

  await db.collection('meals').doc(mealId).update({
    data: {
      ratingCount: newRatingCount,
      totalScore: newTotalScore,
      avgScore: newAvgScore,
      updatedAt: db.serverDate()
    }
  })

  return { success: true }
}
