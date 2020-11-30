const Discord = require("discord.js");
const config = require("./config.json");
const radio = require("./radio.json");
const ytdl = require('ytdl-core');

let connectedChannel, dispatcher;
const client = new Discord.Client(),
    prefix = config.prefix,

    getMemberFromGuild = function (msg, userId) {
        const guild = client.guilds.cache.get(msg.guild.id),
            member = guild.members.cache.get(userId);

        if (member) {
            console.log(`Found user by id: ${member.user.tag}`)
            return member;
        } else {
            console.log(`User not found by id returning false`)
            return false;
        }
    },
    checkIfUserIsInVoiceChannel = function (msg, user) {
        if (user == null) {
            user = msg.author.id;
        }

        const member = getMemberFromGuild(msg, user)

        if (member.voice.channel) {
            msg.reply(`${member.user.tag} is connected to ${member.voice.channel.name}!`)
            console.log(`${member.user.tag} is connected to ${member.voice.channel.name}!`);
        } else {
            msg.reply(`${member.user.tag} is not connected.`)
            console.log(`${member.user.tag} is not connected.`);
        };
    }

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) {
        return;
    }
    if (msg.content.startsWith(prefix)) {
        const commandBody = msg.content.slice(prefix.length),
            args = commandBody.split(' '),
            command = args.shift().toLowerCase(),
            date = new Date();

        if (command === "help") {
            msg.channel.send(`
        These are the supported commands for this bot:

**#help** - Displays the help menu
**#playradio** - Bot start playing the first radio in the list
**#stopradio** - Bot stops playing and disconnects

All commands start with the following prefix: #
`);
        } else if (command === "invoice") {
            let user = null;

            if (args.length !== 0) {
                const args1 = args[0];
                user = args1.replace(/[^\w\s]/gi, '');
                const userNumber = Number(user);

                if (isNaN(userNumber)) {
                    user = null;
                }
            }
            checkIfUserIsInVoiceChannel(msg, user);
        } else if (command === "playradio") {
            if (msg.member.voice.channel) {
                const localConnection = await msg.member.voice.channel.join(),
                    localDispatcher = localConnection.play(radio.radiolist[0].url);
                connectedChannel = msg.member.voice.channel;
                dispatcher = localDispatcher;
              } else {
                msg.reply('You need to join a voice channel first!');
              }
        } else if (command === "stopradio") {
            if (msg.member.voice.channel) {
                connectedChannel.leave();
                dispatcher.destroy();
                connectedChannel = undefined;
                dispatcher = undefined;
              } else {
                msg.reply('You need to join a voice channel first!');
              }
        }
    } else {
        return;
    }


});

client.login(config.tokenID);