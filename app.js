const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
require('./config/db')

const startServer = async () => {
    await connectDB()

    //créer les tables si elle n'existent pas
    await sequelize.sync({alter : false})
    console.log('tables synchronized')
}

//import des routes
const authRoutes = require('./routes/authRoutes')


//monte le routeur sur le chemin de base
app.use('/api/v1/auth', authRoutes)

startServer()

// url
app.get('/', (req,res) => {
    res.send('bienvenue sur mon API RESTful !')
})

app.listen(port,() => {
    //ce console log s'affiche uniquement côté serveur et non côté client
    console.log(`Serveur lancé sur http://localhost:${port}`)
})