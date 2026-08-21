const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const port = 3000

require('dotenv').config()
require('./config/db')



// Helmet : sécurisation des headers HTTP
app.use(
    helmet({
        //la CSP (content security policy)
        //pour une api purement JSON, on désactive la CSP
        contentSecurityPolicy: false,
        //si votre API interagit avec d'autres domaines
        crossOriginResourcePolicy:{policy:"cross-origin"}
    })
)

// CORS : autorise les requêtes venant du frontend
const corsoptions = {
    origin: ['http://localhost:3000']
}
app.use(cors(corsoptions))

// Rate limit global
const limiter = rateLimit({
    windowMs: 15*60*1000, // fenetre de 15 minutes
    limit:100, // max 100 requetes par IP sur ce créneau
    message: {status : 429,error: 'trop de requete, ressayez plus tard'}
})

app.use(limiter)

// Middleware
app.use(express.json())


// Routes
const authRoutes = require('./routes/authRoutes')
const teamRoutes = require('./routes/teamRoutes')
const tournamentRoutes = require('./routes/tournamentRoutes')

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/team', teamRoutes)
app.use('/api/v1/tournament', tournamentRoutes)


// Route principale
app.get('/', (req, res) => {
    res.send('bienvenue sur mon API RESTful !')
})


app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`)
})