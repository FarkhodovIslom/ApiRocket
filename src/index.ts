import { Telegraf, Context, Markup } from "telegraf";
import axios, { AxiosRequestConfig, Method} from "axios";
import dotenv from "dotenv";
dotenv.config()



interface SessionData {
    method?: Method,
    url?: string,
    headers?: Record<string, string>,
    body?: string,
    step?: 'method' | 'url' | 'body' | 'headers' | 'ready';
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
bot.action(/method_(.+)/, (ctx) => {
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
                ctx.session.step = 'body';
                ctx.reply(
                    `📝 *${ctx.session.method}* request to:\n\`${text}\`\n\n` +
                    '💾 Send Body (JSON) or click "Skip":',
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback('⏭️ Skip', 'skip_body')]
                        ])
                    }
                );
            }
        } catch (error) {
            ctx.reply('❌ Incorrect URL! Try again.');
        }
    } else if (ctx.session.step === 'body') {
        try {
            JSON.parse(text);
            ctx.session.body = text;
            ctx.session.step = 'ready';
            showFinalMenu(ctx);
        } catch (error) {
            ctx.reply('❌ Incorrect URL! Try again.')
        }
    } else if (ctx.session.step === 'headers') {
        try {
            const headers: Record<string, string> = {};
            const lines = text.split('\n');

            for (const line of lines) {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    headers[key.trim()] = valueParts.join(':').trim();
                }
            }

            ctx.session.headers = { ...ctx.session.headers, ...headers };
            ctx.session.step = 'ready';
            showFinalMenu(ctx);
        } catch (error) {
            ctx.reply('❌ Incorrect headers format! Use "key: value" format');
        }
    }
});

// Skipping body
bot.action('skip_body', (ctx) => {
    ctx.session.step = 'ready';
    showFinalMenu(ctx)
});


// Adding headers
bot.action('add_headers', (ctx) => {
    ctx.session.step = 'headers';
    ctx.editMessageText(
        '📋 Send headers in the format:\n\n' +
        '```\n' +
        'Content-type: application/json\n' +
        '```',
        {parse_mode: "Markdown"}
    );
});


// Sending requests
bot.action('send_request', async (ctx) => {
    const { method, url, headers, body } = ctx.session;

    if (!method || !url) {
        ctx.reply('❌ Fill in all fields!');
        return;
    }

    ctx.editMessageText('⏳ Sending the request...');

    try {
        const config: AxiosRequestConfig = {
            method,
            url,
            headers: headers || {},
            timeout: 10000
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.data = JSON.parse(body);
        }

        const startTime = Date.now();
        const response  = await axios(config);
        const endTime = Date.now();
        const duration = endTime - startTime;

        let responseText = `✅ *${method} ${url}*\n\n`;
        responseText += `📊 Status: \`${response.status} ${response.statusText}\`\n`;
        responseText += `⏱️ Time: \`${duration}ms\`\n\n`;

        // Response headers
        responseText += '📋 *Headers:*\n';
        Object.entries(response.headers).forEach(([key, value]) => {
          responseText += `\`${key}\`: ${value}\n`;
        });
    
        responseText += '\n💾 *Body:*\n';
        
        let responseBody = '';
        if (typeof response.data === 'object') {
            responseBody = JSON.stringify(response.data, null, 2);
        } else { 
            responseBody = String(response.data)
        }


        if (responseBody.length > 3000) {
            responseBody = responseBody.substring(0, 3000) + '\n\n...'
        }
        
        ctx.editMessageText(responseText, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔄 New request', 'new_request')]
            ])
        })

    } catch (error: any) {
        let errorText = `❌ *REQUEST ERROR*\n\n`;
        errorText += `🔗 URL: \`${url}\`\n`;
        errorText += `📡 Method: \`${method}\`\n\n`;

        if (error.response) {
            errorText += `📊 Status: \`${error.response.status} ${error.response.statusText}\`\n`;
            errorText += `💾 Error: \`${JSON.stringify(error.response.data)}\``;
        } else if (error.request) {
            errorText += `🔌 Network error: Connection timeout`;
        } else {
            errorText += `🐛 Error: \`${error.message}\``;
        }

        ctx.editMessageText(errorText, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Новый запрос', 'new_request')]
        ])
        });
    }
})


// New request
bot.action('new_request', (ctx) => {
  ctx.session = {}; // Сбрасываем сессию
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('GET', 'method_GET'),
      Markup.button.callback('POST', 'method_POST'),
      Markup.button.callback('PUT', 'method_PUT')
    ],
    [
      Markup.button.callback('PATCH', 'method_PATCH'),
      Markup.button.callback('DELETE', 'method_DELETE')
    ]
  ]);

  ctx.editMessageText(
    '🚀 *ApiRocket bot*\n\n' +
    'Please select method for http request:',
    { parse_mode: 'Markdown', ...keyboard }
  );
});


// Show final menu
function showFinalMenu(ctx: BotContext) {
  const { method, url, headers, body } = ctx.session;
  
  let text = `🎯 *Ready for request:*\n\n`;
  text += `📡 Method: \`${method}\`\n`;
  text += `🔗 URL: \`${url}\`\n`;
  
  if (headers && Object.keys(headers).length > 0) {
    text += `📋 Headers: \`${Object.keys(headers).length} \`\n`;
  }
  
  if (body) {
    text += `💾 Body: \`${body.length} characters\`\n`;
  }

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📋 Add Headers', 'add_headers'),
      Markup.button.callback('🚀 Send Request', 'send_request')
    ],
    [Markup.button.callback('🔄 New Request', 'new_request')]
  ]);

  ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
}



// Start the bot 
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


console.log('🚀 ApiRocket launched')