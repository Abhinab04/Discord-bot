require('dotenv').config();
const { LeetCode } = require('leetcode-query')
const express = require('express')
const { htmlToText } = require('html-to-text')
const mongoose = require('mongoose')

const app = express();
const port = 3000;

const { EmbedBuilder, Collection, ButtonBuilder, ActionRowBuilder, ButtonStyle, Component, Message, underline } = require('discord.js');

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
const db = process.env.MONGO_URI;

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
async function adduser(username, Idss) {

  try {
    const user = await User.findOne({ name: username, Id: Idss })
    if (!user) {
      const newUser = new User({ name: username, Id: Idss })
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

let xp = 0;


async function submit(userid, con) {
  const finduser = await User.find({ Id: userid })
  const leetcodeusername = finduser[0].name;
  const submission = await leetcode.recent_submissions(leetcodeusername);
  const obj = submission[0];
  const submissionsearch = await leetcode.problem(con)
  const submissionsearchtitle = submissionsearch.title
  const submissionsearchdifficulty = submissionsearch.difficulty
  if (Object.values(obj)[3] === 'Accepted' && submissionsearchdifficulty === 'Easy' && submissionsearchtitle === Object.values(obj)[0]) {
    xp += 1;

    addpts(userid, xp);
    console.log(xp)
    return { dailysearcheasysuccess: "congratulations....point rewarded" }
  }
  if (Object.values(obj)[3] === 'Accepted' && submissionsearchdifficulty === 'Medium' && submissionsearchtitle === Object.values(obj)[0]) {
    console.log("medium done")
    xp += 3;
    addpts(userid, xp);
    return { dailysearchmediumsuccess: "congratulations....point rewarded" }
  }
  if (Object.values(obj)[3] === 'Accepted' && submissionsearchdifficulty === 'Hard' && submissionsearchtitle === Object.values(obj)[0]) {
    console.log("hard done")
    xp += 5;
    addpts(userid, xp);
    return { dailysearchhardsuccess: "congratulations....point rewarded" }
  }
}

async function submitdaily(userid) {
  const finduser = await User.find({ Id: userid })
  const leetcodeusername = finduser[0].name;
  const submission = await leetcode.recent_submissions(leetcodeusername);
  const obj = submission[0];
  const submissiondaily = await leetcode.daily();
  const submissiondailyquestion = submissiondaily.question.title;
  if (submissiondailyquestion === Object.values(obj)[0] && Object.values(obj)[3] === 'Accepted') {
    console.log("question done")
    xp += 10;
    addpts(userid, xp);
    return { dailysuccesmsg: "congratulation...point rewarded" }
  }
}

async function addpts(userid, xp) {
  const finduserid = await User.findOne({ Id: userid })
  if (finduserid) {
    finduserid.pts = xp;
    await finduserid.save();
  }
}

let array = [];
async function leaderboard_display() {
  const Display = await User.find({}).sort({ pts: -1 })
  for (let i = 0; i <Display.length; i++) {
    const person = {
      name: Display[i].name,
       pts: Display[i].pts
    }
    array.push(person)
  }
  return array;
}

const Title = "Leaderboard"
const Title_name = "Top5";
const title_xp = "XP";
async function leaderTitle() {
  return { Title, title_xp, Title_name };
}

const commands = {
  Commandsss: "Commands",
  add_user_name: "Add User",
  add_user: "/adduser username",
  daily_Problem: "Daily Problem",
  daily_question: "/daily",
  Search_Question: "Search Question",
  search_question: "/question search question-title-slug",
  LearderName: "Leaderboard",
  Leaderboard: "/leaderboard",
  SubmitDaily: "Daily Problem Submit",
  submit_daily_question: "/submit",
  SubmitSearch: "Search Submit Question",
  submit_search_question: "/submit search question-title-slug"
};
async function rules() {
  return { commands }
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
      client.channels.cache.get(process.env.CHANNEL_ID).send("here is today's daily problem :-");
      client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [coloring] });
      client.channels.cache.get(process.env.CHANNEL_ID).send({ components: [row] });
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

          client.channels.cache.get(process.env.CHANNEL_ID).send("Your searched question");
          client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [coloring] });
          client.channels.cache.get(process.env.CHANNEL_ID).send({ components: [row] });
        }
      }
    }
  }

  const adds = args[0];
  namess = args[1];
  var idss = "";

  if (adds === '/adduser') {
    if (namess != undefined) {
      idss = msg.author.id
      const result = await adduser(namess, idss)
      if (result.userexist) {
        msg.reply("User already exist")
      }
      if (result.usersaved) {
        msg.reply("User saved")
      }
    }
  }

  var userid = "";
  if (msg.content === '/submit') {
    userid = msg.author.id;
    const userdetails = await submitdaily(userid)
    if (userdetails) {
      msg.reply("congratulations ....daily Question done : 10xp rewarded ")
    }
  }

  const prog = args[2];
  con = prog
  if (command === '/submit') {
    if (search === 'search') {
      if (prog === con) {
        userid = msg.author.id;
        const { dailysearcheasysuccess, dailysearchmediumsuccess, dailysearchhardsuccess } = await submit(userid, con);
        if (dailysearcheasysuccess) {
          msg.reply("congratulations....point rewarded: 1xp ")
        }
        if (dailysearchmediumsuccess) {
          msg.reply("congratulations....point rewarded: 3xp ")
        }
        if (dailysearchhardsuccess) {
          msg.reply("congratulations....point rewarded: 5xp ")
        }
      }
    }
  }

  let i=0;

 
  if (msg.content === "/leaderboard") {
    const leaderBoard = await leaderboard_display();
    const { Title, title_xp, Title_name } = await leaderTitle();
    const fields = leaderBoard.map(user => {
      return [{ name:"Top 5", value: `${i+1})${user.name}`,inline:true },
        {name: `${title_xp}`, value: `${user.pts} XP`,inline:true}
      ]
    })
    const LeaderBoard=new EmbedBuilder()
    .setColor("Yellow")
    .setTitle(underline(Title))
    .addFields(...fields)
    client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [LeaderBoard] });
  }


  if (msg.content === '/Commands') {
    const Commandss = await rules();
    console.log(Commandss.commands.add_user)
    const Rules = new EmbedBuilder()
      .setColor('Yellow')
      .setTitle(underline(Commandss.commands.Commandsss))
      .addFields({ name: Commandss.commands.add_user_name, value: Commandss.commands.add_user },
        { name: Commandss.commands.daily_Problem, value: Commandss.commands.daily_question }, {
        name: Commandss.commands.Search_Question, value: Commandss.commands.search_question
      }, {
        name: Commandss.commands.LearderName, value: Commandss.commands.Leaderboard
      }, {
        name: Commandss.commands.SubmitDaily, value: Commandss.commands.submit_daily_question
      }, {
        name: Commandss.commands.SubmitSearch, value: Commandss.commands.submit_search_question
      })
    client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [Rules] });
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