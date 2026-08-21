const express = require ('express')
const router = express.Router()
const {register,login,updateProfile, updateUserRole} = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')


router.post('/register', register)
router.post('/login', login)
router.patch('/updateProfile', authMiddleware, updateProfile)
router.put('/users/:userId/role', authMiddleware, updateUserRole)

module.exports = router