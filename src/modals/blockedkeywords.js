const { Schema, model } = require("mongoose");

const BlockedKeywordsSchema = new Schema({
    guildId: String,
    userId: String,
    word: String
});

module.exports = model("SnowsBlockedKeywords", BlockedKeywordsSchema);
