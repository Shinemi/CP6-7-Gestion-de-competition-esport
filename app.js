const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
require('./config/db')


//import des routes
const authRoutes = require('./routes/authRoutes')


//monte le routeur sur le chemin de base
app.use('/api/v1/auth', authRoutes)


// url
app.get('/', (req,res) => {
    res.send('bienvenue sur mon API RESTful !')
})

app.listen(port,() => {
    //ce console log s'affiche uniquement côté serveur et non côté client
    console.log(`Serveur lancé sur http://localhost:${port}`)
})