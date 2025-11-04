declare global {
  namespace NodeJS {
    interface ProcessEnv {
      //   DISCORD_BOT_TOKEN: string;
      ACCOUNT_TOKEN: string;
      // ACCOUNT_TOKEN_SECOND: string;
      MAIN_GUILD_ID: string;
      NOTIFY_CHANNEL_ID: string;
      ROLE_IDS: string;
      BLACLISTED_GUILD_IDS: string;
    }
  }
}

// // If this file has no import/export statements (i.e. is a script)
// // convert it into a module by adding an empty export statement.
export {};
