"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[795],{

/***/ 5795:
/*!***************************************************************!*\
  !*** ./src/app/components/chart-demo/chart-demo.component.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChartDemoComponent: () => (/* binding */ ChartDemoComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _trading_chart_trading_chart_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../trading-chart/trading-chart.component */ 6113);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_realtime_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/realtime.service */ 7159);
/* harmony import */ var _services_chart_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/chart.service */ 9886);






let ChartDemoComponent = /*#__PURE__*/(() => {
  class ChartDemoComponent {
    constructor(realtimeService, chartService) {
      this.realtimeService = realtimeService;
      this.chartService = chartService;
      this.selectedSymbol = 'BTCUSDT';
      this.subscriptions = [];
    }
    ngOnInit() {
      console.log('Chart demo component initialized');
    }
    ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.realtimeService.closeAllConnections();
    }
    onSymbolChange(symbol) {
      this.selectedSymbol = symbol;
      console.log('Symbol changed to:', symbol);
    }
    refreshChart() {
      console.log('Refreshing chart...');
    }
    static {
      this.ɵfac = function ChartDemoComponent_Factory(t) {
        return new (t || ChartDemoComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_realtime_service__WEBPACK_IMPORTED_MODULE_1__.RealtimeService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_chart_service__WEBPACK_IMPORTED_MODULE_2__.ChartService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
        type: ChartDemoComponent,
        selectors: [["app-chart-demo"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
        decls: 28,
        vars: 2,
        consts: [[1, "chart-demo-container"], [1, "demo-header"], [1, "chart-section"], [1, "chart-header"], [1, "chart-controls"], [1, "refresh-btn", 3, "click"], [3, "symbolChange", "initialSymbol", "initialResolution"], [1, "api-status"], [1, "status-grid"], [1, "status-item"], [1, "status-label"], [1, "status-value", "connected"]],
        template: function ChartDemoComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "h2");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3, "\uD83D\uDCC8 TradingView Chart with Bybit Integration");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "p");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5, "Real-time cryptocurrency charts powered by Bybit API");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 2)(7, "div", 3)(8, "h3");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9, "BTCUSDT Chart");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "div", 4)(11, "button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function ChartDemoComponent_Template_button_click_11_listener() {
              return ctx.refreshChart();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12, "\uD83D\uDD04 Refresh");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](13, "app-trading-chart", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("symbolChange", function ChartDemoComponent_Template_app_trading_chart_symbolChange_13_listener($event) {
              return ctx.onSymbolChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "div", 7)(15, "h4");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16, "API Status");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](17, "div", 8)(18, "div", 9)(19, "span", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](20, "Backend Connection:");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](21, "span", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](22, "Connected");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](23, "div", 9)(24, "span", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](25, "Bybit API:");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](26, "span", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](27, "Active");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](13);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("initialSymbol", "BTCUSDT")("initialResolution", "60");
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule, _trading_chart_trading_chart_component__WEBPACK_IMPORTED_MODULE_0__.TradingChartComponent],
        styles: [".chart-demo-container[_ngcontent-%COMP%] {\n  padding: 20px;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n\n.demo-header[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 30px;\n}\n\n.demo-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  color: #333;\n  margin-bottom: 10px;\n}\n\n.demo-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 16px;\n}\n\n.chart-section[_ngcontent-%COMP%] {\n  margin-bottom: 30px;\n  height: 600px;\n}\n\n.chart-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 15px;\n}\n\n.chart-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 15px;\n}\n\n.refresh-btn[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n.refresh-btn[_ngcontent-%COMP%]:hover {\n  background: #0056b3;\n}\n\n.api-status[_ngcontent-%COMP%] {\n  background: #f8f9fa;\n  padding: 20px;\n  border-radius: 8px;\n  border: 1px solid #e0e0e0;\n}\n\n.api-status[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin-bottom: 15px;\n  color: #333;\n}\n\n.status-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 15px;\n}\n\n.status-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.status-label[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\n.status-value[_ngcontent-%COMP%] {\n  font-weight: bold;\n}\n\n.status-value.connected[_ngcontent-%COMP%] {\n  color: #28a745;\n}\n\n.status-value.disconnected[_ngcontent-%COMP%] {\n  color: #dc3545;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9jaGFydC1kZW1vL2NoYXJ0LWRlbW8uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNJO0VBQ0UsYUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtBQUFOOztBQUdJO0VBQ0Usa0JBQUE7RUFDQSxtQkFBQTtBQUFOOztBQUdJO0VBQ0UsV0FBQTtFQUNBLG1CQUFBO0FBQU47O0FBR0k7RUFDRSxXQUFBO0VBQ0EsZUFBQTtBQUFOOztBQUdJO0VBQ0UsbUJBQUE7RUFDQSxhQUFBO0FBQU47O0FBR0k7RUFDRSxhQUFBO0VBQ0EsOEJBQUE7RUFDQSxtQkFBQTtFQUNBLG1CQUFBO0FBQU47O0FBR0k7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0FBQU47O0FBR0k7RUFDRSxpQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7QUFBTjs7QUFHSTtFQUNFLG1CQUFBO0FBQU47O0FBR0k7RUFDRSxtQkFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLHlCQUFBO0FBQU47O0FBR0k7RUFDRSxtQkFBQTtFQUNBLFdBQUE7QUFBTjs7QUFHSTtFQUNFLGFBQUE7RUFDQSwyREFBQTtFQUNBLFNBQUE7QUFBTjs7QUFHSTtFQUNFLGFBQUE7RUFDQSw4QkFBQTtFQUNBLG1CQUFBO0FBQU47O0FBR0k7RUFDRSxnQkFBQTtBQUFOOztBQUdJO0VBQ0UsaUJBQUE7QUFBTjs7QUFHSTtFQUNFLGNBQUE7QUFBTjs7QUFHSTtFQUNFLGNBQUE7QUFBTiIsInNvdXJjZXNDb250ZW50IjpbIlxuICAgIC5jaGFydC1kZW1vLWNvbnRhaW5lciB7XG4gICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgbWF4LXdpZHRoOiAxNDAwcHg7XG4gICAgICBtYXJnaW46IDAgYXV0bztcbiAgICB9XG5cbiAgICAuZGVtby1oZWFkZXIge1xuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICB9XG5cbiAgICAuZGVtby1oZWFkZXIgaDIge1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgIH1cblxuICAgIC5kZW1vLWhlYWRlciBwIHtcbiAgICAgIGNvbG9yOiAjNjY2O1xuICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgIH1cblxuICAgIC5jaGFydC1zZWN0aW9uIHtcbiAgICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgICBoZWlnaHQ6IDYwMHB4O1xuICAgIH1cblxuICAgIC5jaGFydC1oZWFkZXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxNXB4O1xuICAgIH1cblxuICAgIC5jaGFydC1jb250cm9scyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMTVweDtcbiAgICB9XG5cbiAgICAucmVmcmVzaC1idG4ge1xuICAgICAgcGFkZGluZzogOHB4IDE2cHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjMDA3YmZmO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIH1cblxuICAgIC5yZWZyZXNoLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjMDA1NmIzO1xuICAgIH1cblxuICAgIC5hcGktc3RhdHVzIHtcbiAgICAgIGJhY2tncm91bmQ6ICNmOGY5ZmE7XG4gICAgICBwYWRkaW5nOiAyMHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2UwZTBlMDtcbiAgICB9XG5cbiAgICAuYXBpLXN0YXR1cyBoNCB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxNXB4O1xuICAgICAgY29sb3I6ICMzMzM7XG4gICAgfVxuXG4gICAgLnN0YXR1cy1ncmlkIHtcbiAgICAgIGRpc3BsYXk6IGdyaWQ7XG4gICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKTtcbiAgICAgIGdhcDogMTVweDtcbiAgICB9XG5cbiAgICAuc3RhdHVzLWl0ZW0ge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgfVxuXG4gICAgLnN0YXR1cy1sYWJlbCB7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgIH1cblxuICAgIC5zdGF0dXMtdmFsdWUge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gICAgLnN0YXR1cy12YWx1ZS5jb25uZWN0ZWQge1xuICAgICAgY29sb3I6ICMyOGE3NDU7XG4gICAgfVxuXG4gICAgLnN0YXR1cy12YWx1ZS5kaXNjb25uZWN0ZWQge1xuICAgICAgY29sb3I6ICNkYzM1NDU7XG4gICAgfVxuICAiXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return ChartDemoComponent;
})();

/***/ }),

/***/ 6113:
/*!*********************************************************************!*\
  !*** ./src/app/components/trading-chart/trading-chart.component.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TradingChartComponent: () => (/* binding */ TradingChartComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui/button/button.component */ 5782);
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/theme.service */ 487);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/translation.service */ 6845);









const _c0 = ["tradingviewWidget"];
function TradingChartComponent_div_49_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r1.translate("chart.loadingTradingView"));
  }
}
function TradingChartComponent_div_50_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 30)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "ui-button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function TradingChartComponent_div_50_Template_ui_button_clicked_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r1.retry());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r1.error);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("\uD83D\uDD04 ", ctx_r1.translate("button.retry"), "");
  }
}
let TradingChartComponent = /*#__PURE__*/(() => {
  class TradingChartComponent {
    constructor(themeService, translationService) {
      this.themeService = themeService;
      this.translationService = translationService;
      this.symbol = 'BINANCE:BTCUSDT';
      this.initialSymbol = 'BINANCE:BTCUSDT';
      this.initialResolution = 'D';
      this.chartHeight = 600;
      this.symbolChange = new _angular_core__WEBPACK_IMPORTED_MODULE_3__.EventEmitter();
      this.scriptElement = null;
      // Component state
      this.loading = false;
      this.error = null;
      // Widget configuration
      this.currentSymbol = this.symbol;
      this.currentInterval = 'D';
      this.showVolume = false;
      this.showDetails = false;
      this.showCalendar = false;
      this.allowSymbolChange = true;
      // Theme integration
      this.currentTheme = this.themeService.currentTheme;
      this.isDark = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.currentTheme() === 'dark');
      this.currentLanguage = this.translationService.currentLanguage;
      // React to theme and language changes
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.effect)(() => {
        this.currentTheme(); // Track theme changes
        this.currentLanguage(); // Track language changes
        if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
          this.reloadWidget();
        }
      });
    }
    ngOnInit() {
      this.currentSymbol = this.initialSymbol || this.symbol;
      this.currentInterval = this.initialResolution || this.currentInterval;
    }
    ngOnChanges(changes) {
      // Detect symbol changes from parent component
      if (changes['symbol'] && !changes['symbol'].firstChange) {
        const newSymbol = changes['symbol'].currentValue;
        if (newSymbol && newSymbol !== this.currentSymbol) {
          this.currentSymbol = newSymbol;
          // Only reload if widget is already initialized
          if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
            this.reloadWidget();
          }
        }
      }
    }
    ngAfterViewInit() {
      setTimeout(() => {
        this.loadTradingViewWidget();
      }, 100);
    }
    ngOnDestroy() {
      if (this.scriptElement) {
        this.scriptElement.remove();
        this.scriptElement = null;
      }
    }
    updateSymbol() {
      if (this.currentSymbol && this.currentSymbol.trim()) {
        this.symbol = this.currentSymbol.trim();
        this.symbolChange.emit(this.symbol);
        this.reloadWidget();
      }
    }
    updateInterval() {
      this.reloadWidget();
    }
    updateConfig() {
      this.reloadWidget();
    }
    toggleTheme() {
      this.themeService.toggleTheme();
    }
    retry() {
      this.error = null;
      this.loadTradingViewWidget();
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    loadTradingViewWidget() {
      if (!this.tradingviewWidget?.nativeElement) {
        this.error = this.translate('chart.containerNotFound');
        return;
      }
      this.loading = true;
      this.error = null;
      this.createWidget();
    }
    reloadWidget() {
      if (this.scriptElement) {
        this.scriptElement.remove();
        this.scriptElement = null;
      }
      // Clear the container
      if (this.tradingviewWidget?.nativeElement) {
        this.tradingviewWidget.nativeElement.innerHTML = '';
      }
      // Recreate the widget
      this.createWidget();
    }
    createWidget() {
      if (!this.tradingviewWidget?.nativeElement) {
        this.error = this.translate('chart.widgetNotAvailable');
        this.loading = false;
        return;
      }
      const isDarkTheme = this.isDark();
      const locale = this.translationService.getTradingViewLocale();
      const config = {
        allow_symbol_change: this.allowSymbolChange,
        calendar: this.showCalendar,
        details: this.showDetails,
        hide_side_toolbar: true,
        hide_top_toolbar: false,
        hide_legend: false,
        hide_volume: !this.showVolume,
        hotlist: false,
        interval: this.currentInterval,
        locale: locale,
        save_image: true,
        style: "1",
        // Candle style
        symbol: this.currentSymbol,
        theme: isDarkTheme ? "dark" : "light",
        timezone: "Etc/UTC",
        backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
        gridColor: isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(42, 46, 57, 0.06)",
        watchlist: [],
        withdateranges: false,
        compareSymbols: [],
        studies: [],
        autosize: true
      };
      try {
        this.scriptElement = document.createElement('script');
        this.scriptElement.type = 'text/javascript';
        this.scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        this.scriptElement.async = true;
        this.scriptElement.innerHTML = JSON.stringify(config);
        this.scriptElement.onload = () => {
          this.loading = false;
          console.log('TradingView widget loaded successfully');
        };
        this.scriptElement.onerror = () => {
          this.loading = false;
          this.error = this.translate('chart.failedToLoadWidget');
        };
        this.tradingviewWidget.nativeElement.appendChild(this.scriptElement);
        // Set loading timeout
        setTimeout(() => {
          if (this.loading) {
            this.loading = false;
          }
        }, 1000);
      } catch (error) {
        this.loading = false;
        this.error = this.translate('chart.errorInitializing');
        console.error('TradingView widget error:', error);
      }
    }
    static {
      this.ɵfac = function TradingChartComponent_Factory(t) {
        return new (t || TradingChartComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_theme_service__WEBPACK_IMPORTED_MODULE_1__.ThemeService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_translation_service__WEBPACK_IMPORTED_MODULE_2__.TranslationService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
        type: TradingChartComponent,
        selectors: [["app-trading-chart"]],
        viewQuery: function TradingChartComponent_Query(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_c0, 5);
          }
          if (rf & 2) {
            let _t;
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.tradingviewWidget = _t.first);
          }
        },
        inputs: {
          symbol: "symbol",
          initialSymbol: "initialSymbol",
          initialResolution: "initialResolution",
          chartHeight: "chartHeight"
        },
        outputs: {
          symbolChange: "symbolChange"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵNgOnChangesFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
        decls: 51,
        vars: 17,
        consts: [["tradingviewWidget", ""], [1, "trading-chart-container"], [1, "chart-controls"], [1, "symbol-selector"], ["type", "text", 1, "symbol-input", 3, "ngModelChange", "keyup.enter", "ngModel", "placeholder"], ["variant", "primary", "size", "small", 3, "clicked"], [1, "timeframe-selector"], [3, "ngModelChange", "change", "ngModel"], ["value", "1"], ["value", "5"], ["value", "15"], ["value", "30"], ["value", "60"], ["value", "240"], ["value", "D"], ["value", "W"], ["value", "M"], [1, "chart-options"], ["type", "checkbox", 3, "ngModelChange", "change", "ngModel"], ["variant", "ghost", "size", "small", 3, "clicked"], [1, "chart-wrapper"], [1, "tradingview-widget-container"], [1, "tradingview-widget-container__widget"], [1, "tradingview-widget-copyright"], ["href", "https://www.tradingview.com/", "rel", "noopener nofollow", "target", "_blank"], [1, "blue-text"], ["class", "loading-overlay", 4, "ngIf"], ["class", "error-overlay", 4, "ngIf"], [1, "loading-overlay"], [1, "loading-spinner"], [1, "error-overlay"], ["variant", "primary", "size", "medium", 3, "clicked"]],
        template: function TradingChartComponent_Template(rf, ctx) {
          if (rf & 1) {
            const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "input", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_input_ngModelChange_3_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.currentSymbol, $event) || (ctx.currentSymbol = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("keyup.enter", function TradingChartComponent_Template_input_keyup_enter_3_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateSymbol());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function TradingChartComponent_Template_ui_button_clicked_4_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateSymbol());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 6)(7, "select", 7);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_select_ngModelChange_7_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.currentInterval, $event) || (ctx.currentInterval = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function TradingChartComponent_Template_select_change_7_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateInterval());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "option", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](9, "1m");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "option", 9);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](11, "5m");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](12, "option", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](13, "15m");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "option", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](15, "30m");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](16, "option", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](17, "1h");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "option", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](19, "4h");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](20, "option", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](21, "1D");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](22, "option", 15);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](23, "1W");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](24, "option", 16);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](25, "1M");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](26, "div", 17)(27, "label")(28, "input", 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_input_ngModelChange_28_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.showVolume, $event) || (ctx.showVolume = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function TradingChartComponent_Template_input_change_28_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateConfig());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](29);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](30, "label")(31, "input", 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_input_ngModelChange_31_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.showDetails, $event) || (ctx.showDetails = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function TradingChartComponent_Template_input_change_31_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateConfig());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](32);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](33, "label")(34, "input", 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_input_ngModelChange_34_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.showCalendar, $event) || (ctx.showCalendar = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function TradingChartComponent_Template_input_change_34_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateConfig());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](35);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](36, "label")(37, "input", 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayListener"]("ngModelChange", function TradingChartComponent_Template_input_ngModelChange_37_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayBindingSet"](ctx.allowSymbolChange, $event) || (ctx.allowSymbolChange = $event);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"]($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("change", function TradingChartComponent_Template_input_change_37_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.updateConfig());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](38);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](39, "ui-button", 19);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function TradingChartComponent_Template_ui_button_clicked_39_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.toggleTheme());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](40);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](41, "div", 20)(42, "div", 21, 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](44, "div", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](45, "div", 23)(46, "a", 24)(47, "span", 25);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](48, "Track all markets on TradingView");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](49, TradingChartComponent_div_49_Template, 4, 1, "div", 26)(50, TradingChartComponent_div_50_Template, 5, 2, "div", 27);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("dark-theme", ctx.isDark());
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.currentSymbol);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx.translate("chart.enterSymbolExample"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" \uD83D\uDCC8 ", ctx.translate("chart.loadSymbol"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.currentInterval);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](21);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.showVolume);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.translate("chart.volume"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.showDetails);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.translate("chart.details"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.showCalendar);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.translate("chart.calendar"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtwoWayProperty"]("ngModel", ctx.allowSymbolChange);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.translate("chart.symbolChange"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.isDark() ? "\u2600\uFE0F" : "\uD83C\uDF19", " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](9);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", ctx.error);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.CheckboxControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgModel, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__.ButtonComponent],
        styles: [".trading-chart-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  border: 1px solid var(--border-color, #e0e0e0);\n  border-radius: 8px;\n  overflow: hidden;\n  background: var(--card-background, white);\n  transition: all 0.3s ease;\n  min-height: 600px;\n}\n\n.trading-chart-container.dark-theme[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.1);\n  background: #2d2d2d;\n}\n\n.chart-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 12px;\n  background: var(--controls-background, #f8f9fa);\n  border-bottom: 1px solid var(--border-color, #e0e0e0);\n  gap: 16px;\n  flex-wrap: wrap;\n  transition: all 0.3s ease;\n}\n\n.dark-theme[_ngcontent-%COMP%]   .chart-controls[_ngcontent-%COMP%] {\n  background: #404040;\n  border-bottom-color: rgba(255, 255, 255, 0.1);\n  color: white;\n}\n\n.symbol-selector[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n\n.symbol-input[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border: 1px solid var(--input-border, #ccc);\n  border-radius: 4px;\n  min-width: 200px;\n  background: var(--input-background, white);\n  color: var(--text-color, black);\n  transition: all 0.3s ease;\n}\n\n.dark-theme[_ngcontent-%COMP%]   .symbol-input[_ngcontent-%COMP%] {\n  background: #333;\n  border-color: #555;\n  color: white;\n}\n\n.load-button[_ngcontent-%COMP%], .theme-toggle[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  background: var(--primary-color, #007bff);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n.load-button[_ngcontent-%COMP%]:hover, .theme-toggle[_ngcontent-%COMP%]:hover {\n  background: var(--primary-hover, #0056b3);\n  transform: translateY(-1px);\n}\n\n.timeframe-selector[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border: 1px solid var(--input-border, #ccc);\n  border-radius: 4px;\n  background: var(--input-background, white);\n  color: var(--text-color, black);\n  transition: all 0.3s ease;\n}\n\n.dark-theme[_ngcontent-%COMP%]   .timeframe-selector[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  background: #333;\n  border-color: #555;\n  color: white;\n}\n\n.chart-options[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n\n.chart-options[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  -webkit-user-select: none;\n          user-select: none;\n}\n\n.chart-options[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n\n.theme-toggle[_ngcontent-%COMP%] {\n  margin-left: auto;\n  font-size: 16px;\n  padding: 8px;\n  border-radius: 50%;\n  width: 40px;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.chart-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1;\n  overflow: hidden;\n  min-height: 600px;\n}\n\n.tradingview-widget-container[_ngcontent-%COMP%] {\n  min-height: 600px;\n  width: 100%;\n}\n\n.tradingview-widget-container__widget[_ngcontent-%COMP%] {\n  height: calc(100% - 32px);\n  width: 100%;\n}\n\n.tradingview-widget-copyright[_ngcontent-%COMP%] {\n  font-size: 13px !important;\n  line-height: 32px;\n  text-align: center;\n  vertical-align: middle;\n  color: #B2B5BE;\n}\n\n.tradingview-widget-copyright[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  text-decoration: none !important;\n  color: #B2B5BE;\n}\n\n.tradingview-widget-copyright[_ngcontent-%COMP%]   .blue-text[_ngcontent-%COMP%] {\n  color: #2962FF;\n}\n\n.tradingview-widget-copyright[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover   .blue-text[_ngcontent-%COMP%] {\n  color: #1E53E5;\n}\n\n.loading-overlay[_ngcontent-%COMP%], .error-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.95);\n  gap: 12px;\n  z-index: 1000;\n}\n\n.dark-theme[_ngcontent-%COMP%]   .loading-overlay[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .error-overlay[_ngcontent-%COMP%] {\n  background: rgba(45, 45, 45, 0.95);\n  color: white;\n}\n\n.loading-spinner[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border: 3px solid #f3f3f3;\n  border-top: 3px solid var(--primary-color, #007bff);\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.error-overlay[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: var(--primary-color, #007bff);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n.retry-btn[_ngcontent-%COMP%]:hover {\n  background: var(--primary-hover, #0056b3);\n}\n\n\n\n@media (max-width: 768px) {\n  .chart-controls[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 12px;\n  }\n  .symbol-selector[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .symbol-input[_ngcontent-%COMP%] {\n    min-width: auto;\n  }\n  .chart-options[_ngcontent-%COMP%] {\n    justify-content: center;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nLWNoYXJ0L3RyYWRpbmctY2hhcnQuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSw4Q0FBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5Q0FBQTtFQUNBLHlCQUFBO0VBQ0EsaUJBQUE7QUFDRjs7QUFFQTtFQUNFLHNDQUFBO0VBQ0EsbUJBQUE7QUFDRjs7QUFFQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLGFBQUE7RUFDQSwrQ0FBQTtFQUNBLHFEQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7RUFDQSx5QkFBQTtBQUNGOztBQUVBO0VBQ0UsbUJBQUE7RUFDQSw2Q0FBQTtFQUNBLFlBQUE7QUFDRjs7QUFFQTtFQUNFLGFBQUE7RUFDQSxRQUFBO0FBQ0Y7O0FBRUE7RUFDRSxpQkFBQTtFQUNBLDJDQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLDBDQUFBO0VBQ0EsK0JBQUE7RUFDQSx5QkFBQTtBQUNGOztBQUVBO0VBQ0UsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLFlBQUE7QUFDRjs7QUFFQTtFQUNFLGlCQUFBO0VBQ0EseUNBQUE7RUFDQSxZQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLHlCQUFBO0FBQ0Y7O0FBRUE7RUFDRSx5Q0FBQTtFQUNBLDJCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxpQkFBQTtFQUNBLDJDQUFBO0VBQ0Esa0JBQUE7RUFDQSwwQ0FBQTtFQUNBLCtCQUFBO0VBQ0EseUJBQUE7QUFDRjs7QUFFQTtFQUNFLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxZQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsUUFBQTtFQUNBLGVBQUE7RUFDQSxlQUFBO0VBQ0EseUJBQUE7VUFBQSxpQkFBQTtBQUNGOztBQUVBO0VBQ0UsZUFBQTtBQUNGOztBQUVBO0VBQ0UsaUJBQUE7RUFDQSxlQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtBQUNGOztBQUVBO0VBQ0Usa0JBQUE7RUFDQSxPQUFBO0VBQ0EsZ0JBQUE7RUFDQSxpQkFBQTtBQUNGOztBQUVBO0VBQ0UsaUJBQUE7RUFDQSxXQUFBO0FBQ0Y7O0FBRUE7RUFDRSx5QkFBQTtFQUNBLFdBQUE7QUFDRjs7QUFFQTtFQUNFLDBCQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsY0FBQTtBQUNGOztBQUVBO0VBQ0UsZ0NBQUE7RUFDQSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtFQUNBLE1BQUE7RUFDQSxPQUFBO0VBQ0EsUUFBQTtFQUNBLFNBQUE7RUFDQSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EscUNBQUE7RUFDQSxTQUFBO0VBQ0EsYUFBQTtBQUNGOztBQUVBOztFQUVFLGtDQUFBO0VBQ0EsWUFBQTtBQUNGOztBQUVBO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSx5QkFBQTtFQUNBLG1EQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQ0FBQTtBQUNGOztBQUVBO0VBQ0U7SUFBSyx1QkFBQTtFQUVMO0VBREE7SUFBTyx5QkFBQTtFQUlQO0FBQ0Y7QUFGQTtFQUNFLGlCQUFBO0VBQ0EseUNBQUE7RUFDQSxZQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtBQUlGOztBQURBO0VBQ0UseUNBQUE7QUFJRjs7QUFEQSxzQkFBQTtBQUNBO0VBQ0U7SUFDRSxzQkFBQTtJQUNBLG9CQUFBO0lBQ0EsU0FBQTtFQUlGO0VBREE7SUFDRSxzQkFBQTtFQUdGO0VBQUE7SUFDRSxlQUFBO0VBRUY7RUFDQTtJQUNFLHVCQUFBO0VBQ0Y7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi50cmFkaW5nLWNoYXJ0LWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgI2UwZTBlMCk7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG4gIG1pbi1oZWlnaHQ6IDYwMHB4O1xufVxuXG4udHJhZGluZy1jaGFydC1jb250YWluZXIuZGFyay10aGVtZSB7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xuICBiYWNrZ3JvdW5kOiAjMmQyZDJkO1xufVxuXG4uY2hhcnQtY29udHJvbHMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAxMnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb250cm9scy1iYWNrZ3JvdW5kLCAjZjhmOWZhKTtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgI2UwZTBlMCk7XG4gIGdhcDogMTZweDtcbiAgZmxleC13cmFwOiB3cmFwO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xufVxuXG4uZGFyay10aGVtZSAuY2hhcnQtY29udHJvbHMge1xuICBiYWNrZ3JvdW5kOiAjNDA0MDQwO1xuICBib3JkZXItYm90dG9tLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG4gIGNvbG9yOiB3aGl0ZTtcbn1cblxuLnN5bWJvbC1zZWxlY3RvciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xufVxuXG4uc3ltYm9sLWlucHV0IHtcbiAgcGFkZGluZzogNnB4IDEycHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWlucHV0LWJvcmRlciwgI2NjYyk7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgbWluLXdpZHRoOiAyMDBweDtcbiAgYmFja2dyb3VuZDogdmFyKC0taW5wdXQtYmFja2dyb3VuZCwgd2hpdGUpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvciwgYmxhY2spO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xufVxuXG4uZGFyay10aGVtZSAuc3ltYm9sLWlucHV0IHtcbiAgYmFja2dyb3VuZDogIzMzMztcbiAgYm9yZGVyLWNvbG9yOiAjNTU1O1xuICBjb2xvcjogd2hpdGU7XG59XG5cbi5sb2FkLWJ1dHRvbiwgLnRoZW1lLXRvZ2dsZSB7XG4gIHBhZGRpbmc6IDZweCAxMnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjMDA3YmZmKTtcbiAgY29sb3I6IHdoaXRlO1xuICBib3JkZXI6IG5vbmU7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xufVxuXG4ubG9hZC1idXR0b246aG92ZXIsIC50aGVtZS10b2dnbGU6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWhvdmVyLCAjMDA1NmIzKTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xufVxuXG4udGltZWZyYW1lLXNlbGVjdG9yIHNlbGVjdCB7XG4gIHBhZGRpbmc6IDZweCAxMnB4O1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1pbnB1dC1ib3JkZXIsICNjY2MpO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWlucHV0LWJhY2tncm91bmQsIHdoaXRlKTtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IsIGJsYWNrKTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcbn1cblxuLmRhcmstdGhlbWUgLnRpbWVmcmFtZS1zZWxlY3RvciBzZWxlY3Qge1xuICBiYWNrZ3JvdW5kOiAjMzMzO1xuICBib3JkZXItY29sb3I6ICM1NTU7XG4gIGNvbG9yOiB3aGl0ZTtcbn1cblxuLmNoYXJ0LW9wdGlvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDEycHg7XG4gIGZsZXgtd3JhcDogd3JhcDtcbn1cblxuLmNoYXJ0LW9wdGlvbnMgbGFiZWwge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDRweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LXNpemU6IDE0cHg7XG4gIHVzZXItc2VsZWN0OiBub25lO1xufVxuXG4uY2hhcnQtb3B0aW9ucyBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0ge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi50aGVtZS10b2dnbGUge1xuICBtYXJnaW4tbGVmdDogYXV0bztcbiAgZm9udC1zaXplOiAxNnB4O1xuICBwYWRkaW5nOiA4cHg7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgd2lkdGg6IDQwcHg7XG4gIGhlaWdodDogNDBweDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5jaGFydC13cmFwcGVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBmbGV4OiAxO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBtaW4taGVpZ2h0OiA2MDBweDtcbn1cblxuLnRyYWRpbmd2aWV3LXdpZGdldC1jb250YWluZXIge1xuICBtaW4taGVpZ2h0OiA2MDBweDtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbi50cmFkaW5ndmlldy13aWRnZXQtY29udGFpbmVyX193aWRnZXQge1xuICBoZWlnaHQ6IGNhbGMoMTAwJSAtIDMycHgpO1xuICB3aWR0aDogMTAwJTtcbn1cblxuLnRyYWRpbmd2aWV3LXdpZGdldC1jb3B5cmlnaHQge1xuICBmb250LXNpemU6IDEzcHggIWltcG9ydGFudDtcbiAgbGluZS1oZWlnaHQ6IDMycHg7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgY29sb3I6ICNCMkI1QkU7XG59XG5cbi50cmFkaW5ndmlldy13aWRnZXQtY29weXJpZ2h0IGEge1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgY29sb3I6ICNCMkI1QkU7XG59XG5cbi50cmFkaW5ndmlldy13aWRnZXQtY29weXJpZ2h0IC5ibHVlLXRleHQge1xuICBjb2xvcjogIzI5NjJGRjtcbn1cblxuLnRyYWRpbmd2aWV3LXdpZGdldC1jb3B5cmlnaHQgYTpob3ZlciAuYmx1ZS10ZXh0IHtcbiAgY29sb3I6ICMxRTUzRTU7XG59XG5cbi5sb2FkaW5nLW92ZXJsYXksIC5lcnJvci1vdmVybGF5IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpO1xuICBnYXA6IDEycHg7XG4gIHotaW5kZXg6IDEwMDA7XG59XG5cbi5kYXJrLXRoZW1lIC5sb2FkaW5nLW92ZXJsYXksXG4uZGFyay10aGVtZSAuZXJyb3Itb3ZlcmxheSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoNDUsIDQ1LCA0NSwgMC45NSk7XG4gIGNvbG9yOiB3aGl0ZTtcbn1cblxuLmxvYWRpbmctc3Bpbm5lciB7XG4gIHdpZHRoOiAzMnB4O1xuICBoZWlnaHQ6IDMycHg7XG4gIGJvcmRlcjogM3B4IHNvbGlkICNmM2YzZjM7XG4gIGJvcmRlci10b3A6IDNweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjMDA3YmZmKTtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlO1xufVxuXG5Aa2V5ZnJhbWVzIHNwaW4ge1xuICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XG4gIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XG59XG5cbi5lcnJvci1vdmVybGF5IGJ1dHRvbiB7XG4gIHBhZGRpbmc6IDhweCAxNnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjMDA3YmZmKTtcbiAgY29sb3I6IHdoaXRlO1xuICBib3JkZXI6IG5vbmU7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4ucmV0cnktYnRuOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1ob3ZlciwgIzAwNTZiMyk7XG59XG5cbi8qIFJlc3BvbnNpdmUgZGVzaWduICovXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgLmNoYXJ0LWNvbnRyb2xzIHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuICAgIGdhcDogMTJweDtcbiAgfVxuXG4gIC5zeW1ib2wtc2VsZWN0b3Ige1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIH1cblxuICAuc3ltYm9sLWlucHV0IHtcbiAgICBtaW4td2lkdGg6IGF1dG87XG4gIH1cblxuICAuY2hhcnQtb3B0aW9ucyB7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return TradingChartComponent;
})();

/***/ }),

/***/ 9886:
/*!*******************************************!*\
  !*** ./src/app/services/chart.service.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChartService: () => (/* binding */ ChartService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 3942);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ 6443);




let ChartService = /*#__PURE__*/(() => {
  class ChartService {
    constructor(http) {
      this.http = http;
      this.apiUrl = '/api/trading';
      this.realtimeDataSubject = new rxjs__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(null);
      this.realtimeData$ = this.realtimeDataSubject.asObservable();
      this.subscriberMap = new Map();
      this.intervalMap = new Map();
    }
    // Get TradingView datafeed configuration
    getDatafeedConfiguration() {
      return this.http.get(`${this.apiUrl}/config`).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(error => {
        console.error('Failed to get datafeed configuration:', error);
        // Return default configuration with proper typing
        const defaultConfig = {
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
          supports_group_request: false,
          supports_marks: false,
          supports_search: true,
          supports_timescale_marks: false,
          supports_time: false,
          exchanges: [{
            value: 'BYBIT',
            name: 'Bybit',
            desc: 'Bybit Exchange'
          }],
          symbols_types: [{
            name: 'crypto',
            value: 'crypto'
          }],
          currency_codes: ['USDT', 'BTC', 'ETH']
        };
        return new rxjs__WEBPACK_IMPORTED_MODULE_2__.Observable(subscriber => {
          subscriber.next(defaultConfig);
          subscriber.complete();
        });
      }));
    }
    // Get TradingView configuration (legacy method)
    getConfig() {
      return this.getDatafeedConfiguration();
    }
    // Get available symbols
    getSymbols() {
      return this.http.get(`${this.apiUrl}/symbols`);
    }
    // Get specific symbol info
    getSymbolInfo(symbol) {
      return this.http.get(`${this.apiUrl}/symbols?symbol=${symbol}`);
    }
    // Search symbols (legacy method)
    searchSymbols(query) {
      return this.getSymbols().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(symbols => symbols.filter(symbol => symbol.symbol.toLowerCase().includes(query.toLowerCase()) || symbol.description.toLowerCase().includes(query.toLowerCase()))));
    }
    // Search symbols with TradingView filters
    searchSymbolsWithFilters(query, exchange, symbolType) {
      return this.getSymbols().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(symbols => {
        let filtered = symbols.filter(symbol => symbol.symbol.toLowerCase().includes(query.toLowerCase()) || symbol.description.toLowerCase().includes(query.toLowerCase()));
        if (exchange && exchange !== '') {
          filtered = filtered.filter(symbol => symbol.exchange === exchange);
        }
        if (symbolType && symbolType !== '') {
          filtered = filtered.filter(symbol => symbol.type === symbolType);
        }
        return filtered.map(symbol => ({
          symbol: symbol.symbol,
          full_name: symbol.full_name,
          description: symbol.description,
          exchange: symbol.exchange,
          type: symbol.type
        }));
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(error => {
        console.error('Symbol search failed:', error);
        return new rxjs__WEBPACK_IMPORTED_MODULE_2__.Observable(subscriber => {
          subscriber.next([]);
          subscriber.complete();
        });
      }));
    }
    // Get chart data for TradingView
    getChartData(request) {
      const params = new URLSearchParams({
        symbol: request.symbol,
        resolution: request.resolution,
        from: request.from.toString(),
        to: request.to.toString()
      });
      if (request.firstDataRequest) {
        params.append('firstDataRequest', 'true');
      }
      return this.http.get(`${this.apiUrl}/chart?${params.toString()}`);
    }
    // Convert API response to TradingView bars format
    convertToBars(response) {
      if (response.s === 'ok' && response.t && response.o && response.h && response.l && response.c) {
        const bars = response.t.map((time, index) => ({
          time: time * 1000,
          // Convert to milliseconds
          open: response.o[index],
          high: response.h[index],
          low: response.l[index],
          close: response.c[index],
          volume: response.v ? response.v[index] : 0
        }));
        return {
          bars,
          meta: {
            noData: false,
            nextTime: response.nextTime
          }
        };
      } else if (response.s === 'no_data') {
        return {
          bars: [],
          meta: {
            noData: true,
            nextTime: response.nextTime
          }
        };
      } else {
        throw new Error(response.errmsg || 'Failed to get chart data');
      }
    }
    calculatePricescale(symbol) {
      // Determine appropriate price scale based on symbol
      if (symbol.includes('USDT') || symbol.includes('USD')) {
        return 100; // 2 decimal places
      } else if (symbol.includes('BTC')) {
        return 100000000; // 8 decimal places
      }
      return 10000; // 4 decimal places default
    }
    // Resolve symbol to TradingView LibrarySymbolInfo format
    resolveSymbolInfo(symbolName) {
      return this.getSymbolInfo(symbolName).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(symbolInfo => {
        const pricescale = this.calculatePricescale(symbolInfo.symbol);
        return {
          name: symbolInfo.symbol,
          full_name: symbolInfo.full_name,
          description: symbolInfo.description,
          exchange: symbolInfo.exchange,
          type: symbolInfo.type,
          session: '24x7',
          timezone: 'UTC',
          ticker: symbolInfo.symbol,
          minmov: 1,
          pricescale: pricescale,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
          intraday_multipliers: ['1', '5', '15', '30', '60', '240'],
          data_status: 'streaming',
          currency_code: symbolInfo.currency_code
        };
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(error => {
        console.error('Symbol resolve failed:', error);
        throw new Error(`Unknown symbol: ${symbolName}`);
      }));
    }
    // Get bars in TradingView format
    getChartBars(symbolInfo, resolution, from, to, firstDataRequest = false) {
      const request = {
        symbol: symbolInfo.name,
        resolution: resolution,
        from: from,
        to: to,
        firstDataRequest: firstDataRequest
      };
      return this.getChartData(request).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(response => this.convertToBars(response)), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(error => {
        console.error('Chart data failed:', error);
        throw error;
      }));
    }
    // Create TradingView datafeed with enhanced error handling
    createDatafeed() {
      return {
        onReady: callback => {
          this.getDatafeedConfiguration().subscribe({
            next: config => {
              console.log('Datafeed configuration loaded:', config);
              callback(config);
            },
            error: error => {
              console.error('Failed to get datafeed configuration:', error);
              // Fallback configuration
              callback({
                supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
                supports_group_request: false,
                supports_marks: false,
                supports_search: true,
                supports_timescale_marks: false,
                supports_time: false
              });
            }
          });
        },
        searchSymbols: (userInput, exchange, symbolType, onResult) => {
          this.searchSymbolsWithFilters(userInput, exchange, symbolType).subscribe({
            next: symbols => {
              console.log(`Search results for "${userInput}":`, symbols.length, 'symbols found');
              onResult(symbols);
            },
            error: error => {
              console.error('Symbol search failed:', error);
              onResult([]);
            }
          });
        },
        resolveSymbol: (symbolName, onResolve, onError) => {
          console.log('Resolving symbol:', symbolName);
          this.resolveSymbolInfo(symbolName).subscribe({
            next: symbolInfo => {
              console.log('Symbol resolved:', symbolInfo);
              onResolve(symbolInfo);
            },
            error: error => {
              console.error('Symbol resolve failed:', error);
              onError(`Unknown symbol: ${symbolName}`);
            }
          });
        },
        getBars: (symbolInfo, resolution, periodParams, onResult, onError) => {
          console.log('Getting bars for:', symbolInfo.name, resolution, periodParams);
          this.getChartBars(symbolInfo, resolution, periodParams.from, periodParams.to, periodParams.firstDataRequest).subscribe({
            next: result => {
              console.log('Bars loaded:', result.bars.length, 'bars');
              onResult(result.bars, result.meta);
            },
            error: error => {
              console.error('Failed to get bars:', error);
              onError(error.message || 'Failed to fetch chart data');
            }
          });
        },
        subscribeBars: (symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) => {
          console.log('Subscribing to real-time data:', symbolInfo.name, listenerGUID);
          // Store subscriber info for cleanup
          this.subscriberMap.set(listenerGUID, {
            symbol: symbolInfo.name,
            resolution: resolution,
            callback: onRealtimeCallback
          });
          // Start polling for real-time data
          this.startRealtimeSubscription(symbolInfo.name, resolution, onRealtimeCallback, listenerGUID);
        },
        unsubscribeBars: listenerGUID => {
          console.log('Unsubscribing from real-time data:', listenerGUID);
          // Clean up interval if exists
          const intervalId = this.intervalMap.get(listenerGUID);
          if (intervalId) {
            clearInterval(intervalId);
            this.intervalMap.delete(listenerGUID);
          }
          // Remove subscriber info
          this.subscriberMap.delete(listenerGUID);
        }
      };
    }
    // Enhanced real-time subscription management
    startRealtimeSubscription(symbol, resolution, callback, listenerGUID) {
      // This is a simplified implementation using polling
      // In production, you would use WebSocket connections for real-time data
      const interval = setInterval(() => {
        // Fetch latest price data
        const request = {
          symbol: symbol,
          resolution: resolution,
          from: Math.floor(Date.now() / 1000) - 300,
          // Last 5 minutes
          to: Math.floor(Date.now() / 1000),
          firstDataRequest: false
        };
        this.getChartData(request).subscribe({
          next: response => {
            if (response.s === 'ok' && response.t && response.t.length > 0) {
              const lastIndex = response.t.length - 1;
              const bar = {
                time: response.t[lastIndex] * 1000,
                // Convert to milliseconds
                open: response.o[lastIndex],
                high: response.h[lastIndex],
                low: response.l[lastIndex],
                close: response.c[lastIndex],
                volume: response.v ? response.v[lastIndex] : 0
              };
              // Only call callback if subscriber still exists
              if (this.subscriberMap.has(listenerGUID)) {
                callback(bar);
              }
            }
          },
          error: error => {
            console.error('Real-time data error for', symbol, ':', error);
          }
        });
      }, 5000); // Update every 5 seconds
      // Store interval ID for cleanup
      this.intervalMap.set(listenerGUID, interval);
    }
    // Cleanup all subscriptions (call on component destroy)
    cleanupAllSubscriptions() {
      this.intervalMap.forEach(intervalId => clearInterval(intervalId));
      this.intervalMap.clear();
      this.subscriberMap.clear();
    }
    // Get current market data
    getCurrentPrice(symbol) {
      return this.getChartData({
        symbol: symbol,
        resolution: '1',
        from: Math.floor(Date.now() / 1000) - 60,
        to: Math.floor(Date.now() / 1000)
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(response => {
        if (response.s === 'ok' && response.c && response.c.length > 0) {
          return response.c[response.c.length - 1];
        }
        throw new Error('No price data available');
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_1__.catchError)(error => {
        console.error('Failed to get current price:', error);
        throw error;
      }));
    }
    // Helper method to format price with appropriate decimal places
    formatPrice(price, symbol) {
      // Default to 2 decimal places for USDT pairs, adjust as needed
      const decimals = symbol.includes('USDT') ? 2 : 8;
      return price.toFixed(decimals);
    }
    // Helper method to format volume
    formatVolume(volume) {
      if (volume >= 1e9) {
        return (volume / 1e9).toFixed(2) + 'B';
      } else if (volume >= 1e6) {
        return (volume / 1e6).toFixed(2) + 'M';
      } else if (volume >= 1e3) {
        return (volume / 1e3).toFixed(2) + 'K';
      }
      return volume.toFixed(2);
    }
    static {
      this.ɵfac = function ChartService_Factory(t) {
        return new (t || ChartService)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"]({
        token: ChartService,
        factory: ChartService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return ChartService;
})();

/***/ }),

/***/ 7159:
/*!**********************************************!*\
  !*** ./src/app/services/realtime.service.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RealtimeService: () => (/* binding */ RealtimeService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ 819);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 3942);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 1567);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 3900);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 7580);



let RealtimeService = /*#__PURE__*/(() => {
  class RealtimeService {
    constructor() {
      this.eventSources = new Map();
      this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_0__.Subject();
      // Subject for all ticker updates
      this.tickerSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
      this.ticker$ = this.tickerSubject.asObservable().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.filter)(data => data !== null));
      // Subject for price updates only
      this.priceSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
      this.price$ = this.priceSubject.asObservable().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.filter)(data => data !== null));
      // Connection status
      this.connectionStatusSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject({});
      this.connectionStatus$ = this.connectionStatusSubject.asObservable();
      this.baseUrl = '/api/trading';
    }
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
      this.closeAllConnections();
    }
    // Subscribe to real-time data for a symbol
    subscribeToSymbol(symbol) {
      const normalizedSymbol = symbol.toUpperCase();
      // Close existing connection if any
      this.unsubscribeFromSymbol(normalizedSymbol);
      // Create new EventSource connection
      const eventSource = new EventSource(`${this.baseUrl}/stream?symbol=${normalizedSymbol}`);
      this.eventSources.set(normalizedSymbol, eventSource);
      // Update connection status
      this.updateConnectionStatus(normalizedSymbol, false);
      return new rxjs__WEBPACK_IMPORTED_MODULE_3__.Observable(observer => {
        eventSource.onopen = () => {
          console.log(`Connected to real-time stream for ${normalizedSymbol}`);
          this.updateConnectionStatus(normalizedSymbol, true);
        };
        eventSource.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            // Emit to main ticker subject
            this.tickerSubject.next(data);
            // Emit to specific symbol observer
            observer.next(data);
            // If it's ticker data, also emit to price subject
            if (data.type === 'ticker' && data.price !== undefined) {
              const priceUpdate = {
                symbol: data.symbol,
                price: data.price,
                change: 0,
                // Calculate based on previous price if needed
                changePercent: data.change24h || 0,
                volume: data.volume || 0,
                timestamp: data.timestamp
              };
              this.priceSubject.next(priceUpdate);
            }
          } catch (error) {
            console.error('Error parsing stream data:', error);
            observer.error(error);
          }
        };
        eventSource.onerror = error => {
          console.error(`Stream error for ${normalizedSymbol}:`, error);
          this.updateConnectionStatus(normalizedSymbol, false);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (this.eventSources.has(normalizedSymbol)) {
              console.log(`Attempting to reconnect to ${normalizedSymbol}`);
              this.subscribeToSymbol(normalizedSymbol);
            }
          }, 5000);
          observer.error(error);
        };
        // Cleanup function
        return () => {
          this.unsubscribeFromSymbol(normalizedSymbol);
        };
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.takeUntil)(this.destroy$));
    }
    // Unsubscribe from a specific symbol
    unsubscribeFromSymbol(symbol) {
      const normalizedSymbol = symbol.toUpperCase();
      const eventSource = this.eventSources.get(normalizedSymbol);
      if (eventSource) {
        eventSource.close();
        this.eventSources.delete(normalizedSymbol);
        this.updateConnectionStatus(normalizedSymbol, false);
        console.log(`Unsubscribed from ${normalizedSymbol}`);
      }
    }
    // Get real-time price for a specific symbol
    getSymbolPrice$(symbol) {
      return this.price$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.filter)(update => update.symbol === symbol.toUpperCase()));
    }
    // Get connection status for a symbol
    isConnected(symbol) {
      const status = this.connectionStatusSubject.value;
      return status[symbol.toUpperCase()] || false;
    }
    // Get all connected symbols
    getConnectedSymbols() {
      const status = this.connectionStatusSubject.value;
      return Object.keys(status).filter(symbol => status[symbol]);
    }
    // Subscribe to multiple symbols
    subscribeToMultipleSymbols(symbols) {
      symbols.forEach(symbol => {
        this.subscribeToSymbol(symbol);
      });
      return this.ticker$;
    }
    // Close all connections
    closeAllConnections() {
      this.eventSources.forEach((eventSource, symbol) => {
        eventSource.close();
        console.log(`Closed connection for ${symbol}`);
      });
      this.eventSources.clear();
      this.connectionStatusSubject.next({});
    }
    // Get current price from cache (last received price)
    getCurrentPrice(symbol) {
      const currentTicker = this.tickerSubject.value;
      if (currentTicker && currentTicker.symbol === symbol.toUpperCase() && currentTicker.price) {
        return currentTicker.price;
      }
      return null;
    }
    // Get market summary for connected symbols
    getMarketSummary() {
      return this.price$.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.map)(update => {
        // This is a simplified implementation
        // In a real app, you'd maintain a map of all symbols
        return {
          [update.symbol]: update
        };
      }));
    }
    // Helper method to format price change
    formatPriceChange(change, changePercent) {
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
    }
    // Helper method to get price change color class
    getPriceChangeClass(change) {
      if (change > 0) return 'price-up';
      if (change < 0) return 'price-down';
      return 'price-neutral';
    }
    updateConnectionStatus(symbol, connected) {
      const currentStatus = this.connectionStatusSubject.value;
      const newStatus = {
        ...currentStatus,
        [symbol]: connected
      };
      this.connectionStatusSubject.next(newStatus);
    }
    static {
      this.ɵfac = function RealtimeService_Factory(t) {
        return new (t || RealtimeService)();
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineInjectable"]({
        token: RealtimeService,
        factory: RealtimeService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return RealtimeService;
})();

/***/ })

}]);
//# sourceMappingURL=795.js.map