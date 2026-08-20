const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tournament name is required'],
            trim: true,
        },
        game: {
            type: String,
            required: [true, 'Game is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        rules: {
            type: String,
            required: [true, 'Rules are required'],
            trim: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Organizer is required'],
        },
        registeredTeams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team',
            }
        ],
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Tournament', tournamentSchema)