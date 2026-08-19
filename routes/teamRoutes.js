const express = require('express')
const router = express.Router()
const { createTeam,joinTeam } = require('../controllers/teamController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/createTeam', authMiddleware, createTeam)
router.post('/:teamId/join', authMiddleware, joinTeam)

module.exports = router