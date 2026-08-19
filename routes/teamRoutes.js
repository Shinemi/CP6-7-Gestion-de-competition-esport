const express = require('express')
const router = express.Router()
const { createTeam } = require('../controllers/teamController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/createTeam', authMiddleware, createTeam)

module.exports = router