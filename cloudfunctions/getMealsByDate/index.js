const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { date } = event

  if (!date) {
    return { data: [] }
  }

  const res = await db.collection('meals')
    .where({ date })
    .orderBy('period', 'asc')
    .orderBy('createdAt', 'desc')
    .get()

  return { data: res.data }
}
