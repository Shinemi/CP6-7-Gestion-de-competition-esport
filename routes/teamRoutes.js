const express = require('express')
const router = express.Router()
const { createTeam, joinTeam, addMember, removeMember } = require('../controllers/teamController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/createTeam', authMiddleware, createTeam)
router.post('/:teamId/join', authMiddleware, joinTeam)
router.post('/:teamId/members', authMiddleware, addMember)
router.delete('/:teamId/members/:userId', authMiddleware, removeMember)

module.exports = router