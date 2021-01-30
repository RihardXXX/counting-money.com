const Router = require('express') // импортируем экспресс
const router = new Router() // импортируем роутер
const User = require('./models/User') // импортируем модель пользователя
const bcrypt = require('bcryptjs') // криптография пароля
const jwt = require('jsonwebtoken') // подключение пакета токена
const { check, validationResult } = require('express-validator') // экпресс валидатор
const authMiddleware = require('./middleware')

// функция генерации токена
const generateToken = (id, email) => {
  const payload = { id, email }
  return jwt.sign(payload, 'hhndndhcyhcjcjmn364734673g5hj565jgb6', { expiresIn: '90000h' }) // генерация токена и сколько жить будет
}

//роут регистрации '/auth/register'
router.post(
  '/register',
  [
    // работает как мидлвере
    check('username', 'заполните пожалуйста имя пользователя').notEmpty(),
    check('email', 'заполните пожалуйста электронную почту').notEmpty(),
    check('password', 'пароль не должен быть короче 8 символов').isLength({ min: 8, max: 100 }),
  ],
  async function registration(req, res) {
    try {
      const errors = validationResult(req.body.user) // ошибки для мидлвере

      if (!errors.isEmpty()) {
        // если ошибки при валидации
        return res.status(400).json({ message: 'ошибка регистрации', errors })
      }

      // вытаскиваем имя, почту и пароль с тела запроса
      const { email, password, username } = req.body.user

      const candidate = await User.findOne({ email })
      if (candidate) {
        return res.status(400).json({
          message: 'Пользователь с такой почтой существует',
        })
      }

      const hashPassword = bcrypt.hashSync(password, 7) //хеширование пароля

      // Доработать этот блок
      const user = new User({
        // создаём пользователя
        username: username,
        password: hashPassword,
        email: email,
        userData: [
          // инициализация первой транзакции
          {
            datepost: '00.00.0000',
            name: 'тестовая запись',
            price: 0,
          },
        ],
      })

      await user.save() // сохраняем пользователя
      return res.json({
        message: 'Вы зарегистрированы, авторизуйтесь пожалуйста по почте и паролю',
      })
    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: 'Registration error',
        error: error,
      })
    }
  }
)

router.post('/login', async function login(req, res) {
  try {
    const { email, password } = req.body.user

    const user = await User.findOne({ email }) // если есть пользователь с Этой почтой то возвращаем его

    if (!user) {
      return res
        .status(400)
        .json({ message: `Пользователь с ${email} электронной почтой не найден` })
    }

    // сравнение паролей входящего и пользователя
    const validPassword = bcrypt.compareSync(password, user.password)

    if (!validPassword) {
      // если пароли введеный и с БД не совпадают
      return res.status(400).json({
        message: `введённый вами пароль ${password} неверный, пожалуйста введите друго пароль`,
      })
    }

    const token = generateToken(user._id, user.email) // генерируем токен

    return res.json({ token, user }) // возвращаем токен
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: 'Login error',
      error: error,
    })
  }
})

// router.post('/addarticle', async function login(req, res) {
//   try {
//     const { text } = req.body.article
//     const { user } = req.body.user

//     const token = req.headers.authorization.split(' ')[1]
//     if (!token) {
//       return res.status(403).json({ message: 'пользователь не авторизован' })
//     }

//     //тут id и email пользователя
//     const payload = jwt.verify(token, 'hhndndhcyhcjcjmn364734673g5hj565jgb6')
//     // const user = await User.findOne({ payload.email })
//     const email = payload.email
//     const user = await User.findOne({ email })

//     // const user = await User.findOne({ email }) // если есть пользователь с Этой почтой то возвращаем его

//     // if (!user) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: `Пользователь с ${email} электронной почтой не найден` })
//     // }

//     // // сравнение паролей входящего и пользователя
//     // const validPassword = bcrypt.compareSync(password, user.password)

//     // if (!validPassword) {
//     //   // если пароли введеный и с БД не совпадают
//     //   return res.status(400).json({
//     //     message: `введённый вами пароль ${password} неверный, пожалуйста введите друго пароль`,
//     //   })
//     // }

//     // const token = generateToken(user._id, user.email) // генерируем токен

//     // return res.json({ token, user }) // возвращаем токен
//   } catch (error) {
//     console.log(error)
//     res.status(400).json({
//       message: 'Login error',
//       error: error,
//     })
//   }
// })

router.get('/user', async function getUsers(req, res) {
  try {
    // ['Token', 'eyJhbGciOiJIUzI1Ni']
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(403).json({ message: 'пользователь не авторизован' })
    }

    //тут id и email пользователя
    const payload = jwt.verify(token, 'hhndndhcyhcjcjmn364734673g5hj565jgb6')
    // const user = await User.findOne({ payload.email })
    const email = payload.email
    const user = await User.findOne({ email })

    res.json({
      user,
    })
  } catch (error) {
    console.log(error)
    return res.status(403).json({ message: 'пользователь не авторизован' })
  }
})

// router.get('/admin', authMiddleware, async function getUsers(req, res) {
//   try {
//     // Распечатка списка пользователей и 3 пользователя
//     User.find(function (err, users) {
//       if (err) return console.error(err)
//       // console.log(users, '======', users[2])
//       users.forEach((element) => {
//         console.log(element)
//       })
//     })
//     res.json(' server work')
//   } catch (error) {
//     console.log(error)
//   }
// })

module.exports = router
