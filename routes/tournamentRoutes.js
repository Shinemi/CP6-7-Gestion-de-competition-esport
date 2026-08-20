const express = require('express')
const router = express.Router()
const { createTournament, updateTournament, deleteTournament } = require('../controllers/tournamentController')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/createTournament', authMiddleware, createTournament)
router.patch('/:tournamentId/updateTournament', authMiddleware, updateTournament)
router.delete('/:tournamentId/deleteTournament', authMiddleware, deleteTournament)

module.exports = router