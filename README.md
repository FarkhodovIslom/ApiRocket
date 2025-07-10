# 🚀 ApiRocket - Telegram HTTP Request Bot

![ApiRocket Screenshot](https://i.imgur.com/5jXKz7Q.png)

Send HTTP requests at rocket speed right from Telegram!

## 🔥 Features

- All HTTP methods: GET, POST, PUT, PATCH, DELETE
- Instant requests: Send directly from Telegram chat
- Formatted responses: Readable output with syntax highlighting
- JSON support: Automatic parsing and formatting
- Easy to use: No complex setup required

## ⚡️ Quick Start

Send commands in the format:

```text
[METHOD] [URL] [DATA]
```

Examples:

```text
GET https://api.example.com/users
POST https://api.example.com/login {"email":"test@example.com","password":"12345"}
DELETE https://api.example.com/users/42
```

## 🛠 Installation

### Requirements

- Node.js v14+
- Telegram account
- Bot token from [@BotFather](https://t.me/BotFather)

### Setup Steps

Clone the repository:

```bash
git clone https://github.com/yourusername/apirocket-bot.git
cd apirocket-bot
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```bash
echo "BOT_TOKEN=your_bot_token" > .env
```

Start the bot:

```bash
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## 🧩 Project Structure

```text
apirocket-bot/
├── controllers/       # Command handlers
├── services/          # HTTP request logic
├── .env               # Configuration
├── index.js           # Main file
├── package.json
└── README.md
```

## 🌟 Examples

### GET Request

![GET Request Example](https://i.imgur.com/8F3XaVg.png =400x)

### POST Request with JSON

![POST Request Example](https://i.imgur.com/5Gpz9Kd.png =400x)

## 🤝 Contributing

1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add some amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Launch your API requests into orbit! 🚀  
Built with ❤️ for developers who value speed and convenience.
