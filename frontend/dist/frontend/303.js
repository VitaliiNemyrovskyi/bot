"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[303],{

/***/ 2303:
/*!***************************************************************************************!*\
  !*** ./src/app/components/trading/grid-bot-dashboard/grid-bot-dashboard.component.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridBotDashboardComponent: () => (/* binding */ GridBotDashboardComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _ui_table_table_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/table/table.component */ 6064);
/* harmony import */ var _ui_tabs_tabs_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/tabs/tabs.component */ 9222);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);
/* harmony import */ var _services_grid_bot_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/grid-bot.service */ 8430);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 5072);












const _c0 = a0 => ({
  id: "bots",
  label: a0
});
const _c1 = a0 => ({
  id: "strategies",
  label: a0
});
const _c2 = a0 => ({
  id: "backtests",
  label: a0
});
const _c3 = (a0, a1, a2) => [a0, a1, a2];
function GridBotDashboardComponent_div_9_ui_card_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-card", 18)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-card-subtitle")(5, "span", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "ui-card-content")(8, "div", 20)(9, "div", 21)(10, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 21)(15, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](19, "currency");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "div", 21)(21, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](23, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "div", 21)(26, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](30, "ui-card-actions")(31, "ui-button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_9_ui_card_1_Template_ui_button_clicked_31_listener() {
      const bot_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r2).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.viewBot(bot_r3));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "ui-button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_9_ui_card_1_Template_ui_button_clicked_33_listener() {
      const bot_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r2).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.editBot(bot_r3));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "ui-button", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_9_ui_card_1_Template_ui_button_clicked_35_listener() {
      const bot_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r2).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.toggleBot(bot_r3));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](36);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](37, "ui-button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_9_ui_card_1_Template_ui_button_clicked_37_listener() {
      const bot_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r2).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.deleteBot(bot_r3));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const bot_r3 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("hover", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](bot_r3.name || bot_r3.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"]("status-" + bot_r3.status.toLowerCase());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", bot_r3.status, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](bot_r3.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.totalPnl"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"](bot_r3.totalPnL >= 0 ? "positive" : "negative");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](19, 20, bot_r3.totalPnL), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.trades"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](bot_r3.totalTrades);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.winRate"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", bot_r3.winRate, "%");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.view"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.edit"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("variant", bot_r3.status === "RUNNING" ? "warning" : "primary");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", bot_r3.status === "RUNNING" ? ctx_r3.translate("button.stop") : ctx_r3.translate("button.start"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.delete"), " ");
  }
}
function GridBotDashboardComponent_div_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, GridBotDashboardComponent_div_9_ui_card_1_Template, 39, 22, "ui-card", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r3.activeBots);
  }
}
function GridBotDashboardComponent_ng_template_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 27)(1, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "\uD83E\uDD16");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "ui-button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_ng_template_10_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r5);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.openBotConfig());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.noActiveBots"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.createFirstBot"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("dashboard.createBot"), " ");
  }
}
function GridBotDashboardComponent_div_19_ui_card_1_span_21_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const strategy_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", strategy_r7.averageReturn, "% ");
  }
}
function GridBotDashboardComponent_div_19_ui_card_1_span_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.na"));
  }
}
function GridBotDashboardComponent_div_19_ui_card_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-card", 31)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-card-subtitle");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "ui-card-content")(7, "div", 32)(8, "div", 21)(9, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "div", 21)(14, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "div", 21)(19, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](21, GridBotDashboardComponent_div_19_ui_card_1_span_21_Template, 2, 1, "span", 33)(22, GridBotDashboardComponent_div_19_ui_card_1_span_22_Template, 2, 1, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](23, "div", 21)(24, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](26, "span", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "ui-card-actions")(29, "ui-button", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_19_ui_card_1_Template_ui_button_clicked_29_listener() {
      const strategy_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.useStrategy(strategy_r7));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](31, "ui-button", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_19_ui_card_1_Template_ui_button_clicked_31_listener() {
      const strategy_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.backtestStrategy(strategy_r7));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "ui-button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_19_ui_card_1_Template_ui_button_clicked_33_listener() {
      const strategy_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.editStrategy(strategy_r7));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "ui-button", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_div_19_ui_card_1_Template_ui_button_clicked_35_listener() {
      const strategy_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6).$implicit;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.deleteStrategy(strategy_r7));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](36);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const strategy_r7 = ctx.$implicit;
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("hover", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](strategy_r7.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](strategy_r7.description || "No description");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.entryFilters"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](strategy_r7.entryFilters.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.exitFilters"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](strategy_r7.exitFilters.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.avgReturn"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", strategy_r7.averageReturn);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", !strategy_r7.averageReturn);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.timesUsed"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](strategy_r7.timesUsed);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.use"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.backtest"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.edit"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("button.delete"), " ");
  }
}
function GridBotDashboardComponent_div_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](1, GridBotDashboardComponent_div_19_ui_card_1_Template, 37, 16, "ui-card", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngForOf", ctx_r3.strategies);
  }
}
function GridBotDashboardComponent_ng_template_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 27)(1, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "\uD83E\uDDE0");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "ui-button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_ng_template_20_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r8);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.createStrategy());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.noStrategies"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.createFirstStrategy"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("dashboard.createStrategy"), " ");
  }
}
function GridBotDashboardComponent_div_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 36)(1, "ui-table", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("rowClick", function GridBotDashboardComponent_div_29_Template_ui_table_rowClick_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r9);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.viewBacktest($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("columns", ctx_r3.backtestTableColumns)("data", ctx_r3.backtests)("striped", true)("hoverable", true);
  }
}
function GridBotDashboardComponent_ng_template_30_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 27)(1, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "\uD83D\uDCCA");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "ui-button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_ng_template_30_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r10);
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r3.newBacktest());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.noBacktests"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r3.translate("dashboard.runFirstBacktest"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r3.translate("dashboard.newBacktest"), " ");
  }
}
let GridBotDashboardComponent = /*#__PURE__*/(() => {
  class GridBotDashboardComponent {
    constructor(gridBotService, router) {
      this.gridBotService = gridBotService;
      this.router = router;
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_4__.TranslationService);
      this.activeBots = [];
      this.strategies = [];
      this.backtests = [];
      this.backtestTableColumns = [];
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    ngOnInit() {
      this.backtestTableColumns = [{
        key: 'symbol',
        label: this.translate('dashboard.symbol'),
        sortable: true
      }, {
        key: 'timeframe',
        label: this.translate('dashboard.timeframe'),
        sortable: true
      }, {
        key: 'totalPnL',
        label: this.translate('dashboard.totalPnl'),
        sortable: true,
        type: 'currency'
      }, {
        key: 'winRate',
        label: this.translate('dashboard.winRate'),
        sortable: true,
        type: 'percentage'
      }, {
        key: 'maxDrawdown',
        label: this.translate('dashboard.maxDrawdown'),
        sortable: true,
        type: 'percentage'
      }, {
        key: 'createdAt',
        label: this.translate('dashboard.date'),
        sortable: true,
        type: 'date'
      }, {
        key: 'actions',
        label: this.translate('dashboard.actions'),
        sortable: false
      }];
      this.loadActiveBots();
      this.loadBacktests();
    }
    loadActiveBots() {
      this.gridBotService.getBots().subscribe({
        next: bots => {
          this.activeBots = bots;
        },
        error: error => {
          console.error('Failed to load bots');
        }
      });
    }
    loadBacktests() {
      this.gridBotService.getBacktests().subscribe({
        next: backtests => {
          this.backtests = backtests;
        },
        error: error => {
          console.error('Failed to load backtests');
        }
      });
    }
    openBotConfig() {
      this.router.navigate(['/trading/bot/create']);
    }
    viewBot(bot) {
      this.router.navigate(['/trading/bot/view', bot.id]);
    }
    editBot(bot) {
      this.router.navigate(['/trading/bot/edit', bot.id]);
    }
    toggleBot(bot) {
      const action = bot.status === 'RUNNING' ? 'stop' : 'start';
      this.gridBotService.updateBot(bot.id, action).subscribe({
        next: () => {
          console.log(`Bot ${action}ed successfully`);
          this.loadActiveBots();
        },
        error: error => {
          console.error(`Failed to ${action} bot`);
        }
      });
    }
    deleteBot(bot) {
      if (confirm(`Are you sure you want to delete bot ${bot.name || bot.symbol}?`)) {
        this.gridBotService.deleteBot(bot.id).subscribe({
          next: () => {
            console.log('Bot deleted successfully');
            this.loadActiveBots();
          },
          error: error => {
            console.error('Failed to delete bot');
          }
        });
      }
    }
    createStrategy() {
      console.log('Create strategy - not implemented');
    }
    useStrategy(strategy) {
      // Navigate to create page with strategy data as query parameter
      this.router.navigate(['/trading/bot/create'], {
        queryParams: {
          strategy: JSON.stringify(strategy)
        }
      });
    }
    backtestStrategy(strategy) {
      console.log('Backtest strategy - not implemented');
    }
    editStrategy(strategy) {
      console.log('Edit strategy - not implemented');
    }
    deleteStrategy(strategy) {
      console.log('Delete strategy - not implemented');
    }
    newBacktest() {
      // Open backtest configuration dialog
    }
    viewBacktest(backtest) {
      // TODO: Implement custom backtest results dialog
      console.log('View backtest:', backtest);
    }
    deleteBacktest(backtest) {
      if (confirm('Are you sure you want to delete this backtest?')) {
        this.gridBotService.deleteBacktest(backtest.id).subscribe({
          next: () => {
            console.log('Backtest deleted successfully');
            this.loadBacktests();
          },
          error: error => {
            console.error('Failed to delete backtest');
          }
        });
      }
    }
    static {
      this.ɵfac = function GridBotDashboardComponent_Factory(t) {
        return new (t || GridBotDashboardComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_services_grid_bot_service__WEBPACK_IMPORTED_MODULE_5__.GridBotService), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__.Router));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({
        type: GridBotDashboardComponent,
        selectors: [["app-grid-bot-dashboard"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵStandaloneFeature"]],
        decls: 32,
        vars: 24,
        consts: [["noBots", ""], ["noStrategies", ""], ["noBacktests", ""], [1, "grid-bot-dashboard"], [1, "header"], ["variant", "primary", 3, "clicked"], ["activeTabId", "bots", 3, "tabs"], ["tabId", "bots", 3, "active"], [1, "tab-content"], ["class", "bots-grid", 4, "ngIf", "ngIfElse"], ["tabId", "strategies"], [1, "strategies-header"], ["class", "strategies-grid", 4, "ngIf", "ngIfElse"], ["tabId", "backtests"], [1, "backtests-header"], ["class", "backtests-table", 4, "ngIf", "ngIfElse"], [1, "bots-grid"], ["class", "bot-card", 3, "hover", 4, "ngFor", "ngForOf"], [1, "bot-card", 3, "hover"], [1, "status-badge"], [1, "bot-stats"], [1, "stat"], [1, "label"], [1, "value"], ["variant", "ghost", "size", "small", 3, "clicked"], ["size", "small", 3, "clicked", "variant"], ["variant", "danger", "size", "small", 3, "clicked"], [1, "empty-state"], [1, "empty-icon"], [1, "strategies-grid"], ["class", "strategy-card", 3, "hover", 4, "ngFor", "ngForOf"], [1, "strategy-card", 3, "hover"], [1, "strategy-stats"], ["class", "value", 4, "ngIf"], ["variant", "primary", "size", "small", 3, "clicked"], ["variant", "secondary", "size", "small", 3, "clicked"], [1, "backtests-table"], [3, "rowClick", "columns", "data", "striped", "hoverable"]],
        template: function GridBotDashboardComponent_Template(rf, ctx) {
          if (rf & 1) {
            const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 3)(1, "div", 4)(2, "h1");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_Template_ui_button_clicked_4_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx.openBotConfig());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "ui-tabs", 6)(7, "ui-tab-content", 7)(8, "div", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](9, GridBotDashboardComponent_div_9_Template, 2, 1, "div", 9)(10, GridBotDashboardComponent_ng_template_10_Template, 9, 3, "ng-template", null, 0, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplateRefExtractor"]);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "ui-tab-content", 10)(13, "div", 8)(14, "div", 11)(15, "h2");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_Template_ui_button_clicked_17_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx.createStrategy());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](19, GridBotDashboardComponent_div_19_Template, 2, 1, "div", 12)(20, GridBotDashboardComponent_ng_template_20_Template, 9, 3, "ng-template", null, 1, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplateRefExtractor"]);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "ui-tab-content", 13)(23, "div", 8)(24, "div", 14)(25, "h2");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function GridBotDashboardComponent_Template_ui_button_clicked_27_listener() {
              _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
              return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx.newBacktest());
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](29, GridBotDashboardComponent_div_29_Template, 2, 4, "div", 15)(30, GridBotDashboardComponent_ng_template_30_Template, 9, 3, "ng-template", null, 2, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplateRefExtractor"]);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
          }
          if (rf & 2) {
            const noBots_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](11);
            const noStrategies_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](21);
            const noBacktests_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵreference"](31);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.translate("dashboard.title"));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx.translate("dashboard.createNewBot"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("tabs", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction3"](20, _c3, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](14, _c0, ctx.translate("dashboard.tabActiveBots")), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](16, _c1, ctx.translate("dashboard.tabStrategies")), _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpureFunction1"](18, _c2, ctx.translate("dashboard.tabBacktests"))));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("active", true);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.activeBots.length > 0)("ngIfElse", noBots_r11);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.translate("dashboard.tradingStrategies"));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx.translate("dashboard.createStrategy"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.strategies.length > 0)("ngIfElse", noStrategies_r12);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.translate("dashboard.backtestResults"));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx.translate("dashboard.newBacktest"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.backtests.length > 0)("ngIfElse", noBacktests_r13);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_8__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_8__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_8__.CurrencyPipe, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_9__.ReactiveFormsModule, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__.ButtonComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardSubtitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardContentComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_1__.CardActionsComponent, _ui_table_table_component__WEBPACK_IMPORTED_MODULE_2__.TableComponent, _ui_tabs_tabs_component__WEBPACK_IMPORTED_MODULE_3__.TabsComponent, _ui_tabs_tabs_component__WEBPACK_IMPORTED_MODULE_3__.TabContentComponent],
        styles: [".grid-bot-dashboard[_ngcontent-%COMP%] {\n  padding: 20px;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 30px;\n}\n\n.header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #333;\n}\n\n.tab-content[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n\n.bots-grid[_ngcontent-%COMP%], .strategies-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 20px;\n}\n\n.bot-card[_ngcontent-%COMP%], .strategy-card[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease-in-out;\n}\n\n.bot-card[_ngcontent-%COMP%]:hover, .strategy-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n}\n\n.status-badge[_ngcontent-%COMP%] {\n  padding: 4px 8px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 500;\n  text-transform: uppercase;\n}\n\n.status-running[_ngcontent-%COMP%] {\n  background-color: #e8f5e8;\n  color: #2e7d2e;\n}\n\n.status-stopped[_ngcontent-%COMP%] {\n  background-color: #fff3e0;\n  color: #f57c00;\n}\n\n.status-paused[_ngcontent-%COMP%] {\n  background-color: #e3f2fd;\n  color: #1976d2;\n}\n\n.status-error[_ngcontent-%COMP%] {\n  background-color: #ffebee;\n  color: #d32f2f;\n}\n\n.bot-stats[_ngcontent-%COMP%], .strategy-stats[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 10px;\n}\n\n.stat[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.stat[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: #666;\n}\n\n.stat[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n\n.positive[_ngcontent-%COMP%] {\n  color: #4caf50;\n}\n\n.negative[_ngcontent-%COMP%] {\n  color: #f44336;\n}\n\n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 60px 20px;\n  color: #666;\n}\n\n.empty-icon[_ngcontent-%COMP%] {\n  font-size: 64px;\n  width: 64px;\n  height: 64px;\n  margin-bottom: 20px;\n  opacity: 0.5;\n}\n\n.strategies-header[_ngcontent-%COMP%], .backtests-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 20px;\n}\n\n.backtests-table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.backtests-table[_ngcontent-%COMP%]   table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\nmat-tab-group[_ngcontent-%COMP%] {\n  margin-top: 20px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL2dyaWQtYm90LWRhc2hib2FyZC9ncmlkLWJvdC1kYXNoYm9hcmQuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQWE7RUFDYixpQkFBaUI7RUFDakIsY0FBYztBQUNoQjs7QUFFQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsbUJBQW1CO0VBQ25CLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLFNBQVM7RUFDVCxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxhQUFhO0FBQ2Y7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsNERBQTREO0VBQzVELFNBQVM7QUFDWDs7QUFFQTtFQUNFLHNDQUFzQztBQUN4Qzs7QUFFQTtFQUNFLDJCQUEyQjtBQUM3Qjs7QUFFQTtFQUNFLGdCQUFnQjtFQUNoQixtQkFBbUI7RUFDbkIsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQix5QkFBeUI7QUFDM0I7O0FBRUE7RUFDRSx5QkFBeUI7RUFDekIsY0FBYztBQUNoQjs7QUFFQTtFQUNFLHlCQUF5QjtFQUN6QixjQUFjO0FBQ2hCOztBQUVBO0VBQ0UseUJBQXlCO0VBQ3pCLGNBQWM7QUFDaEI7O0FBRUE7RUFDRSx5QkFBeUI7RUFDekIsY0FBYztBQUNoQjs7QUFFQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsU0FBUztBQUNYOztBQUVBO0VBQ0UsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxnQkFBZ0I7RUFDaEIsV0FBVztBQUNiOztBQUVBO0VBQ0UsZ0JBQWdCO0FBQ2xCOztBQUVBO0VBQ0UsY0FBYztBQUNoQjs7QUFFQTtFQUNFLGNBQWM7QUFDaEI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsa0JBQWtCO0VBQ2xCLFdBQVc7QUFDYjs7QUFFQTtFQUNFLGVBQWU7RUFDZixXQUFXO0VBQ1gsWUFBWTtFQUNaLG1CQUFtQjtFQUNuQixZQUFZO0FBQ2Q7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsOEJBQThCO0VBQzlCLG1CQUFtQjtFQUNuQixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxnQkFBZ0I7QUFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyIuZ3JpZC1ib3QtZGFzaGJvYXJkIHtcbiAgcGFkZGluZzogMjBweDtcbiAgbWF4LXdpZHRoOiAxMjAwcHg7XG4gIG1hcmdpbjogMCBhdXRvO1xufVxuXG4uaGVhZGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBtYXJnaW4tYm90dG9tOiAzMHB4O1xufVxuXG4uaGVhZGVyIGgxIHtcbiAgbWFyZ2luOiAwO1xuICBjb2xvcjogIzMzMztcbn1cblxuLnRhYi1jb250ZW50IHtcbiAgcGFkZGluZzogMjBweDtcbn1cblxuLmJvdHMtZ3JpZCwgLnN0cmF0ZWdpZXMtZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZmlsbCwgbWlubWF4KDMwMHB4LCAxZnIpKTtcbiAgZ2FwOiAyMHB4O1xufVxuXG4uYm90LWNhcmQsIC5zdHJhdGVneS1jYXJkIHtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZS1pbi1vdXQ7XG59XG5cbi5ib3QtY2FyZDpob3ZlciwgLnN0cmF0ZWd5LWNhcmQ6aG92ZXIge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7XG59XG5cbi5zdGF0dXMtYmFkZ2Uge1xuICBwYWRkaW5nOiA0cHggOHB4O1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG59XG5cbi5zdGF0dXMtcnVubmluZyB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNlOGY1ZTg7XG4gIGNvbG9yOiAjMmU3ZDJlO1xufVxuXG4uc3RhdHVzLXN0b3BwZWQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmM2UwO1xuICBjb2xvcjogI2Y1N2MwMDtcbn1cblxuLnN0YXR1cy1wYXVzZWQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZTNmMmZkO1xuICBjb2xvcjogIzE5NzZkMjtcbn1cblxuLnN0YXR1cy1lcnJvciB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmViZWU7XG4gIGNvbG9yOiAjZDMyZjJmO1xufVxuXG4uYm90LXN0YXRzLCAuc3RyYXRlZ3ktc3RhdHMge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciAxZnI7XG4gIGdhcDogMTBweDtcbn1cblxuLnN0YXQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5zdGF0IC5sYWJlbCB7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGNvbG9yOiAjNjY2O1xufVxuXG4uc3RhdCAudmFsdWUge1xuICBmb250LXdlaWdodDogNjAwO1xufVxuXG4ucG9zaXRpdmUge1xuICBjb2xvcjogIzRjYWY1MDtcbn1cblxuLm5lZ2F0aXZlIHtcbiAgY29sb3I6ICNmNDQzMzY7XG59XG5cbi5lbXB0eS1zdGF0ZSB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgcGFkZGluZzogNjBweCAyMHB4O1xuICBjb2xvcjogIzY2Njtcbn1cblxuLmVtcHR5LWljb24ge1xuICBmb250LXNpemU6IDY0cHg7XG4gIHdpZHRoOiA2NHB4O1xuICBoZWlnaHQ6IDY0cHg7XG4gIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gIG9wYWNpdHk6IDAuNTtcbn1cblxuLnN0cmF0ZWdpZXMtaGVhZGVyLCAuYmFja3Rlc3RzLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWFyZ2luLWJvdHRvbTogMjBweDtcbn1cblxuLmJhY2t0ZXN0cy10YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xufVxuXG4uYmFja3Rlc3RzLXRhYmxlIHRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbm1hdC10YWItZ3JvdXAge1xuICBtYXJnaW4tdG9wOiAyMHB4O1xufSJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return GridBotDashboardComponent;
})();

/***/ }),

/***/ 6064:
/*!********************************************************!*\
  !*** ./src/app/components/ui/table/table.component.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TableComponent: () => (/* binding */ TableComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);





function TableComponent_th_4_span_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const column_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r2.getSortIcon(column_r2));
  }
}
function TableComponent_th_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function TableComponent_th_4_Template_th_click_0_listener() {
      const column_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r2.onSort(column_r2));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 6)(2, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, TableComponent_th_4_span_4_Template, 2, 1, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const column_r2 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassMap"](ctx_r2.getColumnHeaderClasses(column_r2));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("width", column_r2.width);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](column_r2.label);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", column_r2.sortable);
  }
}
function TableComponent_tr_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "tr", 9)(1, "td", 10)(2, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("colspan", ctx_r2.columns.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx_r2.translate("table.loading"));
  }
}
function TableComponent_tr_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "tr", 13)(1, "td", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("colspan", ctx_r2.columns.length);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("table.noData"), " ");
  }
}
function TableComponent_tr_8_td_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const column_r6 = ctx.$implicit;
    const row_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassMap"](ctx_r2.getCellClasses(column_r6));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r2.formatCellValue(row_r5[column_r6.key], column_r6), " ");
  }
}
function TableComponent_tr_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "tr", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function TableComponent_tr_8_Template_tr_click_0_listener() {
      const row_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r4).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r2.onRowClick(row_r5));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, TableComponent_tr_8_td_1_Template, 2, 3, "td", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r2.columns);
  }
}
let TableComponent = /*#__PURE__*/(() => {
  class TableComponent {
    constructor() {
      this.columns = [];
      this.data = [];
      this.loading = false;
      this.striped = true;
      this.hoverable = true;
      this.bordered = false;
      this.size = 'medium';
      this.stickyHeader = false;
      this.sort = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
      this.rowClick = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
      this.currentSort = {
        column: '',
        direction: null
      };
      // Inject TranslationService
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_0__.TranslationService);
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    onSort(column) {
      if (!column.sortable) return;
      let direction = 'asc';
      if (this.currentSort.column === column.key) {
        if (this.currentSort.direction === 'asc') {
          direction = 'desc';
        } else if (this.currentSort.direction === 'desc') {
          direction = null;
        }
      }
      this.currentSort = {
        column: column.key,
        direction
      };
      this.sort.emit({
        column: column.key,
        direction
      });
    }
    onRowClick(row) {
      this.rowClick.emit(row);
    }
    formatCellValue(value, column) {
      if (value === null || value === undefined) return '';
      switch (column.type) {
        case 'currency':
          return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
        case 'percentage':
          return typeof value === 'number' ? `${value.toFixed(2)}%` : value;
        case 'number':
          return typeof value === 'number' ? value.toLocaleString() : value;
        case 'date':
          return value instanceof Date ? value.toLocaleDateString() : value;
        default:
          return String(value);
      }
    }
    getTableClasses() {
      const classes = ['table'];
      classes.push(`table-${this.size}`);
      if (this.striped) {
        classes.push('table-striped');
      }
      if (this.hoverable) {
        classes.push('table-hoverable');
      }
      if (this.bordered) {
        classes.push('table-bordered');
      }
      if (this.stickyHeader) {
        classes.push('table-sticky-header');
      }
      return classes.join(' ');
    }
    getColumnHeaderClasses(column) {
      const classes = ['table-header'];
      if (column.sortable) {
        classes.push('table-header-sortable');
      }
      if (column.align) {
        classes.push(`table-header-${column.align}`);
      }
      if (this.currentSort.column === column.key && this.currentSort.direction) {
        classes.push(`table-header-sorted-${this.currentSort.direction}`);
      }
      return classes.join(' ');
    }
    getCellClasses(column) {
      const classes = ['table-cell'];
      if (column.align) {
        classes.push(`table-cell-${column.align}`);
      }
      return classes.join(' ');
    }
    getSortIcon(column) {
      if (!column.sortable) return '';
      if (this.currentSort.column === column.key) {
        return this.currentSort.direction === 'asc' ? '↑' : this.currentSort.direction === 'desc' ? '↓' : '↕';
      }
      return '↕';
    }
    trackByIndex(index, item) {
      return index;
    }
    static {
      this.ɵfac = function TableComponent_Factory(t) {
        return new (t || TableComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: TableComponent,
        selectors: [["ui-table"]],
        inputs: {
          columns: "columns",
          data: "data",
          loading: "loading",
          striped: "striped",
          hoverable: "hoverable",
          bordered: "bordered",
          size: "size",
          stickyHeader: "stickyHeader",
          maxHeight: "maxHeight"
        },
        outputs: {
          sort: "sort",
          rowClick: "rowClick"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        decls: 9,
        vars: 9,
        consts: [[1, "table-container"], [3, "class", "width", "click", 4, "ngFor", "ngForOf"], ["class", "table-loading", 4, "ngIf"], ["class", "table-empty", 4, "ngIf"], ["class", "table-row", 3, "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [3, "click"], [1, "table-header-content"], ["class", "sort-icon", 4, "ngIf"], [1, "sort-icon"], [1, "table-loading"], [1, "table-loading-cell"], [1, "loading-content"], [1, "loading-spinner"], [1, "table-empty"], [1, "table-empty-cell"], [1, "table-row", 3, "click"], [3, "class", 4, "ngFor", "ngForOf"]],
        template: function TableComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0)(1, "table")(2, "thead")(3, "tr");
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](4, TableComponent_th_4_Template, 5, 6, "th", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "tbody");
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](6, TableComponent_tr_6_Template, 6, 2, "tr", 2)(7, TableComponent_tr_7_Template, 3, 2, "tr", 3)(8, TableComponent_tr_8_Template, 2, 1, "tr", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵstyleProp"]("max-height", ctx.maxHeight);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassMap"](ctx.getTableClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.columns);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", !ctx.loading && ctx.data.length === 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.data)("ngForTrackBy", ctx.trackByIndex);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf],
        styles: ["\n\n.table-container[_ngcontent-%COMP%] {\n  overflow: auto;\n  border-radius: 8px;\n  border: 1px solid #e5e7eb;\n  background: white;\n}\n\n\n\n.table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: white;\n}\n\n\n\n.table-small[_ngcontent-%COMP%] {\n  font-size: 14px;\n}\n\n.table-medium[_ngcontent-%COMP%] {\n  font-size: 16px;\n}\n\n.table-large[_ngcontent-%COMP%] {\n  font-size: 18px;\n}\n\n\n\n.table-header[_ngcontent-%COMP%] {\n  background: #f9fafb;\n  border-bottom: 1px solid #e5e7eb;\n  font-weight: 600;\n  color: #374151;\n  text-align: left;\n  -webkit-user-select: none;\n          user-select: none;\n}\n\n.table-small[_ngcontent-%COMP%]   .table-header[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n}\n\n.table-medium[_ngcontent-%COMP%]   .table-header[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n}\n\n.table-large[_ngcontent-%COMP%]   .table-header[_ngcontent-%COMP%] {\n  padding: 16px 20px;\n}\n\n.table-header-sortable[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: background-color 0.2s ease-in-out;\n}\n\n.table-header-sortable[_ngcontent-%COMP%]:hover {\n  background: #f3f4f6;\n}\n\n.table-header-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.sort-icon[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  font-size: 12px;\n  min-width: 12px;\n  text-align: center;\n}\n\n.table-header-sorted-asc[_ngcontent-%COMP%]   .sort-icon[_ngcontent-%COMP%], \n.table-header-sorted-desc[_ngcontent-%COMP%]   .sort-icon[_ngcontent-%COMP%] {\n  color: #667eea;\n}\n\n\n\n.table-header-left[_ngcontent-%COMP%] {\n  text-align: left;\n}\n\n.table-header-center[_ngcontent-%COMP%] {\n  text-align: center;\n}\n\n.table-header-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n\n\n\n.table-cell[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #f3f4f6;\n  color: #111827;\n}\n\n.table-small[_ngcontent-%COMP%]   .table-cell[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n}\n\n.table-medium[_ngcontent-%COMP%]   .table-cell[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n}\n\n.table-large[_ngcontent-%COMP%]   .table-cell[_ngcontent-%COMP%] {\n  padding: 16px 20px;\n}\n\n.table-cell-left[_ngcontent-%COMP%] {\n  text-align: left;\n}\n\n.table-cell-center[_ngcontent-%COMP%] {\n  text-align: center;\n}\n\n.table-cell-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n\n\n\n.table-row[_ngcontent-%COMP%] {\n  transition: background-color 0.2s ease-in-out;\n  cursor: pointer;\n}\n\n.table-striped[_ngcontent-%COMP%]   .table-row[_ngcontent-%COMP%]:nth-child(even) {\n  background: #f9fafb;\n}\n\n.table-hoverable[_ngcontent-%COMP%]   .table-row[_ngcontent-%COMP%]:hover {\n  background: #f3f4f6;\n}\n\n\n\n.table-bordered[_ngcontent-%COMP%] {\n  border: 1px solid #e5e7eb;\n}\n\n.table-bordered[_ngcontent-%COMP%]   .table-header[_ngcontent-%COMP%], \n.table-bordered[_ngcontent-%COMP%]   .table-cell[_ngcontent-%COMP%] {\n  border-right: 1px solid #e5e7eb;\n}\n\n.table-bordered[_ngcontent-%COMP%]   .table-header[_ngcontent-%COMP%]:last-child, \n.table-bordered[_ngcontent-%COMP%]   .table-cell[_ngcontent-%COMP%]:last-child {\n  border-right: none;\n}\n\n\n\n.table-sticky-header[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n\n\n\n.table-loading-cell[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px 20px;\n  color: #6b7280;\n}\n\n.loading-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n}\n\n.loading-spinner[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  border: 2px solid #e5e7eb;\n  border-top: 2px solid #667eea;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n\n\n\n.table-empty-cell[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px 20px;\n  color: #9ca3af;\n  font-style: italic;\n}\n\n\n\n@media (max-width: 768px) {\n  .table-container[_ngcontent-%COMP%] {\n    font-size: 14px;\n  }\n\n  .table-header[_ngcontent-%COMP%], \n   .table-cell[_ngcontent-%COMP%] {\n    padding: 8px 12px;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS90YWJsZS90YWJsZS5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG9CQUFvQjtBQUNwQjtFQUNFLGNBQWM7RUFDZCxrQkFBa0I7RUFDbEIseUJBQXlCO0VBQ3pCLGlCQUFpQjtBQUNuQjs7QUFFQSxzQkFBc0I7QUFDdEI7RUFDRSxXQUFXO0VBQ1gseUJBQXlCO0VBQ3pCLGlCQUFpQjtBQUNuQjs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxlQUFlO0FBQ2pCOztBQUVBO0VBQ0UsZUFBZTtBQUNqQjs7QUFFQTtFQUNFLGVBQWU7QUFDakI7O0FBRUEsa0JBQWtCO0FBQ2xCO0VBQ0UsbUJBQW1CO0VBQ25CLGdDQUFnQztFQUNoQyxnQkFBZ0I7RUFDaEIsY0FBYztFQUNkLGdCQUFnQjtFQUNoQix5QkFBaUI7VUFBakIsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0Usa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0Usa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsZUFBZTtFQUNmLDZDQUE2QztBQUMvQzs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIsOEJBQThCO0VBQzlCLFFBQVE7QUFDVjs7QUFFQTtFQUNFLGNBQWM7RUFDZCxlQUFlO0VBQ2YsZUFBZTtFQUNmLGtCQUFrQjtBQUNwQjs7QUFFQTs7RUFFRSxjQUFjO0FBQ2hCOztBQUVBLGNBQWM7QUFDZDtFQUNFLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGlCQUFpQjtBQUNuQjs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxnQ0FBZ0M7RUFDaEMsY0FBYztBQUNoQjs7QUFFQTtFQUNFLGlCQUFpQjtBQUNuQjs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGlCQUFpQjtBQUNuQjs7QUFFQSxlQUFlO0FBQ2Y7RUFDRSw2Q0FBNkM7RUFDN0MsZUFBZTtBQUNqQjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQSxxQkFBcUI7QUFDckI7RUFDRSx5QkFBeUI7QUFDM0I7O0FBRUE7O0VBRUUsK0JBQStCO0FBQ2pDOztBQUVBOztFQUVFLGtCQUFrQjtBQUNwQjs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxnQkFBZ0I7RUFDaEIsTUFBTTtFQUNOLFdBQVc7QUFDYjs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxrQkFBa0I7RUFDbEIsa0JBQWtCO0VBQ2xCLGNBQWM7QUFDaEI7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLHVCQUF1QjtFQUN2QixTQUFTO0FBQ1g7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsWUFBWTtFQUNaLHlCQUF5QjtFQUN6Qiw2QkFBNkI7RUFDN0Isa0JBQWtCO0VBQ2xCLGtDQUFrQztBQUNwQzs7QUFFQTtFQUNFLEtBQUssdUJBQXVCLEVBQUU7RUFDOUIsT0FBTyx5QkFBeUIsRUFBRTtBQUNwQzs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxrQkFBa0I7RUFDbEIsa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZCxrQkFBa0I7QUFDcEI7O0FBRUEsZUFBZTtBQUNmO0VBQ0U7SUFDRSxlQUFlO0VBQ2pCOztFQUVBOztJQUVFLGlCQUFpQjtFQUNuQjtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyogVGFibGUgY29udGFpbmVyICovXG4udGFibGUtY29udGFpbmVyIHtcbiAgb3ZlcmZsb3c6IGF1dG87XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm9yZGVyOiAxcHggc29saWQgI2U1ZTdlYjtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG59XG5cbi8qIEJhc2UgdGFibGUgc3R5bGVzICovXG4udGFibGUge1xuICB3aWR0aDogMTAwJTtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG59XG5cbi8qIFNpemUgdmFyaWFudHMgKi9cbi50YWJsZS1zbWFsbCB7XG4gIGZvbnQtc2l6ZTogMTRweDtcbn1cblxuLnRhYmxlLW1lZGl1bSB7XG4gIGZvbnQtc2l6ZTogMTZweDtcbn1cblxuLnRhYmxlLWxhcmdlIHtcbiAgZm9udC1zaXplOiAxOHB4O1xufVxuXG4vKiBIZWFkZXIgc3R5bGVzICovXG4udGFibGUtaGVhZGVyIHtcbiAgYmFja2dyb3VuZDogI2Y5ZmFmYjtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGNvbG9yOiAjMzc0MTUxO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbn1cblxuLnRhYmxlLXNtYWxsIC50YWJsZS1oZWFkZXIge1xuICBwYWRkaW5nOiA4cHggMTJweDtcbn1cblxuLnRhYmxlLW1lZGl1bSAudGFibGUtaGVhZGVyIHtcbiAgcGFkZGluZzogMTJweCAxNnB4O1xufVxuXG4udGFibGUtbGFyZ2UgLnRhYmxlLWhlYWRlciB7XG4gIHBhZGRpbmc6IDE2cHggMjBweDtcbn1cblxuLnRhYmxlLWhlYWRlci1zb3J0YWJsZSB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAwLjJzIGVhc2UtaW4tb3V0O1xufVxuXG4udGFibGUtaGVhZGVyLXNvcnRhYmxlOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogI2YzZjRmNjtcbn1cblxuLnRhYmxlLWhlYWRlci1jb250ZW50IHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBnYXA6IDhweDtcbn1cblxuLnNvcnQtaWNvbiB7XG4gIGNvbG9yOiAjOWNhM2FmO1xuICBmb250LXNpemU6IDEycHg7XG4gIG1pbi13aWR0aDogMTJweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4udGFibGUtaGVhZGVyLXNvcnRlZC1hc2MgLnNvcnQtaWNvbixcbi50YWJsZS1oZWFkZXItc29ydGVkLWRlc2MgLnNvcnQtaWNvbiB7XG4gIGNvbG9yOiAjNjY3ZWVhO1xufVxuXG4vKiBBbGlnbm1lbnQgKi9cbi50YWJsZS1oZWFkZXItbGVmdCB7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG59XG5cbi50YWJsZS1oZWFkZXItY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4udGFibGUtaGVhZGVyLXJpZ2h0IHtcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XG59XG5cbi8qIENlbGwgc3R5bGVzICovXG4udGFibGUtY2VsbCB7XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZjNmNGY2O1xuICBjb2xvcjogIzExMTgyNztcbn1cblxuLnRhYmxlLXNtYWxsIC50YWJsZS1jZWxsIHtcbiAgcGFkZGluZzogOHB4IDEycHg7XG59XG5cbi50YWJsZS1tZWRpdW0gLnRhYmxlLWNlbGwge1xuICBwYWRkaW5nOiAxMnB4IDE2cHg7XG59XG5cbi50YWJsZS1sYXJnZSAudGFibGUtY2VsbCB7XG4gIHBhZGRpbmc6IDE2cHggMjBweDtcbn1cblxuLnRhYmxlLWNlbGwtbGVmdCB7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG59XG5cbi50YWJsZS1jZWxsLWNlbnRlciB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cblxuLnRhYmxlLWNlbGwtcmlnaHQge1xuICB0ZXh0LWFsaWduOiByaWdodDtcbn1cblxuLyogUm93IHN0eWxlcyAqL1xuLnRhYmxlLXJvdyB7XG4gIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4ycyBlYXNlLWluLW91dDtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4udGFibGUtc3RyaXBlZCAudGFibGUtcm93Om50aC1jaGlsZChldmVuKSB7XG4gIGJhY2tncm91bmQ6ICNmOWZhZmI7XG59XG5cbi50YWJsZS1ob3ZlcmFibGUgLnRhYmxlLXJvdzpob3ZlciB7XG4gIGJhY2tncm91bmQ6ICNmM2Y0ZjY7XG59XG5cbi8qIEJvcmRlcmVkIHZhcmlhbnQgKi9cbi50YWJsZS1ib3JkZXJlZCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkICNlNWU3ZWI7XG59XG5cbi50YWJsZS1ib3JkZXJlZCAudGFibGUtaGVhZGVyLFxuLnRhYmxlLWJvcmRlcmVkIC50YWJsZS1jZWxsIHtcbiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2U1ZTdlYjtcbn1cblxuLnRhYmxlLWJvcmRlcmVkIC50YWJsZS1oZWFkZXI6bGFzdC1jaGlsZCxcbi50YWJsZS1ib3JkZXJlZCAudGFibGUtY2VsbDpsYXN0LWNoaWxkIHtcbiAgYm9yZGVyLXJpZ2h0OiBub25lO1xufVxuXG4vKiBTdGlja3kgaGVhZGVyICovXG4udGFibGUtc3RpY2t5LWhlYWRlciB0aGVhZCB7XG4gIHBvc2l0aW9uOiBzdGlja3k7XG4gIHRvcDogMDtcbiAgei1pbmRleDogMTA7XG59XG5cbi8qIExvYWRpbmcgc3RhdGUgKi9cbi50YWJsZS1sb2FkaW5nLWNlbGwge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDQwcHggMjBweDtcbiAgY29sb3I6ICM2YjcyODA7XG59XG5cbi5sb2FkaW5nLWNvbnRlbnQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgZ2FwOiAxMnB4O1xufVxuXG4ubG9hZGluZy1zcGlubmVyIHtcbiAgd2lkdGg6IDIwcHg7XG4gIGhlaWdodDogMjBweDtcbiAgYm9yZGVyOiAycHggc29saWQgI2U1ZTdlYjtcbiAgYm9yZGVyLXRvcDogMnB4IHNvbGlkICM2NjdlZWE7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcbn1cblxuQGtleWZyYW1lcyBzcGluIHtcbiAgMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgfVxuICAxMDAlIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxufVxuXG4vKiBFbXB0eSBzdGF0ZSAqL1xuLnRhYmxlLWVtcHR5LWNlbGwge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDQwcHggMjBweDtcbiAgY29sb3I6ICM5Y2EzYWY7XG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcbn1cblxuLyogUmVzcG9uc2l2ZSAqL1xuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gIC50YWJsZS1jb250YWluZXIge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgfVxuXG4gIC50YWJsZS1oZWFkZXIsXG4gIC50YWJsZS1jZWxsIHtcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcbiAgfVxufSJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return TableComponent;
})();

/***/ })

}]);
//# sourceMappingURL=303.js.map