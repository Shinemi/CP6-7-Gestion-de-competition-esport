const mongoose = require('mongoose')

//const dbURI = "mongodb+srv;//DONNEES_DE_MONGODB" 
const dbURI = process.env.MONGODB_URI
//const dbURI = "mongodb+srv://<db_username>:<mdp>@<server>/?appName=<nom_cluster>"

mongoose.connect(dbURI)
    .then(() => console.log("connexion à mongoDB reussie"))
    .catch(error => console.error("erreur de connexion a mongoDB:",error))

    //si vous n'intégrez pas le code dans app.js, on fait l'export
module.exports = mongoose.connection