"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[865],{

/***/ 2865:
/*!***************************************************!*\
  !*** ./src/app/components/home/home.component.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeComponent: () => (/* binding */ HomeComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui/button/button.component */ 5782);
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/theme.service */ 487);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/translation.service */ 6845);






const _c0 = ["tradingviewWidget"];
const _c1 = a0 => ({
  mode: a0
});
function HomeComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "svg", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "circle", 16)(2, "line", 17)(3, "line", 18)(4, "line", 19)(5, "line", 20)(6, "line", 21)(7, "line", 22)(8, "line", 23)(9, "line", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}
function HomeComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "svg", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](1, "path", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
}
let HomeComponent = /*#__PURE__*/(() => {
  class HomeComponent {
    constructor(themeService, translationService) {
      this.themeService = themeService;
      this.translationService = translationService;
      this.scriptElement = null;
      this.currentTheme = this.themeService.currentTheme;
      this.isDark = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.currentTheme() === 'dark');
      this.currentLanguage = this.translationService.currentLanguage;
      // React to theme and language changes and reload widget
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.effect)(() => {
        const theme = this.currentTheme();
        const language = this.currentLanguage();
        if (this.tradingviewWidget?.nativeElement && this.scriptElement) {
          this.reloadWidget();
        }
      });
    }
    ngAfterViewInit() {
      this.loadTradingViewWidget();
    }
    ngOnDestroy() {
      if (this.scriptElement) {
        this.scriptElement.remove();
      }
    }
    toggleTheme() {
      this.themeService.toggleTheme();
    }
    translate(key, params) {
      return this.translationService.translate(key, params);
    }
    loadTradingViewWidget() {
      if (!this.tradingviewWidget?.nativeElement) {
        console.error('TradingView container element not found');
        return;
      }
      this.createWidget();
    }
    reloadWidget() {
      if (this.scriptElement) {
        this.scriptElement.remove();
      }
      // Clear the container
      this.tradingviewWidget.nativeElement.innerHTML = '';
      // Recreate the widget
      this.createWidget();
    }
    createWidget() {
      const isDarkTheme = this.isDark();
      this.scriptElement = document.createElement('script');
      this.scriptElement.type = 'text/javascript';
      this.scriptElement.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      this.scriptElement.async = true;
      this.scriptElement.innerHTML = JSON.stringify({
        "allow_symbol_change": true,
        "calendar": false,
        "details": false,
        "hide_side_toolbar": true,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "hide_volume": false,
        "hotlist": false,
        "interval": "D",
        "locale": this.translationService.getTradingViewLocale(),
        "save_image": true,
        "style": "1",
        "symbol": "NASDAQ:AAPL",
        "theme": isDarkTheme ? "dark" : "light",
        "timezone": "Etc/UTC",
        "backgroundColor": isDarkTheme ? "#1E1E1E" : "#FFFFFF",
        "gridColor": isDarkTheme ? "rgba(242, 242, 242, 0.06)" : "rgba(42, 46, 57, 0.06)",
        "watchlist": [],
        "withdateranges": false,
        "compareSymbols": [],
        "studies": [],
        "autosize": true
      });
      this.tradingviewWidget.nativeElement.appendChild(this.scriptElement);
    }
    static {
      this.ɵfac = function HomeComponent_Factory(t) {
        return new (t || HomeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_theme_service__WEBPACK_IMPORTED_MODULE_1__.ThemeService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_translation_service__WEBPACK_IMPORTED_MODULE_2__.TranslationService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
        type: HomeComponent,
        selectors: [["app-home"]],
        viewQuery: function HomeComponent_Query(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵviewQuery"](_c0, 5);
          }
          if (rf & 2) {
            let _t;
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵloadQuery"]()) && (ctx.tradingviewWidget = _t.first);
          }
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
        decls: 22,
        vars: 7,
        consts: [["tradingviewWidget", ""], [1, "home-container"], [1, "hero-section"], [1, "hero-header"], [1, "hero-content"], [1, "hero-title"], [1, "hero-subtitle"], ["variant", "ghost", "size", "medium", "className", "theme-toggle", 3, "clicked"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], [1, "trading-widget-container"], [1, "widget-header"], [1, "tradingview-widget-container"], [1, "tradingview-widget-container__widget"], [1, "tradingview-widget-copyright"], ["href", "https://www.tradingview.com/symbols/NASDAQ-AAPL/?exchange=NASDAQ", "rel", "noopener nofollow", "target", "_blank"], [1, "blue-text"], ["cx", "12", "cy", "12", "r", "5", "stroke", "currentColor", "stroke-width", "2"], ["x1", "12", "y1", "1", "x2", "12", "y2", "3", "stroke", "currentColor", "stroke-width", "2"], ["x1", "12", "y1", "21", "x2", "12", "y2", "23", "stroke", "currentColor", "stroke-width", "2"], ["x1", "4.22", "y1", "4.22", "x2", "5.64", "y2", "5.64", "stroke", "currentColor", "stroke-width", "2"], ["x1", "18.36", "y1", "18.36", "x2", "19.78", "y2", "19.78", "stroke", "currentColor", "stroke-width", "2"], ["x1", "1", "y1", "12", "x2", "3", "y2", "12", "stroke", "currentColor", "stroke-width", "2"], ["x1", "21", "y1", "12", "x2", "23", "y2", "12", "stroke", "currentColor", "stroke-width", "2"], ["x1", "4.22", "y1", "19.78", "x2", "5.64", "y2", "18.36", "stroke", "currentColor", "stroke-width", "2"], ["x1", "18.36", "y1", "5.64", "x2", "19.78", "y2", "4.22", "stroke", "currentColor", "stroke-width", "2"], ["d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z", "stroke", "currentColor", "stroke-width", "2"]],
        template: function HomeComponent_Template(rf, ctx) {
          if (rf & 1) {
            const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "div", 4)(4, "h1", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "p", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](8, "ui-button", 7);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function HomeComponent_Template_ui_button_clicked_8_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx.toggleTheme());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](9, HomeComponent_Conditional_9_Template, 10, 0, ":svg:svg", 8)(10, HomeComponent_Conditional_10_Template, 2, 0, ":svg:svg", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "div", 9)(12, "div", 10)(13, "h2");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](14);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "div", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](16, "div", 12, 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "div", 13)(19, "a", 14)(20, "span", 15);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](21, "AAPL chart by TradingView");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()()()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.translate("welcome.title"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.translate("welcome.subtitle"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵattribute"]("aria-label", ctx.translate("theme.switchTo", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpureFunction1"](5, _c1, ctx.isDark() ? ctx.translate("theme.light") : ctx.translate("theme.dark"))));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx.isDark() ? 9 : 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.translate("market.overview"));
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__.ButtonComponent],
        styles: [".home-container[_ngcontent-%COMP%] {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n  transition: background-color 0.3s ease, color 0.3s ease;\n}\n\n.hero-section[_ngcontent-%COMP%] {\n  margin-bottom: 3rem;\n  padding: 2rem 0;\n}\n\n.hero-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 2rem;\n}\n\n.hero-content[_ngcontent-%COMP%] {\n  text-align: center;\n  flex: 1;\n}\n\n.hero-title[_ngcontent-%COMP%] {\n  font-size: 3rem;\n  font-weight: 700;\n  margin-bottom: 1rem;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  transition: opacity 0.3s ease;\n}\n\n.hero-subtitle[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  margin: 0;\n  color: var(--text-secondary);\n  transition: color 0.3s ease;\n}\n\n.theme-toggle[_ngcontent-%COMP%] {\n  background: var(--card-background);\n  border: 2px solid var(--border-color);\n  border-radius: 50%;\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  color: var(--text-primary);\n  flex-shrink: 0;\n}\n.theme-toggle[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background);\n  transform: scale(1.05);\n  border-color: var(--primary-color);\n}\n.theme-toggle[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.theme-toggle[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: transform 0.3s ease;\n}\n.theme-toggle[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%] {\n  transform: rotate(15deg);\n}\n\n.trading-widget-container[_ngcontent-%COMP%] {\n  background: var(--card-background);\n  border: 1px solid var(--border-color);\n  border-radius: 12px;\n  box-shadow: var(--card-shadow);\n  padding: 2rem;\n  margin-bottom: 2rem;\n  transition: all 0.3s ease;\n}\n.trading-widget-container[_ngcontent-%COMP%]   .widget-header[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n.trading-widget-container[_ngcontent-%COMP%]   .widget-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-primary);\n  font-size: 1.5rem;\n  font-weight: 600;\n  transition: color 0.3s ease;\n}\n\n[_nghost-%COMP%] {\n  --primary-color: #667eea;\n  --text-primary: #333;\n  --text-secondary: #666;\n  --card-background: #ffffff;\n  --border-color: rgba(0, 0, 0, 0.1);\n  --hover-background: #f8f9fa;\n  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);\n}\n\n.dark[_nghost-%COMP%], .dark   [_nghost-%COMP%] {\n  --text-primary: #ffffff;\n  --text-secondary: #b3b3b3;\n  --card-background: #2d2d2d;\n  --border-color: rgba(255, 255, 255, 0.1);\n  --hover-background: #404040;\n  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n}\n\n.tradingview-widget-container[_ngcontent-%COMP%] {\n  min-height: 500px;\n  width: 100%;\n}\n.tradingview-widget-container[_ngcontent-%COMP%]   .tradingview-widget-container__widget[_ngcontent-%COMP%] {\n  height: calc(100% - 32px);\n  width: 100%;\n}\n.tradingview-widget-container[_ngcontent-%COMP%]   .tradingview-widget-copyright[_ngcontent-%COMP%] {\n  font-size: 13px !important;\n  line-height: 32px;\n  text-align: center;\n  vertical-align: middle;\n  color: #B2B5BE;\n}\n.tradingview-widget-container[_ngcontent-%COMP%]   .tradingview-widget-copyright[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  text-decoration: none !important;\n  color: #B2B5BE;\n}\n.tradingview-widget-container[_ngcontent-%COMP%]   .tradingview-widget-copyright[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   .blue-text[_ngcontent-%COMP%] {\n  color: #2962FF;\n}\n.tradingview-widget-container[_ngcontent-%COMP%]   .tradingview-widget-copyright[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover   .blue-text[_ngcontent-%COMP%] {\n  color: #1E53E5;\n}\n\n@media (max-width: 768px) {\n  .home-container[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .hero-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    text-align: center;\n    gap: 1rem;\n  }\n  .hero-title[_ngcontent-%COMP%] {\n    font-size: 2rem;\n  }\n  .tradingview-widget-container[_ngcontent-%COMP%] {\n    height: 400px;\n  }\n  .trading-widget-container[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9ob21lL2hvbWUuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxhQUFBO0VBQ0EsdURBQUE7QUFDRjs7QUFFQTtFQUNFLG1CQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUVBO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtFQUNBLE9BQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFDQSxnQkFBQTtFQUNBLG1CQUFBO0VBQ0EsNkRBQUE7RUFDQSw2QkFBQTtFQUNBLG9DQUFBO0VBQ0EscUJBQUE7RUFDQSw2QkFBQTtBQUNGOztBQUVBO0VBQ0Usa0JBQUE7RUFDQSxTQUFBO0VBQ0EsNEJBQUE7RUFDQSwyQkFBQTtBQUNGOztBQUVBO0VBQ0Usa0NBQUE7RUFDQSxxQ0FBQTtFQUNBLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLGVBQUE7RUFDQSx5QkFBQTtFQUNBLDBCQUFBO0VBQ0EsY0FBQTtBQUNGO0FBQ0U7RUFDRSxtQ0FBQTtFQUNBLHNCQUFBO0VBQ0Esa0NBQUE7QUFDSjtBQUVFO0VBQ0Usc0JBQUE7QUFBSjtBQUdFO0VBQ0UsK0JBQUE7QUFESjtBQUlFO0VBQ0Usd0JBQUE7QUFGSjs7QUFNQTtFQUNFLGtDQUFBO0VBQ0EscUNBQUE7RUFDQSxtQkFBQTtFQUNBLDhCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EseUJBQUE7QUFIRjtBQUtFO0VBQ0UscUJBQUE7QUFISjtBQUtJO0VBQ0UsU0FBQTtFQUNBLDBCQUFBO0VBQ0EsaUJBQUE7RUFDQSxnQkFBQTtFQUNBLDJCQUFBO0FBSE47O0FBU0E7RUFDRSx3QkFBQTtFQUdBLG9CQUFBO0VBQ0Esc0JBQUE7RUFDQSwwQkFBQTtFQUNBLGtDQUFBO0VBQ0EsMkJBQUE7RUFDQSw0Q0FBQTtBQVJGOztBQVlBO0VBQ0UsdUJBQUE7RUFDQSx5QkFBQTtFQUNBLDBCQUFBO0VBQ0Esd0NBQUE7RUFDQSwyQkFBQTtFQUNBLDRDQUFBO0FBVEY7O0FBWUE7RUFDRSxpQkFBQTtFQUNBLFdBQUE7QUFURjtBQVdFO0VBQ0UseUJBQUE7RUFDQSxXQUFBO0FBVEo7QUFZRTtFQUNFLDBCQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLHNCQUFBO0VBQ0EsY0FBQTtBQVZKO0FBWUk7RUFDRSxnQ0FBQTtFQUNBLGNBQUE7QUFWTjtBQVlNO0VBQ0UsY0FBQTtBQVZSO0FBYU07RUFDRSxjQUFBO0FBWFI7O0FBaUJBO0VBQ0U7SUFDRSxhQUFBO0VBZEY7RUFpQkE7SUFDRSxzQkFBQTtJQUNBLGtCQUFBO0lBQ0EsU0FBQTtFQWZGO0VBa0JBO0lBQ0UsZUFBQTtFQWhCRjtFQW1CQTtJQUNFLGFBQUE7RUFqQkY7RUFvQkE7SUFDRSxhQUFBO0VBbEJGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIuaG9tZS1jb250YWluZXIge1xuICBtYXgtd2lkdGg6IDEyMDBweDtcbiAgbWFyZ2luOiAwIGF1dG87XG4gIHBhZGRpbmc6IDJyZW07XG4gIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4zcyBlYXNlLCBjb2xvciAwLjNzIGVhc2U7XG59XG5cbi5oZXJvLXNlY3Rpb24ge1xuICBtYXJnaW4tYm90dG9tOiAzcmVtO1xuICBwYWRkaW5nOiAycmVtIDA7XG59XG5cbi5oZXJvLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAycmVtO1xufVxuXG4uaGVyby1jb250ZW50IHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBmbGV4OiAxO1xufVxuXG4uaGVyby10aXRsZSB7XG4gIGZvbnQtc2l6ZTogM3JlbTtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzY2N2VlYSAwJSwgIzc2NGJhMiAxMDAlKTtcbiAgLXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6IHRleHQ7XG4gIC13ZWJraXQtdGV4dC1maWxsLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgYmFja2dyb3VuZC1jbGlwOiB0ZXh0O1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuM3MgZWFzZTtcbn1cblxuLmhlcm8tc3VidGl0bGUge1xuICBmb250LXNpemU6IDEuMjVyZW07XG4gIG1hcmdpbjogMDtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgdHJhbnNpdGlvbjogY29sb3IgMC4zcyBlYXNlO1xufVxuXG4udGhlbWUtdG9nZ2xlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kKTtcbiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICB3aWR0aDogNDhweDtcbiAgaGVpZ2h0OiA0OHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgZmxleC1zaHJpbms6IDA7XG5cbiAgJjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItYmFja2dyb3VuZCk7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjA1KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICB9XG5cbiAgJjphY3RpdmUge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMC45NSk7XG4gIH1cblxuICBzdmcge1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XG4gIH1cblxuICAmOmhvdmVyIHN2ZyB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMTVkZWcpO1xuICB9XG59XG5cbi50cmFkaW5nLXdpZGdldC1jb250YWluZXIge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jYXJkLWJhY2tncm91bmQpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBib3gtc2hhZG93OiB2YXIoLS1jYXJkLXNoYWRvdyk7XG4gIHBhZGRpbmc6IDJyZW07XG4gIG1hcmdpbi1ib3R0b206IDJyZW07XG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XG5cbiAgLndpZGdldC1oZWFkZXIge1xuICAgIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcblxuICAgIGgyIHtcbiAgICAgIG1hcmdpbjogMDtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgdHJhbnNpdGlvbjogY29sb3IgMC4zcyBlYXNlO1xuICAgIH1cbiAgfVxufVxuXG4vLyBDU1MgQ3VzdG9tIFByb3BlcnRpZXMgZm9yIHRoZW1lIHN1cHBvcnRcbjpob3N0IHtcbiAgLS1wcmltYXJ5LWNvbG9yOiAjNjY3ZWVhO1xuICBcbiAgLy8gTGlnaHQgdGhlbWUgdmFyaWFibGVzIChkZWZhdWx0KVxuICAtLXRleHQtcHJpbWFyeTogIzMzMztcbiAgLS10ZXh0LXNlY29uZGFyeTogIzY2NjtcbiAgLS1jYXJkLWJhY2tncm91bmQ6ICNmZmZmZmY7XG4gIC0tYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gIC0taG92ZXItYmFja2dyb3VuZDogI2Y4ZjlmYTtcbiAgLS1jYXJkLXNoYWRvdzogMCA0cHggMjBweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG59XG5cbi8vIERhcmsgdGhlbWUgb3ZlcnJpZGVzXG46aG9zdC1jb250ZXh0KC5kYXJrKSB7XG4gIC0tdGV4dC1wcmltYXJ5OiAjZmZmZmZmO1xuICAtLXRleHQtc2Vjb25kYXJ5OiAjYjNiM2IzO1xuICAtLWNhcmQtYmFja2dyb3VuZDogIzJkMmQyZDtcbiAgLS1ib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgLS1ob3Zlci1iYWNrZ3JvdW5kOiAjNDA0MDQwO1xuICAtLWNhcmQtc2hhZG93OiAwIDRweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbn1cblxuLnRyYWRpbmd2aWV3LXdpZGdldC1jb250YWluZXIge1xuICBtaW4taGVpZ2h0OiA1MDBweDtcbiAgd2lkdGg6IDEwMCU7XG4gIFxuICAudHJhZGluZ3ZpZXctd2lkZ2V0LWNvbnRhaW5lcl9fd2lkZ2V0IHtcbiAgICBoZWlnaHQ6IGNhbGMoMTAwJSAtIDMycHgpO1xuICAgIHdpZHRoOiAxMDAlO1xuICB9XG4gIFxuICAudHJhZGluZ3ZpZXctd2lkZ2V0LWNvcHlyaWdodCB7XG4gICAgZm9udC1zaXplOiAxM3B4ICFpbXBvcnRhbnQ7XG4gICAgbGluZS1oZWlnaHQ6IDMycHg7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG4gICAgY29sb3I6ICNCMkI1QkU7XG4gICAgXG4gICAgYSB7XG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiAjQjJCNUJFO1xuICAgICAgXG4gICAgICAuYmx1ZS10ZXh0IHtcbiAgICAgICAgY29sb3I6ICMyOTYyRkY7XG4gICAgICB9XG4gICAgICBcbiAgICAgICY6aG92ZXIgLmJsdWUtdGV4dCB7XG4gICAgICAgIGNvbG9yOiAjMUU1M0U1O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgLmhvbWUtY29udGFpbmVyIHtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICB9XG4gIFxuICAuaGVyby1oZWFkZXIge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGdhcDogMXJlbTtcbiAgfVxuICBcbiAgLmhlcm8tdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMnJlbTtcbiAgfVxuICBcbiAgLnRyYWRpbmd2aWV3LXdpZGdldC1jb250YWluZXIge1xuICAgIGhlaWdodDogNDAwcHg7XG4gIH1cbiAgXG4gIC50cmFkaW5nLXdpZGdldC1jb250YWluZXIge1xuICAgIHBhZGRpbmc6IDFyZW07XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return HomeComponent;
})();

/***/ })

}]);
//# sourceMappingURL=865.js.map