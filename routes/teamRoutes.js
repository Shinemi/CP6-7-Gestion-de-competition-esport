const express = require('express')
const router = express.Router()
const { createTeam, joinTeam, addMember, removeMember , deleteTeam} = require('../controllers/teamController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/createTeam', authMiddleware, createTeam)
router.post('/:teamId/join', authMiddleware, joinTeam)
router.post('/:teamId/members', authMiddleware, addMember)
router.delete('/:teamId/members/:userId', authMiddleware, removeMember)
router.delete('/:teamId/deleteTeam', authMiddleware, deleteTeam)
module.exports = router