const mongoose = require('mongoose')
const {CS} = require('../Config/index')

const DBConnection = async () => {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(CS, {})
        console.log(`Running on ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

module.exports = DBConnection
