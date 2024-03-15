const {
    Schema,
    model
} = require('mongoose');

const timerSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    roleIdsToAdd: {
        type: [String],
        required: true
    },
    timeLimit: {
        type: Number,
        required: true
    }
});

module.exports = model('Timer', timerSchema);
