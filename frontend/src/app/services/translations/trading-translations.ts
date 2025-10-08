/**
 * Trading Dashboard Translation Keys
 *
 * This file contains all translation keys for the trading dashboard component.
 * These keys should be added to the TranslationService's translations object.
 *
 * To integrate these translations:
 * 1. Copy the translations for each language
 * 2. Add them to the corresponding language object in translation.service.ts
 * 3. Ensure all keys start with 'trading.' prefix for proper namespacing
 */

export const tradingTranslations = {
  en: {
    // Dashboard
    'trading.dashboard.title': 'Manual Trading',
    'trading.loading': 'Loading...',

    // Actions
    'trading.actions.refresh': 'Refresh',
    'trading.actions.autoRefresh': 'Auto Refresh',
    'trading.actions.buy': 'Buy',
    'trading.actions.sell': 'Sell',
    'trading.actions.close': 'Close',
    'trading.actions.cancel': 'Cancel',

    // Balance Section
    'trading.balance.title': 'Account Balance',
    'trading.balance.total': 'Total Balance',
    'trading.balance.available': 'Available Balance',
    'trading.balance.marginUsed': 'Margin Used',
    'trading.balance.unrealizedPnl': 'Unrealized PnL',
    'trading.balance.loading': 'Loading balance...',

    // Order Form
    'trading.orderForm.title': 'Place Order',
    'trading.orderForm.exchange': 'Exchange',
    'trading.orderForm.symbol': 'Trading Pair',
    'trading.orderForm.type': 'Order Type',
    'trading.orderForm.side': 'Side',
    'trading.orderForm.quantity': 'Quantity',
    'trading.orderForm.price': 'Price',
    'trading.orderForm.stopLoss': 'Stop Loss',
    'trading.orderForm.takeProfit': 'Take Profit',
    'trading.orderForm.timeInForce': 'Time in Force',
    'trading.orderForm.optional': 'Optional',

    // Order Types
    'trading.orderType.market': 'Market',
    'trading.orderType.limit': 'Limit',

    // Order Sides
    'trading.side.buy': 'Buy',
    'trading.side.sell': 'Sell',

    // Positions Section
    'trading.positions.title': 'Open Positions',
    'trading.positions.empty': 'No open positions',
    'trading.positions.totalUnrealizedPnl': 'Total Unrealized PnL',

    // Orders Section
    'trading.orders.title': 'Order History',
    'trading.orders.empty': 'No orders yet',

    // Table Headers
    'trading.table.symbol': 'Symbol',
    'trading.table.side': 'Side',
    'trading.table.type': 'Type',
    'trading.table.size': 'Size',
    'trading.table.quantity': 'Quantity',
    'trading.table.entryPrice': 'Entry Price',
    'trading.table.markPrice': 'Mark Price',
    'trading.table.unrealizedPnl': 'Unrealized PnL',
    'trading.table.leverage': 'Leverage',
    'trading.table.price': 'Price',
    'trading.table.status': 'Status',
    'trading.table.time': 'Time',
    'trading.table.actions': 'Actions',

    // Form Errors
    'trading.errors.quantityRequired': 'Quantity is required',
    'trading.errors.quantityMin': 'Quantity must be at least 0.0001',
    'trading.errors.priceRequired': 'Price is required for limit orders',
    'trading.errors.priceMin': 'Price must be greater than 0',
    'trading.errors.stopLossMin': 'Stop loss must be greater than 0',
    'trading.errors.takeProfitMin': 'Take profit must be greater than 0',

    // Confirmations
    'trading.confirmClosePosition': 'Are you sure you want to close this position?',
    'trading.confirmCancelOrder': 'Are you sure you want to cancel this order?',

    // Success Messages
    'trading.success.orderPlaced': 'Order placed successfully',
    'trading.success.positionClosed': 'Position closed successfully',
    'trading.success.orderCancelled': 'Order cancelled successfully',

    // Error Messages
    'trading.error.orderFailed': 'Failed to place order',
    'trading.error.closeFailed': 'Failed to close position',
    'trading.error.cancelFailed': 'Failed to cancel order',
    'trading.error.loadPositions': 'Failed to load positions',
    'trading.error.loadOrders': 'Failed to load orders',
    'trading.error.loadBalance': 'Failed to load balance',

    // Funding Rates
    'funding.title': 'Funding Rates',
    'funding.loading': 'Loading funding rates...',
    'funding.empty': 'No funding rates available',
    'funding.refresh': 'Refresh',
    'funding.autoRefresh': 'Auto Refresh',
    'funding.retry': 'Retry',
    'funding.totalPairs': 'Total Pairs',
    'funding.table.symbol': 'Symbol',
    'funding.table.lastPrice': 'Last Price',
    'funding.table.change24h': '24h Change',
    'funding.table.fundingRate': 'Funding Rate',
    'funding.table.nextFunding': 'Next Funding',
    'funding.table.openInterest': 'Open Interest',
    'funding.table.volume24h': '24h Volume'
  },

  es: {
    // Dashboard
    'trading.dashboard.title': 'Trading Manual',
    'trading.loading': 'Cargando...',

    // Actions
    'trading.actions.refresh': 'Actualizar',
    'trading.actions.autoRefresh': 'Auto Actualizar',
    'trading.actions.buy': 'Comprar',
    'trading.actions.sell': 'Vender',
    'trading.actions.close': 'Cerrar',
    'trading.actions.cancel': 'Cancelar',

    // Balance Section
    'trading.balance.title': 'Saldo de Cuenta',
    'trading.balance.total': 'Saldo Total',
    'trading.balance.available': 'Saldo Disponible',
    'trading.balance.marginUsed': 'Margen Usado',
    'trading.balance.unrealizedPnl': 'PnL No Realizado',
    'trading.balance.loading': 'Cargando saldo...',

    // Order Form
    'trading.orderForm.title': 'Crear Orden',
    'trading.orderForm.exchange': 'Exchange',
    'trading.orderForm.symbol': 'Par de Trading',
    'trading.orderForm.type': 'Tipo de Orden',
    'trading.orderForm.side': 'Lado',
    'trading.orderForm.quantity': 'Cantidad',
    'trading.orderForm.price': 'Precio',
    'trading.orderForm.stopLoss': 'Stop Loss',
    'trading.orderForm.takeProfit': 'Take Profit',
    'trading.orderForm.timeInForce': 'Tiempo en Vigor',
    'trading.orderForm.optional': 'Opcional',

    // Order Types
    'trading.orderType.market': 'Mercado',
    'trading.orderType.limit': 'Límite',

    // Order Sides
    'trading.side.buy': 'Comprar',
    'trading.side.sell': 'Vender',

    // Positions Section
    'trading.positions.title': 'Posiciones Abiertas',
    'trading.positions.empty': 'Sin posiciones abiertas',
    'trading.positions.totalUnrealizedPnl': 'PnL Total No Realizado',

    // Orders Section
    'trading.orders.title': 'Historial de Órdenes',
    'trading.orders.empty': 'Sin órdenes todavía',

    // Table Headers
    'trading.table.symbol': 'Símbolo',
    'trading.table.side': 'Lado',
    'trading.table.type': 'Tipo',
    'trading.table.size': 'Tamaño',
    'trading.table.quantity': 'Cantidad',
    'trading.table.entryPrice': 'Precio de Entrada',
    'trading.table.markPrice': 'Precio de Marca',
    'trading.table.unrealizedPnl': 'PnL No Realizado',
    'trading.table.leverage': 'Apalancamiento',
    'trading.table.price': 'Precio',
    'trading.table.status': 'Estado',
    'trading.table.time': 'Tiempo',
    'trading.table.actions': 'Acciones',

    // Form Errors
    'trading.errors.quantityRequired': 'La cantidad es requerida',
    'trading.errors.quantityMin': 'La cantidad debe ser al menos 0.0001',
    'trading.errors.priceRequired': 'El precio es requerido para órdenes límite',
    'trading.errors.priceMin': 'El precio debe ser mayor que 0',
    'trading.errors.stopLossMin': 'El stop loss debe ser mayor que 0',
    'trading.errors.takeProfitMin': 'El take profit debe ser mayor que 0',

    // Confirmations
    'trading.confirmClosePosition': '¿Está seguro de que desea cerrar esta posición?',
    'trading.confirmCancelOrder': '¿Está seguro de que desea cancelar esta orden?',

    // Success Messages
    'trading.success.orderPlaced': 'Orden creada exitosamente',
    'trading.success.positionClosed': 'Posición cerrada exitosamente',
    'trading.success.orderCancelled': 'Orden cancelada exitosamente',

    // Error Messages
    'trading.error.orderFailed': 'Error al crear orden',
    'trading.error.closeFailed': 'Error al cerrar posición',
    'trading.error.cancelFailed': 'Error al cancelar orden',
    'trading.error.loadPositions': 'Error al cargar posiciones',
    'trading.error.loadOrders': 'Error al cargar órdenes',
    'trading.error.loadBalance': 'Error al cargar saldo'
  },

  fr: {
    // Dashboard
    'trading.dashboard.title': 'Trading Manuel',
    'trading.loading': 'Chargement...',

    // Actions
    'trading.actions.refresh': 'Actualiser',
    'trading.actions.autoRefresh': 'Auto Actualiser',
    'trading.actions.buy': 'Acheter',
    'trading.actions.sell': 'Vendre',
    'trading.actions.close': 'Fermer',
    'trading.actions.cancel': 'Annuler',

    // Balance Section
    'trading.balance.title': 'Solde du Compte',
    'trading.balance.total': 'Solde Total',
    'trading.balance.available': 'Solde Disponible',
    'trading.balance.marginUsed': 'Marge Utilisée',
    'trading.balance.unrealizedPnl': 'PnL Non Réalisé',
    'trading.balance.loading': 'Chargement du solde...',

    // Order Form
    'trading.orderForm.title': 'Passer un Ordre',
    'trading.orderForm.exchange': 'Exchange',
    'trading.orderForm.symbol': 'Paire de Trading',
    'trading.orderForm.type': "Type d'Ordre",
    'trading.orderForm.side': 'Côté',
    'trading.orderForm.quantity': 'Quantité',
    'trading.orderForm.price': 'Prix',
    'trading.orderForm.stopLoss': 'Stop Loss',
    'trading.orderForm.takeProfit': 'Take Profit',
    'trading.orderForm.timeInForce': 'Validité',
    'trading.orderForm.optional': 'Optionnel',

    // Order Types
    'trading.orderType.market': 'Marché',
    'trading.orderType.limit': 'Limite',

    // Order Sides
    'trading.side.buy': 'Acheter',
    'trading.side.sell': 'Vendre',

    // Positions Section
    'trading.positions.title': 'Positions Ouvertes',
    'trading.positions.empty': 'Aucune position ouverte',
    'trading.positions.totalUnrealizedPnl': 'PnL Total Non Réalisé',

    // Orders Section
    'trading.orders.title': 'Historique des Ordres',
    'trading.orders.empty': 'Aucun ordre pour le moment',

    // Table Headers
    'trading.table.symbol': 'Symbole',
    'trading.table.side': 'Côté',
    'trading.table.type': 'Type',
    'trading.table.size': 'Taille',
    'trading.table.quantity': 'Quantité',
    'trading.table.entryPrice': "Prix d'Entrée",
    'trading.table.markPrice': 'Prix de Marque',
    'trading.table.unrealizedPnl': 'PnL Non Réalisé',
    'trading.table.leverage': 'Levier',
    'trading.table.price': 'Prix',
    'trading.table.status': 'Statut',
    'trading.table.time': 'Temps',
    'trading.table.actions': 'Actions',

    // Form Errors
    'trading.errors.quantityRequired': 'La quantité est requise',
    'trading.errors.quantityMin': 'La quantité doit être au moins 0.0001',
    'trading.errors.priceRequired': 'Le prix est requis pour les ordres limites',
    'trading.errors.priceMin': 'Le prix doit être supérieur à 0',
    'trading.errors.stopLossMin': 'Le stop loss doit être supérieur à 0',
    'trading.errors.takeProfitMin': 'Le take profit doit être supérieur à 0',

    // Confirmations
    'trading.confirmClosePosition': 'Êtes-vous sûr de vouloir fermer cette position?',
    'trading.confirmCancelOrder': 'Êtes-vous sûr de vouloir annuler cet ordre?',

    // Success Messages
    'trading.success.orderPlaced': 'Ordre passé avec succès',
    'trading.success.positionClosed': 'Position fermée avec succès',
    'trading.success.orderCancelled': 'Ordre annulé avec succès',

    // Error Messages
    'trading.error.orderFailed': "Échec de la création de l'ordre",
    'trading.error.closeFailed': 'Échec de la fermeture de la position',
    'trading.error.cancelFailed': "Échec de l'annulation de l'ordre",
    'trading.error.loadPositions': 'Échec du chargement des positions',
    'trading.error.loadOrders': 'Échec du chargement des ordres',
    'trading.error.loadBalance': 'Échec du chargement du solde'
  },

  ru: {
    // Dashboard
    'trading.dashboard.title': 'Ручная Торговля',
    'trading.loading': 'Загрузка...',

    // Actions
    'trading.actions.refresh': 'Обновить',
    'trading.actions.autoRefresh': 'Авто Обновление',
    'trading.actions.buy': 'Купить',
    'trading.actions.sell': 'Продать',
    'trading.actions.close': 'Закрыть',
    'trading.actions.cancel': 'Отменить',

    // Balance Section
    'trading.balance.title': 'Баланс Счета',
    'trading.balance.total': 'Общий Баланс',
    'trading.balance.available': 'Доступный Баланс',
    'trading.balance.marginUsed': 'Использованная Маржа',
    'trading.balance.unrealizedPnl': 'Нереализованная Прибыль',
    'trading.balance.loading': 'Загрузка баланса...',

    // Order Form
    'trading.orderForm.title': 'Создать Ордер',
    'trading.orderForm.exchange': 'Биржа',
    'trading.orderForm.symbol': 'Торговая Пара',
    'trading.orderForm.type': 'Тип Ордера',
    'trading.orderForm.side': 'Сторона',
    'trading.orderForm.quantity': 'Количество',
    'trading.orderForm.price': 'Цена',
    'trading.orderForm.stopLoss': 'Стоп Лосс',
    'trading.orderForm.takeProfit': 'Тейк Профит',
    'trading.orderForm.timeInForce': 'Время Действия',
    'trading.orderForm.optional': 'Опционально',

    // Order Types
    'trading.orderType.market': 'Рыночный',
    'trading.orderType.limit': 'Лимитный',

    // Order Sides
    'trading.side.buy': 'Купить',
    'trading.side.sell': 'Продать',

    // Positions Section
    'trading.positions.title': 'Открытые Позиции',
    'trading.positions.empty': 'Нет открытых позиций',
    'trading.positions.totalUnrealizedPnl': 'Общая Нереализованная Прибыль',

    // Orders Section
    'trading.orders.title': 'История Ордеров',
    'trading.orders.empty': 'Нет ордеров',

    // Table Headers
    'trading.table.symbol': 'Символ',
    'trading.table.side': 'Сторона',
    'trading.table.type': 'Тип',
    'trading.table.size': 'Размер',
    'trading.table.quantity': 'Количество',
    'trading.table.entryPrice': 'Цена Входа',
    'trading.table.markPrice': 'Маркет Цена',
    'trading.table.unrealizedPnl': 'Нереализ. Прибыль',
    'trading.table.leverage': 'Плечо',
    'trading.table.price': 'Цена',
    'trading.table.status': 'Статус',
    'trading.table.time': 'Время',
    'trading.table.actions': 'Действия',

    // Form Errors
    'trading.errors.quantityRequired': 'Количество обязательно',
    'trading.errors.quantityMin': 'Количество должно быть не менее 0.0001',
    'trading.errors.priceRequired': 'Цена обязательна для лимитных ордеров',
    'trading.errors.priceMin': 'Цена должна быть больше 0',
    'trading.errors.stopLossMin': 'Стоп лосс должен быть больше 0',
    'trading.errors.takeProfitMin': 'Тейк профит должен быть больше 0',

    // Confirmations
    'trading.confirmClosePosition': 'Вы уверены, что хотите закрыть эту позицию?',
    'trading.confirmCancelOrder': 'Вы уверены, что хотите отменить этот ордер?',

    // Success Messages
    'trading.success.orderPlaced': 'Ордер успешно создан',
    'trading.success.positionClosed': 'Позиция успешно закрыта',
    'trading.success.orderCancelled': 'Ордер успешно отменен',

    // Error Messages
    'trading.error.orderFailed': 'Не удалось создать ордер',
    'trading.error.closeFailed': 'Не удалось закрыть позицию',
    'trading.error.cancelFailed': 'Не удалось отменить ордер',
    'trading.error.loadPositions': 'Не удалось загрузить позиции',
    'trading.error.loadOrders': 'Не удалось загрузить ордера',
    'trading.error.loadBalance': 'Не удалось загрузить баланс'
  },

  uk: {
    // Dashboard
    'trading.dashboard.title': 'Ручна Торгівля',
    'trading.loading': 'Завантаження...',

    // Actions
    'trading.actions.refresh': 'Оновити',
    'trading.actions.autoRefresh': 'Авто Оновлення',
    'trading.actions.buy': 'Купити',
    'trading.actions.sell': 'Продати',
    'trading.actions.close': 'Закрити',
    'trading.actions.cancel': 'Скасувати',

    // Balance Section
    'trading.balance.title': 'Баланс Рахунку',
    'trading.balance.total': 'Загальний Баланс',
    'trading.balance.available': 'Доступний Баланс',
    'trading.balance.marginUsed': 'Використана Маржа',
    'trading.balance.unrealizedPnl': 'Нереалізований Прибуток',
    'trading.balance.loading': 'Завантаження балансу...',

    // Order Form
    'trading.orderForm.title': 'Створити Ордер',
    'trading.orderForm.exchange': 'Біржа',
    'trading.orderForm.symbol': 'Торгова Пара',
    'trading.orderForm.type': 'Тип Ордера',
    'trading.orderForm.side': 'Сторона',
    'trading.orderForm.quantity': 'Кількість',
    'trading.orderForm.price': 'Ціна',
    'trading.orderForm.stopLoss': 'Стоп Лосс',
    'trading.orderForm.takeProfit': 'Тейк Профіт',
    'trading.orderForm.timeInForce': 'Час Дії',
    'trading.orderForm.optional': 'Опціонально',

    // Order Types
    'trading.orderType.market': 'Ринковий',
    'trading.orderType.limit': 'Лімітний',

    // Order Sides
    'trading.side.buy': 'Купити',
    'trading.side.sell': 'Продати',

    // Positions Section
    'trading.positions.title': 'Відкриті Позиції',
    'trading.positions.empty': 'Немає відкритих позицій',
    'trading.positions.totalUnrealizedPnl': 'Загальний Нереалізований Прибуток',

    // Orders Section
    'trading.orders.title': 'Історія Ордерів',
    'trading.orders.empty': 'Немає ордерів',

    // Table Headers
    'trading.table.symbol': 'Символ',
    'trading.table.side': 'Сторона',
    'trading.table.type': 'Тип',
    'trading.table.size': 'Розмір',
    'trading.table.quantity': 'Кількість',
    'trading.table.entryPrice': 'Ціна Входу',
    'trading.table.markPrice': 'Маркет Ціна',
    'trading.table.unrealizedPnl': 'Нереаліз. Прибуток',
    'trading.table.leverage': 'Плече',
    'trading.table.price': 'Ціна',
    'trading.table.status': 'Статус',
    'trading.table.time': 'Час',
    'trading.table.actions': 'Дії',

    // Form Errors
    'trading.errors.quantityRequired': "Кількість обов'язкова",
    'trading.errors.quantityMin': 'Кількість повинна бути не менше 0.0001',
    'trading.errors.priceRequired': "Ціна обов'язкова для лімітних ордерів",
    'trading.errors.priceMin': 'Ціна повинна бути більше 0',
    'trading.errors.stopLossMin': 'Стоп лосс повинен бути більше 0',
    'trading.errors.takeProfitMin': 'Тейк профіт повинен бути більше 0',

    // Confirmations
    'trading.confirmClosePosition': 'Ви впевнені, що хочете закрити цю позицію?',
    'trading.confirmCancelOrder': 'Ви впевнені, що хочете скасувати цей ордер?',

    // Success Messages
    'trading.success.orderPlaced': 'Ордер успішно створено',
    'trading.success.positionClosed': 'Позицію успішно закрито',
    'trading.success.orderCancelled': 'Ордер успішно скасовано',

    // Error Messages
    'trading.error.orderFailed': 'Не вдалося створити ордер',
    'trading.error.closeFailed': 'Не вдалося закрити позицію',
    'trading.error.cancelFailed': 'Не вдалося скасувати ордер',
    'trading.error.loadPositions': 'Не вдалося завантажити позиції',
    'trading.error.loadOrders': 'Не вдалося завантажити ордера',
    'trading.error.loadBalance': 'Не вдалося завантажити баланс'
  }
};
