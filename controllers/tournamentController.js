const mongoose = require('mongoose')
const Tournament = require('../models/tournamentModel')
const Team = require('../models/teamModel')

//@desc US8 = create a new tournament (organisateur or admin only)
//@route POST /api/v1/tournament/createTournament
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
//@route PATCH /api/v1/tournament/:tournamentId/updateTournament
//@access Private

const updateTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({ message: 'invalid tournament id' })
        }
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
//@route DELETE /api/v1/tournament/:tournamentId/deleteTournament
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
        await Team.updateMany(
            { tournaments: tournament._id },
            { $pull: { tournaments: tournament._id } }
        )

        res.status(200).json({ message: 'tournament deleted successfully' })

    } catch (error) {
        res.status(500).json({ message: 'server error during tournament deletion', error: error.message })
    }
}

//@desc US11 = register my team to a tournament (any team member)
//@route POST /api/v1/tournament/:tournamentId/register
//@access Private

const registerTeam = async (req, res) => {
    try {
        const { tournamentId } = req.params
        const { teamId } = req.body

        if (!mongoose.Types.ObjectId.isValid(tournamentId) || !mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: 'invalid tournament or team id' })
        }

        if (!teamId) {
            return res.status(400).json({ message: 'please provide a teamId' })
        }

        const tournament = await Tournament.findById(tournamentId)
        if (!tournament) {
            return res.status(404).json({ message: 'tournament not found' })
        }

        if (tournament.status !== 'open') {
            return res.status(400).json({ message: 'this tournament is not open for registration' })
        }

        const team = await Team.findById(teamId)
        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }

        const isMember = team.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        )

        if (!isMember) {
            return res.status(403).json({ message: 'you must be a member of this team to register it' })
        }

        const isAlreadyRegistered = tournament.registeredTeams.some(
            (id) => id.toString() === team._id.toString()
        )

        if (isAlreadyRegistered) {
            return res.status(400).json({ message: 'this team is already registered to this tournament' })
        }

        tournament.registeredTeams.push(team._id)
        team.tournaments.push(tournament._id)

        await tournament.save()
        await team.save()

        res.status(200).json({
            message: 'team registered to tournament successfully',
            tournament: {
                id: tournament._id,
                name: tournament.name,
                registeredTeams: tournament.registeredTeams,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error during team registration', error: error.message })
    }
}

//@desc US12 = list all tournaments open for registration
//@route GET /api/v1/tournament/open
//@access Private

const getOpenTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: 'open' })
            .select('name game date rules organizer status')

        res.status(200).json({
            count: tournaments.length,
            tournaments,
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while fetching open tournaments', error: error.message })
    }
}

//@desc US13 = view teams registered to a tournament I organize
//@route GET /api/v1/tournament/:tournamentId/teams
//@access Private

const getRegisteredTeams = async (req, res) => {
    try {
        const { tournamentId } = req.params

        const tournament = await Tournament.findById(tournamentId)
            .populate('registeredTeams', 'name game captain members')

        if (!tournament) {
            return res.status(404).json({ message: 'tournament not found' })
        }

        if (tournament.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'only the organizer of this tournament can view registered teams' })
        }

        res.status(200).json({
            count: tournament.registeredTeams.length,
            teams: tournament.registeredTeams,
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while fetching registered teams', error: error.message })
    }
}

//@desc US15 = view participation stats (number of teams registered per tournament)
//@route GET /api/v1/tournament/stats
//@access Private (admin only)

const getParticipationStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'only an admin can view participation stats' })
        }

        const stats = await Tournament.aggregate([
            {
                $project: {
                    name: 1,
                    game: 1,
                    date: 1,
                    status: 1,
                    teamCount: { $size: '$registeredTeams' },
                }
            },
            { $sort: { teamCount: -1 } }
        ])

        res.status(200).json({
            count: stats.length,
            stats,
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while fetching participation stats', error: error.message })
    }
}

module.exports = {  
                    createTournament, 
                    updateTournament, 
                    deleteTournament, 
                    registerTeam, 
                    getOpenTournaments, 
                    getRegisteredTeams, 
                    getParticipationStats 
                }