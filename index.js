"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// Middleware for sessions
var sessions = new Map();
bot.use(function (ctx, next) {
    var _a;
    var userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        ctx.session = sessions.get(userId) || {};
        sessions.set(userId, ctx.session);
    }
    return next();
});
// Command /start
bot.command('start', function (ctx, next) {
    ctx.session = {};
    var keyboard = telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('GET', 'method_GET'),
            telegraf_1.Markup.button.callback('POST', 'method_POST'),
            telegraf_1.Markup.button.callback('PUT', 'method_PUT'),
        ],
        [
            telegraf_1.Markup.button.callback('PATCH', 'method_PATCH'),
            telegraf_1.Markup.button.callback('DELETE', 'method_DELETE'),
        ]
    ]);
    ctx.reply('🚀 API Rocket bot\n\n' + 'Select HTTP method for request:', __assign({ parse_mode: 'Markdown' }, keyboard));
});
