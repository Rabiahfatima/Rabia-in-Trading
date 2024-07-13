const express = require('express')
const DBConnection = require('./database/index')
const router = require('./routes/index')
const erorHandling  = require('./middleware/errorHandler')
const {PORT} = require('./Config/index')
const cookieParser = require('cookie-parser')

const app = express();

DBConnection();

app.get('/', (req, res) => {
   res.send('Home Page'); // Use res.send instead of res.write
 });
 
 app.use(cookieParser());
 app.use(express.json()); 
 app.use(router);
 app.use(erorHandling);

 app.listen(PORT, ()=>{
    console.log(`Port  is running on: ${PORT}`)
 });
