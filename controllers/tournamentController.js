const Tournament = require('../models/tournamentModel')

//@desc US8 = create a new tournament (organisateur or admin only)
//@route POST /api/v1/tournament
//@access Private

const createTournament = async (req, res) => {
    try {
        const { name, game, date, rules } = req.body

        if (!name || !game || !date || !rules) {
            return res.status(400).json({ message: 'please provide all the informations' })
        }

        if (req.user.role !== 'organisateur' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'only organisateur or admin can create a tournament' })
        }

        const tournament = await Tournament.create({
            name,
            game,
            date,
            rules,
            organizer: req.user._id,
        })

        res.status(201).json({
            message: 'tournament created successfully',
            tournament: {
                id: tournament._id,
                name: tournament.name,
                game: tournament.game,
                date: tournament.date,
                rules: tournament.rules,
                organizer: tournament.organizer,
                status: tournament.status,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error during tournament creation', error: error.message })
    }
}

//@desc US9 = update a tournament I created
//@route PUT /api/v1/tournament/:tournamentId
//@access Private

const updateTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params
        const { name, game, date, rules, status } = req.body

        const tournament = await Tournament.findById(tournamentId)
        if (!tournament) {
            return res.status(404).json({ message: 'tournament not found' })
        }

        if (tournament.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'only the organizer of this tournament can update it' })
        }

        if (name) tournament.name = name
        if (game) tournament.game = game
        if (date) tournament.date = date
        if (rules) tournament.rules = rules
        if (status) {
            if (status !== 'open' && status !== 'closed') {
                return res.status(400).json({ message: 'status must be either open or closed' })
            }
            tournament.status = status
        }

        await tournament.save()

        res.status(200).json({
            message: 'tournament updated successfully',
            tournament: {
                id: tournament._id,
                name: tournament.name,
                game: tournament.game,
                date: tournament.date,
                rules: tournament.rules,
                organizer: tournament.organizer,
                status: tournament.status,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error during tournament update', error: error.message })
    }
}

//@desc US10 = delete a tournament (organisateur owner or admin)
//@route DELETE /api/v1/tournament/:tournamentId
//@access Private

const deleteTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params

        const tournament = await Tournament.findById(tournamentId)
        if (!tournament) {
            return res.status(404).json({ message: 'tournament not found' })
        }

        const isOwner = tournament.organizer.toString() === req.user._id.toString()
        const isAdmin = req.user.role === 'admin'

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'only the organizer of this tournament or an admin can delete it' })
        }

        await tournament.deleteOne()

        res.status(200).json({ message: 'tournament deleted successfully' })

    } catch (error) {
        res.status(500).json({ message: 'server error during tournament deletion', error: error.message })
    }
}

module.exports = { createTournament, updateTournament, deleteTournament }