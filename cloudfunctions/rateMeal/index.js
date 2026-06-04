const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { mealId, score, comment } = event

  if (!mealId || !score || score < 1 || score > 5) {
    return { success: false, message: '参数错误' }
  }

  // 检查是否已评分
  const existRes = await db.collection('ratings').where({
    _openid: OPENID,
    mealId
  }).get()

  if (existRes.data.length > 0) {
    return { success: false, message: '您已评分，请使用修改功能' }
  }

  // 添加评分记录
  await db.collection('ratings').add({
    data: {
      _openid: OPENID,
      mealId,
      score,
      comment: comment || '',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  // 更新餐品统计（原子操作）
  const mealRes = await db.collection('meals').doc(mealId).get()
  const meal = mealRes.data
  const newRatingCount = (meal.ratingCount || 0) + 1
  const newTotalScore = (meal.totalScore || 0) + score
  const newAvgScore = Math.round((newTotalScore / newRatingCount) * 10) / 10

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
