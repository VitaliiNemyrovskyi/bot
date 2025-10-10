"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[76],{

/***/ 8430:
/*!**********************************************!*\
  !*** ./src/app/services/grid-bot.service.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridBotService: () => (/* binding */ GridBotService)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../environments/environment */ 5312);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);




let GridBotService = /*#__PURE__*/(() => {
  class GridBotService {
    constructor(http) {
      this.http = http;
      this.apiUrl = `${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/trading`;
    }
    // Grid Bot Management
    createBot(config) {
      return this.http.post(`${this.apiUrl}/grid-bot`, config);
    }
    getBots() {
      return this.http.get(`${this.apiUrl}/grid-bot`);
    }
    getBot(botId) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('botId', botId);
      return this.http.get(`${this.apiUrl}/grid-bot`, {
        params
      });
    }
    updateBot(botId, action, config) {
      const payload = {
        botId,
        action,
        config
      };
      return this.http.put(`${this.apiUrl}/grid-bot`, payload);
    }
    deleteBot(botId) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('botId', botId);
      return this.http.delete(`${this.apiUrl}/grid-bot`, {
        params
      });
    }
    // Backtesting
    runBacktest(request) {
      return this.http.post(`${this.apiUrl}/backtest`, request);
    }
    getBacktests() {
      return this.http.get(`${this.apiUrl}/backtest`);
    }
    getBacktest(backtestId) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('backtestId', backtestId);
      return this.http.get(`${this.apiUrl}/backtest`, {
        params
      });
    }
    deleteBacktest(backtestId) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('backtestId', backtestId);
      return this.http.delete(`${this.apiUrl}/backtest`, {
        params
      });
    }
    // Market Data
    getMarketData(symbol, timeframe = '1h', limit = 100) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('symbol', symbol).set('timeframe', timeframe).set('limit', limit.toString());
      return this.http.get(`${this.apiUrl}/market-data`, {
        params
      });
    }
    getCurrentPrice(symbol) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('symbol', symbol);
      return this.http.get(`${this.apiUrl}/market-data/price`, {
        params
      });
    }
    getSymbols() {
      return this.http.get(`${this.apiUrl}/symbols`);
    }
    // Performance Analytics
    getBotPerformance(botId, period = '24h') {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('botId', botId).set('period', period);
      return this.http.get(`${this.apiUrl}/performance`, {
        params
      });
    }
    getBotTrades(botId, limit = 100) {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('botId', botId).set('limit', limit.toString());
      return this.http.get(`${this.apiUrl}/trades`, {
        params
      });
    }
    // Risk Management
    validateGridConfig(config) {
      return this.http.post(`${this.apiUrl}/validate-config`, config);
    }
    calculateGridMetrics(config) {
      return this.http.post(`${this.apiUrl}/calculate-metrics`, config);
    }
    // Real-time Updates
    subscribeToBot(botId) {
      // This would typically use WebSocket or Server-Sent Events
      // For now, we'll use polling
      return this.http.get(`${this.apiUrl}/bot-status/${botId}`);
    }
    // Portfolio Management
    getPortfolioSummary() {
      return this.http.get(`${this.apiUrl}/portfolio/summary`);
    }
    getPortfolioPerformance(period = '30d') {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('period', period);
      return this.http.get(`${this.apiUrl}/portfolio/performance`, {
        params
      });
    }
    // Alerts and Notifications
    getBotAlerts(botId) {
      const params = botId ? new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('botId', botId) : new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams();
      return this.http.get(`${this.apiUrl}/alerts`, {
        params
      });
    }
    markAlertAsRead(alertId) {
      return this.http.put(`${this.apiUrl}/alerts/${alertId}/read`, {});
    }
    // Export/Import
    exportBotConfig(botId) {
      return this.http.get(`${this.apiUrl}/export/${botId}`, {
        responseType: 'blob'
      });
    }
    importBotConfig(file) {
      const formData = new FormData();
      formData.append('config', file);
      return this.http.post(`${this.apiUrl}/import`, formData);
    }
    // Advanced Analytics
    getCorrelationAnalysis(symbols) {
      return this.http.post(`${this.apiUrl}/analytics/correlation`, {
        symbols
      });
    }
    getOptimalGridParameters(symbol, period = '30d') {
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpParams().set('symbol', symbol).set('period', period);
      return this.http.get(`${this.apiUrl}/analytics/optimal-grid`, {
        params
      });
    }
    static {
      this.ɵfac = function GridBotService_Factory(t) {
        return new (t || GridBotService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
        token: GridBotService,
        factory: GridBotService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return GridBotService;
})();

/***/ }),

/***/ 5312:
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   environment: () => (/* binding */ environment)
/* harmony export */ });
/* harmony import */ var _app_config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../app/config/app.config */ 9740);

const environment = {
  production: false,
  apiUrl: _app_config_app_config__WEBPACK_IMPORTED_MODULE_0__.appConfig.api.baseUrl,
  // This maintains backward compatibility
  googleClientId: 'your-google-client-id-local',
  appName: _app_config_app_config__WEBPACK_IMPORTED_MODULE_0__.appConfig.app.name + ' - Development'
};

/***/ }),

/***/ 9240:
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/observable/interval.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   interval: () => (/* binding */ interval)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ 8473);
/* harmony import */ var _timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timer */ 4876);


function interval(period = 0, scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler) {
  if (period < 0) {
    period = 0;
  }
  return (0,_timer__WEBPACK_IMPORTED_MODULE_1__.timer)(period, period, scheduler);
}

/***/ })

}]);
//# sourceMappingURL=common.js.map