const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // 查询是否已存在用户
  const userRes = await db.collection('users').where({ _openid: OPENID }).get()
  let userInfo

  if (userRes.data.length === 0) {
    // 新用户，自动注册
    const newUser = {
      _openid: OPENID,
      nickName: '',
      avatarUrl: '',
      role: 'student',
      createdAt: db.serverDate()
    }
    await db.collection('users').add({ data: newUser })
    userInfo = { ...newUser, openid: OPENID }
  } else {
    userInfo = { ...userRes.data[0], openid: OPENID }
  }

  // 检查是否为管理员
  const adminRes = await db.collection('admins').where({ _openid: OPENID }).get()
  if (adminRes.data.length > 0) {
    userInfo.role = 'admin'
    // 更新 users 集合中的角色
    await db.collection('users').doc(userInfo._id).update({
      data: { role: 'admin' }
    })
  }

  return { userInfo }
}
