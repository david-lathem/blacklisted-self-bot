import { Client as selfClient } from "discord.js-selfbot-v13";

export const getGuild = (selfBot: selfClient, guildId: string) => {
  const guild = selfBot.guilds.cache.get(guildId);

  return guild;
};
