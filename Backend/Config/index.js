const dotenv = require('dotenv').config()

const PORT = process.env.port;
const CS = process.env.cs;
const secret_acce_key = process.env.secret_acce_key;
const refresh_key = process.env.refresh_key;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH


module.exports = {
    PORT,
    CS,
    secret_acce_key,
    refresh_key,
    BACKEND_SERVER_PATH
}

