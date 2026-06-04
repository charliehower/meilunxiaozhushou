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

  const { mealId, name, period, date, image } = event

  if (!mealId) {
    return { success: false, message: '缺少餐品ID' }
  }

  const updateData = { updatedAt: db.serverDate() }
  if (name) updateData.name = name
  if (period) updateData.period = period
  if (date) updateData.date = date
  if (image) updateData.image = image

  await db.collection('meals').doc(mealId).update({ data: updateData })

  return { success: true }
}
