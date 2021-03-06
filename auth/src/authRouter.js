const Router = require('express') // импортируем экспресс
const router = new Router() // импортируем роутер
const User = require('./models/User') // импортируем модель пользователя
const bcrypt = require('bcryptjs') // криптография пароля
const jwt = require('jsonwebtoken') // подключение пакета токена
const { check, validationResult } = require('express-validator') // экпресс валидатор

// function generation token
const generateToken = (id, email) => {
  const payload = { id, email }
  return jwt.sign(
    payload,
    'hhndndhcyhcjcjmn364734673g5hj565jgb6',
    {
      expiresIn: '90000h',
    }
  )
}

// authorization middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res
        .status(403)
        .json({ message: 'пользователь не авторизован' })
    }

    //тут id и email пользователя
    const payload = jwt.verify(
      token,
      'hhndndhcyhcjcjmn364734673g5hj565jgb6'
    )

    req.payload = payload

    next()
  } catch (error) {
    console.log(error)
    return res
      .status(403)
      .json({ message: 'пользователь не авторизован' })
  }
}

//роут регистрации '/auth/register'
router.post(
  '/register',
  [
    // работает как мидлвере
    check(
      'username',
      'заполните пожалуйста имя пользователя'
    ).notEmpty(),
    check(
      'email',
      'заполните пожалуйста электронную почту'
    ).notEmpty(),
    check(
      'password',
      'пароль не должен быть короче 8 символов'
    ).isLength({ min: 8, max: 100 }),
  ],
  async function registration(req, res) {
    try {
      const errors = validationResult(req.body.user) // ошибки для мидлвере

      if (!errors.isEmpty()) {
        // если ошибки при валидации
        return res
          .status(400)
          .json({ message: 'ошибка регистрации', errors })
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
        message:
          'Вы зарегистрированы, авторизуйтесь пожалуйста по почте и паролю',
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
      return res.status(400).json({
        message: `Пользователь с ${email} электронной почтой не найден`,
      })
    }

    // сравнение паролей входящего и пользователя
    const validPassword = bcrypt.compareSync(
      password,
      user.password
    )

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

// add article
router.post(
  '/addarticle',
  authMiddleware,
  async function addArticle(req, res) {
    try {
      const email = req.payload.email
      const user = await User.findOne({ email }) // находим пользователя
      const { article } = req.body
      user.userData.push(article)
      await user.save()

      const userData = user.userData

      res.status(200).json({
        userData,
      })
    } catch (error) {
      console.log(error)
    }
  }
)

router.post(
  '/deletearticle',
  authMiddleware,
  async function deleteArticle(req, res) {
    try {
      const email = req.payload.email
      const user = await User.findOne({ email }) // находим пользователя
      const { id } = req.body
      user.userData.pull({ _id: id })
      await user.save()

      const { userData } = user

      res.status(200).json({
        userData,
      })
    } catch (error) {
      console.log(error)
    }
  }
)

router.get(
  '/user',
  authMiddleware,
  async function getUsers(req, res) {
    try {
      const email = req.payload.email
      const user = await User.findOne({ email })

      res.json({
        user,
      })
    } catch (error) {
      console.log(error)
      return res
        .status(403)
        .json({ message: 'пользователь не авторизован' })
    }
  }
)

router.get(
  '/articles',
  authMiddleware,
  async function (req, res) {
    try {
      const email = req.payload.email
      const user = await User.findOne({ email })
      const { userData } = user

      res.status(200).json({
        userData,
      })
    } catch (error) {
      return res.status(403).json({
        message: 'error',
      })
    }
  }
)

module.exports = router
