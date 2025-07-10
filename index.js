const { Telegraf } = require('telegraf');
const { processRequest } = require('./controllers/requestController');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработка текстовых команд
bot.on('text', async (ctx) => {
  await processRequest(ctx);
});

// Обработка ошибок
bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.launch();
