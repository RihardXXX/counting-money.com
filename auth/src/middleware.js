const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  // if (req.method === 'OPTIONS') {
  //   next()
  // }

  try {
    console.log(req.headers.authorization)
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(403).json({ message: 'пользователь не авторизован' })
    }

    //тут id и email пользователя
    const payload = jwt.verify(token, 'hhndndhcyhcjcjmn364734673g5hj565jgb6')

    req.user = payload

    next()
  } catch (error) {
    console.log(error)
    return res.status(403).json({ message: 'пользователь не авторизован' })
  }
}
