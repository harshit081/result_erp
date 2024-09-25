require('dotenv').config()
const express = require("express")

const studentRoutes = require("./src/routes/routes.js")

const app = express()
const cors = require('cors')

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send("Test Ok")
})

app.use('/api/result',studentRoutes)



const PORT = process.env.PORT
app.listen(PORT||5000,()=>{
    console.log("server has started on port",PORT||5000)
})