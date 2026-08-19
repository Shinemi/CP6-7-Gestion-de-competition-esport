const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const validator = require('validator')


const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '24h'

const generateToken = (id) => {
    return jwt.sign({id}, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    })
}

//@desc US1 = Register a new user
//@route POST /api/v1/auth/register
//@access Public

const register = async (req,res) =>  {
    try {
        const {name,email,password,role} = req.body

        if(!name || !email || !password){
            return res.status(400).json({message: 'please provide all the informations'})
        }

        const isPasswordOK= validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase:1,
            minUppercase:1,
            minNumbers:1,
            minSymbols:1
        }) // return soit true soit false

        if (!isPasswordOK){
            return res.status(400).json({message: 'le mdp doit contenit... (tout le tralala)'})
        }

        //verif si cest un mail
        const isEmailOK = validator.isEmail(email)
        if (!email){
            return res.status(400).json({message: 'Provide valid email)'})

        }
        //check if user exist
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message :'email already in use'})
        }

        //create new user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
        })

        const token = generateToken(user._id)

        res.status(201).json({
            message : 'User registered successfully',
            token,
            user:{
                id: user._id,
                name: user.name,
                email : user.email,
                role : user.role,
            }
        })

    } catch (error) {
        res.status(500).json({message: 'server error during registration', error: error.message})
    }
}


//@desc US2 = login user and get token
//@route POST /api/v1/auth/login
//@access Public

const login = async (req,res) =>{
    try {

        const {email, password} =req.body

        if(!email || !password){
            return res.status(400).json({message: 'please provide email and pwd'})
        }

        //find user and explicitely select password field
        const user = await User.findOne({email}).select('+password')

        if(!user){
            return res.status(401).json({message: 'invalid credentials'})
        }

        //check password match
        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({message: 'invalid credentials'})
        }


        const token = generateToken(user._id)

        res.status(201).json({
            message : 'Login succesful',
            token,
            user:{
                id: user._id,
                name: user.name,
                email : user.email,
                role : user.role,
            }
        })

        
    } catch (error) {
        res.status(500).json({message: 'server error during login', error: error.message})
    }
}

module.exports = {register, login}