import { DbMember } from "../typings/types.js";
import db from "./index.js";

export const insertMemberDb = db.prepare<DbMember>(`
    INSERT OR IGNORE INTO guild_members (memberId, guildId, lastMentionedAt)
    VALUES (@memberId, @guildId, @lastMentionedAt)
`);

export const getMemberDb = db.prepare<
  Omit<DbMember, "lastMentionedAt">,
  DbMember
>(`
    SELECT * FROM guild_members
    WHERE memberId = @memberId AND guildId = @guildId
`);
