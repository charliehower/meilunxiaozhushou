const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { mealId } = event

  if (!mealId) {
    return { meal: null, ratings: [], myRating: null }
  }

  // 获取餐品详情
  const mealRes = await db.collection('meals').doc(mealId).get()
  const meal = mealRes.data

  // 获取该餐品的所有评分（分页取最新50条）
  const ratingsRes = await db.collection('ratings')
    .where({ mealId })
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  // 查询当前用户对该餐品的评分
  const myRatingRes = await db.collection('ratings').where({
    _openid: OPENID,
    mealId
  }).get()

  // 获取评分用户信息
  const ratings = ratingsRes.data
  const openids = [...new Set(ratings.map(r => r._openid))]
  const usersRes = await db.collection('users').where({
    _openid: db.command.in(openids)
  }).get()
  const userMap = {}
  usersRes.data.forEach(u => { userMap[u._openid] = u })

  const enrichedRatings = ratings.map(r => ({
    ...r,
    nickName: userMap[r._openid] ? userMap[r._openid].nickName : '匿名同学'
  }))

  return {
    meal,
    ratings: enrichedRatings,
    myRating: myRatingRes.data.length > 0 ? myRatingRes.data[0] : null
  }
}
