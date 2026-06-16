const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    targetRole: String,
    targetCompany: String,

    readinessScore: Number,

    skillGaps: [String],

    roadmap: [
        {
            period: String,
            focus: String,
            activities: [String]
        }
    ],

    projects: [
        {
            _id: false,
            name: String,
            description: String
        }
    ],

    completedActivities: [String]

}, {
    timestamps: true
});

module.exports = mongoose.model("Analysis", AnalysisSchema);