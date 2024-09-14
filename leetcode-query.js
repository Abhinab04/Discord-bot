require('dotenv').config();
const { LeetCode } = require('leetcode-query')
const express = require('express')
const { htmlToText } = require('html-to-text')
const mongoose = require('mongoose')

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

const User = require("./models/Users")

//mongodb connection string
const db = require('./config/key').MongoURI;

//mongodb connection
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("mongodb connect")
  })
  .catch(err => console.log(err))



const leetcode = new LeetCode();
var con = '';
let adddes = ""
async function names() {
  adddes = ""
  const user = await leetcode.daily();
  const questiontitle = user.question.title
  const description = user.question.content
  const link = "https://leetcode.com" + user.link
  const des = htmlToText(description, 130)
  const daily_titleSlug = user.question.titleSlug
  const dailydifficulty = await leetcode.problem(daily_titleSlug);
  const diff = dailydifficulty.difficulty
  adddes = adddes + "Difficulty :-" + diff + "\n\n" + des
  return { adddes, link, questiontitle }
}

let hints_des = "";
let hints_desc = "";
let total_hints = ""
let hints_not_found = "No hints are provided"
let total = ""
async function question(con) {
  total = ""
  const problem = await leetcode.problem(con)
  const search_link = "https://leetcode.com/problems/" + con
  const difficulty = problem.difficulty
  const search_des = problem.content
  const search_d = htmlToText(search_des, 130)
  const search_title = problem.title
  total = total + "Difficulty :-" + difficulty + "\n\n" + search_d
  return { search_d, search_title, search_link, total }
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
  const daily_hints = await leetcode.problem(recent_titleSlug);
  const daily_hints_len = daily_hints.hints.length
  if (daily_hints_len === 0) {
    return { hints_not_found, daily_hints_len }
  }
  if (daily_hints_len > 0) {
    for (let i = 1; i < daily_hints_len; i++) {
      dailydes = dailydes + `${i + 1}) ||${(htmlToText(daily_hints.hints[i]))} ||\n`
    }
    dailydesc = dailydesc + `${1}) ${(htmlToText(daily_hints.hints[0]))} \n`
    total_daily_hints = total_daily_hints + dailydesc + dailydes
    return { total_daily_hints, daily_hints_len }
  }
}

//function for adding user in databse
async function adduser(username) {

  try {
    const user = await User.findOne({ name: username })
    if (!user) {
      const newUser = new User({ name: username })
      await newUser.save()
      return { usersaved: "username added succesfully" }
    }
    else {
      return { userexist: "username already exist" }
    }
  }
  catch (err) {
    console.log(err)
  }
}

let namess = "";

client.on('messageCreate', async (msg) => {

  if (msg.author.bot) {
    return
  }

  if (msg.content === '/daily') {
    const { adddes, link, questiontitle } = await names();
    if (link) {
      const coloring = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(questiontitle)
        .setURL(link)
        .setDescription(adddes)
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

        const { search_title, search_link, total } = await question(con);
        if (search_link) {

          const coloring = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle(search_title)
            .setURL(search_link)
            .setDescription(total)
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

  const adds = args[0];
  namess = args[1];

  if (adds === "/add") {
    if (namess != undefined) {
      const result = await adduser(namess)
      if (result.userexist) {
        msg.reply("User already exist")
      }
      if (result.usersaved) {
        msg.reply("User saved")
      }
    }
  }
})




client.on("interactionCreate", async (interaction) => {


  if (interaction.customId === 'show-hints') {
    var { total_hints, hints_not_found, hint_len } = await hints(con);
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


  if (interaction.customId === 'showdailyhints') {
    var { total_daily_hints, daily_hints_len, hints_not_found } = await dailyHints();
    if (interaction.customId === 'showdailyhints') {
      if (daily_hints_len > 0) {

        const dailyss = new EmbedBuilder()
          .setColor('Yellow')
          .setDescription(total_daily_hints)
        interaction.reply({
          content: "Hints :-",
          embeds: [dailyss]
        })
      }
      else {
        const dailyss = new EmbedBuilder()
          .setColor('Yellow')
          .setDescription(hints_not_found)
        interaction.reply({
          content: "Hints :-",
          embeds: [dailyss]
        })
      }
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