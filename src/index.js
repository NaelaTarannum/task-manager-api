
const express = require("express");
const mongoose = require('mongoose');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');
const auth = require('./middleware/auth')
const app = express();

//register a new middleware 

app.use(express.json());
app.use('/users',require('../src/routes/users.routes'));
app.use('/tasks',require('../src/routes/tasks.routes'));




const PORT = process.env.PORT ;
app.listen(PORT,()=>{
    console.log("SERVER RUNNING ON "+PORT);
})


