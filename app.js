require('dotenv').config();
const puppeteer = require('puppeteer');

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

const webscrapping = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sadbox",
      "--no-sandbox",
      "--no-zygote",
    ],
    executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
  })
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 926 })

  let pageno = 1;
  let headlines = [];

  await page.goto(`https://leetcode.com/problemset/all/?page=${pageno}`, { waitUntil: 'networkidle2' });

  const newheadline = await page.evaluate(() => {
    const headlines = [];
    document.querySelectorAll(".h-5").forEach((headline) => {
      const text = headline.innerText;
      const href = headline.getAttribute("href");
      const hrefs = "https://leetcode.com" + href;
      if (text && text.trim() !== "") {
        headlines.push({ text: text.trim(), hrefs })
      }
    });
    return headlines;
  });

  headlines = headlines.concat(newheadline);

  const title = headlines[0].text;

  const ans = headlines[0].hrefs;
  await browser.close();
  return { ans, title };
}
webscrapping();
const fetch = async ({ ans, title }) => {

  if (ans) {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sadbox",
        "--no-sandbox",
        "--no-zygote",
      ],
      executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
    })

    const page = await browser.newPage()

    await page.goto(ans, { waitUntil: 'networkidle2' })

    let element = await page.waitForSelector(".elfjS")

    let text = await page.evaluate(element => element.textContent, element)

    browser.close()
    return text;
  }
};

var items = Array("here's today's leetcode question:-", "alright, we have a new daily question let's see who can do this:-", "hey hey,you know what time it is?? it's leetcode daily question time let's see whether you have what it takes to solve it", "Its time for today's leetcode question:-", "Hey, haven't you solved today's leetcode question yet ?? Its the time!!!")
var item = items[Math.floor(Math.random() * items.length)];

client.on('ready', async () => {
  if (date.getHours() === 19) {
    const { ans, title } = await webscrapping();
    const text = await fetch({ ans });
    if (ans) {
      const coloring = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(title)
        .setURL(ans)
        .setDescription(text)
      client.channels.cache.get("channel id").send("@everyone" + "  " + item);
      client.channels.cache.get("channel id").send({ embeds: [coloring] });
    }
  }
})
client.login(process.env.DISCORD_TOKEN);
