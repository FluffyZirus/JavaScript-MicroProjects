const Discord = require("discord.js");
const readline = require("readline");
const Path = require("path");

const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_VOICE_STATES);
const client = new Discord.Client({ intents: myIntents });
var guildID = "";
var mainGuild = null;

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


/**
 * @param {string} token
 */
function startBot(token){
    client.login(token)
}


client.once('ready', () => {
    console.log('Bot Is Running');
    guildID = client.guilds.cache.map(guild => guild.id)[0];
    console.log('Current mainGuild: ' + client.guilds.cache.map(guild => guild.name)[0]);
    mainGuild = client.guilds.cache.get(guildID);
    let commands;
    if(mainGuild){
        commands = mainGuild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands.create({
        name: 'all-hands',
        description: 'Brings everyone to all hands vc',
    });
    commands.create({
        name: 'general-quarters',
        description: 'Sends everyone to general quarters vc',
    });
    commands.create(
    {
        name: 'return-stations',
        description: 'Returns everyone back to where they were before all-hands (unless they already left all hands vc)',
    });
    commands.create({
        name: 'register-stations',
        description: 'Saves everyones position for general quarters',
    });
});
registeredStations = {}

previousStations = {}
previousAllHands = null

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()){
        return;
    }

    const {commandName, options, member} = interaction;
    if (commandName === 'all-hands'){
        interaction.guild.channels.cache.map(channel => channel)[0];
        vcs = interaction.guild.channels.cache.map(channel => channel).filter(channel => channel.type === "GUILD_VOICE" )
        allHandsvc = vcs.shift()
        previousAllHands = allHandsvc;
        previousStations = {}
        vcs.forEach(channel => {
            channel.members.map(member => member).forEach(member => {
                previousStations[member.id] = member.voice.channelId
                member.voice.setChannel(allHandsvc);
            });
        });
        interaction.reply("Moved all hands")
    }else if (commandName === 'return-stations'){
        if(previousAllHands === null){
            interaction.reply("please run an all hands command first")
            return;
        }
        previousAllHands.members.map(member => member).forEach(member => {
            if(member.id in previousStations){
                member.voice.setChannel(previousStations[member.id]);
            }
        })
        interaction.reply("Returned all hands")
    }else if (commandName === 'register-stations'){
        vcs = interaction.guild.channels.cache.map(channel => channel).filter(channel => channel.type === "GUILD_VOICE" )
        registeredStations = {}
        vcs.forEach(channel => {
            channel.members.map(member => member).forEach(member => {
                registeredStations[member.id] = member.voice.channelId
            });
        });
        interaction.reply(JSON.stringify(registeredStations))
    }else if (commandName === 'general-quarters'){
        if(registeredStations === null){
            interaction.reply("please run register-stations or load in console first")
            return;
        }
        vcs = interaction.guild.channels.cache.map(channel => channel).filter(channel => channel.type === "GUILD_VOICE" )
        vcs.forEach(channel => {
            if(member.id in registeredStations){
                member.voice.setChannel(registeredStations[member.id]);
            }
        })
        interaction.reply("Returned all hands")
    }
    
});


function recieveCommand(){
    reader.question(">>>>: ", function(command){  
        let args = command.split(/\s+/)
        if (command == "stop"){
            client.destroy();
            reader.close();
            return;
        }else if(args[0] == "load"){
            console.log(command.substring(7, command.length -1))
            //registeredStations = JSON.parse(command.substring(6, command.length -1))
        }else if(args[0] == "print"){
            console.log(registeredStations)
        }
        recieveCommand();
    });
}


function main(){
    reader.on('close', function () {
        console.log('\nShuting Down');
        client.destroy();
        process.exit(0);
    });
    //reader.question("Bot Token: ", function(command){
    //    startBot(command);
    //    recieveCommand();
    //})

    startBot("///TOKEN HERE///");
    recieveCommand();
}
  

main();
