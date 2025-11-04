import { setTimeout } from "node:timers/promises";

// import { Client, GatewayIntentBits } from "discord.js";
import { Client as selfClient } from "discord.js-selfbot-v13";

import "./database/tables.js";
import checkMembers from "./utils/checker.js";
// import { getMainGuild } from "./utils/misc.js";

// const discordBot = new Client({
//   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
// });

const selfBot = new selfClient({}); // is in 100k server

// discordBot.on("clientReady", async (readyDiscordBot) => {
//   console.log(`Bot: ${readyDiscordBot.user.username} is ready!`);

//   const guild = getMainGuild(readyDiscordBot);
//   await guild.members.fetch();

//   console.log(`Fetched ${guild.members.cache.size} members in ${guild.name}`);

//   while (true) {
//     try {
//       await checkMembers(discordBot, selfBot);
//     } catch (error) {
//       console.error(error);
//     }
//   }
// });

selfBot.on("ready", async (readySelfBot) => {
  console.log(`Account: ${readySelfBot.user.username} is ready!`);

  while (true) {
    await checkMembers(selfBot);
    await setTimeout(1000 * 60 * 10);
  }
});

// discordBot.login(process.env.DISCORD_BOT_TOKEN);
selfBot.login(process.env.ACCOUNT_TOKEN_MAIN);
