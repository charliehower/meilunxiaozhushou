const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { ratingId, score, comment } = event

  if (!ratingId || !score || score < 1 || score > 5) {
    return { success: false, message: '参数错误' }
  }

  // 获取原评分记录
  const ratingRes = await db.collection('ratings').doc(ratingId).get()
  const oldRating = ratingRes.data

  // 只能修改自己的评分
  if (oldRating._openid !== OPENID) {
    return { success: false, message: '无权修改他人评分' }
  }

  const scoreDiff = score - oldRating.score

  // 更新评分记录
  await db.collection('ratings').doc(ratingId).update({
    data: {
      score,
      comment: comment !== undefined ? comment : oldRating.comment,
      updatedAt: db.serverDate()
    }
  })

  // 更新餐品统计
  const mealId = oldRating.mealId
  const mealRes = await db.collection('meals').doc(mealId).get()
  const meal = mealRes.data
  const newTotalScore = (meal.totalScore || 0) + scoreDiff
  const newAvgScore = meal.ratingCount > 0
    ? Math.round((newTotalScore / meal.ratingCount) * 10) / 10
    : 0

  await db.collection('meals').doc(mealId).update({
    data: {
      totalScore: newTotalScore,
      avgScore: newAvgScore,
      updatedAt: db.serverDate()
    }
  })

  return { success: true }
}
