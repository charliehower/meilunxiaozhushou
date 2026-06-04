// 云开发环境初始化配置
// 在微信开发者工具中打开项目后，请按以下步骤操作：
// 
// 1. 配置 AppID
//    打开 project.config.json，将 appid 字段修改为你的小程序 AppID
//
// 2. 开通云开发
//    在微信开发者工具中点击「云开发」按钮，创建云环境
//    环境名称建议：meilunxiaozhushou
//
// 3. 创建数据库集合
//    在云开发控制台 → 数据库，创建以下4个集合：
//    - meals（餐品集合）
//    - ratings（评分集合）
//    - users（用户集合）
//    - admins（管理员白名单集合）
//
// 4. 配置数据库权限
//    meals：    所有人可读，仅创建者可写
//    ratings：  所有人可读，仅创建者可写
//    users：    仅创建者可读写
//    admins：   仅管理端可读写
//
// 5. 部署云函数
//    在 cloudfunctions 目录下，对每个云函数文件夹右键 → 上传并部署
//    需要部署的云函数：
//    login / addMeal / updateMeal / deleteMeal / rateMeal
//    updateRating / getMealsByDate / getMealDetail / getMyRatings / getStats / deleteComment
//
// 6. 添加管理员
//    先用小程序打开一次（会自动注册用户），然后在云开发控制台 → 数据库 → users 集合
//    找到你的 _openid，将其添加到 admins 集合中
//
// 7. TabBar 图标
//    请将6张图标文件放到 miniprogram/images/ 目录下：
//    tab-home.png / tab-home-active.png
//    tab-calendar.png / tab-calendar-active.png
//    tab-user.png / tab-user-active.png
//    图标尺寸建议 81x81px
