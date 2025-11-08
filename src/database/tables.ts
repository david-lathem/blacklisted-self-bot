import db from "./index.js";

db.exec(`
CREATE TABLE IF NOT EXISTS guild_members (
    memberId TEXT NOT NULL,
    guildId  TEXT NOT NULL,
    lastMentionedAt Int NOT NULL,
    PRIMARY KEY (memberId, guildId)
);
`);
