const { Schema, model } = require('mongoose')
// импорт схемы и таблицы

const User = new Schema({
    username: { type: String, required: true }, // имя пользорвателя
    password: { type: String, required: true }, // пароль пользователя
    email: { type: String, unique: true, required: true }, // почта пользователя
    userData: [
        // ссылка на таблицу пользователя
        {
            datepost: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
        },
    ],
})

// название модели первый параметр
// второй схема на основании которой создастся
module.exports = model('User', User)
