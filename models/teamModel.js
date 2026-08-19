const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Team name is required'],
            trim: true,
            unique: true,
        },
        game: {
            type: String,
            required: [true, 'Game is required'],
            trim: true,
        },
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Captain is required'],
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
    },
    {
        timestamps: true
    }
)

// s'assure que le capitaine fait toujours partie des membres
teamSchema.pre('save', function (next) {
    const captainId = this.captain.toString()
    const isCaptainInMembers = this.members.some(
        (memberId) => memberId.toString() === captainId
    )

    if (!isCaptainInMembers) {
        this.members.push(this.captain)
    }

    next()
})

module.exports = mongoose.model('Team', teamSchema)