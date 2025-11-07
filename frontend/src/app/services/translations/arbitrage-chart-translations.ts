export const arbitrageChartTranslations = {
  en: {
    // Navigation
    'arbitrageChart.back': 'Back',
    'arbitrageChart.title': 'Arbitrage Chart',

    // Loading
    'arbitrageChart.loading': 'Loading chart data...',
    'arbitrageChart.loadingHistorical': 'Loading historical data...',

    // Chart
    'arbitrageChart.priceSpread': 'Price Spread',
    'arbitrageChart.fundingSpread': 'Funding Spread',
    'arbitrageChart.fit': 'Fit',
    'arbitrageChart.fitTooltip': 'Fit chart to content',

    // Active Positions
    'arbitrageChart.activePositions': 'Active Positions',
    'arbitrageChart.positionCount': 'positions',
    'arbitrageChart.noPositions': 'No active positions for this pair',
    'arbitrageChart.startPosition': 'Start a new arbitrage position using the form below',

    // Table
    'arbitrageChart.table.positionId': 'Position ID',
    'arbitrageChart.table.symbol': 'Symbol',
    'arbitrageChart.table.primaryExchange': 'Primary Exchange',
    'arbitrageChart.table.hedgeExchange': 'Hedge Exchange',
    'arbitrageChart.table.status': 'Status',
    'arbitrageChart.table.startedAt': 'Started At',
    'arbitrageChart.table.actions': 'Actions',

    // Actions
    'arbitrageChart.actions.tpsl': 'TP/SL',
    'arbitrageChart.actions.tpslTooltip': 'Set Take Profit / Stop Loss',
    'arbitrageChart.actions.monitoringActive': 'Monitoring is active',
    'arbitrageChart.actions.monitoringDisabled': 'Monitoring is disabled',
    'arbitrageChart.actions.monitoringOn': 'On',
    'arbitrageChart.actions.monitoringOff': 'Off',
    'arbitrageChart.actions.stop': 'Stop',

    // Details
    'arbitrageChart.details.metric': 'Metric',
    'arbitrageChart.details.primary': 'Primary',
    'arbitrageChart.details.hedge': 'Hedge',
    'arbitrageChart.details.entryPrice': 'Entry Price',
    'arbitrageChart.details.unrealizedPnl': 'Unrealized P&L',
    'arbitrageChart.details.realizedPnl': 'Realized P&L',
    'arbitrageChart.details.liquidationPrice': 'Liquidation Price',
    'arbitrageChart.details.liquidationProximity': 'Liquidation Proximity',
    'arbitrageChart.details.danger': 'DANGER',
    'arbitrageChart.details.stopLoss': 'Stop Loss',
    'arbitrageChart.details.takeProfit': 'Take Profit',
    'arbitrageChart.details.lastFundingPaid': 'Last Funding Paid',
    'arbitrageChart.details.totalFundingEarned': 'Total Funding Earned',
    'arbitrageChart.details.entryFees': 'Entry Fees',
    'arbitrageChart.details.grossProfit': 'Gross Profit',
    'arbitrageChart.details.netProfit': 'Net Profit',
    'arbitrageChart.details.notAvailable': 'N/A',

    // Error
    'arbitrageChart.error.title': 'Error Details',
    'arbitrageChart.error.details': 'Error Details',
    'arbitrageChart.error.howToFix': 'How to Fix',
    'arbitrageChart.error.checkConnectivity': 'Check Network Connectivity',
    'arbitrageChart.error.verifyInternet': 'Verify your internet connection is stable',
    'arbitrageChart.error.checkApis': 'Check if',
    'arbitrageChart.error.checkApisOperational': 'APIs are operational',
    'arbitrageChart.error.lookForErrors': 'Look for any network errors in the browser console',
    'arbitrageChart.error.verifyCredentials': 'Verify API Credentials',
    'arbitrageChart.error.goToProfile': 'Go to Profile → API Keys section',
    'arbitrageChart.error.testConnection': 'Test the connection for each exchange',
    'arbitrageChart.error.checkPermissions': 'Check that API keys have correct permissions (futures trading, read balance)',
    'arbitrageChart.error.checkStatus': 'Check Exchange Status',
    'arbitrageChart.error.visitWebsites': 'Visit exchange websites to check for maintenance or outages',
    'arbitrageChart.error.checkRateLimits': 'Check if you\'re hitting API rate limits',
    'arbitrageChart.error.partiallyFilled': 'Partially Filled Position',
    'arbitrageChart.error.partiallyFilledMessage': 'If one side of the position was successfully opened, you should close it manually on the exchange or use the Close Position button.',
    'arbitrageChart.error.closePosition': 'Close Position',
    'arbitrageChart.error.closePositionHelp': 'This will attempt to close both sides of the position. If one side has already closed, it will only close the remaining side.',

    // Exchange
    'arbitrageChart.exchange.funding': 'Funding Rate',
    'arbitrageChart.exchange.accountBalance': 'Account Balance',
    'arbitrageChart.exchange.loading': 'Loading...',
    'arbitrageChart.exchange.total': 'Total',
    'arbitrageChart.exchange.available': 'Available',

    // Form
    'arbitrageChart.form.spotMarketInfo': 'Spot market - buy only, no leverage',
    'arbitrageChart.form.side': 'Side',
    'arbitrageChart.form.long': 'Long',
    'arbitrageChart.form.short': 'Short',
    'arbitrageChart.form.leverage': 'Leverage',
    'arbitrageChart.form.parts': 'Parts',
    'arbitrageChart.form.partsRangeSpot': '(1-5)',
    'arbitrageChart.form.splitBuy': 'Split buy into multiple parts',
    'arbitrageChart.form.delay': 'Delay (seconds)',
    'arbitrageChart.form.delayRangeSpot': '(0.1-10s)',
    'arbitrageChart.form.delayBetweenBuys': 'Delay between buys',
    'arbitrageChart.form.partsRange': '(1-20)',
    'arbitrageChart.form.delayRange': '(0.1-60s)',

    // Sync Lock
    'arbitrageChart.syncLock.locked': 'Parameters are synchronized',
    'arbitrageChart.syncLock.unlocked': 'Parameters are independent',
    'arbitrageChart.syncLock.disabled': 'Sync disabled for spot/futures pairs',

    // Buttons
    'arbitrageChart.buttons.startingPosition': 'Starting Position...',
    'arbitrageChart.buttons.startArbitrage': 'Start Arbitrage Position',
    'arbitrageChart.buttons.stopSignal': 'Stop Signal',
    'arbitrageChart.buttons.startSignal': 'Start Signal',
  },
  es: {
    // Navigation
    'arbitrageChart.back': 'Atrás',
    'arbitrageChart.title': 'Gráfico de Arbitraje',

    // Loading
    'arbitrageChart.loading': 'Cargando datos del gráfico...',
    'arbitrageChart.loadingHistorical': 'Cargando datos históricos...',

    // Chart
    'arbitrageChart.priceSpread': 'Spread de Precio',
    'arbitrageChart.fundingSpread': 'Spread de Financiamiento',
    'arbitrageChart.fit': 'Ajustar',
    'arbitrageChart.fitTooltip': 'Ajustar gráfico al contenido',

    // Active Positions
    'arbitrageChart.activePositions': 'Posiciones Activas',
    'arbitrageChart.positionCount': 'posiciones',
    'arbitrageChart.noPositions': 'No hay posiciones activas para este par',
    'arbitrageChart.startPosition': 'Inicie una nueva posición de arbitraje usando el formulario a continuación',

    // Table
    'arbitrageChart.table.positionId': 'ID de Posición',
    'arbitrageChart.table.symbol': 'Símbolo',
    'arbitrageChart.table.primaryExchange': 'Exchange Principal',
    'arbitrageChart.table.hedgeExchange': 'Exchange de Cobertura',
    'arbitrageChart.table.status': 'Estado',
    'arbitrageChart.table.startedAt': 'Iniciado En',
    'arbitrageChart.table.actions': 'Acciones',

    // Actions
    'arbitrageChart.actions.tpsl': 'TP/SL',
    'arbitrageChart.actions.tpslTooltip': 'Establecer Take Profit / Stop Loss',
    'arbitrageChart.actions.monitoringActive': 'El monitoreo está activo',
    'arbitrageChart.actions.monitoringDisabled': 'El monitoreo está deshabilitado',
    'arbitrageChart.actions.monitoringOn': 'Activo',
    'arbitrageChart.actions.monitoringOff': 'Inactivo',
    'arbitrageChart.actions.stop': 'Detener',

    // Details
    'arbitrageChart.details.metric': 'Métrica',
    'arbitrageChart.details.primary': 'Principal',
    'arbitrageChart.details.hedge': 'Cobertura',
    'arbitrageChart.details.entryPrice': 'Precio de Entrada',
    'arbitrageChart.details.unrealizedPnl': 'P&L No Realizado',
    'arbitrageChart.details.realizedPnl': 'P&L Realizado',
    'arbitrageChart.details.liquidationPrice': 'Precio de Liquidación',
    'arbitrageChart.details.liquidationProximity': 'Proximidad a Liquidación',
    'arbitrageChart.details.danger': 'PELIGRO',
    'arbitrageChart.details.stopLoss': 'Stop Loss',
    'arbitrageChart.details.takeProfit': 'Take Profit',
    'arbitrageChart.details.lastFundingPaid': 'Último Funding Pagado',
    'arbitrageChart.details.totalFundingEarned': 'Funding Total Ganado',
    'arbitrageChart.details.entryFees': 'Comisiones de Entrada',
    'arbitrageChart.details.grossProfit': 'Beneficio Bruto',
    'arbitrageChart.details.netProfit': 'Beneficio Neto',
    'arbitrageChart.details.notAvailable': 'N/D',

    // Error
    'arbitrageChart.error.title': 'Detalles del Error',
    'arbitrageChart.error.details': 'Detalles del Error',
    'arbitrageChart.error.howToFix': 'Cómo Solucionar',
    'arbitrageChart.error.checkConnectivity': 'Verificar Conectividad de Red',
    'arbitrageChart.error.verifyInternet': 'Verifique que su conexión a internet es estable',
    'arbitrageChart.error.checkApis': 'Verifique si',
    'arbitrageChart.error.checkApisOperational': 'las APIs están operativas',
    'arbitrageChart.error.lookForErrors': 'Busque errores de red en la consola del navegador',
    'arbitrageChart.error.verifyCredentials': 'Verificar Credenciales de API',
    'arbitrageChart.error.goToProfile': 'Vaya a Perfil → sección de Claves API',
    'arbitrageChart.error.testConnection': 'Pruebe la conexión para cada exchange',
    'arbitrageChart.error.checkPermissions': 'Verifique que las claves API tengan permisos correctos (trading de futuros, leer balance)',
    'arbitrageChart.error.checkStatus': 'Verificar Estado del Exchange',
    'arbitrageChart.error.visitWebsites': 'Visite los sitios web de los exchanges para verificar mantenimiento o interrupciones',
    'arbitrageChart.error.checkRateLimits': 'Verifique si está alcanzando los límites de velocidad de la API',
    'arbitrageChart.error.partiallyFilled': 'Posición Parcialmente Llena',
    'arbitrageChart.error.partiallyFilledMessage': 'Si un lado de la posición se abrió exitosamente, debe cerrarlo manualmente en el exchange o usar el botón Cerrar Posición.',
    'arbitrageChart.error.closePosition': 'Cerrar Posición',
    'arbitrageChart.error.closePositionHelp': 'Esto intentará cerrar ambos lados de la posición. Si un lado ya se cerró, solo cerrará el lado restante.',

    // Exchange
    'arbitrageChart.exchange.funding': 'Tasa de Financiamiento',
    'arbitrageChart.exchange.accountBalance': 'Balance de Cuenta',
    'arbitrageChart.exchange.loading': 'Cargando...',
    'arbitrageChart.exchange.total': 'Total',
    'arbitrageChart.exchange.available': 'Disponible',

    // Form
    'arbitrageChart.form.spotMarketInfo': 'Mercado spot - solo compra, sin apalancamiento',
    'arbitrageChart.form.side': 'Lado',
    'arbitrageChart.form.long': 'Largo',
    'arbitrageChart.form.short': 'Corto',
    'arbitrageChart.form.leverage': 'Apalancamiento',
    'arbitrageChart.form.parts': 'Partes',
    'arbitrageChart.form.partsRangeSpot': '(1-5)',
    'arbitrageChart.form.splitBuy': 'Dividir compra en múltiples partes',
    'arbitrageChart.form.delay': 'Retraso (segundos)',
    'arbitrageChart.form.delayRangeSpot': '(0.1-10s)',
    'arbitrageChart.form.delayBetweenBuys': 'Retraso entre compras',
    'arbitrageChart.form.partsRange': '(1-20)',
    'arbitrageChart.form.delayRange': '(0.1-60s)',

    // Sync Lock
    'arbitrageChart.syncLock.locked': 'Los parámetros están sincronizados',
    'arbitrageChart.syncLock.unlocked': 'Los parámetros son independientes',
    'arbitrageChart.syncLock.disabled': 'Sincronización deshabilitada para pares spot/futures',

    // Buttons
    'arbitrageChart.buttons.startingPosition': 'Iniciando Posición...',
    'arbitrageChart.buttons.startArbitrage': 'Iniciar Posición de Arbitraje',
    'arbitrageChart.buttons.stopSignal': 'Detener Señal',
    'arbitrageChart.buttons.startSignal': 'Iniciar Señal',
  },
  fr: {
    // Navigation
    'arbitrageChart.back': 'Retour',
    'arbitrageChart.title': 'Graphique d\'Arbitrage',

    // Loading
    'arbitrageChart.loading': 'Chargement des données du graphique...',
    'arbitrageChart.loadingHistorical': 'Chargement des données historiques...',

    // Chart
    'arbitrageChart.priceSpread': 'Spread de Prix',
    'arbitrageChart.fundingSpread': 'Spread de Financement',
    'arbitrageChart.fit': 'Ajuster',
    'arbitrageChart.fitTooltip': 'Ajuster le graphique au contenu',

    // Active Positions
    'arbitrageChart.activePositions': 'Positions Actives',
    'arbitrageChart.positionCount': 'positions',
    'arbitrageChart.noPositions': 'Aucune position active pour cette paire',
    'arbitrageChart.startPosition': 'Démarrez une nouvelle position d\'arbitrage en utilisant le formulaire ci-dessous',

    // Table
    'arbitrageChart.table.positionId': 'ID de Position',
    'arbitrageChart.table.symbol': 'Symbole',
    'arbitrageChart.table.primaryExchange': 'Exchange Primaire',
    'arbitrageChart.table.hedgeExchange': 'Exchange de Couverture',
    'arbitrageChart.table.status': 'Statut',
    'arbitrageChart.table.startedAt': 'Démarré À',
    'arbitrageChart.table.actions': 'Actions',

    // Actions
    'arbitrageChart.actions.tpsl': 'TP/SL',
    'arbitrageChart.actions.tpslTooltip': 'Définir Take Profit / Stop Loss',
    'arbitrageChart.actions.monitoringActive': 'La surveillance est active',
    'arbitrageChart.actions.monitoringDisabled': 'La surveillance est désactivée',
    'arbitrageChart.actions.monitoringOn': 'Actif',
    'arbitrageChart.actions.monitoringOff': 'Inactif',
    'arbitrageChart.actions.stop': 'Arrêter',

    // Details
    'arbitrageChart.details.metric': 'Métrique',
    'arbitrageChart.details.primary': 'Primaire',
    'arbitrageChart.details.hedge': 'Couverture',
    'arbitrageChart.details.entryPrice': 'Prix d\'Entrée',
    'arbitrageChart.details.unrealizedPnl': 'P&L Non Réalisé',
    'arbitrageChart.details.realizedPnl': 'P&L Réalisé',
    'arbitrageChart.details.liquidationPrice': 'Prix de Liquidation',
    'arbitrageChart.details.liquidationProximity': 'Proximité de Liquidation',
    'arbitrageChart.details.danger': 'DANGER',
    'arbitrageChart.details.stopLoss': 'Stop Loss',
    'arbitrageChart.details.takeProfit': 'Take Profit',
    'arbitrageChart.details.lastFundingPaid': 'Dernier Funding Payé',
    'arbitrageChart.details.totalFundingEarned': 'Funding Total Gagné',
    'arbitrageChart.details.entryFees': 'Frais d\'Entrée',
    'arbitrageChart.details.grossProfit': 'Profit Brut',
    'arbitrageChart.details.netProfit': 'Profit Net',
    'arbitrageChart.details.notAvailable': 'N/A',

    // Error
    'arbitrageChart.error.title': 'Détails de l\'Erreur',
    'arbitrageChart.error.details': 'Détails de l\'Erreur',
    'arbitrageChart.error.howToFix': 'Comment Résoudre',
    'arbitrageChart.error.checkConnectivity': 'Vérifier la Connectivité Réseau',
    'arbitrageChart.error.verifyInternet': 'Vérifiez que votre connexion internet est stable',
    'arbitrageChart.error.checkApis': 'Vérifiez si',
    'arbitrageChart.error.checkApisOperational': 'les APIs sont opérationnelles',
    'arbitrageChart.error.lookForErrors': 'Recherchez les erreurs réseau dans la console du navigateur',
    'arbitrageChart.error.verifyCredentials': 'Vérifier les Identifiants API',
    'arbitrageChart.error.goToProfile': 'Allez à Profil → section Clés API',
    'arbitrageChart.error.testConnection': 'Testez la connexion pour chaque exchange',
    'arbitrageChart.error.checkPermissions': 'Vérifiez que les clés API ont les bonnes permissions (trading de contrats à terme, lire le solde)',
    'arbitrageChart.error.checkStatus': 'Vérifier l\'État de l\'Exchange',
    'arbitrageChart.error.visitWebsites': 'Visitez les sites web des exchanges pour vérifier la maintenance ou les pannes',
    'arbitrageChart.error.checkRateLimits': 'Vérifiez si vous atteignez les limites de débit de l\'API',
    'arbitrageChart.error.partiallyFilled': 'Position Partiellement Remplie',
    'arbitrageChart.error.partiallyFilledMessage': 'Si un côté de la position a été ouvert avec succès, vous devez le fermer manuellement sur l\'exchange ou utiliser le bouton Fermer Position.',
    'arbitrageChart.error.closePosition': 'Fermer Position',
    'arbitrageChart.error.closePositionHelp': 'Cela tentera de fermer les deux côtés de la position. Si un côté a déjà été fermé, il ne fermera que le côté restant.',

    // Exchange
    'arbitrageChart.exchange.funding': 'Taux de Financement',
    'arbitrageChart.exchange.accountBalance': 'Solde du Compte',
    'arbitrageChart.exchange.loading': 'Chargement...',
    'arbitrageChart.exchange.total': 'Total',
    'arbitrageChart.exchange.available': 'Disponible',

    // Form
    'arbitrageChart.form.spotMarketInfo': 'Marché spot - achat uniquement, sans effet de levier',
    'arbitrageChart.form.side': 'Côté',
    'arbitrageChart.form.long': 'Long',
    'arbitrageChart.form.short': 'Court',
    'arbitrageChart.form.leverage': 'Effet de Levier',
    'arbitrageChart.form.parts': 'Parties',
    'arbitrageChart.form.partsRangeSpot': '(1-5)',
    'arbitrageChart.form.splitBuy': 'Diviser l\'achat en plusieurs parties',
    'arbitrageChart.form.delay': 'Délai (secondes)',
    'arbitrageChart.form.delayRangeSpot': '(0.1-10s)',
    'arbitrageChart.form.delayBetweenBuys': 'Délai entre les achats',
    'arbitrageChart.form.partsRange': '(1-20)',
    'arbitrageChart.form.delayRange': '(0.1-60s)',

    // Sync Lock
    'arbitrageChart.syncLock.locked': 'Les paramètres sont synchronisés',
    'arbitrageChart.syncLock.unlocked': 'Les paramètres sont indépendants',
    'arbitrageChart.syncLock.disabled': 'Synchronisation désactivée pour les paires spot/contrats à terme',

    // Buttons
    'arbitrageChart.buttons.startingPosition': 'Démarrage de la Position...',
    'arbitrageChart.buttons.startArbitrage': 'Démarrer Position d\'Arbitrage',
    'arbitrageChart.buttons.stopSignal': 'Arrêter Signal',
    'arbitrageChart.buttons.startSignal': 'Démarrer Signal',
  },
  ru: {
    // Navigation
    'arbitrageChart.back': 'Назад',
    'arbitrageChart.title': 'График Арбитража',

    // Loading
    'arbitrageChart.loading': 'Загрузка данных графика...',
    'arbitrageChart.loadingHistorical': 'Загрузка исторических данных...',

    // Chart
    'arbitrageChart.priceSpread': 'Ценовой Спред',
    'arbitrageChart.fundingSpread': 'Спред Фандинга',
    'arbitrageChart.fit': 'Подогнать',
    'arbitrageChart.fitTooltip': 'Подогнать график под содержимое',

    // Active Positions
    'arbitrageChart.activePositions': 'Активные Позиции',
    'arbitrageChart.positionCount': 'позиций',
    'arbitrageChart.noPositions': 'Нет активных позиций для этой пары',
    'arbitrageChart.startPosition': 'Начните новую арбитражную позицию, используя форму ниже',

    // Table
    'arbitrageChart.table.positionId': 'ID Позиции',
    'arbitrageChart.table.symbol': 'Символ',
    'arbitrageChart.table.primaryExchange': 'Основная Биржа',
    'arbitrageChart.table.hedgeExchange': 'Биржа Хеджирования',
    'arbitrageChart.table.status': 'Статус',
    'arbitrageChart.table.startedAt': 'Начато',
    'arbitrageChart.table.actions': 'Действия',

    // Actions
    'arbitrageChart.actions.tpsl': 'TP/SL',
    'arbitrageChart.actions.tpslTooltip': 'Установить Take Profit / Stop Loss',
    'arbitrageChart.actions.monitoringActive': 'Мониторинг активен',
    'arbitrageChart.actions.monitoringDisabled': 'Мониторинг отключен',
    'arbitrageChart.actions.monitoringOn': 'Вкл',
    'arbitrageChart.actions.monitoringOff': 'Выкл',
    'arbitrageChart.actions.stop': 'Остановить',

    // Details
    'arbitrageChart.details.metric': 'Метрика',
    'arbitrageChart.details.primary': 'Основная',
    'arbitrageChart.details.hedge': 'Хедж',
    'arbitrageChart.details.entryPrice': 'Цена Входа',
    'arbitrageChart.details.unrealizedPnl': 'Нереализованная P&L',
    'arbitrageChart.details.realizedPnl': 'Реализованная P&L',
    'arbitrageChart.details.liquidationPrice': 'Цена Ликвидации',
    'arbitrageChart.details.liquidationProximity': 'Близость к Ликвидации',
    'arbitrageChart.details.danger': 'ОПАСНОСТЬ',
    'arbitrageChart.details.stopLoss': 'Stop Loss',
    'arbitrageChart.details.takeProfit': 'Take Profit',
    'arbitrageChart.details.lastFundingPaid': 'Последний Фандинг Выплачен',
    'arbitrageChart.details.totalFundingEarned': 'Общий Фандинг Заработан',
    'arbitrageChart.details.entryFees': 'Комиссии за Вход',
    'arbitrageChart.details.grossProfit': 'Валовая Прибыль',
    'arbitrageChart.details.netProfit': 'Чистая Прибыль',
    'arbitrageChart.details.notAvailable': 'Н/Д',

    // Error
    'arbitrageChart.error.title': 'Детали Ошибки',
    'arbitrageChart.error.details': 'Детали Ошибки',
    'arbitrageChart.error.howToFix': 'Как Исправить',
    'arbitrageChart.error.checkConnectivity': 'Проверьте Сетевое Подключение',
    'arbitrageChart.error.verifyInternet': 'Убедитесь, что ваше интернет-соединение стабильно',
    'arbitrageChart.error.checkApis': 'Проверьте, работают ли',
    'arbitrageChart.error.checkApisOperational': 'API',
    'arbitrageChart.error.lookForErrors': 'Проверьте консоль браузера на наличие сетевых ошибок',
    'arbitrageChart.error.verifyCredentials': 'Проверьте Учетные Данные API',
    'arbitrageChart.error.goToProfile': 'Перейдите в Профиль → раздел API Ключи',
    'arbitrageChart.error.testConnection': 'Протестируйте подключение для каждой биржи',
    'arbitrageChart.error.checkPermissions': 'Проверьте, что API ключи имеют правильные разрешения (торговля фьючерсами, чтение баланса)',
    'arbitrageChart.error.checkStatus': 'Проверьте Статус Биржи',
    'arbitrageChart.error.visitWebsites': 'Посетите веб-сайты бирж для проверки технического обслуживания или сбоев',
    'arbitrageChart.error.checkRateLimits': 'Проверьте, не достигли ли вы лимитов скорости API',
    'arbitrageChart.error.partiallyFilled': 'Частично Заполненная Позиция',
    'arbitrageChart.error.partiallyFilledMessage': 'Если одна сторона позиции была успешно открыта, вы должны закрыть ее вручную на бирже или использовать кнопку Закрыть Позицию.',
    'arbitrageChart.error.closePosition': 'Закрыть Позицию',
    'arbitrageChart.error.closePositionHelp': 'Это попытается закрыть обе стороны позиции. Если одна сторона уже закрыта, будет закрыта только оставшаяся сторона.',

    // Exchange
    'arbitrageChart.exchange.funding': 'Ставка Фандинга',
    'arbitrageChart.exchange.accountBalance': 'Баланс Аккаунта',
    'arbitrageChart.exchange.loading': 'Загрузка...',
    'arbitrageChart.exchange.total': 'Всего',
    'arbitrageChart.exchange.available': 'Доступно',

    // Form
    'arbitrageChart.form.spotMarketInfo': 'Спотовый рынок - только покупка, без плеча',
    'arbitrageChart.form.side': 'Сторона',
    'arbitrageChart.form.long': 'Лонг',
    'arbitrageChart.form.short': 'Шорт',
    'arbitrageChart.form.leverage': 'Плечо',
    'arbitrageChart.form.parts': 'Части',
    'arbitrageChart.form.partsRangeSpot': '(1-5)',
    'arbitrageChart.form.splitBuy': 'Разделить покупку на несколько частей',
    'arbitrageChart.form.delay': 'Задержка (секунды)',
    'arbitrageChart.form.delayRangeSpot': '(0.1-10с)',
    'arbitrageChart.form.delayBetweenBuys': 'Задержка между покупками',
    'arbitrageChart.form.partsRange': '(1-20)',
    'arbitrageChart.form.delayRange': '(0.1-60с)',

    // Sync Lock
    'arbitrageChart.syncLock.locked': 'Параметры синхронизированы',
    'arbitrageChart.syncLock.unlocked': 'Параметры независимы',
    'arbitrageChart.syncLock.disabled': 'Синхронизация отключена для спот/фьючерс пар',

    // Buttons
    'arbitrageChart.buttons.startingPosition': 'Открытие Позиции...',
    'arbitrageChart.buttons.startArbitrage': 'Начать Арбитражную Позицию',
    'arbitrageChart.buttons.stopSignal': 'Остановить Сигнал',
    'arbitrageChart.buttons.startSignal': 'Запустить Сигнал',
  },
  uk: {
    // Navigation
    'arbitrageChart.back': 'Назад',
    'arbitrageChart.title': 'Графік Арбітражу',

    // Loading
    'arbitrageChart.loading': 'Завантаження даних графіка...',
    'arbitrageChart.loadingHistorical': 'Завантаження історичних даних...',

    // Chart
    'arbitrageChart.priceSpread': 'Ціновий Спред',
    'arbitrageChart.fundingSpread': 'Спред Фандінгу',
    'arbitrageChart.fit': 'Підігнати',
    'arbitrageChart.fitTooltip': 'Підігнати графік під вміст',

    // Active Positions
    'arbitrageChart.activePositions': 'Активні Позиції',
    'arbitrageChart.positionCount': 'позицій',
    'arbitrageChart.noPositions': 'Немає активних позицій для цієї пари',
    'arbitrageChart.startPosition': 'Почніть нову арбітражну позицію, використовуючи форму нижче',

    // Table
    'arbitrageChart.table.positionId': 'ID Позиції',
    'arbitrageChart.table.symbol': 'Символ',
    'arbitrageChart.table.primaryExchange': 'Основна Біржа',
    'arbitrageChart.table.hedgeExchange': 'Біржа Хеджування',
    'arbitrageChart.table.status': 'Статус',
    'arbitrageChart.table.startedAt': 'Почато',
    'arbitrageChart.table.actions': 'Дії',

    // Actions
    'arbitrageChart.actions.tpsl': 'TP/SL',
    'arbitrageChart.actions.tpslTooltip': 'Встановити Take Profit / Stop Loss',
    'arbitrageChart.actions.monitoringActive': 'Моніторинг активний',
    'arbitrageChart.actions.monitoringDisabled': 'Моніторинг вимкнено',
    'arbitrageChart.actions.monitoringOn': 'Увімк',
    'arbitrageChart.actions.monitoringOff': 'Вимк',
    'arbitrageChart.actions.stop': 'Зупинити',

    // Details
    'arbitrageChart.details.metric': 'Метрика',
    'arbitrageChart.details.primary': 'Основна',
    'arbitrageChart.details.hedge': 'Хедж',
    'arbitrageChart.details.entryPrice': 'Ціна Входу',
    'arbitrageChart.details.unrealizedPnl': 'Нереалізована P&L',
    'arbitrageChart.details.realizedPnl': 'Реалізована P&L',
    'arbitrageChart.details.liquidationPrice': 'Ціна Ліквідації',
    'arbitrageChart.details.liquidationProximity': 'Близькість до Ліквідації',
    'arbitrageChart.details.danger': 'НЕБЕЗПЕКА',
    'arbitrageChart.details.stopLoss': 'Stop Loss',
    'arbitrageChart.details.takeProfit': 'Take Profit',
    'arbitrageChart.details.lastFundingPaid': 'Останній Фандінг Сплачено',
    'arbitrageChart.details.totalFundingEarned': 'Загальний Фандінг Заробити',
    'arbitrageChart.details.entryFees': 'Комісії за Вхід',
    'arbitrageChart.details.grossProfit': 'Валовий Прибуток',
    'arbitrageChart.details.netProfit': 'Чистий Прибуток',
    'arbitrageChart.details.notAvailable': 'Н/Д',

    // Error
    'arbitrageChart.error.title': 'Деталі Помилки',
    'arbitrageChart.error.details': 'Деталі Помилки',
    'arbitrageChart.error.howToFix': 'Як Виправити',
    'arbitrageChart.error.checkConnectivity': 'Перевірте Мережеве Підключення',
    'arbitrageChart.error.verifyInternet': 'Переконайтеся, що ваше інтернет-з\'єднання стабільне',
    'arbitrageChart.error.checkApis': 'Перевірте, чи працюють',
    'arbitrageChart.error.checkApisOperational': 'API',
    'arbitrageChart.error.lookForErrors': 'Перевірте консоль браузера на наявність мережевих помилок',
    'arbitrageChart.error.verifyCredentials': 'Перевірте Облікові Дані API',
    'arbitrageChart.error.goToProfile': 'Перейдіть до Профіль → розділ API Ключі',
    'arbitrageChart.error.testConnection': 'Протестуйте підключення для кожної біржі',
    'arbitrageChart.error.checkPermissions': 'Перевірте, що API ключі мають правильні дозволи (торгівля ф\'ючерсами, читання балансу)',
    'arbitrageChart.error.checkStatus': 'Перевірте Статус Біржі',
    'arbitrageChart.error.visitWebsites': 'Відвідайте веб-сайти бірж для перевірки технічного обслуговування або збоїв',
    'arbitrageChart.error.checkRateLimits': 'Перевірте, чи не досягли ви лімітів швидкості API',
    'arbitrageChart.error.partiallyFilled': 'Частково Заповнена Позиція',
    'arbitrageChart.error.partiallyFilledMessage': 'Якщо одна сторона позиції була успішно відкрита, ви повинні закрити її вручну на біржі або використовувати кнопку Закрити Позицію.',
    'arbitrageChart.error.closePosition': 'Закрити Позицію',
    'arbitrageChart.error.closePositionHelp': 'Це спробує закрити обидві сторони позиції. Якщо одна сторона вже закрита, буде закрита тільки залишкова сторона.',

    // Exchange
    'arbitrageChart.exchange.funding': 'Ставка Фандінгу',
    'arbitrageChart.exchange.accountBalance': 'Баланс Акаунта',
    'arbitrageChart.exchange.loading': 'Завантаження...',
    'arbitrageChart.exchange.total': 'Всього',
    'arbitrageChart.exchange.available': 'Доступно',

    // Form
    'arbitrageChart.form.spotMarketInfo': 'Спотовий ринок - тільки купівля, без плеча',
    'arbitrageChart.form.side': 'Сторона',
    'arbitrageChart.form.long': 'Лонг',
    'arbitrageChart.form.short': 'Шорт',
    'arbitrageChart.form.leverage': 'Плече',
    'arbitrageChart.form.parts': 'Частини',
    'arbitrageChart.form.partsRangeSpot': '(1-5)',
    'arbitrageChart.form.splitBuy': 'Розділити купівлю на кілька частин',
    'arbitrageChart.form.delay': 'Затримка (секунди)',
    'arbitrageChart.form.delayRangeSpot': '(0.1-10с)',
    'arbitrageChart.form.delayBetweenBuys': 'Затримка між купівлями',
    'arbitrageChart.form.partsRange': '(1-20)',
    'arbitrageChart.form.delayRange': '(0.1-60с)',

    // Sync Lock
    'arbitrageChart.syncLock.locked': 'Параметри синхронізовані',
    'arbitrageChart.syncLock.unlocked': 'Параметри незалежні',
    'arbitrageChart.syncLock.disabled': 'Синхронізація вимкнена для спот/ф\'ючерс пар',

    // Buttons
    'arbitrageChart.buttons.startingPosition': 'Відкриття Позиції...',
    'arbitrageChart.buttons.startArbitrage': 'Почати Арбітражну Позицію',
    'arbitrageChart.buttons.stopSignal': 'Зупинити Сигнал',
    'arbitrageChart.buttons.startSignal': 'Запустити Сигнал',
  }
};
