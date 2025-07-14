# Changelog

## Fixes in src/index.ts

- Fixed case mismatch in bot.action regex for HTTP method selection from /Method_(.+)/ to /method_(.+)/ to match callback data.
- Corrected condition in send_request action to properly check if method or url is missing.
- Fixed JSON.parse usage in send_request action to parse the variable body instead of the string 'body'.
