## Development Principles
- Use TDD principles in development
- Follow SOLID principles
- Adhere to DRY (Don't Repeat Yourself) principles
- Invoke appropriate agents
- Ensure code is modular and reusable
- Always check frontend compilation on errors!
- Translate all new strings to all languages
- Ensure code follows best practices and is well-documented
- Do changes attentively to avoid breaking existing functionality

## Known Issues & Documentation
- **BingX API Issues**: See `/backend/BINGX_API_ISSUES.md` for critical issues with BingX API `startTime` parameter
  - NEVER use `startTime` with `/openApi/swap/v2/user/income` endpoint
  - Always test with symbol variants ("FUSDT" vs "F-USDT")
  - Full backend restart required after changes to `funding-tracker.service.ts`
- always check data structure between backed, frontend or third party API