const Discord = require("discord.js");
const config = require("./config.json");
const radio = require("./radio.json");
const ytdl = require('ytdl-core');

let connectedChannel, dispatcher, radioStationsList = []
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
    convertUserIdStringToNumber = function (args) {
        let user = null;

        if (args.length !== 0) {
            const args1 = args[0];
            user = args1.replace(/[^\w\s]/gi, '');
            const userNumber = Number(user);

            if (isNaN(userNumber)) {
                user = null;
            }
        }

        return user;
    }
    checkIfUserIsInVoiceChannel = function (msg, user) {
        if (user == null) {
            user = msg.author.id;
        }

        const member = getMemberFromGuild(msg, user)

        if (member) {
            if (member.voice.channel) {
                msg.reply(`${member.user.tag} is connected to ${member.voice.channel.name}!`)
                console.log(`${member.user.tag} is connected to ${member.voice.channel.name}!`);
            } else {
                msg.reply(`${member.user.tag} is not connected.`)
                console.log(`${member.user.tag} is not connected.`);
            };
        } else {
            msg.reply("There is no user with that ID!")
        }

    },
    showAllRadios = function (msg) {
        if (radioStationsList.length > 0) {
            msg.reply("The following radio channels/staitons are available:")
            let messageStringList = ""
            for (let i = 0; i < radioStationsList.length; i++) {
                const radio = radioStationsList[i];

                message = `${i + 1}. ${radio.display_name} \n \n`
                messageStringList = messageStringList + message;
            }
            msg.channel.send(messageStringList);
        } else {
            msg.channel.reply("There are no available radio channel/stations");
        }
    }

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    radioStationsList = radio.radiolist;
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
**#invoice** {user} - Checks if a user is connected to a voice channel, leave {user} empty to check yourself.
**#playradio** - Bot start playing the first radio in the list
**#stopradio** - Bot stops playing and disconnects
**#showradios** - A list of all the available radio channels/stations

All commands start with the following prefix: #
`);
        } else if (command === "invoice") {
            const user = convertUserIdStringToNumber(args);
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
        } else if (command === "showradios") {
            showAllRadios(msg);
        }
    } else {
        return;
    }


});

client.login(config.tokenID);