const express = require('express')
const colors = require('colors')
const morgan = require('morgan')
const dotenv = require('dotenv');
const mySqlpool = require('./config/db');


//config dotenv
dotenv.config();


//rest object 
const app = express()

//Middlewares
app.use(morgan("dev"));
app.use(express.json());


//routes

app.use('/api/v1/student',require('./routes/studentroutes'))
app.get('/test',(req,res )=>{
res.status(200).send("<h1>Welcome Student CRUD APP</h1>");

})
// PORT
const PORT = process.env.PORT || 8000

//conditionally listen
mySqlpool.query('SELECT 1').then((result) => {
         console.log(`My Sql Connected on port ${PORT}`.bgMagenta.green);

    app.listen(PORT,()=>{
        console.log(`server Running on port ${PORT}`.bgMagenta.green);
    })
    
}).catch((err) => {
     console.log(`DataBase not connected , eer: ${err} `.bgMagenta.green);
});
//listen



