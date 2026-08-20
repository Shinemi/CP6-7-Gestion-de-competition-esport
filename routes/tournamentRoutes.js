const express = require('express')
const router = express.Router()
const { createTournament, updateTournament, deleteTournament, registerTeam, getOpenTournaments } = require('../controllers/tournamentController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/open', authMiddleware, getOpenTournaments)
router.post('/createTournament', authMiddleware, createTournament)
router.patch('/:tournamentId/updateTournament', authMiddleware, updateTournament)
router.delete('/:tournamentId/deleteTournament', authMiddleware, deleteTournament)
router.post('/:tournamentId/register', authMiddleware, registerTeam)

module.exports = router