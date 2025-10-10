"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[416],{

/***/ 6587:
/*!*********************************************************************************!*\
  !*** ./src/app/components/trading/bot-config-form/bot-config-form.component.ts ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BotConfigFormComponent: () => (/* binding */ BotConfigFormComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _ui_input_input_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ui/input/input.component */ 8620);
/* harmony import */ var _ui_select_select_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ui/select/select.component */ 8594);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _lightweight_chart_lightweight_chart_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lightweight-chart/lightweight-chart.component */ 1037);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);












function BotConfigFormComponent_div_0_div_66_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 5)(1, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("filter.entryFilters"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("", ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.entryFilters.length, " ", ctx_r1.translate("bot.configured"), "");
  }
}
function BotConfigFormComponent_div_0_div_66_div_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 5)(1, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("filter.exitFilters"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("", ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.exitFilters.length, " ", ctx_r1.translate("bot.configured"), "");
  }
}
function BotConfigFormComponent_div_0_div_66_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 4)(1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](3, BotConfigFormComponent_div_0_div_66_div_3_Template, 5, 3, "div", 12)(4, BotConfigFormComponent_div_0_div_66_div_4_Template, 5, 3, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.tradingFilters"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.entryFilters) && (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.entryFilters.length) > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.exitFilters) && (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.exitFilters.length) > 0);
  }
}
function BotConfigFormComponent_div_0_div_67_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 4)(1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 5)(4, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](8, "currency");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "div", 5)(10, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 5)(15, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "div", 5)(20, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 5)(25, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](29, "number");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.performance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("dashboard.totalPnl"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"]((ctx_r1.botData == null ? null : ctx_r1.botData.totalPnL) >= 0 ? "positive" : "negative");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](8, 13, ctx_r1.botData == null ? null : ctx_r1.botData.totalPnL), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.totalTrades"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"]((ctx_r1.botData == null ? null : ctx_r1.botData.totalTrades) || 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("dashboard.winRate"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", (ctx_r1.botData == null ? null : ctx_r1.botData.winRate) || 0, "%");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.maxDrawdown"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", (ctx_r1.botData == null ? null : ctx_r1.botData.performance == null ? null : ctx_r1.botData.performance.maxDrawdown) || 0, "%");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.sharpeRatio"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind2"](29, 15, (ctx_r1.botData == null ? null : ctx_r1.botData.performance == null ? null : ctx_r1.botData.performance.sharpeRatio) || 0, "1.2-2"));
  }
}
function BotConfigFormComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 2)(1, "ui-card")(2, "ui-card-header")(3, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "ui-card-content")(6, "div", 3)(7, "div", 4)(8, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "div", 5)(11, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](15, "div", 5)(16, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "div", 5)(21, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](23, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "div", 5)(26, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](30, "div", 5)(31, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](35, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "div", 4)(37, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](39, "div", 5)(40, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](42, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](44, "div", 5)(45, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](46);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](47, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](49, "div", 5)(50, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](52, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](54, "currency");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](55, "div", 5)(56, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](57);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](58, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipe"](60, "currency");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](61, "div", 5)(62, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](64, "span", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](66, BotConfigFormComponent_div_0_div_66_Template, 5, 3, "div", 8)(67, BotConfigFormComponent_div_0_div_67_Template, 30, 18, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](68, "div", 9)(69, "ui-button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function BotConfigFormComponent_div_0_Template_ui_button_clicked_69_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.onCancel());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](71, "ui-button", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function BotConfigFormComponent_div_0_Template_ui_button_clicked_71_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.onEdit());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](72);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"]((ctx_r1.botData == null ? null : ctx_r1.botData.name) || ctx_r1.translate("bot.details"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.basicInformation"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.id"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.botData == null ? null : ctx_r1.botData.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.name"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.botData == null ? null : ctx_r1.botData.name);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.symbol"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.botData == null ? null : ctx_r1.botData.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.status"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"]("status-" + (ctx_r1.botData == null ? null : ctx_r1.botData.status == null ? null : ctx_r1.botData.status.toLowerCase()));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.botData == null ? null : ctx_r1.botData.status, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.created"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind2"](35, 30, ctx_r1.botData == null ? null : ctx_r1.botData.createdAt, "medium"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.gridConfiguration"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.gridLevels"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"]((ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.gridStrategy == null ? null : ctx_r1.botData.config.gridStrategy.gridCount) || ctx_r1.translate("dashboard.na"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.strategyType"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"]((ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.gridStrategy == null ? null : ctx_r1.botData.config.gridStrategy.type) || ctx_r1.translate("dashboard.na"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.upperPrice"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](54, 33, ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.gridRange == null ? null : ctx_r1.botData.config.gridRange.upperBound));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.lowerPrice"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵpipeBind1"](60, 35, ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.gridRange == null ? null : ctx_r1.botData.config.gridRange.lowerBound));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.orderAmount"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.riskManagement == null ? null : ctx_r1.botData.config.riskManagement.baseOrderSize);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.entryFilters) && (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.entryFilters.length) > 0 || (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.exitFilters) && (ctx_r1.botData == null ? null : ctx_r1.botData.config == null ? null : ctx_r1.botData.config.exitFilters.length) > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx_r1.botData == null ? null : ctx_r1.botData.performance);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("button.close"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"](" ", ctx_r1.translate("button.edit"), " ", ctx_r1.translate("bot.name"), " ");
  }
}
function BotConfigFormComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 13)(1, "div", 14)(2, "div", 15)(3, "app-lightweight-chart", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("symbolChange", function BotConfigFormComponent_div_1_Template_app_lightweight_chart_symbolChange_3_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.onChartSymbolChange($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("mousedown", function BotConfigFormComponent_div_1_Template_div_mousedown_4_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.startResize($event));
    })("touchstart", function BotConfigFormComponent_div_1_Template_div_touchstart_4_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.startResize($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](5, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "div", 19)(7, "div", 20)(8, "div", 21)(9, "div", 22)(10, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13, "Setup");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 22)(15, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18, "API");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "div", 22)(20, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23, "Pair");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 22)(25, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28, "Deposit");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](29, "div", 22)(30, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](31, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](33, "Filters");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](34, "div", 22)(35, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](36, "\u2713");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](37, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](38, "Orders");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](39, "div", 24)(40, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](41, "7");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](42, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](44, "form", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("ngSubmit", function BotConfigFormComponent_div_1_Template_form_ngSubmit_44_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.onSave());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](45, "div", 26)(46, "div", 27)(47, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](49, "div", 28)(50, "div", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](52, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](54, "div", 31)(55, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](56, "MEME USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](57, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](58, "ORDER USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](59, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](60, "1000PEPE USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](61, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](62, "THE USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](63, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](64, "AEVO USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](65, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](66, "ASTER USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](67, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](68, "PUMPETO USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](69, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](70, "STEL USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](71, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](72, "PUMPFUN USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](73, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](74, "AVNT USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](75, "div", 36)(76, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](78, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](79, "ui-select", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](80, "div", 27)(81, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](82);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](83, "div", 39)(84, "div", 40)(85, "span", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](86, "\u20AE");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](87, "span", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](88, "200");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](89, "div", 43)(90, "span", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](91, "0.0854105 USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](92, "ui-button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](93, "\u21BB");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](94, "div", 46)(95, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](96, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](97, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](98);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](99, "div", 46)(100, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](101, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](102, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](103);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](104, "div", 27)(105, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](106);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](107, "div", 49)(108, "div", 50)(109, "label", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](110);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](111, "ui-input", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](112, "div", 50)(113, "label", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](114);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](115, "ui-input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](116, "div", 50)(117, "label", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](118);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](119, "ui-input", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](120, "div", 50)(121, "label", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](122);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](123, "ui-input", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](124, "div", 50)(125, "label", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](126);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](127, "ui-input", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](128, "div", 50)(129, "label", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](130);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](131, "ui-select", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](132, "div", 27)(133, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](134);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](135, "div", 63)(136, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](137);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](138, "div", 64)(139, "div", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](140, "div", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](141, "div", 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](142, "20");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](143, "div", 46)(144, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](145, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](146, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](148, "div", 27)(149, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](150);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](151, "div", 68)(152, "div", 69)(153, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](154);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](155, "div", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](156);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](157, "div", 69)(158, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](159);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](160, "div", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](161);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](162, "div", 69)(163, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](164);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](165, "div", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](166);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](167, "div", 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](168, "input", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](169, "label", 73);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](170);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](171, "div", 74)(172, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](173);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](174, "div", 9)(175, "ui-button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function BotConfigFormComponent_div_1_Template_ui_button_clicked_175_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.onCancel());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](176);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](177, "ui-button", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](178);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleProp"]("width", ctx_r1.chartWidth, "%");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("symbol", ctx_r1.getSelectedSymbol())("chartHeight", ctx_r1.chartHeight)("gridConfig", ctx_r1.currentGridConfig);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵstyleProp"]("width", ctx_r1.formWidth, "%");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("button.launch"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("formGroup", ctx_r1.configForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.tradingPair"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.recommendedPairs"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.recommendedPairsDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.selectPair"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("options", ctx_r1.symbolOptions)("placeholder", ctx_r1.translate("bot.selectTradingPair"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.deposit"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("bot.balanceWarning"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("bot.insufficientBalance"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.configuration"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.name"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("placeholder", ctx_r1.translate("bot.enterName"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.gridLevels"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.orderAmount"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.upperPrice"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.lowerPrice"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.gridStrategy"), " *");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("options", ctx_r1.strategyOptions)("placeholder", ctx_r1.translate("bot.selectStrategyType"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.riskManagement"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.selectOrderType"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("bot.leverageWarning"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.termsAndConditions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.conservative"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.filters"), ": 7");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.balanced"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.filters"), ": 4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.aggressive"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.filters"), ": 4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("bot.iUnderstand"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("bot.availableTests"), ": 1");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("button.cancel"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("disabled", !ctx_r1.configForm.valid);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" \uD83D\uDD27 ", ctx_r1.mode === "edit" ? ctx_r1.translate("button.update") + " " + ctx_r1.translate("bot.name") : ctx_r1.translate("button.launch") + " " + ctx_r1.translate("bot.name"), " ");
  }
}
let BotConfigFormComponent = /*#__PURE__*/(() => {
  class BotConfigFormComponent {
    constructor(fb) {
      this.fb = fb;
      this.mode = 'create';
      this.save = new _angular_core__WEBPACK_IMPORTED_MODULE_6__.EventEmitter();
      this.cancel = new _angular_core__WEBPACK_IMPORTED_MODULE_6__.EventEmitter();
      this.edit = new _angular_core__WEBPACK_IMPORTED_MODULE_6__.EventEmitter();
      this.symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT', 'MATIC/USDT'];
      this.symbolOptions = [];
      this.strategyOptions = [{
        value: 'REGULAR',
        label: 'Regular (Linear)'
      }, {
        value: 'FIBONACCI',
        label: 'Fibonacci'
      }, {
        value: 'LOGARITHMIC',
        label: 'Logarithmic'
      }, {
        value: 'MULTIPLICATOR',
        label: 'Multiplicator'
      }, {
        value: 'MARTINGALE',
        label: 'Martingale'
      }];
      this.entryFilters = [];
      this.exitFilters = [];
      // Grid overlay properties removed
      // Resizable layout properties
      this.chartWidth = 65;
      this.chartHeight = 600;
      this.formWidth = 35;
      this.isResizing = false;
      this.startX = 0;
      this.startChartWidth = 0;
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_5__.TranslationService);
      this.configForm = this.createForm();
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    ngOnInit() {
      this.symbolOptions = this.symbols.map(s => ({
        value: s,
        label: s
      }));
      this.populateFormData();
      this.updateGridConfig();
      this.setupFormValueChanges();
      this.setupResizeListeners();
    }
    createForm() {
      return this.fb.group({
        name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.minLength(3)]],
        symbol: ['BTC/USDT', _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required],
        gridCount: [10, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(2), _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.max(100)]],
        baseOrderSize: [10, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0.01)]],
        upperBound: [50000, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        lowerBound: [30000, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        strategyType: ['REGULAR', _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required]
      });
    }
    populateFormData() {
      if (this.mode === 'edit' && this.botData) {
        this.configForm.patchValue({
          name: this.botData.name,
          symbol: this.botData.symbol,
          gridCount: this.botData.config?.gridStrategy?.gridCount || 10,
          baseOrderSize: this.botData.config?.riskManagement?.baseOrderSize || 10,
          upperBound: this.botData.config?.gridRange?.upperBound || 50000,
          lowerBound: this.botData.config?.gridRange?.lowerBound || 30000,
          strategyType: this.botData.config?.gridStrategy?.type || 'REGULAR'
        });
        // Load existing filters
        this.entryFilters = this.botData.config?.entryFilters || [];
        this.exitFilters = this.botData.config?.exitFilters || [];
      }
    }
    setupFormValueChanges() {
      // Update grid configuration whenever form values change
      this.configForm.valueChanges.subscribe(() => {
        this.updateGridConfig();
      });
    }
    updateGridConfig() {
      const formValue = this.configForm.value;
      if (formValue.symbol && formValue.upperBound && formValue.lowerBound && formValue.gridCount) {
        this.currentGridConfig = {
          symbol: formValue.symbol,
          upperBound: formValue.upperBound,
          lowerBound: formValue.lowerBound,
          gridCount: formValue.gridCount,
          gridSpacing: 1.0,
          // Will be calculated based on strategy
          strategyType: formValue.strategyType || 'REGULAR'
        };
        // Grid calculation removed
      }
    }
    onSave() {
      if (this.configForm.valid) {
        const formValue = this.configForm.value;
        const botConfig = {
          id: this.botData?.id,
          name: formValue.name,
          symbol: formValue.symbol,
          config: {
            symbol: formValue.symbol,
            baseAsset: formValue.symbol.split('/')[0] || 'BTC',
            quoteAsset: formValue.symbol.split('/')[1] || 'USDT',
            gridStrategy: {
              type: formValue.strategyType || 'REGULAR',
              gridCount: formValue.gridCount,
              gridSpacing: 1.0
            },
            gridRange: {
              upperBound: formValue.upperBound,
              lowerBound: formValue.lowerBound,
              autoAdjust: false
            },
            entryFilters: this.entryFilters,
            exitFilters: this.exitFilters,
            riskManagement: {
              baseOrderSize: formValue.baseOrderSize,
              maxPositionSize: formValue.baseOrderSize * formValue.gridCount,
              maxOpenOrders: formValue.gridCount
            }
          }
        };
        this.save.emit(botConfig);
      } else {
        Object.keys(this.configForm.controls).forEach(key => {
          const control = this.configForm.get(key);
          control?.markAsTouched();
        });
      }
    }
    onCancel() {
      this.cancel.emit();
    }
    onEdit() {
      this.edit.emit(this.botData);
    }
    onEntryFiltersChange(filters) {
      this.entryFilters = filters;
    }
    onExitFiltersChange(filters) {
      this.exitFilters = filters;
    }
    // Resizable layout methods
    startResize(event) {
      this.isResizing = true;
      this.startX = this.getClientX(event);
      this.startChartWidth = this.chartWidth;
      event.preventDefault();
      event.stopPropagation();
    }
    setupResizeListeners() {
      document.addEventListener('mousemove', this.handleResize.bind(this));
      document.addEventListener('mouseup', this.endResize.bind(this));
      document.addEventListener('touchmove', this.handleResize.bind(this));
      document.addEventListener('touchend', this.endResize.bind(this));
    }
    handleResize(event) {
      if (!this.isResizing) return;
      const currentX = this.getClientX(event);
      const deltaX = currentX - this.startX;
      const containerWidth = window.innerWidth - 48; // Account for padding
      const deltaPercent = deltaX / containerWidth * 100;
      let newChartWidth = this.startChartWidth + deltaPercent;
      // Constrain between 30% and 80%
      newChartWidth = Math.max(30, Math.min(80, newChartWidth));
      this.chartWidth = newChartWidth;
      this.formWidth = 100 - newChartWidth;
      event.preventDefault();
    }
    endResize() {
      this.isResizing = false;
    }
    // Chart-related methods
    getSelectedSymbol() {
      const symbol = this.configForm.get('symbol')?.value || 'BTC/USDT';
      return symbol.replace('/', '');
    }
    onChartSymbolChange(symbol) {
      // Update form when chart symbol changes
      const formattedSymbol = symbol.includes('/') ? symbol : symbol.replace('USDT', '/USDT');
      this.configForm.patchValue({
        symbol: formattedSymbol
      });
      this.updateGridConfig();
    }
    // Grid calculation methods removed as grid overlay is no longer needed
    getClientX(event) {
      if (event instanceof MouseEvent) {
        return event.clientX;
      } else {
        return event.touches[0]?.clientX || 0;
      }
    }
    static {
      this.ɵfac = function BotConfigFormComponent_Factory(t) {
        return new (t || BotConfigFormComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormBuilder));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({
        type: BotConfigFormComponent,
        selectors: [["app-bot-config-form"]],
        inputs: {
          mode: "mode",
          botData: "botData",
          strategyData: "strategyData"
        },
        outputs: {
          save: "save",
          cancel: "cancel",
          edit: "edit"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵStandaloneFeature"]],
        decls: 2,
        vars: 2,
        consts: [["class", "bot-view", 4, "ngIf"], ["class", "trading-layout", 4, "ngIf"], [1, "bot-view"], [1, "view-grid"], [1, "view-section"], [1, "view-item"], [1, "label"], [1, "value"], ["class", "view-section", 4, "ngIf"], [1, "form-actions"], ["variant", "ghost", 3, "clicked"], ["variant", "primary", 3, "clicked"], ["class", "view-item", 4, "ngIf"], [1, "trading-layout"], [1, "chart-container"], [1, "chart-wrapper"], [3, "symbolChange", "symbol", "chartHeight", "gridConfig"], [1, "resizer", 3, "mousedown", "touchstart"], [1, "resizer-handle"], [1, "form-container"], [1, "progress-header"], [1, "progress-steps"], [1, "step", "active"], [1, "step-icon"], [1, "step", "current"], [1, "bot-config-form", 3, "ngSubmit", "formGroup"], [1, "form-content"], [1, "config-section"], [1, "recommended-pairs"], [1, "section-subtitle"], [1, "info-text"], [1, "pairs-grid"], [1, "pair-item", "active"], [1, "pair-item"], [1, "pair-item", "trending"], [1, "pair-item", "neutral"], [1, "form-row"], [1, "pair-selector"], ["formControlName", "symbol", 3, "options", "placeholder"], [1, "deposit-info"], [1, "balance-display"], [1, "currency-icon"], [1, "amount"], [1, "balance-detail"], [1, "balance-value"], ["variant", "ghost", "size", "small", "className", "refresh-btn"], [1, "warning-card"], [1, "warning-icon"], [1, "warning-text"], [1, "form-grid"], [1, "form-group"], ["for", "botName"], ["id", "botName", "formControlName", "name", 3, "placeholder"], ["for", "gridCount"], ["id", "gridCount", "type", "number", "formControlName", "gridCount", "placeholder", "10", "min", "2", "max", "100"], ["for", "baseOrderSize"], ["id", "baseOrderSize", "type", "number", "formControlName", "baseOrderSize", "placeholder", "10", "step", "0.01", "min", "0.01"], ["for", "upperBound"], ["id", "upperBound", "type", "number", "formControlName", "upperBound", "placeholder", "50000", "step", "0.01", "min", "0"], ["for", "lowerBound"], ["id", "lowerBound", "type", "number", "formControlName", "lowerBound", "placeholder", "30000", "step", "0.01", "min", "0"], ["for", "strategyType"], ["id", "strategyType", "formControlName", "strategyType", 3, "options", "placeholder"], [1, "risk-slider"], [1, "slider-container"], [1, "slider-track"], [1, "slider-fill", 2, "width", "50%"], [1, "slider-value"], [1, "terms-grid"], [1, "term-type"], [1, "filter-count"], [1, "checkbox-option"], ["type", "checkbox", "id", "accept-terms"], ["for", "accept-terms"], [1, "test-info"], ["variant", "primary", "type", "submit", 1, "launch-btn", 3, "disabled"]],
        template: function BotConfigFormComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, BotConfigFormComponent_div_0_Template, 73, 37, "div", 0)(1, BotConfigFormComponent_div_1_Template, 179, 43, "div", 1);
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.mode === "view");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngIf", ctx.mode !== "view");
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_8__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_8__.DecimalPipe, _angular_common__WEBPACK_IMPORTED_MODULE_8__.CurrencyPipe, _angular_common__WEBPACK_IMPORTED_MODULE_8__.DatePipe, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_7__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormControlName, _ui_input_input_component__WEBPACK_IMPORTED_MODULE_0__.InputComponent, _ui_select_select_component__WEBPACK_IMPORTED_MODULE_1__.SelectComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_2__.ButtonComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardContentComponent, _lightweight_chart_lightweight_chart_component__WEBPACK_IMPORTED_MODULE_4__.LightweightChartComponent],
        styles: [".bot-config-form[_ngcontent-%COMP%], .bot-view[_ngcontent-%COMP%] {\n      width: 100%;\n      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n    }\n\n    \n\n    .trading-layout[_ngcontent-%COMP%] {\n      display: flex;\n      height: 100%;\n      gap: 1rem;\n      overflow: hidden;\n      padding: 1rem;\n    }\n\n    .chart-container[_ngcontent-%COMP%] {\n      overflow: hidden;\n      min-width: 300px;\n    }\n\n    .chart-header[_ngcontent-%COMP%] {\n      padding: 1rem;\n      border-bottom: 1px solid #2a2d3e;\n      background: #1a1d2e;\n    }\n\n    .chart-header[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n      margin: 0;\n      font-size: 1rem;\n      font-weight: 600;\n      color: #ffffff;\n    }\n\n    .chart-wrapper[_ngcontent-%COMP%] {\n      flex: 1;\n      position: relative;\n      overflow: hidden;\n    }\n\n    .chart-wrapper[_ngcontent-%COMP%]   app-trading-chart[_ngcontent-%COMP%] {\n      width: 100%;\n      height: 100%;\n      display: block;\n    }\n\n    .form-container[_ngcontent-%COMP%] {\n      display: flex;\n      flex-direction: column;\n      background: #1a1d2e;\n      overflow: hidden;\n      min-width: 300px;\n    }\n\n    \n\n    .resizer[_ngcontent-%COMP%] {\n      width: 8px;\n      background: #2a2d3e;\n      cursor: col-resize;\n      position: relative;\n      transition: background 0.2s ease;\n      flex-shrink: 0;\n    }\n\n    .resizer[_ngcontent-%COMP%]:hover {\n      background: #f59e0b;\n    }\n\n    .resizer-handle[_ngcontent-%COMP%] {\n      position: absolute;\n      top: 50%;\n      left: 50%;\n      transform: translate(-50%, -50%);\n      width: 3px;\n      height: 40px;\n      background: rgba(255, 255, 255, 0.3);\n      border-radius: 1.5px;\n      transition: all 0.2s ease;\n    }\n\n    .resizer[_ngcontent-%COMP%]:hover   .resizer-handle[_ngcontent-%COMP%] {\n      background: rgba(255, 255, 255, 0.8);\n      height: 60px;\n    }\n\n    \n\n    .progress-header[_ngcontent-%COMP%] {\n      background: #1a1d2e;\n      padding: 1.5rem;\n      border-bottom: 1px solid #2a2d3e;\n    }\n\n    .progress-steps[_ngcontent-%COMP%] {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      gap: 1rem;\n      padding: 0 0.5rem;\n    }\n\n    .step[_ngcontent-%COMP%] {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.5rem;\n      flex: 1;\n      position: relative;\n      padding: 0.25rem;\n    }\n\n    .step[_ngcontent-%COMP%]:not(:last-child)::after {\n      content: '';\n      position: absolute;\n      top: 12px;\n      right: -50%;\n      width: 100%;\n      height: 2px;\n      background: #10b981;\n      z-index: 1;\n    }\n\n    .step-icon[_ngcontent-%COMP%] {\n      width: 24px;\n      height: 24px;\n      border-radius: 50%;\n      background: #10b981;\n      color: #ffffff;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 0.75rem;\n      font-weight: 600;\n      position: relative;\n      z-index: 2;\n    }\n\n    .step.current[_ngcontent-%COMP%]   .step-icon[_ngcontent-%COMP%] {\n      background: #f59e0b;\n    }\n\n    .step[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n      font-size: 0.75rem;\n      color: #9ca3af;\n      font-weight: 500;\n    }\n\n    .step.current[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n      color: #f59e0b;\n    }\n\n    .form-content[_ngcontent-%COMP%] {\n      flex: 1;\n      padding: 0;\n      overflow-y: auto;\n    }\n\n    \n\n    .config-section[_ngcontent-%COMP%] {\n      padding: 2rem;\n      border-bottom: 1px solid #2a2d3e;\n    }\n\n    .config-section[_ngcontent-%COMP%]:last-child {\n      border-bottom: none;\n      padding-bottom: 1rem;\n    }\n\n    .config-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n      margin: 0 0 1.5rem 0;\n      font-size: 1.125rem;\n      font-weight: 600;\n      color: #ffffff;\n      padding-bottom: 0.5rem;\n      border-bottom: 1px solid rgba(42, 45, 62, 0.5);\n    }\n\n    \n\n    .section-subtitle[_ngcontent-%COMP%] {\n      font-size: 0.75rem;\n      font-weight: 600;\n      color: #9ca3af;\n      margin-bottom: 0.75rem;\n      text-transform: uppercase;\n      letter-spacing: 0.05em;\n    }\n\n    .info-text[_ngcontent-%COMP%] {\n      font-size: 0.875rem;\n      color: #6b7280;\n      margin-bottom: 1.5rem;\n      line-height: 1.5;\n    }\n\n    .pairs-grid[_ngcontent-%COMP%] {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 0.75rem;\n      margin-bottom: 2rem;\n      padding: 1rem;\n      background: rgba(31, 41, 55, 0.3);\n      border-radius: 8px;\n    }\n\n    .pair-item[_ngcontent-%COMP%] {\n      padding: 0.375rem 0.75rem;\n      border-radius: 16px;\n      font-size: 0.75rem;\n      font-weight: 600;\n      cursor: pointer;\n      transition: all 0.2s ease;\n      border: 1px solid #374151;\n      background: #1f2937;\n      color: #9ca3af;\n    }\n\n    .pair-item.active[_ngcontent-%COMP%] {\n      background: #fbbf24;\n      color: #000000;\n      border-color: #fbbf24;\n    }\n\n    .pair-item.trending[_ngcontent-%COMP%] {\n      background: #10b981;\n      color: #ffffff;\n      border-color: #10b981;\n    }\n\n    .pair-item.neutral[_ngcontent-%COMP%] {\n      background: #6b7280;\n      color: #ffffff;\n      border-color: #6b7280;\n    }\n\n    .pair-item[_ngcontent-%COMP%]:hover {\n      border-color: #f59e0b;\n    }\n\n    \n\n    .deposit-info[_ngcontent-%COMP%] {\n      margin-bottom: 1.5rem;\n    }\n\n    .balance-display[_ngcontent-%COMP%] {\n      display: flex;\n      align-items: center;\n      gap: 1rem;\n      padding: 1.5rem;\n      background: #1f2937;\n      border-radius: 12px;\n      border: 1px solid #374151;\n      margin-bottom: 1rem;\n    }\n\n    .currency-icon[_ngcontent-%COMP%] {\n      width: 32px;\n      height: 32px;\n      background: #10b981;\n      border-radius: 50%;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: #ffffff;\n      font-weight: 600;\n    }\n\n    .amount[_ngcontent-%COMP%] {\n      font-size: 1.25rem;\n      font-weight: 600;\n      color: #ffffff;\n    }\n\n    .balance-detail[_ngcontent-%COMP%] {\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n      margin-left: auto;\n    }\n\n    .balance-value[_ngcontent-%COMP%] {\n      font-size: 0.875rem;\n      color: #9ca3af;\n    }\n\n    .refresh-btn[_ngcontent-%COMP%] {\n      background: none;\n      border: none;\n      color: #9ca3af;\n      cursor: pointer;\n      padding: 0.25rem;\n      border-radius: 4px;\n      transition: all 0.2s ease;\n    }\n\n    .refresh-btn[_ngcontent-%COMP%]:hover {\n      background: #374151;\n      color: #ffffff;\n    }\n\n    \n\n    .warning-card[_ngcontent-%COMP%] {\n      display: flex;\n      align-items: flex-start;\n      gap: 1rem;\n      padding: 1.25rem;\n      background: #f59e0b;\n      border-radius: 10px;\n      margin-bottom: 1rem;\n      border-left: 4px solid #d97706;\n    }\n\n    .warning-card[_ngcontent-%COMP%]:last-child {\n      margin-bottom: 0;\n    }\n\n    .warning-icon[_ngcontent-%COMP%] {\n      font-size: 1rem;\n      flex-shrink: 0;\n    }\n\n    .warning-text[_ngcontent-%COMP%] {\n      font-size: 0.875rem;\n      color: #000000;\n      font-weight: 500;\n      line-height: 1.4;\n    }\n\n    \n\n    .risk-slider[_ngcontent-%COMP%] {\n      margin-bottom: 1.5rem;\n      padding: 1.5rem;\n      background: rgba(31, 41, 55, 0.2);\n      border-radius: 12px;\n    }\n\n    .risk-slider[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n      display: block;\n      font-size: 0.875rem;\n      color: #9ca3af;\n      margin-bottom: 1rem;\n      font-weight: 500;\n    }\n\n    .slider-container[_ngcontent-%COMP%] {\n      position: relative;\n      margin-bottom: 1rem;\n    }\n\n    .slider-track[_ngcontent-%COMP%] {\n      width: 100%;\n      height: 6px;\n      background: #374151;\n      border-radius: 3px;\n      position: relative;\n    }\n\n    .slider-fill[_ngcontent-%COMP%] {\n      height: 100%;\n      background: #fbbf24;\n      border-radius: 3px;\n      transition: width 0.2s ease;\n    }\n\n    .slider-value[_ngcontent-%COMP%] {\n      position: absolute;\n      top: -30px;\n      right: 0;\n      background: #fbbf24;\n      color: #000000;\n      padding: 0.25rem 0.5rem;\n      border-radius: 4px;\n      font-size: 0.75rem;\n      font-weight: 600;\n    }\n\n    \n\n    .terms-grid[_ngcontent-%COMP%] {\n      display: grid;\n      grid-template-columns: repeat(3, 1fr);\n      gap: 1.25rem;\n      margin-bottom: 1.5rem;\n      padding: 1rem;\n      background: rgba(31, 41, 55, 0.2);\n      border-radius: 12px;\n    }\n\n    .term-type[_ngcontent-%COMP%] {\n      text-align: center;\n      padding: 1.25rem 0.75rem;\n      border: 1px solid #374151;\n      border-radius: 10px;\n      background: #1f2937;\n      cursor: pointer;\n      transition: all 0.2s ease;\n    }\n\n    .term-type[_ngcontent-%COMP%]:hover {\n      border-color: #f59e0b;\n      background: rgba(245, 158, 11, 0.1);\n    }\n\n    .term-type[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n      margin: 0 0 0.5rem 0;\n      font-size: 0.875rem;\n      font-weight: 600;\n      color: #ffffff;\n    }\n\n    .filter-count[_ngcontent-%COMP%] {\n      font-size: 0.75rem;\n      color: #9ca3af;\n    }\n\n    \n\n    .checkbox-option[_ngcontent-%COMP%] {\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n      margin-bottom: 1rem;\n    }\n\n    .checkbox-option[_ngcontent-%COMP%]   input[type=\"checkbox\"][_ngcontent-%COMP%] {\n      width: 16px;\n      height: 16px;\n      accent-color: #f59e0b;\n    }\n\n    .checkbox-option[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n      font-size: 0.875rem;\n      color: #9ca3af;\n      cursor: pointer;\n    }\n\n    .test-info[_ngcontent-%COMP%] {\n      font-size: 0.875rem;\n      color: #9ca3af;\n    }\n\n    \n\n    .form-actions[_ngcontent-%COMP%] {\n      padding: 1.5rem;\n      border-top: 1px solid #2a2d3e;\n      background: #1a1d2e;\n      display: flex;\n      gap: 1rem;\n    }\n\n    .launch-btn[_ngcontent-%COMP%] {\n      flex: 1;\n      background: #f59e0b !important;\n      color: #000000 !important;\n      border: none !important;\n      font-weight: 600 !important;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 0.5rem;\n    }\n\n    .launch-btn[_ngcontent-%COMP%]:hover {\n      background: #d97706 !important;\n    }\n\n    .form-grid[_ngcontent-%COMP%] {\n      display: grid;\n      grid-template-columns: 1fr;\n      gap: 1.5rem;\n      margin-bottom: 2rem;\n      padding: 1.5rem;\n      background: rgba(31, 41, 55, 0.2);\n      border-radius: 12px;\n    }\n\n    \n\n    .trading-layout[_ngcontent-%COMP%]   .form-grid[_ngcontent-%COMP%] {\n      grid-template-columns: 1fr;\n    }\n\n    .form-group[_ngcontent-%COMP%] {\n      display: flex;\n      flex-direction: column;\n      gap: 0.75rem;\n    }\n\n    .form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n      font-weight: 500;\n      font-size: 0.875rem;\n      color: #9ca3af;\n      margin-bottom: 0.5rem;\n      display: block;\n    }\n\n    .form-row[_ngcontent-%COMP%] {\n      margin-bottom: 1.5rem;\n    }\n\n    .form-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n      font-weight: 500;\n      font-size: 0.875rem;\n      color: #9ca3af;\n      margin-bottom: 0.75rem;\n      display: block;\n    }\n\n    .pair-selector[_ngcontent-%COMP%] {\n      width: 100%;\n    }\n\n    \n\n    .trading-layout[_ngcontent-%COMP%]   ui-input[_ngcontent-%COMP%], \n   .trading-layout[_ngcontent-%COMP%]   ui-select[_ngcontent-%COMP%] {\n      background: #1f2937 !important;\n      border: 1px solid #374151 !important;\n      color: #ffffff !important;\n    }\n\n    .trading-layout[_ngcontent-%COMP%]   ui-input[_ngcontent-%COMP%]:focus, \n   .trading-layout[_ngcontent-%COMP%]   ui-select[_ngcontent-%COMP%]:focus {\n      border-color: #f59e0b !important;\n      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;\n    }\n\n    .form-actions[_ngcontent-%COMP%] {\n      display: flex;\n      justify-content: flex-end;\n      gap: 1rem;\n      padding: 1rem 0;\n    }\n\n    .view-grid[_ngcontent-%COMP%] {\n      display: flex;\n      flex-direction: column;\n      gap: 2rem;\n    }\n\n    .view-section[_ngcontent-%COMP%] {\n      border: 1px solid #e5e7eb;\n      border-radius: 8px;\n      padding: 1.5rem;\n      background: #f9fafb;\n    }\n\n    .view-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n      margin: 0 0 1rem 0;\n      font-size: 1.125rem;\n      font-weight: 600;\n      color: #111827;\n      border-bottom: 1px solid #d1d5db;\n      padding-bottom: 0.5rem;\n    }\n\n    .view-item[_ngcontent-%COMP%] {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      padding: 0.5rem 0;\n      border-bottom: 1px solid #f3f4f6;\n    }\n\n    .view-item[_ngcontent-%COMP%]:last-child {\n      border-bottom: none;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n      font-weight: 500;\n      color: #6b7280;\n      min-width: 120px;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n      font-weight: 600;\n      color: #111827;\n      text-align: right;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.positive[_ngcontent-%COMP%] {\n      color: #059669;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.negative[_ngcontent-%COMP%] {\n      color: #dc2626;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.status-running[_ngcontent-%COMP%] {\n      color: #059669;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.status-stopped[_ngcontent-%COMP%] {\n      color: #6b7280;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.status-paused[_ngcontent-%COMP%] {\n      color: #d97706;\n    }\n\n    .view-item[_ngcontent-%COMP%]   .value.status-error[_ngcontent-%COMP%] {\n      color: #dc2626;\n    }\n\n    .chart-section[_ngcontent-%COMP%] {\n      margin-top: 2rem;\n      padding-top: 1.5rem;\n      border-top: 1px solid #e5e7eb;\n    }\n\n    .chart-section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n      margin: 0 0 1rem 0;\n      font-size: 1rem;\n      font-weight: 600;\n      color: #111827;\n    }\n\n    @media (max-width: 1024px) {\n      .trading-layout[_ngcontent-%COMP%] {\n        flex-direction: column;\n        height: auto;\n        max-height: calc(100vh - 120px);\n      }\n\n      .chart-container[_ngcontent-%COMP%] {\n        min-width: auto;\n        height: 400px;\n        min-height: 400px;\n        border-right: none;\n        border-bottom: 1px solid #2a2d3e;\n      }\n\n      .form-container[_ngcontent-%COMP%] {\n        flex: 1;\n        min-height: 500px;\n      }\n\n      .progress-steps[_ngcontent-%COMP%] {\n        gap: 0.25rem;\n      }\n\n      .step[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n        font-size: 0.625rem;\n      }\n\n      .pairs-grid[_ngcontent-%COMP%] {\n        gap: 0.25rem;\n      }\n\n      .terms-grid[_ngcontent-%COMP%] {\n        grid-template-columns: 1fr;\n        gap: 0.5rem;\n      }\n    }\n\n    @media (max-width: 768px) {\n      .trading-layout[_ngcontent-%COMP%] {\n        flex-direction: column;\n        height: auto;\n        gap: 1.5rem;\n        padding: 1.25rem;\n      }\n\n      .chart-container[_ngcontent-%COMP%] {\n        min-width: 100%;\n        width: 100% !important;\n        height: 400px;\n        border-right: none;\n        border-bottom: 1px solid #2a2d3e;\n      }\n\n      .form-container[_ngcontent-%COMP%] {\n        flex: none;\n        width: 100% !important;\n      }\n\n      .resizer[_ngcontent-%COMP%] {\n        display: none;\n      }\n\n      .progress-header[_ngcontent-%COMP%] {\n        padding: 1.25rem;\n      }\n\n      .config-section[_ngcontent-%COMP%] {\n        padding: 1.5rem;\n        margin-bottom: 1.5rem;\n      }\n\n      .form-grid[_ngcontent-%COMP%] {\n        grid-template-columns: 1fr;\n        gap: 1rem;\n        padding: 1.25rem;\n      }\n\n      .pairs-grid[_ngcontent-%COMP%] {\n        gap: 0.75rem;\n        padding: 1.25rem;\n      }\n\n      .terms-grid[_ngcontent-%COMP%] {\n        gap: 1rem;\n        padding: 1.25rem;\n      }\n\n      .progress-steps[_ngcontent-%COMP%] {\n        flex-wrap: wrap;\n        gap: 0.75rem;\n      }\n\n      .step[_ngcontent-%COMP%] {\n        flex: none;\n        min-width: auto;\n        padding: 0.75rem 1rem;\n      }\n\n      .step[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n        font-size: 0.75rem;\n      }\n\n      .warning-card[_ngcontent-%COMP%] {\n        padding: 1rem;\n        margin: 1rem 0;\n      }\n\n      .form-actions[_ngcontent-%COMP%] {\n        padding: 1.5rem;\n        gap: 1rem;\n      }\n\n      .risk-slider[_ngcontent-%COMP%] {\n        padding: 1.25rem;\n      }\n    }\n\n    @media (max-width: 640px) {\n      .form-grid[_ngcontent-%COMP%] {\n        grid-template-columns: 1fr;\n      }\n\n      .form-actions[_ngcontent-%COMP%] {\n        flex-direction: column;\n      }\n\n      .view-item[_ngcontent-%COMP%] {\n        flex-direction: column;\n        align-items: flex-start;\n        gap: 0.25rem;\n      }\n\n      .view-item[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n        min-width: auto;\n      }\n\n      .view-item[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n        text-align: left;\n      }\n\n      .trading-layout[_ngcontent-%COMP%] {\n        height: auto;\n        max-height: none;\n        gap: 1rem;\n        padding: 1rem;\n      }\n\n      .chart-container[_ngcontent-%COMP%] {\n        height: 300px;\n        min-height: 300px;\n        width: 100% !important;\n        border-right: none;\n        border-bottom: 1px solid #2a2d3e;\n      }\n\n      .form-container[_ngcontent-%COMP%] {\n        flex: 1;\n        min-height: auto;\n        width: 100% !important;\n      }\n\n      .resizer[_ngcontent-%COMP%] {\n        display: none;\n      }\n\n      .config-section[_ngcontent-%COMP%] {\n        padding: 1.25rem;\n        margin-bottom: 1.25rem;\n      }\n\n      .progress-header[_ngcontent-%COMP%] {\n        padding: 1rem;\n      }\n\n      .progress-steps[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n      }\n\n      .step[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n        font-size: 0.7rem;\n      }\n\n      .step-icon[_ngcontent-%COMP%] {\n        width: 20px;\n        height: 20px;\n        font-size: 0.625rem;\n      }\n\n      .step[_ngcontent-%COMP%] {\n        padding: 0.5rem 0.75rem;\n      }\n\n      .form-grid[_ngcontent-%COMP%] {\n        gap: 0.75rem;\n        padding: 1rem;\n      }\n\n      .pairs-grid[_ngcontent-%COMP%] {\n        gap: 0.5rem;\n        padding: 1rem;\n      }\n\n      .pair-item[_ngcontent-%COMP%] {\n        padding: 0.25rem 0.5rem;\n        font-size: 0.625rem;\n      }\n\n      .balance-display[_ngcontent-%COMP%] {\n        padding: 1rem;\n      }\n\n      .currency-icon[_ngcontent-%COMP%] {\n        width: 28px;\n        height: 28px;\n      }\n\n      .amount[_ngcontent-%COMP%] {\n        font-size: 1rem;\n      }\n\n      .warning-card[_ngcontent-%COMP%] {\n        padding: 0.75rem;\n        margin: 0.75rem 0;\n      }\n\n      .terms-grid[_ngcontent-%COMP%] {\n        grid-template-columns: 1fr;\n        gap: 0.75rem;\n        padding: 1rem;\n      }\n\n      .form-actions[_ngcontent-%COMP%] {\n        padding: 1.25rem;\n        gap: 0.75rem;\n        flex-direction: column;\n      }\n\n      .form-actions[_ngcontent-%COMP%]   .launch-btn[_ngcontent-%COMP%] {\n        order: -1;\n      }\n\n      .risk-slider[_ngcontent-%COMP%] {\n        padding: 1rem;\n      }\n\n      .config-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n        margin-bottom: 1rem;\n      }\n    }\n\n    \n\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL2JvdC1jb25maWctZm9ybS9ib3QtY29uZmlnLWZvcm0uY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFBSTtNQUNFLFdBQVc7TUFDWCwyREFBMkQ7SUFDN0Q7O0lBRUEsZ0RBQWdEO0lBQ2hEO01BQ0UsYUFBYTtNQUNiLFlBQVk7TUFDWixTQUFTO01BQ1QsZ0JBQWdCO01BQ2hCLGFBQWE7SUFDZjs7SUFFQTtNQUNFLGdCQUFnQjtNQUNoQixnQkFBZ0I7SUFDbEI7O0lBRUE7TUFDRSxhQUFhO01BQ2IsZ0NBQWdDO01BQ2hDLG1CQUFtQjtJQUNyQjs7SUFFQTtNQUNFLFNBQVM7TUFDVCxlQUFlO01BQ2YsZ0JBQWdCO01BQ2hCLGNBQWM7SUFDaEI7O0lBRUE7TUFDRSxPQUFPO01BQ1Asa0JBQWtCO01BQ2xCLGdCQUFnQjtJQUNsQjs7SUFFQTtNQUNFLFdBQVc7TUFDWCxZQUFZO01BQ1osY0FBYztJQUNoQjs7SUFFQTtNQUNFLGFBQWE7TUFDYixzQkFBc0I7TUFDdEIsbUJBQW1CO01BQ25CLGdCQUFnQjtNQUNoQixnQkFBZ0I7SUFDbEI7O0lBRUEsWUFBWTtJQUNaO01BQ0UsVUFBVTtNQUNWLG1CQUFtQjtNQUNuQixrQkFBa0I7TUFDbEIsa0JBQWtCO01BQ2xCLGdDQUFnQztNQUNoQyxjQUFjO0lBQ2hCOztJQUVBO01BQ0UsbUJBQW1CO0lBQ3JCOztJQUVBO01BQ0Usa0JBQWtCO01BQ2xCLFFBQVE7TUFDUixTQUFTO01BQ1QsZ0NBQWdDO01BQ2hDLFVBQVU7TUFDVixZQUFZO01BQ1osb0NBQW9DO01BQ3BDLG9CQUFvQjtNQUNwQix5QkFBeUI7SUFDM0I7O0lBRUE7TUFDRSxvQ0FBb0M7TUFDcEMsWUFBWTtJQUNkOztJQUVBLG9CQUFvQjtJQUNwQjtNQUNFLG1CQUFtQjtNQUNuQixlQUFlO01BQ2YsZ0NBQWdDO0lBQ2xDOztJQUVBO01BQ0UsYUFBYTtNQUNiLDhCQUE4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RUE7UUFDRSxPQUFPO1FBQ1AsZ0JBQWdCO1FBQ2hCLHNCQUFzQjtNQUN4Qjs7TUFFQTtRQUNFLGFBQWE7TUFDZjs7TUFFQTtRQUNFLGdCQUFnQjtRQUNoQixzQkFBc0I7TUFDeEI7O01BRUE7UUFDRSxhQUFhO01BQ2Y7O01BRUE7UUFDRSxXQUFXO01BQ2I7O01BRUE7UUFDRSxpQkFBaUI7TUFDbkI7O01BRUE7UUFDRSxXQUFXO1FBQ1gsWUFBWTtRQUNaLG1CQUFtQjtNQUNyQjs7TUFFQTtRQUNFLHVCQUF1QjtNQUN6Qjs7TUFFQTtRQUNFLFlBQVk7UUFDWixhQUFhO01BQ2Y7O01BRUE7UUFDRSxXQUFXO1FBQ1gsYUFBYTtNQUNmOztNQUVBO1FBQ0UsdUJBQXVCO1FBQ3ZCLG1CQUFtQjtNQUNyQjs7TUFFQTtRQUNFLGFBQWE7TUFDZjs7TUFFQTtRQUNFLFdBQVc7UUFDWCxZQUFZO01BQ2Q7O01BRUE7UUFDRSxlQUFlO01BQ2pCOztNQUVBO1FBQ0UsZ0JBQWdCO1FBQ2hCLGlCQUFpQjtNQUNuQjs7TUFFQTtRQUNFLDBCQUEwQjtRQUMxQixZQUFZO1FBQ1osYUFBYTtNQUNmOztNQUVBO1FBQ0UsZ0JBQWdCO1FBQ2hCLFlBQVk7UUFDWixzQkFBc0I7TUFDeEI7O01BRUE7UUFDRSxTQUFTO01BQ1g7O01BRUE7UUFDRSxhQUFhO01BQ2Y7O01BRUE7UUFDRSxtQkFBbUI7TUFDckI7SUFDRjs7SUFFQSw2Q0FBNkMiLCJzb3VyY2VzQ29udGVudCI6WyIgICAgLmJvdC1jb25maWctZm9ybSwgLmJvdC12aWV3IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNTBweCwgMWZyKSk7XG4gICAgfVxuXG4gICAgLyogVHJhZGluZyBMYXlvdXQgU3R5bGVzIC0gUHJvZmVzc2lvbmFsIERlc2lnbiAqL1xuICAgIC50cmFkaW5nLWxheW91dCB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgZ2FwOiAxcmVtO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgfVxuXG4gICAgLmNoYXJ0LWNvbnRhaW5lciB7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgbWluLXdpZHRoOiAzMDBweDtcbiAgICB9XG5cbiAgICAuY2hhcnQtaGVhZGVyIHtcbiAgICAgIHBhZGRpbmc6IDFyZW07XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzJhMmQzZTtcbiAgICAgIGJhY2tncm91bmQ6ICMxYTFkMmU7XG4gICAgfVxuXG4gICAgLmNoYXJ0LWhlYWRlciBoNCB7XG4gICAgICBtYXJnaW46IDA7XG4gICAgICBmb250LXNpemU6IDFyZW07XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6ICNmZmZmZmY7XG4gICAgfVxuXG4gICAgLmNoYXJ0LXdyYXBwZXIge1xuICAgICAgZmxleDogMTtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgfVxuXG4gICAgLmNoYXJ0LXdyYXBwZXIgYXBwLXRyYWRpbmctY2hhcnQge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICB9XG5cbiAgICAuZm9ybS1jb250YWluZXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICBiYWNrZ3JvdW5kOiAjMWExZDJlO1xuICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICAgIG1pbi13aWR0aDogMzAwcHg7XG4gICAgfVxuXG4gICAgLyogUmVzaXplciAqL1xuICAgIC5yZXNpemVyIHtcbiAgICAgIHdpZHRoOiA4cHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjMmEyZDNlO1xuICAgICAgY3Vyc29yOiBjb2wtcmVzaXplO1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjJzIGVhc2U7XG4gICAgICBmbGV4LXNocmluazogMDtcbiAgICB9XG5cbiAgICAucmVzaXplcjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZjU5ZTBiO1xuICAgIH1cblxuICAgIC5yZXNpemVyLWhhbmRsZSB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDUwJTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgd2lkdGg6IDNweDtcbiAgICAgIGhlaWdodDogNDBweDtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEuNXB4O1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAucmVzaXplcjpob3ZlciAucmVzaXplci1oYW5kbGUge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpO1xuICAgICAgaGVpZ2h0OiA2MHB4O1xuICAgIH1cblxuICAgIC8qIFByb2dyZXNzIEhlYWRlciAqL1xuICAgIC5wcm9ncmVzcy1oZWFkZXIge1xuICAgICAgYmFja2dyb3VuZDogIzFhMWQyZTtcbiAgICAgIHBhZGRpbmc6IDEuNXJlbTtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMmEyZDNlO1xuICAgIH1cblxuICAgIC5wcm9ncmVzcy1zdGVwcyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMXJlbTtcbiAgICAgIHBhZGRpbmc6IDAgMC41cmVtO1xuICAgIH1cblxuICAgIC5zdGVwIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMC41cmVtO1xuICAgICAgZmxleDogMTtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIHBhZGRpbmc6IDAuMjVyZW07XG4gICAgfVxuXG4gICAgLnN0ZXA6bm90KDpsYXN0LWNoaWxkKTo6YWZ0ZXIge1xuICAgICAgY29udGVudDogJyc7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDEycHg7XG4gICAgICByaWdodDogLTUwJTtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgaGVpZ2h0OiAycHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjMTBiOTgxO1xuICAgICAgei1pbmRleDogMTtcbiAgICB9XG5cbiAgICAuc3RlcC1pY29uIHtcbiAgICAgIHdpZHRoOiAyNHB4O1xuICAgICAgaGVpZ2h0OiAyNHB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgYmFja2dyb3VuZDogIzEwYjk4MTtcbiAgICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICB6LWluZGV4OiAyO1xuICAgIH1cblxuICAgIC5zdGVwLmN1cnJlbnQgLnN0ZXAtaWNvbiB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZjU5ZTBiO1xuICAgIH1cblxuICAgIC5zdGVwIHNwYW4ge1xuICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgY29sb3I6ICM5Y2EzYWY7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgIH1cblxuICAgIC5zdGVwLmN1cnJlbnQgc3BhbiB7XG4gICAgICBjb2xvcjogI2Y1OWUwYjtcbiAgICB9XG5cbiAgICAuZm9ybS1jb250ZW50IHtcbiAgICAgIGZsZXg6IDE7XG4gICAgICBwYWRkaW5nOiAwO1xuICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICB9XG5cbiAgICAvKiBDb25maWcgU2VjdGlvbnMgKi9cbiAgICAuY29uZmlnLXNlY3Rpb24ge1xuICAgICAgcGFkZGluZzogMnJlbTtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMmEyZDNlO1xuICAgIH1cblxuICAgIC5jb25maWctc2VjdGlvbjpsYXN0LWNoaWxkIHtcbiAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbiAgICB9XG5cbiAgICAuY29uZmlnLXNlY3Rpb24gaDMge1xuICAgICAgbWFyZ2luOiAwIDAgMS41cmVtIDA7XG4gICAgICBmb250LXNpemU6IDEuMTI1cmVtO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgICAgcGFkZGluZy1ib3R0b206IDAuNXJlbTtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDQyLCA0NSwgNjIsIDAuNSk7XG4gICAgfVxuXG4gICAgLyogVHJhZGluZyBQYWlycyAqL1xuICAgIC5zZWN0aW9uLXN1YnRpdGxlIHtcbiAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICAgIG1hcmdpbi1ib3R0b206IDAuNzVyZW07XG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuMDVlbTtcbiAgICB9XG5cbiAgICAuaW5mby10ZXh0IHtcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzZiNzI4MDtcbiAgICAgIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgfVxuXG4gICAgLnBhaXJzLWdyaWQge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICAgIGdhcDogMC43NXJlbTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDJyZW07XG4gICAgICBwYWRkaW5nOiAxcmVtO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgzMSwgNDEsIDU1LCAwLjMpO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgIH1cblxuICAgIC5wYWlyLWl0ZW0ge1xuICAgICAgcGFkZGluZzogMC4zNzVyZW0gMC43NXJlbTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHg7XG4gICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzNzQxNTE7XG4gICAgICBiYWNrZ3JvdW5kOiAjMWYyOTM3O1xuICAgICAgY29sb3I6ICM5Y2EzYWY7XG4gICAgfVxuXG4gICAgLnBhaXItaXRlbS5hY3RpdmUge1xuICAgICAgYmFja2dyb3VuZDogI2ZiYmYyNDtcbiAgICAgIGNvbG9yOiAjMDAwMDAwO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjZmJiZjI0O1xuICAgIH1cblxuICAgIC5wYWlyLWl0ZW0udHJlbmRpbmcge1xuICAgICAgYmFja2dyb3VuZDogIzEwYjk4MTtcbiAgICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgICAgYm9yZGVyLWNvbG9yOiAjMTBiOTgxO1xuICAgIH1cblxuICAgIC5wYWlyLWl0ZW0ubmV1dHJhbCB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNmI3MjgwO1xuICAgICAgY29sb3I6ICNmZmZmZmY7XG4gICAgICBib3JkZXItY29sb3I6ICM2YjcyODA7XG4gICAgfVxuXG4gICAgLnBhaXItaXRlbTpob3ZlciB7XG4gICAgICBib3JkZXItY29sb3I6ICNmNTllMGI7XG4gICAgfVxuXG4gICAgLyogRGVwb3NpdCBTZWN0aW9uICovXG4gICAgLmRlcG9zaXQtaW5mbyB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgfVxuXG4gICAgLmJhbGFuY2UtZGlzcGxheSB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMXJlbTtcbiAgICAgIHBhZGRpbmc6IDEuNXJlbTtcbiAgICAgIGJhY2tncm91bmQ6ICMxZjI5Mzc7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzM3NDE1MTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gICAgfVxuXG4gICAgLmN1cnJlbmN5LWljb24ge1xuICAgICAgd2lkdGg6IDMycHg7XG4gICAgICBoZWlnaHQ6IDMycHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjMTBiOTgxO1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICB9XG5cbiAgICAuYW1vdW50IHtcbiAgICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogI2ZmZmZmZjtcbiAgICB9XG5cbiAgICAuYmFsYW5jZS1kZXRhaWwge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDAuNXJlbTtcbiAgICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICAgIH1cblxuICAgIC5iYWxhbmNlLXZhbHVlIHtcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICB9XG5cbiAgICAucmVmcmVzaC1idG4ge1xuICAgICAgYmFja2dyb3VuZDogbm9uZTtcbiAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgIGNvbG9yOiAjOWNhM2FmO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgcGFkZGluZzogMC4yNXJlbTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLnJlZnJlc2gtYnRuOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6ICMzNzQxNTE7XG4gICAgICBjb2xvcjogI2ZmZmZmZjtcbiAgICB9XG5cbiAgICAvKiBXYXJuaW5nIENhcmRzICovXG4gICAgLndhcm5pbmctY2FyZCB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgICBnYXA6IDFyZW07XG4gICAgICBwYWRkaW5nOiAxLjI1cmVtO1xuICAgICAgYmFja2dyb3VuZDogI2Y1OWUwYjtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xuICAgICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCAjZDk3NzA2O1xuICAgIH1cblxuICAgIC53YXJuaW5nLWNhcmQ6bGFzdC1jaGlsZCB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAwO1xuICAgIH1cblxuICAgIC53YXJuaW5nLWljb24ge1xuICAgICAgZm9udC1zaXplOiAxcmVtO1xuICAgICAgZmxleC1zaHJpbms6IDA7XG4gICAgfVxuXG4gICAgLndhcm5pbmctdGV4dCB7XG4gICAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgICAgY29sb3I6ICMwMDAwMDA7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcbiAgICB9XG5cbiAgICAvKiBSaXNrIFNsaWRlciAqL1xuICAgIC5yaXNrLXNsaWRlciB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgICBwYWRkaW5nOiAxLjVyZW07XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDMxLCA0MSwgNTUsIDAuMik7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgIH1cblxuICAgIC5yaXNrLXNsaWRlciBsYWJlbCB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgIH1cblxuICAgIC5zbGlkZXItY29udGFpbmVyIHtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gICAgfVxuXG4gICAgLnNsaWRlci10cmFjayB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogNnB4O1xuICAgICAgYmFja2dyb3VuZDogIzM3NDE1MTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB9XG5cbiAgICAuc2xpZGVyLWZpbGwge1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgYmFja2dyb3VuZDogI2ZiYmYyNDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgIHRyYW5zaXRpb246IHdpZHRoIDAuMnMgZWFzZTtcbiAgICB9XG5cbiAgICAuc2xpZGVyLXZhbHVlIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogLTMwcHg7XG4gICAgICByaWdodDogMDtcbiAgICAgIGJhY2tncm91bmQ6ICNmYmJmMjQ7XG4gICAgICBjb2xvcjogIzAwMDAwMDtcbiAgICAgIHBhZGRpbmc6IDAuMjVyZW0gMC41cmVtO1xuICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICB9XG5cbiAgICAvKiBUZXJtcyBHcmlkICovXG4gICAgLnRlcm1zLWdyaWQge1xuICAgICAgZGlzcGxheTogZ3JpZDtcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDFmcik7XG4gICAgICBnYXA6IDEuMjVyZW07XG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgICBwYWRkaW5nOiAxcmVtO1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgzMSwgNDEsIDU1LCAwLjIpO1xuICAgICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICB9XG5cbiAgICAudGVybS10eXBlIHtcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgIHBhZGRpbmc6IDEuMjVyZW0gMC43NXJlbTtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzNzQxNTE7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgYmFja2dyb3VuZDogIzFmMjkzNztcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gICAgfVxuXG4gICAgLnRlcm0tdHlwZTpob3ZlciB7XG4gICAgICBib3JkZXItY29sb3I6ICNmNTllMGI7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI0NSwgMTU4LCAxMSwgMC4xKTtcbiAgICB9XG5cbiAgICAudGVybS10eXBlIGg0IHtcbiAgICAgIG1hcmdpbjogMCAwIDAuNXJlbSAwO1xuICAgICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogI2ZmZmZmZjtcbiAgICB9XG5cbiAgICAuZmlsdGVyLWNvdW50IHtcbiAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgIGNvbG9yOiAjOWNhM2FmO1xuICAgIH1cblxuICAgIC8qIENoZWNrYm94ICovXG4gICAgLmNoZWNrYm94LW9wdGlvbiB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMC41cmVtO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICB9XG5cbiAgICAuY2hlY2tib3gtb3B0aW9uIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXSB7XG4gICAgICB3aWR0aDogMTZweDtcbiAgICAgIGhlaWdodDogMTZweDtcbiAgICAgIGFjY2VudC1jb2xvcjogI2Y1OWUwYjtcbiAgICB9XG5cbiAgICAuY2hlY2tib3gtb3B0aW9uIGxhYmVsIHtcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG5cbiAgICAudGVzdC1pbmZvIHtcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICB9XG5cbiAgICAvKiBGb3JtIEFjdGlvbnMgKi9cbiAgICAuZm9ybS1hY3Rpb25zIHtcbiAgICAgIHBhZGRpbmc6IDEuNXJlbTtcbiAgICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCAjMmEyZDNlO1xuICAgICAgYmFja2dyb3VuZDogIzFhMWQyZTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBnYXA6IDFyZW07XG4gICAgfVxuXG4gICAgLmxhdW5jaC1idG4ge1xuICAgICAgZmxleDogMTtcbiAgICAgIGJhY2tncm91bmQ6ICNmNTllMGIgIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiAjMDAwMDAwICFpbXBvcnRhbnQ7XG4gICAgICBib3JkZXI6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDAgIWltcG9ydGFudDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBnYXA6IDAuNXJlbTtcbiAgICB9XG5cbiAgICAubGF1bmNoLWJ0bjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiAjZDk3NzA2ICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgLmZvcm0tZ3JpZCB7XG4gICAgICBkaXNwbGF5OiBncmlkO1xuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgICBnYXA6IDEuNXJlbTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDJyZW07XG4gICAgICBwYWRkaW5nOiAxLjVyZW07XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDMxLCA0MSwgNTUsIDAuMik7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgIH1cblxuICAgIC8qIEFkanVzdCBmb3JtIGdyaWQgZm9yIHRyYWRpbmcgbGF5b3V0ICovXG4gICAgLnRyYWRpbmctbGF5b3V0IC5mb3JtLWdyaWQge1xuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgfVxuXG4gICAgLmZvcm0tZ3JvdXAge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICBnYXA6IDAuNzVyZW07XG4gICAgfVxuXG4gICAgLmZvcm0tZ3JvdXAgbGFiZWwge1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICBjb2xvcjogIzljYTNhZjtcbiAgICAgIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIH1cblxuICAgIC5mb3JtLXJvdyB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgfVxuXG4gICAgLmZvcm0tcm93IGxhYmVsIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgICAgY29sb3I6ICM5Y2EzYWY7XG4gICAgICBtYXJnaW4tYm90dG9tOiAwLjc1cmVtO1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgfVxuXG4gICAgLnBhaXItc2VsZWN0b3Ige1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxuXG4gICAgLyogT3ZlcnJpZGUgVUkgY29tcG9uZW50IHN0eWxlcyBmb3IgZGFyayB0aGVtZSAqL1xuICAgIC50cmFkaW5nLWxheW91dCB1aS1pbnB1dCxcbiAgICAudHJhZGluZy1sYXlvdXQgdWktc2VsZWN0IHtcbiAgICAgIGJhY2tncm91bmQ6ICMxZjI5MzcgIWltcG9ydGFudDtcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzNzQxNTEgIWltcG9ydGFudDtcbiAgICAgIGNvbG9yOiAjZmZmZmZmICFpbXBvcnRhbnQ7XG4gICAgfVxuXG4gICAgLnRyYWRpbmctbGF5b3V0IHVpLWlucHV0OmZvY3VzLFxuICAgIC50cmFkaW5nLWxheW91dCB1aS1zZWxlY3Q6Zm9jdXMge1xuICAgICAgYm9yZGVyLWNvbG9yOiAjZjU5ZTBiICFpbXBvcnRhbnQ7XG4gICAgICBib3gtc2hhZG93OiAwIDAgMCAycHggcmdiYSgyNDUsIDE1OCwgMTEsIDAuMikgIWltcG9ydGFudDtcbiAgICB9XG5cbiAgICAuZm9ybS1hY3Rpb25zIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICAgICAgZ2FwOiAxcmVtO1xuICAgICAgcGFkZGluZzogMXJlbSAwO1xuICAgIH1cblxuICAgIC52aWV3LWdyaWQge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICBnYXA6IDJyZW07XG4gICAgfVxuXG4gICAgLnZpZXctc2VjdGlvbiB7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjZTVlN2ViO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgcGFkZGluZzogMS41cmVtO1xuICAgICAgYmFja2dyb3VuZDogI2Y5ZmFmYjtcbiAgICB9XG5cbiAgICAudmlldy1zZWN0aW9uIGgzIHtcbiAgICAgIG1hcmdpbjogMCAwIDFyZW0gMDtcbiAgICAgIGZvbnQtc2l6ZTogMS4xMjVyZW07XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6ICMxMTE4Mjc7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2QxZDVkYjtcbiAgICAgIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG4gICAgfVxuXG4gICAgLnZpZXctaXRlbSB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIHBhZGRpbmc6IDAuNXJlbSAwO1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmM2Y0ZjY7XG4gICAgfVxuXG4gICAgLnZpZXctaXRlbTpsYXN0LWNoaWxkIHtcbiAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgfVxuXG4gICAgLnZpZXctaXRlbSAubGFiZWwge1xuICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgIGNvbG9yOiAjNmI3MjgwO1xuICAgICAgbWluLXdpZHRoOiAxMjBweDtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZSB7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6ICMxMTE4Mjc7XG4gICAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZS5wb3NpdGl2ZSB7XG4gICAgICBjb2xvcjogIzA1OTY2OTtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZS5uZWdhdGl2ZSB7XG4gICAgICBjb2xvcjogI2RjMjYyNjtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZS5zdGF0dXMtcnVubmluZyB7XG4gICAgICBjb2xvcjogIzA1OTY2OTtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZS5zdGF0dXMtc3RvcHBlZCB7XG4gICAgICBjb2xvcjogIzZiNzI4MDtcbiAgICB9XG5cbiAgICAudmlldy1pdGVtIC52YWx1ZS5zdGF0dXMtcGF1c2VkIHtcbiAgICAgIGNvbG9yOiAjZDk3NzA2O1xuICAgIH1cblxuICAgIC52aWV3LWl0ZW0gLnZhbHVlLnN0YXR1cy1lcnJvciB7XG4gICAgICBjb2xvcjogI2RjMjYyNjtcbiAgICB9XG5cbiAgICAuY2hhcnQtc2VjdGlvbiB7XG4gICAgICBtYXJnaW4tdG9wOiAycmVtO1xuICAgICAgcGFkZGluZy10b3A6IDEuNXJlbTtcbiAgICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCAjZTVlN2ViO1xuICAgIH1cblxuICAgIC5jaGFydC1zZWN0aW9uIGg0IHtcbiAgICAgIG1hcmdpbjogMCAwIDFyZW0gMDtcbiAgICAgIGZvbnQtc2l6ZTogMXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogIzExMTgyNztcbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogMTAyNHB4KSB7XG4gICAgICAudHJhZGluZy1sYXlvdXQge1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSAxMjBweCk7XG4gICAgICB9XG5cbiAgICAgIC5jaGFydC1jb250YWluZXIge1xuICAgICAgICBtaW4td2lkdGg6IGF1dG87XG4gICAgICAgIGhlaWdodDogNDAwcHg7XG4gICAgICAgIG1pbi1oZWlnaHQ6IDQwMHB4O1xuICAgICAgICBib3JkZXItcmlnaHQ6IG5vbmU7XG4gICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMmEyZDNlO1xuICAgICAgfVxuXG4gICAgICAuZm9ybS1jb250YWluZXIge1xuICAgICAgICBmbGV4OiAxO1xuICAgICAgICBtaW4taGVpZ2h0OiA1MDBweDtcbiAgICAgIH1cblxuICAgICAgLnByb2dyZXNzLXN0ZXBzIHtcbiAgICAgICAgZ2FwOiAwLjI1cmVtO1xuICAgICAgfVxuXG4gICAgICAuc3RlcCBzcGFuIHtcbiAgICAgICAgZm9udC1zaXplOiAwLjYyNXJlbTtcbiAgICAgIH1cblxuICAgICAgLnBhaXJzLWdyaWQge1xuICAgICAgICBnYXA6IDAuMjVyZW07XG4gICAgICB9XG5cbiAgICAgIC50ZXJtcy1ncmlkIHtcbiAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgICAgIGdhcDogMC41cmVtO1xuICAgICAgfVxuICAgIH1cblxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgICAgLnRyYWRpbmctbGF5b3V0IHtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICBnYXA6IDEuNXJlbTtcbiAgICAgICAgcGFkZGluZzogMS4yNXJlbTtcbiAgICAgIH1cblxuICAgICAgLmNoYXJ0LWNvbnRhaW5lciB7XG4gICAgICAgIG1pbi13aWR0aDogMTAwJTtcbiAgICAgICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbiAgICAgICAgaGVpZ2h0OiA0MDBweDtcbiAgICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xuICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzJhMmQzZTtcbiAgICAgIH1cblxuICAgICAgLmZvcm0tY29udGFpbmVyIHtcbiAgICAgICAgZmxleDogbm9uZTtcbiAgICAgICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbiAgICAgIH1cblxuICAgICAgLnJlc2l6ZXIge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgfVxuXG4gICAgICAucHJvZ3Jlc3MtaGVhZGVyIHtcbiAgICAgICAgcGFkZGluZzogMS4yNXJlbTtcbiAgICAgIH1cblxuICAgICAgLmNvbmZpZy1zZWN0aW9uIHtcbiAgICAgICAgcGFkZGluZzogMS41cmVtO1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgICB9XG5cbiAgICAgIC5mb3JtLWdyaWQge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgICAgICAgZ2FwOiAxcmVtO1xuICAgICAgICBwYWRkaW5nOiAxLjI1cmVtO1xuICAgICAgfVxuXG4gICAgICAucGFpcnMtZ3JpZCB7XG4gICAgICAgIGdhcDogMC43NXJlbTtcbiAgICAgICAgcGFkZGluZzogMS4yNXJlbTtcbiAgICAgIH1cblxuICAgICAgLnRlcm1zLWdyaWQge1xuICAgICAgICBnYXA6IDFyZW07XG4gICAgICAgIHBhZGRpbmc6IDEuMjVyZW07XG4gICAgICB9XG5cbiAgICAgIC5wcm9ncmVzcy1zdGVwcyB7XG4gICAgICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICAgICAgZ2FwOiAwLjc1cmVtO1xuICAgICAgfVxuXG4gICAgICAuc3RlcCB7XG4gICAgICAgIGZsZXg6IG5vbmU7XG4gICAgICAgIG1pbi13aWR0aDogYXV0bztcbiAgICAgICAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xuICAgICAgfVxuXG4gICAgICAuc3RlcCBzcGFuIHtcbiAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgfVxuXG4gICAgICAud2FybmluZy1jYXJkIHtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgICAgbWFyZ2luOiAxcmVtIDA7XG4gICAgICB9XG5cbiAgICAgIC5mb3JtLWFjdGlvbnMge1xuICAgICAgICBwYWRkaW5nOiAxLjVyZW07XG4gICAgICAgIGdhcDogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLnJpc2stc2xpZGVyIHtcbiAgICAgICAgcGFkZGluZzogMS4yNXJlbTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogNjQwcHgpIHtcbiAgICAgIC5mb3JtLWdyaWQge1xuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgICAgIH1cblxuICAgICAgLmZvcm0tYWN0aW9ucyB7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICB9XG5cbiAgICAgIC52aWV3LWl0ZW0ge1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICAgICAgZ2FwOiAwLjI1cmVtO1xuICAgICAgfVxuXG4gICAgICAudmlldy1pdGVtIC5sYWJlbCB7XG4gICAgICAgIG1pbi13aWR0aDogYXV0bztcbiAgICAgIH1cblxuICAgICAgLnZpZXctaXRlbSAudmFsdWUge1xuICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgfVxuXG4gICAgICAudHJhZGluZy1sYXlvdXQge1xuICAgICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICAgIG1heC1oZWlnaHQ6IG5vbmU7XG4gICAgICAgIGdhcDogMXJlbTtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLmNoYXJ0LWNvbnRhaW5lciB7XG4gICAgICAgIGhlaWdodDogMzAwcHg7XG4gICAgICAgIG1pbi1oZWlnaHQ6IDMwMHB4O1xuICAgICAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xuICAgICAgICBib3JkZXItcmlnaHQ6IG5vbmU7XG4gICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMmEyZDNlO1xuICAgICAgfVxuXG4gICAgICAuZm9ybS1jb250YWluZXIge1xuICAgICAgICBmbGV4OiAxO1xuICAgICAgICBtaW4taGVpZ2h0OiBhdXRvO1xuICAgICAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xuICAgICAgfVxuXG4gICAgICAucmVzaXplciB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICB9XG5cbiAgICAgIC5jb25maWctc2VjdGlvbiB7XG4gICAgICAgIHBhZGRpbmc6IDEuMjVyZW07XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEuMjVyZW07XG4gICAgICB9XG5cbiAgICAgIC5wcm9ncmVzcy1oZWFkZXIge1xuICAgICAgICBwYWRkaW5nOiAxcmVtO1xuICAgICAgfVxuXG4gICAgICAucHJvZ3Jlc3Mtc3RlcHMge1xuICAgICAgICBnYXA6IDAuNXJlbTtcbiAgICAgIH1cblxuICAgICAgLnN0ZXAgc3BhbiB7XG4gICAgICAgIGZvbnQtc2l6ZTogMC43cmVtO1xuICAgICAgfVxuXG4gICAgICAuc3RlcC1pY29uIHtcbiAgICAgICAgd2lkdGg6IDIwcHg7XG4gICAgICAgIGhlaWdodDogMjBweDtcbiAgICAgICAgZm9udC1zaXplOiAwLjYyNXJlbTtcbiAgICAgIH1cblxuICAgICAgLnN0ZXAge1xuICAgICAgICBwYWRkaW5nOiAwLjVyZW0gMC43NXJlbTtcbiAgICAgIH1cblxuICAgICAgLmZvcm0tZ3JpZCB7XG4gICAgICAgIGdhcDogMC43NXJlbTtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLnBhaXJzLWdyaWQge1xuICAgICAgICBnYXA6IDAuNXJlbTtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLnBhaXItaXRlbSB7XG4gICAgICAgIHBhZGRpbmc6IDAuMjVyZW0gMC41cmVtO1xuICAgICAgICBmb250LXNpemU6IDAuNjI1cmVtO1xuICAgICAgfVxuXG4gICAgICAuYmFsYW5jZS1kaXNwbGF5IHtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLmN1cnJlbmN5LWljb24ge1xuICAgICAgICB3aWR0aDogMjhweDtcbiAgICAgICAgaGVpZ2h0OiAyOHB4O1xuICAgICAgfVxuXG4gICAgICAuYW1vdW50IHtcbiAgICAgICAgZm9udC1zaXplOiAxcmVtO1xuICAgICAgfVxuXG4gICAgICAud2FybmluZy1jYXJkIHtcbiAgICAgICAgcGFkZGluZzogMC43NXJlbTtcbiAgICAgICAgbWFyZ2luOiAwLjc1cmVtIDA7XG4gICAgICB9XG5cbiAgICAgIC50ZXJtcy1ncmlkIHtcbiAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gICAgICAgIGdhcDogMC43NXJlbTtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLmZvcm0tYWN0aW9ucyB7XG4gICAgICAgIHBhZGRpbmc6IDEuMjVyZW07XG4gICAgICAgIGdhcDogMC43NXJlbTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cblxuICAgICAgLmZvcm0tYWN0aW9ucyAubGF1bmNoLWJ0biB7XG4gICAgICAgIG9yZGVyOiAtMTtcbiAgICAgIH1cblxuICAgICAgLnJpc2stc2xpZGVyIHtcbiAgICAgICAgcGFkZGluZzogMXJlbTtcbiAgICAgIH1cblxuICAgICAgLmNvbmZpZy1zZWN0aW9uIGgzIHtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBHcmlkIG92ZXJsYXkgc3R5bGVzIHJlbW92ZWQgYXMgcmVxdWVzdGVkICovXG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return BotConfigFormComponent;
})();

/***/ }),

/***/ 875:
/*!*********************************************************************************!*\
  !*** ./src/app/components/trading/bot-config-page/bot-config-page.component.ts ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BotConfigPageComponent: () => (/* binding */ BotConfigPageComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _bot_config_form_bot_config_form_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bot-config-form/bot-config-form.component */ 6587);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _services_grid_bot_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/grid-bot.service */ 8430);










function BotConfigPageComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 4)(1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](2, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("bot.loadingConfiguration"));
  }
}
function BotConfigPageComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 7)(1, "ui-card")(2, "ui-card-header")(3, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "ui-card-content")(6, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "div", 8)(9, "ui-button", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function BotConfigPageComponent_div_3_Template_ui_button_clicked_9_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r2);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r0.goBack());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "ui-button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function BotConfigPageComponent_div_3_Template_ui_button_clicked_11_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r2);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r0.retry());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("bot.errorLoadingBot"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.error);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("button.goBack"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("button.retry"), " ");
  }
}
let BotConfigPageComponent = /*#__PURE__*/(() => {
  class BotConfigPageComponent {
    constructor(route, router, gridBotService) {
      this.route = route;
      this.router = router;
      this.gridBotService = gridBotService;
      this.mode = 'create';
      this.loading = false;
      this.error = null;
      this.pageTitle = 'Create New Bot';
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_3__.TranslationService);
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    ngOnInit() {
      this.route.params.subscribe(params => {
        const botId = params['id'];
        const mode = this.route.snapshot.data['mode'] || 'create';
        this.mode = mode;
        this.updatePageTitle();
        if (botId && (mode === 'edit' || mode === 'view')) {
          this.loadBot(botId);
        }
      });
      // Check for query parameters (strategy data, etc.)
      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['strategy']) {
          try {
            this.strategyData = JSON.parse(queryParams['strategy']);
          } catch (e) {
            console.warn('Invalid strategy data in query params');
          }
        }
      });
    }
    updatePageTitle() {
      switch (this.mode) {
        case 'create':
          this.pageTitle = this.translate('dashboard.createBot');
          break;
        case 'edit':
          this.pageTitle = this.translate('bot.editConfiguration');
          break;
        case 'view':
          this.pageTitle = this.translate('bot.details');
          break;
      }
    }
    loadBot(botId) {
      this.loading = true;
      this.error = null;
      this.gridBotService.getBot(botId).subscribe({
        next: bot => {
          this.botData = bot;
          this.loading = false;
          if (this.mode === 'view' || this.mode === 'edit') {
            this.pageTitle = `${this.mode === 'view' ? this.translate('bot.details') : this.translate('button.edit')} - ${bot.name || bot.symbol}`;
          }
        },
        error: error => {
          this.error = this.translate('bot.errorConfiguration');
          this.loading = false;
          console.error('Failed to load bot:', error);
        }
      });
    }
    onBotSave(botData) {
      this.loading = true;
      this.error = null;
      if (this.mode === 'edit' && botData.id) {
        this.gridBotService.updateBot(botData.id, 'update', botData.config).subscribe({
          next: response => {
            this.loading = false;
            console.log('Bot updated successfully:', response);
            this.router.navigate(['/trading']);
          },
          error: error => {
            this.loading = false;
            this.error = this.translate('bot.failedToUpdate');
            console.error('Failed to update bot:', error);
          }
        });
      } else {
        this.gridBotService.createBot(botData).subscribe({
          next: response => {
            this.loading = false;
            console.log('Bot created successfully:', response);
            this.router.navigate(['/trading']);
          },
          error: error => {
            this.loading = false;
            this.error = this.translate('bot.failedToCreate');
            console.error('Failed to create bot:', error);
          }
        });
      }
    }
    onBotCancel() {
      this.goBack();
    }
    onBotEdit(botData) {
      // Switch to edit mode
      this.mode = 'edit';
      this.updatePageTitle();
    }
    goBack() {
      this.router.navigate(['/trading']);
    }
    retry() {
      const botId = this.route.snapshot.params['id'];
      if (botId) {
        this.loadBot(botId);
      } else {
        this.error = null;
      }
    }
    static {
      this.ɵfac = function BotConfigPageComponent_Factory(t) {
        return new (t || BotConfigPageComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_grid_bot_service__WEBPACK_IMPORTED_MODULE_4__.GridBotService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
        type: BotConfigPageComponent,
        selectors: [["app-bot-config-page"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵStandaloneFeature"]],
        decls: 4,
        vars: 5,
        consts: [[1, "bot-config-page"], [3, "save", "cancel", "edit", "mode", "botData", "strategyData"], ["class", "loading-overlay", 4, "ngIf"], ["class", "error-message", 4, "ngIf"], [1, "loading-overlay"], [1, "loading-spinner"], [1, "spinner"], [1, "error-message"], [1, "error-actions"], ["variant", "ghost", 3, "clicked"], ["variant", "primary", 3, "clicked"]],
        template: function BotConfigPageComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 0)(1, "app-bot-config-form", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("save", function BotConfigPageComponent_Template_app_bot_config_form_save_1_listener($event) {
              return ctx.onBotSave($event);
            })("cancel", function BotConfigPageComponent_Template_app_bot_config_form_cancel_1_listener() {
              return ctx.onBotCancel();
            })("edit", function BotConfigPageComponent_Template_app_bot_config_form_edit_1_listener($event) {
              return ctx.onBotEdit($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](2, BotConfigPageComponent_div_2_Template, 5, 1, "div", 2)(3, BotConfigPageComponent_div_3_Template, 13, 4, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("mode", ctx.mode)("botData", ctx.botData)("strategyData", ctx.strategyData);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.error);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _bot_config_form_bot_config_form_component__WEBPACK_IMPORTED_MODULE_0__.BotConfigFormComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_1__.ButtonComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardContentComponent],
        styles: [".bot-config-page[_ngcontent-%COMP%] {\n  height: 100%;\n}\n\n.page-header[_ngcontent-%COMP%] {\n  background: white;\n  border-bottom: 1px solid #e5e7eb;\n  padding: 2rem 0;\n}\n\n.header-content[_ngcontent-%COMP%] {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 2rem;\n}\n\n.breadcrumb[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  margin-bottom: 0.75rem;\n  font-size: 0.8rem;\n  color: #6b7280;\n}\n\n.back-button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #3b82f6;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  transition: all 0.2s;\n  font-size: 0.875rem;\n}\n.back-button[_ngcontent-%COMP%]:hover {\n  background: #eff6ff;\n  color: #2563eb;\n}\n\n.separator[_ngcontent-%COMP%] {\n  color: #d1d5db;\n}\n\n.current-page[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: #111827;\n}\n\n.page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 2rem;\n  font-weight: 700;\n  color: #111827;\n}\n\n.page-description[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #6b7280;\n  font-size: 1.125rem;\n  line-height: 1.6;\n}\n\n.page-content[_ngcontent-%COMP%] {\n  margin: 0 auto;\n  height: 100%;\n}\n\n.config-container[_ngcontent-%COMP%] {\n  border-radius: 12px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n}\n\n.loading-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(255, 255, 255, 0.8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n}\n\n.loading-spinner[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.loading-spinner[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: #6b7280;\n  font-size: 0.875rem;\n}\n\n.spinner[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border: 3px solid #f3f4f6;\n  border-top: 3px solid #3b82f6;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n  margin: 0 auto 1rem;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.error-message[_ngcontent-%COMP%] {\n  max-width: 600px;\n  margin: 2rem auto;\n  padding: 0 2rem;\n}\n\n.error-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  margin-top: 1rem;\n}\n\n@media (max-width: 768px) {\n  .header-content[_ngcontent-%COMP%] {\n    padding: 0 1rem;\n  }\n  .page-content[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .config-container[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .page-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n    font-size: 1.5rem;\n  }\n  .page-description[_ngcontent-%COMP%] {\n    font-size: 1rem;\n  }\n  .breadcrumb[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n  .error-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL2JvdC1jb25maWctcGFnZS9ib3QtY29uZmlnLXBhZ2UuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBO0VBQ0UsWUFBQTtBQWhCRjs7QUFtQkE7RUFDRSxpQkFmaUI7RUFnQmpCLGdDQUFBO0VBQ0EsZUFBQTtBQWhCRjs7QUFtQkE7RUFDRSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxlQUFBO0FBaEJGOztBQW1CQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FuQ2U7QUFtQmpCOztBQW1CQTtFQUNFLGdCQUFBO0VBQ0EsWUFBQTtFQUNBLGNBNUNjO0VBNkNkLGVBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQXBDYztFQXFDZCxvQkFuQ2dCO0VBb0NoQixtQkFBQTtBQWhCRjtBQWtCRTtFQUNFLG1CQTVDb0I7RUE2Q3BCLGNBcERZO0FBb0NoQjs7QUFvQkE7RUFDRSxjQXREVztBQXFDYjs7QUFvQkE7RUFDRSxnQkFBQTtFQUNBLGNBN0RhO0FBNENmOztBQXFCRTtFQUNFLG9CQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FyRVc7QUFtRGY7O0FBc0JBO0VBQ0UsU0FBQTtFQUNBLGNBMUVlO0VBMkVmLG1CQUFBO0VBQ0EsZ0JBQUE7QUFuQkY7O0FBc0JBO0VBQ0UsY0FBQTtFQUNBLFlBQUE7QUFuQkY7O0FBc0JBO0VBQ0UsbUJBNUVpQjtFQTZFakIsd0NBaEZVO0FBNkRaOztBQXNCQTtFQUNFLGVBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0Esb0NBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLGFBQUE7QUFuQkY7O0FBc0JBO0VBQ0Usa0JBQUE7QUFuQkY7QUFxQkU7RUFDRSxjQTFHYTtFQTJHYixtQkFBQTtBQW5CSjs7QUF1QkE7RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLHlCQUFBO0VBQ0EsNkJBQUE7RUFDQSxrQkFBQTtFQUNBLGtDQUFBO0VBQ0EsbUJBQUE7QUFwQkY7O0FBdUJBO0VBQ0U7SUFDRSx1QkFBQTtFQXBCRjtFQXNCQTtJQUNFLHlCQUFBO0VBcEJGO0FBQ0Y7QUF1QkE7RUFDRSxnQkFBQTtFQUNBLGlCQUFBO0VBQ0EsZUFBQTtBQXJCRjs7QUF3QkE7RUFDRSxhQUFBO0VBQ0EsU0FBQTtFQUNBLGdCQUFBO0FBckJGOztBQXlCQTtFQUNFO0lBQ0UsZUFBQTtFQXRCRjtFQXlCQTtJQUNFLGFBQUE7RUF2QkY7RUEwQkE7SUFDRSxhQUFBO0VBeEJGO0VBNEJFO0lBQ0UsaUJBQUE7RUExQko7RUE4QkE7SUFDRSxlQUFBO0VBNUJGO0VBK0JBO0lBQ0UsZUFBQTtFQTdCRjtFQWdDQTtJQUNFLHNCQUFBO0VBOUJGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTQ1NTIFZhcmlhYmxlc1xuJHByaW1hcnktY29sb3I6ICMzYjgyZjY7XG4kcHJpbWFyeS1ob3ZlcjogIzI1NjNlYjtcbiR0ZXh0LXByaW1hcnk6ICMxMTE4Mjc7XG4kdGV4dC1zZWNvbmRhcnk6ICM2YjcyODA7XG4kdGV4dC1tdXRlZDogI2QxZDVkYjtcbiRib3JkZXItY29sb3I6ICNlNWU3ZWI7XG4kYmFja2dyb3VuZC13aGl0ZTogd2hpdGU7XG4kYmFja2dyb3VuZC1saWdodDogI2YzZjRmNjtcbiRiYWNrZ3JvdW5kLWJsdWUtbGlnaHQ6ICNlZmY2ZmY7XG4kc2hhZG93LXNtOiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuJHNoYWRvdy1vdmVybGF5OiAwIDRweCAyMHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbiRib3JkZXItcmFkaXVzOiA0cHg7XG4kYm9yZGVyLXJhZGl1cy1sZzogMTJweDtcbiR0cmFuc2l0aW9uLWZhc3Q6IGFsbCAwLjJzO1xuJHRyYW5zaXRpb24tbm9ybWFsOiBhbGwgMC4zcztcblxuLmJvdC1jb25maWctcGFnZSB7XG4gIGhlaWdodDogMTAwJTtcbn1cblxuLnBhZ2UtaGVhZGVyIHtcbiAgYmFja2dyb3VuZDogJGJhY2tncm91bmQtd2hpdGU7XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAkYm9yZGVyLWNvbG9yO1xuICBwYWRkaW5nOiAycmVtIDA7XG59XG5cbi5oZWFkZXItY29udGVudCB7XG4gIG1heC13aWR0aDogMTIwMHB4O1xuICBtYXJnaW46IDAgYXV0bztcbiAgcGFkZGluZzogMCAycmVtO1xufVxuXG4uYnJlYWRjcnVtYiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMC4zNzVyZW07XG4gIG1hcmdpbi1ib3R0b206IDAuNzVyZW07XG4gIGZvbnQtc2l6ZTogMC44cmVtO1xuICBjb2xvcjogJHRleHQtc2Vjb25kYXJ5O1xufVxuXG4uYmFjay1idXR0b24ge1xuICBiYWNrZ3JvdW5kOiBub25lO1xuICBib3JkZXI6IG5vbmU7XG4gIGNvbG9yOiAkcHJpbWFyeS1jb2xvcjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBwYWRkaW5nOiAwLjI1cmVtIDAuNXJlbTtcbiAgYm9yZGVyLXJhZGl1czogJGJvcmRlci1yYWRpdXM7XG4gIHRyYW5zaXRpb246ICR0cmFuc2l0aW9uLWZhc3Q7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG5cbiAgJjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogJGJhY2tncm91bmQtYmx1ZS1saWdodDtcbiAgICBjb2xvcjogJHByaW1hcnktaG92ZXI7XG4gIH1cbn1cblxuLnNlcGFyYXRvciB7XG4gIGNvbG9yOiAkdGV4dC1tdXRlZDtcbn1cblxuLmN1cnJlbnQtcGFnZSB7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGNvbG9yOiAkdGV4dC1wcmltYXJ5O1xufVxuXG4ucGFnZS1oZWFkZXIge1xuICBoMSB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgZm9udC1zaXplOiAycmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6ICR0ZXh0LXByaW1hcnk7XG4gIH1cbn1cblxuLnBhZ2UtZGVzY3JpcHRpb24ge1xuICBtYXJnaW46IDA7XG4gIGNvbG9yOiAkdGV4dC1zZWNvbmRhcnk7XG4gIGZvbnQtc2l6ZTogMS4xMjVyZW07XG4gIGxpbmUtaGVpZ2h0OiAxLjY7XG59XG5cbi5wYWdlLWNvbnRlbnQge1xuICBtYXJnaW46IDAgYXV0bztcbiAgaGVpZ2h0OiAxMDAlO1xufVxuXG4uY29uZmlnLWNvbnRhaW5lciB7XG4gIGJvcmRlci1yYWRpdXM6ICRib3JkZXItcmFkaXVzLWxnO1xuICBib3gtc2hhZG93OiAkc2hhZG93LXNtO1xufVxuXG4ubG9hZGluZy1vdmVybGF5IHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHotaW5kZXg6IDEwMDA7XG59XG5cbi5sb2FkaW5nLXNwaW5uZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG5cbiAgcCB7XG4gICAgY29sb3I6ICR0ZXh0LXNlY29uZGFyeTtcbiAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICB9XG59XG5cbi5zcGlubmVyIHtcbiAgd2lkdGg6IDQwcHg7XG4gIGhlaWdodDogNDBweDtcbiAgYm9yZGVyOiAzcHggc29saWQgJGJhY2tncm91bmQtbGlnaHQ7XG4gIGJvcmRlci10b3A6IDNweCBzb2xpZCAkcHJpbWFyeS1jb2xvcjtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlO1xuICBtYXJnaW46IDAgYXV0byAxcmVtO1xufVxuXG5Aa2V5ZnJhbWVzIHNwaW4ge1xuICAwJSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gIH1cbiAgMTAwJSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgfVxufVxuXG4uZXJyb3ItbWVzc2FnZSB7XG4gIG1heC13aWR0aDogNjAwcHg7XG4gIG1hcmdpbjogMnJlbSBhdXRvO1xuICBwYWRkaW5nOiAwIDJyZW07XG59XG5cbi5lcnJvci1hY3Rpb25zIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiAxcmVtO1xuICBtYXJnaW4tdG9wOiAxcmVtO1xufVxuXG4vLyBSZXNwb25zaXZlIERlc2lnblxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gIC5oZWFkZXItY29udGVudCB7XG4gICAgcGFkZGluZzogMCAxcmVtO1xuICB9XG5cbiAgLnBhZ2UtY29udGVudCB7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgfVxuXG4gIC5jb25maWctY29udGFpbmVyIHtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICB9XG5cbiAgLnBhZ2UtaGVhZGVyIHtcbiAgICBoMSB7XG4gICAgICBmb250LXNpemU6IDEuNXJlbTtcbiAgICB9XG4gIH1cblxuICAucGFnZS1kZXNjcmlwdGlvbiB7XG4gICAgZm9udC1zaXplOiAxcmVtO1xuICB9XG5cbiAgLmJyZWFkY3J1bWIge1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgfVxuXG4gIC5lcnJvci1hY3Rpb25zIHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return BotConfigPageComponent;
})();

/***/ }),

/***/ 8620:
/*!********************************************************!*\
  !*** ./src/app/components/ui/input/input.component.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InputComponent: () => (/* binding */ InputComponent),
/* harmony export */   TextareaComponent: () => (/* binding */ TextareaComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ 4456);





function InputComponent_label_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "label", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.label);
  }
}
function InputComponent_span_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "span");
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"]("input-icon input-icon-left " + ctx_r0.icon);
  }
}
function InputComponent_span_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "span");
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"]("input-icon input-icon-right " + ctx_r0.icon);
  }
}
function InputComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.error);
  }
}
function TextareaComponent_label_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "label", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.label);
  }
}
function TextareaComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](ctx_r0.error);
  }
}
const _c0 = "\n\n.input-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.input-wrapper-full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n\n\n.input-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n  color: #374151;\n  margin-bottom: 4px;\n}\n\n\n\n.input-container[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n\n\n.input[_ngcontent-%COMP%] {\n  border: 1px solid #d1d5db;\n  border-radius: 6px;\n  color: #111827;\n  transition: all 0.2s ease-in-out;\n  outline: none;\n  font-family: inherit;\n}\n\n.input[_ngcontent-%COMP%]:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);\n}\n\n.input[_ngcontent-%COMP%]:disabled {\n  background: #f9fafb;\n  color: #9ca3af;\n  cursor: not-allowed;\n}\n\n.input[_ngcontent-%COMP%]::placeholder {\n  color: #9ca3af;\n}\n\n\n\n.input-small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  font-size: 14px;\n  min-height: 32px;\n}\n\n.input-medium[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  font-size: 16px;\n  min-height: 40px;\n}\n\n.input-large[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  font-size: 18px;\n  min-height: 48px;\n}\n\n\n\n.input-full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n\n\n.input-error[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n}\n\n.input-error[_ngcontent-%COMP%]:focus {\n  border-color: #ef4444;\n  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);\n}\n\n.input-error-text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #ef4444;\n  margin-top: 4px;\n}\n\n\n\n.input-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #6b7280;\n  font-size: 16px;\n  z-index: 1;\n}\n\n.input-icon-left[_ngcontent-%COMP%] {\n  left: 12px;\n}\n\n.input-icon-right[_ngcontent-%COMP%] {\n  right: 12px;\n}\n\n.input-with-icon-left[_ngcontent-%COMP%] {\n  padding-left: 40px;\n}\n\n.input-with-icon-right[_ngcontent-%COMP%] {\n  padding-right: 40px;\n}\n\n\n\n.textarea-container[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n}\n\n.textarea[_ngcontent-%COMP%] {\n  border: 1px solid #d1d5db;\n  border-radius: 6px;\n  background: white;\n  color: #111827;\n  transition: all 0.2s ease-in-out;\n  outline: none;\n  font-family: inherit;\n  padding: 8px 12px;\n  font-size: 16px;\n  resize: vertical;\n  min-height: 80px;\n}\n\n.textarea[_ngcontent-%COMP%]:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);\n}\n\n.textarea[_ngcontent-%COMP%]:disabled {\n  background: #f9fafb;\n  color: #9ca3af;\n  cursor: not-allowed;\n}\n\n.textarea[_ngcontent-%COMP%]::placeholder {\n  color: #9ca3af;\n}\n\n.textarea-full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.textarea-error[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n}\n\n.textarea-error[_ngcontent-%COMP%]:focus {\n  border-color: #ef4444;\n  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);\n}\n\n\n\n.icon-search[_ngcontent-%COMP%]::before { content: '\uD83D\uDD0D'; }\n.icon-email[_ngcontent-%COMP%]::before { content: '\uD83D\uDCE7'; }\n.icon-lock[_ngcontent-%COMP%]::before { content: '\uD83D\uDD12'; }\n.icon-user[_ngcontent-%COMP%]::before { content: '\uD83D\uDC64'; }\n.icon-phone[_ngcontent-%COMP%]::before { content: '\uD83D\uDCDE'; }\n.icon-calendar[_ngcontent-%COMP%]::before { content: '\uD83D\uDCC5'; }\n.icon-dollar[_ngcontent-%COMP%]::before { content: '$'; }\n.icon-percent[_ngcontent-%COMP%]::before { content: '%'; }\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9pbnB1dC9pbnB1dC5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGtCQUFrQjtBQUNsQjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsUUFBUTtBQUNWOztBQUVBO0VBQ0UsV0FBVztBQUNiOztBQUVBLFVBQVU7QUFDVjtFQUNFLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsY0FBYztFQUNkLGtCQUFrQjtBQUNwQjs7QUFFQSxvQkFBb0I7QUFDcEI7RUFDRSxrQkFBa0I7RUFDbEIsYUFBYTtFQUNiLG1CQUFtQjtBQUNyQjs7QUFFQSxzQkFBc0I7QUFDdEI7RUFDRSx5QkFBeUI7RUFDekIsa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZCxnQ0FBZ0M7RUFDaEMsYUFBYTtFQUNiLG9CQUFvQjtBQUN0Qjs7QUFFQTtFQUNFLHFCQUFxQjtFQUNyQiw4Q0FBOEM7QUFDaEQ7O0FBRUE7RUFDRSxtQkFBbUI7RUFDbkIsY0FBYztFQUNkLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGNBQWM7QUFDaEI7O0FBRUEsa0JBQWtCO0FBQ2xCO0VBQ0UsaUJBQWlCO0VBQ2pCLGVBQWU7RUFDZixnQkFBZ0I7QUFDbEI7O0FBRUE7RUFDRSxpQkFBaUI7RUFDakIsZUFBZTtFQUNmLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixlQUFlO0VBQ2YsZ0JBQWdCO0FBQ2xCOztBQUVBLGVBQWU7QUFDZjtFQUNFLFdBQVc7QUFDYjs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxxQkFBcUI7QUFDdkI7O0FBRUE7RUFDRSxxQkFBcUI7RUFDckIsNENBQTRDO0FBQzlDOztBQUVBO0VBQ0UsZUFBZTtFQUNmLGNBQWM7RUFDZCxlQUFlO0FBQ2pCOztBQUVBLGdCQUFnQjtBQUNoQjtFQUNFLGtCQUFrQjtFQUNsQixhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLHVCQUF1QjtFQUN2QixjQUFjO0VBQ2QsZUFBZTtFQUNmLFVBQVU7QUFDWjs7QUFFQTtFQUNFLFVBQVU7QUFDWjs7QUFFQTtFQUNFLFdBQVc7QUFDYjs7QUFFQTtFQUNFLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQSxvQkFBb0I7QUFDcEI7RUFDRSxrQkFBa0I7RUFDbEIsYUFBYTtBQUNmOztBQUVBO0VBQ0UseUJBQXlCO0VBQ3pCLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsY0FBYztFQUNkLGdDQUFnQztFQUNoQyxhQUFhO0VBQ2Isb0JBQW9CO0VBQ3BCLGlCQUFpQjtFQUNqQixlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLHFCQUFxQjtFQUNyQiw4Q0FBOEM7QUFDaEQ7O0FBRUE7RUFDRSxtQkFBbUI7RUFDbkIsY0FBYztFQUNkLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGNBQWM7QUFDaEI7O0FBRUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxxQkFBcUI7QUFDdkI7O0FBRUE7RUFDRSxxQkFBcUI7RUFDckIsNENBQTRDO0FBQzlDOztBQUVBLGtDQUFrQztBQUNsQyx1QkFBdUIsYUFBYSxFQUFFO0FBQ3RDLHNCQUFzQixhQUFhLEVBQUU7QUFDckMscUJBQXFCLGFBQWEsRUFBRTtBQUNwQyxxQkFBcUIsYUFBYSxFQUFFO0FBQ3BDLHNCQUFzQixhQUFhLEVBQUU7QUFDckMseUJBQXlCLGFBQWEsRUFBRTtBQUN4Qyx1QkFBdUIsWUFBWSxFQUFFO0FBQ3JDLHdCQUF3QixZQUFZLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBJbnB1dCB3cmFwcGVyICovXG4uaW5wdXQtd3JhcHBlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogNnB4O1xufVxuXG4uaW5wdXQtd3JhcHBlci1mdWxsLXdpZHRoIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbi8qIExhYmVsICovXG4uaW5wdXQtbGFiZWwge1xuICBmb250LXNpemU6IDE0cHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGNvbG9yOiAjMzc0MTUxO1xuICBtYXJnaW4tYm90dG9tOiA0cHg7XG59XG5cbi8qIElucHV0IGNvbnRhaW5lciAqL1xuLmlucHV0LWNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLyogQmFzZSBpbnB1dCBzdHlsZXMgKi9cbi5pbnB1dCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkICNkMWQ1ZGI7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgY29sb3I6ICMxMTE4Mjc7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2UtaW4tb3V0O1xuICBvdXRsaW5lOiBub25lO1xuICBmb250LWZhbWlseTogaW5oZXJpdDtcbn1cblxuLmlucHV0OmZvY3VzIHtcbiAgYm9yZGVyLWNvbG9yOiAjNjY3ZWVhO1xuICBib3gtc2hhZG93OiAwIDAgMCAzcHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjEpO1xufVxuXG4uaW5wdXQ6ZGlzYWJsZWQge1xuICBiYWNrZ3JvdW5kOiAjZjlmYWZiO1xuICBjb2xvcjogIzljYTNhZjtcbiAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbn1cblxuLmlucHV0OjpwbGFjZWhvbGRlciB7XG4gIGNvbG9yOiAjOWNhM2FmO1xufVxuXG4vKiBTaXplIHZhcmlhbnRzICovXG4uaW5wdXQtc21hbGwge1xuICBwYWRkaW5nOiA2cHggMTJweDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBtaW4taGVpZ2h0OiAzMnB4O1xufVxuXG4uaW5wdXQtbWVkaXVtIHtcbiAgcGFkZGluZzogOHB4IDEycHg7XG4gIGZvbnQtc2l6ZTogMTZweDtcbiAgbWluLWhlaWdodDogNDBweDtcbn1cblxuLmlucHV0LWxhcmdlIHtcbiAgcGFkZGluZzogMTJweCAxNnB4O1xuICBmb250LXNpemU6IDE4cHg7XG4gIG1pbi1oZWlnaHQ6IDQ4cHg7XG59XG5cbi8qIEZ1bGwgd2lkdGggKi9cbi5pbnB1dC1mdWxsLXdpZHRoIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbi8qIEVycm9yIHN0YXRlICovXG4uaW5wdXQtZXJyb3Ige1xuICBib3JkZXItY29sb3I6ICNlZjQ0NDQ7XG59XG5cbi5pbnB1dC1lcnJvcjpmb2N1cyB7XG4gIGJvcmRlci1jb2xvcjogI2VmNDQ0NDtcbiAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoMjM5LCA2OCwgNjgsIDAuMSk7XG59XG5cbi5pbnB1dC1lcnJvci10ZXh0IHtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogI2VmNDQ0NDtcbiAgbWFyZ2luLXRvcDogNHB4O1xufVxuXG4vKiBJY29uIHN0eWxlcyAqL1xuLmlucHV0LWljb24ge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBjb2xvcjogIzZiNzI4MDtcbiAgZm9udC1zaXplOiAxNnB4O1xuICB6LWluZGV4OiAxO1xufVxuXG4uaW5wdXQtaWNvbi1sZWZ0IHtcbiAgbGVmdDogMTJweDtcbn1cblxuLmlucHV0LWljb24tcmlnaHQge1xuICByaWdodDogMTJweDtcbn1cblxuLmlucHV0LXdpdGgtaWNvbi1sZWZ0IHtcbiAgcGFkZGluZy1sZWZ0OiA0MHB4O1xufVxuXG4uaW5wdXQtd2l0aC1pY29uLXJpZ2h0IHtcbiAgcGFkZGluZy1yaWdodDogNDBweDtcbn1cblxuLyogVGV4dGFyZWEgc3R5bGVzICovXG4udGV4dGFyZWEtY29udGFpbmVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xufVxuXG4udGV4dGFyZWEge1xuICBib3JkZXI6IDFweCBzb2xpZCAjZDFkNWRiO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xuICBjb2xvcjogIzExMTgyNztcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1pbi1vdXQ7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0O1xuICBwYWRkaW5nOiA4cHggMTJweDtcbiAgZm9udC1zaXplOiAxNnB4O1xuICByZXNpemU6IHZlcnRpY2FsO1xuICBtaW4taGVpZ2h0OiA4MHB4O1xufVxuXG4udGV4dGFyZWE6Zm9jdXMge1xuICBib3JkZXItY29sb3I6ICM2NjdlZWE7XG4gIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMSk7XG59XG5cbi50ZXh0YXJlYTpkaXNhYmxlZCB7XG4gIGJhY2tncm91bmQ6ICNmOWZhZmI7XG4gIGNvbG9yOiAjOWNhM2FmO1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xufVxuXG4udGV4dGFyZWE6OnBsYWNlaG9sZGVyIHtcbiAgY29sb3I6ICM5Y2EzYWY7XG59XG5cbi50ZXh0YXJlYS1mdWxsLXdpZHRoIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbi50ZXh0YXJlYS1lcnJvciB7XG4gIGJvcmRlci1jb2xvcjogI2VmNDQ0NDtcbn1cblxuLnRleHRhcmVhLWVycm9yOmZvY3VzIHtcbiAgYm9yZGVyLWNvbG9yOiAjZWY0NDQ0O1xuICBib3gtc2hhZG93OiAwIDAgMCAzcHggcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbn1cblxuLyogSWNvbiBjbGFzc2VzIGZvciBjb21tb24gaWNvbnMgKi9cbi5pY29uLXNlYXJjaDo6YmVmb3JlIHsgY29udGVudDogJ8Owwp/ClMKNJzsgfVxuLmljb24tZW1haWw6OmJlZm9yZSB7IGNvbnRlbnQ6ICfDsMKfwpPCpyc7IH1cbi5pY29uLWxvY2s6OmJlZm9yZSB7IGNvbnRlbnQ6ICfDsMKfwpTCkic7IH1cbi5pY29uLXVzZXI6OmJlZm9yZSB7IGNvbnRlbnQ6ICfDsMKfwpHCpCc7IH1cbi5pY29uLXBob25lOjpiZWZvcmUgeyBjb250ZW50OiAnw7DCn8KTwp4nOyB9XG4uaWNvbi1jYWxlbmRhcjo6YmVmb3JlIHsgY29udGVudDogJ8Owwp/Ck8KFJzsgfVxuLmljb24tZG9sbGFyOjpiZWZvcmUgeyBjb250ZW50OiAnJCc7IH1cbi5pY29uLXBlcmNlbnQ6OmJlZm9yZSB7IGNvbnRlbnQ6ICclJzsgfVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */";
let InputComponent = /*#__PURE__*/(() => {
  class InputComponent {
    constructor() {
      this.type = 'text';
      this.placeholder = '';
      this.label = '';
      this.error = '';
      this.disabled = false;
      this.size = 'medium';
      this.fullWidth = false;
      this.iconPosition = 'left';
      this.value = '';
      this.touched = false;
      this.onChange = value => {};
      this.onTouched = () => {};
    }
    writeValue(value) {
      this.value = value;
    }
    registerOnChange(fn) {
      this.onChange = fn;
    }
    registerOnTouched(fn) {
      this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
      this.disabled = isDisabled;
    }
    onInput(event) {
      const target = event.target;
      this.value = target.value;
      this.onChange(this.value);
    }
    onBlur() {
      this.touched = true;
      this.onTouched();
    }
    getInputClasses() {
      const classes = ['input'];
      classes.push(`input-${this.size}`);
      if (this.error) {
        classes.push('input-error');
      }
      if (this.fullWidth) {
        classes.push('input-full-width');
      }
      if (this.icon) {
        classes.push(`input-with-icon-${this.iconPosition}`);
      }
      return classes.join(' ');
    }
    getWrapperClasses() {
      const classes = ['input-wrapper'];
      if (this.fullWidth) {
        classes.push('input-wrapper-full-width');
      }
      return classes.join(' ');
    }
    static {
      this.ɵfac = function InputComponent_Factory(t) {
        return new (t || InputComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
        type: InputComponent,
        selectors: [["ui-input"]],
        inputs: {
          type: "type",
          placeholder: "placeholder",
          label: "label",
          error: "error",
          disabled: "disabled",
          size: "size",
          fullWidth: "fullWidth",
          icon: "icon",
          iconPosition: "iconPosition",
          min: "min",
          max: "max",
          step: "step"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵProvidersFeature"]([{
          provide: _angular_forms__WEBPACK_IMPORTED_MODULE_1__.NG_VALUE_ACCESSOR,
          useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(() => InputComponent),
          multi: true
        }]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵStandaloneFeature"]],
        decls: 7,
        vars: 15,
        consts: [["class", "input-label", 4, "ngIf"], [1, "input-container"], [3, "class", 4, "ngIf"], [3, "input", "blur", "type", "placeholder", "disabled", "value", "min", "max", "step"], ["class", "input-error-text", 4, "ngIf"], [1, "input-label"], [1, "input-error-text"]],
        template: function InputComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, InputComponent_label_1_Template, 2, 1, "label", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](3, InputComponent_span_3_Template, 1, 2, "span", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "input", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("input", function InputComponent_Template_input_input_4_listener($event) {
              return ctx.onInput($event);
            })("blur", function InputComponent_Template_input_blur_4_listener() {
              return ctx.onBlur();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, InputComponent_span_5_Template, 1, 2, "span", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, InputComponent_div_6_Template, 2, 1, "div", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx.getWrapperClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.label);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.icon && ctx.iconPosition === "left");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx.getInputClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("type", ctx.type)("placeholder", ctx.placeholder)("disabled", ctx.disabled)("value", ctx.value)("min", ctx.min)("max", ctx.max)("step", ctx.step);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.icon && ctx.iconPosition === "right");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.error);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf],
        styles: [_c0]
      });
    }
  }
  return InputComponent;
})();
let TextareaComponent = /*#__PURE__*/(() => {
  class TextareaComponent {
    constructor() {
      this.placeholder = '';
      this.label = '';
      this.error = '';
      this.disabled = false;
      this.rows = 4;
      this.fullWidth = false;
      this.value = '';
      this.touched = false;
      this.onChange = value => {};
      this.onTouched = () => {};
    }
    writeValue(value) {
      this.value = value;
    }
    registerOnChange(fn) {
      this.onChange = fn;
    }
    registerOnTouched(fn) {
      this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
      this.disabled = isDisabled;
    }
    onInput(event) {
      const target = event.target;
      this.value = target.value;
      this.onChange(this.value);
    }
    onBlur() {
      this.touched = true;
      this.onTouched();
    }
    getTextareaClasses() {
      const classes = ['textarea'];
      if (this.error) {
        classes.push('textarea-error');
      }
      if (this.fullWidth) {
        classes.push('textarea-full-width');
      }
      return classes.join(' ');
    }
    getWrapperClasses() {
      const classes = ['input-wrapper'];
      if (this.fullWidth) {
        classes.push('input-wrapper-full-width');
      }
      return classes.join(' ');
    }
    static {
      this.ɵfac = function TextareaComponent_Factory(t) {
        return new (t || TextareaComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
        type: TextareaComponent,
        selectors: [["ui-textarea"]],
        inputs: {
          placeholder: "placeholder",
          label: "label",
          error: "error",
          disabled: "disabled",
          rows: "rows",
          fullWidth: "fullWidth"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵProvidersFeature"]([{
          provide: _angular_forms__WEBPACK_IMPORTED_MODULE_1__.NG_VALUE_ACCESSOR,
          useExisting: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(() => TextareaComponent),
          multi: true
        }]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵStandaloneFeature"]],
        decls: 6,
        vars: 10,
        consts: [["class", "input-label", 4, "ngIf"], [1, "textarea-container"], [3, "input", "blur", "placeholder", "disabled", "rows", "value"], ["class", "input-error-text", 4, "ngIf"], [1, "input-label"], [1, "input-error-text"]],
        template: function TextareaComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, TextareaComponent_label_1_Template, 2, 1, "label", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 1)(3, "textarea", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("input", function TextareaComponent_Template_textarea_input_3_listener($event) {
              return ctx.onInput($event);
            })("blur", function TextareaComponent_Template_textarea_blur_3_listener() {
              return ctx.onBlur();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "        ");
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, TextareaComponent_div_5_Template, 2, 1, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx.getWrapperClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.label);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx.getTextareaClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("placeholder", ctx.placeholder)("disabled", ctx.disabled)("rows", ctx.rows)("value", ctx.value);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.error);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf],
        styles: [_c0]
      });
    }
  }
  return TextareaComponent;
})();

/***/ }),

/***/ 6042:
/*!**************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/ReplaySubject.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReplaySubject: () => (/* binding */ ReplaySubject)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Subject */ 819);
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduler/dateTimestampProvider */ 5152);


class ReplaySubject extends _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject {
  constructor(_bufferSize = Infinity, _windowTime = Infinity, _timestampProvider = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__.dateTimestampProvider) {
    super();
    this._bufferSize = _bufferSize;
    this._windowTime = _windowTime;
    this._timestampProvider = _timestampProvider;
    this._buffer = [];
    this._infiniteTimeWindow = true;
    this._infiniteTimeWindow = _windowTime === Infinity;
    this._bufferSize = Math.max(1, _bufferSize);
    this._windowTime = Math.max(1, _windowTime);
  }
  next(value) {
    const {
      isStopped,
      _buffer,
      _infiniteTimeWindow,
      _timestampProvider,
      _windowTime
    } = this;
    if (!isStopped) {
      _buffer.push(value);
      !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
    }
    this._trimBuffer();
    super.next(value);
  }
  _subscribe(subscriber) {
    this._throwIfClosed();
    this._trimBuffer();
    const subscription = this._innerSubscribe(subscriber);
    const {
      _infiniteTimeWindow,
      _buffer
    } = this;
    const copy = _buffer.slice();
    for (let i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
      subscriber.next(copy[i]);
    }
    this._checkFinalizedStatuses(subscriber);
    return subscription;
  }
  _trimBuffer() {
    const {
      _bufferSize,
      _timestampProvider,
      _buffer,
      _infiniteTimeWindow
    } = this;
    const adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
    _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
    if (!_infiniteTimeWindow) {
      const now = _timestampProvider.now();
      let last = 0;
      for (let i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
        last = i;
      }
      last && _buffer.splice(0, last + 1);
    }
  }
}

/***/ }),

/***/ 5152:
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/dateTimestampProvider.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dateTimestampProvider: () => (/* binding */ dateTimestampProvider)
/* harmony export */ });
const dateTimestampProvider = {
  now() {
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: undefined
};

/***/ })

}]);
//# sourceMappingURL=416.js.map