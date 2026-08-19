const Team = require('../models/teamModel')

//@desc US5 = create a new team (connected user becomes captain)
//@route POST /api/v1/team
//@access Private

const createTeam = async (req, res) => {
    try {
        const { name, game } = req.body

        if (!name || !game) {
            return res.status(400).json({ message: 'please provide all the informations' })
        }

        const existingTeam = await Team.findOne({ name })
        if (existingTeam) {
            return res.status(400).json({ message: 'team name already in use' })
        }

        const team = await Team.create({
            name,
            game,
            captain: req.user._id,
            members: [req.user._id],
        })

        res.status(201).json({
            message: 'team created successfully',
            team: {
                id: team._id,
                name: team.name,
                game: team.game,
                captain: team.captain,
                members: team.members,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error during team creation', error: error.message })
    }
}

//@desc US6 = join an existing team
//@route POST /api/v1/team/:teamId/join
//@access Private

const joinTeam = async (req, res) => {
    try {
        const { teamId } = req.params

        const team = await Team.findById(teamId)
        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }

        const isAlreadyMember = team.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        )

        if (isAlreadyMember) {
            return res.status(400).json({ message: 'you are already a member of this team' })
        }

        team.members.push(req.user._id)
        await team.save()

        res.status(200).json({
            message: 'joined team successfully',
            team: {
                id: team._id,
                name: team.name,
                game: team.game,
                captain: team.captain,
                members: team.members,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while joining team', error: error.message })
    }
}

module.exports = { createTeam, joinTeam }