const Team = require('../models/teamModel')
const User = require('../models/userModel')
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

//@desc US7 = add a member to my team (captain only)
//@route POST /api/v1/team/:teamId/members
//@access Private
 
const addMember = async (req, res) => {
    try {
        const { teamId } = req.params
        const { email } = req.body
 
        if (!email) {
            return res.status(400).json({ message: 'please provide an email' })
        }
 
        const team = await Team.findById(teamId)
        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }
 
        //seul le capitaine peut gerer les membres
        if (team.captain.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'only the captain can manage team members' })
        }
 
        const userToAdd = await User.findOne({ email })
        if (!userToAdd) {
            return res.status(404).json({ message: 'user not found' })
        }
 
        const isAlreadyMember = team.members.some(
            (memberId) => memberId.toString() === userToAdd._id.toString()
        )
 
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'this user is already a member of the team' })
        }
 
        team.members.push(userToAdd._id)
        await team.save()
 
        res.status(200).json({
            message: 'member added successfully',
            team: {
                id: team._id,
                name: team.name,
                game: team.game,
                captain: team.captain,
                members: team.members,
            }
        })
 
    } catch (error) {
        res.status(500).json({ message: 'server error while adding member', error: error.message })
    }
}
 
//@desc US7 = remove a member from my team (captain only)
//@route DELETE /api/v1/team/:teamId/members/:userId
//@access Private
 
const removeMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params
 
        const team = await Team.findById(teamId)
        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }
 
        //seul le capitaine peut gerer les membres
        if (team.captain.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'only the captain can manage team members' })
        }
 
        //le capitaine ne peut pas se retirer lui-meme de cette facon
        if (userId === team.captain.toString()) {
            return res.status(400).json({ message: 'captain cannot remove themselves from the team' })
        }
 
        const isMember = team.members.some(
            (memberId) => memberId.toString() === userId
        )
 
        if (!isMember) {
            return res.status(404).json({ message: 'this user is not a member of the team' })
        }
 
        team.members = team.members.filter(
            (memberId) => memberId.toString() !== userId
        )
 
        await team.save()
 
        res.status(200).json({
            message: 'member removed successfully',
            team: {
                id: team._id,
                name: team.name,
                game: team.game,
                captain: team.captain,
                members: team.members,
            }
        })
 
    } catch (error) {
        res.status(500).json({ message: 'server error while removing member', error: error.message })
    }
}
 
//@desc US14 = delete a team (admin only)
//@route DELETE /api/v1/team/:teamId/deleteTeam
//@access Private

const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'only an admin can delete a team' })
        }

        const team = await Team.findById(teamId)
        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }

        //nettoyer les references de cette equipe dans les tournois ou elle etait inscrite
        await Tournament.updateMany(
            { registeredTeams: team._id },
            { $pull: { registeredTeams: team._id } }
        )

        await team.deleteOne()

        res.status(200).json({ message: 'team deleted successfully' })

    } catch (error) {
        res.status(500).json({ message: 'server error while deleting team', error: error.message })
    }
}

//@desc US17 = view a team's composition and info (any connected user)
//@route GET /api/v1/team/:teamId/teamDetails
//@access Private

const getTeamDetails = async (req, res) => {
    try {
        const { teamId } = req.params

        const team = await Team.findById(teamId)
            .populate('captain', 'name role')
            .populate('members', 'name role')

        if (!team) {
            return res.status(404).json({ message: 'team not found' })
        }

        res.status(200).json({
            team: {
                id: team._id,
                name: team.name,
                game: team.game,
                captain: team.captain,
                members: team.members,
            }
        })

    } catch (error) {
        res.status(500).json({ message: 'server error while fetching team details', error: error.message })
    }
}

module.exports = { createTeam, joinTeam, addMember, removeMember, deleteTeam, getTeamDetails }