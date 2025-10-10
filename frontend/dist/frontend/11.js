"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[11],{

/***/ 9011:
/*!*********************************************************************************!*\
  !*** ./src/app/components/trading/funding-revenue/funding-revenue.component.ts ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FundingRevenueComponent: () => (/* binding */ FundingRevenueComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _services_funding_arbitrage_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../services/funding-arbitrage.service */ 4441);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);









const _forTrack0 = ($index, $item) => $item.symbol;
const _forTrack1 = ($index, $item) => $item.exchange;
const _forTrack2 = ($index, $item) => $item.id;
function FundingRevenueComponent_Conditional_11_For_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const exchange_r3 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", exchange_r3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](exchange_r3);
  }
}
function FundingRevenueComponent_Conditional_11_For_26_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const symbol_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", symbol_r4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](symbol_r4);
  }
}
function FundingRevenueComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 6)(1, "ui-card-content")(2, "div", 9)(3, "div", 10)(4, "label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5, "Start Date");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayListener"]("ngModelChange", function FundingRevenueComponent_Conditional_11_Template_input_ngModelChange_6_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayBindingSet"](ctx_r1.startDate, $event) || (ctx_r1.startDate = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "div", 10)(8, "label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9, "End Date");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "input", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayListener"]("ngModelChange", function FundingRevenueComponent_Conditional_11_Template_input_ngModelChange_10_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayBindingSet"](ctx_r1.endDate, $event) || (ctx_r1.endDate = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 10)(12, "label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13, "Exchange");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "select", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayListener"]("ngModelChange", function FundingRevenueComponent_Conditional_11_Template_select_ngModelChange_14_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayBindingSet"](ctx_r1.selectedExchange, $event) || (ctx_r1.selectedExchange = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16, "All Exchanges");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](17, FundingRevenueComponent_Conditional_11_For_18_Template, 2, 2, "option", 15, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterTrackByIdentity"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "div", 10)(20, "label", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](21, "Symbol");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](22, "select", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayListener"]("ngModelChange", function FundingRevenueComponent_Conditional_11_Template_select_ngModelChange_22_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayBindingSet"](ctx_r1.selectedSymbol, $event) || (ctx_r1.selectedSymbol = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](23, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](24, "All Symbols");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](25, FundingRevenueComponent_Conditional_11_For_26_Template, 2, 2, "option", 15, _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterTrackByIdentity"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](27, "div", 16)(28, "ui-button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("clicked", function FundingRevenueComponent_Conditional_11_Template_ui_button_clicked_28_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r1.applyFilters());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](29, " Apply Filters ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](30, "ui-button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("clicked", function FundingRevenueComponent_Conditional_11_Template_ui_button_clicked_30_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r1.clearFilters());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](31, " Clear ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.startDate);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.endDate);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.selectedExchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r1.availableExchanges());
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.selectedSymbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r1.availableSymbols());
  }
}
function FundingRevenueComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 7)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Loading revenue data...");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
}
function FundingRevenueComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 8)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "ui-button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("clicked", function FundingRevenueComponent_Conditional_13_Template_ui_button_clicked_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r5);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r1.refreshRevenue());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, " Retry ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.error());
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_67_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 31)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "Best Deal \uD83C\uDFC6");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 33)(6, "div", 34)(7, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8, "Symbol:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "span", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 34)(12, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13, "Revenue:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "span", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "div", 34)(17, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18, "Date:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "span", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.summary().bestDeal.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(ctx_r1.summary().bestDeal.revenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatDate(ctx_r1.summary().bestDeal.date));
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_67_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 32)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "Worst Deal \uD83D\uDCC9");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 33)(6, "div", 34)(7, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8, "Symbol:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "span", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "div", 34)(12, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13, "Revenue:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "span", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](16, "div", 34)(17, "span", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18, "Date:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "span", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.summary().worstDeal.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(ctx_r1.summary().worstDeal.revenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatDate(ctx_r1.summary().worstDeal.date));
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_67_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](1, FundingRevenueComponent_Conditional_14_Conditional_67_Conditional_1_Template, 21, 3, "ui-card", 31)(2, FundingRevenueComponent_Conditional_14_Conditional_67_Conditional_2_Template, 21, 3, "ui-card", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.summary().bestDeal ? 1 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.summary().worstDeal ? 2 : -1);
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_68_For_21_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "tr")(1, "td", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "td", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const item_r6 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](item_r6.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](item_r6.deals);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(item_r6.revenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(item_r6.revenue), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(item_r6.avgRevenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(item_r6.avgRevenue), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(item_r6.fundingEarned), " ");
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_68_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 28)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "Revenue by Symbol");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 39)(6, "table", 40)(7, "thead")(8, "tr")(9, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10, "Symbol");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](12, "Deals");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](13, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](14, "Total Revenue");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16, "Avg Revenue");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18, "Funding Earned");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](20, FundingRevenueComponent_Conditional_14_Conditional_68_For_21_Template, 11, 9, "tr", null, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r1.bySymbol());
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_69_For_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "tr")(1, "td", 44)(2, "span", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "td", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const item_r7 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"]("badge-" + item_r7.exchange.toLowerCase());
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", item_r7.exchange, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](item_r7.deals);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(item_r7.revenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(item_r7.revenue), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(item_r7.avgRevenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(item_r7.avgRevenue), " ");
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_69_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 28)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "Revenue by Exchange");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 39)(6, "table", 40)(7, "thead")(8, "tr")(9, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10, "Exchange");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](11, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](12, "Deals");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](13, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](14, "Total Revenue");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "th", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16, "Avg Revenue");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](18, FundingRevenueComponent_Conditional_14_Conditional_69_For_19_Template, 10, 10, "tr", null, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r1.byExchange());
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 59)(1, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Exit Price:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const deal_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.primaryExitPrice));
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 59)(1, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Hedge Exit:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const deal_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.hedgeExitPrice));
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 59)(1, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Duration:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const deal_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatDuration(deal_r9.duration));
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 57)(1, "div", 58)(2, "div", 59)(3, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Quantity:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "div", 59)(8, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9, "Funding Rate:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "div", 59)(13, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](14, "Entry Price:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](15, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "div", 59)(18, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](19, "Hedge Entry:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](20, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](22, FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_22_Template, 5, 1, "div", 59)(23, FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_23_Template, 5, 1, "div", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](24, "div", 62)(25, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](26, "Funding Earned:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](27, "span", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](29, "div", 62)(30, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](31, "Realized P&L:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](32, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](34, "div", 59)(35, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](36, "Primary Fees:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](37, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](39, "div", 59)(40, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](41, "Hedge Fees:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](42, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](43);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](44, "div", 59)(45, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](46, "Executed At:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](47, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](48);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](49, "div", 59)(50, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](51, "Closed At:");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](52, "span", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](54, FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Conditional_54_Template, 5, 1, "div", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const deal_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatNumber(deal_r9.quantity, 6));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatPercent(deal_r9.fundingRate * 100));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.entryPrice));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.hedgeEntryPrice));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](deal_r9.primaryExitPrice !== null ? 22 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](deal_r9.hedgeExitPrice !== null ? 23 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.fundingEarned));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(deal_r9.realizedPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(deal_r9.realizedPnl), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.primaryTradingFees));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(deal_r9.hedgeTradingFees));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatDate(deal_r9.executedAt));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r1.formatDate(deal_r9.closedAt));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](deal_r9.duration !== null ? 54 : -1);
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 48)(1, "div", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Template_div_click_1_listener() {
      const deal_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r8).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r1.toggleDealExpansion(deal_r9.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](2, "div", 50)(3, "span", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "span", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "span", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "div", 54)(10, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "span", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](14, FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Conditional_14_Template, 55, 15, "div", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const deal_r9 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("expanded", ctx_r1.isDealExpanded(deal_r9.id));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](deal_r9.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"](" ", deal_r9.primaryExchange, " \u2194 ", deal_r9.hedgeExchange, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](deal_r9.positionType);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", deal_r9.positionType.toUpperCase(), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(deal_r9.realizedPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(deal_r9.realizedPnl), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.isDealExpanded(deal_r9.id) ? "\u25B2" : "\u25BC", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.isDealExpanded(deal_r9.id) ? 14 : -1);
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_70_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "ui-card", 29)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](6, FundingRevenueComponent_Conditional_14_Conditional_70_For_7_Template, 15, 13, "div", 47, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("Completed Deals (", ctx_r1.deals().length, ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r1.deals());
  }
}
function FundingRevenueComponent_Conditional_14_Conditional_71_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 30)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "No completed deals found for the selected filters.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "p", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Try adjusting your date range or clearing filters.");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
}
function FundingRevenueComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 18)(1, "ui-card", 19)(2, "ui-card-content")(3, "div", 20)(4, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5, "\uD83D\uDCB0");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](7, "Total Revenue");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "ui-card", 25)(13, "ui-card-content")(14, "div", 20)(15, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16, "\uD83D\uDCCA");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18, "Total Deals");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](21, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](23, "ui-card", 25)(24, "ui-card-content")(25, "div", 20)(26, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](27, "\uD83C\uDFAF");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](28, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](29, "Win Rate");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](30, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](31);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](32, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](34, "ui-card", 25)(35, "ui-card-content")(36, "div", 20)(37, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](38, "\uD83D\uDCB5");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](39, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](40, "Funding Earned");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](41, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](42);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](43, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](44, " From funding payments ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](45, "ui-card", 25)(46, "ui-card-content")(47, "div", 20)(48, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](49, "\uD83D\uDCC8");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](50, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](51, "Trading P&L");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](52, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](54, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](55, " Price movement impact ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](56, "ui-card", 25)(57, "ui-card-content")(58, "div", 20)(59, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](60, "\uD83D\uDCCA");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](61, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](62, "Avg per Deal");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](63, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](64);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](65, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](66, " Average profit per trade ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](67, FundingRevenueComponent_Conditional_14_Conditional_67_Template, 3, 2, "div", 27)(68, FundingRevenueComponent_Conditional_14_Conditional_68_Template, 22, 0, "ui-card", 28)(69, FundingRevenueComponent_Conditional_14_Conditional_69_Template, 20, 0, "ui-card", 28)(70, FundingRevenueComponent_Conditional_14_Conditional_70_Template, 8, 1, "ui-card", 29)(71, FundingRevenueComponent_Conditional_14_Conditional_71_Template, 5, 0, "div", 30);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(ctx_r1.summary().totalRevenue));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(ctx_r1.summary().totalRevenue), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" Net: ", ctx_r1.formatCurrency(ctx_r1.netProfit()), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.summary().totalDeals, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"](" Profitable: ", ctx_r1.summary().profitableDeals, " | Losing: ", ctx_r1.summary().losingDeals, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getWinRateClass(ctx_r1.summary().winRate));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatPercent(ctx_r1.summary().winRate), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"](" ", ctx_r1.summary().profitableDeals, " / ", ctx_r1.summary().totalDeals, " trades ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(ctx_r1.summary().totalFundingEarned), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(ctx_r1.summary().totalTradingPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(ctx_r1.summary().totalTradingPnl), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassMap"](ctx_r1.getValueClass(ctx_r1.summary().avgRevenuePerDeal));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCurrency(ctx_r1.summary().avgRevenuePerDeal), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.summary().bestDeal || ctx_r1.summary().worstDeal ? 67 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.bySymbol().length > 0 ? 68 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.byExchange().length > 0 ? 69 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.deals().length > 0 ? 70 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r1.deals().length === 0 ? 71 : -1);
  }
}
/**
 * Funding Revenue Component
 *
 * Displays comprehensive revenue statistics for funding arbitrage deals:
 * - Summary metrics (total revenue, deals, win rate, etc.)
 * - Revenue breakdown by symbol
 * - Revenue breakdown by exchange
 * - Individual deal list
 * - Date range filtering
 */
let FundingRevenueComponent = /*#__PURE__*/(() => {
  class FundingRevenueComponent {
    constructor() {
      this.fundingArbitrageService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.inject)(_services_funding_arbitrage_service__WEBPACK_IMPORTED_MODULE_0__.FundingArbitrageService);
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_1__.TranslationService);
      // Expose utilities to template
      this.Math = Math;
      // State signals
      this.revenueData = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      this.isLoading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(false);
      this.error = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      // Filter signals
      this.startDate = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(this.getDefaultStartDate());
      this.endDate = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(this.getDefaultEndDate());
      this.selectedExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)('');
      this.selectedSymbol = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)('');
      // UI state
      this.showFilters = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(true);
      this.expandedDealId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      // Computed signals
      this.summary = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => this.revenueData()?.data?.summary);
      this.bySymbol = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => this.revenueData()?.data?.bySymbol || []);
      this.byExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => this.revenueData()?.data?.byExchange || []);
      this.deals = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => this.revenueData()?.data?.deals || []);
      this.timeline = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => this.revenueData()?.data?.timeline || []);
      // Computed metrics
      this.totalFees = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        const dealsData = this.deals();
        return dealsData.reduce((sum, deal) => sum + deal.primaryTradingFees + deal.hedgeTradingFees, 0);
      });
      this.netProfit = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        const summaryData = this.summary();
        const fees = this.totalFees();
        return summaryData ? summaryData.totalRevenue - fees : 0;
      });
      // Unique exchanges and symbols for filters
      this.availableExchanges = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        const exchanges = new Set();
        this.byExchange().forEach(item => exchanges.add(item.exchange));
        return Array.from(exchanges).sort();
      });
      this.availableSymbols = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        const symbols = new Set();
        this.bySymbol().forEach(item => symbols.add(item.symbol));
        return Array.from(symbols).sort();
      });
    }
    ngOnInit() {
      this.loadRevenue();
    }
    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    /**
     * Load revenue data with current filters
     */
    loadRevenue() {
      this.isLoading.set(true);
      this.error.set(null);
      const startDateValue = this.startDate() || undefined;
      const endDateValue = this.endDate() || undefined;
      const exchangeValue = this.selectedExchange() || undefined;
      const symbolValue = this.selectedSymbol() || undefined;
      this.subscription = this.fundingArbitrageService.getRevenue(startDateValue, endDateValue, exchangeValue, symbolValue).subscribe({
        next: response => {
          this.revenueData.set(response);
          this.isLoading.set(false);
        },
        error: err => {
          this.error.set(err.message || 'Failed to load revenue data');
          this.isLoading.set(false);
        }
      });
    }
    /**
     * Refresh revenue data
     */
    refreshRevenue() {
      this.loadRevenue();
    }
    /**
     * Apply filters and reload data
     */
    applyFilters() {
      this.loadRevenue();
    }
    /**
     * Clear all filters and reload
     */
    clearFilters() {
      this.startDate.set(this.getDefaultStartDate());
      this.endDate.set(this.getDefaultEndDate());
      this.selectedExchange.set('');
      this.selectedSymbol.set('');
      this.loadRevenue();
    }
    /**
     * Toggle filters panel
     */
    toggleFilters() {
      this.showFilters.update(value => !value);
    }
    /**
     * Toggle deal expansion
     */
    toggleDealExpansion(dealId) {
      const current = this.expandedDealId();
      this.expandedDealId.set(current === dealId ? null : dealId);
    }
    /**
     * Check if deal is expanded
     */
    isDealExpanded(dealId) {
      return this.expandedDealId() === dealId;
    }
    /**
     * Format currency value
     */
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(value);
    }
    /**
     * Format percentage value
     */
    formatPercent(value) {
      return `${value.toFixed(2)}%`;
    }
    /**
     * Format date
     */
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    /**
     * Format duration in seconds
     */
    formatDuration(seconds) {
      if (seconds === null) return 'N/A';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    }
    /**
     * Get CSS class for positive/negative values
     */
    getValueClass(value) {
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    }
    /**
     * Get default start date (30 days ago)
     */
    getDefaultStartDate() {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    }
    /**
     * Get default end date (today)
     */
    getDefaultEndDate() {
      const date = new Date();
      return date.toISOString().split('T')[0];
    }
    /**
     * Calculate win rate color class
     */
    getWinRateClass(winRate) {
      if (winRate >= 70) return 'excellent';
      if (winRate >= 50) return 'good';
      if (winRate >= 30) return 'average';
      return 'poor';
    }
    /**
     * Format number with thousands separator
     */
    formatNumber(value, decimals = 0) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    }
    static {
      this.ɵfac = function FundingRevenueComponent_Factory(t) {
        return new (t || FundingRevenueComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
        type: FundingRevenueComponent,
        selectors: [["app-funding-revenue"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵStandaloneFeature"]],
        decls: 15,
        vars: 7,
        consts: [[1, "funding-revenue-container"], [1, "funding-revenue-header"], [1, "funding-revenue-title"], [1, "funding-revenue-actions"], ["variant", "ghost", "size", "small", 3, "clicked"], ["variant", "primary", "size", "small", 3, "clicked", "loading"], ["variant", "outlined", 1, "filters-card"], [1, "loading-state"], [1, "error-state"], [1, "filters-container"], [1, "filter-group"], [1, "filter-label"], ["type", "date", 1, "filter-input", 3, "ngModelChange", "ngModel"], [1, "filter-input", "filter-select", 3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "filter-actions"], ["variant", "primary", "size", "small", 3, "clicked"], [1, "summary-grid"], ["variant", "elevated", 1, "metric-card", "revenue-card"], [1, "metric-header"], [1, "metric-icon"], [1, "metric-label"], [1, "metric-value"], [1, "metric-subtext"], ["variant", "elevated", 1, "metric-card"], [1, "metric-value", "positive"], [1, "best-worst-grid"], ["variant", "outlined", 1, "data-table-card"], ["variant", "outlined", 1, "deals-card"], [1, "empty-state"], ["variant", "elevated", 1, "deal-highlight-card", "best-deal-card"], ["variant", "elevated", 1, "deal-highlight-card", "worst-deal-card"], [1, "deal-highlight-info"], [1, "deal-highlight-row"], [1, "deal-label"], [1, "deal-value"], [1, "deal-value", "positive"], [1, "deal-value", "negative"], [1, "table-wrapper"], [1, "data-table"], [1, "text-right"], [1, "symbol-cell"], [1, "text-right", "positive"], [1, "exchange-cell"], [1, "exchange-badge"], [1, "deals-list"], [1, "deal-item", 3, "expanded"], [1, "deal-item"], [1, "deal-header", 3, "click"], [1, "deal-main-info"], [1, "deal-symbol"], [1, "deal-exchanges"], [1, "deal-position-type"], [1, "deal-summary-info"], [1, "deal-pnl"], [1, "deal-expand-icon"], [1, "deal-details"], [1, "deal-details-grid"], [1, "detail-row"], [1, "detail-label"], [1, "detail-value"], [1, "detail-row", "highlight"], [1, "detail-value", "positive"], [1, "help-text"]],
        template: function FundingRevenueComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "h2", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3, "Funding Arbitrage Revenue");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "div", 3)(5, "ui-button", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("clicked", function FundingRevenueComponent_Template_ui_button_clicked_5_listener() {
              return ctx.toggleFilters();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("clicked", function FundingRevenueComponent_Template_ui_button_clicked_8_listener() {
              return ctx.refreshRevenue();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10, "Refresh");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](11, FundingRevenueComponent_Conditional_11_Template, 32, 4, "ui-card", 6)(12, FundingRevenueComponent_Conditional_12_Template, 3, 0, "div", 7)(13, FundingRevenueComponent_Conditional_13_Template, 5, 1, "div", 8)(14, FundingRevenueComponent_Conditional_14_Template, 72, 24);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵattribute"]("aria-expanded", ctx.showFilters());
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.showFilters() ? "Hide Filters" : "Show Filters");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("loading", ctx.isLoading());
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.showFilters() ? 11 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.isLoading() ? 12 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.error() && !ctx.isLoading() ? 13 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.revenueData() && !ctx.isLoading() && !ctx.error() ? 14 : -1);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_6__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_6__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.NgModel, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_2__.CardContentComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_3__.ButtonComponent],
        styles: [".funding-revenue-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  padding: 24px;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n\n.funding-revenue-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.funding-revenue-header[_ngcontent-%COMP%]   .funding-revenue-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 28px;\n  font-weight: 700;\n  color: var(--text-primary);\n}\n.funding-revenue-header[_ngcontent-%COMP%]   .funding-revenue-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.filters-card[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border: 1px solid var(--border-color);\n}\n\n.filters-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 180px;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-secondary);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--background-primary);\n  color: var(--text-primary);\n  font-size: 14px;\n  transition: var(--transition-fast);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input.filter-select[_ngcontent-%COMP%] {\n  cursor: pointer;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-position: right 12px center;\n  padding-right: 36px;\n  appearance: none;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n\n.loading-state[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  text-align: center;\n  color: var(--text-secondary);\n  gap: 16px;\n}\n.loading-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 16px;\n}\n.loading-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-tertiary);\n}\n\n.error-state[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n.summary-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 20px;\n}\n\n.metric-card[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n}\n.metric-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);\n}\n.metric-card.revenue-card[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);\n  border: 2px solid var(--primary-color);\n}\n.metric-card[_ngcontent-%COMP%]   .metric-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-header[_ngcontent-%COMP%]   .metric-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-header[_ngcontent-%COMP%]   .metric-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--text-secondary);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value[_ngcontent-%COMP%] {\n  font-size: 32px;\n  font-weight: 700;\n  color: var(--text-primary);\n  margin-bottom: 4px;\n  line-height: 1.2;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.excellent[_ngcontent-%COMP%] {\n  color: #10b981;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.good[_ngcontent-%COMP%] {\n  color: #3b82f6;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.average[_ngcontent-%COMP%] {\n  color: #f59e0b;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-value.poor[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.metric-card[_ngcontent-%COMP%]   .metric-subtext[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n}\n\n.best-worst-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 20px;\n}\n\n.deal-highlight-card.best-deal-card[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--success-color);\n  background: rgba(34, 197, 94, 0.05);\n}\n.deal-highlight-card.worst-deal-card[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--danger-color);\n  background: rgba(239, 68, 68, 0.05);\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px solid var(--border-color);\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%]   .deal-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary);\n  font-weight: 500;\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%]   .deal-value[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%]   .deal-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.deal-highlight-card[_ngcontent-%COMP%]   .deal-highlight-row[_ngcontent-%COMP%]   .deal-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n.data-table-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n\n.table-wrapper[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  overflow-y: auto;\n  max-height: 600px;\n}\n.table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n.table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-secondary);\n  border-radius: 4px;\n}\n.table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border-color);\n  border-radius: 4px;\n}\n.table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--text-secondary);\n}\n\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 14px;\n}\n.data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  background: var(--background-secondary);\n  z-index: 10;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n}\n.data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  text-align: left;\n  font-weight: 600;\n  font-size: 13px;\n  color: var(--text-secondary);\n  border-bottom: 2px solid var(--border-color);\n  white-space: nowrap;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n  border-bottom: 1px solid var(--border-color);\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  color: var(--text-primary);\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--primary-color);\n  font-size: 14px;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.exchange-cell[_ngcontent-%COMP%]   .exchange-badge[_ngcontent-%COMP%] {\n  padding: 4px 10px;\n  border-radius: 12px;\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.exchange-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bybit[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.1);\n  border: 1px solid rgba(245, 158, 11, 0.3);\n  color: #f59e0b;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.exchange-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bingx[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.1);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  color: #8b5cf6;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.exchange-cell[_ngcontent-%COMP%]   .exchange-badge.badge-binance[_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.1);\n  border: 1px solid rgba(234, 179, 8, 0.3);\n  color: #eab308;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n  font-weight: 600;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n  font-weight: 600;\n}\n\n.deals-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n\n.deals-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.deal-item[_ngcontent-%COMP%] {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  overflow: hidden;\n  transition: var(--transition-fast);\n}\n.deal-item.expanded[_ngcontent-%COMP%] {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px;\n  background: var(--background-secondary);\n  cursor: pointer;\n  transition: var(--transition-fast);\n  gap: 16px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]:hover {\n  background: var(--background-tertiary);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%]   .deal-symbol[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  color: var(--primary-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%]   .deal-exchanges[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n  padding: 4px 8px;\n  background: var(--background-primary);\n  border-radius: 4px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%]   .deal-position-type[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  padding: 4px 8px;\n  border-radius: 4px;\n  text-transform: uppercase;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%]   .deal-position-type.long[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.1);\n  color: #10b981;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-main-info[_ngcontent-%COMP%]   .deal-position-type.short[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n  color: #ef4444;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%]   .deal-pnl[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%]   .deal-pnl.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%]   .deal-pnl.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%]   .deal-expand-icon[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%] {\n  padding: 20px;\n  background: var(--background-primary);\n  border-top: 1px solid var(--border-color);\n  animation: _ngcontent-%COMP%_expandDetails 0.3s ease-out;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 12px;\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px dashed var(--border-color);\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row.highlight[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  padding: 10px 12px;\n  border-radius: 6px;\n  border: 1px solid var(--border-color);\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   .detail-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n  font-weight: 500;\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   .detail-value[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   .detail-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.deal-item[_ngcontent-%COMP%]   .detail-row[_ngcontent-%COMP%]   .detail-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n@keyframes _ngcontent-%COMP%_expandDetails {\n  from {\n    opacity: 0;\n    transform: scaleY(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scaleY(1);\n  }\n}\n@media (max-width: 1200px) {\n  .summary-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  }\n  .metric-card[_ngcontent-%COMP%]   .metric-value[_ngcontent-%COMP%] {\n    font-size: 28px;\n  }\n}\n@media (max-width: 768px) {\n  .funding-revenue-container[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n  .funding-revenue-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .funding-revenue-header[_ngcontent-%COMP%]   .funding-revenue-actions[_ngcontent-%COMP%] {\n    flex-direction: row;\n    justify-content: stretch;\n  }\n  .funding-revenue-header[_ngcontent-%COMP%]   .funding-revenue-actions[_ngcontent-%COMP%]   ui-button[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n  .filters-container[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%] {\n    min-width: 100%;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%]   ui-button[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n  .summary-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .best-worst-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .deal-details-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .data-table[_ngcontent-%COMP%] {\n    font-size: 13px;\n  }\n  .data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 10px 12px;\n  }\n  .deal-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n  .deal-header[_ngcontent-%COMP%]   .deal-summary-info[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: space-between;\n  }\n}\n@media (max-width: 480px) {\n  .funding-revenue-header[_ngcontent-%COMP%]   .funding-revenue-title[_ngcontent-%COMP%] {\n    font-size: 24px;\n  }\n  .metric-card[_ngcontent-%COMP%]   .metric-value[_ngcontent-%COMP%] {\n    font-size: 24px;\n  }\n  .data-table[_ngcontent-%COMP%] {\n    font-size: 12px;\n  }\n  .data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(4), \n   .data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(4) {\n    display: none;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL2Z1bmRpbmctcmV2ZW51ZS9mdW5kaW5nLXJldmVudWUuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxTQUFBO0VBQ0EsYUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtBQUNGOztBQUdBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsOEJBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtBQUFGO0FBRUU7RUFDRSxTQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0VBQ0EsMEJBQUE7QUFBSjtBQUdFO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsU0FBQTtBQURKOztBQU1BO0VBQ0UscUNBQUE7RUFDQSxxQ0FBQTtBQUhGOztBQU1BO0VBQ0UsYUFBQTtFQUNBLHFCQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7QUFIRjtBQUtFO0VBQ0UsYUFBQTtFQUNBLHNCQUFBO0VBQ0EsUUFBQTtFQUNBLGdCQUFBO0FBSEo7QUFLSTtFQUNFLGVBQUE7RUFDQSxnQkFBQTtFQUNBLDRCQUFBO0FBSE47QUFNSTtFQUNFLGlCQUFBO0VBQ0EscUNBQUE7RUFDQSxrQkFBQTtFQUNBLHFDQUFBO0VBQ0EsMEJBQUE7RUFDQSxlQUFBO0VBQ0Esa0NBQUE7QUFKTjtBQU1NO0VBQ0UsYUFBQTtFQUNBLGtDQUFBO0VBQ0EsNkNBQUE7QUFKUjtBQU9NO0VBQ0UsZUFBQTtFQUNBLHVMQUFBO0VBQ0EsNEJBQUE7RUFDQSxzQ0FBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7QUFMUjtBQVVFO0VBQ0UsYUFBQTtFQUNBLFFBQUE7QUFSSjs7QUFhQTs7O0VBR0UsYUFBQTtFQUNBLHNCQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSw0QkFBQTtFQUNBLFNBQUE7QUFWRjtBQVlFOzs7RUFDRSxTQUFBO0VBQ0EsZUFB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ciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMjRweDtcbiAgcGFkZGluZzogMjRweDtcbiAgbWF4LXdpZHRoOiAxNDAwcHg7XG4gIG1hcmdpbjogMCBhdXRvO1xufVxuXG4vLyBIZWFkZXJcbi5mdW5kaW5nLXJldmVudWUtaGVhZGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBnYXA6IDE2cHg7XG4gIGZsZXgtd3JhcDogd3JhcDtcblxuICAuZnVuZGluZy1yZXZlbnVlLXRpdGxlIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZm9udC1zaXplOiAyOHB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAuZnVuZGluZy1yZXZlbnVlLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDEycHg7XG4gIH1cbn1cblxuLy8gRmlsdGVyc1xuLmZpbHRlcnMtY2FyZCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbi5maWx0ZXJzLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcbiAgZ2FwOiAxNnB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG5cbiAgLmZpbHRlci1ncm91cCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGdhcDogNnB4O1xuICAgIG1pbi13aWR0aDogMTgwcHg7XG5cbiAgICAuZmlsdGVyLWxhYmVsIHtcbiAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cblxuICAgIC5maWx0ZXItaW5wdXQge1xuICAgICAgcGFkZGluZzogOHB4IDEycHg7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcblxuICAgICAgJjpmb2N1cyB7XG4gICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICAgIH1cblxuICAgICAgJi5maWx0ZXItc2VsZWN0IHtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9JzEyJyBoZWlnaHQ9JzEyJyB2aWV3Qm94PScwIDAgMTIgMTInJTNFJTNDcGF0aCBmaWxsPSclMjM2NjYnIGQ9J002IDlMMSA0aDEweicvJTNFJTNDL3N2ZyUzRVwiKTtcbiAgICAgICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMTJweCBjZW50ZXI7XG4gICAgICAgIHBhZGRpbmctcmlnaHQ6IDM2cHg7XG4gICAgICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLmZpbHRlci1hY3Rpb25zIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGdhcDogOHB4O1xuICB9XG59XG5cbi8vIExvYWRpbmcsIEVycm9yLCBFbXB0eSBTdGF0ZXNcbi5sb2FkaW5nLXN0YXRlLFxuLmVycm9yLXN0YXRlLFxuLmVtcHR5LXN0YXRlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHBhZGRpbmc6IDYwcHggMjBweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICBnYXA6IDE2cHg7XG5cbiAgcCB7XG4gICAgbWFyZ2luOiAwO1xuICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgfVxuXG4gIC5oZWxwLXRleHQge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSk7XG4gIH1cbn1cblxuLmVycm9yLXN0YXRlIHtcbiAgY29sb3I6IHZhcigtLWRhbmdlci1jb2xvcik7XG59XG5cbi8vIFN1bW1hcnkgR3JpZFxuLnN1bW1hcnktZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjUwcHgsIDFmcikpO1xuICBnYXA6IDIwcHg7XG59XG5cbi5tZXRyaWMtY2FyZCB7XG4gIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgJjpob3ZlciB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgIGJveC1zaGFkb3c6IDAgOHB4IDE2cHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICB9XG5cbiAgJi5yZXZlbnVlLWNhcmQge1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoNTksIDEzMCwgMjQ2LCAwLjEpIDAlLCByZ2JhKDE0NywgNTEsIDIzNCwgMC4xKSAxMDAlKTtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgfVxuXG4gIC5tZXRyaWMtaGVhZGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA4cHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMTJweDtcblxuICAgIC5tZXRyaWMtaWNvbiB7XG4gICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgfVxuXG4gICAgLm1ldHJpYy1sYWJlbCB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICBsZXR0ZXItc3BhY2luZzogMC41cHg7XG4gICAgfVxuICB9XG5cbiAgLm1ldHJpYy12YWx1ZSB7XG4gICAgZm9udC1zaXplOiAzMnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gICAgbWFyZ2luLWJvdHRvbTogNHB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxLjI7XG5cbiAgICAmLnBvc2l0aXZlIHtcbiAgICAgIGNvbG9yOiB2YXIoLS1zdWNjZXNzLWNvbG9yKTtcbiAgICB9XG5cbiAgICAmLm5lZ2F0aXZlIHtcbiAgICAgIGNvbG9yOiB2YXIoLS1kYW5nZXItY29sb3IpO1xuICAgIH1cblxuICAgICYuZXhjZWxsZW50IHtcbiAgICAgIGNvbG9yOiAjMTBiOTgxO1xuICAgIH1cblxuICAgICYuZ29vZCB7XG4gICAgICBjb2xvcjogIzNiODJmNjtcbiAgICB9XG5cbiAgICAmLmF2ZXJhZ2Uge1xuICAgICAgY29sb3I6ICNmNTllMGI7XG4gICAgfVxuXG4gICAgJi5wb29yIHtcbiAgICAgIGNvbG9yOiAjZWY0NDQ0O1xuICAgIH1cbiAgfVxuXG4gIC5tZXRyaWMtc3VidGV4dCB7XG4gICAgZm9udC1zaXplOiAxM3B4O1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gIH1cbn1cblxuLy8gQmVzdC9Xb3JzdCBEZWFscyBHcmlkXG4uYmVzdC13b3JzdC1ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgzMDBweCwgMWZyKSk7XG4gIGdhcDogMjBweDtcbn1cblxuLmRlYWwtaGlnaGxpZ2h0LWNhcmQge1xuICAmLmJlc3QtZGVhbC1jYXJkIHtcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLXN1Y2Nlc3MtY29sb3IpO1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMzQsIDE5NywgOTQsIDAuMDUpO1xuICB9XG5cbiAgJi53b3JzdC1kZWFsLWNhcmQge1xuICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tZGFuZ2VyLWNvbG9yKTtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjA1KTtcbiAgfVxuXG4gIC5kZWFsLWhpZ2hsaWdodC1pbmZvIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZ2FwOiAxMnB4O1xuICB9XG5cbiAgLmRlYWwtaGlnaGxpZ2h0LXJvdyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiA4cHggMDtcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcblxuICAgICY6bGFzdC1jaGlsZCB7XG4gICAgICBib3JkZXItYm90dG9tOiBub25lO1xuICAgIH1cblxuICAgIC5kZWFsLWxhYmVsIHtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgIH1cblxuICAgIC5kZWFsLXZhbHVlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICAgJi5wb3NpdGl2ZSB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1zdWNjZXNzLWNvbG9yKTtcbiAgICAgIH1cblxuICAgICAgJi5uZWdhdGl2ZSB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1kYW5nZXItY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBEYXRhIFRhYmxlc1xuLmRhdGEtdGFibGUtY2FyZCB7XG4gIG92ZXJmbG93OiBoaWRkZW47XG59XG5cbi50YWJsZS13cmFwcGVyIHtcbiAgb3ZlcmZsb3cteDogYXV0bztcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgbWF4LWhlaWdodDogNjAwcHg7XG5cbiAgJjo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICAgIHdpZHRoOiA4cHg7XG4gICAgaGVpZ2h0OiA4cHg7XG4gIH1cblxuICAmOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgfVxuXG4gICY6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cbiAgfVxufVxuXG4uZGF0YS10YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBmb250LXNpemU6IDE0cHg7XG5cbiAgdGhlYWQge1xuICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgdG9wOiAwO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICB6LWluZGV4OiAxMDtcbiAgICBib3gtc2hhZG93OiAwIDJweCA0cHggcmdiYSgwLCAwLCAwLCAwLjA1KTtcblxuICAgIHRoIHtcbiAgICAgIHBhZGRpbmc6IDE0cHggMTZweDtcbiAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICBsZXR0ZXItc3BhY2luZzogMC41cHg7XG5cbiAgICAgICYudGV4dC1yaWdodCB7XG4gICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRib2R5IHtcbiAgICB0ciB7XG4gICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgICB9XG5cbiAgICAgICY6bGFzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICB9XG5cbiAgICAgIHRkIHtcbiAgICAgICAgcGFkZGluZzogMTRweCAxNnB4O1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICAgICAmLnRleHQtcmlnaHQge1xuICAgICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgJi5zeW1ib2wtY2VsbCB7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICB9XG5cbiAgICAgICAgJi5leGNoYW5nZS1jZWxsIHtcbiAgICAgICAgICAuZXhjaGFuZ2UtYmFkZ2Uge1xuICAgICAgICAgICAgcGFkZGluZzogNHB4IDEwcHg7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICAgICAgICAgICAgZm9udC1zaXplOiAxMXB4O1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICAgICAgICBsZXR0ZXItc3BhY2luZzogMC41cHg7XG5cbiAgICAgICAgICAgICYuYmFkZ2UtYnliaXQge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI0NSwgMTU4LCAxMSwgMC4xKTtcbiAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNDUsIDE1OCwgMTEsIDAuMyk7XG4gICAgICAgICAgICAgIGNvbG9yOiAjZjU5ZTBiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAmLmJhZGdlLWJpbmd4IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxMzksIDkyLCAyNDYsIDAuMSk7XG4gICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTM5LCA5MiwgMjQ2LCAwLjMpO1xuICAgICAgICAgICAgICBjb2xvcjogIzhiNWNmNjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJi5iYWRnZS1iaW5hbmNlIHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyMzQsIDE3OSwgOCwgMC4xKTtcbiAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyMzQsIDE3OSwgOCwgMC4zKTtcbiAgICAgICAgICAgICAgY29sb3I6ICNlYWIzMDg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJi5wb3NpdGl2ZSB7XG4gICAgICAgICAgY29sb3I6IHZhcigtLXN1Y2Nlc3MtY29sb3IpO1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIH1cblxuICAgICAgICAmLm5lZ2F0aXZlIHtcbiAgICAgICAgICBjb2xvcjogdmFyKC0tZGFuZ2VyLWNvbG9yKTtcbiAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIERlYWxzIExpc3Rcbi5kZWFscy1jYXJkIHtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cblxuLmRlYWxzLWxpc3Qge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDEycHg7XG59XG5cbi5kZWFsLWl0ZW0ge1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgJi5leHBhbmRlZCB7XG4gICAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG4gIH1cblxuICAuZGVhbC1oZWFkZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgcGFkZGluZzogMTZweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG4gICAgZ2FwOiAxNnB4O1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXRlcnRpYXJ5KTtcbiAgICB9XG5cbiAgICAuZGVhbC1tYWluLWluZm8ge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDEycHg7XG4gICAgICBmbGV4LXdyYXA6IHdyYXA7XG5cbiAgICAgIC5kZWFsLXN5bWJvbCB7XG4gICAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgICAgfVxuXG4gICAgICAuZGVhbC1leGNoYW5nZXMge1xuICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgICAgIHBhZGRpbmc6IDRweCA4cHg7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIH1cblxuICAgICAgLmRlYWwtcG9zaXRpb24tdHlwZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgcGFkZGluZzogNHB4IDhweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuXG4gICAgICAgICYubG9uZyB7XG4gICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7XG4gICAgICAgICAgY29sb3I6ICMxMGI5ODE7XG4gICAgICAgIH1cblxuICAgICAgICAmLnNob3J0IHtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjEpO1xuICAgICAgICAgIGNvbG9yOiAjZWY0NDQ0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLmRlYWwtc3VtbWFyeS1pbmZvIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZ2FwOiAxMnB4O1xuXG4gICAgICAuZGVhbC1wbmwge1xuICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG5cbiAgICAgICAgJi5wb3NpdGl2ZSB7XG4gICAgICAgICAgY29sb3I6IHZhcigtLXN1Y2Nlc3MtY29sb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgJi5uZWdhdGl2ZSB7XG4gICAgICAgICAgY29sb3I6IHZhcigtLWRhbmdlci1jb2xvcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLmRlYWwtZXhwYW5kLWljb24ge1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLmRlYWwtZGV0YWlscyB7XG4gICAgcGFkZGluZzogMjBweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xuICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIGFuaW1hdGlvbjogZXhwYW5kRGV0YWlscyAwLjNzIGVhc2Utb3V0O1xuICB9XG5cbiAgLmRlYWwtZGV0YWlscy1ncmlkIHtcbiAgICBkaXNwbGF5OiBncmlkO1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZmlsbCwgbWlubWF4KDI1MHB4LCAxZnIpKTtcbiAgICBnYXA6IDEycHg7XG4gIH1cblxuICAuZGV0YWlsLXJvdyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiA4cHggMDtcbiAgICBib3JkZXItYm90dG9tOiAxcHggZGFzaGVkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAmOmxhc3QtY2hpbGQge1xuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICB9XG5cbiAgICAmLmhpZ2hsaWdodCB7XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgICBwYWRkaW5nOiAxMHB4IDEycHg7XG4gICAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIH1cblxuICAgIC5kZXRhaWwtbGFiZWwge1xuICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgfVxuXG4gICAgLmRldGFpbC12YWx1ZSB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG5cbiAgICAgICYucG9zaXRpdmUge1xuICAgICAgICBjb2xvcjogdmFyKC0tc3VjY2Vzcy1jb2xvcik7XG4gICAgICB9XG5cbiAgICAgICYubmVnYXRpdmUge1xuICAgICAgICBjb2xvcjogdmFyKC0tZGFuZ2VyLWNvbG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuQGtleWZyYW1lcyBleHBhbmREZXRhaWxzIHtcbiAgZnJvbSB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHNjYWxlWSgwLjk1KTtcbiAgfVxuICB0byB7XG4gICAgb3BhY2l0eTogMTtcbiAgICB0cmFuc2Zvcm06IHNjYWxlWSgxKTtcbiAgfVxufVxuXG4vLyBSZXNwb25zaXZlIERlc2lnblxuQG1lZGlhIChtYXgtd2lkdGg6IDEyMDBweCkge1xuICAuc3VtbWFyeS1ncmlkIHtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIyMHB4LCAxZnIpKTtcbiAgfVxuXG4gIC5tZXRyaWMtY2FyZCB7XG4gICAgLm1ldHJpYy12YWx1ZSB7XG4gICAgICBmb250LXNpemU6IDI4cHg7XG4gICAgfVxuICB9XG59XG5cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAuZnVuZGluZy1yZXZlbnVlLWNvbnRhaW5lciB7XG4gICAgcGFkZGluZzogMTZweDtcbiAgfVxuXG4gIC5mdW5kaW5nLXJldmVudWUtaGVhZGVyIHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuXG4gICAgLmZ1bmRpbmctcmV2ZW51ZS1hY3Rpb25zIHtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHN0cmV0Y2g7XG5cbiAgICAgIHVpLWJ1dHRvbiB7XG4gICAgICAgIGZsZXg6IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLmZpbHRlcnMtY29udGFpbmVyIHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBzdHJldGNoO1xuXG4gICAgLmZpbHRlci1ncm91cCB7XG4gICAgICBtaW4td2lkdGg6IDEwMCU7XG4gICAgfVxuXG4gICAgLmZpbHRlci1hY3Rpb25zIHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuXG4gICAgICB1aS1idXR0b24ge1xuICAgICAgICBmbGV4OiAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC5zdW1tYXJ5LWdyaWQge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLmJlc3Qtd29yc3QtZ3JpZCB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cblxuICAuZGVhbC1kZXRhaWxzLWdyaWQge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLmRhdGEtdGFibGUge1xuICAgIGZvbnQtc2l6ZTogMTNweDtcblxuICAgIHRoZWFkIHRoLFxuICAgIHRib2R5IHRkIHtcbiAgICAgIHBhZGRpbmc6IDEwcHggMTJweDtcbiAgICB9XG4gIH1cblxuICAuZGVhbC1oZWFkZXIge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG5cbiAgICAuZGVhbC1zdW1tYXJ5LWluZm8ge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgfVxuICB9XG59XG5cbkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkge1xuICAuZnVuZGluZy1yZXZlbnVlLWhlYWRlciB7XG4gICAgLmZ1bmRpbmctcmV2ZW51ZS10aXRsZSB7XG4gICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgfVxuICB9XG5cbiAgLm1ldHJpYy1jYXJkIHtcbiAgICAubWV0cmljLXZhbHVlIHtcbiAgICAgIGZvbnQtc2l6ZTogMjRweDtcbiAgICB9XG4gIH1cblxuICAuZGF0YS10YWJsZSB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuXG4gICAgLy8gSGlkZSBsZXNzIGltcG9ydGFudCBjb2x1bW5zIG9uIHZlcnkgc21hbGwgc2NyZWVuc1xuICAgIHRoZWFkIHRoOm50aC1jaGlsZCg0KSxcbiAgICB0Ym9keSB0ZDpudGgtY2hpbGQoNCkge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return FundingRevenueComponent;
})();

/***/ }),

/***/ 4441:
/*!*******************************************************!*\
  !*** ./src/app/services/funding-arbitrage.service.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FundingArbitrageService: () => (/* binding */ FundingArbitrageService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ 6443);





/**
 * Funding Arbitrage Service
 *
 * Handles all funding arbitrage revenue operations including:
 * - Fetching revenue statistics
 * - Filtering by date range, exchange, and symbol
 * - Managing revenue state with reactive BehaviorSubjects
 */
let FundingArbitrageService = /*#__PURE__*/(() => {
  class FundingArbitrageService {
    constructor(http) {
      this.http = http;
      this.revenueSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
      this.loadingSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(false);
      this.errorSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
      this.revenue$ = this.revenueSubject.asObservable();
      this.loading$ = this.loadingSubject.asObservable();
      this.error$ = this.errorSubject.asObservable();
    }
    /**
     * Get comprehensive revenue statistics for funding arbitrage
     * @param startDate - Optional start date (ISO string)
     * @param endDate - Optional end date (ISO string)
     * @param exchange - Optional exchange filter
     * @param symbol - Optional symbol filter
     * @returns Observable<FundingArbitrageRevenueResponse>
     */
    getRevenue(startDate, endDate, exchange, symbol) {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('fundingArbitrage', 'revenue');
      const params = {};
      if (startDate) params['startDate'] = startDate;
      if (endDate) params['endDate'] = endDate;
      if (exchange) params['exchange'] = exchange;
      if (symbol) params['symbol'] = symbol;
      const url = Object.keys(params).length > 0 ? (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params) : baseUrl;
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(response => {
        this.revenueSubject.next(response);
        this.loadingSubject.next(false);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Refresh revenue data with current filters
     */
    refreshRevenue() {
      const currentRevenue = this.revenueSubject.value;
      if (!currentRevenue) {
        return this.getRevenue();
      }
      const filters = currentRevenue.filters;
      return this.getRevenue(filters.startDate, filters.endDate, filters.exchange || undefined, filters.symbol || undefined);
    }
    /**
     * Get current revenue data from cache (if available)
     */
    getCurrentRevenue() {
      return this.revenueSubject.value;
    }
    /**
     * Clear cached revenue data
     */
    clearRevenue() {
      this.revenueSubject.next(null);
      this.errorSubject.next(null);
    }
    /**
     * Check if revenue data is currently loading
     */
    isLoading() {
      return this.loadingSubject.value;
    }
    /**
     * Get current error (if any)
     */
    getCurrentError() {
      return this.errorSubject.value;
    }
    /**
     * Calculate total fees from deals
     */
    calculateTotalFees(deals) {
      return deals.reduce((total, deal) => total + deal.primaryTradingFees + deal.hedgeTradingFees, 0);
    }
    /**
     * Calculate net profit (revenue - fees)
     */
    calculateNetProfit(totalRevenue, totalFees) {
      return totalRevenue - totalFees;
    }
    /**
     * Format duration in seconds to human-readable string
     */
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    }
    /**
     * Handle HTTP errors and return user-friendly messages
     */
    handleError(error) {
      console.error('Funding Arbitrage Service Error:', error);
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 0) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (error.status === 401) {
        return 'Unauthorized. Please log in again.';
      }
      if (error.status === 403) {
        return 'Access forbidden. You do not have permission to view this data.';
      }
      if (error.status === 400) {
        return error.error?.message || 'Invalid request parameters.';
      }
      if (error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message || 'An unexpected error occurred. Please try again.';
    }
    static {
      this.ɵfac = function FundingArbitrageService_Factory(t) {
        return new (t || FundingArbitrageService)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({
        token: FundingArbitrageService,
        factory: FundingArbitrageService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return FundingArbitrageService;
})();

/***/ })

}]);
//# sourceMappingURL=11.js.map