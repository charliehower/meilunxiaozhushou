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

  const { mealId, imageFileId } = event

  if (!mealId) {
    return { success: false, message: '缺少餐品ID' }
  }

  // 删除餐品记录
  await db.collection('meals').doc(mealId).remove()

  // 删除该餐品的所有评分
  const ratingsRes = await db.collection('ratings').where({ mealId }).get()
  const deletePromises = ratingsRes.data.map(r =>
    db.collection('ratings').doc(r._id).remove()
  )
  await Promise.all(deletePromises)

  // 删除云存储中的图片
  if (imageFileId) {
    try {
      await cloud.deleteFile({ fileList: [imageFileId] })
    } catch (e) {
      console.error('删除图片失败', e)
    }
  }

  return { success: true }
}
