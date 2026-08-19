const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware = async (req, res, next) =>{
    try {
        let token

        if(req.headers.authorization?.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1]
        }

        if(!token){
            return res.status(401).json({message: 'not authorized, token missing'})
        }

        //verify token
        const decoded = jwt.verify(token,JWT_SECRET)

        //get user from token payload
        const user = await User.findById(decoded.id)
        if(!user){
            return res.status(401).json({message: 'user no longer exist'})
        }

        req.user = user;
        next()

    } catch (error) {
        return res.status(401).json({message: 'Not authorized, invalid token', error : error.message})
    }
}



module.exports = authMiddleware