/**
 * Bybit Strategy Modal Translation Keys
 *
 * This file contains all translation keys for the Bybit funding strategy modal component.
 * These keys should be added to the TranslationService's translations object.
 */

export const bybitStrategyTranslations = {
  en: {
    // Modal Title
    'bybitStrategy.title': 'Start Bybit Funding Strategy',
    'bybitStrategy.description': 'Configure and start automated funding rate collection for',

    // Symbol Information
    'bybitStrategy.info.title': 'Symbol Information',
    'bybitStrategy.info.symbol': 'Symbol:',
    'bybitStrategy.info.fundingRate': 'Funding Rate:',
    'bybitStrategy.info.timeUntilFunding': 'Time Until Funding:',

    // Strategy Type
    'bybitStrategy.type.label': 'Strategy Type',
    'bybitStrategy.type.placeholder': 'Select strategy type',
    'bybitStrategy.type.precise': 'Precise Timing (20ms after funding)',
    'bybitStrategy.type.regular': 'Regular Strategy (5s before funding)',
    'bybitStrategy.type.preciseDesc': 'Opens position exactly 20ms after funding time with latency compensation',
    'bybitStrategy.type.regularDesc': 'Opens position 5 seconds before funding time with TP/SL protection',
    'bybitStrategy.type.preciseHint': 'Opens position exactly 20ms after funding time with latency compensation',
    'bybitStrategy.type.regularHint': 'Opens position 5 seconds before funding time with TP/SL protection',

    // Credentials
    'bybitStrategy.credentials.label': 'Bybit API Credentials',
    'bybitStrategy.credentials.placeholder': 'Select credentials',
    'bybitStrategy.credentials.noCredentials': 'No active Bybit credentials found. Please add credentials first.',

    // Position Configuration
    'bybitStrategy.position.title': 'Position Configuration',
    'bybitStrategy.position.leverage': 'Leverage',
    'bybitStrategy.position.leverageHint': 'Leverage multiplier (1x - 125x)',
    'bybitStrategy.position.margin': 'Margin (USDT)',
    'bybitStrategy.position.marginHint': 'Margin amount in USDT',
    'bybitStrategy.position.side': 'Position Side',
    'bybitStrategy.position.sidePlaceholder': 'Select position side',
    'bybitStrategy.position.sideHint': 'Auto mode determines side based on funding rate (recommended)',

    // Position Side Options
    'bybitStrategy.side.auto': 'Auto (Recommended)',
    'bybitStrategy.side.autoDesc': 'Automatically determine side based on funding rate',
    'bybitStrategy.side.long': 'Long (Buy)',
    'bybitStrategy.side.longDesc': 'Open long position',
    'bybitStrategy.side.short': 'Short (Sell)',
    'bybitStrategy.side.shortDesc': 'Open short position',

    // Risk Management
    'bybitStrategy.risk.title': 'Risk Management',
    'bybitStrategy.risk.takeProfit': 'Take Profit (%)',
    'bybitStrategy.risk.takeProfitHint': 'of expected funding',
    'bybitStrategy.risk.stopLoss': 'Stop Loss (%)',
    'bybitStrategy.risk.stopLossHint': 'of expected funding',

    // Advanced Options
    'bybitStrategy.advanced.title': 'Advanced Options',
    'bybitStrategy.advanced.timingOffset': 'Timing Offset (ms)',
    'bybitStrategy.advanced.timingOffsetHint': 'Milliseconds after funding time to execute order (default: 20ms)',
    'bybitStrategy.advanced.autoRepeat': 'Auto-repeat for next funding cycle',
    'bybitStrategy.advanced.autoRepeatHint': 'Automatically restart strategy for the next funding period',
    'bybitStrategy.advanced.websocket': 'Enable WebSocket monitoring',
    'bybitStrategy.advanced.websocketHint': 'Real-time position updates via WebSocket (recommended)',

    // Expected Results
    'bybitStrategy.expected.title': 'Expected Results',
    'bybitStrategy.expected.positionValue': 'Position Value:',
    'bybitStrategy.expected.expectedFunding': 'Expected Funding:',
    'bybitStrategy.expected.takeProfitTarget': 'Take Profit Target:',
    'bybitStrategy.expected.stopLoss': 'Stop Loss:',

    // Actions
    'bybitStrategy.actions.cancel': 'Cancel',
    'bybitStrategy.actions.start': 'Start Strategy',
    'bybitStrategy.actions.starting': 'Starting...',
    'bybitStrategy.actions.success': 'Strategy started successfully!',
    'bybitStrategy.actions.error': 'Failed to start strategy',

    // Messages
    'bybitStrategy.messages.success': 'Strategy started successfully!',
    'bybitStrategy.messages.noBybitData': 'No Bybit exchange data available for this symbol',
  },

  uk: {
    // Modal Title
    'bybitStrategy.title': 'Запустити Bybit Стратегію Фінансування',
    'bybitStrategy.description': 'Налаштуйте та запустіть автоматичний збір ставки фінансування для',

    // Symbol Information
    'bybitStrategy.info.title': 'Інформація про Символ',
    'bybitStrategy.info.symbol': 'Символ:',
    'bybitStrategy.info.fundingRate': 'Ставка Фінансування:',
    'bybitStrategy.info.timeUntilFunding': 'Час до Фінансування:',

    // Strategy Type
    'bybitStrategy.type.label': 'Тип Стратегії',
    'bybitStrategy.type.placeholder': 'Виберіть тип стратегії',
    'bybitStrategy.type.precise': 'Точний Тайминг (20мс після фінансування)',
    'bybitStrategy.type.regular': 'Звичайна Стратегія (5с до фінансування)',
    'bybitStrategy.type.preciseDesc': 'Відкриває позицію рівно після часу фінансування з компенсацією затримки',
    'bybitStrategy.type.regularDesc': 'Відкриває позицію за 5 секунд до часу фінансування з захистом TP/SL',
    'bybitStrategy.type.preciseHint': 'Відкриває позицію рівно через 20мс після часу фінансування з компенсацією затримки',
    'bybitStrategy.type.regularHint': 'Відкриває позицію за 5 секунд до часу фінансування з захистом TP/SL',

    // Credentials
    'bybitStrategy.credentials.label': 'API Облікові Дані Bybit',
    'bybitStrategy.credentials.placeholder': 'Виберіть облікові дані',
    'bybitStrategy.credentials.noCredentials': 'Не знайдено активних облікових даних Bybit. Будь ласка, спочатку додайте облікові дані.',

    // Position Configuration
    'bybitStrategy.position.title': 'Налаштування Позиції',
    'bybitStrategy.position.leverage': 'Плече',
    'bybitStrategy.position.leverageHint': 'Множник плеча (1x - 125x)',
    'bybitStrategy.position.margin': 'Маржа (USDT)',
    'bybitStrategy.position.marginHint': 'Сума маржі в USDT',
    'bybitStrategy.position.side': 'Сторона Позиції',
    'bybitStrategy.position.sidePlaceholder': 'Виберіть сторону позиції',
    'bybitStrategy.position.sideHint': 'Авто режим визначає сторону на основі ставки фінансування (рекомендовано)',

    // Position Side Options
    'bybitStrategy.side.auto': 'Авто (Рекомендовано)',
    'bybitStrategy.side.autoDesc': 'Автоматично визначити сторону на основі ставки фінансування',
    'bybitStrategy.side.long': 'Лонг (Купівля)',
    'bybitStrategy.side.longDesc': 'Відкрити лонг позицію',
    'bybitStrategy.side.short': 'Шорт (Продаж)',
    'bybitStrategy.side.shortDesc': 'Відкрити шорт позицію',

    // Risk Management
    'bybitStrategy.risk.title': 'Управління Ризиками',
    'bybitStrategy.risk.takeProfit': 'Тейк Профіт (%)',
    'bybitStrategy.risk.takeProfitHint': 'від очікуваного фінансування',
    'bybitStrategy.risk.stopLoss': 'Стоп Лосс (%)',
    'bybitStrategy.risk.stopLossHint': 'від очікуваного фінансування',

    // Advanced Options
    'bybitStrategy.advanced.title': 'Розширені Опції',
    'bybitStrategy.advanced.timingOffset': 'Зміщення Таймінгу (мс)',
    'bybitStrategy.advanced.timingOffsetHint': 'Мілісекунди після часу фінансування для виконання ордера (за замовчуванням: 20мс)',
    'bybitStrategy.advanced.autoRepeat': 'Авто-повтор для наступного циклу фінансування',
    'bybitStrategy.advanced.autoRepeatHint': 'Автоматично перезапустити стратегію для наступного періоду фінансування',
    'bybitStrategy.advanced.websocket': 'Увімкнути WebSocket моніторинг',
    'bybitStrategy.advanced.websocketHint': 'Оновлення позиції в реальному часі через WebSocket (рекомендовано)',

    // Expected Results
    'bybitStrategy.expected.title': 'Очікувані Результати',
    'bybitStrategy.expected.positionValue': 'Вартість Позиції:',
    'bybitStrategy.expected.expectedFunding': 'Очікуване Фінансування:',
    'bybitStrategy.expected.takeProfitTarget': 'Ціль Тейк Профіт:',
    'bybitStrategy.expected.stopLoss': 'Стоп Лосс:',

    // Actions
    'bybitStrategy.actions.cancel': 'Скасувати',
    'bybitStrategy.actions.start': 'Запустити Стратегію',
    'bybitStrategy.actions.starting': 'Запуск...',
    'bybitStrategy.actions.success': 'Стратегію успішно запущено!',
    'bybitStrategy.actions.error': 'Не вдалося запустити стратегію',

    // Messages
    'bybitStrategy.messages.success': 'Стратегію успішно запущено!',
    'bybitStrategy.messages.noBybitData': 'Немає даних біржі Bybit для цього символу',
  },

  ru: {
    // Modal Title
    'bybitStrategy.title': 'Запустить Bybit Стратегию Финансирования',
    'bybitStrategy.description': 'Настройте и запустите автоматический сбор ставки финансирования для',

    // Symbol Information
    'bybitStrategy.info.title': 'Информация о Символе',
    'bybitStrategy.info.symbol': 'Символ:',
    'bybitStrategy.info.fundingRate': 'Ставка Финансирования:',
    'bybitStrategy.info.timeUntilFunding': 'Время до Финансирования:',

    // Strategy Type
    'bybitStrategy.type.label': 'Тип Стратегии',
    'bybitStrategy.type.placeholder': 'Выберите тип стратегии',
    'bybitStrategy.type.precise': 'Точный Тайминг (20мс после финансирования)',
    'bybitStrategy.type.regular': 'Обычная Стратегия (5с до финансирования)',
    'bybitStrategy.type.preciseDesc': 'Открывает позицию ровно после времени финансирования с компенсацией задержки',
    'bybitStrategy.type.regularDesc': 'Открывает позицию за 5 секунд до времени финансирования с защитой TP/SL',
    'bybitStrategy.type.preciseHint': 'Открывает позицию ровно через 20мс после времени финансирования с компенсацией задержки',
    'bybitStrategy.type.regularHint': 'Открывает позицию за 5 секунд до времени финансирования с защитой TP/SL',

    // Credentials
    'bybitStrategy.credentials.label': 'API Учетные Данные Bybit',
    'bybitStrategy.credentials.placeholder': 'Выберите учетные данные',
    'bybitStrategy.credentials.noCredentials': 'Не найдено активных учетных данных Bybit. Пожалуйста, сначала добавьте учетные данные.',

    // Position Configuration
    'bybitStrategy.position.title': 'Настройка Позиции',
    'bybitStrategy.position.leverage': 'Плечо',
    'bybitStrategy.position.leverageHint': 'Множитель плеча (1x - 125x)',
    'bybitStrategy.position.margin': 'Маржа (USDT)',
    'bybitStrategy.position.marginHint': 'Сумма маржи в USDT',
    'bybitStrategy.position.side': 'Сторона Позиции',
    'bybitStrategy.position.sidePlaceholder': 'Выберите сторону позиции',
    'bybitStrategy.position.sideHint': 'Авто режим определяет сторону на основе ставки финансирования (рекомендуется)',

    // Position Side Options
    'bybitStrategy.side.auto': 'Авто (Рекомендуется)',
    'bybitStrategy.side.autoDesc': 'Автоматически определить сторону на основе ставки финансирования',
    'bybitStrategy.side.long': 'Лонг (Покупка)',
    'bybitStrategy.side.longDesc': 'Открыть лонг позицию',
    'bybitStrategy.side.short': 'Шорт (Продажа)',
    'bybitStrategy.side.shortDesc': 'Открыть шорт позицию',

    // Risk Management
    'bybitStrategy.risk.title': 'Управление Рисками',
    'bybitStrategy.risk.takeProfit': 'Тейк Профит (%)',
    'bybitStrategy.risk.takeProfitHint': 'от ожидаемого финансирования',
    'bybitStrategy.risk.stopLoss': 'Стоп Лосс (%)',
    'bybitStrategy.risk.stopLossHint': 'от ожидаемого финансирования',

    // Advanced Options
    'bybitStrategy.advanced.title': 'Расширенные Опции',
    'bybitStrategy.advanced.timingOffset': 'Смещение Тайминга (мс)',
    'bybitStrategy.advanced.timingOffsetHint': 'Миллисекунды после времени финансирования для выполнения ордера (по умолчанию: 20мс)',
    'bybitStrategy.advanced.autoRepeat': 'Авто-повтор для следующего цикла финансирования',
    'bybitStrategy.advanced.autoRepeatHint': 'Автоматически перезапустить стратегию для следующего периода финансирования',
    'bybitStrategy.advanced.websocket': 'Включить WebSocket мониторинг',
    'bybitStrategy.advanced.websocketHint': 'Обновления позиции в реальном времени через WebSocket (рекомендуется)',

    // Expected Results
    'bybitStrategy.expected.title': 'Ожидаемые Результаты',
    'bybitStrategy.expected.positionValue': 'Стоимость Позиции:',
    'bybitStrategy.expected.expectedFunding': 'Ожидаемое Финансирование:',
    'bybitStrategy.expected.takeProfitTarget': 'Цель Тейк Профит:',
    'bybitStrategy.expected.stopLoss': 'Стоп Лосс:',

    // Actions
    'bybitStrategy.actions.cancel': 'Отменить',
    'bybitStrategy.actions.start': 'Запустить Стратегию',
    'bybitStrategy.actions.starting': 'Запуск...',
    'bybitStrategy.actions.success': 'Стратегия успешно запущена!',
    'bybitStrategy.actions.error': 'Не удалось запустить стратегию',

    // Messages
    'bybitStrategy.messages.success': 'Стратегия успешно запущена!',
    'bybitStrategy.messages.noBybitData': 'Нет данных биржи Bybit для этого символа',
  },
};
