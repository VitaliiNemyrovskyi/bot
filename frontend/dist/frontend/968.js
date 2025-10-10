"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[968],{

/***/ 968:
/*!***********************************************************************!*\
  !*** ./src/app/components/testing/api-tester/api-tester.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiTesterComponent: () => (/* binding */ ApiTesterComponent),
/* harmony export */   OrderSide: () => (/* binding */ OrderSide),
/* harmony export */   OrderType: () => (/* binding */ OrderType),
/* harmony export */   PositionSide: () => (/* binding */ PositionSide)
/* harmony export */ });
/* harmony import */ var _Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ 9204);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../models/exchange-credentials.model */ 7392);
/* harmony import */ var _services_trading_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../services/trading.service */ 8015);
/* harmony import */ var _services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/exchange-credentials.service */ 9704);










const _forTrack0 = ($index, $item) => $item.value;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.timestamp;
const _c0 = a0 => ({
  "response-error": a0
});
function ApiTesterComponent_For_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const option_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r1.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r1.label);
  }
}
function ApiTesterComponent_For_33_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const cred_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", cred_r2.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"](" ", cred_r2.label || cred_r2.apiKeyPreview, " (", cred_r2.environment, ") ");
  }
}
function ApiTesterComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "p", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "No credentials configured for this exchange");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function ApiTesterComponent_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "p", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.getErrorMessage("symbol"));
  }
}
function ApiTesterComponent_For_55_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const option_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r4.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r4.label);
  }
}
function ApiTesterComponent_For_63_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const option_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r5.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r5.label);
  }
}
function ApiTesterComponent_For_71_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "option", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const option_r6 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", option_r6.value);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](option_r6.label);
  }
}
function ApiTesterComponent_Conditional_80_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "p", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.getErrorMessage("quantity"));
  }
}
function ApiTesterComponent_Conditional_84_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function ApiTesterComponent_Conditional_86_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "p", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.getErrorMessage("price"));
  }
}
function ApiTesterComponent_Conditional_87_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "p", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, "Price is only required for LIMIT orders");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
}
function ApiTesterComponent_Conditional_90_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](0, "span", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1, " Sending Request... ");
  }
}
function ApiTesterComponent_Conditional_91_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "svg", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](1, "path", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, " Send Request ");
  }
}
function ApiTesterComponent_Conditional_92_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "svg", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](2, "circle", 41)(3, "path", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", ctx_r2.error(), " ");
  }
}
function ApiTesterComponent_Conditional_93_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("", ctx_r2.currentLog().responseTime, "ms");
  }
}
function ApiTesterComponent_Conditional_93_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 36)(1, "div", 43)(2, "div", 44)(3, "h3", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Request");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function ApiTesterComponent_Conditional_93_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r7);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r2.copyRequest());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "svg", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](7, "rect", 47)(8, "path", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](9, "div", 49)(10, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](12, "span", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](14, "div", 52)(15, "pre")(16, "code");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](18, "div", 53)(19, "div", 44)(20, "h3", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](21, "Response");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](22, "div", 5)(23, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](25, ApiTesterComponent_Conditional_93_Conditional_25_Template, 2, 1, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](26, "button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function ApiTesterComponent_Conditional_93_Template_button_click_26_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r7);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r2.copyResponse());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](27, "svg", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](28, "rect", 47)(29, "path", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](30, "div", 56)(31, "pre")(32, "code");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](33);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.currentLog().method);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.currentLog().endpoint);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.formatJson(ctx_r2.currentLog().requestBody));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngClass", ctx_r2.getStatusCodeClass(ctx_r2.currentLog().statusCode));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate2"](" ", ctx_r2.currentLog().statusCode, " ", ctx_r2.getStatusCodeLabel(ctx_r2.currentLog().statusCode), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx_r2.currentLog().responseTime ? 25 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpureFunction1"](9, _c0, !ctx_r2.currentLog().success));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx_r2.formatJson(ctx_r2.currentLog().responseBody));
  }
}
function ApiTesterComponent_Conditional_94_For_5_Conditional_0_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const log_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2).$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"]("", log_r9.responseTime, "ms");
  }
}
function ApiTesterComponent_Conditional_94_For_5_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function ApiTesterComponent_Conditional_94_For_5_Conditional_0_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrestoreView"](_r8);
      const log_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵresetView"](ctx_r2.currentLog.set(log_r9));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](1, "div", 60)(2, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](4, "span", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](6, "span", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](8, "div", 61)(9, "span", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipe"](11, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](12, ApiTesterComponent_Conditional_94_For_5_Conditional_0_Conditional_12_Template, 2, 1, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const log_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](log_r9.method);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](log_r9.endpoint);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("ngClass", ctx_r2.getStatusCodeClass(log_r9.statusCode));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate1"](" ", log_r9.statusCode, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵpipeBind2"](11, 6, log_r9.timestamp, "short"));
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](log_r9.responseTime ? 12 : -1);
  }
}
function ApiTesterComponent_Conditional_94_For_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](0, ApiTesterComponent_Conditional_94_For_5_Conditional_0_Template, 13, 9, "div", 58);
  }
  if (rf & 2) {
    const log_r9 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](log_r9 !== ctx_r2.currentLog() ? 0 : -1);
  }
}
function ApiTesterComponent_Conditional_94_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 37)(1, "h2", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](2, "Request History");
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](3, "div", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](4, ApiTesterComponent_Conditional_94_For_5_Template, 1, 1, null, null, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx_r2.logs());
  }
}
/**
 * Order Type enumeration for exchange orders
 */
var OrderType = /*#__PURE__*/function (OrderType) {
  OrderType["MARKET"] = "MARKET";
  OrderType["LIMIT"] = "LIMIT";
  return OrderType;
}(OrderType || {});
/**
 * Order Side enumeration
 */
var OrderSide = /*#__PURE__*/function (OrderSide) {
  OrderSide["BUY"] = "BUY";
  OrderSide["SELL"] = "SELL";
  return OrderSide;
}(OrderSide || {});
/**
 * Position Side enumeration for futures trading
 */
var PositionSide = /*#__PURE__*/function (PositionSide) {
  PositionSide["LONG"] = "LONG";
  PositionSide["SHORT"] = "SHORT";
  return PositionSide;
}(PositionSide || {});
/**
 * API Tester Component
 *
 * A comprehensive API testing interface for exchange orders that mimics Swagger UI.
 * Allows users to test exchange order placement with detailed request/response inspection.
 *
 * Features:
 * - Exchange and credential selection
 * - Order parameter configuration (symbol, side, type, quantity, price)
 * - Real-time request preview with JSON syntax highlighting
 * - Response display with status codes and timing
 * - Copy-to-clipboard functionality
 * - Form validation and error handling
 * - Dark theme similar to Swagger UI
 */
let ApiTesterComponent = /*#__PURE__*/(() => {
  class ApiTesterComponent {
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(fb, tradingService, credentialsService) {
      this.fb = fb;
      this.tradingService = tradingService;
      this.credentialsService = credentialsService;
      // ============================================================================
      // SIGNALS - Reactive State Management
      // ============================================================================
      this.isLoading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(false);
      this.error = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      this.currentLog = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      this.logs = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)([]);
      this.selectedExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      this.selectedCredential = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.signal)(null);
      // ============================================================================
      // COMPUTED SIGNALS - Derived State
      // ============================================================================
      this.availableCredentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        const exchange = this.selectedExchange();
        if (!exchange) return [];
        return this.credentialsService.credentials().filter(cred => cred.exchange === exchange);
      });
      this.canSubmit = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        return this.orderForm?.valid && this.selectedExchange() !== null && this.selectedCredential() !== null && !this.isLoading();
      });
      this.requestPreview = (0,_angular_core__WEBPACK_IMPORTED_MODULE_4__.computed)(() => {
        if (!this.orderForm) return null;
        const formValue = this.orderForm.value;
        return {
          exchange: this.selectedExchange(),
          credentialId: this.selectedCredential()?.id,
          symbol: formValue.symbol,
          side: formValue.side,
          positionSide: formValue.positionSide,
          type: formValue.type,
          quantity: formValue.quantity,
          price: formValue.type === OrderType.LIMIT ? formValue.price : undefined
        };
      });
      // ============================================================================
      // ENUM REFERENCES - For Template Access
      // ============================================================================
      this.ExchangeType = _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_1__.ExchangeType;
      this.OrderType = OrderType;
      this.OrderSide = OrderSide;
      this.PositionSide = PositionSide;
      // ============================================================================
      // CONFIGURATION
      // ============================================================================
      this.exchangeOptions = [{
        value: _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_1__.ExchangeType.BINGX,
        label: 'BingX',
        color: '#1E73FA'
      }, {
        value: _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_1__.ExchangeType.BYBIT,
        label: 'Bybit',
        color: '#F7A600'
      }, {
        value: _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_1__.ExchangeType.BINANCE,
        label: 'Binance',
        color: '#F3BA2F'
      }];
      this.orderTypeOptions = [{
        value: OrderType.MARKET,
        label: 'Market',
        description: 'Execute at current market price'
      }, {
        value: OrderType.LIMIT,
        label: 'Limit',
        description: 'Execute at specified price or better'
      }];
      this.orderSideOptions = [{
        value: OrderSide.BUY,
        label: 'Buy',
        color: '#22c55e'
      }, {
        value: OrderSide.SELL,
        label: 'Sell',
        color: '#ef4444'
      }];
      this.positionSideOptions = [{
        value: PositionSide.LONG,
        label: 'Long',
        color: '#22c55e'
      }, {
        value: PositionSide.SHORT,
        label: 'Short',
        color: '#ef4444'
      }];
      this.initializeForm();
    }
    // ============================================================================
    // LIFECYCLE HOOKS
    // ============================================================================
    ngOnInit() {
      // Load credentials from backend
      this.credentialsService.fetchCredentials().subscribe({
        error: err => {
          console.error('Failed to load credentials:', err);
          this.error.set('Failed to load exchange credentials. Please try again.');
        }
      });
      // Watch for form value changes to enable/disable price field
      this.orderForm.get('type')?.valueChanges.subscribe(type => {
        const priceControl = this.orderForm.get('price');
        if (type === OrderType.LIMIT) {
          priceControl?.setValidators([_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.min(0.00000001)]);
          priceControl?.enable();
        } else {
          priceControl?.clearValidators();
          priceControl?.disable();
        }
        priceControl?.updateValueAndValidity();
      });
    }
    // ============================================================================
    // PRIVATE METHODS - Initialization
    // ============================================================================
    initializeForm() {
      this.orderForm = this.fb.group({
        symbol: ['BTC-USDT', [_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.pattern(/^[A-Z0-9]+-[A-Z0-9]+$/)]],
        side: [OrderSide.BUY, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required],
        positionSide: [PositionSide.LONG, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required],
        type: [OrderType.MARKET, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required],
        quantity: [0.001, [_angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.Validators.min(0.00000001)]],
        price: [{
          value: null,
          disabled: true
        }]
      });
    }
    // ============================================================================
    // PUBLIC METHODS - User Actions
    // ============================================================================
    /**
     * Handle exchange selection change
     */
    onExchangeChange(exchange) {
      this.selectedExchange.set(exchange);
      this.selectedCredential.set(null); // Reset credential when exchange changes
      this.error.set(null);
    }
    /**
     * Handle credential selection change
     */
    onCredentialChange(credentialId) {
      const credential = this.availableCredentials().find(c => c.id === credentialId);
      this.selectedCredential.set(credential || null);
      this.error.set(null);
    }
    /**
     * Submit order request
     */
    onSubmitRequest() {
      var _this = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        if (!_this.canSubmit()) {
          return;
        }
        _this.error.set(null);
        _this.isLoading.set(true);
        const startTime = Date.now();
        const requestData = {
          exchange: _this.selectedExchange(),
          credentialId: _this.selectedCredential().id,
          symbol: _this.orderForm.value.symbol,
          side: _this.orderForm.value.side,
          positionSide: _this.orderForm.value.positionSide,
          type: _this.orderForm.value.type,
          quantity: _this.orderForm.value.quantity,
          price: _this.orderForm.value.type === OrderType.LIMIT ? _this.orderForm.value.price : undefined
        };
        // Create log entry
        const logEntry = {
          timestamp: new Date(),
          method: 'POST',
          endpoint: '/api/exchange-orders',
          requestBody: requestData,
          success: false
        };
        try {
          // Call the trading service to place order
          const response = yield _this.tradingService.placeExchangeOrder(requestData).toPromise();
          const endTime = Date.now();
          logEntry.statusCode = 200;
          logEntry.responseBody = response;
          logEntry.responseTime = endTime - startTime;
          logEntry.success = response?.success ?? false;
          _this.currentLog.set(logEntry);
          _this.logs.update(logs => [logEntry, ...logs]);
        } catch (err) {
          const endTime = Date.now();
          const httpError = err;
          logEntry.statusCode = httpError.status || 500;
          logEntry.responseBody = httpError.error || {
            message: httpError.message
          };
          logEntry.responseTime = endTime - startTime;
          logEntry.error = httpError.error?.error?.message || httpError.message || 'Unknown error occurred';
          logEntry.success = false;
          _this.currentLog.set(logEntry);
          _this.logs.update(logs => [logEntry, ...logs]);
          _this.error.set(logEntry.error || 'Request failed');
        } finally {
          _this.isLoading.set(false);
        }
      })();
    }
    /**
     * Clear current request/response
     */
    clearCurrentLog() {
      this.currentLog.set(null);
      this.error.set(null);
    }
    /**
     * Clear all logs
     */
    clearAllLogs() {
      this.logs.set([]);
      this.clearCurrentLog();
    }
    /**
     * Copy text to clipboard
     */
    copyToClipboard(text) {
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        try {
          yield navigator.clipboard.writeText(text);
          // Could add a toast notification here
          console.log('Copied to clipboard');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      })();
    }
    /**
     * Copy request as JSON
     */
    copyRequest() {
      var _this2 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const preview = _this2.requestPreview();
        if (preview) {
          yield _this2.copyToClipboard(JSON.stringify(preview, null, 2));
        }
      })();
    }
    /**
     * Copy response as JSON
     */
    copyResponse() {
      var _this3 = this;
      return (0,_Users_vnemyrovskyi_IdeaProjects_0bot_frontend_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function* () {
        const log = _this3.currentLog();
        if (log?.responseBody) {
          yield _this3.copyToClipboard(JSON.stringify(log.responseBody, null, 2));
        }
      })();
    }
    /**
     * Format JSON for display
     */
    formatJson(obj) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch (err) {
        return String(obj);
      }
    }
    /**
     * Get status code color class
     */
    getStatusCodeClass(statusCode) {
      if (!statusCode) return 'status-unknown';
      if (statusCode >= 200 && statusCode < 300) return 'status-success';
      if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
      if (statusCode >= 500) return 'status-server-error';
      return 'status-unknown';
    }
    /**
     * Get status code label
     */
    getStatusCodeLabel(statusCode) {
      if (!statusCode) return 'Unknown';
      const labels = {
        200: 'OK',
        201: 'Created',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        422: 'Unprocessable Entity',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
      };
      return labels[statusCode] || statusCode.toString();
    }
    /**
     * Get form control error message
     */
    getErrorMessage(controlName) {
      const control = this.orderForm.get(controlName);
      if (!control || !control.errors || !control.touched) return '';
      if (control.errors['required']) return 'This field is required';
      if (control.errors['pattern']) return 'Invalid format (use format like BTC-USDT)';
      if (control.errors['min']) return `Value must be greater than ${control.errors['min'].min}`;
      return 'Invalid value';
    }
    /**
     * Check if form control has error
     */
    hasError(controlName) {
      const control = this.orderForm.get(controlName);
      return !!(control && control.invalid && control.touched);
    }
    static {
      this.ɵfac = function ApiTesterComponent_Factory(t) {
        return new (t || ApiTesterComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_trading_service__WEBPACK_IMPORTED_MODULE_2__.TradingService), _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdirectiveInject"](_services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_3__.ExchangeCredentialsService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineComponent"]({
        type: ApiTesterComponent,
        selectors: [["app-api-tester"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵStandaloneFeature"]],
        decls: 95,
        vars: 25,
        consts: [[1, "api-tester-container"], [1, "api-tester-header"], [1, "header-content"], [1, "page-title"], [1, "page-description"], [1, "header-actions"], ["type", "button", 1, "btn-secondary", "btn-sm", 3, "click", "disabled"], [1, "config-panel"], [1, "section-title"], [1, "config-grid"], [1, "form-group"], ["for", "exchange", 1, "form-label"], [1, "required"], ["id", "exchange", 1, "form-control", 3, "change", "value"], [3, "value"], ["for", "credential", 1, "form-label"], ["id", "credential", 1, "form-control", 3, "change", "disabled", "value"], [1, "help-text", "error"], [1, "parameters-panel", 3, "formGroup"], [1, "parameters-grid"], ["for", "symbol", 1, "form-label"], ["id", "symbol", "type", "text", "formControlName", "symbol", "placeholder", "BTC-USDT", 1, "form-control"], [1, "help-text"], ["for", "side", 1, "form-label"], ["id", "side", "formControlName", "side", 1, "form-control"], ["for", "positionSide", 1, "form-label"], ["id", "positionSide", "formControlName", "positionSide", 1, "form-control"], ["for", "type", 1, "form-label"], ["id", "type", "formControlName", "type", 1, "form-control"], ["for", "quantity", 1, "form-label"], ["id", "quantity", "type", "number", "formControlName", "quantity", "placeholder", "0.001", "step", "0.001", "min", "0", 1, "form-control"], ["for", "price", 1, "form-label"], ["id", "price", "type", "number", "formControlName", "price", "placeholder", "Enter price", "step", "0.01", "min", "0", 1, "form-control"], [1, "submit-section"], ["type", "button", 1, "btn-primary", "btn-lg", 3, "click", "disabled"], [1, "error-banner"], [1, "log-display"], [1, "history-section"], [1, "spinner"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "icon"], ["d", "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "2"], ["d", "M12 8v4M12 16h.01", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], [1, "log-section", "request-section"], [1, "section-header"], ["type", "button", "title", "Copy to clipboard", 1, "btn-icon", 3, "click"], ["width", "18", "height", "18", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg", 1, "icon"], ["x", "9", "y", "9", "width", "13", "height", "13", "rx", "2", "ry", "2", "stroke", "currentColor", "stroke-width", "2"], ["d", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1", "stroke", "currentColor", "stroke-width", "2"], [1, "request-info"], [1, "http-method"], [1, "endpoint"], [1, "code-block"], [1, "log-section", "response-section"], [1, "status-badge", 3, "ngClass"], [1, "response-time"], [1, "code-block", 3, "ngClass"], [1, "history-list"], [1, "history-item"], [1, "history-item", 3, "click"], [1, "history-item-header"], [1, "history-item-meta"], [1, "timestamp"]],
        template: function ApiTesterComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h1", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](4, "Exchange Order API Tester");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](5, "p", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](6, "Test exchange order placement with detailed request/response inspection");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](7, "div", 5)(8, "button", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function ApiTesterComponent_Template_button_click_8_listener() {
              return ctx.clearAllLogs();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](9, " Clear History ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](10, "div", 7)(11, "h2", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](12, "Configuration");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](13, "div", 9)(14, "div", 10)(15, "label", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](16, " Exchange ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](17, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](18, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](19, "select", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("change", function ApiTesterComponent_Template_select_change_19_listener($event) {
              return ctx.onExchangeChange($event.target.value);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](20, "option", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](21, "Select Exchange...");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](22, ApiTesterComponent_For_23_Template, 2, 2, "option", 14, _forTrack0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](24, "div", 10)(25, "label", 15);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](26, " API Credential ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](27, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](28, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](29, "select", 16);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("change", function ApiTesterComponent_Template_select_change_29_listener($event) {
              return ctx.onCredentialChange($event.target.value);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](30, "option", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](31, "Select Credential...");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](32, ApiTesterComponent_For_33_Template, 2, 3, "option", 14, _forTrack1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](34, ApiTesterComponent_Conditional_34_Template, 2, 0, "p", 17);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](35, "form", 18)(36, "h2", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](37, "Order Parameters");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](38, "div", 19)(39, "div", 10)(40, "label", 20);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](41, " Symbol ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](42, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](43, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](44, "input", 21);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](45, ApiTesterComponent_Conditional_45_Template, 2, 1, "p", 17);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](46, "p", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](47, "Format: BASE-QUOTE (e.g., BTC-USDT)");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](48, "div", 10)(49, "label", 23);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](50, " Side ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](51, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](52, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](53, "select", 24);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](54, ApiTesterComponent_For_55_Template, 2, 2, "option", 14, _forTrack0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](56, "div", 10)(57, "label", 25);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](58, " Position Side ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](59, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](60, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](61, "select", 26);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](62, ApiTesterComponent_For_63_Template, 2, 2, "option", 14, _forTrack0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](64, "div", 10)(65, "label", 27);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](66, " Order Type ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](67, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](68, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](69, "select", 28);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeaterCreate"](70, ApiTesterComponent_For_71_Template, 2, 2, "option", 14, _forTrack0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](72, "p", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](73);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](74, "div", 10)(75, "label", 29);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](76, " Quantity ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](77, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](78, "*");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](79, "input", 30);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](80, ApiTesterComponent_Conditional_80_Template, 2, 1, "p", 17);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](81, "div", 10)(82, "label", 31);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtext"](83, " Price ");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](84, ApiTesterComponent_Conditional_84_Template, 2, 0, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelement"](85, "input", 32);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](86, ApiTesterComponent_Conditional_86_Template, 2, 1, "p", 17)(87, ApiTesterComponent_Conditional_87_Template, 2, 0, "p", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementStart"](88, "div", 33)(89, "button", 34);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵlistener"]("click", function ApiTesterComponent_Template_button_click_89_listener() {
              return ctx.onSubmitRequest();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](90, ApiTesterComponent_Conditional_90_Template, 2, 0)(91, ApiTesterComponent_Conditional_91_Template, 3, 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](92, ApiTesterComponent_Conditional_92_Template, 5, 1, "div", 35);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtemplate"](93, ApiTesterComponent_Conditional_93_Template, 34, 11, "div", 36)(94, ApiTesterComponent_Conditional_94_Template, 6, 0, "div", 37);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            let tmp_5_0;
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("disabled", ctx.logs().length === 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](11);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", ctx.selectedExchange());
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", null);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx.exchangeOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("disabled", !ctx.selectedExchange() || ctx.availableCredentials().length === 0)("value", (tmp_5_0 = ctx.selectedCredential()) == null ? null : tmp_5_0.id);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("value", null);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx.availableCredentials());
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.selectedExchange() && ctx.availableCredentials().length === 0 ? 34 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("formGroup", ctx.orderForm);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](9);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("error", ctx.hasError("symbol"));
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.hasError("symbol") ? 45 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](9);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx.orderSideOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx.positionSideOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵrepeater"](ctx.orderTypeOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵtextInterpolate"](ctx.orderForm.value.type === ctx.OrderType.MARKET ? "Execute at current market price" : "Execute at specified price or better");
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("error", ctx.hasError("quantity"));
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.hasError("quantity") ? 80 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.orderForm.value.type === ctx.OrderType.LIMIT ? 84 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵclassProp"]("error", ctx.hasError("price"));
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.hasError("price") ? 86 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.orderForm.value.type !== ctx.OrderType.LIMIT ? 87 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵproperty"]("disabled", !ctx.canSubmit());
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.isLoading() ? 90 : 91);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.error() ? 92 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.currentLog() ? 93 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵconditional"](ctx.logs().length > 1 ? 94 : -1);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_6__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_6__.DatePipe, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_5__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_5__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.MinValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_5__.FormControlName],
        styles: ["[_ngcontent-%COMP%]:root {\n  --api-bg-primary: #1e1e1e;\n  --api-bg-secondary: #252526;\n  --api-bg-tertiary: #2d2d30;\n  --api-bg-hover: #333333;\n  --api-border-color: #3e3e42;\n  --api-text-primary: #cccccc;\n  --api-text-secondary: #808080;\n  --api-text-tertiary: #6a6a6a;\n  --api-accent-blue: #4FC3F7;\n  --api-accent-green: #66BB6A;\n  --api-accent-red: #EF5350;\n  --api-accent-orange: #FFA726;\n  --api-accent-purple: #AB47BC;\n  --api-success: #22c55e;\n  --api-error: #ef4444;\n  --api-warning: #f59e0b;\n  --api-info: #3b82f6;\n  --code-bg: #1e1e1e;\n  --code-text: #d4d4d4;\n  --code-keyword: #569cd6;\n  --code-string: #ce9178;\n  --code-number: #b5cea8;\n  --code-comment: #6a9955;\n}\n\n.api-tester-container[_ngcontent-%COMP%] {\n  max-width: 1400px;\n  margin: 0 auto;\n  padding: 2rem;\n  background-color: var(--api-bg-primary);\n  color: var(--api-text-primary);\n  min-height: 100vh;\n  font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;\n}\n\n.api-tester-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 2rem;\n  padding-bottom: 1.5rem;\n  border-bottom: 2px solid var(--api-border-color);\n}\n.api-tester-header[_ngcontent-%COMP%]   .header-content[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.api-tester-header[_ngcontent-%COMP%]   .page-title[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  font-weight: 600;\n  color: var(--api-text-primary);\n  margin: 0 0 0.5rem 0;\n}\n.api-tester-header[_ngcontent-%COMP%]   .page-description[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  color: var(--api-text-secondary);\n  margin: 0;\n}\n.api-tester-header[_ngcontent-%COMP%]   .header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.section-title[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--api-text-primary);\n  margin: 0 0 1rem 0;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.config-panel[_ngcontent-%COMP%], \n.parameters-panel[_ngcontent-%COMP%], \n.log-display[_ngcontent-%COMP%], \n.history-section[_ngcontent-%COMP%] {\n  background-color: var(--api-bg-secondary);\n  border: 1px solid var(--api-border-color);\n  border-radius: 8px;\n  padding: 1.5rem;\n  margin-bottom: 1.5rem;\n}\n\n.config-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.25rem;\n}\n\n.parameters-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.25rem;\n  margin-bottom: 1.5rem;\n}\n\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n.form-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--api-text-primary);\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.form-label[_ngcontent-%COMP%]   .required[_ngcontent-%COMP%] {\n  color: var(--api-accent-red);\n  font-weight: 600;\n}\n\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.625rem 0.875rem;\n  font-size: 0.9375rem;\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  color: var(--api-text-primary);\n  background-color: var(--api-bg-tertiary);\n  border: 1px solid var(--api-border-color);\n  border-radius: 4px;\n  outline: none;\n  transition: all 0.2s ease;\n}\n.form-control[_ngcontent-%COMP%]:hover {\n  border-color: var(--api-accent-blue);\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  border-color: var(--api-accent-blue);\n  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);\n}\n.form-control[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  background-color: var(--api-bg-secondary);\n}\n.form-control.error[_ngcontent-%COMP%] {\n  border-color: var(--api-error);\n}\n.form-control.error[_ngcontent-%COMP%]:focus {\n  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);\n}\n\ninput[type=number].form-control[_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\ninput[type=number].form-control[_ngcontent-%COMP%]::-webkit-outer-spin-button, input[type=number].form-control[_ngcontent-%COMP%]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n\nselect.form-control[_ngcontent-%COMP%] {\n  cursor: pointer;\n  appearance: none;\n  background-image: url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23808080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");\n  background-repeat: no-repeat;\n  background-position: right 0.875rem center;\n  padding-right: 2.5rem;\n}\n\n.help-text[_ngcontent-%COMP%] {\n  font-size: 0.8125rem;\n  color: var(--api-text-secondary);\n  margin: 0;\n}\n.help-text.error[_ngcontent-%COMP%] {\n  color: var(--api-error);\n}\n\n.btn-primary[_ngcontent-%COMP%], \n.btn-secondary[_ngcontent-%COMP%], \n.btn-icon[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  padding: 0.625rem 1.25rem;\n  font-size: 0.9375rem;\n  font-weight: 500;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  outline: none;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled, \n.btn-secondary[_ngcontent-%COMP%]:disabled, \n.btn-icon[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-primary[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%], \n.btn-secondary[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%], \n.btn-icon[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n\n.btn-primary[_ngcontent-%COMP%] {\n  background-color: var(--api-accent-blue);\n  color: #1e1e1e;\n}\n.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background-color: #29B6F6;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);\n}\n.btn-primary[_ngcontent-%COMP%]:active:not(:disabled) {\n  transform: translateY(0);\n}\n\n.btn-secondary[_ngcontent-%COMP%] {\n  background-color: var(--api-bg-tertiary);\n  color: var(--api-text-primary);\n  border: 1px solid var(--api-border-color);\n}\n.btn-secondary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background-color: var(--api-bg-hover);\n  border-color: var(--api-accent-blue);\n}\n\n.btn-icon[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  background-color: transparent;\n  color: var(--api-text-secondary);\n}\n.btn-icon[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background-color: var(--api-bg-hover);\n  color: var(--api-text-primary);\n}\n\n.btn-sm[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  font-size: 0.875rem;\n}\n\n.btn-lg[_ngcontent-%COMP%] {\n  padding: 0.875rem 1.75rem;\n  font-size: 1rem;\n}\n\n.submit-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  align-items: flex-start;\n  padding-top: 1rem;\n  border-top: 1px solid var(--api-border-color);\n}\n\n.spinner[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  border: 2px solid rgba(30, 30, 30, 0.3);\n  border-top-color: #1e1e1e;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.error-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 1rem;\n  background-color: rgba(239, 68, 68, 0.1);\n  border: 1px solid var(--api-error);\n  border-radius: 4px;\n  color: var(--api-error);\n  width: 100%;\n}\n.error-banner[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n\n.log-display[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  padding: 0;\n  background-color: transparent;\n  border: none;\n}\n\n.log-section[_ngcontent-%COMP%] {\n  background-color: var(--api-bg-secondary);\n  border: 1px solid var(--api-border-color);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.log-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.25rem;\n  background-color: var(--api-bg-tertiary);\n  border-bottom: 1px solid var(--api-border-color);\n}\n.log-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n}\n.log-section[_ngcontent-%COMP%]   .section-header[_ngcontent-%COMP%]   .header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n\n.request-section[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 1rem 1.25rem;\n  background-color: rgba(79, 195, 247, 0.05);\n  border-bottom: 1px solid var(--api-border-color);\n}\n.request-section[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .http-method[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.875rem;\n  font-weight: 700;\n  color: var(--api-accent-blue);\n  padding: 0.25rem 0.625rem;\n  background-color: rgba(79, 195, 247, 0.15);\n  border-radius: 4px;\n}\n.request-section[_ngcontent-%COMP%]   .request-info[_ngcontent-%COMP%]   .endpoint[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.9375rem;\n  color: var(--api-text-primary);\n}\n\n.response-section[_ngcontent-%COMP%]   .status-badge[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.875rem;\n  font-weight: 600;\n  padding: 0.25rem 0.75rem;\n  border-radius: 4px;\n}\n.response-section[_ngcontent-%COMP%]   .status-badge.status-success[_ngcontent-%COMP%] {\n  background-color: rgba(34, 197, 94, 0.15);\n  color: var(--api-success);\n}\n.response-section[_ngcontent-%COMP%]   .status-badge.status-client-error[_ngcontent-%COMP%] {\n  background-color: rgba(239, 68, 68, 0.15);\n  color: var(--api-error);\n}\n.response-section[_ngcontent-%COMP%]   .status-badge.status-server-error[_ngcontent-%COMP%] {\n  background-color: rgba(239, 68, 68, 0.15);\n  color: var(--api-error);\n}\n.response-section[_ngcontent-%COMP%]   .status-badge.status-unknown[_ngcontent-%COMP%] {\n  background-color: rgba(128, 128, 128, 0.15);\n  color: var(--api-text-secondary);\n}\n.response-section[_ngcontent-%COMP%]   .response-time[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.8125rem;\n  color: var(--api-text-secondary);\n  padding: 0.25rem 0.625rem;\n  background-color: var(--api-bg-primary);\n  border-radius: 4px;\n}\n\n.code-block[_ngcontent-%COMP%] {\n  padding: 1.25rem;\n  background-color: var(--code-bg);\n  overflow-x: auto;\n}\n.code-block[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n  margin: 0;\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.875rem;\n  line-height: 1.6;\n  color: var(--code-text);\n}\n.code-block[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  display: block;\n  white-space: pre;\n}\n.code-block.response-error[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--api-error);\n}\n\n.history-section[_ngcontent-%COMP%]   .history-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%] {\n  padding: 1rem;\n  background-color: var(--api-bg-tertiary);\n  border: 1px solid var(--api-border-color);\n  border-radius: 6px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]:hover {\n  background-color: var(--api-bg-hover);\n  border-color: var(--api-accent-blue);\n  transform: translateX(4px);\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-header[_ngcontent-%COMP%]   .http-method[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.8125rem;\n  font-weight: 700;\n  color: var(--api-accent-blue);\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-header[_ngcontent-%COMP%]   .endpoint[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n  font-size: 0.875rem;\n  color: var(--api-text-primary);\n  flex: 1;\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  font-size: 0.8125rem;\n  color: var(--api-text-secondary);\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-meta[_ngcontent-%COMP%]   .timestamp[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n}\n.history-section[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-meta[_ngcontent-%COMP%]   .response-time[_ngcontent-%COMP%] {\n  font-family: \"Consolas\", \"Monaco\", \"Courier New\", monospace;\n}\n\n@media (max-width: 1024px) {\n  .api-tester-container[_ngcontent-%COMP%] {\n    padding: 1.5rem;\n  }\n  .parameters-grid[_ngcontent-%COMP%], \n   .config-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .api-tester-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    gap: 1rem;\n  }\n  .api-tester-header[_ngcontent-%COMP%]   .header-actions[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: flex-start;\n  }\n}\n@media (max-width: 640px) {\n  .api-tester-container[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .page-title[_ngcontent-%COMP%] {\n    font-size: 1.5rem !important;\n  }\n  .section-title[_ngcontent-%COMP%] {\n    font-size: 1.125rem !important;\n  }\n  .config-panel[_ngcontent-%COMP%], \n   .parameters-panel[_ngcontent-%COMP%], \n   .log-display[_ngcontent-%COMP%], \n   .history-section[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .code-block[_ngcontent-%COMP%] {\n    padding: 0.875rem;\n  }\n  .code-block[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n    font-size: 0.8125rem;\n  }\n  .history-item[_ngcontent-%COMP%]   .history-item-header[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  *[_ngcontent-%COMP%] {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--api-accent-blue);\n  outline-offset: 2px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90ZXN0aW5nL2FwaS10ZXN0ZXIvYXBpLXRlc3Rlci5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtFQUVFLHlCQUFBO0VBQ0EsMkJBQUE7RUFDQSwwQkFBQTtFQUNBLHVCQUFBO0VBRUEsMkJBQUE7RUFDQSwyQkFBQTtFQUNBLDZCQUFBO0VBQ0EsNEJBQUE7RUFHQSwwQkFBQTtFQUNBLDJCQUFBO0VBQ0EseUJBQUE7RUFDQSw0QkFBQTtFQUNBLDRCQUFBO0VBR0Esc0JBQUE7RUFDQSxvQkFBQTtFQUNBLHNCQUFBO0VBQ0EsbUJBQUE7RUFHQSxrQkFBQTtFQUNBLG9CQUFBO0VBQ0EsdUJBQUE7RUFDQSxzQkFBQTtFQUNBLHNCQUFBO0VBQ0EsdUJBQUE7QUFYRjs7QUFrQkE7RUFDRSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxhQUFBO0VBQ0EsdUNBQUE7RUFDQSw4QkFBQTtFQUNBLGlCQUFBO0VBQ0EsNERBQUE7QUFmRjs7QUFzQkE7RUFDRSxhQUFBO0VBQ0EsOEJBQUE7RUFDQSx1QkFBQTtFQUNBLG1CQUFBO0VBQ0Esc0JBQUE7RUFDQSxnREFBQTtBQW5CRjtBQXFCRTtFQUNFLE9BQUE7QUFuQko7QUFzQkU7RUFDRSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSw4QkFBQTtFQUNBLG9CQUFBO0FBcEJKO0FBdUJFO0VBQ0UsZUFBQTtFQUNBLGdDQUFBO0VBQ0EsU0FBQTtBQXJCSjtBQXdCRTtFQUNFLGFBQUE7RUFDQSxZQUFBO0VBQ0EsbUJBQUE7QUF0Qko7O0FBOEJBO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLDhCQUFBO0VBQ0Esa0JBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxXQUFBO0FBM0JGOztBQThCQTs7OztFQUlFLHlDQUFBO0VBQ0EseUNBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxxQkFBQTtBQTNCRjs7QUFrQ0E7RUFDRSxhQUFBO0VBQ0EsMkRBQUE7RUFDQSxZQUFBO0FBL0JGOztBQXNDQTtFQUNFLGFBQUE7RUFDQSwyREFBQTtFQUNBLFlBQUE7RUFDQSxxQkFBQTtBQW5DRjs7QUEwQ0E7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxXQUFBO0FBdkNGOztBQTBDQTtFQUNFLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSw4QkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7QUF2Q0Y7QUF5Q0U7RUFDRSw0QkFBQTtFQUNBLGdCQUFBO0FBdkNKOztBQTJDQTtFQUNFLFdBQUE7RUFDQSwwQkFBQTtFQUNBLG9CQUFBO0VBQ0EsMkRBQUE7RUFDQSw4QkFBQTtFQUNBLHdDQUFBO0VBQ0EseUNBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSx5QkFBQTtBQXhDRjtBQTBDRTtFQUNFLG9DQUFBO0FBeENKO0FBMkNFO0VBQ0Usb0NBQUE7RUFDQSw2Q0FBQTtBQXpDSjtBQTRDRTtFQUNFLFlBQUE7RUFDQSxtQkFBQTtFQUNBLHlDQUFBO0FBMUNKO0FBNkNFO0VBQ0UsOEJBQUE7QUEzQ0o7QUE2Q0k7RUFDRSw0Q0FBQTtBQTNDTjs7QUFnREE7RUFDRSwwQkFBQTtBQTdDRjtBQStDRTtFQUVFLHdCQUFBO0VBQ0EsU0FBQTtBQTlDSjs7QUFrREE7RUFDRSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSx1UUFBQTtFQUNBLDRCQUFBO0VBQ0EsMENBQUE7RUFDQSxxQkFBQTtBQS9DRjs7QUFrREE7RUFDRSxvQkFBQTtFQUNBLGdDQUFBO0VBQ0EsU0FBQTtBQS9DRjtBQWlERTtFQUNFLHVCQUFBO0FBL0NKOztBQXVEQTs7O0VBR0Usb0JBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EsV0FBQTtFQUNBLHlCQUFBO0VBQ0Esb0JBQUE7RUFDQSxnQkFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSx5QkFBQTtFQUNBLGFBQUE7QUFwREY7QUFzREU7OztFQUNFLFlBQUE7RUFDQSxtQkFBQTtBQWxESjtBQXFERTs7O0VBQ0UsY0FBQTtBQWpESjs7QUFxREE7RUFDRSx3Q0FBQTtFQUNBLGNBQUE7QUFsREY7QUFvREU7RUFDRSx5QkFBQTtFQUNBLDJCQUFBO0VBQ0EsOENBQUE7QUFsREo7QUFxREU7RUFDRSx3QkFBQTtBQW5ESjs7QUF1REE7RUFDRSx3Q0FBQTtFQUNBLDhCQUFBO0VBQ0EseUNBQUE7QUFwREY7QUFzREU7RUFDRSxxQ0FBQTtFQUNBLG9DQUFBO0FBcERKOztBQXdEQTtFQUNFLGVBQUE7RUFDQSw2QkFBQTtFQUNBLGdDQUFBO0FBckRGO0FBdURFO0VBQ0UscUNBQUE7RUFDQSw4QkFBQTtBQXJESjs7QUF5REE7RUFDRSxvQkFBQTtFQUNBLG1CQUFBO0FBdERGOztBQXlEQTtFQUNFLHlCQUFBO0VBQ0EsZUFBQTtBQXRERjs7QUE2REE7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxTQUFBO0VBQ0EsdUJBQUE7RUFDQSxpQkFBQTtFQUNBLDZDQUFBO0FBMURGOztBQTZEQTtFQUNFLFdBQUE7RUFDQSxZQUFBO0VBQ0EsdUNBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0Esb0NBQUE7QUExREY7O0FBNkRBO0VBQ0U7SUFBSyx5QkFBQTtFQXpETDtBQUNGO0FBMkRBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSx3Q0FBQTtFQUNBLGtDQUFBO0VBQ0Esa0JBQUE7RUFDQSx1QkFBQTtFQUNBLFdBQUE7QUF6REY7QUEyREU7RUFDRSxjQUFBO0FBekRKOztBQWlFQTtFQUNFLGFBQUE7RUFDQSxzQkFBQTtFQUNBLFdBQUE7RUFDQSxVQUFBO0VBQ0EsNkJBQUE7RUFDQSxZQUFBO0FBOURGOztBQWlFQTtFQUNFLHlDQUFBO0VBQ0EseUNBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0FBOURGO0FBZ0VFO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxxQkFBQTtFQUNBLHdDQUFBO0VBQ0EsZ0RBQUE7QUE5REo7QUFnRUk7RUFDRSxTQUFBO0VBQ0EsZUFBQTtBQTlETjtBQWlFSTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7QUEvRE47O0FBcUVFO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLHFCQUFBO0VBQ0EsMENBQUE7RUFDQSxnREFBQTtBQWxFSjtBQW9FSTtFQUNFLDJEQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLDZCQUFBO0VBQ0EseUJBQUE7RUFDQSwwQ0FBQTtFQUNBLGtCQUFBO0FBbEVOO0FBcUVJO0VBQ0UsMkRBQUE7RUFDQSxvQkFBQTtFQUNBLDhCQUFBO0FBbkVOOztBQXlFRTtFQUNFLDJEQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLHdCQUFBO0VBQ0Esa0JBQUE7QUF0RUo7QUF3RUk7RUFDRSx5Q0FBQTtFQUNBLHlCQUFBO0FBdEVOO0FBeUVJO0VBQ0UseUNBQUE7RUFDQSx1QkFBQTtBQXZFTjtBQTBFSTtFQUNFLHlDQUFBO0VBQ0EsdUJBQUE7QUF4RU47QUEyRUk7RUFDRSwyQ0FBQTtFQUNBLGdDQUFBO0FBekVOO0FBNkVFO0VBQ0UsMkRBQUE7RUFDQSxvQkFBQTtFQUNBLGdDQUFBO0VBQ0EseUJBQUE7RUFDQSx1Q0FBQTtFQUNBLGtCQUFBO0FBM0VKOztBQStFQTtFQUNFLGdCQUFBO0VBQ0EsZ0NBQUE7RUFDQSxnQkFBQTtBQTVFRjtBQThFRTtFQUNFLFNBQUE7RUFDQSwyREFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSx1QkFBQTtBQTVFSjtBQThFSTtFQUNFLGNBQUE7RUFDQSxnQkFBQTtBQTVFTjtBQWdGRTtFQUNFLHVDQUFBO0FBOUVKOztBQXVGRTtFQUNFLGFBQUE7RUFDQSxzQkFBQTtFQUNBLFlBQUE7QUFwRko7QUF1RkU7RUFDRSxhQUFBO0VBQ0Esd0NBQUE7RUFDQSx5Q0FBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLHlCQUFBO0FBckZKO0FBdUZJO0VBQ0UscUNBQUE7RUFDQSxvQ0FBQTtFQUNBLDBCQUFBO0FBckZOO0FBd0ZJO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLHFCQUFBO0FBdEZOO0FBd0ZNO0VBQ0UsMkRBQUE7RUFDQSxvQkFBQTtFQUNBLGdCQUFBO0VBQ0EsNkJBQUE7QUF0RlI7QUF5Rk07RUFDRSwyREFBQTtFQUNBLG1CQUFBO0VBQ0EsOEJBQUE7RUFDQSxPQUFBO0FBdkZSO0FBMkZJO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsU0FBQTtFQUNBLG9CQUFBO0VBQ0EsZ0NBQUE7QUF6Rk47QUEyRk07RUFDRSwyREFBQTtBQXpGUjtBQTRGTTtFQUNFLDJEQUFBO0FBMUZSOztBQW9HQTtFQUNFO0lBQ0UsZUFBQTtFQWpHRjtFQW9HQTs7SUFFRSwwQkFBQTtFQWxHRjtFQXFHQTtJQUNFLHNCQUFBO0lBQ0EsU0FBQTtFQW5HRjtFQXFHRTtJQUNFLFdBQUE7SUFDQSwyQkFBQTtFQW5HSjtBQUNGO0FBdUdBO0VBQ0U7SUFDRSxhQUFBO0VBckdGO0VBd0dBO0lBQ0UsNEJBQUE7RUF0R0Y7RUF5R0E7SUFDRSw4QkFBQTtFQXZHRjtFQTBHQTs7OztJQUlFLGFBQUE7RUF4R0Y7RUEyR0E7SUFDRSxpQkFBQTtFQXpHRjtFQTJHRTtJQUNFLG9CQUFBO0VBekdKO0VBOEdFO0lBQ0UsZUFBQTtFQTVHSjtBQUNGO0FBb0hBO0VBQ0U7SUFDRSxxQ0FBQTtJQUNBLHVDQUFBO0lBQ0Esc0NBQUE7RUFsSEY7QUFDRjtBQXNIQTtFQUNFLHlDQUFBO0VBQ0EsbUJBQUE7QUFwSEYiLCJzb3VyY2VzQ29udGVudCI6WyIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBWQVJJQUJMRVMgLSBDb2xvciBQYWxldHRlIGFuZCBUaGVtaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbjpyb290IHtcbiAgLy8gRGFyayBUaGVtZSBDb2xvcnMgKFN3YWdnZXItaW5zcGlyZWQpXG4gIC0tYXBpLWJnLXByaW1hcnk6ICMxZTFlMWU7XG4gIC0tYXBpLWJnLXNlY29uZGFyeTogIzI1MjUyNjtcbiAgLS1hcGktYmctdGVydGlhcnk6ICMyZDJkMzA7XG4gIC0tYXBpLWJnLWhvdmVyOiAjMzMzMzMzO1xuXG4gIC0tYXBpLWJvcmRlci1jb2xvcjogIzNlM2U0MjtcbiAgLS1hcGktdGV4dC1wcmltYXJ5OiAjY2NjY2NjO1xuICAtLWFwaS10ZXh0LXNlY29uZGFyeTogIzgwODA4MDtcbiAgLS1hcGktdGV4dC10ZXJ0aWFyeTogIzZhNmE2YTtcblxuICAvLyBBY2NlbnQgQ29sb3JzXG4gIC0tYXBpLWFjY2VudC1ibHVlOiAjNEZDM0Y3O1xuICAtLWFwaS1hY2NlbnQtZ3JlZW46ICM2NkJCNkE7XG4gIC0tYXBpLWFjY2VudC1yZWQ6ICNFRjUzNTA7XG4gIC0tYXBpLWFjY2VudC1vcmFuZ2U6ICNGRkE3MjY7XG4gIC0tYXBpLWFjY2VudC1wdXJwbGU6ICNBQjQ3QkM7XG5cbiAgLy8gU3RhdHVzIENvbG9yc1xuICAtLWFwaS1zdWNjZXNzOiAjMjJjNTVlO1xuICAtLWFwaS1lcnJvcjogI2VmNDQ0NDtcbiAgLS1hcGktd2FybmluZzogI2Y1OWUwYjtcbiAgLS1hcGktaW5mbzogIzNiODJmNjtcblxuICAvLyBDb2RlIFN5bnRheCBDb2xvcnNcbiAgLS1jb2RlLWJnOiAjMWUxZTFlO1xuICAtLWNvZGUtdGV4dDogI2Q0ZDRkNDtcbiAgLS1jb2RlLWtleXdvcmQ6ICM1NjljZDY7XG4gIC0tY29kZS1zdHJpbmc6ICNjZTkxNzg7XG4gIC0tY29kZS1udW1iZXI6ICNiNWNlYTg7XG4gIC0tY29kZS1jb21tZW50OiAjNmE5OTU1O1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBNQUlOIENPTlRBSU5FUlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uYXBpLXRlc3Rlci1jb250YWluZXIge1xuICBtYXgtd2lkdGg6IDE0MDBweDtcbiAgbWFyZ2luOiAwIGF1dG87XG4gIHBhZGRpbmc6IDJyZW07XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWFwaS1iZy1wcmltYXJ5KTtcbiAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXByaW1hcnkpO1xuICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgZm9udC1mYW1pbHk6ICdTZWdvZSBVSScsIFRhaG9tYSwgR2VuZXZhLCBWZXJkYW5hLCBzYW5zLXNlcmlmO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBIRUFERVJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLmFwaS10ZXN0ZXItaGVhZGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcbiAgcGFkZGluZy1ib3R0b206IDEuNXJlbTtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWFwaS1ib3JkZXItY29sb3IpO1xuXG4gIC5oZWFkZXItY29udGVudCB7XG4gICAgZmxleDogMTtcbiAgfVxuXG4gIC5wYWdlLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDJyZW07XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tYXBpLXRleHQtcHJpbWFyeSk7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gIH1cblxuICAucGFnZS1kZXNjcmlwdGlvbiB7XG4gICAgZm9udC1zaXplOiAxcmVtO1xuICAgIGNvbG9yOiB2YXIoLS1hcGktdGV4dC1zZWNvbmRhcnkpO1xuICAgIG1hcmdpbjogMDtcbiAgfVxuXG4gIC5oZWFkZXItYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBnYXA6IDAuNzVyZW07XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTRUNUSU9OIFNUWUxFU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uc2VjdGlvbi10aXRsZSB7XG4gIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXByaW1hcnkpO1xuICBtYXJnaW46IDAgMCAxcmVtIDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMC41cmVtO1xufVxuXG4uY29uZmlnLXBhbmVsLFxuLnBhcmFtZXRlcnMtcGFuZWwsXG4ubG9nLWRpc3BsYXksXG4uaGlzdG9yeS1zZWN0aW9uIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYXBpLWJnLXNlY29uZGFyeSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWFwaS1ib3JkZXItY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBDT05GSUdVUkFUSU9OIFBBTkVMXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5jb25maWctZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMzAwcHgsIDFmcikpO1xuICBnYXA6IDEuMjVyZW07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBBUkFNRVRFUlMgUEFORUxcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLnBhcmFtZXRlcnMtZ3JpZCB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpO1xuICBnYXA6IDEuMjVyZW07XG4gIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRk9STSBDT05UUk9MU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uZm9ybS1ncm91cCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMC41cmVtO1xufVxuXG4uZm9ybS1sYWJlbCB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGNvbG9yOiB2YXIoLS1hcGktdGV4dC1wcmltYXJ5KTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjI1cmVtO1xuXG4gIC5yZXF1aXJlZCB7XG4gICAgY29sb3I6IHZhcigtLWFwaS1hY2NlbnQtcmVkKTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICB9XG59XG5cbi5mb3JtLWNvbnRyb2wge1xuICB3aWR0aDogMTAwJTtcbiAgcGFkZGluZzogMC42MjVyZW0gMC44NzVyZW07XG4gIGZvbnQtc2l6ZTogMC45Mzc1cmVtO1xuICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXByaW1hcnkpO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1hcGktYmctdGVydGlhcnkpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1hcGktYm9yZGVyLWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xuICBvdXRsaW5lOiBub25lO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICY6aG92ZXIge1xuICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYXBpLWFjY2VudC1ibHVlKTtcbiAgfVxuXG4gICY6Zm9jdXMge1xuICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYXBpLWFjY2VudC1ibHVlKTtcbiAgICBib3gtc2hhZG93OiAwIDAgMCAzcHggcmdiYSg3OSwgMTk1LCAyNDcsIDAuMSk7XG4gIH1cblxuICAmOmRpc2FibGVkIHtcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1hcGktYmctc2Vjb25kYXJ5KTtcbiAgfVxuXG4gICYuZXJyb3Ige1xuICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYXBpLWVycm9yKTtcblxuICAgICY6Zm9jdXMge1xuICAgICAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoMjM5LCA2OCwgNjgsIDAuMSk7XG4gICAgfVxuICB9XG59XG5cbmlucHV0W3R5cGU9XCJudW1iZXJcIl0uZm9ybS1jb250cm9sIHtcbiAgLW1vei1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7XG5cbiAgJjo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbixcbiAgJjo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbiB7XG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xuICAgIG1hcmdpbjogMDtcbiAgfVxufVxuXG5zZWxlY3QuZm9ybS1jb250cm9sIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBhcHBlYXJhbmNlOiBub25lO1xuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHdpZHRoPScxMicgaGVpZ2h0PSc4JyB2aWV3Qm94PScwIDAgMTIgOCcgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyUzRSUzQ3BhdGggZD0nTTEgMUw2IDZMMTEgMScgc3Ryb2tlPSclMjM4MDgwODAnIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJy8lM0UlM0Mvc3ZnJTNFXCIpO1xuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjg3NXJlbSBjZW50ZXI7XG4gIHBhZGRpbmctcmlnaHQ6IDIuNXJlbTtcbn1cblxuLmhlbHAtdGV4dCB7XG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xuICBjb2xvcjogdmFyKC0tYXBpLXRleHQtc2Vjb25kYXJ5KTtcbiAgbWFyZ2luOiAwO1xuXG4gICYuZXJyb3Ige1xuICAgIGNvbG9yOiB2YXIoLS1hcGktZXJyb3IpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEJVVFRPTlNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLmJ0bi1wcmltYXJ5LFxuLmJ0bi1zZWNvbmRhcnksXG4uYnRuLWljb24ge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGdhcDogMC41cmVtO1xuICBwYWRkaW5nOiAwLjYyNXJlbSAxLjI1cmVtO1xuICBmb250LXNpemU6IDAuOTM3NXJlbTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgYm9yZGVyOiBub25lO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgb3V0bGluZTogbm9uZTtcblxuICAmOmRpc2FibGVkIHtcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgfVxuXG4gIC5pY29uIHtcbiAgICBmbGV4LXNocmluazogMDtcbiAgfVxufVxuXG4uYnRuLXByaW1hcnkge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1hcGktYWNjZW50LWJsdWUpO1xuICBjb2xvcjogIzFlMWUxZTtcblxuICAmOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjlCNkY2O1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcbiAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoNzksIDE5NSwgMjQ3LCAwLjMpO1xuICB9XG5cbiAgJjphY3RpdmU6bm90KDpkaXNhYmxlZCkge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgfVxufVxuXG4uYnRuLXNlY29uZGFyeSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWFwaS1iZy10ZXJ0aWFyeSk7XG4gIGNvbG9yOiB2YXIoLS1hcGktdGV4dC1wcmltYXJ5KTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYXBpLWJvcmRlci1jb2xvcik7XG5cbiAgJjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYXBpLWJnLWhvdmVyKTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWFwaS1hY2NlbnQtYmx1ZSk7XG4gIH1cbn1cblxuLmJ0bi1pY29uIHtcbiAgcGFkZGluZzogMC41cmVtO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXNlY29uZGFyeSk7XG5cbiAgJjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYXBpLWJnLWhvdmVyKTtcbiAgICBjb2xvcjogdmFyKC0tYXBpLXRleHQtcHJpbWFyeSk7XG4gIH1cbn1cblxuLmJ0bi1zbSB7XG4gIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xuICBmb250LXNpemU6IDAuODc1cmVtO1xufVxuXG4uYnRuLWxnIHtcbiAgcGFkZGluZzogMC44NzVyZW0gMS43NXJlbTtcbiAgZm9udC1zaXplOiAxcmVtO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTVUJNSVQgU0VDVElPTlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uc3VibWl0LXNlY3Rpb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDFyZW07XG4gIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICBwYWRkaW5nLXRvcDogMXJlbTtcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWFwaS1ib3JkZXItY29sb3IpO1xufVxuXG4uc3Bpbm5lciB7XG4gIHdpZHRoOiAxOHB4O1xuICBoZWlnaHQ6IDE4cHg7XG4gIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMzAsIDMwLCAzMCwgMC4zKTtcbiAgYm9yZGVyLXRvcC1jb2xvcjogIzFlMWUxZTtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMC44cyBsaW5lYXIgaW5maW5pdGU7XG59XG5cbkBrZXlmcmFtZXMgc3BpbiB7XG4gIHRvIHsgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxufVxuXG4uZXJyb3ItYmFubmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjc1cmVtO1xuICBwYWRkaW5nOiAxcmVtO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjEpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1hcGktZXJyb3IpO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIGNvbG9yOiB2YXIoLS1hcGktZXJyb3IpO1xuICB3aWR0aDogMTAwJTtcblxuICAuaWNvbiB7XG4gICAgZmxleC1zaHJpbms6IDA7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTE9HIERJU1BMQVkgKFJFUVVFU1QvUkVTUE9OU0UpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5sb2ctZGlzcGxheSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMS41cmVtO1xuICBwYWRkaW5nOiAwO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiBub25lO1xufVxuXG4ubG9nLXNlY3Rpb24ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1hcGktYmctc2Vjb25kYXJ5KTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYXBpLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcblxuICAuc2VjdGlvbi1oZWFkZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgcGFkZGluZzogMXJlbSAxLjI1cmVtO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWFwaS1iZy10ZXJ0aWFyeSk7XG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWFwaS1ib3JkZXItY29sb3IpO1xuXG4gICAgLnNlY3Rpb24tdGl0bGUge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgZm9udC1zaXplOiAxcmVtO1xuICAgIH1cblxuICAgIC5oZWFkZXItYWN0aW9ucyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMC43NXJlbTtcbiAgICB9XG4gIH1cbn1cblxuLnJlcXVlc3Qtc2VjdGlvbiB7XG4gIC5yZXF1ZXN0LWluZm8ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBnYXA6IDAuNzVyZW07XG4gICAgcGFkZGluZzogMXJlbSAxLjI1cmVtO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzksIDE5NSwgMjQ3LCAwLjA1KTtcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYXBpLWJvcmRlci1jb2xvcik7XG5cbiAgICAuaHR0cC1tZXRob2Qge1xuICAgICAgZm9udC1mYW1pbHk6ICdDb25zb2xhcycsICdNb25hY28nLCAnQ291cmllciBOZXcnLCBtb25vc3BhY2U7XG4gICAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS1hcGktYWNjZW50LWJsdWUpO1xuICAgICAgcGFkZGluZzogMC4yNXJlbSAwLjYyNXJlbTtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNzksIDE5NSwgMjQ3LCAwLjE1KTtcbiAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICB9XG5cbiAgICAuZW5kcG9pbnQge1xuICAgICAgZm9udC1mYW1pbHk6ICdDb25zb2xhcycsICdNb25hY28nLCAnQ291cmllciBOZXcnLCBtb25vc3BhY2U7XG4gICAgICBmb250LXNpemU6IDAuOTM3NXJlbTtcbiAgICAgIGNvbG9yOiB2YXIoLS1hcGktdGV4dC1wcmltYXJ5KTtcbiAgICB9XG4gIH1cbn1cblxuLnJlc3BvbnNlLXNlY3Rpb24ge1xuICAuc3RhdHVzLWJhZGdlIHtcbiAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgcGFkZGluZzogMC4yNXJlbSAwLjc1cmVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcblxuICAgICYuc3RhdHVzLXN1Y2Nlc3Mge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzNCwgMTk3LCA5NCwgMC4xNSk7XG4gICAgICBjb2xvcjogdmFyKC0tYXBpLXN1Y2Nlc3MpO1xuICAgIH1cblxuICAgICYuc3RhdHVzLWNsaWVudC1lcnJvciB7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTtcbiAgICAgIGNvbG9yOiB2YXIoLS1hcGktZXJyb3IpO1xuICAgIH1cblxuICAgICYuc3RhdHVzLXNlcnZlci1lcnJvciB7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjE1KTtcbiAgICAgIGNvbG9yOiB2YXIoLS1hcGktZXJyb3IpO1xuICAgIH1cblxuICAgICYuc3RhdHVzLXVua25vd24ge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMjgsIDEyOCwgMTI4LCAwLjE1KTtcbiAgICAgIGNvbG9yOiB2YXIoLS1hcGktdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cbiAgfVxuXG4gIC5yZXNwb25zZS10aW1lIHtcbiAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICBmb250LXNpemU6IDAuODEyNXJlbTtcbiAgICBjb2xvcjogdmFyKC0tYXBpLXRleHQtc2Vjb25kYXJ5KTtcbiAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNjI1cmVtO1xuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWFwaS1iZy1wcmltYXJ5KTtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIH1cbn1cblxuLmNvZGUtYmxvY2sge1xuICBwYWRkaW5nOiAxLjI1cmVtO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2RlLWJnKTtcbiAgb3ZlcmZsb3cteDogYXV0bztcblxuICBwcmUge1xuICAgIG1hcmdpbjogMDtcbiAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjY7XG4gICAgY29sb3I6IHZhcigtLWNvZGUtdGV4dCk7XG5cbiAgICBjb2RlIHtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgd2hpdGUtc3BhY2U6IHByZTtcbiAgICB9XG4gIH1cblxuICAmLnJlc3BvbnNlLWVycm9yIHtcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLWFwaS1lcnJvcik7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gSElTVE9SWSBTRUNUSU9OXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5oaXN0b3J5LXNlY3Rpb24ge1xuICAuaGlzdG9yeS1saXN0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZ2FwOiAwLjc1cmVtO1xuICB9XG5cbiAgLmhpc3RvcnktaXRlbSB7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1hcGktYmctdGVydGlhcnkpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWFwaS1ib3JkZXItY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYXBpLWJnLWhvdmVyKTtcbiAgICAgIGJvcmRlci1jb2xvcjogdmFyKC0tYXBpLWFjY2VudC1ibHVlKTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCg0cHgpO1xuICAgIH1cblxuICAgIC5oaXN0b3J5LWl0ZW0taGVhZGVyIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZ2FwOiAwLjc1cmVtO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMC41cmVtO1xuXG4gICAgICAuaHR0cC1tZXRob2Qge1xuICAgICAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICAgICAgZm9udC1zaXplOiAwLjgxMjVyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1hcGktYWNjZW50LWJsdWUpO1xuICAgICAgfVxuXG4gICAgICAuZW5kcG9pbnQge1xuICAgICAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICAgICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICAgICAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXByaW1hcnkpO1xuICAgICAgICBmbGV4OiAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIC5oaXN0b3J5LWl0ZW0tbWV0YSB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGdhcDogMXJlbTtcbiAgICAgIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xuICAgICAgY29sb3I6IHZhcigtLWFwaS10ZXh0LXNlY29uZGFyeSk7XG5cbiAgICAgIC50aW1lc3RhbXAge1xuICAgICAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICAgIH1cblxuICAgICAgLnJlc3BvbnNlLXRpbWUge1xuICAgICAgICBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsICdDb3VyaWVyIE5ldycsIG1vbm9zcGFjZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUkVTUE9OU0lWRSBERVNJR05cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMjRweCkge1xuICAuYXBpLXRlc3Rlci1jb250YWluZXIge1xuICAgIHBhZGRpbmc6IDEuNXJlbTtcbiAgfVxuXG4gIC5wYXJhbWV0ZXJzLWdyaWQsXG4gIC5jb25maWctZ3JpZCB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cblxuICAuYXBpLXRlc3Rlci1oZWFkZXIge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZ2FwOiAxcmVtO1xuXG4gICAgLmhlYWRlci1hY3Rpb25zIHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xuICAgIH1cbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNjQwcHgpIHtcbiAgLmFwaS10ZXN0ZXItY29udGFpbmVyIHtcbiAgICBwYWRkaW5nOiAxcmVtO1xuICB9XG5cbiAgLnBhZ2UtdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMS41cmVtICFpbXBvcnRhbnQ7XG4gIH1cblxuICAuc2VjdGlvbi10aXRsZSB7XG4gICAgZm9udC1zaXplOiAxLjEyNXJlbSAhaW1wb3J0YW50O1xuICB9XG5cbiAgLmNvbmZpZy1wYW5lbCxcbiAgLnBhcmFtZXRlcnMtcGFuZWwsXG4gIC5sb2ctZGlzcGxheSxcbiAgLmhpc3Rvcnktc2VjdGlvbiB7XG4gICAgcGFkZGluZzogMXJlbTtcbiAgfVxuXG4gIC5jb2RlLWJsb2NrIHtcbiAgICBwYWRkaW5nOiAwLjg3NXJlbTtcblxuICAgIHByZSB7XG4gICAgICBmb250LXNpemU6IDAuODEyNXJlbTtcbiAgICB9XG4gIH1cblxuICAuaGlzdG9yeS1pdGVtIHtcbiAgICAuaGlzdG9yeS1pdGVtLWhlYWRlciB7XG4gICAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgfVxuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEFDQ0VTU0lCSUxJVFlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgKiB7XG4gICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAwLjAxbXMgIWltcG9ydGFudDtcbiAgICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiAxICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMC4wMW1zICFpbXBvcnRhbnQ7XG4gIH1cbn1cblxuLy8gRm9jdXMgdmlzaWJsZSBmb3Iga2V5Ym9hcmQgbmF2aWdhdGlvblxuOmZvY3VzLXZpc2libGUge1xuICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tYXBpLWFjY2VudC1ibHVlKTtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return ApiTesterComponent;
})();

/***/ }),

/***/ 8015:
/*!*********************************************!*\
  !*** ./src/app/services/trading.service.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TradingService: () => (/* binding */ TradingService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8764);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ 6443);





let TradingService = /*#__PURE__*/(() => {
  class TradingService {
    constructor(http) {
      this.http = http;
      this.isLoadingBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false);
      this.isConnectingPlatform = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false);
      this.isLoadingBalance$ = this.isLoadingBalance.asReadonly();
      this.isConnectingPlatform$ = this.isConnectingPlatform.asReadonly();
    }
    // Get available trading platforms
    getPlatforms() {
      return this.http.get((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'platforms')).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error fetching trading platforms:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Connect trading platform with API key
    connectPlatform(apiKeyData) {
      this.isConnectingPlatform.set(true);
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'apiKeys'), apiKeyData).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(() => this.isConnectingPlatform.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        this.isConnectingPlatform.set(false);
        console.error('Error connecting platform:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Remove API key / disconnect platform
    disconnectPlatform(platformId) {
      return this.http.delete(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'apiKeys')}/${platformId}`).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error disconnecting platform:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Test API key connection
    testConnection(platformId) {
      return this.http.post(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'apiKeys')}/${platformId}/test`, {}).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error testing connection:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Get balance data from all connected platforms
    getBalance() {
      this.isLoadingBalance.set(true);
      return this.http.get((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'balance')).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(() => this.isLoadingBalance.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        this.isLoadingBalance.set(false);
        console.error('Error fetching balance:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Refresh balance data
    refreshBalance() {
      return this.http.post(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'balance')}/refresh`, {}).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error refreshing balance:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Get trading orders
    getOrders(platformId) {
      const params = platformId ? `?platformId=${platformId}` : '';
      return this.http.get(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'orders')}${params}`).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error fetching orders:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Update API key
    updateApiKey(platformId, apiKeyData) {
      return this.http.put(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('trading', 'apiKeys')}/${platformId}`, apiKeyData).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error updating API key:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    /**
     * Place an exchange order (for API testing)
     * This endpoint allows testing exchange order placement with detailed request/response logging
     *
     * @param orderRequest - The order request parameters
     * @returns Observable of ExchangeOrderResponse
     */
    placeExchangeOrder(orderRequest) {
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildApiUrl)('/exchange-orders'), orderRequest).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
        console.log('Exchange order placed:', response);
      }), (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error placing exchange order:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    static {
      this.ɵfac = function TradingService_Factory(t) {
        return new (t || TradingService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
        token: TradingService,
        factory: TradingService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return TradingService;
})();

/***/ })

}]);
//# sourceMappingURL=968.js.map