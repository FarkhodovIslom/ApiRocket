import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { handleRequest } from "./controllers/requestController.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome! Bot is up and running."));
bot.help((ctx) => ctx.reply("Send me a command and I will respond."));

bot.on("text", async (ctx) => {
  try {
    const response = await handleRequest(ctx.message.text);
    ctx.reply(response);
  } catch (error) {
    ctx.reply("Sorry, something went wrong.");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
