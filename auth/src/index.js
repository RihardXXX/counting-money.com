const express = require('express') // испортируем фреймворк
const app = express() //  создаём объект
const axios = require('axios')
const { connectDB } = require('./helper/db') // импортируем мангус
const { port, host, db, apiUrl } = require('./configuration') // импортируем хост и порт
const authRouter = require('./authRouter')

app.use(express.json()) // работа с json
app.use('/', authRouter) // главный путь для маршрутизации

app.get('/currentUser', (req, res) => {
    res.json({
        id: '123',
        email: 'foo@gmail.com',
    })
})

// запрос к api
// - API_URL=http://api:3001/api + '/testapidata'
app.get('/testwithapidata', (req, res) => {
    axios.get(apiUrl + '/testapidata').then((response) => {
        // в ответ кладём данные с другого сервиса
        res.json({
            testapidata: response.data.testwithapi,
        })
    })
})

const startServer = () => {
    try {
        app.listen(port, () => {
            // слушаем 3000 порт и запускаем колбек
            console.log(`Started AUTH service port ${port}`)
            console.log(`click link http://localhost:${port}/`)
            console.log(`My Host ${host}`)
            console.log(`My database ${db}`)
        })
    } catch (error) {
        console.log(error)
    }
}

connectDB()
    .on('error', console.log) // если ошибка то говорим об ошибке подключения
    .on('disconnected', connectDB) // если случайно отключились от БД перезапускаем её
    .once('open', startServer) // если удачно подключились к БД то запускаем сервер
