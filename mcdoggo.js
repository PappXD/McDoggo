const Discord = require('discord.js');
const bot = new Discord.Client();
const { Users, CurrencyShop, PremiumUsers } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
const p = new Discord.Collection();
const db = require('quick.db');
const snekfetch = require('snekfetch');
const ms = require('parse-ms');

const prefix = "m!";
const token = "NjM4MzQwMDA2MjY3NzE1NTg0.Xnbfjg.Fj7wgztZfst3si9ZE_EYLMJmxV0"; // what was i doing back then LMFAOOO

bot.on('ready', async () => {
    console.log("McDoggo is now online!")
    bot.user.setActivity(`${bot.users.size} users! | m!help`, { type: "WATCHING"}).catch(console.log());
    const userData = await Users.findAll();
    userData.forEach(b => currency.set(b.user_id, b));
})

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(p, 'add', {
	value: async function add(id, amount) {
		const user = p.get(id);
		if (user) {
			user.p += Number(amount);
			return user.save();
		}
		const newUser = await PremiumUsers.create({ user_id: id, premium: amount });
		p.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(p, 'getPremium', {
	value: async function getPremium(id) {
		const user = p.get(id);
		return user ? user.premium : 0;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

bot.on('message', async message => {

    if(!message.content.startsWith(prefix)) return;

    const input = message.content.slice(prefix.length).trim();

    if (message.author.bot) return;

    const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

    if (!message.guild) return;

    let args = message.content.substring(prefix.length).split(" ");

    switch(args[0]) {
        case 'h':
        case 'help':
            let helpArgs = args.slice(1).join(" ");
            const help1Embed = new Discord.RichEmbed()
                .setTitle('McDoggo\'s Available Modules')
                .setDescription('All available modules on Spam.')
                .setThumbnail(bot.user.avatarURL)
                .setColor('YELLOW')
                .addField('Utility Commands', '`m!help utility`', true)
                .addField('Currency Commands', '`m!help currency`', true)
                .addField('Image Commands', '`m!help image`', true)
                .addField('Moderation Commands', '`m!help moderation`', true)
                .addField('Fun Commands', '`m!help fun`', true)
                .addField('NSFW Commands', '`m!help nsfw`', true)
                .addField('Music Commands', '`m!help music`', true)
            const utilEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ Utility Commands')
                .setDescription('`m!about`,`s!help`,`s!info`')
            const modEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ Moderation Commands')
                .setDescription('`s!ban`,`s!kick`,`s!mute`')
            const moneyEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ Currency Commands')
                .setDescription('`s!balance`,`s!search`,`s!gamble`,`s!rob`,`s!daily`,`s!weekly`,`s!work`,`s!deposit`,`s!withdraw`')
            const imageEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ Image Commands')
                .setDescription('`s!doggo`,`s!meme`,`s!avatar`')
            const nsfwEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ NSFW Commands')
                .setDescription('`s!cutegirl`')
            const musicEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ Music Commands')
                .setDescription('`s!play`,`s!skip`,`s!stop`')
            if (!args[1]) {
                message.channel.sendEmbed(help1Embed);
            } else if (args[1] === 'utility') {
                message.channel.sendEmbed(utilEmbed);
            } else if (args[1] === 'currency') {
                message.channel.sendEmbed(moneyEmbed);
            } else if (args[1] === 'moderation') {
                message.channel.sendEmbed(modEmbed);
            } else if (args[1] === 'image') {
                message.channel.sendEmbed(imageEmbed);
            } else if (args[1] === 'nsfw') {
                message.channel.sendEmbed(nsfwEmbed);
            } else if (args[1] === 'music') {
                message.channel.sendEmbed(musicEmbed);
            } else message.channel.send('No modules found about `' + helpArgs + '`')
        break;
        case 'about':
            let days = 0;
            let week = 0;
            let uptime = ``;
            let totalSeconds = (bot.uptime / 1000);
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.floor(totalSeconds % 60);
        
            if(hours > 23){
                days = days + 1;
                hours = 0;
            }
        
            if(days == 7){
                days = 0;
                week = week + 1;
            }
        
            if(week > 0){
                uptime += `${week} week, `;
            }
        
            if(minutes > 60){
                minutes = 0;
            }
        
            uptime += `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds!`;
            
            const aboutEmbed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('✮ About Spam')
                .setThumbnail(bot.user.avatarURLs)
                .setDescription('helo i am a bot developed by vipeyy#7818\nmy prefix is `s!`')
                .addField('Developer', '`vipeyy#7818`, `Swofty#0001`')
                .addField('Uptime', '`' + uptime + '`')
                .setFooter('i like cheese')
            message.channel.sendEmbed(aboutEmbed);
        break;
        case 'info':
            message.channel.send('big thanks to swofty for being amazing with databases')
        break;
        case 'purge':
            if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You do not have enough permissions to use this command!')
            if (args[1] > 100) return ('I\'m sorry but it can\'t be higher than 100...')
            let msgArgs4 = args.slice(1).join(" ");
            if(!args[1]) return message.reply('Please specify a number! 1 - 100')
            message.delete(1); await message.channel.bulkDelete(args[1])
            message.channel.send(`Successfully purged ${args[1]} messages!`).then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, 2500); // delete after 2.5 seconds (reminder)
            }) 
            console.log(`[CLEAR] ${message.author.username} cleared ${msgArgs4} messages.`);
        break;
        case 'cutegirl':
            const cgmsg = await message.channel.send('This may take some seconds...');
            let res = await snekfetch.get('http://api.cutegirls.moe/json');
            if (res.body.status !== 200) {
                return message.channel.send('An error occurred while processing this command! Error ID: `' + `1` + '`');
            }
            let animepicembed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('Here ya go some cute girl images!')
                .setImage(res.body.data.image)
                .setFooter(`Requested by ${message.author.tag}`)
                .setTimestamp();
            cgmsg.edit(animepicembed);
        break;
        case 'hentai':
            const boomsg = await message.channel.send('This may take some seconds...');
            let resz = await snekfetch.get('https://nekos.life/api/v2/img/Random_hentai_gif')
            if (resz.body.status !== 200) {
                return boomsg.edit('An error occurred while processing this command! Error ID: `' + `1` + '`');
            }
            let booembed = new Discord.RichEmbed()
                .setColor('YELLOW')
                .setTitle('Have some hentai pics.')
                .setImage(res.body.data.image)
                .setFooter(`Requested by ${message.author.tag}`)
                .setTimestamp();
            boomsg.edit(booembed);
        break;
        case 'latency':
        case 'ping':
            const pingmsg = await message.channel.send('Pinging...')
            const pingEmbed = new Discord.RichEmbed()
            .setTitle('✮ Ping')
            .setColor('YELLOW')
            .addField('Bot\'s Latency','`' + `${Math.floor(message.createdAt - message.createdAt)}` + '` ms')
            .addField('API\'s Latency','`' + `${Math.floor(bot.ping)}` + '` ms')
            pingmsg.edit(pingEmbed);
        break;
        case 'play':
        case 'p':
            function play(connection, message) {
                var server = servers[message.guild.id];

                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}))

                server.queue.shift();

                server.dispatcher.on("end", function(){
                    if(server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                    }
                })
            }
            if (!args[1]) {
                message.channel.send('You need to provide a link!')
                return;
            }
            if (!message.member.voiceChannel) {
                message.channel.send('You must be in a voice channel to use this command!')
                return;
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];
            
            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            })
            message.channel.send('Now playing: `' + args[1] + '`')
        break;
        case 's':
        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.channel.send('Skipped! >>')
        break;
        case 'stop':
            if (message.guild.voiceConnection) {
                for(var i = server.queue.length -1; i >=0; i--) {
                    server.queue.splice(i, 1);
                }
                
                server.dispatcher.end();
            }

            if(message.guild.connection) message.guild.voiceConnection.disconnect();
        break;
        case 'bal':
        case 'balance':
            const target = message.mentions.users.first() || message.author;
            message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}💰`);
        break;
        case 'inv':
        case 'inventory':
            const target1 = message.mentions.users.first() || message.author;
            const user = await Users.findOne({ where: { user_id: target1.id } });
            const items = await user.getItems();

            if (!items.length) return message.channel.send(`${target1.tag} has nothing!`);
            essage.channel.send(`${target1.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
        break;
        case 'give':
        case 'transfer':
        case 'pay':
            const currentAmount = currency.getBalance(message.author.id);
            const transferAmount = args[3];
            const transferTarget = message.mentions.users.first();

            if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
            if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author}, you only have ${currentAmount}.`);
            if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

            currency.add(message.author.id, -transferAmount);
            currency.add(transferTarget.id, transferAmount);

            message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);  
        break;
        case 'shop':
        case 'store':
            const items1 = await CurrencyShop.findAll();
            message.channel.send(items1.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });
        break;
        case 'lb':
        case 'rich':
        case 'top':
        case 'leaderboards':
            const lbEmbed = new Discord.RichEmbed()
                .setTitle('Richest users!')
                .setDescription(currency.sort((a, b) => b.balance - a.balance)
		        .filter(user => bot.users.has(user.user_id))
		        .first(10)
		        .map((user, position) => `${position + 1}. **${(bot.users.get(user.user_id).tag)}** - ${user.balance}💰`)
                .join('\n'))
                message.channel.send(lbEmbed)
        break;
        case 'status':
            if (message.author.id !== '300105681745346562') return message.channel.send('Nooo! only my leader can do that!')
            if(!args[2]) return message.channel.send("Please provide something!");
            var statusmsg = "Successfully sent the status!";
            let status = args.slice(2).join(' ');
            let coStatus = args[1];
            let channelStatus = bot.channels.find(channel => channel.name === "bot-status");
            let statuEmbed = new Discord.RichEmbed()
                .setColor(coStatus)
                .setTitle('✮ Bot Status')
                .setThumbnail(bot.user.avatarURL)
                .setDescription(status)
                .setTimestamp()
            channelStatus.send(statuEmbed);
            message.channel.send(statusmsg);
        break;
        case 'daily':
            let timeout = 86400000 // 24 hours in milliseconds, change if you'd like.
            let daily = await db.fetch(`daily_${message.author.id}`);
        
            if (daily !== null && timeout - (Date.now() - daily) > 0) {
                let time = ms(timeout - (Date.now() - daily));
        
                message.channel.send(`You already collected your daily reward, you can come back and collect it in **${time.hours}h ${time.minutes}m ${time.seconds}s**!`)
            } else {
                currency.add(message.author.id, 500)
                message.channel.send('You have received your daily 500💰!')
                db.set(`daily_${message.author.id}`, Date.now())
            }
        break;
        case 'weekly':
            if (!p.getPremium(message.author.id)) return message.channel.send('This command is only available to premium users!\nIf you would like to have premium, contact **vipeyy#7818**!')
            let timeout1 = 604800000 // 7 days in milliseconds, change if you'd like.
            let weekly = await db.fetch(`daily_${message.author.id}`);
        
            if (weekly !== null && timeout1 - (Date.now() - weekly) > 0) {
                let time1 = ms(timeout1 - (Date.now() - weekly));
        
                message.channel.send(`You already collected your weekly reward, you can come back and collect it in **${time1.days}d ${time1.hours}h ${time1.minutes}m ${time1.seconds}s**!`)
            } else {
                currency.add(message.author.id, 1000)
                message.channel.send('You have received your weekly 1000💰!')
                db.set(`weekly_${message.author.id}`, Date.now())
            }
        break;
        case 'setp':
        case 'setpremium':
            const pTarget = message.mentions.users.first();
            if (message.author.id !== '300105681745346562') return message.channel.send('Nooo! only my leader can do that!')
            p.add(pTarget.id, 1)
            message.channel.send(`Successfully set ${pTarget.tag} as a premium user!`)
        break;
    }
})

bot.login(token);
