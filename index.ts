import { Telegraf, Context, Markup } from "telegraf";
import axios, { AxiosRequestConfig, Method} from "axios";
import dotenv from "dotenv";
dotenv.config()

interface SessionData {
    method?: Method,
    url?: string,
    headers?: Record<string, string>,
    body?: string,
    step?: 'method' | 'url' | 'headers' | 'ready';
}

interface BotContext extends Context {
    session: SessionData
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);


// Middleware for sessions
const sessions = new Map<number, SessionData>();

bot.use(
    (ctx, next) => {
        const userId = ctx.from?.id;
        if (userId) {
            ctx.session = sessions.get(userId) || {};
            sessions.set(userId,  ctx.session);
        }
        return next();
    }
)

// Command /start

bot.command('start', (ctx, next) => {
    ctx.session = {};
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('GET', 'method_GET'),
            Markup.button.callback('POST', 'method_POST'),
            Markup.button.callback('PUT', 'method_PUT'),
        ],
        [
            Markup.button.callback('PATCH', 'method_PATCH'),
            Markup.button.callback('DELETE', 'method_DELETE'),
        ]
    ]);

    ctx.reply(
        '🚀 API Rocket bot\n\n' + 'Select HTTP method for request:',
        { parse_mode: 'Markdown', ...keyboard },
    );
});



// Method processing
bot.action(/Method_(.+)/, (ctx) => {
    const method = ctx.match[1] as Method;
    ctx.session.method = method;
    ctx.session.step = 'url';

    ctx.editMessageText(
        `✅ Current method: *${method}*\n\n` +
        '🔗 Send me link for request:',
        { parse_mode: 'Markdown' }
    );
});


// Processing URL
bot.on('text',  async (ctx) => {
    const text = ctx.message.text;

    if (ctx.session.step === 'url') {
        try {
            new URL(text);
            ctx.session.url = text;

            if (ctx.session.method === 'GET' || ctx.session.method === 'DELETE') {
                ctx.session.step = 'ready';
                showFinalMenu(ctx);
            } else {

            }
        } catch (error) {}
    }
})
























