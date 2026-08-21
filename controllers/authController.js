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
        const {name,email,password} = req.body //pas de role, grosse faille de sécurité

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
        if (!isEmailOK){
            return res.status(400).json({message: 'Provide valid email'})

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
        const user = await User.findOne({email: email.toLowerCase()}).select('+password')

        if(!user){
            return res.status(401).json({message: 'invalid credentials'})
        }

        //check password match
        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({message: 'invalid credentials'})
        }


        const token = generateToken(user._id)

        res.status(200).json({
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

//@desc US4 = update my profile (connected user)
//@route PATCH /api/v1/auth/profile
//@access Private

const updateProfile = async (req, res) => {
    try {
        const { name, password } = req.body
        // utilisateur déjà authentifié (middleware)
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        if (name) {
            user.name = name
        }

        if (password) {
            const isPasswordOK = validator.isStrongPassword(password, {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })

            if (!isPasswordOK) {
                return res.status(400).json({ message: 'le mdp doit contenir... (tout le tralala)' })
            }

            user.password = password // sera hashé automatiquement par le hook pre('save')
        }

        // note : email et role ne sont pas modifiables ici

        await user.save()

        res.status(200).json({
            message: 'profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error during profile update', error: error.message })
    }
}

//@desc US16 = update a user's role (admin only)
//@route PUT /api/v1/auth/users/:userId/role
//@access Private (admin only)

const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params
        const { role } = req.body

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'only an admin can manage user roles' })
        }

        if (!role) {
            return res.status(400).json({ message: 'please provide a role' })
        }

        const allowedRoles = ['user', 'organisateur', 'admin']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: `role must be one of : ${allowedRoles.join(', ')}` })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        user.role = role
        await user.save()

        res.status(200).json({
            message: 'user role updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while updating user role', error: error.message })
    }
}

module.exports = {register, login, updateProfile, updateUserRole}