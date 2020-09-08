# Discord Node Girls Only Bot

A simple Discord bot made with Node.js for the Girls Only server.

## Prerequisites

Install [Node.js](https://nodejs.org/en/download/)

## Getting started

Install the project dependencies: `npm install`

Create a Discord bot
 - Create a new bot using the [Developer Portal](https://discordapp.com/developers/applications/) ([Instructions](https://discordjs.guide/preparations/setting-up-a-bot-application.html))
 - Copy the bot token
 - Set the `token` property in the `CONFIG` object

Add your bot to a server
 - Create an invite link for your bot ([Instructions](https://discordjs.guide/preparations/adding-your-bot-to-servers.html))
 - Send your invite link to the server owner and have them grant access to the bot

Note that your bot will automatically listen in on *all* channels if you have given it admin privelages.

*This is the CONFIG object mentioned above:*

    // Config properties
    const CONFIG = {
        token: "TOKEN GOES HERE", // Note: use .env files with the dotenv package to protect your secrets.
    };

## Dependencies

    "chalk": "^4.1.0",
    "discord.js": "^12.3.1"
