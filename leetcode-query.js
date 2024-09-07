require('dotenv').config();
const {LeetCode} =require('leetcode-query')
const{convert, htmlToText}=require('html-to-text')

const { EmbedBuilder } = require('discord.js');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const date = new Date();

const leetcode = new LeetCode();

async function name() {
    const  user = await leetcode.daily();
    const questiontitle=user.question.title
    const description=user.question.content
    const link="https://leetcode.com"+user.link
  
    const des=htmlToText(description,130)
    return{des,link,questiontitle}
}
name()

var items = Array("here's today's leetcode question:-", "alright, we have a new daily question let's see who can do this:-", "hey hey,you know what time it is?? it's leetcode daily question time let's see whether you have what it takes to solve it", "Its time for today's leetcode question:-", "Hey, haven't you solved today's leetcode question yet ?? Its the time!!!")
var item = items[Math.floor(Math.random() * items.length)];

client.on('ready', async () => {
  if (date.getHours() === 18) {
    const {des,link,questiontitle} = await name();
    if (link) {
      const coloring = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(questiontitle)
        .setURL(link)
        .setDescription(des)
      client.channels.cache.get("1237466068281458742").send("@everyone" + "  " + item);
      client.channels.cache.get("1237466068281458742").send({ embeds: [coloring] });
    }
  }
})
client.login(process.env.DISCORD_TOKEN);