const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
require('./config/db')

app.use(express.json())

//import des routes
const authRoutes = require('./routes/authRoutes')
const teamRoutes = require('./routes/teamRoutes')


//monte le routeur sur le chemin de base
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/team', teamRoutes)


// url
app.get('/', (req,res) => {
    res.send('bienvenue sur mon API RESTful !')
})

app.listen(port,() => {
    //ce console log s'affiche uniquement côté serveur et non côté client
    console.log(`Serveur lancé sur http://localhost:${port}`)
})