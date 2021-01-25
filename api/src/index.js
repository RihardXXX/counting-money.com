const express = require('express') // испортируем фреймворк
const app = express() //  создаём объект
const mongoose = require('mongoose')
const axios = require('axios')
const { connectDB } = require('./helper/db') // импортируем мангус
const { port, host, db, authApiUrl } = require('./configuration') // импортируем хост и порт
//
const a = 5
const startServer = () => {
    app.listen(port, () => {
        // слушаем 3000 порт и запускаем колбек
        console.log(`Started api service port ${port}`)
        console.log(`click link http://localhost:${port}/`)
        console.log(`My Host ${host}`)
        console.log(`My rrrrrrrrr database ${db}`)
    })
}

app.get('/test', (req, res) => {
    // роутер get запрос
    res.send('API server is working correctly')
})

app.get('/testapidata', (req, res) => {
    res.json({
        testwithapi: true,
    })
})

app.get('/testwithcurrentuser', (req, res) => {
    axios.get(authApiUrl + '/currentUser').then((response) => {
        res.json({
            testwithcurrentuser: true,
            currentUserFromAuth: response.data,
        })
    })
})

connectDB()
    .on('error', console.log) // если ошибка то говорим об ошибке подключения
    .on('disconnected', connectDB) // если случайно отключились от БД перезапускаем её
    .once('open', startServer) // если удачно подключились к БД то запускаем сервер
