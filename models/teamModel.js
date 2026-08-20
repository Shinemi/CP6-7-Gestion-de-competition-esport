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
        tournaments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tournament',
            }
        ],
    },
    {
        timestamps: true
    }
)

// s'assure que le capitaine fait toujours partie des membres
teamSchema.pre('save', function () {
    const captainId = this.captain.toString()
    const isCaptainInMembers = this.members.some(
        (memberId) => memberId.toString() === captainId
    )

    if (!isCaptainInMembers) {
        this.members.push(this.captain)
    }

})

module.exports = mongoose.model('Team', teamSchema)