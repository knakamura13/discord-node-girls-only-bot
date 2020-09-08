/**
 *  app.js
 *
 *  Discord bot for the !poll command.
 */

/*******************
 * Library Imports *
 *******************/

require("dotenv").config();
const colors = require("chalk");
const Discord = require("discord.js");

/*********************
 * Global Properties *
 *********************/

// Config properties
const CONFIG = {
  // Bot token
  token: process.env.DISCORD_BOT_TOKEN,
  // Activity shown when the bot appears 'online'
  defaultActivity: {
    type: "PLAYING", // Activity types: 'PLAYING', 'STREAMING', 'LISTENING', 'WATCHING'
    message: "Animal Crossing",
  },
};

let activePoll = {
  creator: "",
  question: "",
  options: [], // [ "first opt", "second", "third option" ]
  votes: {}, // { 0: 5 (votes), 1: 0 (votes), ... }
  voters: [],
};

/*************
 * Functions *
 *************/

/**
 *  Handle a command from a Discord user.
 *
 *  @param  {Object}    msg         The message object.
 *  @param  {String}    cmd         The `commandName` part of the message.
 *  @param  {Array}     args        The optional list of arguments from the message.
 *
 *  @note - Discord messages which are treated as commands are expected to look like: "!commandName arg1 arg2 arg3".
 */
function handleCommand(msg, cmd, args) {
  const channel = msg.channel;
  switch (cmd) {
    case "poll":
      const lines = msg.content.split(/\r?\n/),
        question = lines[0].split(" ").slice(1).join(" "),
        pollOptions = lines.slice(1);

      // Handle direct messages
      if (channel.type === "dm") {
        if (activePoll.question) {
          // Notify the creator that the poll was created
          respondWithCurrentPollStatus(msg, question);
        } else {
          msg.reply(
            `There aren't any active polls. Use the !poll command in any channel to start one.`
          );
        }
        break;
      }

      if (pollOptions.length < 1) {
        // Show command usage when no parameters are given
        channel.send(
          `Please provide between 1 to 25 options. Options are separated by new lines. Example: \n!poll question\noption 1\noption 2\netc. ...`
        );
        break;
      }
      // Replace the active poll
      activePoll = {
        creator: msg.author.username,
        question: question,
        options: pollOptions,
        votes: {},
        voters: [],
      };

      // Notify the channel about the new poll and its options
      showNewPollCreated(channel, question, pollOptions);
      break;
    case "vote":
      // Check if this user has already voted on this poll
      const voter = msg.author.username;
      if (activePoll.voters.includes(voter)) {
        msg.reply(`You already voted!`);
        break;
      }

      // Record the poll option that was selected by the user. i.e. choiceIndex = 2 for "!vote 2"
      let choiceIndex;
      try {
        // Attempt to convert the first argument to an index of the options array
        choiceIndex = Math.floor(Number(args[0]) - 1);
      } catch (err) {}

      // Record the actual option that was voted on
      let chosenOption;
      try {
        // Attempt to retreive the selected option from the active poll
        chosenOption = activePoll.options[choiceIndex];
      } catch (err) {}

      // Show command usage on error
      if (typeof choiceIndex !== "number" || !chosenOption) {
        channel.send(
          `Please choose a number between 1 and ${activePoll.options.length}. i.e. !vote 2`
        );
        break;
      }

      // Record the voter's username to prevent duplicate votes
      activePoll.voters.push(voter);

      // Update the vote tallies
      if (activePoll.votes[chosenOption]) activePoll.votes[chosenOption] += 1;
      else activePoll.votes[chosenOption] = 1;

      console.log(`Vote received for: "${chosenOption}"`);
      break;
    default:
      break;
  }
}

function respondWithCurrentPollStatus(msg, question) {
  let res = `Current poll: `;
  res += `**${activePoll.question}**\n`;
  res += "```";
  for (const [key, val] of Object.entries(activePoll.votes)) {
    // Add each poll to the ```pre-formatted block```.
    res += `${key}: \t${val}\n`;
  }
  res += "```";
  msg.reply(res);
}

function showNewPollCreated(channel, question, pollOptions) {
  let newPollMsg = `New poll created: **${question}**\n`;
  for (let i in pollOptions) {
    let opt = pollOptions[i];
    activePoll.votes[opt] = 0;
    newPollMsg += `${Number(i) + 1}: \t${opt}\n`;
  }
  channel.send(newPollMsg);
}

/**
 *  Print a Discord message to the console with colors for readability.
 *
 *  @param  {Object}     msg     The message object.
 */
function logMessageWithColors(msg) {
  const d = new Date(msg.createdTimestamp),
    h = d.getHours(),
    m = d.getMinutes(),
    s = d.getSeconds(),
    time = colors.grey(`[${h}:${m}:${s}]`),
    author = colors.cyan(`@${msg.author.username}`);

  console.log(`${time} ${author}: ${msg.content}`);

  // Extract attachments from all messages
  for (let [key, val] of msg.attachments) {
    let { name, url } = val;
    console.log(`${name}\n${url}`);
  }
}

/**************************
 * Discord Initialization *
 **************************/

const client = new Discord.Client();

// Handle bot connected to the server
client.on("ready", () => {
  console.clear();
  console.log(colors.green(`Logged in as: ${client.user.tag}`));

  // Set the bot's activity
  client.user
    .setActivity(CONFIG.defaultActivity.message, {
      type: CONFIG.defaultActivity.type,
    })
    .then();
});

// Handle message from user
client.on("message", (msg) => {
  logMessageWithColors(msg);

  // Message is a command (preceded by an exclaimation mark)
  if (msg.content[0] === "!") {
    let words = msg.content.split(" "),
      cmd = words.shift().split("!")[1], // First word, sans exclaimation mark
      args = words; // Everything after first word as an array

    handleCommand(msg, cmd, args);
    return;
  }
});

// Login with the bot's token
client.login(CONFIG.token).then();
