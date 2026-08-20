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

module.exports = { createTournament }