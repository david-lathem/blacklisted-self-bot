import {
  Client,
  Guild,
  GuildMember,
  TextChannel,
} from "discord.js-selfbot-v13";
import { getMemberDb, insertMemberDb } from "../database/queries.js";
import { getGuild } from "./misc.js";

async function checkMembers(selfBot: Client) {
  try {
    console.log("Checking!");

    // 1. Get Main Guild
    const mainGuild = getGuild(selfBot, process.env.MAIN_GUILD_ID);

    if (!mainGuild) return console.error(`Main Guild not found!`);

    // 2. Get Members, has perm to use op code 8 with getting all members!

    if (mainGuild.memberCount !== mainGuild.members.cache.size) {
      console.log(
        `Fetching members in main, count not correct ${mainGuild.memberCount} ${mainGuild.members.cache.size}`
      );
      await mainGuild.members.fetch();
    }

    const members = [...mainGuild.members.cache.values()];

    console.log(`${mainGuild.name}: ${mainGuild.members.cache.size}`);

    const targetGuildIds = process.env.BLACLISTED_GUILD_IDS.split(",");

    // 3.   Check
    for (const targetGuildId of targetGuildIds) {
      const targetGuild = getGuild(selfBot, targetGuildId);

      if (!targetGuild) continue;

      if (targetGuild.memberCount !== targetGuild.members.cache.size) {
        console.log(
          `Fetching members in target ${targetGuild.name}, count not correct ${targetGuild.memberCount} ${targetGuild.members.cache.size}`
        );
        await targetGuild.members.fetch();
      }

      const targetGuildMembers = [...targetGuild.members.cache.values()];

      console.log(
        `Guild: ${targetGuild.name} (${targetGuild.id}), Members: ${targetGuildMembers.length}`
      );

      await compareMembersAndNotify(
        selfBot,
        members,
        targetGuildMembers,
        targetGuild
      );
    }
  } catch (error) {
    console.error(error);
  }
}

async function compareMembersAndNotify(
  selfBot: Client,
  mainMembers: GuildMember[],
  targetGuildMembers: GuildMember[],
  targetGuild: Guild
) {
  const notifyChannel = selfBot.channels.cache.get(
    process.env.NOTIFY_CHANNEL_ID
  ) as TextChannel;

  if (!notifyChannel) return;

  let foundMembers = "";

  for (const mainMember of mainMembers) {
    if (mainMember.user.bot) continue;

    if (process.env.BLACKLISTED_USER_IDS.split(",").includes(mainMember.id))
      continue;

    if (mainMember.id === selfBot.user?.id) continue;

    const roleIds = process.env.ROLE_IDS.split(",").map((id) => id.trim());

    if (!roleIds.some((roleId) => mainMember.roles.cache.has(roleId))) continue;

    if (!targetGuildMembers.find((tG) => tG.id === mainMember.id)) continue;

    const dbRow = getMemberDb.get({
      guildId: targetGuild.id,
      memberId: mainMember.id,
    });

    if (dbRow && dbRow.lastMentionedAt + 1000 * 60 * 60 * 24 > Date.now())
      continue;

    foundMembers += `${mainMember} (${mainMember.user.username}) (${mainMember.id})\n`;

    insertMemberDb.run({
      guildId: targetGuild.id,
      memberId: mainMember.id,
      lastMentionedAt: Date.now(),
    });
  }

  if (!foundMembers) foundMembers = "Not found any user";

  const chunkSize = 1900;

  for (let i = 0; i < foundMembers.length; i += chunkSize) {
    const chunk = foundMembers.slice(i, i + chunkSize);
    await notifyChannel.send(`**${targetGuild.name}**:\n${chunk}`);
  }
}

export default checkMembers;
