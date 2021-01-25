const mongoose = require('mongoose') // импорта орм мангуст для подключения к БД
const { db } = require('../configuration') // к какой БД будем подключатся

module.exports.connectDB = () => {
    mongoose.connect(db, { useNewUrlParser: true }) // соединение с БД

    return mongoose.connection // дальше возвращаем это соединение
}
