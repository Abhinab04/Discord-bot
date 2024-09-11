require('dotenv').config();
const { LeetCode } = require('leetcode-query')
const express = require('express')
const { htmlToText } = require('html-to-text')

const app = express();
const port = 3000;

const { EmbedBuilder, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, Component } = require('discord.js');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})



const leetcode = new LeetCode();
var con = '';

async function name() {
  const user = await leetcode.daily();
  const questiontitle = user.question.title
  const description = user.question.content
  const link = "https://leetcode.com" + user.link
  const des = htmlToText(description, 130)
  return { des, link, questiontitle }
}

let hints_des = "";
let hints_desc = "";
let total_hints = ""
let hints_not_found = "No hints are provided"
async function question(con) {
  const problem = await leetcode.problem(con)
  const search_link = "https://leetcode.com/problems/" + con

  const search_des = problem.content
  const search_d = htmlToText(search_des, 130)
  const search_title = problem.title
  return { search_d, search_title, search_link }
}

async function hints(con) {
  hints_des = "";
  hints_desc = "";
  total_hints = ""
  const problems = await leetcode.problem(con)
  const hint_len = problems.hints.length
  if (hint_len === 0) {
    return { hints_not_found, hint_len }
  }
  if (hint_len > 0) {
    for (let i = 1; i < hint_len; i++) {
      hints_desc = hints_desc + `${i + 1}) ||${(htmlToText(problems.hints[i]))} ||\n`
    }
    hints_des = hints_des + `${1}) ${(htmlToText(problems.hints[0]))} \n`
    total_hints = total_hints + hints_des + hints_desc
    return { total_hints, hint_len }
  }
}


let dailydes = ""
let dailydesc = ""
let total_daily_hints = ""
async function dailyHints() {
  dailydes = ""
  dailydesc = ""
  total_daily_hints = ""
  const recent_hin = await leetcode.daily();
  const recent_titleSlug = recent_hin.question.titleSlug
  const daily_hints =await leetcode.problem(recent_titleSlug);
  const daily_hints_len = daily_hints.hints.length
  if (daily_hints_len === 0) {
    return { hints_not_found, daily_hints_len }
  }
  if (daily_hints_len > 0) {
    for (let i = 1; i < daily_hints_len; i++) {
      dailydes = dailydes + `${i + 1}) ||${(htmlToText(daily_hints.hints[i]))} ||\n`
    }
    dailydesc = dailydesc + `${1}) ${(htmlToText(daily_hints.hints[0]))} \n`
    total_daily_hints = total_daily_hints + dailydes + dailydesc
    console.log(total_daily_hints)
    return { total_daily_hints, daily_hints_len }
  }
}




client.on('messageCreate', async (msg) => {

  if (msg.author.bot) {
    return
  }

  if (msg.content === '/daily') {
    const { des, link, questiontitle } = await name();
    if (link) {
      const coloring = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(questiontitle)
        .setURL(link)
        .setDescription(des)
      const confirms = new ButtonBuilder()
        .setCustomId('showdailyhints')
        .setLabel('Hints')
        .setStyle(ButtonStyle.Primary)
      const row = new ActionRowBuilder()
        .addComponents(confirms);
      client.channels.cache.get("1237466068281458742").send("here is today's daily problem :-");
      client.channels.cache.get("1237466068281458742").send({ embeds: [coloring] });
      client.channels.cache.get("1237466068281458742").send({ components: [row] });
    }
  }

  const args = msg.content.split(' ');
  const command = args[0];
  const search = args[1];
  const prob = args[2]

  con = prob;

  if (command === "/question") {
    if (search === "search") {
      if (prob === con) {

        const { search_d, search_title, search_link } = await question(con);
        if (search_link) {

          const coloring = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle(search_title)
            .setURL(search_link)
            .setDescription(search_d)
          const confirm = new ButtonBuilder()
            .setCustomId('show-hints')
            .setLabel('Hints')
            .setStyle(ButtonStyle.Primary)
          const row = new ActionRowBuilder()
            .addComponents(confirm);

          client.channels.cache.get("1237466068281458742").send("Your searched question");
          client.channels.cache.get("1237466068281458742").send({ embeds: [coloring] });
          client.channels.cache.get("1237466068281458742").send({ components: [row] });
        }
      }
    }
  }
})

client.on("interactionCreate", async (iinteraction) => {
  var { total_daily_hints, daily_hints_len, hints_not_found } = await dailyHints();
  if (iinteraction.customId === 'showdailyhints') {
    if (daily_hints_len > 0) {

      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(total_daily_hints)
      interaction.reply({
        content: "Hints :-",
        embeds: [embed]
      })
    }
    else {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(hints_not_found)
      iinteraction.reply({
        content: "Hints :-",
        embeds: [embed]
      })
    }
  }
})



client.on("interactionCreate", async (interaction) => {
  var { total_hints, hints_not_found, hint_len } = await hints(con);
  if (interaction.customId === 'show-hints') {
    if (hint_len > 0) {

      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(total_hints)
      interaction.reply({
        content: "Hints :-",
        embeds: [embed]
      })
    }
    else {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(hints_not_found)
      interaction.reply({
        content: "Hints :-",
        embeds: [embed]
      })
    }
  }
})

client.login(process.env.DISCORD_TOKEN);

app.get('/', (req, res) => {
  res.send("<h1>leetbot deployment</h1>")
})

app.listen(port, () => {
  console.log("port is listening :3000")
})