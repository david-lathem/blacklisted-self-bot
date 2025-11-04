import {
  Client,
  Guild,
  GuildMember,
  TextChannel,
} from "discord.js-selfbot-v13";
import { getMemberDb, insertMemberDb } from "../database/queries.js";
import { getGuild } from "./misc.js";

async function checkMembers(selfBotMain: Client, selfBotSecond: Client) {
  try {
    console.log("Checking!");

    // 1. Get Main Guild
    const mainGuild = getGuild(selfBotMain, process.env.MAIN_GUILD_ID);

    if (!mainGuild) return console.error(`Main Guild not found!`);

    // 2. Get Members, has perm to use op code 8 with getting all members!

    await mainGuild.members.fetch();

    const members = [...mainGuild.members.cache.values()];

    console.log(`${mainGuild.name}: ${mainGuild.members.cache.size}`);

    const targetGuildIds = process.env.BLACLISTED_GUILD_IDS.split(",");

    // 3.   Check
    for (const targetGuildId of targetGuildIds) {
      const targetGuild = getGuild(selfBotSecond, targetGuildId);

      if (!targetGuild) continue;

      const targetGuildMembers = [
        ...(await targetGuild.members.fetch()).values(),
      ];

      console.log(
        `Guild: ${targetGuild.name} (${targetGuild.id}), Members: ${targetGuildMembers.length}`
      );

      await compareMembersAndNotify(
        selfBotSecond,
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
  selfBotSecond: Client,
  mainMembers: GuildMember[],
  targetGuildMembers: GuildMember[],
  targetGuild: Guild
) {
  const notifyChannel = selfBotSecond.channels.cache.get(
    process.env.NOTIFY_CHANNEL_ID
  ) as TextChannel;

  if (!notifyChannel) return;

  let foundMembers = "";

  for (const mainMember of mainMembers) {
    if (mainMember.user.bot) continue;

    if (mainMember.id === selfBotSecond.user?.id) continue;

    if (!targetGuildMembers.find((tG) => tG.id === mainMember.id)) continue;

    if (getMemberDb.get({ guildId: targetGuild.id, memberId: mainMember.id }))
      continue;

    foundMembers += `${mainMember} (${mainMember.user.username}) (${mainMember.id})\n`;

    insertMemberDb.run({ guildId: targetGuild.id, memberId: mainMember.id });
  }

  if (!foundMembers) return;

  await notifyChannel.send(`**${targetGuild.name}**:\n${foundMembers}`);
}

export default checkMembers;
