const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // 校验管理员身份
  const adminRes = await db.collection('admins').where({ _openid: OPENID }).get()
  if (adminRes.data.length === 0) {
    return { success: false, message: '无管理员权限' }
  }

  const { name, period, date, image } = event

  if (!name || !period || !date || !image) {
    return { success: false, message: '参数不完整' }
  }

  const result = await db.collection('meals').add({
    data: {
      name,
      period,
      date,
      image,
      avgScore: 0,
      ratingCount: 0,
      totalScore: 0,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  return { success: true, _id: result._id }
}
