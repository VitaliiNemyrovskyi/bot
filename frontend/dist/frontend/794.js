"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[794],{

/***/ 8112:
/*!*****************************************************************************!*\
  !*** ./src/app/components/trading/funding-rates/funding-rates.component.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FundingRatesComponent: () => (/* binding */ FundingRatesComponent)
/* harmony export */ });
/* harmony import */ var _Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 9204);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs */ 9240);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs */ 9452);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ 3037);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs/operators */ 6647);
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../services/auth.service */ 4796);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../config/app.config */ 9740);















const _forTrack0 = ($index, $item) => $item.symbol;
const _forTrack1 = ($index, $item) => $item.exchange + $item.credentialId;
const _forTrack2 = ($index, $item) => $item.subscriptionId;
function FundingRatesComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-button", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_8_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.clearSort());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.actions.clearSort"));
  }
}
function FundingRatesComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_20_Template_button_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.arbitrageSearchQuery.set(""));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "path", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
}
function FundingRatesComponent_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_26_Template_button_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r4);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.minSpreadThreshold.set(null));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](2, "path", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
}
function FundingRatesComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "span", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.minSpreadThreshold(), "%+");
  }
}
function FundingRatesComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_34_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r5);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.clearArbitrageFilters());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "span", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](3, "path", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4, " Clear ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
}
function FundingRatesComponent_Conditional_52_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 35)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate3"]("", ctx_r1.translate("arbitrage.collapsed"), " (", ctx_r1.filteredArbitrageOpportunities().length, " ", ctx_r1.translate("fundingRates.info.pairs"), ")");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 46)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.loading"));
  }
}
function FundingRatesComponent_Conditional_53_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 47)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "ui-button", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_1_Template_ui_button_clicked_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r6);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.loadArbitrageOpportunities());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.arbitrageError());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("funding.retry"), " ");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 48)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "p", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.empty"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.emptyHelp"));
  }
}
function FundingRatesComponent_Conditional_53_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 48)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "ui-button", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_3_Template_ui_button_clicked_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r7);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.clearArbitrageFilters());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.noMatches"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.filters.clearFilters"), " ");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "button", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_For_7_Template_button_click_0_listener() {
      const exchange_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r8).$implicit;
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.openTradingPairForExchange(opportunity_r10.symbol, exchange_r9.exchange, exchange_r9.environment, exchange_r9.originalSymbol));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const exchange_r9 = ctx.$implicit;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassMap"]("badge-" + exchange_r9.exchange.toLowerCase());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("title", "Open " + opportunity_r10.symbol + " on " + exchange_r9.exchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", exchange_r9.exchange, " ");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_1_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 73)(1, "span", 74);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "span", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const exchange_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](exchange_r11.exchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("negative", ctx_r1.parseFloat(opportunity_r10.bestLong.fundingRate) < 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.formatNextFundingTime((exchange_r11.nextFundingTime == null ? null : exchange_r11.nextFundingTime.toString()) || "0"), " ");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_1_Conditional_0_Template, 5, 4, "div", 73);
  }
  if (rf & 2) {
    const exchange_r11 = ctx.$implicit;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](exchange_r11.exchange === opportunity_r10.bestLong.exchange && exchange_r11.credentialId === opportunity_r10.bestLong.credentialId ? 0 : -1);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_3_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 73)(1, "span", 74);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "span", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const exchange_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](exchange_r12.exchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", ctx_r1.parseFloat(opportunity_r10.bestShort.fundingRate) > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.formatNextFundingTime((exchange_r12.nextFundingTime == null ? null : exchange_r12.nextFundingTime.toString()) || "0"), " ");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_3_Conditional_0_Template, 5, 4, "div", 73);
  }
  if (rf & 2) {
    const exchange_r12 = ctx.$implicit;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](exchange_r12.exchange === opportunity_r10.bestShort.exchange && exchange_r12.credentialId === opportunity_r10.bestShort.credentialId ? 0 : -1);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](0, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_1_Template, 1, 1, null, null, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](2, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_For_3_Template, 1, 1, null, null, _forTrack1);
  }
  if (rf & 2) {
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](opportunity_r10.exchanges);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](opportunity_r10.exchanges);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 71)(1, "ui-button", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_34_Template_ui_button_clicked_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r13);
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.startArbitrageSubscription(opportunity_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](3, "path", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-button", 78);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_34_Template_ui_button_clicked_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r13);
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.editArbitrageSubscription(opportunity_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](6, "path", 79)(7, "path", 80);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](8, "ui-button", 81);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_34_Template_ui_button_clicked_8_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r13);
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.cancelArbitrageSubscription(opportunity_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "svg", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](10, "path", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    let tmp_14_0;
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("iconOnly", true)("disabled", ctx_r1.startingSubscriptionId() === ((tmp_14_0 = ctx_r1.getArbitrageSubscription(opportunity_r10.symbol)) == null ? null : tmp_14_0.subscriptionId));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("iconOnly", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("iconOnly", true);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-button", 84);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_0_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r14);
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.subscribeToArbitrage(opportunity_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("\u26A1 ", ctx_r1.translate("fundingRates.actions.subscribe"), "");
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-button", 85);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_1_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r15);
      const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.subscribeToArbitrage(opportunity_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.actions.subscribe"));
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_0_Template, 3, 1, "ui-button", 82)(1, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Conditional_1_Template, 3, 1, "ui-button", 83);
  }
  if (rf & 2) {
    const opportunity_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](opportunity_r10.arbitrageOpportunity ? 0 : 1);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_For_20_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "tr")(1, "td", 57)(2, "span", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "td", 59)(5, "div", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](6, FundingRatesComponent_Conditional_53_Conditional_4_For_20_For_7_Template, 2, 4, "button", 61, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](8, "td", 55)(9, "div", 62)(10, "div", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "div", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "td", 55)(17, "div", 62)(18, "div", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "div", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "div", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "td", 55)(25, "div", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_26_Template, 4, 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "td", 55)(28, "div", 67)(29, "div", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](31, "div", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "td", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](34, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_34_Template, 11, 4, "div", 71)(35, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Conditional_35_Template, 2, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const opportunity_r10 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("opportunity-row", opportunity_r10.arbitrageOpportunity)("has-subscription", ctx_r1.hasActiveSubscription(opportunity_r10.symbol));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](opportunity_r10.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](opportunity_r10.exchanges);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](opportunity_r10.bestLong.exchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("negative", ctx_r1.parseFloat(opportunity_r10.bestLong.fundingRate) < 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", (ctx_r1.parseFloat(opportunity_r10.bestLong.fundingRate) * 100).toFixed(4), "% ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](opportunity_r10.bestLong.environment);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](opportunity_r10.bestShort.exchange);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", ctx_r1.parseFloat(opportunity_r10.bestShort.fundingRate) > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", (ctx_r1.parseFloat(opportunity_r10.bestShort.fundingRate) * 100).toFixed(4), "% ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](opportunity_r10.bestShort.environment);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](opportunity_r10.exchanges && opportunity_r10.exchanges.length > 0 ? 26 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("high-spread", ctx_r1.parseFloat(opportunity_r10.spreadPercent) > 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", (ctx_r1.parseFloat(opportunity_r10.spread) * 100).toFixed(4), "% ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" (", opportunity_r10.spreadPercent, "%) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.hasArbitrageSubscription(opportunity_r10.symbol) ? 34 : 35);
  }
}
function FundingRatesComponent_Conditional_53_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 49)(1, "table", 53)(2, "thead")(3, "tr")(4, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "th", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](8, "th", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "th", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "th", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "th", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "th", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](19, FundingRatesComponent_Conditional_53_Conditional_4_For_20_Template, 36, 21, "tr", 56, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.exchanges"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.bestLong"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.bestShort"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.nextFunding"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.spread"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("arbitrage.table.opportunity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](ctx_r1.filteredArbitrageOpportunities());
  }
}
function FundingRatesComponent_Conditional_53_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FundingRatesComponent_Conditional_53_Conditional_0_Template, 3, 1, "div", 46)(1, FundingRatesComponent_Conditional_53_Conditional_1_Template, 5, 2, "div", 47)(2, FundingRatesComponent_Conditional_53_Conditional_2_Template, 5, 2, "div", 48)(3, FundingRatesComponent_Conditional_53_Conditional_3_Template, 5, 2, "div", 48)(4, FundingRatesComponent_Conditional_53_Conditional_4_Template, 21, 7, "div", 49);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.isLoadingArbitrage() ? 0 : ctx_r1.arbitrageError() ? 1 : ctx_r1.arbitrageOpportunities().length === 0 ? 2 : ctx_r1.filteredArbitrageOpportunities().length === 0 ? 3 : 4);
  }
}
function FundingRatesComponent_Conditional_54_For_7_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 98);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const sub_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("urgent", sub_r17.countdown && sub_r17.countdown <= 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCountdown(sub_r17.countdown), " ");
  }
}
function FundingRatesComponent_Conditional_54_For_7_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 98);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const sub_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]().$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("urgent", ctx_r1.calculateCountdown(sub_r17.nextFundingTime) <= 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.formatCountdown(ctx_r1.calculateCountdown(sub_r17.nextFundingTime)), " ");
  }
}
function FundingRatesComponent_Conditional_54_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 87)(1, "div", 88)(2, "div", 89);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "div", 90)(5, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "span", 93);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](10, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](15, "span", 93);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16, "\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](21, "div", 94);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](22, FundingRatesComponent_Conditional_54_For_7_Conditional_22_Template, 2, 3, "div", 95)(23, FundingRatesComponent_Conditional_54_For_7_Conditional_23_Template, 2, 3, "div", 95);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 96)(25, "ui-button", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_54_For_7_Template_ui_button_clicked_25_listener() {
      const sub_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r16).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.startSubscriptionNow(sub_r17.subscriptionId));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "ui-button", 97);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_54_For_7_Template_ui_button_clicked_27_listener() {
      const sub_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r16).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.editSubscription(sub_r17));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](29, "ui-button", 97);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_54_For_7_Template_ui_button_clicked_29_listener() {
      const sub_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r16).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.unsubscribe(sub_r17.subscriptionId));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](30);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const sub_r17 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](sub_r17.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.subscriptions.type"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", sub_r17.positionType === "short")("negative", sub_r17.positionType === "long");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", sub_r17.positionType.toUpperCase(), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.subscriptions.rate"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.formatFundingRate(sub_r17.fundingRate.toString()));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.subscriptions.quantity"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](sub_r17.quantity);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](sub_r17.countdown !== undefined ? 22 : 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.startNow"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.edit"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.cancel"), " ");
  }
}
function FundingRatesComponent_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-card", 36)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 86);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](6, FundingRatesComponent_Conditional_54_For_7_Template, 31, 15, "div", 87, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.subscriptions.title"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](ctx_r1.Array.from(ctx_r1.subscriptions().values()));
  }
}
function FundingRatesComponent_Conditional_55_For_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 100)(1, "div", 101)(2, "div", 102);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "div", 103);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "div", 104)(7, "div", 105)(8, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "div", 105)(13, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](15, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "div", 105)(18, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "div", 105)(23, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "div", 106)(28, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](29);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](30, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](31);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "div", 106)(33, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](36);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](37, "div", 105)(38, "span", 91);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](39);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](40, "span", 92);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const deal_r18 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](deal_r18.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", deal_r18.positionType === "short")("negative", deal_r18.positionType === "long");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", deal_r18.positionType.toUpperCase(), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.fundingRate"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.formatFundingRate(deal_r18.fundingRate.toString()));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.quantity"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](deal_r18.quantity);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.entryPrice"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", deal_r18.entryPrice.toFixed(2), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.hedgeEntry"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", deal_r18.hedgeEntryPrice.toFixed(2), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.fundingEarned"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", deal_r18.fundingEarned > 0)("negative", deal_r18.fundingEarned < 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", deal_r18.fundingEarned.toFixed(4), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.realizedPnl"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("positive", deal_r18.realizedPnl > 0)("negative", deal_r18.realizedPnl < 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", deal_r18.realizedPnl.toFixed(4), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.deals.executed"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.formatTimestamp(deal_r18.executedAt));
  }
}
function FundingRatesComponent_Conditional_55_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "ui-card", 37)(1, "ui-card-header")(2, "ui-card-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "ui-card-content")(5, "div", 99);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](6, FundingRatesComponent_Conditional_55_For_7_Template, 42, 28, "div", 100, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.deals.title"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](ctx_r1.completedDeals());
  }
}
function FundingRatesComponent_Conditional_56_Conditional_57_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 128)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.dialog.loadingBalances") || "Loading balances...");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", ctx_r1.primaryBalance().toFixed(2), " USDT ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.dialog.unavailable") || "N/A", " ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" \u221E (", ctx_r1.translate("fundingRates.dialog.mockExchange"), ") ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", ctx_r1.hedgeBalance().toFixed(2), " USDT ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](0, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Conditional_0_Template, 1, 1)(1, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Conditional_1_Template, 1, 1);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.hedgeBalance() === 999999 ? 0 : 1);
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.dialog.unavailable") || "N/A", " ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 129)(1, "div", 141)(2, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "span", 143);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](5, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_5_Template, 1, 1)(6, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_6_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "div", 141)(8, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "span", 143);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](11, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_11_Template, 2, 1)(12, FundingRatesComponent_Conditional_56_Conditional_58_Conditional_12_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("", ctx_r1.translate("fundingRates.dialog.primary"), " ", ctx_r1.translate("fundingRates.dialog.balance") || "Balance", ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("low-balance", ctx_r1.primaryBalance() !== null && ctx_r1.primaryBalance() < 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.primaryBalance() !== null ? 5 : 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("", ctx_r1.translate("fundingRates.dialog.hedge"), " ", ctx_r1.translate("fundingRates.dialog.balance") || "Balance", ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("low-balance", ctx_r1.hedgeBalance() !== null && ctx_r1.hedgeBalance() < 10 && ctx_r1.hedgeBalance() !== 999999);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.hedgeBalance() !== null ? 11 : 12);
  }
}
function FundingRatesComponent_Conditional_56_Conditional_72_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 136)(1, "h4", 144);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](2, "Position Details");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](3, "div", 145)(4, "div", 146)(5, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6, "Coin Quantity:");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "div", 146)(10, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11, "Estimated Price:");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 146)(15, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16, "Position Value:");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "div", 146)(20, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21, "Leverage:");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 149)(25, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26, "Required Margin (per exchange):");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](29, "div", 146)(30, "span", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](31, "Est. Fees (Entry+Exit):");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "span", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](33);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](34, "p", 150);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](35, " \uD83D\uDCA1 Each exchange needs ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](38, " margin ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("", ctx_r1.positionCalculation().quantity.toFixed(6), " ", ctx_r1.positionCalculation().symbol.replace("USDT", ""), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", ctx_r1.positionCalculation().estimatedPrice.toFixed(2), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", ctx_r1.positionCalculation().positionValue.toFixed(2), " USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.positionCalculation().leverage, "x");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", ctx_r1.positionCalculation().requiredMargin.toFixed(2), " USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", ctx_r1.positionCalculation().estimatedFee.toFixed(2), " USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("$", ctx_r1.positionCalculation().requiredMargin.toFixed(2), " USDT");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_81_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"](" ", ctx_r1.hedgeCredential().exchange, " ", ctx_r1.hedgeCredential().environment, " ");
  }
}
function FundingRatesComponent_Conditional_56_Conditional_82_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.dialog.mockExchange"), " ");
  }
}
function FundingRatesComponent_Conditional_56_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 107);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_56_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSubscriptionDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 108);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_56_Template_div_click_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event.stopPropagation());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 109)(3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "button", 110);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_56_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSubscriptionDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](6, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "div", 111)(8, "div", 112)(9, "div", 113)(10, "span", 114);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](12, "span", 115);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 113)(15, "span", 114);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "span", 116);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "div", 113)(20, "span", 114);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "span", 115);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](24, "div", 113)(25, "span", 114);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](27, "span", 115);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](29, "div", 117)(30, "h4", 118);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](31);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](32, "div", 119)(33, "div", 120)(34, "div", 121);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](35);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "div", 122);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](37);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](38, "div", 123);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](39);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](40, "div", 124);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](41);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](42, "div", 125);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](44, "div", 126);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](45, "\u21C4");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](46, "div", 127)(47, "div", 121);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](48);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](49, "div", 122);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](50);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](51, "div", 123);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](52);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](53, "div", 124);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](54);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](55, "div", 125);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](56, " Hedge position (opposite direction) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](57, FundingRatesComponent_Conditional_56_Conditional_57_Template, 3, 1, "div", 128)(58, FundingRatesComponent_Conditional_56_Conditional_58_Template, 13, 10, "div", 129);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](59, "div", 130)(60, "div", 131)(61, "label", 132);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](62, "Margin (USDT)");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](63, "input", 133);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("ngModelChange", function FundingRatesComponent_Conditional_56_Template_input_ngModelChange_63_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.positionSizeUsdt.set($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](64, "p", 134);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](66, "div", 131)(67, "label", 132);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](68);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](69, "input", 135);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("ngModelChange", function FundingRatesComponent_Conditional_56_Template_input_ngModelChange_69_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.dialogLeverage.set($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](70, "p", 134);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](71);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](72, FundingRatesComponent_Conditional_56_Conditional_72_Template, 39, 8, "div", 136);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](73, "div", 137)(74, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](75);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](76, "ul")(77, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](78);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](79, "li");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](80);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](81, FundingRatesComponent_Conditional_56_Conditional_81_Template, 1, 2)(82, FundingRatesComponent_Conditional_56_Conditional_82_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](83, "div", 138)(84, "ui-button", 139);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_56_Template_ui_button_clicked_84_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSubscriptionDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](85);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](86, "ui-button", 140);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_56_Template_ui_button_clicked_86_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r19);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.subscribeFundingRate());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](87);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    let tmp_33_0;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.editingSubscription() ? "Edit Subscription" : ctx_r1.translate("fundingRates.dialog.title"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.dialog.symbol"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.selectedTicker().symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.dialog.fundingRate"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngClass", ctx_r1.getFundingRateClass(ctx_r1.selectedTicker().fundingRate));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.formatFundingRate(ctx_r1.selectedTicker().fundingRate), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.dialog.nextFunding"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.formatNextFundingTime(ctx_r1.selectedTicker().nextFundingTime));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.dialog.positionType"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0 ? ctx_r1.translate("fundingRates.dialog.longReceive") : ctx_r1.translate("fundingRates.dialog.shortReceive"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.dialog.positionsToOpen"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.dialog.primaryPosition"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("long-position", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0)("short-position", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) >= 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0 ? "LONG" : "SHORT", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", (ctx_r1.positionSizeUsdt() || 0) * ctx_r1.dialogLeverage(), " USDT ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" Margin: $", ctx_r1.positionSizeUsdt() || 0, " USDT ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0 ? "Receive funding payments" : "Pay funding to receive later", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.dialog.hedgePosition"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("long-position", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) >= 0)("short-position", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.parseFloat(ctx_r1.selectedTicker().fundingRate) < 0 ? "SHORT" : "LONG", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" $", (ctx_r1.positionSizeUsdt() || 0) * ctx_r1.dialogLeverage(), " USDT ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" Margin: $", ctx_r1.positionSizeUsdt() || 0, " USDT ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.isLoadingBalances() ? 57 : 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngModel", ctx_r1.positionSizeUsdt());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"]("Your collateral amount. With ", ctx_r1.dialogLeverage(), "x leverage, this will open a position worth $", (ctx_r1.positionSizeUsdt() || 0) * ctx_r1.dialogLeverage(), " USDT");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.leverage"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngModel", ctx_r1.dialogLeverage());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate3"]("Leverage for this position (1-125x). With ", ctx_r1.dialogLeverage(), "x leverage, $", ctx_r1.positionSizeUsdt() || 0, " margin opens a $", (ctx_r1.positionSizeUsdt() || 0) * ctx_r1.dialogLeverage(), " USDT position.");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.positionCalculation() ? 72 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("\u26A0\uFE0F ", ctx_r1.translate("fundingRates.dialog.warning"), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate3"]("", ctx_r1.translate("fundingRates.dialog.primary"), ": ", (tmp_33_0 = ctx_r1.selectedCredential()) == null ? null : tmp_33_0.exchange, " ", (tmp_33_0 = ctx_r1.selectedCredential()) == null ? null : tmp_33_0.environment, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("", ctx_r1.translate("fundingRates.dialog.hedge"), ": ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.hedgeCredential() ? 81 : 82);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.cancel"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("loading", ctx_r1.isSubscribing());
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.editingSubscription() ? "Save Changes" : ctx_r1.translate("fundingRates.actions.subscribe"), " ");
  }
}
function FundingRatesComponent_Conditional_57_For_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 152);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const notification_r20 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("success", notification_r20.includes("[SUCCESS]"))("error", notification_r20.includes("[ERROR]"))("info", notification_r20.includes("[INFO]"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", notification_r20.replace("[SUCCESS] ", "").replace("[ERROR] ", "").replace("[INFO] ", ""), " ");
  }
}
function FundingRatesComponent_Conditional_57_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterCreate"](1, FundingRatesComponent_Conditional_57_For_2_Template, 2, 7, "div", 151, _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeaterTrackByIdentity"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrepeater"](ctx_r1.notifications());
  }
}
function FundingRatesComponent_Conditional_58_Conditional_50_Template(rf, ctx) {
  if (rf & 1) {
    const _r22 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 170)(1, "label", 171);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "svg", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](3, "path", 193)(4, "path", 194);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "input", 195);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Conditional_50_Template_input_ngModelChange_6_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r22);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().autoCancelThreshold, $event) || (ctx_r1.subscriptionSettings().autoCancelThreshold = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](7, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.settings.autoCancelThreshold"), " (%) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().autoCancelThreshold);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.autoCancelThresholdHelp"));
  }
}
function FundingRatesComponent_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 153);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_58_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSettingsDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](1, "div", 154);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_58_Template_div_click_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event.stopPropagation());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](2, "div", 155)(3, "div", 156)(4, "div", 157);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](5, "svg", 158);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](6, "path", 159)(7, "path", 160);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](8, "h3", 161);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](10, "button", 162);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Conditional_58_Template_button_click_10_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSettingsDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](11, "svg", 163);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](12, "path", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](13, "div", 164)(14, "div", 165)(15, "div", 166);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](16, "svg", 167);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](17, "path", 168);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](18, "h4", 169);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](19, "Trading Configuration");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](20, "div", 170)(21, "label", 171);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](22, "svg", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](23, "path", 173);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "input", 174);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Template_input_ngModelChange_25_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().defaultQuantity, $event) || (ctx_r1.subscriptionSettings().defaultQuantity = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](26, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "div", 170)(29, "label", 171);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](30, "svg", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](31, "path", 176);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "input", 177);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Template_input_ngModelChange_33_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().leverage, $event) || (ctx_r1.subscriptionSettings().leverage = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](34, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](35);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "div", 165)(37, "div", 166);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](38, "svg", 167);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](39, "path", 178);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](40, "h4", 169);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](41, "Auto-Cancel Settings");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](42, "div", 170)(43, "label", 179)(44, "input", 180);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Template_input_ngModelChange_44_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().enableAutoCancel, $event) || (ctx_r1.subscriptionSettings().enableAutoCancel = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](45, "span", 181);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](46, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](47);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](48, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](49);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](50, FundingRatesComponent_Conditional_58_Conditional_50_Template, 9, 3, "div", 170);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](51, "div", 165)(52, "div", 166);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](53, "svg", 167);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](54, "path", 176);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](55, "h4", 169);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](56, "Execution Settings");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](57, "div", 170)(58, "label", 171);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](59, "svg", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](60, "path", 182)(61, "path", 183);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](62);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](63, "input", 184);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Template_input_ngModelChange_63_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().executionDelay, $event) || (ctx_r1.subscriptionSettings().executionDelay = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](64, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](65);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](66, "div", 170)(67, "label", 171);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](68, "svg", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](69, "path", 185);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](70);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](71, "input", 186);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Conditional_58_Template_input_ngModelChange_71_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx_r1.subscriptionSettings().arbitrageSpreadThreshold, $event) || (ctx_r1.subscriptionSettings().arbitrageSpreadThreshold = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](72, "p", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](73);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](74, "div", 187)(75, "ui-button", 139);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_58_Template_ui_button_clicked_75_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.closeSettingsDialog());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](76);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](77, "ui-button", 188);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Conditional_58_Template_ui_button_clicked_77_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵrestoreView"](_r21);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵresetView"](ctx_r1.saveSettings());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](78, "span", 189);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](79, "svg", 190);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](80, "path", 191)(81, "path", 192);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](82);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.title"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"](" ", ctx_r1.translate("fundingRates.settings.defaultQuantity"), " (", ctx_r1.translate("fundingRates.dialog.coins"), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().defaultQuantity);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.defaultQuantityHelp"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.settings.leverage"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().leverage);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.leverageHelp"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().enableAutoCancel);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.enableAutoCancel"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.autoCancelHelp"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx_r1.subscriptionSettings().enableAutoCancel ? 50 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate2"](" ", ctx_r1.translate("fundingRates.settings.executionDelay"), " (", ctx_r1.translate("fundingRates.dialog.seconds"), ") ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().executionDelay);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.executionDelayHelp"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.settings.arbitrageSpreadThreshold"), " (%) ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx_r1.subscriptionSettings().arbitrageSpreadThreshold);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx_r1.translate("fundingRates.settings.arbitrageSpreadThresholdHelp"));
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.cancel"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("fundingRates.actions.save"), " ");
  }
}
/**
 * Enhanced Funding Rates Component
 *
 * Displays real-time funding rates with advanced filtering and exchange selection.
 * Features:
 * - Multi-exchange credential selection
 * - Filter by funding rate (min/max)
 * - Filter by next funding time
 * - Auto-refresh every 30 seconds
 * - Sortable columns
 * - Annualized rate calculation
 */
let FundingRatesComponent = /*#__PURE__*/(() => {
  class FundingRatesComponent {
    constructor() {
      this.http = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpClient);
      this.authService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_services_auth_service__WEBPACK_IMPORTED_MODULE_1__.AuthService);
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_2__.TranslationService);
      this.cdr = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_6__.ChangeDetectorRef);
      // Expose utilities to template
      this.Array = Array;
      this.parseFloat = parseFloat;
      // State
      this.tickers = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([]);
      this.credentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([]);
      this.isLoading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.isLoadingCredentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.error = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.selectedCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.hedgeCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null); // For arbitrage subscriptions
      this.autoRefreshEnabled = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(true);
      // Balance and position information for subscription dialog
      this.primaryBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.hedgeBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.isLoadingBalances = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      // Filter state
      this.searchQuery = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)('');
      this.positionType = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)('all');
      this.minAbsFundingRate = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.maxNextFundingHours = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      // Subscription state
      this.subscriptions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(new Map());
      this.completedDeals = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([]);
      this.notifications = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([]);
      this.showSubscriptionDialog = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.selectedTicker = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.positionSizeUsdt = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(100); // Changed from subscriptionQuantity to USDT-based
      this.dialogLeverage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(3); // Dialog-specific leverage (separate from global settings)
      this.isSubscribing = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.editingSubscription = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.startingSubscriptionId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null); // Track which subscription is being started
      // Row expansion state
      this.expandedRows = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(new Set());
      // Arbitrage state
      this.arbitrageOpportunities = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([]);
      this.isLoadingArbitrage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.arbitrageError = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null);
      this.showArbitrageSection = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(true);
      this.arbitrageFiltersCollapsed = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      this.arbitrageSearchQuery = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(''); // Symbol search filter for arbitrage table
      this.minSpreadThreshold = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(null); // Minimum spread threshold in percentage
      this.showOnlySubscribedArbitrage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false); // Filter to show only subscribed pairs
      // Subscription settings
      this.subscriptionSettings = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)({
        defaultQuantity: 0.01,
        leverage: 3,
        autoCancelThreshold: 0.003,
        enableAutoCancel: true,
        executionDelay: 5,
        // Default: execute 5 seconds before funding
        arbitrageSpreadThreshold: null // Default: no minimum spread threshold
      });
      this.showSettingsDialog = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      // Multi-sort state
      this.sortColumns = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)([{
        column: 'fundingRate',
        direction: 'desc'
      }]);
      // UI state
      this.isFiltersCollapsed = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.signal)(false);
      // Computed
      this.credentialOptions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        // Only show active credentials
        return this.credentials().filter(cred => cred.isActive).map(cred => ({
          value: cred.id,
          label: cred.label || `${cred.exchange} (${cred.environment})`,
          disabled: false
        }));
      });
      this.selectedCredential = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const id = this.selectedCredentialId();
        return this.credentials().find(c => c.id === id);
      });
      this.hedgeCredential = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const id = this.hedgeCredentialId();
        return id ? this.credentials().find(c => c.id === id) : null;
      });
      this.filteredTickers = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        let filtered = [...this.tickers()];
        // Filter out pairs with no funding rate
        filtered = filtered.filter(t => {
          const fundingRate = parseFloat(t.fundingRate);
          return !isNaN(fundingRate) && t.fundingRate !== '' && t.fundingRate !== null && t.fundingRate !== undefined;
        });
        // Filter out pairs with no price movement (0% change in 24h)
        filtered = filtered.filter(t => {
          const priceChange = parseFloat(t.price24hPcnt);
          return !isNaN(priceChange) && priceChange !== 0;
        });
        // Filter by search query (symbol name)
        const search = this.searchQuery().trim().toUpperCase();
        if (search) {
          filtered = filtered.filter(t => t.symbol.toUpperCase().includes(search));
        }
        // Filter by position type (long/short)
        const posType = this.positionType();
        if (posType === 'long') {
          // Long positions: filter for NEGATIVE funding rates (you receive funding)
          filtered = filtered.filter(t => parseFloat(t.fundingRate) < 0);
        } else if (posType === 'short') {
          // Short positions: filter for POSITIVE funding rates (you receive funding)
          filtered = filtered.filter(t => parseFloat(t.fundingRate) > 0);
        }
        // Filter by minimum absolute funding rate
        const minAbsRate = this.minAbsFundingRate();
        if (minAbsRate !== null) {
          filtered = filtered.filter(t => Math.abs(parseFloat(t.fundingRate) * 100) >= minAbsRate);
        }
        // Filter by next funding time
        const maxHours = this.maxNextFundingHours();
        if (maxHours !== null) {
          const now = Date.now();
          const maxTime = now + maxHours * 60 * 60 * 1000;
          filtered = filtered.filter(t => {
            const fundingTime = parseInt(t.nextFundingTime);
            return fundingTime <= maxTime;
          });
        }
        return filtered;
      });
      this.sortedTickers = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const tickers = [...this.filteredTickers()];
        const sortCols = this.sortColumns();
        if (sortCols.length === 0) {
          return tickers;
        }
        return tickers.sort((a, b) => {
          // Apply each sort column in order
          for (const {
            column,
            direction
          } of sortCols) {
            let aVal = a[column];
            let bVal = b[column];
            // Parse numbers for numeric columns
            if (column !== 'symbol') {
              aVal = parseFloat(aVal) || 0;
              bVal = parseFloat(bVal) || 0;
            }
            // Compare values
            let comparison = 0;
            if (aVal > bVal) {
              comparison = 1;
            } else if (aVal < bVal) {
              comparison = -1;
            }
            // If values are different, apply direction and return
            if (comparison !== 0) {
              return direction === 'asc' ? comparison : -comparison;
            }
            // If values are equal, continue to next sort column
          }
          return 0; // All sort columns equal
        });
      });
      /**
       * Check if a ticker meets the auto-subscribe threshold
       */
      this.meetsAutoSubscribeThreshold = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const settings = this.subscriptionSettings();
        const tickers = this.sortedTickers();
        const threshold = settings.autoCancelThreshold;
        if (threshold === null || threshold === undefined) {
          return new Set();
        }
        const eligibleSymbols = new Set();
        tickers.forEach(ticker => {
          const fundingRate = parseFloat(ticker.fundingRate);
          const absFundingRate = Math.abs(fundingRate);
          // Symbol meets threshold if absolute funding rate is >= threshold
          if (absFundingRate >= Math.abs(threshold)) {
            eligibleSymbols.add(ticker.symbol);
          }
        });
        return eligibleSymbols;
      });
      /**
       * Filtered arbitrage opportunities based on symbol search, spread threshold, and subscription status
       */
      this.filteredArbitrageOpportunities = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        let opportunities = [...this.arbitrageOpportunities()];
        // Filter by symbol search query
        const search = this.arbitrageSearchQuery().trim().toUpperCase();
        if (search) {
          opportunities = opportunities.filter(opp => opp.symbol.toUpperCase().includes(search));
        }
        // Filter by minimum spread threshold
        const minSpread = this.minSpreadThreshold();
        if (minSpread !== null && minSpread > 0) {
          opportunities = opportunities.filter(opp => {
            const spreadPercent = parseFloat(opp.spread) * 100;
            return spreadPercent >= minSpread;
          });
        }
        // Filter by subscription status (show only subscribed pairs)
        if (this.showOnlySubscribedArbitrage()) {
          opportunities = opportunities.filter(opp => this.hasArbitrageSubscription(opp.symbol));
        }
        return opportunities;
      });
      /**
       * Set of symbols with active subscriptions for efficient lookup
       */
      this.subscribedSymbols = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const subs = Array.from(this.subscriptions().values());
        const symbols = new Set(subs.map(sub => sub.symbol));
        console.log('[subscribedSymbols] Computed signal updated. Active symbols:', Array.from(symbols));
        return symbols;
      });
      /**
       * Map of symbol to subscription for quick lookup in arbitrage table
       */
      this.symbolToSubscription = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const subs = Array.from(this.subscriptions().values());
        const map = new Map();
        subs.forEach(sub => {
          // Normalize symbol format (remove hyphens for comparison)
          const normalizedSymbol = sub.symbol.replace(/-/g, '');
          map.set(normalizedSymbol, sub);
        });
        console.log('[symbolToSubscription] Map keys:', Array.from(map.keys()));
        return map;
      });
      /**
       * Position validation error - tracks why position calculation might fail
       */
      this.positionValidationError = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const ticker = this.selectedTicker();
        const positionSizeUsdt = this.positionSizeUsdt();
        if (!ticker) {
          return 'No symbol selected';
        }
        if (!positionSizeUsdt || positionSizeUsdt <= 0) {
          return 'Invalid position size';
        }
        // Check if price data is available
        const lastPrice = parseFloat(ticker.lastPrice) || 0;
        const markPrice = parseFloat(ticker.markPrice) || 0;
        if (lastPrice === 0 && markPrice === 0) {
          return `No price data available for ${ticker.symbol}. This symbol may not be actively traded or may be delisted.`;
        }
        return null;
      });
      /**
       * Position calculation computed signal - automatically recalculates when dependencies change
       * Uses dialogLeverage for dialog-specific leverage (separate from global settings)
       */
      this.positionCalculation = (0,_angular_core__WEBPACK_IMPORTED_MODULE_6__.computed)(() => {
        const ticker = this.selectedTicker();
        const positionSizeUsdt = this.positionSizeUsdt();
        const leverage = this.dialogLeverage(); // Use dialog-specific leverage
        console.log('[positionCalculation] Computing with:', {
          ticker: ticker?.symbol,
          positionSizeUsdt,
          leverage,
          tickerLastPrice: ticker?.lastPrice,
          tickerMarkPrice: ticker?.markPrice
        });
        if (!ticker || !positionSizeUsdt || positionSizeUsdt <= 0) {
          console.log('[positionCalculation] Returning null - missing dependencies');
          return null;
        }
        // Use last price or mark price as estimate
        const estimatedPrice = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
        if (estimatedPrice === 0) {
          console.log('[positionCalculation] Returning null - price is 0');
          return null;
        }
        // positionSizeUsdt is the margin (your own money)
        // With leverage, actual position value = margin * leverage
        const margin = positionSizeUsdt;
        const positionValue = margin * leverage;
        // Calculate quantity from position value: quantity = positionValue / price
        const quantity = positionValue / estimatedPrice;
        // Estimate trading fee (typical taker fee: 0.055% for Bybit, 0.05% for BingX)
        // For both entry and exit, fee = position value * 0.00055 * 2
        const estimatedFee = positionValue * 0.00055 * 2; // Entry + Exit
        const result = {
          symbol: ticker.symbol,
          quantity,
          estimatedPrice,
          positionValue,
          requiredMargin: margin,
          estimatedFee,
          leverage
        };
        console.log('[positionCalculation] Returning:', result);
        return result;
      });
    }
    ngOnInit() {
      this.loadSettings();
      this.loadCredentials();
      this.loadSubscriptions();
      this.loadArbitrageOpportunities(); // Load cross-exchange arbitrage data
      this.startAutoCancelChecker();
      this.syncSettingsToFilters();
    }
    ngOnDestroy() {
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
      }
      if (this.autoCancelInterval) {
        clearInterval(this.autoCancelInterval);
      }
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    loadCredentials() {
      this.isLoadingCredentials.set(true);
      const token = this.authService.authState().token;
      if (!token) {
        this.error.set('Authentication required');
        this.isLoadingCredentials.set(false);
        return;
      }
      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get('http://localhost:3000/api/exchange-credentials', {
        headers
      }).subscribe({
        next: response => {
          console.log('Credentials response:', response);
          if (response.success && response.data) {
            // API returns { credentials: [], totalCount: number }
            const credentialsArray = response.data.credentials || [];
            console.log('Credentials array:', credentialsArray);
            // Filter for Bybit and BingX credentials (supported exchanges)
            // AND only active credentials
            const supportedCreds = credentialsArray.filter(c => (c.exchange === 'BYBIT' || c.exchange === 'BINGX') && c.isActive === true);
            this.credentials.set(supportedCreds);
            console.log('Active credentials:', supportedCreds);
            // Auto-select first credential (all are active now)
            const defaultCred = supportedCreds[0];
            if (defaultCred) {
              this.selectedCredentialId.set(defaultCred.id);
              this.loadTickers();
              this.setupAutoRefresh();
            } else {
              console.warn('No active Bybit or BingX credentials found');
            }
          }
          this.isLoadingCredentials.set(false);
        },
        error: err => {
          console.error('Failed to load credentials:', err);
          this.error.set('Failed to load exchange credentials');
          this.isLoadingCredentials.set(false);
        }
      });
    }
    onCredentialChange(credentialId) {
      this.selectedCredentialId.set(credentialId);
      this.loadTickers();
    }
    setupAutoRefresh() {
      if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
      }
      if (this.autoRefreshEnabled()) {
        // Refresh every 3 minutes (180 seconds)
        this.refreshSubscription = (0,rxjs__WEBPACK_IMPORTED_MODULE_8__.interval)(180000).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_9__.startWith)(0), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_10__.switchMap)(() => this.loadTickersAsync())).subscribe();
      }
    }
    toggleAutoRefresh() {
      this.autoRefreshEnabled.update(v => !v);
      this.setupAutoRefresh();
    }
    loadTickers() {
      this.loadTickersAsync().subscribe();
    }
    loadTickersAsync() {
      var _this = this;
      const credential = this.selectedCredential();
      if (!credential) {
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(null);
      }
      // Prevent concurrent loading - skip if already loading
      if (this.isLoading()) {
        console.log('[FundingRates] Skipping refresh - already loading');
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(null);
      }
      this.isLoading.set(true);
      this.error.set(null);
      const token = this.authService.authState().token;
      if (!token) {
        this.error.set('Authentication required');
        this.isLoading.set(false);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(null);
      }
      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const exchange = credential.exchange;
      const credentialId = credential.id;
      // Determine API endpoint based on exchange
      // Pass credentialId to use the specific selected credential
      let apiUrl = '';
      if (exchange === 'BYBIT') {
        apiUrl = `http://localhost:3000/api/bybit/tickers?category=linear&credentialId=${credentialId}`;
      } else if (exchange === 'BINGX') {
        apiUrl = `http://localhost:3000/api/bingx/tickers?credentialId=${credentialId}`;
      } else {
        this.error.set(`Unsupported exchange: ${exchange}`);
        this.isLoading.set(false);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.of)(null);
      }
      return this.http.get(apiUrl, {
        headers
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_10__.switchMap)(/*#__PURE__*/function () {
        var _ref = (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* (response) {
          try {
            if (response.success) {
              // Map BingX ticker format to match Bybit format if needed
              let tickers = exchange === 'BINGX' ? _this.mapBingXTickers(response.data) : response.data;
              // For BingX, fetch funding rates separately and merge
              if (exchange === 'BINGX') {
                console.log('[BingX] Starting to merge funding rates...');
                tickers = yield _this.mergeBingXFundingRates(tickers, headers, credentialId);
                console.log('[BingX] Funding rates merged, updating table...');
              }
              _this.tickers.set(tickers);
              _this.isLoading.set(false);
              console.log(`[FundingRates] Updated ${tickers.length} tickers`);
            } else {
              _this.error.set(response.message || 'Failed to load tickers');
              _this.isLoading.set(false);
            }
            return response;
          } catch (error) {
            console.error('[FundingRates] Error in loadTickersAsync:', error);
            _this.error.set(error.message || 'Failed to load data');
            _this.isLoading.set(false);
            return null;
          }
        });
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()));
    }
    /**
     * Fetch BingX funding rates and merge with ticker data
     */
    mergeBingXFundingRates(tickers, headers, credentialId) {
      var _this2 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        try {
          console.log('[BingX] Fetching funding rates for', tickers.length, 'symbols...');
          const fundingUrl = `${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_5__.getEndpointUrl)('bingx', 'fundingRates')}?credentialId=${credentialId}`;
          const fundingResponse = yield _this2.http.get(fundingUrl, {
            headers
          }).toPromise();
          console.log('[BingX] Funding rates response:', fundingResponse);
          if (fundingResponse?.success && fundingResponse?.data) {
            console.log('[BingX] Received', fundingResponse.data.length, 'funding rates');
            const fundingMap = new Map();
            fundingResponse.data.forEach(fr => {
              fundingMap.set(fr.symbol, fr);
            });
            // Merge funding rates into tickers
            const mergedTickers = tickers.map(ticker => {
              const funding = fundingMap.get(ticker.symbol);
              if (funding) {
                return {
                  ...ticker,
                  fundingRate: funding.fundingRate || '0',
                  nextFundingTime: funding.fundingTime ? funding.fundingTime.toString() : '0'
                };
              }
              return ticker;
            });
            console.log('[BingX] Merged funding rates into', mergedTickers.length, 'tickers');
            return mergedTickers;
          } else {
            console.warn('[BingX] Invalid funding rates response:', fundingResponse);
          }
        } catch (error) {
          console.error('[BingX] Failed to fetch funding rates:', error);
        }
        console.log('[BingX] Returning original tickers without funding rates');
        return tickers;
      })();
    }
    /**
     * Map BingX ticker format to Bybit ticker format for consistent display
     */
    mapBingXTickers(bingxTickers) {
      return bingxTickers.map(ticker => ({
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice || '0',
        indexPrice: ticker.lastPrice || '0',
        // BingX doesn't have indexPrice, use lastPrice
        markPrice: ticker.lastPrice || '0',
        prevPrice24h: ticker.openPrice || '0',
        price24hPcnt: ticker.priceChangePercent ? (parseFloat(ticker.priceChangePercent) / 100).toString() : '0',
        highPrice24h: ticker.highPrice || '0',
        lowPrice24h: ticker.lowPrice || '0',
        prevPrice1h: ticker.openPrice || '0',
        // BingX doesn't have 1h price
        openInterest: '0',
        // BingX doesn't provide this in ticker
        openInterestValue: '0',
        turnover24h: ticker.quoteVolume || '0',
        volume24h: ticker.volume || '0',
        fundingRate: '0',
        // BingX doesn't include funding rate in tickers - need separate call
        nextFundingTime: '0',
        predictedDeliveryPrice: '0',
        basisRate: '0',
        deliveryFeeRate: '0',
        deliveryTime: '0',
        ask1Size: '0',
        bid1Price: '0',
        ask1Price: '0',
        bid1Size: '0'
      }));
    }
    /**
     * Load arbitrage opportunities from all exchanges
     */
    loadArbitrageOpportunities() {
      const token = this.authService.authState().token;
      if (!token) {
        this.arbitrageError.set('Authentication required');
        return;
      }
      this.isLoadingArbitrage.set(true);
      this.arbitrageError.set(null);
      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const arbitrageUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_5__.getEndpointUrl)('arbitrage', 'fundingRates');
      this.http.get(arbitrageUrl, {
        headers
      }).subscribe({
        next: response => {
          if (response.success) {
            this.arbitrageOpportunities.set(response.data || []);
            console.log(`[Arbitrage] Loaded ${response.data?.length || 0} opportunities`);
            console.log('[Arbitrage] Opportunity symbols:', response.data?.map(o => o.symbol));
            console.log('[Arbitrage] First opportunity sample:', response.data?.[0]);
          } else {
            this.arbitrageError.set(response.message || 'Failed to load arbitrage data');
          }
          this.isLoadingArbitrage.set(false);
        },
        error: error => {
          console.error('[Arbitrage] Error loading opportunities:', error);
          this.arbitrageError.set(error.message || 'Failed to load arbitrage data');
          this.isLoadingArbitrage.set(false);
        }
      });
    }
    toggleArbitrageSection() {
      this.showArbitrageSection.update(v => !v);
    }
    toggleArbitrageFilters() {
      this.arbitrageFiltersCollapsed.update(v => !v);
    }
    clearArbitrageFilters() {
      this.arbitrageSearchQuery.set('');
      this.minSpreadThreshold.set(null);
      this.showOnlySubscribedArbitrage.set(false);
    }
    /**
     * Cancel all active subscriptions
     * Always fetches fresh subscription data from server and deletes all of them
     */
    cancelAllSubscriptions() {
      var _this3 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        try {
          const token = _this3.authService.authState().token;
          if (!token) {
            _this3.showNotification('Authentication required', 'error');
            return;
          }
          const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
          // Step 1: Fetch all subscriptions from server (to ensure we have the complete list)
          const response = yield _this3.http.get('http://localhost:3000/api/funding-arbitrage/subscribe', {
            headers
          }).toPromise();
          if (!response?.success || !response?.data) {
            _this3.showNotification('Failed to fetch subscriptions from server', 'error');
            return;
          }
          // Filter only active subscriptions (not completed)
          const serverSubscriptions = response.data.filter(sub => sub.status !== 'COMPLETED');
          if (serverSubscriptions.length === 0) {
            _this3.showNotification('No active subscriptions found on server', 'info');
            // Still clear local state
            _this3.subscriptions.set(new Map());
            return;
          }
          // Step 2: Show confirmation dialog with server count
          const confirmed = confirm(`Are you sure you want to cancel ALL ${serverSubscriptions.length} active subscriptions?\n\n` + `This will delete all subscriptions from the database.\n` + `This action cannot be undone.`);
          if (!confirmed) {
            return;
          }
          // Step 3: Delete all subscriptions in parallel
          console.log('[cancelAllSubscriptions] Deleting', serverSubscriptions.length, 'subscriptions');
          const cancelPromises = serverSubscriptions.map(sub => _this3.http.delete(`http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${sub.subscriptionId}`, {
            headers
          }).toPromise());
          yield Promise.all(cancelPromises);
          // Step 4: Clear local state
          _this3.subscriptions.set(new Map());
          _this3.showNotification(`Successfully cancelled all ${serverSubscriptions.length} subscriptions`, 'success');
          // Reload subscriptions to verify they're gone
          _this3.loadSubscriptions();
        } catch (error) {
          console.error('Error cancelling all subscriptions:', error);
          _this3.showNotification('Failed to cancel some subscriptions. Please try again.', 'error');
          // Reload subscriptions to get current state
          _this3.loadSubscriptions();
        }
      })();
    }
    /**
     * Sort by column with multi-sort support
     * - Click: Single column sort (replaces all)
     * - Shift+Click: Add column to multi-sort
     * - Click same column: Toggle direction
     */
    sortBy(column, event) {
      const currentSorts = this.sortColumns();
      const existingIndex = currentSorts.findIndex(s => s.column === column);
      if (event?.shiftKey) {
        // Shift+Click: Add to multi-sort or toggle existing
        if (existingIndex >= 0) {
          // Toggle direction of existing sort
          const updated = [...currentSorts];
          updated[existingIndex] = {
            column,
            direction: updated[existingIndex].direction === 'asc' ? 'desc' : 'asc'
          };
          this.sortColumns.set(updated);
        } else {
          // Add new sort column
          this.sortColumns.set([...currentSorts, {
            column,
            direction: 'desc'
          }]);
        }
      } else {
        // Regular click: Single column sort
        if (existingIndex === 0 && currentSorts.length === 1) {
          // Same column, toggle direction
          this.sortColumns.set([{
            column,
            direction: currentSorts[0].direction === 'asc' ? 'desc' : 'asc'
          }]);
        } else {
          // New column, default to descending
          this.sortColumns.set([{
            column,
            direction: 'desc'
          }]);
        }
      }
    }
    /**
     * Get sort info for a column (for display)
     */
    getSortInfo(column) {
      const sorts = this.sortColumns();
      const index = sorts.findIndex(s => s.column === column);
      if (index === -1) return null;
      return {
        index,
        direction: sorts[index].direction
      };
    }
    /**
     * Clear all sorting
     */
    clearSort() {
      this.sortColumns.set([{
        column: 'fundingRate',
        direction: 'desc'
      }]);
    }
    clearFilters() {
      this.searchQuery.set('');
      this.positionType.set('all');
      this.minAbsFundingRate.set(null);
      this.maxNextFundingHours.set(null);
    }
    toggleFiltersCollapsed() {
      this.isFiltersCollapsed.update(v => !v);
    }
    formatPrice(price) {
      const num = parseFloat(price);
      if (isNaN(num)) return '-';
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      });
    }
    formatFundingRate(rate) {
      const num = parseFloat(rate);
      if (isNaN(num)) return '-';
      const percentage = (num * 100).toFixed(4);
      return `${percentage}%`;
    }
    formatAnnualizedRate(rate) {
      const num = parseFloat(rate);
      if (isNaN(num)) return '-';
      // Bybit charges funding every 8 hours (3 times per day)
      const annualized = num * 3 * 365 * 100;
      return `${annualized.toFixed(2)}%`;
    }
    formatPercent(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '-';
      const percentage = (num * 100).toFixed(2);
      return `${num >= 0 ? '+' : ''}${percentage}%`;
    }
    formatNextFundingTime(timestamp) {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) return '-';
      const date = new Date(ts);
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      if (diff < 0) return 'Expired';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    formatVolume(volume) {
      const num = parseFloat(volume);
      if (isNaN(num)) return '-';
      if (num >= 1000000000) {
        return `$${(num / 1000000000).toFixed(2)}B`;
      } else if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(2)}K`;
      }
      return `$${num.toFixed(2)}`;
    }
    getFundingRateClass(rate) {
      const num = parseFloat(rate);
      if (isNaN(num)) return '';
      if (num > 0) return 'funding-positive';
      if (num < 0) return 'funding-negative';
      return 'funding-neutral';
    }
    getPercentClass(value) {
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      if (num > 0) return 'percent-positive';
      if (num < 0) return 'percent-negative';
      return '';
    }
    /**
     * Check if a ticker meets the auto-subscribe threshold
     */
    tickerMeetsThreshold(symbol) {
      return this.meetsAutoSubscribeThreshold().has(symbol);
    }
    /**
     * Get the recommended position type based on funding rate
     * Long if funding is negative (you receive funding)
     * Short if funding is positive (you receive funding)
     */
    getRecommendedPositionType(ticker) {
      const fundingRate = parseFloat(ticker.fundingRate);
      return fundingRate < 0 ? 'long' : 'short';
    }
    /**
     * Start subscription execution immediately (manual trigger)
     */
    startSubscriptionNow(subscriptionId) {
      var _this4 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        // Prevent duplicate executions
        if (_this4.startingSubscriptionId() === subscriptionId) {
          console.log('Already starting this subscription, ignoring duplicate request');
          return;
        }
        try {
          _this4.startingSubscriptionId.set(subscriptionId);
          const token = _this4.authService.authState().token;
          if (!token) {
            _this4.showNotification('Authentication required', 'error');
            _this4.startingSubscriptionId.set(null);
            return;
          }
          const response = yield fetch(`/api/funding-arbitrage/execute/${subscriptionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          const result = yield response.json();
          if (result.success) {
            _this4.showNotification('Subscription execution started!', 'success');
            _this4.loadSubscriptions();
          } else {
            _this4.showNotification(`Failed to start: ${result.message || result.error}`, 'error');
          }
        } catch (error) {
          console.error('Start subscription error:', error);
          _this4.showNotification('Failed to start subscription execution', 'error');
        } finally {
          _this4.startingSubscriptionId.set(null);
        }
      })();
    }
    /**
     * Open subscription dialog for funding rate
     */
    openSubscriptionDialog(ticker, event) {
      event.stopPropagation();
      this.selectedTicker.set(ticker);
      this.dialogLeverage.set(this.subscriptionSettings().leverage); // Initialize with global setting
      this.showSubscriptionDialog.set(true);
      this.positionSizeUsdt.set(100); // Default position size in USDT
    }
    /**
     * Close subscription dialog
     */
    closeSubscriptionDialog() {
      this.showSubscriptionDialog.set(false);
      this.selectedTicker.set(null);
      this.editingSubscription.set(null);
      this.isSubscribing.set(false);
      this.hedgeCredentialId.set(null); // Clear hedge credential
      this.dialogLeverage.set(this.subscriptionSettings().leverage); // Reset to global setting
    }
    /**
     * Toggle row expansion for inline subscription form
     */
    toggleRowExpansion(symbol) {
      const expanded = new Set(this.expandedRows());
      if (expanded.has(symbol)) {
        expanded.delete(symbol);
      } else {
        expanded.add(symbol);
        // Pre-fill quantity if there's an existing subscription
        const subscription = this.getActiveSubscription(symbol);
        if (subscription) {
          // Convert quantity back to USDT based on current price (approximate)
          const ticker = this.filteredTickers().find(t => t.symbol === symbol);
          if (ticker) {
            const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
            this.positionSizeUsdt.set(subscription.quantity * price);
          }
          this.editingSubscription.set(subscription);
        }
      }
      this.expandedRows.set(expanded);
    }
    /**
     * Check if row is expanded
     */
    isRowExpanded(symbol) {
      return this.expandedRows().has(symbol);
    }
    /**
     * Get active subscription for a symbol
     */
    getActiveSubscription(symbol) {
      // Find subscription by symbol (subscriptions Map is keyed by subscriptionId)
      const subs = Array.from(this.subscriptions().values());
      return subs.find(sub => sub.symbol === symbol);
    }
    /**
     * Subscribe from inline form or action button
     */
    subscribeFromInlineForm(ticker) {
      this.selectedTicker.set(ticker);
      // Use default quantity or the one set in expanded form
      if (!this.isRowExpanded(ticker.symbol)) {
        this.positionSizeUsdt.set(100); // Default position size in USDT
      }
      this.subscribeFundingRate();
    }
    /**
     * Check if subscription can be started now
     */
    canStartNow(subscription) {
      // Can start now if waiting and more than 1 minute until funding
      return subscription.countdown !== undefined && subscription.countdown > 60;
    }
    /**
     * Cancel a subscription (wrapper for unsubscribe)
     */
    cancelSubscription(subscriptionId) {
      var _this5 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        yield _this5.unsubscribe(subscriptionId, false);
      })();
    }
    /**
     * Load settings from localStorage
     */
    loadSettings() {
      const saved = localStorage.getItem('fundingSubscriptionSettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this.subscriptionSettings.set(settings);
          this.positionSizeUsdt.set(100); // Default position size in USDT
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    }
    /**
     * Save settings to localStorage
     */
    saveSettings() {
      const settings = this.subscriptionSettings();
      localStorage.setItem('fundingSubscriptionSettings', JSON.stringify(settings));
      // Position size is now in USDT, not affected by settings.defaultQuantity
      this.syncSettingsToFilters();
      this.showSettingsDialog.set(false);
      this.showNotification('Settings saved successfully', 'success');
    }
    /**
     * Sync settings to filters (threshold becomes min funding rate filter AND min spread filter)
     */
    syncSettingsToFilters() {
      const settings = this.subscriptionSettings();
      if (settings.autoCancelThreshold !== null && settings.autoCancelThreshold !== undefined) {
        // Convert from decimal (0.003) to percentage (0.3%) for the filter
        const thresholdPercent = Math.abs(settings.autoCancelThreshold) * 100;
        this.minAbsFundingRate.set(thresholdPercent);
        // Also sync to arbitrage min spread filter
        this.minSpreadThreshold.set(thresholdPercent);
      }
    }
    /**
     * Open settings dialog
     */
    openSettingsDialog() {
      this.showSettingsDialog.set(true);
    }
    /**
     * Close settings dialog
     */
    closeSettingsDialog() {
      this.showSettingsDialog.set(false);
      this.loadSettings(); // Reload to reset any unsaved changes
    }
    startAutoCancelChecker() {
      this.autoCancelInterval = setInterval(() => {
        this.checkAutoCancelConditions();
      }, 30000); // Check every 30 seconds
    }
    /**
     * Check if any subscriptions should be auto-cancelled based on funding rate threshold
     * Only cancels if BOTH conditions are met:
     * 1. Funding rate is below threshold
     * 2. Less than 30 seconds remaining before execution
     */
    checkAutoCancelConditions() {
      const settings = this.subscriptionSettings();
      if (!settings.enableAutoCancel || settings.autoCancelThreshold === null) {
        return; // Auto-cancel is disabled
      }
      const subscriptionsMap = this.subscriptions();
      const tickers = this.tickers();
      const now = Date.now();
      subscriptionsMap.forEach((subscription, subscriptionId) => {
        // Find current ticker data for this subscription
        const ticker = tickers.find(t => t.symbol === subscription.symbol);
        if (!ticker) return;
        const currentFundingRate = parseFloat(ticker.fundingRate);
        const absFundingRate = Math.abs(currentFundingRate);
        // Calculate time remaining until execution
        const timeRemaining = subscription.nextFundingTime - now;
        const secondsRemaining = Math.floor(timeRemaining / 1000);
        // Only cancel if funding rate is below threshold AND less than 30 seconds remaining
        const isFundingBelowThreshold = absFundingRate < Math.abs(settings.autoCancelThreshold);
        const isCloseToExecution = secondsRemaining < 30 && secondsRemaining > 0;
        if (isFundingBelowThreshold && isCloseToExecution) {
          console.log(`Auto-cancelling ${subscription.symbol}: funding rate ${currentFundingRate} below threshold ${settings.autoCancelThreshold} with ${secondsRemaining}s remaining`);
          this.unsubscribe(subscriptionId, false); // Cancel with notification
          this.showNotification(`Auto-cancelled ${subscription.symbol}: funding rate ${(currentFundingRate * 100).toFixed(4)}% below threshold (${secondsRemaining}s remaining)`, 'info');
        }
      });
    }
    /**
     * Edit an existing subscription
     */
    editSubscription(subscription) {
      var _this6 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        console.log('[DEBUG] editSubscription called with:', subscription);
        // If subscription has primary credential, switch to it to load correct ticker data
        if (subscription.primaryCredentialId) {
          const currentCredId = _this6.selectedCredentialId();
          if (currentCredId !== subscription.primaryCredentialId) {
            console.log('[DEBUG] Switching credential from', currentCredId, 'to', subscription.primaryCredentialId);
            _this6.selectedCredentialId.set(subscription.primaryCredentialId);
            // Load tickers for this credential
            yield _this6.loadTickersAsync().toPromise();
          }
        }
        // Find the ticker data for this subscription
        let ticker = _this6.tickers().find(t => t.symbol === subscription.symbol);
        if (!ticker) {
          // Try with normalized symbol (remove/add hyphens)
          const normalizedSymbol = subscription.symbol.includes('-') ? subscription.symbol.replace(/-/g, '') : subscription.symbol.replace('USDT', '-USDT');
          ticker = _this6.tickers().find(t => t.symbol === normalizedSymbol);
        }
        if (!ticker) {
          console.error('[ERROR] Cannot edit: ticker data not found for symbol:', subscription.symbol);
          console.log('[DEBUG] Available tickers:', _this6.tickers().map(t => t.symbol));
          _this6.showNotification(`[ERROR] Cannot find ticker data for ${subscription.symbol}. Please ensure the exchange is accessible.`, 'error');
          return;
        }
        console.log('[DEBUG] Found ticker:', ticker);
        _this6.editingSubscription.set(subscription);
        _this6.selectedTicker.set(ticker);
        // Set hedge credential if available
        if (subscription.hedgeCredentialId) {
          _this6.hedgeCredentialId.set(subscription.hedgeCredentialId);
        }
        // Use subscription's leverage if available, otherwise fall back to global setting
        const leverage = subscription.leverage || _this6.subscriptionSettings().leverage;
        // Use saved margin if available, otherwise recalculate from quantity
        const savedMargin = subscription.margin;
        if (savedMargin && savedMargin > 0) {
          console.log('[Edit] Loaded saved margin:', savedMargin);
          _this6.positionSizeUsdt.set(savedMargin);
        } else {
          // Fallback: recalculate from quantity (existing logic)
          const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
          const estimatedMargin = subscription.quantity * price / leverage;
          console.log('[Edit] Recalculated margin from quantity:', estimatedMargin, 'based on quantity:', subscription.quantity, 'price:', price, 'leverage:', leverage);
          _this6.positionSizeUsdt.set(estimatedMargin);
        }
        // Set leverage for dialog (use subscription's leverage, not global)
        _this6.dialogLeverage.set(leverage);
        console.log('[DEBUG] Set dialogLeverage to:', leverage, '(from subscription)');
        // Open the subscription dialog for editing
        console.log('[DEBUG] Opening subscription dialog');
        _this6.showSubscriptionDialog.set(true);
        // Fetch balances for both primary and hedge exchanges
        _this6.fetchBalancesAndCalculatePosition(ticker.symbol);
      })();
    }
    /**
     * Save edited subscription
     * Note: Backend doesn't support PATCH/PUT, so we need to cancel and recreate
     */
    saveEditedSubscription() {
      const editingSub = this.editingSubscription();
      if (!editingSub) {
        return;
      }
      const positionCalc = this.positionCalculation();
      if (!positionCalc) {
        this.showNotification('Unable to calculate position. Please check your input.', 'error');
        return;
      }
      const newQuantity = positionCalc.quantity;
      if (newQuantity === editingSub.quantity) {
        this.showNotification('[INFO] No changes to save', 'info');
        this.cancelEdit();
        return;
      }
      // Since backend doesn't have PUT endpoint, we need to cancel and recreate
      const token = this.authService.authState().token;
      if (!token) {
        this.showNotification('[ERROR] Not authenticated', 'error');
        return;
      }
      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      // Step 1: Cancel existing subscription
      this.http.delete(`http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${editingSub.subscriptionId}`, {
        headers
      }).subscribe({
        next: deleteResponse => {
          if (deleteResponse.success) {
            // Step 2: Create new subscription with updated quantity
            const credential = this.selectedCredential();
            if (!credential) {
              this.showNotification('[ERROR] No exchange credential selected', 'error');
              return;
            }
            // Get hedge credential - REQUIRED
            const hedgeCred = this.hedgeCredential();
            if (!hedgeCred) {
              this.showNotification('[ERROR] Hedge credential is required. Please select a hedge exchange.', 'error');
              return;
            }
            const subscribeData = {
              symbol: editingSub.symbol,
              fundingRate: editingSub.fundingRate,
              nextFundingTime: editingSub.nextFundingTime,
              positionType: editingSub.positionType,
              quantity: newQuantity,
              primaryCredentialId: credential.id,
              hedgeExchange: hedgeCred.exchange,
              hedgeCredentialId: hedgeCred.id,
              leverage: this.subscriptionSettings().leverage
            };
            this.http.post('http://localhost:3000/api/funding-arbitrage/subscribe', subscribeData, {
              headers
            }).subscribe({
              next: createResponse => {
                if (createResponse.success) {
                  this.showNotification('[SUCCESS] Subscription updated successfully', 'success');
                  this.editingSubscription.set(null);
                  this.loadSubscriptions();
                } else {
                  this.showNotification(`[ERROR] ${createResponse.message || 'Failed to recreate subscription'}`, 'error');
                }
              },
              error: error => {
                console.error('Recreate subscription error:', error);
                this.showNotification(`[ERROR] ${error.error?.message || 'Failed to recreate subscription'}`, 'error');
              }
            });
          } else {
            this.showNotification(`[ERROR] ${deleteResponse.message || 'Failed to cancel old subscription'}`, 'error');
          }
        },
        error: error => {
          console.error('Cancel subscription error:', error);
          this.showNotification(`[ERROR] ${error.error?.message || 'Failed to cancel old subscription'}`, 'error');
        }
      });
    }
    /**
     * Cancel editing subscription
     */
    cancelEdit() {
      this.editingSubscription.set(null);
      this.positionSizeUsdt.set(100); // Reset to default USDT amount
    }
    /**
     * Load existing subscriptions from the server
     */
    loadSubscriptions() {
      const token = this.authService.authState().token;
      if (!token) {
        console.log('No auth token, skipping subscription load');
        return;
      }
      const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get('http://localhost:3000/api/funding-arbitrage/subscribe', {
        headers
      }).subscribe({
        next: response => {
          console.log('Loaded subscriptions:', response);
          if (response.success && response.data) {
            const subsMap = new Map();
            const completedDealsList = [];
            response.data.forEach(sub => {
              // Basic validation - symbol must be a non-empty string ending with USDT
              const isValidSymbol = sub.symbol && typeof sub.symbol === 'string' && sub.symbol.length > 0 && (sub.symbol.endsWith('USDT') || sub.symbol.endsWith('-USDT'));
              if (!isValidSymbol) {
                console.warn(`[loadSubscriptions] Skipping subscription with invalid symbol: ${sub.symbol} (ID: ${sub.subscriptionId})`);
                return; // Skip this subscription
              }
              // Check if subscription is completed
              if (sub.status === 'COMPLETED' && sub.entryPrice) {
                completedDealsList.push({
                  subscriptionId: sub.subscriptionId,
                  symbol: sub.symbol,
                  fundingRate: sub.fundingRate,
                  positionType: sub.positionType,
                  quantity: sub.quantity,
                  entryPrice: sub.entryPrice,
                  hedgeEntryPrice: sub.hedgeEntryPrice,
                  fundingEarned: sub.fundingEarned,
                  realizedPnl: sub.realizedPnl,
                  executedAt: sub.executedAt,
                  createdAt: sub.createdAt
                });
              } else if (sub.status !== 'COMPLETED') {
                // Only add non-completed subscriptions to active list
                subsMap.set(sub.subscriptionId, sub);
              }
            });
            console.log('[loadSubscriptions] Active subscriptions map:', subsMap);
            console.log('[loadSubscriptions] Active subscription symbols:', Array.from(subsMap.values()).map(s => s.symbol));
            console.log('[loadSubscriptions] Completed deals:', completedDealsList.length);
            this.subscriptions.set(subsMap);
            this.completedDeals.set(completedDealsList);
          }
        },
        error: err => {
          console.error('Failed to load subscriptions:', err);
        }
      });
    }
    /**
     * Subscribe to funding rate arbitrage
     */
    subscribeFundingRate() {
      var _this7 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const ticker = _this7.selectedTicker();
        const credential = _this7.selectedCredential();
        const editingSub = _this7.editingSubscription();
        if (!ticker || !credential) return;
        _this7.isSubscribing.set(true);
        try {
          // If editing, cancel the old subscription first
          if (editingSub) {
            yield _this7.unsubscribe(editingSub.subscriptionId, true); // true = silent mode
          }
          const token = _this7.authService.authState().token;
          if (!token) {
            _this7.showNotification('Authentication required', 'error');
            return;
          }
          const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          });
          // Determine position type based on funding rate
          const fundingRate = parseFloat(ticker.fundingRate);
          const positionType = fundingRate < 0 ? 'long' : 'short';
          // Debug: Log ticker price data
          console.log(`[Subscribe ${ticker.symbol}] Price data - lastPrice: ${ticker.lastPrice}, markPrice: ${ticker.markPrice}`);
          // Calculate quantity from position size in USDT
          const positionCalc = _this7.positionCalculation();
          if (!positionCalc) {
            const errorMessage = _this7.positionValidationError() || 'Unable to calculate position details. Please check your input.';
            console.log(`[Subscribe ${ticker.symbol}] Validation error: ${errorMessage}`);
            _this7.showNotification(errorMessage, 'error');
            return;
          }
          // Get hedge credential - REQUIRED (no mock exchange)
          const hedgeCred = _this7.hedgeCredential();
          if (!hedgeCred) {
            _this7.showNotification('Hedge credential is required for funding arbitrage. Please select a hedge exchange.', 'error');
            return;
          }
          const currentMargin = _this7.positionSizeUsdt();
          const body = {
            symbol: ticker.symbol,
            fundingRate: fundingRate,
            nextFundingTime: parseInt(ticker.nextFundingTime),
            positionType: positionType,
            quantity: positionCalc.quantity,
            // Use calculated quantity from USDT amount
            primaryCredentialId: credential.id,
            hedgeExchange: hedgeCred.exchange,
            hedgeCredentialId: hedgeCred.id,
            executionDelay: _this7.subscriptionSettings().executionDelay,
            leverage: _this7.dialogLeverage(),
            // Use dialog-specific leverage
            margin: currentMargin // Current margin/position size in USDT
          };
          console.log('[Subscribe] Saving margin:', currentMargin);
          console.log('Creating funding subscription:', body);
          const response = yield _this7.http.post('http://localhost:3000/api/funding-arbitrage/subscribe', body, {
            headers
          }).toPromise();
          if (response.success) {
            const subscription = {
              subscriptionId: response.data.subscriptionId,
              symbol: response.data.symbol,
              fundingRate: response.data.fundingRate,
              nextFundingTime: response.data.nextFundingTime,
              positionType: response.data.positionType,
              quantity: response.data.quantity,
              status: response.data.status
            };
            const subs = _this7.subscriptions();
            subs.set(subscription.subscriptionId, subscription);
            _this7.subscriptions.set(new Map(subs));
            const message = editingSub ? `✅ Updated subscription for ${ticker.symbol}` : `✅ Subscribed to ${ticker.symbol} funding arbitrage`;
            _this7.showNotification(message, 'success');
            _this7.closeSubscriptionDialog();
            _this7.startCountdownMonitoring(subscription);
          }
        } catch (error) {
          console.error('Error subscribing to funding rate:', error);
          _this7.showNotification(`Failed to subscribe: ${error.error?.message || error.message}`, 'error');
        } finally {
          _this7.isSubscribing.set(false);
        }
      })();
    }
    /**
     * Start countdown monitoring for a subscription
     */
    startCountdownMonitoring(subscription) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeRemaining = subscription.nextFundingTime - now;
        const secondsRemaining = Math.floor(timeRemaining / 1000);
        if (secondsRemaining <= 0) {
          return;
        }
        // Update countdown
        const subs = this.subscriptions();
        const sub = subs.get(subscription.subscriptionId);
        if (sub) {
          sub.countdown = secondsRemaining;
          this.subscriptions.set(new Map(subs));
          // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
          this.cdr.detectChanges();
        }
        // Notify at key moments
        if (secondsRemaining === 10) {
          this.showNotification(`⏰ 10 seconds until funding for ${subscription.symbol}`, 'info');
        } else if (secondsRemaining === 5) {
          this.showNotification(`🚀 Opening positions for ${subscription.symbol}...`, 'info');
        }
        // Schedule next update
        setTimeout(updateCountdown, 1000);
      };
      // Start the countdown
      updateCountdown();
    }
    /**
     * Unsubscribe from funding arbitrage
     */
    unsubscribe(_x2) {
      var _this8 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* (subscriptionId, silent = false) {
        try {
          const token = _this8.authService.authState().token;
          if (!token) return;
          const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
          const response = yield _this8.http.delete(`http://localhost:3000/api/funding-arbitrage/subscribe?subscriptionId=${subscriptionId}`, {
            headers
          }).toPromise();
          // Remove from local state
          const subs = _this8.subscriptions();
          subs.delete(subscriptionId);
          _this8.subscriptions.set(new Map(subs));
          if (!silent) {
            _this8.showNotification('Subscription canceled', 'info');
          }
        } catch (error) {
          console.error('Error unsubscribing:', error);
          // Check if subscription was already removed (404 or "not found" error)
          const isNotFound = error.status === 404 || error.error?.message?.includes('not found') || error.error?.error?.includes('not found');
          if (isNotFound) {
            // Subscription already gone from backend, just remove from frontend
            const subs = _this8.subscriptions();
            subs.delete(subscriptionId);
            _this8.subscriptions.set(new Map(subs));
            if (!silent) {
              _this8.showNotification('Subscription already removed', 'info');
            }
          } else {
            // Real error
            if (!silent) {
              _this8.showNotification('Failed to cancel subscription', 'error');
            }
          }
        }
      }).apply(this, arguments);
    }
    /**
     * Show notification
     */
    showNotification(message, type) {
      const notifications = this.notifications();
      notifications.push(`[${type.toUpperCase()}] ${message}`);
      this.notifications.set([...notifications]);
      // Auto-remove after 5 seconds
      setTimeout(() => {
        const notifs = this.notifications();
        const index = notifs.indexOf(`[${type.toUpperCase()}] ${message}`);
        if (index > -1) {
          notifs.splice(index, 1);
          this.notifications.set([...notifs]);
        }
      }, 5000);
    }
    /**
     * Calculate countdown from funding time
     */
    calculateCountdown(nextFundingTime) {
      const now = Date.now();
      const timeRemaining = nextFundingTime - now;
      return Math.max(0, Math.floor(timeRemaining / 1000));
    }
    /**
     * Format countdown time
     */
    formatCountdown(seconds) {
      if (seconds <= 0) return 'Executing...';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    }
    /**
     * Check if a symbol has an active subscription
     */
    hasActiveSubscription(symbol) {
      const hasSubscription = this.subscribedSymbols().has(symbol);
      // Debug logging
      if (hasSubscription) {
        console.log('[hasActiveSubscription] Symbol has subscription:', symbol);
      }
      return hasSubscription;
    }
    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleString();
    }
    /**
     * Get subscription for an arbitrage opportunity by symbol
     */
    getArbitrageSubscription(symbol) {
      // Normalize symbol (remove hyphens)
      const normalizedSymbol = symbol.replace(/-/g, '');
      return this.symbolToSubscription().get(normalizedSymbol);
    }
    /**
     * Check if arbitrage opportunity has an active subscription
     */
    hasArbitrageSubscription(symbol) {
      return this.getArbitrageSubscription(symbol) !== undefined;
    }
    /**
     * Start arbitrage subscription execution (for already subscribed symbols)
     */
    startArbitrageSubscription(opportunity) {
      var _this9 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const subscription = _this9.getArbitrageSubscription(opportunity.symbol);
        if (!subscription) {
          _this9.showNotification('No active subscription found for this symbol', 'error');
          return;
        }
        yield _this9.startSubscriptionNow(subscription.subscriptionId);
      })();
    }
    /**
     * Edit arbitrage subscription (for already subscribed symbols)
     */
    editArbitrageSubscription(opportunity) {
      var _this0 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const subscription = _this0.getArbitrageSubscription(opportunity.symbol);
        if (!subscription) {
          _this0.showNotification('No active subscription found for this symbol', 'error');
          return;
        }
        console.log('[editArbitrageSubscription] === DEBUGGING MARGIN CALCULATION ===');
        console.log('[editArbitrageSubscription] Opportunity data:', opportunity);
        console.log('[editArbitrageSubscription] Subscription data:', subscription);
        // Set hedge credential if available
        if (subscription.hedgeCredentialId) {
          _this0.hedgeCredentialId.set(subscription.hedgeCredentialId);
          console.log('[editArbitrageSubscription] Set hedge credential:', subscription.hedgeCredentialId);
        }
        // Switch to primary credential if needed and load tickers to get current price
        if (subscription.primaryCredentialId) {
          const currentCredId = _this0.selectedCredentialId();
          if (currentCredId !== subscription.primaryCredentialId) {
            console.log('[editArbitrageSubscription] Switching credential from', currentCredId, 'to', subscription.primaryCredentialId);
            _this0.selectedCredentialId.set(subscription.primaryCredentialId);
            // Load tickers for this credential to get current price
            yield _this0.loadTickersAsync().toPromise();
          }
        }
        // Find the actual ticker data from loaded tickers (has current price)
        let ticker = _this0.tickers().find(t => t.symbol === subscription.symbol);
        if (!ticker) {
          // Try with normalized symbol (BingX uses hyphens, Bybit doesn't)
          const normalizedSymbol = subscription.symbol.includes('-') ? subscription.symbol.replace(/-/g, '') : subscription.symbol.replace('USDT', '-USDT');
          ticker = _this0.tickers().find(t => t.symbol === normalizedSymbol);
        }
        if (!ticker) {
          console.error('[editArbitrageSubscription] ERROR: Cannot find ticker data for symbol:', subscription.symbol);
          console.log('[editArbitrageSubscription] Available tickers:', _this0.tickers().map(t => t.symbol));
          _this0.showNotification(`Cannot find current price for ${subscription.symbol}. Please try again.`, 'error');
          return;
        }
        console.log('[editArbitrageSubscription] Found ticker with price:', {
          symbol: ticker.symbol,
          lastPrice: ticker.lastPrice,
          markPrice: ticker.markPrice
        });
        _this0.editingSubscription.set(subscription);
        _this0.selectedTicker.set(ticker);
        // Use subscription's leverage if available, otherwise fall back to global setting
        const leverage = subscription.leverage || _this0.subscriptionSettings().leverage;
        // Use saved margin if available, otherwise recalculate from quantity
        const savedMargin = subscription.margin;
        if (savedMargin && savedMargin > 0) {
          console.log('[editArbitrageSubscription] Loaded saved margin:', savedMargin);
          _this0.positionSizeUsdt.set(savedMargin);
        } else {
          // Fallback: recalculate from quantity and current price
          const price = parseFloat(ticker.lastPrice) || parseFloat(ticker.markPrice) || 0;
          const estimatedMargin = subscription.quantity * price / leverage;
          console.log('[editArbitrageSubscription] Recalculated margin from quantity:', estimatedMargin);
          console.log('[editArbitrageSubscription] Margin calculation:', {
            quantity: subscription.quantity,
            price: price,
            subscriptionLeverage: subscription.leverage,
            globalLeverage: _this0.subscriptionSettings().leverage,
            usedLeverage: leverage,
            calculation: `${subscription.quantity} * ${price} / ${leverage}`,
            estimatedMargin: estimatedMargin
          });
          _this0.positionSizeUsdt.set(estimatedMargin);
        }
        // Set leverage from subscription (use subscription's leverage, not global)
        _this0.dialogLeverage.set(leverage);
        console.log('[editArbitrageSubscription] Set dialogLeverage to:', leverage, '(from subscription)');
        // Open the subscription dialog for editing
        _this0.showSubscriptionDialog.set(true);
        // Fetch balances for both exchanges
        console.log('[editArbitrageSubscription] Calling fetchBalancesAndCalculatePosition...');
        _this0.fetchBalancesAndCalculatePosition(ticker.symbol);
      })();
    }
    /**
     * Cancel arbitrage subscription (for already subscribed symbols)
     */
    cancelArbitrageSubscription(opportunity) {
      var _this1 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const subscription = _this1.getArbitrageSubscription(opportunity.symbol);
        if (!subscription) {
          _this1.showNotification('No active subscription found for this symbol', 'error');
          return;
        }
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to cancel the subscription for ${opportunity.symbol}?\n\n` + `Position: ${subscription.positionType.toUpperCase()}\n` + `Quantity: ${subscription.quantity}\n` + `Funding Rate: ${(subscription.fundingRate * 100).toFixed(4)}%`);
        if (!confirmed) {
          return;
        }
        yield _this1.cancelSubscription(subscription.subscriptionId);
      })();
    }
    /**
     * Subscribe to arbitrage opportunity
     * Opens the subscription dialog for the best long position exchange
     */
    subscribeToArbitrage(opportunity) {
      console.log('[subscribeToArbitrage] Called with opportunity:', opportunity);
      // Find the ticker for the best long exchange (lowest funding rate)
      const bestLongExchange = opportunity.bestLong.exchange;
      const bestLongCredentialId = opportunity.bestLong.credentialId;
      console.log('[subscribeToArbitrage] Best long:', {
        bestLongExchange,
        bestLongCredentialId
      });
      // Find the matching credential
      const credential = this.credentials().find(c => c.id === bestLongCredentialId);
      console.log('[subscribeToArbitrage] Found credential:', credential);
      console.log('[subscribeToArbitrage] All credentials:', this.credentials());
      if (!credential) {
        console.error('[subscribeToArbitrage] Credential not found for ID:', bestLongCredentialId);
        this.showNotification('Exchange credential not found for ' + bestLongExchange, 'error');
        return;
      }
      // Switch to the best long exchange's credential
      this.selectedCredentialId.set(bestLongCredentialId);
      console.log('[subscribeToArbitrage] Switched to credential:', bestLongCredentialId);
      // Set the hedge exchange credential (best short)
      const bestShortCredentialId = opportunity.bestShort.credentialId;
      this.hedgeCredentialId.set(bestShortCredentialId);
      console.log('[subscribeToArbitrage] Set hedge credential:', bestShortCredentialId);
      // Find the ticker data from the exchanges array
      const exchangeData = opportunity.exchanges.find(ex => ex.exchange === bestLongExchange && ex.credentialId === bestLongCredentialId);
      console.log('[subscribeToArbitrage] Found exchange data:', exchangeData);
      console.log('[subscribeToArbitrage] All exchanges:', opportunity.exchanges);
      if (!exchangeData) {
        console.error('[subscribeToArbitrage] Exchange data not found');
        this.showNotification('Ticker data not found for ' + opportunity.symbol, 'error');
        return;
      }
      // Try to find the actual ticker from loaded tickers (after switching credential)
      // We need to load tickers for this credential first
      this.loadTickers();
      // Wait a moment for tickers to load, then find the ticker
      setTimeout(() => {
        let ticker = this.tickers().find(t => t.symbol === opportunity.symbol);
        if (!ticker) {
          console.warn('[subscribeToArbitrage] Ticker not found in loaded tickers, creating from exchange data');
          // Fallback: Create a ticker object from exchange data with better price handling
          ticker = {
            symbol: opportunity.symbol,
            fundingRate: opportunity.bestLong.fundingRate,
            nextFundingTime: exchangeData.nextFundingTime?.toString() || '0',
            lastPrice: (exchangeData.lastPrice || exchangeData.price || '0').toString(),
            indexPrice: (exchangeData.indexPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
            markPrice: (exchangeData.markPrice || exchangeData.lastPrice || exchangeData.price || '0').toString(),
            prevPrice24h: '0',
            price24hPcnt: '0',
            highPrice24h: '0',
            lowPrice24h: '0',
            prevPrice1h: '0',
            openInterest: exchangeData.openInterest?.toString() || '0',
            openInterestValue: '0',
            turnover24h: '0',
            volume24h: exchangeData.volume24h?.toString() || '0',
            predictedDeliveryPrice: '0',
            basisRate: '0',
            deliveryFeeRate: '0',
            deliveryTime: '0',
            ask1Size: '0',
            bid1Price: '0',
            ask1Price: '0',
            bid1Size: '0'
          };
        }
        // Update the ticker's funding rate from arbitrage data
        ticker = {
          ...ticker,
          fundingRate: opportunity.bestLong.fundingRate,
          nextFundingTime: exchangeData.nextFundingTime?.toString() || ticker.nextFundingTime
        };
        console.log('[subscribeToArbitrage] Using ticker:', ticker);
        this.selectedTicker.set(ticker);
        this.positionSizeUsdt.set(100); // Default position size in USDT
        this.dialogLeverage.set(this.subscriptionSettings().leverage); // Initialize with global setting
        this.showSubscriptionDialog.set(true);
        this.fetchBalancesAndCalculatePosition(ticker.symbol);
        // Show notification about the arbitrage opportunity
        const spreadPercent = (parseFloat(opportunity.spread) * 100).toFixed(4);
        const notificationMsg = `Subscribing to ${opportunity.symbol} arbitrage: ${spreadPercent}% spread between ${bestLongExchange} and ${opportunity.bestShort.exchange}`;
        console.log('[subscribeToArbitrage] Showing notification:', notificationMsg);
        this.showNotification(notificationMsg, 'info');
        console.log('[subscribeToArbitrage] Completed successfully');
      }, 500); // Give tickers time to load
    }
    /**
     * Fetch balances for primary and hedge exchanges and calculate position details
     */
    fetchBalancesAndCalculatePosition(symbol) {
      var _this10 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const primaryCred = _this10.selectedCredential();
        const hedgeCred = _this10.hedgeCredential();
        const ticker = _this10.selectedTicker();
        if (!primaryCred || !ticker) {
          console.error('[fetchBalances] Missing primary credential or ticker');
          return;
        }
        _this10.isLoadingBalances.set(true);
        try {
          const token = _this10.authService.authState().token;
          if (!token) {
            _this10.showNotification('Authentication required', 'error');
            return;
          }
          const headers = new _angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
          // Fetch primary balance
          let primaryBalanceUrl;
          // Use correct endpoint based on exchange
          if (primaryCred.exchange === 'BYBIT') {
            primaryBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
          } else if (primaryCred.exchange === 'BINGX') {
            primaryBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${primaryCred.environment}&credentialId=${primaryCred.id}`;
          } else {
            console.warn('[fetchBalances] Unsupported primary exchange:', primaryCred.exchange);
            _this10.primaryBalance.set(null);
            return;
          }
          const primaryBalanceResponse = yield _this10.http.get(primaryBalanceUrl, {
            headers
          }).toPromise();
          console.log('[fetchBalances] Primary balance response:', JSON.stringify(primaryBalanceResponse, null, 2));
          if (primaryBalanceResponse?.success && primaryBalanceResponse.data) {
            let balance = 0;
            // Extract balance based on exchange type
            if (primaryCred.exchange === 'BYBIT') {
              console.log('[fetchBalances] Bybit data structure:', primaryBalanceResponse.data);
              // Bybit returns: data.list[0].totalAvailableBalance
              const list = primaryBalanceResponse.data.list;
              if (list && list.length > 0) {
                balance = parseFloat(list[0].totalAvailableBalance || '0');
                console.log('[fetchBalances] Bybit balance from list[0]:', balance);
              } else {
                console.warn('[fetchBalances] Bybit list is empty or undefined:', list);
              }
            } else if (primaryCred.exchange === 'BINGX') {
              // BingX response: data.balance.availableMargin or data.balance.balance
              console.log('[fetchBalances] BingX FULL response:', primaryBalanceResponse);
              console.log('[fetchBalances] BingX data:', primaryBalanceResponse.data);
              console.log('[fetchBalances] BingX data.balance:', primaryBalanceResponse.data?.balance);
              const bingxBalance = primaryBalanceResponse.data?.balance;
              if (bingxBalance) {
                console.log('[fetchBalances] BingX balance object keys:', Object.keys(bingxBalance));
                console.log('[fetchBalances] BingX balance.availableMargin:', bingxBalance.availableMargin);
                console.log('[fetchBalances] BingX balance.balance:', bingxBalance.balance);
                balance = parseFloat(bingxBalance.availableMargin || bingxBalance.balance || '0');
              } else {
                console.error('[fetchBalances] BingX balance object is null/undefined');
              }
              console.log('[fetchBalances] Final extracted balance:', balance);
            }
            _this10.primaryBalance.set(balance);
            console.log('[fetchBalances] Primary balance set to:', balance, 'for', primaryCred.exchange);
            _this10.cdr.detectChanges(); // Trigger change detection to update computed signals in UI
            console.log('[fetchBalances] Change detection triggered after primary balance update');
          }
          // Fetch hedge balance if available
          if (hedgeCred) {
            let hedgeBalanceUrl;
            // Use correct endpoint based on exchange
            if (hedgeCred.exchange === 'BYBIT') {
              hedgeBalanceUrl = `http://localhost:3000/api/bybit/wallet-balance?accountType=UNIFIED&environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
            } else if (hedgeCred.exchange === 'BINGX') {
              hedgeBalanceUrl = `http://localhost:3000/api/bingx/wallet-balance?environment=${hedgeCred.environment}&credentialId=${hedgeCred.id}`;
            } else {
              console.warn('[fetchBalances] Unsupported hedge exchange:', hedgeCred.exchange);
              _this10.hedgeBalance.set(null);
              return;
            }
            const hedgeBalanceResponse = yield _this10.http.get(hedgeBalanceUrl, {
              headers
            }).toPromise();
            console.log('[fetchBalances] Hedge balance response:', JSON.stringify(hedgeBalanceResponse, null, 2));
            if (hedgeBalanceResponse?.success && hedgeBalanceResponse.data) {
              let balance = 0;
              // Extract balance based on exchange type
              if (hedgeCred.exchange === 'BYBIT') {
                // Bybit returns: data.list[0].totalAvailableBalance
                const list = hedgeBalanceResponse.data.list;
                if (list && list.length > 0) {
                  balance = parseFloat(list[0].totalAvailableBalance || '0');
                  console.log('[fetchBalances] Hedge Bybit balance from list[0]:', balance);
                } else {
                  console.warn('[fetchBalances] Hedge Bybit list is empty or undefined:', list);
                }
              } else if (hedgeCred.exchange === 'BINGX') {
                // BingX response: data.balance.availableMargin or data.balance.balance
                console.log('[fetchBalances] Hedge BingX data structure:', hedgeBalanceResponse.data);
                const bingxBalance = hedgeBalanceResponse.data.balance;
                console.log('[fetchBalances] Hedge BingX balance object:', bingxBalance);
                balance = parseFloat(bingxBalance?.availableMargin || bingxBalance?.balance || '0');
                console.log('[fetchBalances] Hedge extracted balance:', balance);
              }
              _this10.hedgeBalance.set(balance);
              console.log('[fetchBalances] Hedge balance set to:', balance, 'for', hedgeCred.exchange);
              _this10.cdr.detectChanges(); // Trigger change detection to update computed signals in UI
              console.log('[fetchBalances] Change detection triggered after hedge balance update');
            }
          } else {
            // No hedge credential selected
            _this10.hedgeBalance.set(null);
          }
          // Position calculation is now automatic via computed signal
        } catch (error) {
          console.error('[fetchBalances] Error fetching balances:', error);
          _this10.primaryBalance.set(null);
          _this10.hedgeBalance.set(null);
        } finally {
          _this10.isLoadingBalances.set(false);
          _this10.cdr.detectChanges(); // Trigger final change detection after loading completes
          console.log('[fetchBalances] Final change detection triggered after loading completion');
        }
      })();
    }
    /**
     * Opens the trading pair's futures page on the exchange platform
     */
    openTradingPair(symbol) {
      const credential = this.selectedCredential();
      if (!credential) return;
      const exchange = credential.exchange;
      const environment = credential.environment;
      let url = '';
      switch (exchange) {
        case 'BYBIT':
          if (environment === 'TESTNET') {
            // Bybit Testnet futures trading page
            url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
          } else {
            // Bybit Mainnet futures trading page
            url = `https://www.bybit.com/trade/usdt/${symbol}`;
          }
          break;
        case 'BINANCE':
          if (environment === 'TESTNET') {
            // Binance Testnet futures
            url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
          } else {
            // Binance Mainnet futures
            url = `https://www.binance.com/en/futures/${symbol}`;
          }
          break;
        case 'OKX':
          // OKX doesn't have separate testnet URLs for trading
          url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
          break;
        case 'KRAKEN':
          // Kraken futures
          url = `https://futures.kraken.com/trade/${symbol}`;
          break;
        case 'COINBASE':
          // Coinbase doesn't have futures trading in the same way
          url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
          break;
        case 'BINGX':
          if (environment === 'TESTNET') {
            // BingX Testnet perpetual trading page
            url = `https://testnet-futures.bingx.com/en/perpetual/${symbol}`;
          } else {
            // BingX Mainnet perpetual trading page
            url = `https://bingx.com/en/perpetual/${symbol}`;
          }
          break;
        default:
          console.warn('Unknown exchange:', exchange);
          return;
      }
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    /**
     * Opens the trading pair's futures page on a specific exchange platform
     * Used by arbitrage table where exchange is passed explicitly
     */
    openTradingPairForExchange(symbol, exchange, environment, originalSymbol) {
      let url = '';
      // Use originalSymbol for exchanges that need specific formatting (e.g., BingX uses hyphens)
      const displaySymbol = originalSymbol || symbol;
      switch (exchange) {
        case 'BYBIT':
          if (environment === 'TESTNET') {
            url = `https://testnet.bybit.com/trade/usdt/${symbol}`;
          } else {
            url = `https://www.bybit.com/trade/usdt/${symbol}`;
          }
          break;
        case 'BINANCE':
          if (environment === 'TESTNET') {
            url = `https://testnet.binancefuture.com/en/futures/${symbol}`;
          } else {
            url = `https://www.binance.com/en/futures/${symbol}`;
          }
          break;
        case 'OKX':
          url = `https://www.okx.com/trade-swap/${symbol.toLowerCase()}`;
          break;
        case 'KRAKEN':
          url = `https://futures.kraken.com/trade/${symbol}`;
          break;
        case 'COINBASE':
          url = `https://www.coinbase.com/advanced-trade/spot/${symbol}`;
          break;
        case 'BINGX':
          // BingX uses hyphens in their URLs (e.g., DOOD-USDT instead of DOODUSDT)
          if (environment === 'TESTNET') {
            url = `https://testnet-futures.bingx.com/en/perpetual/${displaySymbol}`;
          } else {
            url = `https://bingx.com/en/perpetual/${displaySymbol}`;
          }
          break;
        default:
          console.warn('Unknown exchange:', exchange);
          return;
      }
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    static {
      this.ɵfac = function FundingRatesComponent_Factory(t) {
        return new (t || FundingRatesComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineComponent"]({
        type: FundingRatesComponent,
        selectors: [["app-funding-rates"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵStandaloneFeature"]],
        decls: 59,
        vars: 24,
        consts: [[1, "funding-rates-container"], [1, "funding-rates-header"], [1, "funding-rates-title"], [1, "funding-rates-actions"], ["variant", "ghost", "size", "small", "aria-label", "Subscription settings", 3, "clicked"], ["variant", "ghost", "size", "small", "aria-label", "Clear sort"], ["variant", "outlined", 1, "arbitrage-card"], [1, "card-header-content"], [1, "header-actions"], [1, "filter-control"], [1, "filter-input-wrapper"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "filter-icon"], ["d", "M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "text", "placeholder", "Search symbol (e.g., BTC-USDT)", "aria-label", "Filter by symbol", 1, "filter-input", 3, "ngModelChange", "ngModel"], ["aria-label", "Clear symbol filter", "type", "button", 1, "filter-clear-btn"], ["d", "M3 6L5 8L9 4M3 12H9M15 12H21M3 18H13M17 18H21", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "step", "0.001", "min", "0", "placeholder", "Min spread % (e.g., 0.01)", "aria-label", "Minimum spread percentage", 1, "filter-input", 3, "ngModelChange", "ngModel"], ["aria-label", "Clear spread filter", "type", "button", 1, "filter-clear-btn"], [1, "filter-badge"], [1, "checkbox-filter"], ["type", "checkbox", "aria-label", "Show only subscribed pairs", 1, "checkbox-input", 3, "ngModelChange", "ngModel"], [1, "checkbox-label"], [1, "header-actions-group"], ["variant", "ghost", "size", "small", "aria-label", "Clear all filters"], ["variant", "ghost", "size", "small", "aria-label", "Cancel all subscriptions", 3, "clicked"], [1, "button-content"], ["width", "14", "height", "14", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], ["d", "M12 2L2 7L12 12L22 7L12 2Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M2 17L12 22L22 17", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M2 12L12 17L22 12", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M4 9L20 9", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], ["variant", "ghost", "size", "small", "aria-label", "Refresh arbitrage opportunities", 3, "clicked", "loading"], ["d", "M21.5 2V8M21.5 8H15.5M21.5 8L18.5 5C17.3 3.8 15.7 3 14 3C10.1 3 7 6.1 7 10M2.5 22V16M2.5 16H8.5M2.5 16L5.5 19C6.7 20.2 8.3 21 10 21C13.9 21 17 17.9 17 14", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "button", 1, "toggle-section-btn", 3, "click"], ["d", "M18 15L12 9L6 15", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "collapsed-summary"], ["variant", "elevated", 1, "subscriptions-card"], ["variant", "elevated", 1, "deals-card"], [1, "dialog-overlay"], [1, "notifications-container"], [1, "settings-overlay"], ["variant", "ghost", "size", "small", "aria-label", "Clear sort", 3, "clicked"], ["aria-label", "Clear symbol filter", "type", "button", 1, "filter-clear-btn", 3, "click"], ["d", "M18 6L6 18M6 6L18 18", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["aria-label", "Clear spread filter", "type", "button", 1, "filter-clear-btn", 3, "click"], ["variant", "ghost", "size", "small", "aria-label", "Clear all filters", 3, "clicked"], [1, "loading-state"], [1, "error-state"], [1, "empty-state"], [1, "arbitrage-table-wrapper"], ["variant", "primary", "size", "small", 3, "clicked"], [1, "help-text"], ["variant", "secondary", "size", "small", 3, "clicked"], ["role", "table", "aria-label", "Arbitrage opportunities", 1, "arbitrage-table"], [1, "text-center"], [1, "text-right"], [3, "opportunity-row", "has-subscription"], [1, "symbol-cell"], [1, "symbol-text"], [1, "exchanges-cell", "text-center"], [1, "exchanges-badges"], [1, "exchange-badge", "exchange-badge-button", 3, "class", "title"], [1, "position-info"], [1, "exchange-label"], [1, "rate-value"], [1, "environment-tag"], [1, "funding-time-info"], [1, "spread-info"], [1, "spread-value"], [1, "spread-percent"], [1, "text-center", "action-cell"], [1, "subscription-action-buttons"], [1, "exchange-badge", "exchange-badge-button", 3, "click", "title"], [1, "funding-time-entry"], [1, "exchange-label-small"], [1, "funding-time-value"], ["variant", "tertiary", "size", "small", "className", "action-btn start-btn", "title", "Start Arbitrage", 3, "clicked", "iconOnly", "disabled"], ["d", "M5 3L19 12L5 21V3Z", "fill", "currentColor"], ["variant", "tertiary", "size", "small", "className", "action-btn edit-btn", "title", "Edit Subscription", 3, "clicked", "iconOnly"], ["d", "M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["variant", "tertiary", "size", "small", "className", "action-btn cancel-btn", "title", "Cancel Subscription", 3, "clicked", "iconOnly"], ["variant", "primary", "size", "small", "className", "action-btn subscribe-arbitrage-btn"], ["variant", "ghost", "size", "small", "className", "action-btn subscribe-arbitrage-btn"], ["variant", "primary", "size", "small", "className", "action-btn subscribe-arbitrage-btn", 3, "clicked"], ["variant", "ghost", "size", "small", "className", "action-btn subscribe-arbitrage-btn", 3, "clicked"], [1, "subscriptions-list"], [1, "subscription-item"], [1, "subscription-info"], [1, "subscription-symbol"], [1, "subscription-details"], [1, "detail-label"], [1, "detail-value"], [1, "detail-separator"], [1, "subscription-countdown"], [1, "countdown-display", 3, "urgent"], [1, "subscription-actions"], ["variant", "ghost", "size", "small", 3, "clicked"], [1, "countdown-display"], [1, "deals-list"], [1, "deal-item"], [1, "deal-header"], [1, "deal-symbol"], [1, "deal-type"], [1, "deal-details"], [1, "deal-row"], [1, "deal-row", "highlight"], [1, "dialog-overlay", 3, "click"], [1, "dialog-content", 3, "click"], [1, "dialog-header"], [1, "dialog-close", 3, "click"], [1, "dialog-body"], [1, "dialog-info"], [1, "info-row"], [1, "info-label"], [1, "info-value"], [1, "info-value", 3, "ngClass"], [1, "positions-info"], [1, "positions-title"], [1, "positions-grid"], [1, "position-item", "primary-position"], [1, "position-label"], [1, "position-type"], [1, "position-amount"], [1, "position-margin"], [1, "position-explanation"], [1, "position-arrow"], [1, "position-item", "hedge-position"], [1, "balance-info", "loading"], [1, "balance-info"], [1, "dialog-form"], [1, "form-group"], [1, "form-label"], ["type", "number", "step", "10", "min", "10", "placeholder", "e.g., 100", 1, "form-input", 3, "ngModelChange", "ngModel"], [1, "form-hint"], ["type", "number", "min", "1", "max", "125", "step", "1", "placeholder", "3", 1, "form-input", 3, "ngModelChange", "ngModel"], [1, "position-calculation"], [1, "dialog-warning"], [1, "dialog-footer"], ["variant", "ghost", 3, "clicked"], ["variant", "primary", 3, "clicked", "loading"], [1, "balance-row"], [1, "balance-label"], [1, "balance-value"], [1, "calculation-title"], [1, "calculation-grid"], [1, "calc-row"], [1, "calc-label"], [1, "calc-value"], [1, "calc-row", "important"], [1, "calculation-note"], [1, "notification-toast", 3, "success", "error", "info"], [1, "notification-toast"], [1, "settings-overlay", 3, "click"], [1, "settings-modal", 3, "click"], [1, "settings-header"], [1, "settings-header-content"], [1, "settings-icon"], ["width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], ["d", "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "settings-title"], ["aria-label", "Close", 1, "settings-close", 3, "click"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], [1, "settings-body"], [1, "settings-section"], [1, "section-header"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "section-icon"], ["d", "M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21M4 7H20M4 15H20M3 21H21", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "section-title"], [1, "settings-field"], [1, "field-label"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "field-icon"], ["d", "M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "step", "0.001", "min", "0.001", "placeholder", "0.01", "aria-label", "Default quantity", 1, "field-input", 3, "ngModelChange", "ngModel"], [1, "field-help"], ["d", "M13 2L3 14H12L11 22L21 10H12L13 2Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "min", "1", "max", "20", "step", "1", "placeholder", "3", "aria-label", "Leverage", 1, "field-input", 3, "ngModelChange", "ngModel"], ["d", "M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], [1, "field-checkbox"], ["type", "checkbox", 1, "checkbox-input", 3, "ngModelChange", "ngModel"], [1, "checkbox-custom"], ["d", "M12 6V12L16 14", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "min", "1", "max", "60", "step", "1", "placeholder", "5", "aria-label", "Execution delay", 1, "field-input", 3, "ngModelChange", "ngModel"], ["d", "M3 3V21M21 21V3M7 8H17M7 12H17M7 16H17", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "step", "0.001", "min", "0", "placeholder", "0.01", "aria-label", "Arbitrage spread threshold", 1, "field-input", 3, "ngModelChange", "ngModel"], [1, "settings-footer"], ["variant", "primary", 3, "clicked"], [1, "button-with-icon"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], ["d", "M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M17 21V13H7V21M7 3V8H15", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "M22 4L12 14.01L9 11.01", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["type", "number", "step", "0.0001", "placeholder", "0.01", "aria-label", "Auto-cancel threshold", 1, "field-input", 3, "ngModelChange", "ngModel"]],
        template: function FundingRatesComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "h2", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](4, "div", 3)(5, "ui-button", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Template_ui_button_clicked_5_listener() {
              return ctx.openSettingsDialog();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](6, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](8, FundingRatesComponent_Conditional_8_Template, 3, 1, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](9, "ui-card", 6)(10, "ui-card-header")(11, "div", 7)(12, "ui-card-title");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](13);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](14, "div", 8)(15, "div", 9)(16, "div", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](17, "svg", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](18, "path", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](19, "input", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Template_input_ngModelChange_19_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx.arbitrageSearchQuery, $event) || (ctx.arbitrageSearchQuery = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](20, FundingRatesComponent_Conditional_20_Template, 3, 0, "button", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](21, "div", 9)(22, "div", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](23, "svg", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](24, "path", 15);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](25, "input", 16);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayListener"]("ngModelChange", function FundingRatesComponent_Template_input_ngModelChange_25_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayBindingSet"](ctx.minSpreadThreshold, $event) || (ctx.minSpreadThreshold = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](26, FundingRatesComponent_Conditional_26_Template, 3, 0, "button", 17)(27, FundingRatesComponent_Conditional_27_Template, 2, 1, "span", 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](28, "div", 9)(29, "label", 19)(30, "input", 20);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("ngModelChange", function FundingRatesComponent_Template_input_ngModelChange_30_listener($event) {
              return ctx.showOnlySubscribedArbitrage.set($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](31, "span", 21);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](32, "Only Subscribed");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](33, "div", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](34, FundingRatesComponent_Conditional_34_Template, 5, 0, "ui-button", 23);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](35, "ui-button", 24);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Template_ui_button_clicked_35_listener() {
              return ctx.cancelAllSubscriptions();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](36, "span", 25);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](37, "svg", 26);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](38, "path", 27)(39, "path", 28)(40, "path", 29)(41, "path", 30);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](42);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](43, "ui-button", 31);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("clicked", function FundingRatesComponent_Template_ui_button_clicked_43_listener() {
              return ctx.loadArbitrageOpportunities();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](44, "span", 25);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](45, "svg", 26);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](46, "path", 32);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtext"](47);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](48, "button", 33);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵlistener"]("click", function FundingRatesComponent_Template_button_click_48_listener() {
              return ctx.toggleArbitrageSection();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](49, "svg", 26);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelement"](50, "path", 34);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()()()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementStart"](51, "ui-card-content");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](52, FundingRatesComponent_Conditional_52_Template, 3, 3, "div", 35)(53, FundingRatesComponent_Conditional_53_Template, 5, 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtemplate"](54, FundingRatesComponent_Conditional_54_Template, 8, 1, "ui-card", 36)(55, FundingRatesComponent_Conditional_55_Template, 8, 1, "ui-card", 37)(56, FundingRatesComponent_Conditional_56_Template, 88, 47, "div", 38)(57, FundingRatesComponent_Conditional_57_Template, 3, 0, "div", 39)(58, FundingRatesComponent_Conditional_58_Template, 83, 21, "div", 40);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.translate("funding.title"));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"]("\u2699\uFE0F ", ctx.translate("fundingRates.filters.settings"), "");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.sortColumns().length > 1 ? 8 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate"](ctx.translate("arbitrage.title"));
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx.arbitrageSearchQuery);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.arbitrageSearchQuery() ? 20 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtwoWayProperty"]("ngModel", ctx.minSpreadThreshold);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.minSpreadThreshold() !== null && ctx.minSpreadThreshold() > 0 ? 26 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.minSpreadThreshold() !== null && ctx.minSpreadThreshold() > 0 ? 27 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("ngModel", ctx.showOnlySubscribedArbitrage());
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.arbitrageSearchQuery() || ctx.minSpreadThreshold() !== null && ctx.minSpreadThreshold() > 0 || ctx.showOnlySubscribedArbitrage() ? 34 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" Cancel All (", ctx.subscriptions().size, ") ");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵproperty"]("loading", ctx.isLoadingArbitrage());
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵtextInterpolate1"](" ", ctx.translate("funding.refresh"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵattribute"]("aria-expanded", !ctx.showArbitrageSection())("aria-label", ctx.showArbitrageSection() ? "Collapse section" : "Expand section");
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵclassProp"]("rotate-180", !ctx.showArbitrageSection());
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](!ctx.showArbitrageSection() ? 52 : 53);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.subscriptions().size > 0 ? 54 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.completedDeals().length > 0 ? 55 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.showSubscriptionDialog() && ctx.selectedTicker() ? 56 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.notifications().length > 0 ? 57 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵconditional"](ctx.showSettingsDialog() ? 58 : -1);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_12__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgClass, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.CheckboxControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.MinValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.MaxValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_13__.NgModel, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_3__.CardContentComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_4__.ButtonComponent],
        styles: [".funding-rates-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px;\n}\n\n.funding-rates-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.funding-rates-header[_ngcontent-%COMP%]   .funding-rates-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 24px;\n  font-weight: 700;\n  color: var(--text-primary);\n}\n.funding-rates-header[_ngcontent-%COMP%]   .funding-rates-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n\n.card-header-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n  flex: 1;\n  justify-content: flex-end;\n}\n\n.header-actions-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.filter-control[_ngcontent-%COMP%] {\n  position: relative;\n  min-width: 200px;\n  max-width: 280px;\n  flex: 1 1 auto;\n}\n@media (max-width: 768px) {\n  .filter-control[_ngcontent-%COMP%] {\n    min-width: 100%;\n    max-width: 100%;\n  }\n}\n\n.filter-input-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  background: var(--background-primary);\n  border: 1px solid var(--border-color);\n  border-radius: var(--border-radius-lg);\n  transition: var(--transition-fast);\n  overflow: hidden;\n}\n.filter-input-wrapper[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-hover);\n  box-shadow: var(--shadow-sm);\n}\n.filter-input-wrapper[_ngcontent-%COMP%]:focus-within {\n  border-color: var(--primary-color);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n  outline: none;\n}\n\n.filter-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 12px;\n  color: var(--text-muted);\n  pointer-events: none;\n  z-index: 1;\n  flex-shrink: 0;\n  transition: var(--transition-fast);\n}\n.filter-input-wrapper[_ngcontent-%COMP%]:focus-within   .filter-icon[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n}\n\n.filter-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 10px 40px 10px 40px;\n  border: none;\n  background: transparent;\n  color: var(--text-primary);\n  font-size: var(--font-size-sm);\n  font-weight: var(--font-weight-medium);\n  outline: none;\n  transition: var(--transition-fast);\n}\n.filter-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--text-muted);\n  font-weight: var(--font-weight-normal);\n}\n.filter-input[_ngcontent-%COMP%]::-webkit-outer-spin-button, .filter-input[_ngcontent-%COMP%]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.filter-input[type=number][_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n\n.filter-clear-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  padding: 0;\n  background: var(--background-tertiary);\n  border: none;\n  border-radius: var(--border-radius-full);\n  color: var(--text-secondary);\n  cursor: pointer;\n  transition: var(--transition-fast);\n  z-index: 1;\n}\n.filter-clear-btn[_ngcontent-%COMP%]:hover {\n  background: var(--danger-color);\n  color: white;\n  transform: scale(1.1);\n}\n.filter-clear-btn[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.filter-clear-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 12px;\n  height: 12px;\n}\n\n.filter-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 40px;\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 8px;\n  background: var(--primary-color);\n  color: white;\n  font-size: var(--font-size-xs);\n  font-weight: var(--font-weight-semibold);\n  border-radius: var(--border-radius-full);\n  white-space: nowrap;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.button-content[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.button-content[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n}\n\n.rotate-180[_ngcontent-%COMP%] {\n  transform: rotate(180deg);\n  transition: transform 0.2s ease;\n}\n\n[data-theme=dark][_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%]:hover, .dark-theme[_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%]:hover {\n  background: var(--background-tertiary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%]:focus-within, .dark-theme[_ngcontent-%COMP%]   .filter-input-wrapper[_ngcontent-%COMP%]:focus-within {\n  background: var(--background-secondary);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .filter-clear-btn[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .filter-clear-btn[_ngcontent-%COMP%] {\n  background: var(--background-quaternary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .filter-clear-btn[_ngcontent-%COMP%]:hover, .dark-theme[_ngcontent-%COMP%]   .filter-clear-btn[_ngcontent-%COMP%]:hover {\n  background: var(--danger-color);\n}\n\n@media (max-width: 1024px) {\n  .header-actions[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: space-between;\n  }\n  .filter-control[_ngcontent-%COMP%] {\n    min-width: 180px;\n    max-width: 220px;\n  }\n}\n@media (max-width: 768px) {\n  .card-header-content[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .header-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 12px;\n  }\n  .header-actions-group[_ngcontent-%COMP%] {\n    justify-content: space-between;\n    width: 100%;\n  }\n  .filter-control[_ngcontent-%COMP%] {\n    width: 100%;\n    min-width: 100%;\n    max-width: 100%;\n  }\n}\n@media (max-width: 480px) {\n  .filter-input[_ngcontent-%COMP%] {\n    font-size: 14px;\n    padding: 9px 36px 9px 36px;\n  }\n  .filter-icon[_ngcontent-%COMP%] {\n    left: 10px;\n    width: 14px;\n    height: 14px;\n  }\n  .filter-clear-btn[_ngcontent-%COMP%] {\n    right: 10px;\n    width: 18px;\n    height: 18px;\n  }\n  .button-content[_ngcontent-%COMP%] {\n    font-size: var(--font-size-xs);\n    gap: 4px;\n  }\n  .button-content[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n    width: 12px;\n    height: 12px;\n  }\n}\n.toggle-section-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 8px;\n  background: transparent;\n  border: 1px solid var(--border-color);\n  border-radius: var(--border-radius-md);\n  color: var(--text-secondary);\n  cursor: pointer;\n  transition: var(--transition-fast);\n}\n.toggle-section-btn[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n  border-color: var(--border-hover);\n  color: var(--text-primary);\n}\n.toggle-section-btn[_ngcontent-%COMP%]:active {\n  background: var(--background-tertiary);\n}\n.toggle-section-btn[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n}\n.toggle-section-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease;\n}\n\n.filter-clear-btn[_ngcontent-%COMP%]:focus-visible, \n.button-content[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n  border-radius: var(--border-radius-sm);\n}\n\n@media (prefers-contrast: high) {\n  .filter-input-wrapper[_ngcontent-%COMP%] {\n    border-width: 2px;\n  }\n  .filter-badge[_ngcontent-%COMP%] {\n    border: 2px solid var(--primary-color);\n  }\n  .filter-icon[_ngcontent-%COMP%] {\n    stroke-width: 2.5px;\n  }\n}\n.collapsed-summary[_ngcontent-%COMP%] {\n  padding: 12px;\n  text-align: center;\n  color: var(--text-secondary);\n  font-size: 14px;\n  background: var(--background-secondary);\n  border-radius: 6px;\n  margin: 8px 0;\n}\n\n.filters-card[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border: 1px solid var(--border-color);\n}\n\n.sort-help[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  background: var(--primary-color);\n  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  border-radius: 6px;\n  margin-bottom: 12px;\n  font-size: 13px;\n}\n.sort-help[_ngcontent-%COMP%]   .sort-help-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n}\n.sort-help[_ngcontent-%COMP%]   .sort-help-text[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 500;\n}\n\n.filters-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  gap: 16px;\n  flex-wrap: wrap;\n  padding: 4px 0;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 180px;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-secondary);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-label[_ngcontent-%COMP%]   .label-hint[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-tertiary);\n  font-style: italic;\n  font-weight: 400;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--background-primary);\n  color: var(--text-primary);\n  font-size: 14px;\n  transition: var(--transition-fast);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--text-tertiary);\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%]::-webkit-outer-spin-button, .filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[_ngcontent-%COMP%]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input[type=number][_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%]   .filter-input.filter-select[_ngcontent-%COMP%] {\n  cursor: pointer;\n  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-position: right 12px center;\n  padding-right: 36px;\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n}\n.filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.active-filters[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding-top: 12px;\n  margin-top: 12px;\n  border-top: 1px solid var(--border-color);\n}\n.active-filters[_ngcontent-%COMP%]   .active-filters-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--text-secondary);\n}\n.active-filters[_ngcontent-%COMP%]   .filter-badge[_ngcontent-%COMP%] {\n  padding: 4px 12px;\n  background: var(--primary-color);\n  color: white;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 500;\n}\n\n.funding-rates-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n}\n\n.loading-state[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  text-align: center;\n  color: var(--text-secondary);\n  gap: 16px;\n}\n.loading-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 16px;\n}\n.loading-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%], \n.error-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%], \n.empty-state[_ngcontent-%COMP%]   .help-text[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-tertiary);\n}\n\n.error-state[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n.tickers-table-wrapper[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  overflow-y: auto;\n  max-height: 700px;\n}\n.tickers-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n.tickers-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-secondary);\n  border-radius: 4px;\n}\n.tickers-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border-color);\n  border-radius: 4px;\n}\n.tickers-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--text-secondary);\n}\n\n.tickers-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 14px;\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  background: var(--background-secondary);\n  z-index: 10;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  text-align: left;\n  font-weight: 600;\n  font-size: 13px;\n  color: var(--text-secondary);\n  border-bottom: 2px solid var(--border-color);\n  white-space: nowrap;\n  -webkit-user-select: none;\n          user-select: none;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.sortable[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: var(--transition-fast);\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.sortable[_ngcontent-%COMP%]:hover {\n  color: var(--text-primary);\n  background: var(--background-tertiary);\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.sortable[_ngcontent-%COMP%]   .sort-indicator[_ngcontent-%COMP%] {\n  margin-left: 4px;\n  color: var(--primary-color);\n  font-weight: bold;\n  display: inline-flex;\n  align-items: center;\n  gap: 2px;\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.sortable[_ngcontent-%COMP%]   .sort-indicator[_ngcontent-%COMP%]   .sort-order[_ngcontent-%COMP%] {\n  font-size: 10px;\n  background: var(--primary-color);\n  color: white;\n  border-radius: 50%;\n  width: 16px;\n  height: 16px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  margin-left: 2px;\n}\n.tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n  border-bottom: 1px solid var(--border-color);\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  color: var(--text-primary);\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--text-primary);\n  font-size: 14px;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%]   .symbol-link[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  text-decoration: none;\n  cursor: pointer;\n  font-weight: 600;\n  transition: var(--transition-fast);\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%]   .symbol-link[_ngcontent-%COMP%]:hover {\n  color: var(--primary-hover, #2563eb);\n  text-decoration: underline;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%]   .symbol-link[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n  border-radius: 2px;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%]   .symbol-link[_ngcontent-%COMP%]:active {\n  color: var(--primary-active, #1d4ed8);\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.funding-rate-cell[_ngcontent-%COMP%], .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.annualized-cell[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n}\n.tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.funding-time[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n}\n\n.funding-positive[_ngcontent-%COMP%] {\n  color: var(--success-color) !important;\n  font-weight: 600;\n}\n\n.funding-negative[_ngcontent-%COMP%] {\n  color: var(--danger-color) !important;\n  font-weight: 600;\n}\n\n.funding-neutral[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n}\n\n.percent-positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n\n.percent-negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n.funding-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 24px;\n  padding: 16px;\n  background: var(--background-secondary);\n  border-top: 1px solid var(--border-color);\n  font-size: 14px;\n  flex-wrap: wrap;\n}\n.funding-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.funding-summary[_ngcontent-%COMP%]   .summary-label[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n  font-weight: 500;\n}\n.funding-summary[_ngcontent-%COMP%]   .summary-value[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 700;\n}\n\n@media (max-width: 1200px) {\n  .tickers-table[_ngcontent-%COMP%] {\n    font-size: 13px;\n  }\n  .tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 12px 14px;\n  }\n}\n@media (max-width: 768px) {\n  .funding-rates-container[_ngcontent-%COMP%] {\n    padding: 12px;\n  }\n  .funding-rates-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .funding-rates-header[_ngcontent-%COMP%]   .funding-rates-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .filters-container[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-group[_ngcontent-%COMP%] {\n    min-width: 100%;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n  .filters-container[_ngcontent-%COMP%]   .filter-actions[_ngcontent-%COMP%]   ui-button[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n  .tickers-table[_ngcontent-%COMP%] {\n    font-size: 12px;\n  }\n  .tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 10px 12px;\n  }\n  .tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(6), \n   .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(6), \n   .tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(7), \n   .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(7) {\n    display: none;\n  }\n  .funding-summary[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 12px;\n  }\n  .funding-summary[_ngcontent-%COMP%]   .summary-item[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: space-between;\n  }\n}\n@media (max-width: 480px) {\n  .tickers-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(5), \n   .tickers-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(5) {\n    display: none;\n  }\n}\n.funding-rate-button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 4px 8px;\n  border-radius: 4px;\n  transition: var(--transition-fast);\n  font: inherit;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n.funding-rate-button[_ngcontent-%COMP%]:hover {\n  background: rgba(59, 130, 246, 0.1);\n}\n.funding-rate-button[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.funding-rate-button.meets-threshold[_ngcontent-%COMP%] {\n  background: rgba(255, 215, 0, 0.1);\n  border: 1px solid rgba(255, 215, 0, 0.3);\n}\n.funding-rate-button.meets-threshold[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 215, 0, 0.2);\n  border-color: rgba(255, 215, 0, 0.5);\n}\n.funding-rate-button[_ngcontent-%COMP%]   .threshold-indicator[_ngcontent-%COMP%] {\n  font-size: 14px;\n  animation: _ngcontent-%COMP%_pulse 2s ease-in-out infinite;\n  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.5));\n}\n\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n  50% {\n    opacity: 0.7;\n    transform: scale(1.1);\n  }\n}\n.leverage-display[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.leverage-display[_ngcontent-%COMP%]   .leverage-value[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--primary-color);\n  padding: 8px 12px;\n  background: rgba(59, 130, 246, 0.1);\n  border-radius: 6px;\n  display: inline-block;\n  width: fit-content;\n}\n.leverage-display[_ngcontent-%COMP%]   .settings-link[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--primary-color);\n  cursor: pointer;\n  padding: 0;\n  font: inherit;\n  text-decoration: underline;\n  transition: var(--transition-fast);\n}\n.leverage-display[_ngcontent-%COMP%]   .settings-link[_ngcontent-%COMP%]:hover {\n  color: var(--primary-hover, #2563eb);\n}\n.leverage-display[_ngcontent-%COMP%]   .settings-link[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n  border-radius: 2px;\n}\n\n.action-column[_ngcontent-%COMP%] {\n  min-width: 100px;\n  width: 100px;\n}\n\n.action-cell[_ngcontent-%COMP%] {\n  padding: 8px !important;\n  vertical-align: middle;\n}\n.action-cell[_ngcontent-%COMP%]   .no-action[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n  opacity: 0.5;\n  font-size: 18px;\n}\n\n.subscriptions-card[_ngcontent-%COMP%] {\n  margin-top: 20px;\n}\n\n.subscriptions-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.subscription-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px;\n  background: var(--background-secondary);\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  gap: 16px;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-symbol[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--primary-color);\n  margin-bottom: 4px;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  font-size: 13px;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%]   .detail-label[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%]   .detail-value[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 600;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%]   .detail-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%]   .detail-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-info[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%]   .detail-separator[_ngcontent-%COMP%] {\n  color: var(--text-tertiary);\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-countdown[_ngcontent-%COMP%]   .countdown-display[_ngcontent-%COMP%] {\n  font-size: 24px;\n  font-weight: 700;\n  color: var(--text-primary);\n  font-variant-numeric: tabular-nums;\n}\n.subscription-item[_ngcontent-%COMP%]   .subscription-countdown[_ngcontent-%COMP%]   .countdown-display.urgent[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n  animation: _ngcontent-%COMP%_pulse 1s infinite;\n}\n\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.6;\n  }\n}\n.deals-card[_ngcontent-%COMP%] {\n  margin-top: 20px;\n}\n\n.deals-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.deal-item[_ngcontent-%COMP%] {\n  padding: 16px;\n  background: var(--background-secondary);\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-symbol[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--primary-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-type[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  padding: 4px 12px;\n  border-radius: 4px;\n  background: var(--background-tertiary);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-type.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n  background: rgba(34, 197, 94, 0.1);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-header[_ngcontent-%COMP%]   .deal-type.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n  background: rgba(239, 68, 68, 0.1);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 13px;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row.highlight[_ngcontent-%COMP%] {\n  padding: 8px;\n  background: var(--background-tertiary);\n  border-radius: 4px;\n  font-size: 14px;\n  font-weight: 600;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row[_ngcontent-%COMP%]   .detail-label[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row[_ngcontent-%COMP%]   .detail-value[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 600;\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row[_ngcontent-%COMP%]   .detail-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.deal-item[_ngcontent-%COMP%]   .deal-details[_ngcontent-%COMP%]   .deal-row[_ngcontent-%COMP%]   .detail-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n\n.dialog-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.5);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n  padding: 20px;\n}\n\n.dialog-content[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border-radius: 12px;\n  max-width: 500px;\n  width: 100%;\n  max-height: 90vh;\n  overflow-y: auto;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\n}\n\n.dialog-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 20px;\n  border-bottom: 1px solid var(--border-color);\n}\n.dialog-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 20px;\n  font-weight: 700;\n  color: var(--text-primary);\n}\n.dialog-header[_ngcontent-%COMP%]   .dialog-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 28px;\n  cursor: pointer;\n  color: var(--text-secondary);\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  transition: var(--transition-fast);\n}\n.dialog-header[_ngcontent-%COMP%]   .dialog-close[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n  color: var(--text-primary);\n}\n\n.dialog-body[_ngcontent-%COMP%] {\n  padding: 20px;\n}\n\n.dialog-info[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border-radius: 8px;\n  padding: 16px;\n  margin-bottom: 20px;\n}\n.dialog-info[_ngcontent-%COMP%]   .info-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 0;\n}\n.dialog-info[_ngcontent-%COMP%]   .info-row[_ngcontent-%COMP%]:not(:last-child) {\n  border-bottom: 1px solid var(--border-color);\n}\n.dialog-info[_ngcontent-%COMP%]   .info-row[_ngcontent-%COMP%]   .info-label[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n  font-size: 14px;\n}\n.dialog-info[_ngcontent-%COMP%]   .info-row[_ngcontent-%COMP%]   .info-value[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 600;\n  font-size: 14px;\n}\n\n.positions-info[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);\n  border: 2px solid var(--primary-color);\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 20px;\n}\n.positions-info[_ngcontent-%COMP%]   .positions-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  color: var(--text-primary);\n  margin: 0 0 16px 0;\n  text-align: center;\n}\n.positions-info[_ngcontent-%COMP%]   .positions-grid[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%] {\n  flex: 1;\n  background: var(--background-primary);\n  border-radius: 8px;\n  padding: 16px;\n  text-align: center;\n  border: 1px solid var(--border-color);\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary);\n  margin-bottom: 8px;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-type[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  margin-bottom: 4px;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-type.long-position[_ngcontent-%COMP%] {\n  color: #10b981;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-type.short-position[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-amount[_ngcontent-%COMP%] {\n  font-size: 24px;\n  font-weight: 700;\n  color: var(--primary-color);\n  margin-bottom: 4px;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-margin[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary);\n  margin-bottom: 8px;\n}\n.positions-info[_ngcontent-%COMP%]   .position-item[_ngcontent-%COMP%]   .position-explanation[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary);\n  font-style: italic;\n}\n.positions-info[_ngcontent-%COMP%]   .position-arrow[_ngcontent-%COMP%] {\n  font-size: 24px;\n  color: var(--text-secondary);\n  flex-shrink: 0;\n}\n\n.dialog-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.dialog-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   .form-label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--text-secondary);\n}\n.dialog-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 10px 14px;\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  background: var(--background-primary);\n  color: var(--text-primary);\n  font-size: 16px;\n  transition: var(--transition-fast);\n}\n.dialog-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n}\n.dialog-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   .form-hint[_ngcontent-%COMP%] {\n  margin-top: 6px;\n  font-size: 12px;\n  color: var(--text-tertiary);\n}\n\n.dialog-warning[_ngcontent-%COMP%] {\n  background: rgba(251, 191, 36, 0.1);\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  border-radius: 6px;\n  padding: 12px;\n  margin-top: 16px;\n}\n.dialog-warning[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.dialog-warning[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 20px;\n}\n.dialog-warning[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n  margin: 4px 0;\n}\n\n.dialog-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 12px;\n  padding: 20px;\n  border-top: 1px solid var(--border-color);\n}\n\n.notifications-container[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 2000;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 400px;\n}\n\n.notification-toast[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  font-size: 14px;\n  color: var(--text-primary);\n  animation: _ngcontent-%COMP%_slideIn 0.3s ease-out;\n}\n.notification-toast.success[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--success-color);\n}\n.notification-toast.error[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--danger-color);\n}\n.notification-toast.info[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--primary-color);\n}\n\n@keyframes _ngcontent-%COMP%_slideIn {\n  from {\n    transform: translateX(100%);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n.expand-button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 4px 8px;\n  margin-right: 8px;\n  color: var(--text-secondary);\n  font-size: 12px;\n  transition: var(--transition-fast);\n  border-radius: 4px;\n}\n.expand-button[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n  color: var(--text-primary);\n}\n.expand-button[aria-expanded=true][_ngcontent-%COMP%] {\n  color: var(--primary-color);\n}\n\n.symbol-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n\n.subscription-row[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n}\n.subscription-row[_ngcontent-%COMP%]   .subscription-cell[_ngcontent-%COMP%] {\n  padding: 0 !important;\n}\n\n.subscription-form-container[_ngcontent-%COMP%] {\n  padding: 20px;\n  border-top: 1px solid var(--border-color);\n  animation: _ngcontent-%COMP%_expandRow 0.3s ease-out;\n}\n\n@keyframes _ngcontent-%COMP%_expandRow {\n  from {\n    opacity: 0;\n    transform: scaleY(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scaleY(1);\n  }\n}\n.subscription-view[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.subscription-view[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .subscription-details[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.subscription-view[_ngcontent-%COMP%]   .dialog-info[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .dialog-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  margin-bottom: 20px;\n  padding: 16px;\n  background: var(--background-primary);\n  border-radius: 8px;\n  border: 1px solid var(--border-color);\n}\n.subscription-view[_ngcontent-%COMP%]   .dialog-form[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .dialog-form[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.subscription-view[_ngcontent-%COMP%]   .dialog-warning[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .dialog-warning[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.subscription-view[_ngcontent-%COMP%]   .form-note[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .form-note[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding: 12px;\n  background: rgba(59, 130, 246, 0.1);\n  border-left: 3px solid var(--primary-color);\n  border-radius: 4px;\n}\n.subscription-view[_ngcontent-%COMP%]   .form-note[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .form-note[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-primary);\n  font-size: 14px;\n}\n.subscription-view[_ngcontent-%COMP%]   .form-actions[_ngcontent-%COMP%], \n.subscription-form[_ngcontent-%COMP%]   .form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding-top: 16px;\n  border-top: 1px solid var(--border-color);\n}\n\n.actions-header[_ngcontent-%COMP%] {\n  min-width: 120px;\n}\n\n.actions-cell[_ngcontent-%COMP%] {\n  min-width: 120px;\n}\n\n.action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  justify-content: center;\n  align-items: center;\n}\n\n.action-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: 1px solid var(--border-color);\n  cursor: pointer;\n  padding: 6px 10px;\n  border-radius: 6px;\n  font-size: 16px;\n  transition: var(--transition-fast);\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 32px;\n  height: 32px;\n}\n.action-btn[_ngcontent-%COMP%]:hover {\n  transform: scale(1.1);\n  background: var(--background-secondary);\n}\n.action-btn[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.action-btn.edit-btn[_ngcontent-%COMP%]:hover {\n  border-color: var(--primary-color);\n  background: rgba(59, 130, 246, 0.1);\n}\n.action-btn.cancel-btn[_ngcontent-%COMP%]:hover {\n  border-color: #ef4444;\n  background: rgba(239, 68, 68, 0.1);\n}\n.action-btn.start-btn[_ngcontent-%COMP%]:hover {\n  border-color: #10b981;\n  background: rgba(16, 185, 129, 0.1);\n}\n.action-btn.subscribe-btn[_ngcontent-%COMP%] {\n  background: var(--primary-color);\n  color: white;\n  border-color: var(--primary-color);\n  font-size: 20px;\n  font-weight: bold;\n}\n.action-btn.subscribe-btn[_ngcontent-%COMP%]:hover {\n  background: var(--primary-hover, #2563eb);\n  border-color: var(--primary-hover, #2563eb);\n  transform: scale(1.1);\n}\n\n.subscription-indicator[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--primary-color);\n  font-weight: bold;\n  animation: _ngcontent-%COMP%_fadeIn 0.3s ease-in;\n}\n\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n    transform: scale(0.8);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.funding-rate-button[_ngcontent-%COMP%]:disabled {\n  cursor: default;\n  opacity: 0.7;\n}\n.funding-rate-button[_ngcontent-%COMP%]:disabled:hover {\n  background: rgba(59, 130, 246, 0.05);\n}\n.funding-rate-button[_ngcontent-%COMP%]:disabled:active {\n  transform: none;\n}\n\n.arbitrage-card[_ngcontent-%COMP%] {\n  margin-top: 20px;\n  overflow: hidden;\n}\n\n.arbitrage-table-wrapper[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  overflow-y: auto;\n  max-height: 700px;\n}\n.arbitrage-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n.arbitrage-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-secondary);\n  border-radius: 4px;\n}\n.arbitrage-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border-color);\n  border-radius: 4px;\n}\n.arbitrage-table-wrapper[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--text-secondary);\n}\n\n.arbitrage-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 14px;\n}\n.arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  background: var(--background-secondary);\n  z-index: 10;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n}\n.arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  text-align: left;\n  font-weight: 600;\n  font-size: 13px;\n  color: var(--text-secondary);\n  border-bottom: 2px solid var(--border-color);\n  white-space: nowrap;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.text-center[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n  border-bottom: 1px solid var(--border-color);\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: var(--background-secondary);\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.opportunity-row[_ngcontent-%COMP%] {\n  background: rgba(255, 215, 0, 0.05);\n  border-left: 3px solid rgba(255, 215, 0, 0.5);\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.has-subscription[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.05) !important;\n  border-left: 3px solid var(--primary-color) !important;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.has-subscription[_ngcontent-%COMP%]:hover {\n  background: rgba(59, 130, 246, 0.1) !important;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 14px 16px;\n  color: var(--text-primary);\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.text-center[_ngcontent-%COMP%] {\n  text-align: center;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--text-primary);\n  font-size: 14px;\n}\n.arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td.symbol-cell[_ngcontent-%COMP%]   .symbol-text[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  font-weight: 600;\n}\n\n.exchanges-cell[_ngcontent-%COMP%]   .exchanges-badges[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n  justify-content: center;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge[_ngcontent-%COMP%] {\n  padding: 4px 10px;\n  border-radius: 12px;\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  white-space: nowrap;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.exchange-badge-button[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: var(--transition-fast);\n  border-width: 1px;\n  border-style: solid;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.exchange-badge-button[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);\n  filter: brightness(1.1);\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.exchange-badge-button[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.exchange-badge-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bybit[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.1);\n  border-color: rgba(245, 158, 11, 0.3);\n  color: #f59e0b;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bybit.exchange-badge-button[_ngcontent-%COMP%]:hover {\n  background: rgba(245, 158, 11, 0.2);\n  border-color: rgba(245, 158, 11, 0.5);\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bingx[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.1);\n  border-color: rgba(139, 92, 246, 0.3);\n  color: #8b5cf6;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-bingx.exchange-badge-button[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: rgba(139, 92, 246, 0.5);\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-binance[_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.1);\n  border-color: rgba(234, 179, 8, 0.3);\n  color: #eab308;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-binance.exchange-badge-button[_ngcontent-%COMP%]:hover {\n  background: rgba(234, 179, 8, 0.2);\n  border-color: rgba(234, 179, 8, 0.5);\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-okx[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.1);\n  border-color: rgba(59, 130, 246, 0.3);\n  color: #3b82f6;\n}\n.exchanges-cell[_ngcontent-%COMP%]   .exchange-badge.badge-okx.exchange-badge-button[_ngcontent-%COMP%]:hover {\n  background: rgba(59, 130, 246, 0.2);\n  border-color: rgba(59, 130, 246, 0.5);\n}\n\n.position-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  align-items: flex-end;\n}\n.position-info[_ngcontent-%COMP%]   .exchange-label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-tertiary);\n  text-transform: uppercase;\n  font-weight: 500;\n}\n.position-info[_ngcontent-%COMP%]   .rate-value[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n}\n.position-info[_ngcontent-%COMP%]   .rate-value.positive[_ngcontent-%COMP%] {\n  color: var(--success-color);\n}\n.position-info[_ngcontent-%COMP%]   .rate-value.negative[_ngcontent-%COMP%] {\n  color: var(--danger-color);\n}\n.position-info[_ngcontent-%COMP%]   .environment-tag[_ngcontent-%COMP%] {\n  font-size: 10px;\n  padding: 2px 6px;\n  background: var(--background-tertiary);\n  border-radius: 4px;\n  color: var(--text-tertiary);\n  font-weight: 500;\n}\n\n.spread-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  align-items: flex-end;\n}\n.spread-info[_ngcontent-%COMP%]   .spread-value[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 700;\n  color: var(--text-primary);\n}\n.spread-info[_ngcontent-%COMP%]   .spread-value.high-spread[_ngcontent-%COMP%] {\n  color: #f59e0b;\n  animation: _ngcontent-%COMP%_pulse 2s ease-in-out infinite;\n}\n.spread-info[_ngcontent-%COMP%]   .spread-percent[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary);\n  font-weight: 500;\n}\n\n.opportunity-badge[_ngcontent-%COMP%] {\n  padding: 4px 12px;\n  border-radius: 12px;\n  font-size: 12px;\n  font-weight: 600;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n.opportunity-badge.success[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.1);\n  border: 1px solid rgba(34, 197, 94, 0.3);\n  color: #22c55e;\n}\n.opportunity-badge.neutral[_ngcontent-%COMP%] {\n  background: var(--background-tertiary);\n  border: 1px solid var(--border-color);\n  color: var(--text-secondary);\n}\n\n@media (max-width: 1200px) {\n  .arbitrage-table[_ngcontent-%COMP%] {\n    font-size: 13px;\n  }\n  .arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 12px 14px;\n  }\n}\n@media (max-width: 768px) {\n  .arbitrage-table[_ngcontent-%COMP%] {\n    font-size: 12px;\n  }\n  .arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 10px 12px;\n  }\n  .arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(2), \n   .arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(2) {\n    display: none;\n  }\n  .exchanges-cell[_ngcontent-%COMP%]   .exchanges-badges[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n}\n@media (max-width: 480px) {\n  .arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(3), \n   .arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(3), \n   .arbitrage-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(4), \n   .arbitrage-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(4) {\n    display: none;\n  }\n}\n.balance-info[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\n.balance-info.loading[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--text-secondary);\n  font-size: 14px;\n}\n.balance-info[_ngcontent-%COMP%]   .balance-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n}\n.balance-info[_ngcontent-%COMP%]   .balance-row[_ngcontent-%COMP%]:not(:last-child) {\n  border-bottom: 1px solid var(--border-color);\n}\n.balance-info[_ngcontent-%COMP%]   .balance-row[_ngcontent-%COMP%]   .balance-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary);\n}\n.balance-info[_ngcontent-%COMP%]   .balance-row[_ngcontent-%COMP%]   .balance-value[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.balance-info[_ngcontent-%COMP%]   .balance-row[_ngcontent-%COMP%]   .balance-value.low-balance[_ngcontent-%COMP%] {\n  color: #ef4444;\n  animation: _ngcontent-%COMP%_pulse-red 2s ease-in-out infinite;\n}\n\n@keyframes _ngcontent-%COMP%_pulse-red {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.6;\n  }\n}\n.position-calculation[_ngcontent-%COMP%] {\n  background: var(--background-tertiary);\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  padding: 16px;\n  margin-top: 16px;\n  margin-bottom: 16px;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--text-primary);\n  margin: 0 0 16px 0;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 12px;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 0;\n  border-bottom: 1px dashed var(--border-color);\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row.important[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.1);\n  padding: 10px 12px;\n  border-radius: 4px;\n  border: 1px solid rgba(59, 130, 246, 0.3);\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row.important[_ngcontent-%COMP%]   .calc-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #3b82f6;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row.important[_ngcontent-%COMP%]   .calc-value[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #3b82f6;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row[_ngcontent-%COMP%]   .calc-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary);\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-grid[_ngcontent-%COMP%]   .calc-row[_ngcontent-%COMP%]   .calc-value[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text-primary);\n  font-family: \"Roboto Mono\", monospace;\n}\n.position-calculation[_ngcontent-%COMP%]   .calculation-note[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  padding: 10px;\n  background: rgba(59, 130, 246, 0.05);\n  border-left: 3px solid #3b82f6;\n  font-size: 13px;\n  color: var(--text-secondary);\n  line-height: 1.5;\n}\n\n.settings-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--background-overlay);\n  backdrop-filter: blur(4px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: var(--z-modal-backdrop);\n  padding: var(--spacing-lg);\n  animation: _ngcontent-%COMP%_settingsFadeIn 0.2s ease-out;\n}\n@media (max-width: 768px) {\n  .settings-overlay[_ngcontent-%COMP%] {\n    padding: 0;\n    align-items: flex-end;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_settingsFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.settings-modal[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border-radius: var(--border-radius-xl);\n  max-width: 600px;\n  width: 100%;\n  max-height: 90vh;\n  overflow: hidden;\n  box-shadow: var(--shadow-overlay);\n  display: flex;\n  flex-direction: column;\n  animation: _ngcontent-%COMP%_settingsSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n@media (max-width: 768px) {\n  .settings-modal[_ngcontent-%COMP%] {\n    max-width: 100%;\n    border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;\n    max-height: 85vh;\n    animation: _ngcontent-%COMP%_settingsSlideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  }\n}\n\n@keyframes _ngcontent-%COMP%_settingsSlideUp {\n  from {\n    opacity: 0;\n    transform: translateY(20px) scale(0.98);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n@keyframes _ngcontent-%COMP%_settingsSlideUpMobile {\n  from {\n    transform: translateY(100%);\n  }\n  to {\n    transform: translateY(0);\n  }\n}\n.settings-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: var(--spacing-lg) var(--spacing-xl);\n  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  position: relative;\n  overflow: hidden;\n}\n.settings-header[_ngcontent-%COMP%]::before {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);\n  pointer-events: none;\n}\n.settings-header[_ngcontent-%COMP%]   .settings-header-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-md);\n  position: relative;\n  z-index: 1;\n}\n.settings-header[_ngcontent-%COMP%]   .settings-icon[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  background: rgba(255, 255, 255, 0.15);\n  border-radius: var(--border-radius-lg);\n  color: white;\n  backdrop-filter: blur(10px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.settings-header[_ngcontent-%COMP%]   .settings-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_settingsIconRotate 8s linear infinite;\n}\n.settings-header[_ngcontent-%COMP%]   .settings-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: var(--font-size-xl);\n  font-weight: var(--font-weight-bold);\n  color: white;\n  letter-spacing: -0.02em;\n}\n.settings-header[_ngcontent-%COMP%]   .settings-close[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 36px;\n  height: 36px;\n  background: rgba(255, 255, 255, 0.15);\n  border: none;\n  border-radius: var(--border-radius-md);\n  color: white;\n  cursor: pointer;\n  transition: var(--transition-fast);\n  backdrop-filter: blur(10px);\n  position: relative;\n  z-index: 1;\n}\n.settings-header[_ngcontent-%COMP%]   .settings-close[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.25);\n  transform: scale(1.05);\n}\n.settings-header[_ngcontent-%COMP%]   .settings-close[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.settings-header[_ngcontent-%COMP%]   .settings-close[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid white;\n  outline-offset: 2px;\n}\n\n@keyframes _ngcontent-%COMP%_settingsIconRotate {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n.settings-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: var(--spacing-xl);\n  background: var(--background-secondary);\n}\n.settings-body[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n}\n.settings-body[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-tertiary);\n  border-radius: var(--border-radius-sm);\n}\n.settings-body[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border-color);\n  border-radius: var(--border-radius-sm);\n}\n.settings-body[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--border-hover);\n}\n@media (max-width: 768px) {\n  .settings-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg);\n  }\n}\n\n.settings-section[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border: 1px solid var(--border-color);\n  border-radius: var(--border-radius-lg);\n  padding: var(--spacing-lg);\n  margin-bottom: var(--spacing-lg);\n  transition: var(--transition-fast);\n}\n.settings-section[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-hover);\n  box-shadow: var(--shadow-sm);\n}\n.settings-section[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-sm);\n  margin-bottom: var(--spacing-lg);\n  padding-bottom: var(--spacing-md);\n  border-bottom: 2px solid var(--border-color);\n}\n.settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .section-icon[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  flex-shrink: 0;\n}\n.settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: var(--font-size-lg);\n  font-weight: var(--font-weight-semibold);\n  color: var(--text-primary);\n  letter-spacing: -0.01em;\n}\n\n.settings-field[_ngcontent-%COMP%] {\n  margin-bottom: var(--spacing-lg);\n}\n.settings-field[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.settings-field[_ngcontent-%COMP%]   .field-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-sm);\n  margin-bottom: var(--spacing-sm);\n  font-size: var(--font-size-sm);\n  font-weight: var(--font-weight-medium);\n  color: var(--text-secondary);\n}\n.settings-field[_ngcontent-%COMP%]   .field-label[_ngcontent-%COMP%]   .field-icon[_ngcontent-%COMP%] {\n  color: var(--primary-color);\n  flex-shrink: 0;\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 12px 16px;\n  background: var(--background-secondary);\n  border: 2px solid var(--border-color);\n  border-radius: var(--border-radius-md);\n  color: var(--text-primary);\n  font-size: var(--font-size-base);\n  font-weight: var(--font-weight-medium);\n  transition: var(--transition-fast);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--text-muted);\n  font-weight: var(--font-weight-normal);\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-hover);\n  background: var(--background-primary);\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color);\n  background: var(--background-primary);\n  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]::-webkit-outer-spin-button, .settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.settings-field[_ngcontent-%COMP%]   .field-input[type=number][_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n.settings-field[_ngcontent-%COMP%]   .field-help[_ngcontent-%COMP%] {\n  margin: var(--spacing-sm) 0 0 0;\n  font-size: var(--font-size-xs);\n  color: var(--text-muted);\n  line-height: var(--line-height-relaxed);\n}\n\n.field-checkbox[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: var(--spacing-md);\n  cursor: pointer;\n  -webkit-user-select: none;\n          user-select: none;\n  padding: var(--spacing-md);\n  background: var(--background-secondary);\n  border: 2px solid var(--border-color);\n  border-radius: var(--border-radius-md);\n  transition: var(--transition-fast);\n}\n.field-checkbox[_ngcontent-%COMP%]:hover {\n  border-color: var(--border-hover);\n  background: var(--background-primary);\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-input[_ngcontent-%COMP%] {\n  position: absolute;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-input[_ngcontent-%COMP%]:checked    + .checkbox-custom[_ngcontent-%COMP%] {\n  background: var(--primary-color);\n  border-color: var(--primary-color);\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-input[_ngcontent-%COMP%]:checked    + .checkbox-custom[_ngcontent-%COMP%]::after {\n  opacity: 1;\n  transform: scale(1);\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-input[_ngcontent-%COMP%]:focus-visible    + .checkbox-custom[_ngcontent-%COMP%] {\n  outline: 2px solid var(--primary-color);\n  outline-offset: 2px;\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-custom[_ngcontent-%COMP%] {\n  position: relative;\n  width: 20px;\n  height: 20px;\n  background: var(--background-primary);\n  border: 2px solid var(--border-color);\n  border-radius: var(--border-radius-sm);\n  flex-shrink: 0;\n  transition: var(--transition-fast);\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-custom[_ngcontent-%COMP%]::after {\n  content: \"\";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%) scale(0);\n  width: 10px;\n  height: 10px;\n  background: white;\n  mask: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\") center/contain no-repeat;\n  opacity: 0;\n  transition: var(--transition-fast);\n}\n.field-checkbox[_ngcontent-%COMP%]   .checkbox-label[_ngcontent-%COMP%] {\n  font-size: var(--font-size-sm);\n  font-weight: var(--font-weight-medium);\n  color: var(--text-primary);\n}\n\n.settings-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: var(--spacing-md);\n  padding: var(--spacing-lg) var(--spacing-xl);\n  background: var(--background-primary);\n  border-top: 1px solid var(--border-color);\n}\n@media (max-width: 768px) {\n  .settings-footer[_ngcontent-%COMP%] {\n    flex-direction: column-reverse;\n    gap: var(--spacing-sm);\n  }\n  .settings-footer[_ngcontent-%COMP%]   ui-button[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n\n.button-with-icon[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--spacing-sm);\n}\n.button-with-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: var(--transition-fast);\n}\n.button-with-icon[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%] {\n  transform: translateY(-1px);\n}\n\n[data-theme=dark][_ngcontent-%COMP%]   .settings-header[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .settings-header[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);\n  border-bottom-color: rgba(255, 255, 255, 0.05);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border-color: var(--border-color);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%]:hover, .dark-theme[_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%]:hover {\n  border-color: rgba(59, 130, 246, 0.3);\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  border-bottom-color: rgba(255, 255, 255, 0.1);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%] {\n  background: var(--background-tertiary);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:hover, .dark-theme[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:hover {\n  border-color: rgba(255, 255, 255, 0.15);\n  background: var(--background-secondary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:focus, .dark-theme[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--primary-color);\n  background: var(--background-secondary);\n  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .field-checkbox[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .field-checkbox[_ngcontent-%COMP%] {\n  background: var(--background-tertiary);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .field-checkbox[_ngcontent-%COMP%]:hover, .dark-theme[_ngcontent-%COMP%]   .field-checkbox[_ngcontent-%COMP%]:hover {\n  border-color: rgba(255, 255, 255, 0.15);\n  background: var(--background-secondary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .checkbox-custom[_ngcontent-%COMP%], .dark-theme[_ngcontent-%COMP%]   .checkbox-custom[_ngcontent-%COMP%] {\n  background: var(--background-quaternary);\n  border-color: rgba(255, 255, 255, 0.15);\n}\n\n@media (prefers-contrast: high) {\n  .settings-modal[_ngcontent-%COMP%] {\n    border: 2px solid var(--text-primary);\n  }\n  .settings-header[_ngcontent-%COMP%] {\n    background: var(--primary-color);\n    border-bottom: 2px solid var(--text-primary);\n  }\n  .field-input[_ngcontent-%COMP%], \n   .field-checkbox[_ngcontent-%COMP%] {\n    border-width: 2px;\n  }\n  .section-header[_ngcontent-%COMP%] {\n    border-bottom-width: 3px;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .settings-overlay[_ngcontent-%COMP%], \n   .settings-modal[_ngcontent-%COMP%], \n   .field-input[_ngcontent-%COMP%], \n   .field-checkbox[_ngcontent-%COMP%], \n   .settings-close[_ngcontent-%COMP%], \n   .checkbox-custom[_ngcontent-%COMP%], \n   .button-with-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n    animation: none;\n    transition: none;\n  }\n  .settings-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n    animation: none;\n  }\n}\n@media (max-width: 480px) {\n  .settings-header[_ngcontent-%COMP%] {\n    padding: var(--spacing-md) var(--spacing-lg);\n  }\n  .settings-header[_ngcontent-%COMP%]   .settings-icon[_ngcontent-%COMP%] {\n    width: 36px;\n    height: 36px;\n  }\n  .settings-header[_ngcontent-%COMP%]   .settings-title[_ngcontent-%COMP%] {\n    font-size: var(--font-size-lg);\n  }\n  .settings-header[_ngcontent-%COMP%]   .settings-close[_ngcontent-%COMP%] {\n    width: 32px;\n    height: 32px;\n  }\n  .settings-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n  .settings-section[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n  .settings-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: var(--spacing-xs);\n  }\n  .settings-field[_ngcontent-%COMP%]   .field-input[_ngcontent-%COMP%] {\n    padding: 10px 14px;\n    font-size: var(--font-size-sm);\n  }\n  .field-checkbox[_ngcontent-%COMP%] {\n    padding: var(--spacing-sm);\n  }\n  .settings-footer[_ngcontent-%COMP%] {\n    padding: var(--spacing-md) var(--spacing-lg);\n  }\n}\n.subscription-action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding: 4px;\n}\n@media (max-width: 768px) {\n  .subscription-action-buttons[_ngcontent-%COMP%] {\n    gap: 6px;\n  }\n}\n\n.action-cell[_ngcontent-%COMP%] {\n  min-width: 150px;\n  vertical-align: middle;\n}\n@media (max-width: 768px) {\n  .action-cell[_ngcontent-%COMP%] {\n    min-width: 120px;\n  }\n}\n\n.action-btn.start-btn[_ngcontent-%COMP%] {\n  --button-color: #10b981;\n  --button-hover-color: #059669;\n  color: var(--button-color);\n}\n.action-btn.start-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  fill: var(--button-color);\n}\n.action-btn.edit-btn[_ngcontent-%COMP%] {\n  --button-color: #3b82f6;\n  --button-hover-color: #2563eb;\n  color: var(--button-color);\n}\n.action-btn.edit-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  stroke: var(--button-color);\n}\n.action-btn.cancel-btn[_ngcontent-%COMP%] {\n  --button-color: #ef4444;\n  --button-hover-color: #dc2626;\n  color: var(--button-color);\n}\n.action-btn.cancel-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  stroke: var(--button-color);\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL2Z1bmRpbmctcmF0ZXMvZnVuZGluZy1yYXRlcy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQUE7RUFDQSxzQkFBQTtFQUNBLFNBQUE7RUFDQSxhQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSw4QkFBQTtFQUNBLFNBQUE7RUFDQSxlQUFBO0FBQ0Y7QUFDRTtFQUNFLFNBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSwwQkFBQTtBQUNKO0FBRUU7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtBQUFKOztBQUtBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsOEJBQUE7RUFDQSxXQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7QUFGRjs7QUFNQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFNBQUE7RUFDQSxlQUFBO0VBQ0EsT0FBQTtFQUNBLHlCQUFBO0FBSEY7O0FBTUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxRQUFBO0FBSEY7O0FBT0E7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0FBSkY7QUFNRTtFQU5GO0lBT0ksZUFBQTtJQUNBLGVBQUE7RUFIRjtBQUNGOztBQU1BO0VBQ0Usa0JBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxxQ0FBQTtFQUNBLHFDQUFBO0VBQ0Esc0NBQUE7RUFDQSxrQ0FBQTtFQUNBLGdCQUFBO0FBSEY7QUFLRTtFQUNFLGlDQUFBO0VBQ0EsNEJBQUE7QUFISjtBQU1FO0VBQ0Usa0NBQUE7RUFDQSw2Q0FBQTtFQUNBLGFBQUE7QUFKSjs7QUFRQTtFQUNFLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLHdCQUFBO0VBQ0Esb0JBQUE7RUFDQSxVQUFBO0VBQ0EsY0FBQTtFQUNBLGtDQUFBO0FBTEY7QUFPRTtFQUNFLDJC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QUE7QUE5WUo7QUFnWkk7RUFDRSx5QkFBQTtBQTlZTjtBQWtaRTtFQUNFLHVCQUFBO0VBQ0EsNkJBQUE7RUFDQSwwQkFBQTtBQWhaSjtBQWtaSTtFQUNFLDJCQUFBO0FBaFpOO0FBb1pFO0VBQ0UsdUJBQUE7RUFDQSw2QkFBQTtFQUNBLDBCQUFBO0FBbFpKO0FBb1pJO0VBQ0UsMkJBQUE7QUFsWk4iLCJzb3VyY2VzQ29udGVudCI6WyIuZnVuZGluZy1yYXRlcy1jb250YWluZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDIwcHg7XG4gIHBhZGRpbmc6IDIwcHg7XG59XG5cbi5mdW5kaW5nLXJhdGVzLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgZ2FwOiAxNnB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG5cbiAgLmZ1bmRpbmctcmF0ZXMtdGl0bGUge1xuICAgIG1hcmdpbjogMDtcbiAgICBmb250LXNpemU6IDI0cHg7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgfVxuXG4gIC5mdW5kaW5nLXJhdGVzLWFjdGlvbnMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDEycHg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICB9XG59XG5cbi8vIENhcmQgSGVhZGVyXG4uY2FyZC1oZWFkZXItY29udGVudCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgd2lkdGg6IDEwMCU7XG4gIGdhcDogMTZweDtcbiAgZmxleC13cmFwOiB3cmFwO1xufVxuXG4vLyBIZWFkZXIgQWN0aW9ucyBDb250YWluZXJcbi5oZWFkZXItYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMTJweDtcbiAgZmxleC13cmFwOiB3cmFwO1xuICBmbGV4OiAxO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xufVxuXG4uaGVhZGVyLWFjdGlvbnMtZ3JvdXAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDhweDtcbn1cblxuLy8gRmlsdGVyIENvbnRyb2xzXG4uZmlsdGVyLWNvbnRyb2wge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG1pbi13aWR0aDogMjAwcHg7XG4gIG1heC13aWR0aDogMjgwcHg7XG4gIGZsZXg6IDEgMSBhdXRvO1xuXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgIG1pbi13aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gIH1cbn1cblxuLmZpbHRlci1pbnB1dC13cmFwcGVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLWxnKTtcbiAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcblxuICAmOmhvdmVyIHtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1ob3Zlcik7XG4gICAgYm94LXNoYWRvdzogdmFyKC0tc2hhZG93LXNtKTtcbiAgfVxuXG4gICY6Zm9jdXMtd2l0aGluIHtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICBvdXRsaW5lOiBub25lO1xuICB9XG59XG5cbi5maWx0ZXItaWNvbiB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgbGVmdDogMTJweDtcbiAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgei1pbmRleDogMTtcbiAgZmxleC1zaHJpbms6IDA7XG4gIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgLmZpbHRlci1pbnB1dC13cmFwcGVyOmZvY3VzLXdpdGhpbiAmIHtcbiAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gIH1cbn1cblxuLmZpbHRlci1pbnB1dCB7XG4gIHdpZHRoOiAxMDAlO1xuICBwYWRkaW5nOiAxMHB4IDQwcHggMTBweCA0MHB4O1xuICBib3JkZXI6IG5vbmU7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtc20pO1xuICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbWVkaXVtKTtcbiAgb3V0bGluZTogbm9uZTtcbiAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcblxuICAmOjpwbGFjZWhvbGRlciB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpO1xuICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ub3JtYWwpO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHNwaW5uZXIgYXJyb3dzIGZvciBudW1iZXIgaW5wdXRzXG4gICY6Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24sXG4gICY6Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24ge1xuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgICBtYXJnaW46IDA7XG4gIH1cblxuICAmW3R5cGU9bnVtYmVyXSB7XG4gICAgLW1vei1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7XG4gIH1cbn1cblxuLmZpbHRlci1jbGVhci1idG4ge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiAxMnB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgd2lkdGg6IDIwcHg7XG4gIGhlaWdodDogMjBweDtcbiAgcGFkZGluZzogMDtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gIGJvcmRlcjogbm9uZTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1mdWxsKTtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICB6LWluZGV4OiAxO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWRhbmdlci1jb2xvcik7XG4gICAgY29sb3I6IHdoaXRlO1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4xKTtcbiAgfVxuXG4gICY6YWN0aXZlIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOTUpO1xuICB9XG5cbiAgc3ZnIHtcbiAgICB3aWR0aDogMTJweDtcbiAgICBoZWlnaHQ6IDEycHg7XG4gIH1cbn1cblxuLmZpbHRlci1iYWRnZSB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgcmlnaHQ6IDQwcHg7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAycHggOHB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgY29sb3I6IHdoaXRlO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14cyk7XG4gIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1zZW1pYm9sZCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtZnVsbCk7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB6LWluZGV4OiAxO1xufVxuXG4vLyBCdXR0b24gY29udGVudCBzdHlsaW5nXG4uYnV0dG9uLWNvbnRlbnQge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiA2cHg7XG5cbiAgc3ZnIHtcbiAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICB9XG59XG5cbi8vIFJvdGF0ZSBhbmltYXRpb24gZm9yIGNoZXZyb25cbi5yb3RhdGUtMTgwIHtcbiAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZTtcbn1cblxuLy8gRGFyayB0aGVtZSBlbmhhbmNlbWVudHNcbltkYXRhLXRoZW1lPVwiZGFya1wiXSwgLmRhcmstdGhlbWUge1xuICAuZmlsdGVyLWlucHV0LXdyYXBwZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgfVxuXG4gICAgJjpmb2N1cy13aXRoaW4ge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgICAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjIpO1xuICAgIH1cbiAgfVxuXG4gIC5maWx0ZXItY2xlYXItYnRuIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXF1YXRlcm5hcnkpO1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1kYW5nZXItY29sb3IpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBSZXNwb25zaXZlIGFkanVzdG1lbnRzIGZvciBoZWFkZXIgYWN0aW9uc1xuQG1lZGlhIChtYXgtd2lkdGg6IDEwMjRweCkge1xuICAuaGVhZGVyLWFjdGlvbnMge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgfVxuXG4gIC5maWx0ZXItY29udHJvbCB7XG4gICAgbWluLXdpZHRoOiAxODBweDtcbiAgICBtYXgtd2lkdGg6IDIyMHB4O1xuICB9XG59XG5cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAuY2FyZC1oZWFkZXItY29udGVudCB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgfVxuXG4gIC5oZWFkZXItYWN0aW9ucyB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcbiAgICBnYXA6IDEycHg7XG4gIH1cblxuICAuaGVhZGVyLWFjdGlvbnMtZ3JvdXAge1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxuXG4gIC5maWx0ZXItY29udHJvbCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWluLXdpZHRoOiAxMDAlO1xuICAgIG1heC13aWR0aDogMTAwJTtcbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNDgwcHgpIHtcbiAgLmZpbHRlci1pbnB1dCB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIHBhZGRpbmc6IDlweCAzNnB4IDlweCAzNnB4O1xuICB9XG5cbiAgLmZpbHRlci1pY29uIHtcbiAgICBsZWZ0OiAxMHB4O1xuICAgIHdpZHRoOiAxNHB4O1xuICAgIGhlaWdodDogMTRweDtcbiAgfVxuXG4gIC5maWx0ZXItY2xlYXItYnRuIHtcbiAgICByaWdodDogMTBweDtcbiAgICB3aWR0aDogMThweDtcbiAgICBoZWlnaHQ6IDE4cHg7XG4gIH1cblxuICAuYnV0dG9uLWNvbnRlbnQge1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXhzKTtcbiAgICBnYXA6IDRweDtcblxuICAgIHN2ZyB7XG4gICAgICB3aWR0aDogMTJweDtcbiAgICAgIGhlaWdodDogMTJweDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVG9nZ2xlIHNlY3Rpb24gYnV0dG9uXG4udG9nZ2xlLXNlY3Rpb24tYnRuIHtcbiAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBwYWRkaW5nOiA4cHg7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLW1kKTtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1ob3Zlcik7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAmOmFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gIH1cblxuICAmOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xuICB9XG5cbiAgc3ZnIHtcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBlYXNlO1xuICB9XG59XG5cbi8vIEZvY3VzIHZpc2libGUgc3R5bGVzIGZvciBhY2Nlc3NpYmlsaXR5XG4uZmlsdGVyLWNsZWFyLWJ0bjpmb2N1cy12aXNpYmxlLFxuLmJ1dHRvbi1jb250ZW50OmZvY3VzLXZpc2libGUge1xuICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gIG91dGxpbmUtb2Zmc2V0OiAycHg7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtc20pO1xufVxuXG4vLyBIaWdoIGNvbnRyYXN0IG1vZGUgc3VwcG9ydFxuQG1lZGlhIChwcmVmZXJzLWNvbnRyYXN0OiBoaWdoKSB7XG4gIC5maWx0ZXItaW5wdXQtd3JhcHBlciB7XG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIH1cblxuICAuZmlsdGVyLWJhZGdlIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgfVxuXG4gIC5maWx0ZXItaWNvbiB7XG4gICAgc3Ryb2tlLXdpZHRoOiAyLjVweDtcbiAgfVxufVxuXG4vLyBDb2xsYXBzZWQgU3VtbWFyeVxuLmNvbGxhcHNlZC1zdW1tYXJ5IHtcbiAgcGFkZGluZzogMTJweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBtYXJnaW46IDhweCAwO1xufVxuXG4vLyBGaWx0ZXJzIENhcmRcbi5maWx0ZXJzLWNhcmQge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG4uc29ydC1oZWxwIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiA4cHg7XG4gIHBhZGRpbmc6IDhweCAxMnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkgMCUsIHJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSAxMDAlKTtcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg1OSwgMTMwLCAyNDYsIDAuMik7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgZm9udC1zaXplOiAxM3B4O1xuXG4gIC5zb3J0LWhlbHAtaWNvbiB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICB9XG5cbiAgLnNvcnQtaGVscC10ZXh0IHtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICB9XG59XG5cbi5maWx0ZXJzLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcbiAgZ2FwOiAxNnB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG4gIHBhZGRpbmc6IDRweCAwO1xuXG4gIC5maWx0ZXItZ3JvdXAge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBnYXA6IDZweDtcbiAgICBtaW4td2lkdGg6IDE4MHB4O1xuXG4gICAgLmZpbHRlci1sYWJlbCB7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcblxuICAgICAgLmxhYmVsLWhpbnQge1xuICAgICAgICBmb250LXNpemU6IDExcHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXRlcnRpYXJ5KTtcbiAgICAgICAgZm9udC1zdHlsZTogaXRhbGljO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIC5maWx0ZXItaW5wdXQge1xuICAgICAgcGFkZGluZzogOHB4IDEycHg7XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcblxuICAgICAgJjpmb2N1cyB7XG4gICAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICAgIH1cblxuICAgICAgJjo6cGxhY2Vob2xkZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBzcGlubmVyIGFycm93c1xuICAgICAgJjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbixcbiAgICAgICY6Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24ge1xuICAgICAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgIH1cblxuICAgICAgJlt0eXBlPW51bWJlcl0ge1xuICAgICAgICAtbW96LWFwcGVhcmFuY2U6IHRleHRmaWVsZDtcbiAgICAgIH1cblxuICAgICAgJi5maWx0ZXItc2VsZWN0IHtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9JzEyJyBoZWlnaHQ9JzEyJyB2aWV3Qm94PScwIDAgMTIgMTInJTNFJTNDcGF0aCBmaWxsPSclMjM2NjYnIGQ9J002IDlMMSA0aDEweicvJTNFJTNDL3N2ZyUzRVwiKTtcbiAgICAgICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMTJweCBjZW50ZXI7XG4gICAgICAgIHBhZGRpbmctcmlnaHQ6IDM2cHg7XG4gICAgICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgICAgICAgLW1vei1hcHBlYXJhbmNlOiBub25lO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC5maWx0ZXItYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogOHB4O1xuICB9XG59XG5cbi5hY3RpdmUtZmlsdGVycyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogOHB4O1xuICBmbGV4LXdyYXA6IHdyYXA7XG4gIHBhZGRpbmctdG9wOiAxMnB4O1xuICBtYXJnaW4tdG9wOiAxMnB4O1xuICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcblxuICAuYWN0aXZlLWZpbHRlcnMtbGFiZWwge1xuICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gIH1cblxuICAuZmlsdGVyLWJhZGdlIHtcbiAgICBwYWRkaW5nOiA0cHggMTJweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgfVxufVxuXG4uZnVuZGluZy1yYXRlcy1jYXJkIHtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cblxuLy8gTG9hZGluZywgRXJyb3IsIGFuZCBFbXB0eSBTdGF0ZXNcbi5sb2FkaW5nLXN0YXRlLFxuLmVycm9yLXN0YXRlLFxuLmVtcHR5LXN0YXRlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHBhZGRpbmc6IDYwcHggMjBweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICBnYXA6IDE2cHg7XG5cbiAgcCB7XG4gICAgbWFyZ2luOiAwO1xuICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgfVxuXG4gIC5oZWxwLXRleHQge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSk7XG4gIH1cbn1cblxuLmVycm9yLXN0YXRlIHtcbiAgY29sb3I6IHZhcigtLWRhbmdlci1jb2xvcik7XG59XG5cbi8vIFRpY2tlcnMgVGFibGVcbi50aWNrZXJzLXRhYmxlLXdyYXBwZXIge1xuICBvdmVyZmxvdy14OiBhdXRvO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICBtYXgtaGVpZ2h0OiA3MDBweDtcblxuICAmOjotd2Via2l0LXNjcm9sbGJhciB7XG4gICAgd2lkdGg6IDhweDtcbiAgICBoZWlnaHQ6IDhweDtcbiAgfVxuXG4gICY6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICB9XG5cbiAgJjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJvcmRlci1jb2xvcik7XG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgfVxuICB9XG59XG5cbi50aWNrZXJzLXRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG4gIGZvbnQtc2l6ZTogMTRweDtcblxuICB0aGVhZCB7XG4gICAgcG9zaXRpb246IHN0aWNreTtcbiAgICB0b3A6IDA7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIHotaW5kZXg6IDEwO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMDUpO1xuXG4gICAgdGgge1xuICAgICAgcGFkZGluZzogMTRweCAxNnB4O1xuICAgICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xuXG4gICAgICAmLnNvcnRhYmxlIHtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuXG4gICAgICAgICY6aG92ZXIge1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLnNvcnQtaW5kaWNhdG9yIHtcbiAgICAgICAgICBtYXJnaW4tbGVmdDogNHB4O1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgIGdhcDogMnB4O1xuXG4gICAgICAgICAgLnNvcnQtb3JkZXIge1xuICAgICAgICAgICAgZm9udC1zaXplOiAxMHB4O1xuICAgICAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgICAgICB3aWR0aDogMTZweDtcbiAgICAgICAgICAgIGhlaWdodDogMTZweDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAycHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICYudGV4dC1yaWdodCB7XG4gICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRib2R5IHtcbiAgICB0ciB7XG4gICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgICB9XG5cbiAgICAgICY6bGFzdC1jaGlsZCB7XG4gICAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7XG4gICAgICB9XG5cbiAgICAgIHRkIHtcbiAgICAgICAgcGFkZGluZzogMTRweCAxNnB4O1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICAgICAmLnRleHQtcmlnaHQge1xuICAgICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgJi5zeW1ib2wtY2VsbCB7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG5cbiAgICAgICAgICAuc3ltYm9sLWxpbmsge1xuICAgICAgICAgICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICBnYXA6IDRweDtcblxuICAgICAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWhvdmVyLCAjMjU2M2ViKTtcbiAgICAgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICY6Zm9jdXMge1xuICAgICAgICAgICAgICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgICAgICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG4gICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJjphY3RpdmUge1xuICAgICAgICAgICAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1hY3RpdmUsICMxZDRlZDgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICYuZnVuZGluZy1yYXRlLWNlbGwsXG4gICAgICAgICYuYW5udWFsaXplZC1jZWxsIHtcbiAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgfVxuXG4gICAgICAgICYuZnVuZGluZy10aW1lIHtcbiAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBGdW5kaW5nIFJhdGUgQ29sb3JzXG4uZnVuZGluZy1wb3NpdGl2ZSB7XG4gIGNvbG9yOiB2YXIoLS1zdWNjZXNzLWNvbG9yKSAhaW1wb3J0YW50O1xuICBmb250LXdlaWdodDogNjAwO1xufVxuXG4uZnVuZGluZy1uZWdhdGl2ZSB7XG4gIGNvbG9yOiB2YXIoLS1kYW5nZXItY29sb3IpICFpbXBvcnRhbnQ7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG59XG5cbi5mdW5kaW5nLW5ldXRyYWwge1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xufVxuXG4vLyBQZXJjZW50IENoYW5nZSBDb2xvcnNcbi5wZXJjZW50LXBvc2l0aXZlIHtcbiAgY29sb3I6IHZhcigtLXN1Y2Nlc3MtY29sb3IpO1xufVxuXG4ucGVyY2VudC1uZWdhdGl2ZSB7XG4gIGNvbG9yOiB2YXIoLS1kYW5nZXItY29sb3IpO1xufVxuXG4vLyBTdW1tYXJ5XG4uZnVuZGluZy1zdW1tYXJ5IHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAyNHB4O1xuICBwYWRkaW5nOiAxNnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGZsZXgtd3JhcDogd3JhcDtcblxuICAuc3VtbWFyeS1pdGVtIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiA4cHg7XG4gIH1cblxuICAuc3VtbWFyeS1sYWJlbCB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICB9XG5cbiAgLnN1bW1hcnktdmFsdWUge1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIH1cbn1cblxuLy8gUmVzcG9uc2l2ZSBEZXNpZ25cbkBtZWRpYSAobWF4LXdpZHRoOiAxMjAwcHgpIHtcbiAgLnRpY2tlcnMtdGFibGUge1xuICAgIGZvbnQtc2l6ZTogMTNweDtcblxuICAgIHRoZWFkIHRoLFxuICAgIHRib2R5IHRkIHtcbiAgICAgIHBhZGRpbmc6IDEycHggMTRweDtcbiAgICB9XG4gIH1cbn1cblxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gIC5mdW5kaW5nLXJhdGVzLWNvbnRhaW5lciB7XG4gICAgcGFkZGluZzogMTJweDtcbiAgfVxuXG4gIC5mdW5kaW5nLXJhdGVzLWhlYWRlciB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcblxuICAgIC5mdW5kaW5nLXJhdGVzLWFjdGlvbnMge1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gIH1cblxuICAuZmlsdGVycy1jb250YWluZXIge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG5cbiAgICAuZmlsdGVyLWdyb3VwIHtcbiAgICAgIG1pbi13aWR0aDogMTAwJTtcbiAgICB9XG5cbiAgICAuZmlsdGVyLWFjdGlvbnMge1xuICAgICAgd2lkdGg6IDEwMCU7XG5cbiAgICAgIHVpLWJ1dHRvbiB7XG4gICAgICAgIGZsZXg6IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLnRpY2tlcnMtdGFibGUge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcblxuICAgIHRoZWFkIHRoLFxuICAgIHRib2R5IHRkIHtcbiAgICAgIHBhZGRpbmc6IDEwcHggMTJweDtcbiAgICB9XG5cbiAgICAvLyBIaWRlIHNvbWUgY29sdW1ucyBvbiBtb2JpbGUgZm9yIGJldHRlciByZWFkYWJpbGl0eVxuICAgIHRoZWFkIHRoOm50aC1jaGlsZCg2KSwgLy8gMjRoIENoYW5nZVxuICAgIHRib2R5IHRkOm50aC1jaGlsZCg2KSxcbiAgICB0aGVhZCB0aDpudGgtY2hpbGQoNyksIC8vIE9wZW4gSW50ZXJlc3RcbiAgICB0Ym9keSB0ZDpudGgtY2hpbGQoNykge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gIH1cblxuICAuZnVuZGluZy1zdW1tYXJ5IHtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIGdhcDogMTJweDtcblxuICAgIC5zdW1tYXJ5LWl0ZW0ge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgfVxuICB9XG59XG5cbkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkge1xuICAudGlja2Vycy10YWJsZSB7XG4gICAgLy8gRnVydGhlciBoaWRlIGNvbHVtbnMgb24gdmVyeSBzbWFsbCBzY3JlZW5zXG4gICAgdGhlYWQgdGg6bnRoLWNoaWxkKDUpLCAvLyBOZXh0IEZ1bmRpbmdcbiAgICB0Ym9keSB0ZDpudGgtY2hpbGQoNSkge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gRnVuZGluZyBSYXRlIEJ1dHRvblxuLmZ1bmRpbmctcmF0ZS1idXR0b24ge1xuICBiYWNrZ3JvdW5kOiBub25lO1xuICBib3JkZXI6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgcGFkZGluZzogNHB4IDhweDtcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xuICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICBmb250OiBpbmhlcml0O1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiA0cHg7XG5cbiAgJjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSk7XG4gIH1cblxuICAmOmFjdGl2ZSB7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgfVxuXG4gICYubWVldHMtdGhyZXNob2xkIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjE1LCAwLCAwLjEpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyMTUsIDAsIDAuMyk7XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyMTUsIDAsIDAuMik7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyMTUsIDAsIDAuNSk7XG4gICAgfVxuICB9XG5cbiAgLnRocmVzaG9sZC1pbmRpY2F0b3Ige1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBhbmltYXRpb246IHB1bHNlIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMCAwIDJweCByZ2JhKDI1NSwgMjE1LCAwLCAwLjUpKTtcbiAgfVxufVxuXG5Aa2V5ZnJhbWVzIHB1bHNlIHtcbiAgMCUsIDEwMCUge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcbiAgfVxuICA1MCUge1xuICAgIG9wYWNpdHk6IDAuNztcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gIH1cbn1cblxuLy8gTGV2ZXJhZ2UgRGlzcGxheVxuLmxldmVyYWdlLWRpc3BsYXkge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcblxuICAubGV2ZXJhZ2UtdmFsdWUge1xuICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIHdpZHRoOiBmaXQtY29udGVudDtcbiAgfVxuXG4gIC5zZXR0aW5ncy1saW5rIHtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgZm9udDogaW5oZXJpdDtcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1ob3ZlciwgIzI1NjNlYik7XG4gICAgfVxuXG4gICAgJjpmb2N1cyB7XG4gICAgICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xuICAgICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgIH1cbiAgfVxufVxuXG4vLyBBY3Rpb24gQ29sdW1uXG4uYWN0aW9uLWNvbHVtbiB7XG4gIG1pbi13aWR0aDogMTAwcHg7XG4gIHdpZHRoOiAxMDBweDtcbn1cblxuLmFjdGlvbi1jZWxsIHtcbiAgcGFkZGluZzogOHB4ICFpbXBvcnRhbnQ7XG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG5cbiAgLm5vLWFjdGlvbiB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgZm9udC1zaXplOiAxOHB4O1xuICB9XG59XG5cbi8vIFN1YnNjcmlwdGlvbnMgQ2FyZFxuLnN1YnNjcmlwdGlvbnMtY2FyZCB7XG4gIG1hcmdpbi10b3A6IDIwcHg7XG59XG5cbi5zdWJzY3JpcHRpb25zLWxpc3Qge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDEycHg7XG59XG5cbi5zdWJzY3JpcHRpb24taXRlbSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgcGFkZGluZzogMTZweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGdhcDogMTZweDtcblxuICAuc3Vic2NyaXB0aW9uLWluZm8ge1xuICAgIGZsZXg6IDE7XG4gICAgbWluLXdpZHRoOiAwO1xuXG4gICAgLnN1YnNjcmlwdGlvbi1zeW1ib2wge1xuICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcbiAgICB9XG5cbiAgICAuc3Vic2NyaXB0aW9uLWRldGFpbHMge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBnYXA6IDhweDtcbiAgICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICAgIGZvbnQtc2l6ZTogMTNweDtcblxuICAgICAgLmRldGFpbC1sYWJlbCB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgICB9XG5cbiAgICAgIC5kZXRhaWwtdmFsdWUge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcblxuICAgICAgICAmLnBvc2l0aXZlIHtcbiAgICAgICAgICBjb2xvcjogdmFyKC0tc3VjY2Vzcy1jb2xvcik7XG4gICAgICAgIH1cblxuICAgICAgICAmLm5lZ2F0aXZlIHtcbiAgICAgICAgICBjb2xvcjogdmFyKC0tZGFuZ2VyLWNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAuZGV0YWlsLXNlcGFyYXRvciB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXRlcnRpYXJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAuc3Vic2NyaXB0aW9uLWNvdW50ZG93biB7XG4gICAgLmNvdW50ZG93bi1kaXNwbGF5IHtcbiAgICAgIGZvbnQtc2l6ZTogMjRweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgIGZvbnQtdmFyaWFudC1udW1lcmljOiB0YWJ1bGFyLW51bXM7XG5cbiAgICAgICYudXJnZW50IHtcbiAgICAgICAgY29sb3I6IHZhcigtLWRhbmdlci1jb2xvcik7XG4gICAgICAgIGFuaW1hdGlvbjogcHVsc2UgMXMgaW5maW5pdGU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbkBrZXlmcmFtZXMgcHVsc2Uge1xuICAwJSwgMTAwJSB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuICA1MCUge1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgfVxufVxuXG4vLyBDb21wbGV0ZWQgRGVhbHMgQ2FyZFxuLmRlYWxzLWNhcmQge1xuICBtYXJnaW4tdG9wOiAyMHB4O1xufVxuXG4uZGVhbHMtbGlzdCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMTJweDtcbn1cblxuLmRlYWwtaXRlbSB7XG4gIHBhZGRpbmc6IDE2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuXG4gIC5kZWFsLWhlYWRlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgIHBhZGRpbmctYm90dG9tOiA4cHg7XG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAuZGVhbC1zeW1ib2wge1xuICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICB9XG5cbiAgICAuZGVhbC10eXBlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBwYWRkaW5nOiA0cHggMTJweDtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuXG4gICAgICAmLnBvc2l0aXZlIHtcbiAgICAgICAgY29sb3I6IHZhcigtLXN1Y2Nlc3MtY29sb3IpO1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDM0LCAxOTcsIDk0LCAwLjEpO1xuICAgICAgfVxuXG4gICAgICAmLm5lZ2F0aXZlIHtcbiAgICAgICAgY29sb3I6IHZhcigtLWRhbmdlci1jb2xvcik7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLmRlYWwtZGV0YWlscyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGdhcDogOHB4O1xuXG4gICAgLmRlYWwtcm93IHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZm9udC1zaXplOiAxM3B4O1xuXG4gICAgICAmLmhpZ2hsaWdodCB7XG4gICAgICAgIHBhZGRpbmc6IDhweDtcbiAgICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgfVxuXG4gICAgICAuZGV0YWlsLWxhYmVsIHtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIH1cblxuICAgICAgLmRldGFpbC12YWx1ZSB7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuXG4gICAgICAgICYucG9zaXRpdmUge1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS1zdWNjZXNzLWNvbG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgICYubmVnYXRpdmUge1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS1kYW5nZXItY29sb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIERpYWxvZyBPdmVybGF5XG4uZGlhbG9nLW92ZXJsYXkge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgcmlnaHQ6IDA7XG4gIGJvdHRvbTogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjUpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgei1pbmRleDogMTAwMDtcbiAgcGFkZGluZzogMjBweDtcbn1cblxuLmRpYWxvZy1jb250ZW50IHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgbWF4LXdpZHRoOiA1MDBweDtcbiAgd2lkdGg6IDEwMCU7XG4gIG1heC1oZWlnaHQ6IDkwdmg7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIGJveC1zaGFkb3c6IDAgMjBweCA2MHB4IHJnYmEoMCwgMCwgMCwgMC4zKTtcbn1cblxuLmRpYWxvZy1oZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIHBhZGRpbmc6IDIwcHg7XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuXG4gIGgzIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZm9udC1zaXplOiAyMHB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAuZGlhbG9nLWNsb3NlIHtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBmb250LXNpemU6IDI4cHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgd2lkdGg6IDMycHg7XG4gICAgaGVpZ2h0OiAzMnB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gICAgfVxuICB9XG59XG5cbi5kaWFsb2ctYm9keSB7XG4gIHBhZGRpbmc6IDIwcHg7XG59XG5cbi5kaWFsb2ctaW5mbyB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBwYWRkaW5nOiAxNnB4O1xuICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuXG4gIC5pbmZvLXJvdyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBwYWRkaW5nOiA4cHggMDtcblxuICAgICY6bm90KDpsYXN0LWNoaWxkKSB7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICB9XG5cbiAgICAuaW5mby1sYWJlbCB7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgIH1cblxuICAgIC5pbmZvLXZhbHVlIHtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICB9XG4gIH1cbn1cblxuLnBvc2l0aW9ucy1pbmZvIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkgMCUsIHJnYmEoMTQ3LCA1MSwgMjM0LCAwLjEpIDEwMCUpO1xuICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgcGFkZGluZzogMjBweDtcbiAgbWFyZ2luLWJvdHRvbTogMjBweDtcblxuICAucG9zaXRpb25zLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICBtYXJnaW46IDAgMCAxNnB4IDA7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG5cbiAgLnBvc2l0aW9ucy1ncmlkIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGdhcDogMTZweDtcbiAgfVxuXG4gIC5wb3NpdGlvbi1pdGVtIHtcbiAgICBmbGV4OiAxO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgIHBhZGRpbmc6IDE2cHg7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAucG9zaXRpb24tbGFiZWwge1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICBsZXR0ZXItc3BhY2luZzogMC41cHg7XG4gICAgfVxuXG4gICAgLnBvc2l0aW9uLXR5cGUge1xuICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcblxuICAgICAgJi5sb25nLXBvc2l0aW9uIHtcbiAgICAgICAgY29sb3I6ICMxMGI5ODE7XG4gICAgICB9XG5cbiAgICAgICYuc2hvcnQtcG9zaXRpb24ge1xuICAgICAgICBjb2xvcjogI2VmNDQ0NDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAucG9zaXRpb24tYW1vdW50IHtcbiAgICAgIGZvbnQtc2l6ZTogMjRweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICBtYXJnaW4tYm90dG9tOiA0cHg7XG4gICAgfVxuXG4gICAgLnBvc2l0aW9uLW1hcmdpbiB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgIH1cblxuICAgIC5wb3NpdGlvbi1leHBsYW5hdGlvbiB7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgZm9udC1zdHlsZTogaXRhbGljO1xuICAgIH1cbiAgfVxuXG4gIC5wb3NpdGlvbi1hcnJvdyB7XG4gICAgZm9udC1zaXplOiAyNHB4O1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbn1cblxuLmRpYWxvZy1mb3JtIHtcbiAgLmZvcm0tZ3JvdXAge1xuICAgIG1hcmdpbi1ib3R0b206IDE2cHg7XG5cbiAgICAuZm9ybS1sYWJlbCB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cblxuICAgIC5mb3JtLWlucHV0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgcGFkZGluZzogMTBweCAxNHB4O1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgICAgICY6Zm9jdXMge1xuICAgICAgICBvdXRsaW5lOiBub25lO1xuICAgICAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgICAgICBib3gtc2hhZG93OiAwIDAgMCAzcHggcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLmZvcm0taGludCB7XG4gICAgICBtYXJnaW4tdG9wOiA2cHg7XG4gICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSk7XG4gICAgfVxuICB9XG59XG5cbi5kaWFsb2ctd2FybmluZyB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjUxLCAxOTEsIDM2LCAwLjEpO1xuICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1MSwgMTkxLCAzNiwgMC4zKTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBwYWRkaW5nOiAxMnB4O1xuICBtYXJnaW4tdG9wOiAxNnB4O1xuXG4gIHAge1xuICAgIG1hcmdpbjogMCAwIDhweCAwO1xuICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICB9XG5cbiAgdWwge1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XG5cbiAgICBsaSB7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgbWFyZ2luOiA0cHggMDtcbiAgICB9XG4gIH1cbn1cblxuLmRpYWxvZy1mb290ZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICBnYXA6IDEycHg7XG4gIHBhZGRpbmc6IDIwcHg7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG4vLyBUb2FzdCBOb3RpZmljYXRpb25zXG4ubm90aWZpY2F0aW9ucy1jb250YWluZXIge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMjBweDtcbiAgcmlnaHQ6IDIwcHg7XG4gIHotaW5kZXg6IDIwMDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMTJweDtcbiAgbWF4LXdpZHRoOiA0MDBweDtcbn1cblxuLm5vdGlmaWNhdGlvbi10b2FzdCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgcGFkZGluZzogMTZweDtcbiAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICBhbmltYXRpb246IHNsaWRlSW4gMC4zcyBlYXNlLW91dDtcblxuICAmLnN1Y2Nlc3Mge1xuICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tc3VjY2Vzcy1jb2xvcik7XG4gIH1cblxuICAmLmVycm9yIHtcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLWRhbmdlci1jb2xvcik7XG4gIH1cblxuICAmLmluZm8ge1xuICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gIH1cbn1cblxuQGtleWZyYW1lcyBzbGlkZUluIHtcbiAgZnJvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDEwMCUpO1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcbiAgICBvcGFjaXR5OiAxO1xuICB9XG59XG5cbi8vIENvbGxhcHNpYmxlIFJvdyBTdHlsZXNcbi5leHBhbmQtYnV0dG9uIHtcbiAgYmFja2dyb3VuZDogbm9uZTtcbiAgYm9yZGVyOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHBhZGRpbmc6IDRweCA4cHg7XG4gIG1hcmdpbi1yaWdodDogOHB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICBmb250LXNpemU6IDEycHg7XG4gIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcblxuICAmOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAmW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHtcbiAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gIH1cbn1cblxuLnN5bWJvbC1jZWxsIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnN1YnNjcmlwdGlvbi1yb3cge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cbiAgLnN1YnNjcmlwdGlvbi1jZWxsIHtcbiAgICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIH1cbn1cblxuLnN1YnNjcmlwdGlvbi1mb3JtLWNvbnRhaW5lciB7XG4gIHBhZGRpbmc6IDIwcHg7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBhbmltYXRpb246IGV4cGFuZFJvdyAwLjNzIGVhc2Utb3V0O1xufVxuXG5Aa2V5ZnJhbWVzIGV4cGFuZFJvdyB7XG4gIGZyb20ge1xuICAgIG9wYWNpdHk6IDA7XG4gICAgdHJhbnNmb3JtOiBzY2FsZVkoMC45NSk7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiBzY2FsZVkoMSk7XG4gIH1cbn1cblxuLnN1YnNjcmlwdGlvbi12aWV3LFxuLnN1YnNjcmlwdGlvbi1mb3JtIHtcbiAgaDQge1xuICAgIG1hcmdpbjogMCAwIDE2cHggMDtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgfVxuXG4gIC5zdWJzY3JpcHRpb24tZGV0YWlscyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGdhcDogMTJweDtcbiAgfVxuXG4gIC5kaWFsb2ctaW5mbyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGdhcDogMTJweDtcbiAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgIHBhZGRpbmc6IDE2cHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgfVxuXG4gIC5kaWFsb2ctZm9ybSB7XG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcbiAgfVxuXG4gIC5kaWFsb2ctd2FybmluZyB7XG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcbiAgfVxuXG4gIC5mb3JtLW5vdGUge1xuICAgIG1hcmdpbi10b3A6IDE2cHg7XG4gICAgcGFkZGluZzogMTJweDtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcblxuICAgIHAge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgfVxuICB9XG5cbiAgLmZvcm0tYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICAgIGdhcDogMTJweDtcbiAgICBwYWRkaW5nLXRvcDogMTZweDtcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgfVxufVxuXG4vLyBBY3Rpb25zIENvbHVtblxuLmFjdGlvbnMtaGVhZGVyIHtcbiAgbWluLXdpZHRoOiAxMjBweDtcbn1cblxuLmFjdGlvbnMtY2VsbCB7XG4gIG1pbi13aWR0aDogMTIwcHg7XG59XG5cbi5hY3Rpb24tYnV0dG9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogOHB4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmFjdGlvbi1idG4ge1xuICBiYWNrZ3JvdW5kOiBub25lO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHBhZGRpbmc6IDZweCAxMHB4O1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGZvbnQtc2l6ZTogMTZweDtcbiAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcbiAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBtaW4td2lkdGg6IDMycHg7XG4gIGhlaWdodDogMzJweDtcblxuICAmOmhvdmVyIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMSk7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICB9XG5cbiAgJjphY3RpdmUge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMC45NSk7XG4gIH1cblxuICAmLmVkaXQtYnRuOmhvdmVyIHtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJhY2tncm91bmQ6IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjEpO1xuICB9XG5cbiAgJi5jYW5jZWwtYnRuOmhvdmVyIHtcbiAgICBib3JkZXItY29sb3I6ICNlZjQ0NDQ7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbiAgfVxuXG4gICYuc3RhcnQtYnRuOmhvdmVyIHtcbiAgICBib3JkZXItY29sb3I6ICMxMGI5ODE7XG4gICAgYmFja2dyb3VuZDogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7XG4gIH1cblxuICAmLnN1YnNjcmliZS1idG4ge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICBmb250LXdlaWdodDogYm9sZDtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1ob3ZlciwgIzI1NjNlYik7XG4gICAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktaG92ZXIsICMyNTYzZWIpO1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTdWJzY3JpcHRpb24gSW5kaWNhdG9yICjDosKcwpMpXG4uc3Vic2NyaXB0aW9uLWluZGljYXRvciB7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICBmb250LXdlaWdodDogYm9sZDtcbiAgYW5pbWF0aW9uOiBmYWRlSW4gMC4zcyBlYXNlLWluO1xufVxuXG5Aa2V5ZnJhbWVzIGZhZGVJbiB7XG4gIGZyb20ge1xuICAgIG9wYWNpdHk6IDA7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgpO1xuICB9XG4gIHRvIHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gIH1cbn1cblxuLy8gRGlzYWJsZWQgZnVuZGluZy1yYXRlLWJ1dHRvblxuLmZ1bmRpbmctcmF0ZS1idXR0b246ZGlzYWJsZWQge1xuICBjdXJzb3I6IGRlZmF1bHQ7XG4gIG9wYWNpdHk6IDAuNztcblxuICAmOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSk7XG4gIH1cblxuICAmOmFjdGl2ZSB7XG4gICAgdHJhbnNmb3JtOiBub25lO1xuICB9XG59XG5cbi8vIEFyYml0cmFnZSBPcHBvcnR1bml0aWVzIFN0eWxlc1xuLmFyYml0cmFnZS1jYXJkIHtcbiAgbWFyZ2luLXRvcDogMjBweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cblxuLmFyYml0cmFnZS10YWJsZS13cmFwcGVyIHtcbiAgb3ZlcmZsb3cteDogYXV0bztcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgbWF4LWhlaWdodDogNzAwcHg7XG5cbiAgJjo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICAgIHdpZHRoOiA4cHg7XG4gICAgaGVpZ2h0OiA4cHg7XG4gIH1cblxuICAmOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgfVxuXG4gICY6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cbiAgfVxufVxuXG4uYXJiaXRyYWdlLXRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG4gIGZvbnQtc2l6ZTogMTRweDtcblxuICB0aGVhZCB7XG4gICAgcG9zaXRpb246IHN0aWNreTtcbiAgICB0b3A6IDA7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIHotaW5kZXg6IDEwO1xuICAgIGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIDAuMDUpO1xuXG4gICAgdGgge1xuICAgICAgcGFkZGluZzogMTRweCAxNnB4O1xuICAgICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgIGxldHRlci1zcGFjaW5nOiAwLjVweDtcblxuICAgICAgJi50ZXh0LWNlbnRlciB7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgIH1cblxuICAgICAgJi50ZXh0LXJpZ2h0IHtcbiAgICAgICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGJvZHkge1xuICAgIHRyIHtcbiAgICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICAgIH1cblxuICAgICAgJjpsYXN0LWNoaWxkIHtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgIH1cblxuICAgICAgJi5vcHBvcnR1bml0eS1yb3cge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjE1LCAwLCAwLjA1KTtcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCByZ2JhKDI1NSwgMjE1LCAwLCAwLjUpO1xuICAgICAgfVxuXG4gICAgICAmLmhhcy1zdWJzY3JpcHRpb24ge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSkgIWltcG9ydGFudDtcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKSAhaW1wb3J0YW50O1xuXG4gICAgICAgICY6aG92ZXIge1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjEpICFpbXBvcnRhbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGQge1xuICAgICAgICBwYWRkaW5nOiAxNHB4IDE2cHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuXG4gICAgICAgICYudGV4dC1jZW50ZXIge1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgICYudGV4dC1yaWdodCB7XG4gICAgICAgICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICAmLnN5bWJvbC1jZWxsIHtcbiAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcblxuICAgICAgICAgIC5zeW1ib2wtdGV4dCB7XG4gICAgICAgICAgICBjb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBFeGNoYW5nZSBiYWRnZXNcbi5leGNoYW5nZXMtY2VsbCB7XG4gIC5leGNoYW5nZXMtYmFkZ2VzIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGdhcDogNnB4O1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgfVxuXG4gIC5leGNoYW5nZS1iYWRnZSB7XG4gICAgcGFkZGluZzogNHB4IDEwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcbiAgICBmb250LXNpemU6IDExcHg7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjVweDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuXG4gICAgJi5leGNoYW5nZS1iYWRnZS1idXR0b24ge1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1mYXN0KTtcbiAgICAgIGJvcmRlci13aWR0aDogMXB4O1xuICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMnB4KTtcbiAgICAgICAgYm94LXNoYWRvdzogMCA0cHggOHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XG4gICAgICAgIGZpbHRlcjogYnJpZ2h0bmVzcygxLjEpO1xuICAgICAgfVxuXG4gICAgICAmOmFjdGl2ZSB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgYm94LXNoYWRvdzogMCAycHggNHB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgICAgIH1cblxuICAgICAgJjpmb2N1cyB7XG4gICAgICAgIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAmLmJhZGdlLWJ5Yml0IHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjEpO1xuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI0NSwgMTU4LCAxMSwgMC4zKTtcbiAgICAgIGNvbG9yOiAjZjU5ZTBiO1xuXG4gICAgICAmLmV4Y2hhbmdlLWJhZGdlLWJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjIpO1xuICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjUpO1xuICAgICAgfVxuICAgIH1cblxuICAgICYuYmFkZ2UtYmluZ3gge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgxMzksIDkyLCAyNDYsIDAuMSk7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoMTM5LCA5MiwgMjQ2LCAwLjMpO1xuICAgICAgY29sb3I6ICM4YjVjZjY7XG5cbiAgICAgICYuZXhjaGFuZ2UtYmFkZ2UtYnV0dG9uOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxMzksIDkyLCAyNDYsIDAuMik7XG4gICAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgxMzksIDkyLCAyNDYsIDAuNSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJi5iYWRnZS1iaW5hbmNlIHtcbiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjM0LCAxNzksIDgsIDAuMSk7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoMjM0LCAxNzksIDgsIDAuMyk7XG4gICAgICBjb2xvcjogI2VhYjMwODtcblxuICAgICAgJi5leGNoYW5nZS1iYWRnZS1idXR0b246aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIzNCwgMTc5LCA4LCAwLjIpO1xuICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMjM0LCAxNzksIDgsIDAuNSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJi5iYWRnZS1va3gge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSk7XG4gICAgICBib3JkZXItY29sb3I6IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjMpO1xuICAgICAgY29sb3I6ICMzYjgyZjY7XG5cbiAgICAgICYuZXhjaGFuZ2UtYmFkZ2UtYnV0dG9uOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmdiYSg1OSwgMTMwLCAyNDYsIDAuMik7XG4gICAgICAgIGJvcmRlci1jb2xvcjogcmdiYSg1OSwgMTMwLCAyNDYsIDAuNSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIFBvc2l0aW9uIGluZm9cbi5wb3NpdGlvbi1pbmZvIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA0cHg7XG4gIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcblxuICAuZXhjaGFuZ2UtbGFiZWwge1xuICAgIGZvbnQtc2l6ZTogMTFweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSk7XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICB9XG5cbiAgLnJhdGUtdmFsdWUge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBmb250LXdlaWdodDogNzAwO1xuXG4gICAgJi5wb3NpdGl2ZSB7XG4gICAgICBjb2xvcjogdmFyKC0tc3VjY2Vzcy1jb2xvcik7XG4gICAgfVxuXG4gICAgJi5uZWdhdGl2ZSB7XG4gICAgICBjb2xvcjogdmFyKC0tZGFuZ2VyLWNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAuZW52aXJvbm1lbnQtdGFnIHtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgcGFkZGluZzogMnB4IDZweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXRlcnRpYXJ5KTtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgY29sb3I6IHZhcigtLXRleHQtdGVydGlhcnkpO1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbn1cblxuLy8gU3ByZWFkIGluZm9cbi5zcHJlYWQtaW5mbyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogNHB4O1xuICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG5cbiAgLnNwcmVhZC12YWx1ZSB7XG4gICAgZm9udC1zaXplOiAxNXB4O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG5cbiAgICAmLmhpZ2gtc3ByZWFkIHtcbiAgICAgIGNvbG9yOiAjZjU5ZTBiO1xuICAgICAgYW5pbWF0aW9uOiBwdWxzZSAycyBlYXNlLWluLW91dCBpbmZpbml0ZTtcbiAgICB9XG4gIH1cblxuICAuc3ByZWFkLXBlcmNlbnQge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbn1cblxuLy8gT3Bwb3J0dW5pdHkgYmFkZ2Vcbi5vcHBvcnR1bml0eS1iYWRnZSB7XG4gIHBhZGRpbmc6IDRweCAxMnB4O1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDRweDtcblxuICAmLnN1Y2Nlc3Mge1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMzQsIDE5NywgOTQsIDAuMSk7XG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgzNCwgMTk3LCA5NCwgMC4zKTtcbiAgICBjb2xvcjogIzIyYzU1ZTtcbiAgfVxuXG4gICYubmV1dHJhbCB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICB9XG59XG5cbi8vIFJlc3BvbnNpdmUgZGVzaWduIGZvciBhcmJpdHJhZ2UgdGFibGVcbkBtZWRpYSAobWF4LXdpZHRoOiAxMjAwcHgpIHtcbiAgLmFyYml0cmFnZS10YWJsZSB7XG4gICAgZm9udC1zaXplOiAxM3B4O1xuXG4gICAgdGhlYWQgdGgsXG4gICAgdGJvZHkgdGQge1xuICAgICAgcGFkZGluZzogMTJweCAxNHB4O1xuICAgIH1cbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgLmFyYml0cmFnZS10YWJsZSB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuXG4gICAgdGhlYWQgdGgsXG4gICAgdGJvZHkgdGQge1xuICAgICAgcGFkZGluZzogMTBweCAxMnB4O1xuICAgIH1cblxuICAgIC8vIEhpZGUgc29tZSBjb2x1bW5zIG9uIG1vYmlsZVxuICAgIHRoZWFkIHRoOm50aC1jaGlsZCgyKSwgLy8gRXhjaGFuZ2VzXG4gICAgdGJvZHkgdGQ6bnRoLWNoaWxkKDIpIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICB9XG5cbiAgLmV4Y2hhbmdlcy1jZWxsIHtcbiAgICAuZXhjaGFuZ2VzLWJhZGdlcyB7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgfVxuICB9XG59XG5cbkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkge1xuICAuYXJiaXRyYWdlLXRhYmxlIHtcbiAgICAvLyBGdXJ0aGVyIGhpZGUgY29sdW1ucyBvbiB2ZXJ5IHNtYWxsIHNjcmVlbnNcbiAgICB0aGVhZCB0aDpudGgtY2hpbGQoMyksIC8vIEJlc3QgTG9uZ1xuICAgIHRib2R5IHRkOm50aC1jaGlsZCgzKSxcbiAgICB0aGVhZCB0aDpudGgtY2hpbGQoNCksIC8vIEJlc3QgU2hvcnRcbiAgICB0Ym9keSB0ZDpudGgtY2hpbGQoNCkge1xuICAgICAgZGlzcGxheTogbm9uZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gQmFsYW5jZSBJbmZvcm1hdGlvbiBpbiBEaWFsb2dcbi5iYWxhbmNlLWluZm8ge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgcGFkZGluZzogMTZweDtcbiAgbWFyZ2luLWJvdHRvbTogMTZweDtcblxuICAmLmxvYWRpbmcge1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgfVxuXG4gIC5iYWxhbmNlLXJvdyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBwYWRkaW5nOiA4cHggMDtcblxuICAgICY6bm90KDpsYXN0LWNoaWxkKSB7XG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICB9XG5cbiAgICAuYmFsYW5jZS1sYWJlbCB7XG4gICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cblxuICAgIC5iYWxhbmNlLXZhbHVlIHtcbiAgICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICAgJi5sb3ctYmFsYW5jZSB7XG4gICAgICAgIGNvbG9yOiAjZWY0NDQ0O1xuICAgICAgICBhbmltYXRpb246IHB1bHNlLXJlZCAycyBlYXNlLWluLW91dCBpbmZpbml0ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuQGtleWZyYW1lcyBwdWxzZS1yZWQge1xuICAwJSwgMTAwJSB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuICA1MCUge1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgfVxufVxuXG4vLyBQb3NpdGlvbiBDYWxjdWxhdGlvbiBpbiBEaWFsb2dcbi5wb3NpdGlvbi1jYWxjdWxhdGlvbiB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIHBhZGRpbmc6IDE2cHg7XG4gIG1hcmdpbi10b3A6IDE2cHg7XG4gIG1hcmdpbi1ib3R0b206IDE2cHg7XG5cbiAgLmNhbGN1bGF0aW9uLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICBtYXJnaW46IDAgMCAxNnB4IDA7XG4gIH1cblxuICAuY2FsY3VsYXRpb24tZ3JpZCB7XG4gICAgZGlzcGxheTogZ3JpZDtcbiAgICBnYXA6IDEycHg7XG5cbiAgICAuY2FsYy1yb3cge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBwYWRkaW5nOiA4cHggMDtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBkYXNoZWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcblxuICAgICAgJjpsYXN0LWNoaWxkIHtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgIH1cblxuICAgICAgJi5pbXBvcnRhbnQge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKTtcbiAgICAgICAgcGFkZGluZzogMTBweCAxMnB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoNTksIDEzMCwgMjQ2LCAwLjMpO1xuXG4gICAgICAgIC5jYWxjLWxhYmVsIHtcbiAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgIGNvbG9yOiAjM2I4MmY2O1xuICAgICAgICB9XG5cbiAgICAgICAgLmNhbGMtdmFsdWUge1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgICAgY29sb3I6ICMzYjgyZjY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLmNhbGMtbGFiZWwge1xuICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgICB9XG5cbiAgICAgIC5jYWxjLXZhbHVlIHtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgICAgZm9udC1mYW1pbHk6ICdSb2JvdG8gTW9ubycsIG1vbm9zcGFjZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAuY2FsY3VsYXRpb24tbm90ZSB7XG4gICAgbWFyZ2luLXRvcDogMTJweDtcbiAgICBwYWRkaW5nOiAxMHB4O1xuICAgIGJhY2tncm91bmQ6IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KTtcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkICMzYjgyZjY7XG4gICAgZm9udC1zaXplOiAxM3B4O1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNldHRpbmdzIERpYWxvZyAtIFByb2Zlc3Npb25hbCBUaGVtZS1Bd2FyZSBTdHlsaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gT3ZlcmxheSB3aXRoIGZhZGUtaW4gYW5pbWF0aW9uXG4uc2V0dGluZ3Mtb3ZlcmxheSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLW92ZXJsYXkpO1xuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNHB4KTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHotaW5kZXg6IHZhcigtLXotbW9kYWwtYmFja2Ryb3ApO1xuICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgYW5pbWF0aW9uOiBzZXR0aW5nc0ZhZGVJbiAwLjJzIGVhc2Utb3V0O1xuXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICB9XG59XG5cbkBrZXlmcmFtZXMgc2V0dGluZ3NGYWRlSW4ge1xuICBmcm9tIHtcbiAgICBvcGFjaXR5OiAwO1xuICB9XG4gIHRvIHtcbiAgICBvcGFjaXR5OiAxO1xuICB9XG59XG5cbi8vIE1vZGFsIGNvbnRhaW5lciB3aXRoIHNsaWRlLXVwIGFuaW1hdGlvblxuLnNldHRpbmdzLW1vZGFsIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy14bCk7XG4gIG1heC13aWR0aDogNjAwcHg7XG4gIHdpZHRoOiAxMDAlO1xuICBtYXgtaGVpZ2h0OiA5MHZoO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBib3gtc2hhZG93OiB2YXIoLS1zaGFkb3ctb3ZlcmxheSk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFuaW1hdGlvbjogc2V0dGluZ3NTbGlkZVVwIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcblxuICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy14bCkgdmFyKC0tYm9yZGVyLXJhZGl1cy14bCkgMCAwO1xuICAgIG1heC1oZWlnaHQ6IDg1dmg7XG4gICAgYW5pbWF0aW9uOiBzZXR0aW5nc1NsaWRlVXBNb2JpbGUgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICB9XG59XG5cbkBrZXlmcmFtZXMgc2V0dGluZ3NTbGlkZVVwIHtcbiAgZnJvbSB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjBweCkgc2NhbGUoMC45OCk7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlKDEpO1xuICB9XG59XG5cbkBrZXlmcmFtZXMgc2V0dGluZ3NTbGlkZVVwTW9iaWxlIHtcbiAgZnJvbSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuICB9XG4gIHRvIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gIH1cbn1cblxuLy8gSGVhZGVyIHdpdGggZ3JhZGllbnQgYmFja2dyb3VuZFxuLnNldHRpbmdzLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZykgdmFyKC0tc3BhY2luZy14bCk7XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcbiAgICAxMzVkZWcsXG4gICAgdmFyKC0tcHJpbWFyeS1jb2xvcikgMCUsXG4gICAgdmFyKC0tcHJpbWFyeS1ob3ZlcikgMTAwJVxuICApO1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG92ZXJmbG93OiBoaWRkZW47XG5cbiAgLy8gU3VidGxlIHBhdHRlcm4gb3ZlcmxheVxuICAmOjpiZWZvcmUge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgYmFja2dyb3VuZC1pbWFnZTogcmFkaWFsLWdyYWRpZW50KFxuICAgICAgY2lyY2xlIGF0IDIwJSA1MCUsXG4gICAgICByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkgMCUsXG4gICAgICB0cmFuc3BhcmVudCA1MCVcbiAgICApO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG5cbiAgLnNldHRpbmdzLWhlYWRlci1jb250ZW50IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMTtcbiAgfVxuXG4gIC5zZXR0aW5ncy1pY29uIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgd2lkdGg6IDQwcHg7XG4gICAgaGVpZ2h0OiA0MHB4O1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1sZyk7XG4gICAgY29sb3I6IHdoaXRlO1xuICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcblxuICAgIHN2ZyB7XG4gICAgICBhbmltYXRpb246IHNldHRpbmdzSWNvblJvdGF0ZSA4cyBsaW5lYXIgaW5maW5pdGU7XG4gICAgfVxuICB9XG5cbiAgLnNldHRpbmdzLXRpdGxlIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUteGwpO1xuICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ib2xkKTtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyZW07XG4gIH1cblxuICAuc2V0dGluZ3MtY2xvc2Uge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICB3aWR0aDogMzZweDtcbiAgICBoZWlnaHQ6IDM2cHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KTtcbiAgICBib3JkZXI6IG5vbmU7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1tZCk7XG4gICAgY29sb3I6IHdoaXRlO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wNSk7XG4gICAgfVxuXG4gICAgJjphY3RpdmUge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk1KTtcbiAgICB9XG5cbiAgICAmOmZvY3VzLXZpc2libGUge1xuICAgICAgb3V0bGluZTogMnB4IHNvbGlkIHdoaXRlO1xuICAgICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbiAgICB9XG4gIH1cbn1cblxuQGtleWZyYW1lcyBzZXR0aW5nc0ljb25Sb3RhdGUge1xuICAwJSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gIH1cbiAgMTAwJSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcbiAgfVxufVxuXG4vLyBCb2R5IHdpdGggc2Nyb2xsYWJsZSBjb250ZW50XG4uc2V0dGluZ3MtYm9keSB7XG4gIGZsZXg6IDE7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIHBhZGRpbmc6IHZhcigtLXNwYWNpbmcteGwpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXNlY29uZGFyeSk7XG5cbiAgJjo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICAgIHdpZHRoOiA4cHg7XG4gIH1cblxuICAmOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1zbSk7XG4gIH1cblxuICAmOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXNtKTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYm9yZGVyLWhvdmVyKTtcbiAgICB9XG4gIH1cblxuICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgfVxufVxuXG4vLyBTZWN0aW9uIGNvbnRhaW5lcnMgd2l0aCBjYXJkLWxpa2UgYXBwZWFyYW5jZVxuLnNldHRpbmdzLXNlY3Rpb24ge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLWxnKTtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZyk7XG4gIG1hcmdpbi1ib3R0b206IHZhcigtLXNwYWNpbmctbGcpO1xuICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuXG4gICY6aG92ZXIge1xuICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYm9yZGVyLWhvdmVyKTtcbiAgICBib3gtc2hhZG93OiB2YXIoLS1zaGFkb3ctc20pO1xuICB9XG5cbiAgJjpsYXN0LWNoaWxkIHtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICB9XG5cbiAgLnNlY3Rpb24taGVhZGVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXNtKTtcbiAgICBtYXJnaW4tYm90dG9tOiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgICBwYWRkaW5nLWJvdHRvbTogdmFyKC0tc3BhY2luZy1tZCk7XG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAuc2VjdGlvbi1pY29uIHtcbiAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIH1cblxuICAgIC5zZWN0aW9uLXRpdGxlIHtcbiAgICAgIG1hcmdpbjogMDtcbiAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLWxnKTtcbiAgICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1zZW1pYm9sZCk7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMWVtO1xuICAgIH1cbiAgfVxufVxuXG4vLyBGb3JtIGZpZWxkIHN0eWxpbmcgd2l0aCBpY29uc1xuLnNldHRpbmdzLWZpZWxkIHtcbiAgbWFyZ2luLWJvdHRvbTogdmFyKC0tc3BhY2luZy1sZyk7XG5cbiAgJjpsYXN0LWNoaWxkIHtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICB9XG5cbiAgLmZpZWxkLWxhYmVsIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXNtKTtcbiAgICBtYXJnaW4tYm90dG9tOiB2YXIoLS1zcGFjaW5nLXNtKTtcbiAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS1zbSk7XG4gICAgZm9udC13ZWlnaHQ6IHZhcigtLWZvbnQtd2VpZ2h0LW1lZGl1bSk7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcblxuICAgIC5maWVsZC1pY29uIHtcbiAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIH1cbiAgfVxuXG4gIC5maWVsZC1pbnB1dCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcGFkZGluZzogMTJweCAxNnB4O1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtbWQpO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLWJhc2UpO1xuICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1tZWRpdW0pO1xuICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG4gICAgYm94LXNoYWRvdzogMCAxcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4wNSk7XG5cbiAgICAmOjpwbGFjZWhvbGRlciB7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XG4gICAgICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtbm9ybWFsKTtcbiAgICB9XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYm9yZGVyLWhvdmVyKTtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgfVxuXG4gICAgJjpmb2N1cyB7XG4gICAgICBvdXRsaW5lOiBub25lO1xuICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gICAgICBib3gtc2hhZG93OiAwIDAgMCA0cHggcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHNwaW5uZXIgYXJyb3dzIGZvciBudW1iZXIgaW5wdXRzXG4gICAgJjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbixcbiAgICAmOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uIHtcbiAgICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgICAgIG1hcmdpbjogMDtcbiAgICB9XG5cbiAgICAmW3R5cGU9bnVtYmVyXSB7XG4gICAgICAtbW96LWFwcGVhcmFuY2U6IHRleHRmaWVsZDtcbiAgICB9XG4gIH1cblxuICAuZmllbGQtaGVscCB7XG4gICAgbWFyZ2luOiB2YXIoLS1zcGFjaW5nLXNtKSAwIDAgMDtcbiAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14cyk7XG4gICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpO1xuICAgIGxpbmUtaGVpZ2h0OiB2YXIoLS1saW5lLWhlaWdodC1yZWxheGVkKTtcbiAgfVxufVxuXG4vLyBDdXN0b20gY2hlY2tib3ggc3R5bGluZ1xuLmZpZWxkLWNoZWNrYm94IHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1tZCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy1tZCk7XG4gIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgJjpob3ZlciB7XG4gICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1ib3JkZXItaG92ZXIpO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gIH1cblxuICAuY2hlY2tib3gtaW5wdXQge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHdpZHRoOiAwO1xuICAgIGhlaWdodDogMDtcblxuICAgICY6Y2hlY2tlZCArIC5jaGVja2JveC1jdXN0b20ge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuXG4gICAgICAmOjphZnRlciB7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJjpmb2N1cy12aXNpYmxlICsgLmNoZWNrYm94LWN1c3RvbSB7XG4gICAgICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xuICAgIH1cbiAgfVxuXG4gIC5jaGVja2JveC1jdXN0b20ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB3aWR0aDogMjBweDtcbiAgICBoZWlnaHQ6IDIwcHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1wcmltYXJ5KTtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtc20pO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICAgIHRyYW5zaXRpb246IHZhcigtLXRyYW5zaXRpb24tZmFzdCk7XG5cbiAgICAmOjphZnRlciB7XG4gICAgICBjb250ZW50OiAnJztcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogNTAlO1xuICAgICAgbGVmdDogNTAlO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkgc2NhbGUoMCk7XG4gICAgICB3aWR0aDogMTBweDtcbiAgICAgIGhlaWdodDogMTBweDtcbiAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgbWFzazogdXJsKFwiZGF0YTppbWFnZS9zdmcreG1sLCUzQ3N2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPSczJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnJTNFJTNDcG9seWxpbmUgcG9pbnRzPScyMCA2IDkgMTcgNCAxMiclM0UlM0MvcG9seWxpbmUlM0UlM0Mvc3ZnJTNFXCIpIGNlbnRlci9jb250YWluIG5vLXJlcGVhdDtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICAgIH1cbiAgfVxuXG4gIC5jaGVja2JveC1sYWJlbCB7XG4gICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtc20pO1xuICAgIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1tZWRpdW0pO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICB9XG59XG5cbi8vIEZvb3RlciB3aXRoIGFjdGlvbiBidXR0b25zXG4uc2V0dGluZ3MtZm9vdGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcbiAgZ2FwOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZykgdmFyKC0tc3BhY2luZy14bCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW4tcmV2ZXJzZTtcbiAgICBnYXA6IHZhcigtLXNwYWNpbmctc20pO1xuXG4gICAgdWktYnV0dG9uIHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbiAgfVxufVxuXG4vLyBCdXR0b24gd2l0aCBpY29uIHN0eWxpbmdcbi5idXR0b24td2l0aC1pY29uIHtcbiAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogdmFyKC0tc3BhY2luZy1zbSk7XG5cbiAgc3ZnIHtcbiAgICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLWZhc3QpO1xuICB9XG5cbiAgJjpob3ZlciBzdmcge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcbiAgfVxufVxuXG4vLyBEYXJrIHRoZW1lIGVuaGFuY2VtZW50c1xuW2RhdGEtdGhlbWU9XCJkYXJrXCJdLCAuZGFyay10aGVtZSB7XG4gIC5zZXR0aW5ncy1oZWFkZXIge1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEzNWRlZyxcbiAgICAgIHJnYmEoNTksIDEzMCwgMjQ2LCAwLjIpIDAlLFxuICAgICAgcmdiYSgzNywgOTksIDIzNSwgMC4yKSAxMDAlXG4gICAgKTtcbiAgICBib3JkZXItYm90dG9tLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpO1xuICB9XG5cbiAgLnNldHRpbmdzLXNlY3Rpb24ge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJvcmRlci1jb2xvcjogcmdiYSg1OSwgMTMwLCAyNDYsIDAuMyk7XG4gICAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjEpO1xuICAgIH1cblxuICAgIC5zZWN0aW9uLWhlYWRlciB7XG4gICAgICBib3JkZXItYm90dG9tLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG4gICAgfVxuICB9XG5cbiAgLmZpZWxkLWlucHV0IHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXRlcnRpYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIH1cblxuICAgICY6Zm9jdXMge1xuICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDRweCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xNSk7XG4gICAgfVxuICB9XG5cbiAgLmZpZWxkLWNoZWNrYm94IHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXRlcnRpYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICAgIH1cbiAgfVxuXG4gIC5jaGVja2JveC1jdXN0b20ge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcXVhdGVybmFyeSk7XG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xuICB9XG59XG5cbi8vIEhpZ2ggY29udHJhc3QgbW9kZSBzdXBwb3J0XG5AbWVkaWEgKHByZWZlcnMtY29udHJhc3Q6IGhpZ2gpIHtcbiAgLnNldHRpbmdzLW1vZGFsIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICB9XG5cbiAgLnNldHRpbmdzLWhlYWRlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAuZmllbGQtaW5wdXQsXG4gIC5maWVsZC1jaGVja2JveCB7XG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIH1cblxuICAuc2VjdGlvbi1oZWFkZXIge1xuICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDNweDtcbiAgfVxufVxuXG4vLyBSZWR1Y2VkIG1vdGlvbiBzdXBwb3J0XG5AbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAuc2V0dGluZ3Mtb3ZlcmxheSxcbiAgLnNldHRpbmdzLW1vZGFsLFxuICAuZmllbGQtaW5wdXQsXG4gIC5maWVsZC1jaGVja2JveCxcbiAgLnNldHRpbmdzLWNsb3NlLFxuICAuY2hlY2tib3gtY3VzdG9tLFxuICAuYnV0dG9uLXdpdGgtaWNvbiBzdmcge1xuICAgIGFuaW1hdGlvbjogbm9uZTtcbiAgICB0cmFuc2l0aW9uOiBub25lO1xuICB9XG5cbiAgLnNldHRpbmdzLWljb24gc3ZnIHtcbiAgICBhbmltYXRpb246IG5vbmU7XG4gIH1cbn1cblxuLy8gTW9iaWxlLXNwZWNpZmljIGFkanVzdG1lbnRzXG5AbWVkaWEgKG1heC13aWR0aDogNDgwcHgpIHtcbiAgLnNldHRpbmdzLWhlYWRlciB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1tZCkgdmFyKC0tc3BhY2luZy1sZyk7XG5cbiAgICAuc2V0dGluZ3MtaWNvbiB7XG4gICAgICB3aWR0aDogMzZweDtcbiAgICAgIGhlaWdodDogMzZweDtcbiAgICB9XG5cbiAgICAuc2V0dGluZ3MtdGl0bGUge1xuICAgICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtbGcpO1xuICAgIH1cblxuICAgIC5zZXR0aW5ncy1jbG9zZSB7XG4gICAgICB3aWR0aDogMzJweDtcbiAgICAgIGhlaWdodDogMzJweDtcbiAgICB9XG4gIH1cblxuICAuc2V0dGluZ3MtYm9keSB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1tZCk7XG4gIH1cblxuICAuc2V0dGluZ3Mtc2VjdGlvbiB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1tZCk7XG5cbiAgICAuc2VjdGlvbi1oZWFkZXIge1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgICAgZ2FwOiB2YXIoLS1zcGFjaW5nLXhzKTtcbiAgICB9XG4gIH1cblxuICAuc2V0dGluZ3MtZmllbGQge1xuICAgIC5maWVsZC1pbnB1dCB7XG4gICAgICBwYWRkaW5nOiAxMHB4IDE0cHg7XG4gICAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS1zbSk7XG4gICAgfVxuICB9XG5cbiAgLmZpZWxkLWNoZWNrYm94IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLXNtKTtcbiAgfVxuXG4gIC5zZXR0aW5ncy1mb290ZXIge1xuICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbWQpIHZhcigtLXNwYWNpbmctbGcpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU3Vic2NyaXB0aW9uIEFjdGlvbiBCdXR0b25zIChBcmJpdHJhZ2UgVGFibGUpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLnN1YnNjcmlwdGlvbi1hY3Rpb24tYnV0dG9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBnYXA6IDhweDtcbiAgZmxleC13cmFwOiB3cmFwO1xuICBwYWRkaW5nOiA0cHg7XG5cbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gICAgZ2FwOiA2cHg7XG4gIH1cbn1cblxuLmFjdGlvbi1jZWxsIHtcbiAgbWluLXdpZHRoOiAxNTBweDtcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcblxuICBAbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgICBtaW4td2lkdGg6IDEyMHB4O1xuICB9XG59XG5cbi8vIEN1c3RvbSBjb2xvciBzdHlsZXMgZm9yIHVpLWJ1dHRvbiBhY3Rpb24gYnV0dG9uc1xuLmFjdGlvbi1idG4ge1xuICAmLnN0YXJ0LWJ0biB7XG4gICAgLS1idXR0b24tY29sb3I6ICMxMGI5ODE7XG4gICAgLS1idXR0b24taG92ZXItY29sb3I6ICMwNTk2Njk7XG4gICAgY29sb3I6IHZhcigtLWJ1dHRvbi1jb2xvcik7XG5cbiAgICBzdmcge1xuICAgICAgZmlsbDogdmFyKC0tYnV0dG9uLWNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAmLmVkaXQtYnRuIHtcbiAgICAtLWJ1dHRvbi1jb2xvcjogIzNiODJmNjtcbiAgICAtLWJ1dHRvbi1ob3Zlci1jb2xvcjogIzI1NjNlYjtcbiAgICBjb2xvcjogdmFyKC0tYnV0dG9uLWNvbG9yKTtcblxuICAgIHN2ZyB7XG4gICAgICBzdHJva2U6IHZhcigtLWJ1dHRvbi1jb2xvcik7XG4gICAgfVxuICB9XG5cbiAgJi5jYW5jZWwtYnRuIHtcbiAgICAtLWJ1dHRvbi1jb2xvcjogI2VmNDQ0NDtcbiAgICAtLWJ1dHRvbi1ob3Zlci1jb2xvcjogI2RjMjYyNjtcbiAgICBjb2xvcjogdmFyKC0tYnV0dG9uLWNvbG9yKTtcblxuICAgIHN2ZyB7XG4gICAgICBzdHJva2U6IHZhcigtLWJ1dHRvbi1jb2xvcik7XG4gICAgfVxuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return FundingRatesComponent;
})();

/***/ }),

/***/ 1962:
/*!**********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/Scheduler.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scheduler: () => (/* binding */ Scheduler)
/* harmony export */ });
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scheduler/dateTimestampProvider */ 5152);

class Scheduler {
  constructor(schedulerActionCtor, now = Scheduler.now) {
    this.schedulerActionCtor = schedulerActionCtor;
    this.now = now;
  }
  schedule(work, delay = 0, state) {
    return new this.schedulerActionCtor(this, work).schedule(state, delay);
  }
}
Scheduler.now = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__.dateTimestampProvider.now;

/***/ }),

/***/ 4876:
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/observable/timer.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timer: () => (/* binding */ timer)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ 3942);
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ 8473);
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ 9397);
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isDate */ 5602);




function timer(dueTime = 0, intervalOrScheduler, scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async) {
  let intervalDuration = -1;
  if (intervalOrScheduler != null) {
    if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      intervalDuration = intervalOrScheduler;
    }
  }
  return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(subscriber => {
    let due = (0,_util_isDate__WEBPACK_IMPORTED_MODULE_3__.isValidDate)(dueTime) ? +dueTime - scheduler.now() : dueTime;
    if (due < 0) {
      due = 0;
    }
    let n = 0;
    return scheduler.schedule(function () {
      if (!subscriber.closed) {
        subscriber.next(n++);
        if (0 <= intervalDuration) {
          this.schedule(undefined, intervalDuration);
        } else {
          subscriber.complete();
        }
      }
    }, due);
  });
}

/***/ }),

/***/ 9103:
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/Action.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Action: () => (/* binding */ Action)
/* harmony export */ });
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subscription */ 2510);

class Action extends _Subscription__WEBPACK_IMPORTED_MODULE_0__.Subscription {
  constructor(scheduler, work) {
    super();
  }
  schedule(state, delay = 0) {
    return this;
  }
}

/***/ }),

/***/ 2083:
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/AsyncAction.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncAction: () => (/* binding */ AsyncAction)
/* harmony export */ });
/* harmony import */ var _Action__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Action */ 9103);
/* harmony import */ var _intervalProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./intervalProvider */ 8113);
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/arrRemove */ 967);



class AsyncAction extends _Action__WEBPACK_IMPORTED_MODULE_0__.Action {
  constructor(scheduler, work) {
    super(scheduler, work);
    this.scheduler = scheduler;
    this.work = work;
    this.pending = false;
  }
  schedule(state, delay = 0) {
    var _a;
    if (this.closed) {
      return this;
    }
    this.state = state;
    const id = this.id;
    const scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay);
    }
    this.pending = true;
    this.delay = delay;
    this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
    return this;
  }
  requestAsyncId(scheduler, _id, delay = 0) {
    return _intervalProvider__WEBPACK_IMPORTED_MODULE_1__.intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
  }
  recycleAsyncId(_scheduler, id, delay = 0) {
    if (delay != null && this.delay === delay && this.pending === false) {
      return id;
    }
    if (id != null) {
      _intervalProvider__WEBPACK_IMPORTED_MODULE_1__.intervalProvider.clearInterval(id);
    }
    return undefined;
  }
  execute(state, delay) {
    if (this.closed) {
      return new Error('executing a cancelled action');
    }
    this.pending = false;
    const error = this._execute(state, delay);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  }
  _execute(state, _delay) {
    let errored = false;
    let errorValue;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = e ? e : new Error('Scheduled action threw falsy error');
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  }
  unsubscribe() {
    if (!this.closed) {
      const {
        id,
        scheduler
      } = this;
      const {
        actions
      } = scheduler;
      this.work = this.state = this.scheduler = null;
      this.pending = false;
      (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_2__.arrRemove)(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
      this.delay = null;
      super.unsubscribe();
    }
  }
}

/***/ }),

/***/ 2400:
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/AsyncScheduler.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncScheduler: () => (/* binding */ AsyncScheduler)
/* harmony export */ });
/* harmony import */ var _Scheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Scheduler */ 1962);

class AsyncScheduler extends _Scheduler__WEBPACK_IMPORTED_MODULE_0__.Scheduler {
  constructor(SchedulerAction, now = _Scheduler__WEBPACK_IMPORTED_MODULE_0__.Scheduler.now) {
    super(SchedulerAction, now);
    this.actions = [];
    this._active = false;
  }
  flush(action) {
    const {
      actions
    } = this;
    if (this._active) {
      actions.push(action);
      return;
    }
    let error;
    this._active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this._active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}

/***/ }),

/***/ 8473:
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/async.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   async: () => (/* binding */ async),
/* harmony export */   asyncScheduler: () => (/* binding */ asyncScheduler)
/* harmony export */ });
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ 2083);
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AsyncScheduler */ 2400);


const asyncScheduler = new _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__.AsyncScheduler(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction);
const async = asyncScheduler;

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

/***/ }),

/***/ 8113:
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/intervalProvider.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   intervalProvider: () => (/* binding */ intervalProvider)
/* harmony export */ });
const intervalProvider = {
  setInterval(handler, timeout, ...args) {
    const {
      delegate
    } = intervalProvider;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
      return delegate.setInterval(handler, timeout, ...args);
    }
    return setInterval(handler, timeout, ...args);
  },
  clearInterval(handle) {
    const {
      delegate
    } = intervalProvider;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
  },
  delegate: undefined
};

/***/ }),

/***/ 5602:
/*!************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/util/isDate.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isValidDate: () => (/* binding */ isValidDate)
/* harmony export */ });
function isValidDate(value) {
  return value instanceof Date && !isNaN(value);
}

/***/ })

}]);
//# sourceMappingURL=794.js.map