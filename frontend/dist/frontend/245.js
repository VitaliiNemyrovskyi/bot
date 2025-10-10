"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[245],{

/***/ 1245:
/*!*********************************************************!*\
  !*** ./src/app/components/profile/profile.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProfileComponent: () => (/* binding */ ProfileComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/exchange-credentials.model */ 7392);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs/operators */ 4334);
/* harmony import */ var _trading_platform_info_modal_trading_platform_info_modal_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../trading-platform-info-modal/trading-platform-info-modal.component */ 8905);
/* harmony import */ var _ui_confirmation_modal_confirmation_modal_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/confirmation-modal/confirmation-modal.component */ 252);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/button/button.component */ 5782);
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/auth.service */ 4796);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../services/translation.service */ 6845);
/* harmony import */ var _services_theme_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../services/theme.service */ 487);
/* harmony import */ var _services_user_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/user.service */ 9885);
/* harmony import */ var _services_google_auth_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/google-auth.service */ 8802);
/* harmony import */ var _services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/exchange-credentials.service */ 9704);
/* harmony import */ var _services_exchange_environment_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/exchange-environment.service */ 5731);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/router */ 5072);



















const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.code;
const _forTrack2 = ($index, $item) => $item.label;
function ProfileComponent_For_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "ui-button", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_For_29_Template_ui_button_clicked_0_listener() {
      const tab_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r1).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.setActiveTab(tab_r2.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](1, "span", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "span", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const tab_r2 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassProp"]("active", ctx_r2.activeTab() === tab_r2.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](tab_r2.icon);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate(tab_r2.label));
  }
}
function ProfileComponent_Conditional_31_For_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "option", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const lang_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("value", lang_r5.code);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate2"]("", lang_r5.flag, " ", lang_r5.name, "");
  }
}
function ProfileComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 24)(1, "div", 34)(2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "div", 35)(5, "div", 36)(6, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](8, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](10, "div", 37)(11, "select", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("ngModelChange", function ProfileComponent_Conditional_31_Template_select_ngModelChange_11_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx_r2.selectedLanguage, $event) || (ctx_r2.selectedLanguage = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_31_Template_select_change_11_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.changeLanguage($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](12, ProfileComponent_Conditional_31_For_13_Template, 2, 3, "option", 39, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](14, "div", 35)(15, "div", 36)(16, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](18, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](20, "div", 37)(21, "ui-button", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_31_Template_ui_button_clicked_21_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.toggleTheme());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](23, "div", 35)(24, "div", 36)(25, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](26);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](27, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](28);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](29, "div", 37)(30, "select", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("ngModelChange", function ProfileComponent_Conditional_31_Template_select_ngModelChange_30_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx_r2.selectedCurrency, $event) || (ctx_r2.selectedCurrency = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_31_Template_select_change_30_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.changeCurrency($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](31, "option", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](32, "\uD83C\uDDFA\uD83C\uDDF8 USD");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](33, "option", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](34, "\uD83C\uDDEA\uD83C\uDDFA EUR");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](35, "option", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](36, "\uD83C\uDDEC\uD83C\uDDE7 GBP");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](37, "option", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](38, "\uD83C\uDDEF\uD83C\uDDF5 JPY");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](39, "option", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](40, "\uD83C\uDDE8\uD83C\uDDE6 CAD");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](41, "option", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](42, "\uD83C\uDDE6\uD83C\uDDFA AUD");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](43, "option", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](44, "\uD83C\uDDE8\uD83C\uDDED CHF");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](45, "div", 34)(46, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](47);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](48, "div", 35)(49, "div", 36)(50, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](51);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](52, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](54, "div", 37)(55, "label", 48)(56, "input", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_56_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx_r2.emailNotifications, $event) || (ctx_r2.emailNotifications = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_31_Template_input_change_56_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateNotificationSettings());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](57, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](58, "div", 35)(59, "div", 36)(60, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](61);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](62, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](63);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](64, "div", 37)(65, "label", 48)(66, "input", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_66_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx_r2.priceAlerts, $event) || (ctx_r2.priceAlerts = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_31_Template_input_change_66_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateNotificationSettings());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](67, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](68, "div", 35)(69, "div", 36)(70, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](71);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](72, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](73);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](74, "div", 37)(75, "label", 48)(76, "input", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_76_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx_r2.tradingAlerts, $event) || (ctx_r2.tradingAlerts = $event);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_31_Template_input_change_76_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateNotificationSettings());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](77, "span", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.preferences"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.language"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.languageDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("ngModel", ctx_r2.selectedLanguage);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](ctx_r2.availableLanguages);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.theme"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.themeDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.isDark() ? ctx_r2.translate("theme.light") : ctx_r2.translate("theme.dark"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.currency"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.currencyDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("ngModel", ctx_r2.selectedCurrency);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.notifications"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.emailNotifications"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.emailNotificationsDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("ngModel", ctx_r2.emailNotifications);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.priceAlerts"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.priceAlertsDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("ngModel", ctx_r2.priceAlerts);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.tradingAlerts"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.tradingAlertsDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("ngModel", ctx_r2.tradingAlerts);
  }
}
function ProfileComponent_Conditional_32_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](1, "svg", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](2, "path", 78)(3, "path", 79)(4, "path", 80)(5, "path", 81);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.googleLinked"), " ");
  }
}
function ProfileComponent_Conditional_32_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "ui-button", 82);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_32_Conditional_20_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r7);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.linkGoogleAccount());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.linkGoogle"), " ");
  }
}
function ProfileComponent_Conditional_32_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 25)(1, "div", 51)(2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "form", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("ngSubmit", function ProfileComponent_Conditional_32_Template_form_ngSubmit_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r6);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateUserInfo());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "div", 53)(6, "div", 54)(7, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](9, "input", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](10, "div", 54)(11, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](13, "input", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](14, "div", 54)(15, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](17, "div", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](18, "input", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](19, ProfileComponent_Conditional_32_Conditional_19_Template, 7, 1, "span", 59)(20, ProfileComponent_Conditional_32_Conditional_20_Template, 2, 1, "ui-button", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](21, "div", 54)(22, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](24, "input", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](25, "div", 54)(26, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](28, "select", 62)(29, "option", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](30, "UTC");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](31, "option", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](33, "option", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](35, "option", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](36);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](37, "option", 67);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](39, "option", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](40);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](41, "option", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](42);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](43, "option", 70);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](44);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](45, "option", 71);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](46);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](47, "option", 72);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](48);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](49, "option", 73);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](50);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](51, "div", 74)(52, "ui-button", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](53);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](54, "ui-button", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_32_Template_ui_button_clicked_54_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r6);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.resetUserInfo());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](55);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()()()();
  }
  if (rf & 2) {
    let tmp_6_0;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.personalInfo"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("formGroup", ctx_r2.userInfoForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.firstName"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.lastName"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.email"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](((tmp_6_0 = ctx_r2.currentUser()) == null ? null : tmp_6_0.googleLinked) ? 19 : 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.phone"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezone"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneET"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneCT"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneMT"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezonePT"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneGMT"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneCET"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneMSK"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneJST"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneCST"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.timezoneGST"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", !ctx_r2.userInfoForm.dirty);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.saveChanges"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.cancel"), " ");
  }
}
function ProfileComponent_Conditional_33_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 88);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](1, "div", 95);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](2, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.loadingCredentials"));
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "input", 118);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("input", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_9_Template_input_input_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r11);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateEditField("label", $event.target.value));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("value", ctx_r2.editFormData().label || "")("placeholder", ctx_r2.translate("profile.enterLabel"));
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 104);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](credential_r10.label || "-");
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "path", 122)(1, "circle", 123);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "path", 121);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 106)(1, "input", 119);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("input", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Template_input_input_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r12);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateEditField("apiKey", $event.target.value));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](2, "ui-button", 120);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Template_ui_button_clicked_2_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r12);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.toggleApiKeyVisibility(credential_r10.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "svg", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](4, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Conditional_4_Template, 2, 0)(5, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Conditional_5_Template, 1, 0, ":svg:path", 121);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("type", ctx_r2.showApiSecret()[credential_r10.id + "_key"] ? "text" : "password")("value", ctx_r2.showApiSecret()[credential_r10.id + "_key"] && ctx_r2.revealedCredentials()[credential_r10.id] ? ctx_r2.revealedCredentials()[credential_r10.id].apiKey : ctx_r2.editFormData().apiKey || "")("placeholder", ctx_r2.translate("profile.currentKey") + ": " + credential_r10.apiKeyPreview + " (" + ctx_r2.translate("profile.enterNewOrEmpty") + ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.showApiSecret()[credential_r10.id + "_key"] ? 4 : 5);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 107);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.getMaskedValue(credential_r10.apiKeyPreview));
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "path", 122)(1, "circle", 123);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "path", 121);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 106)(1, "input", 119);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("input", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Template_input_input_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r13);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.updateEditField("apiSecret", $event.target.value));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](2, "ui-button", 120);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Template_ui_button_clicked_2_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r13);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.toggleApiSecretVisibility(credential_r10.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "svg", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](4, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Conditional_4_Template, 2, 0)(5, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Conditional_5_Template, 1, 0, ":svg:path", 121);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("type", ctx_r2.showApiSecret()[credential_r10.id + "_secret"] ? "text" : "password")("value", ctx_r2.showApiSecret()[credential_r10.id + "_secret"] && ctx_r2.revealedCredentials()[credential_r10.id] ? ctx_r2.revealedCredentials()[credential_r10.id].apiSecret : ctx_r2.editFormData().apiSecret || "")("placeholder", ctx_r2.translate("profile.enterNewSecret"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.showApiSecret()[credential_r10.id + "_secret"] ? 4 : 5);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 109);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "span", 125);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("button.test"), " ");
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](0, "span", 125);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 116)(1, "ui-button", 124);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Template_ui_button_clicked_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r14);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.testEditConnection(credential_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](2, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_2_Template, 1, 0, "span", 125)(3, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_3_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "ui-button", 126);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Template_ui_button_clicked_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r14);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.saveCredential(credential_r10.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](5, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Conditional_5_Template, 1, 0, "span", 125);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](7, "ui-button", 127);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r14);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.cancelEdit());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.testingConnectionId() === credential_r10.id || ctx_r2.savingCredentialId() === credential_r10.id)("title", ctx_r2.translate("profile.testConnection"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.testingConnectionId() === credential_r10.id ? 2 : 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.savingCredentialId() === credential_r10.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.savingCredentialId() === credential_r10.id ? 5 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("button.save"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.savingCredentialId() === credential_r10.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("button.cancel"), " ");
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 117)(1, "ui-button", 128);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_25_Template_ui_button_clicked_1_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r15);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.startEditCredential(credential_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](2, "svg", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](3, "path", 7)(4, "path", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "ui-button", 129);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_25_Template_ui_button_clicked_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r15);
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.deleteCredential(credential_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](6, "svg", 77);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](7, "polyline", 130)(8, "path", 131);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("title", ctx_r2.translate("button.edit"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.deletingCredentialId() === credential_r10.id)("title", ctx_r2.translate("button.delete"));
  }
}
function ProfileComponent_Conditional_33_Conditional_11_For_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "tr")(1, "td", 97)(2, "div", 98)(3, "span", 99);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("click", function ProfileComponent_Conditional_33_Conditional_11_For_19_Template_span_click_3_listener() {
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r9).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.openPlatformInfoModal(credential_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "td", 100)(6, "span", 101);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](8, "td", 102);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](9, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_9_Template, 1, 2, "input", 103)(10, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_10_Template, 2, 1, "span", 104);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](11, "td", 105);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](12, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_12_Template, 6, 4, "div", 106)(13, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_13_Template, 2, 1, "span", 107);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](14, "td", 108);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](15, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_15_Template, 6, 4, "div", 106)(16, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_16_Template, 2, 0, "span", 109);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](17, "td", 110)(18, "label", 111)(19, "input", 112);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("change", function ProfileComponent_Conditional_33_Conditional_11_For_19_Template_input_change_19_listener($event) {
      const credential_r10 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r9).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.toggleActive(credential_r10, $event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](20, "span", 113);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](21, "span", 114);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](23, "td", 115);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](24, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_24_Template, 9, 8, "div", 116)(25, ProfileComponent_Conditional_33_Conditional_11_For_19_Conditional_25_Template, 9, 3, "div", 117);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const credential_r10 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassProp"]("editing", ctx_r2.editingCredentialId() === credential_r10.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵstyleProp"]("background-color", ctx_r2.EXCHANGE_METADATA[credential_r10.exchange].color);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵattribute"]("title", ctx_r2.translate("profile.clickToView") + " " + ctx_r2.getExchangeName(credential_r10.exchange) + " " + ctx_r2.translate("profile.accountDetails"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.getExchangeName(credential_r10.exchange), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassProp"]("testnet", credential_r10.environment === ctx_r2.EnvironmentType.TESTNET);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", credential_r10.environment === ctx_r2.EnvironmentType.TESTNET ? ctx_r2.translate("profile.testnet") : ctx_r2.translate("profile.mainnet"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.editingCredentialId() === credential_r10.id ? 9 : 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.editingCredentialId() === credential_r10.id ? 12 : 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.editingCredentialId() === credential_r10.id ? 15 : 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("checked", credential_r10.isActive);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](credential_r10.isActive ? ctx_r2.translate("profile.active") : ctx_r2.translate("profile.inactive"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.editingCredentialId() === credential_r10.id ? 24 : 25);
  }
}
function ProfileComponent_Conditional_33_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "table", 89)(1, "thead")(2, "tr")(3, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](7, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](9, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](11, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](13, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](15, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](17, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](18, ProfileComponent_Conditional_33_Conditional_11_For_19_Template, 26, 15, "tr", 96, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.tradingPlatform"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.environment"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.label"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.apiKey"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.apiSecret"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.status"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.actions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](ctx_r2.credentials());
  }
}
function ProfileComponent_Conditional_33_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 90);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](1, "svg", 132);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](2, "path", 133);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](7, "ui-button", 84);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_12_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r16);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.openAddCredentialModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.noCredentials"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.noCredentialsDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.addCredential"), " ");
  }
}
function ProfileComponent_Conditional_33_Conditional_35_For_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "option", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const exchange_r18 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("value", exchange_r18);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.getExchangeName(exchange_r18), " ");
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.exchangeRequired"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 54)(1, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4, "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "select", 154)(6, "option", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](8, "option", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"]("", ctx_r2.translate("bot.environment"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("value", ctx_r2.EnvironmentType.TESTNET);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.testnetDemo"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("value", ctx_r2.EnvironmentType.MAINNET);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.mainnetReal"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.apiKeyError"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_43_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "svg", 150);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](1, "path", 155)(2, "circle", 156);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_44_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "svg", 150);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](1, "path", 157)(2, "line", 158);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.apiSecretError"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_48_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.testing"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.testConnection"));
  }
}
function ProfileComponent_Conditional_33_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 134);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("click", function ProfileComponent_Conditional_33_Conditional_35_Template_div_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.closeAddCredentialModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](1, "div", 135);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("click", function ProfileComponent_Conditional_33_Conditional_35_Template_div_click_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"]($event.stopPropagation());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](2, "div", 136)(3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "ui-button", 137);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_35_Template_ui_button_clicked_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.closeAddCredentialModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](6, "svg", 138);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](7, "line", 139)(8, "line", 140);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](9, "form", 141);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("ngSubmit", function ProfileComponent_Conditional_33_Conditional_35_Template_form_ngSubmit_9_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.saveNewCredential());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](10, "div", 54)(11, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](13, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](14, "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](15, "select", 143)(16, "option", 144);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](18, ProfileComponent_Conditional_33_Conditional_35_For_19_Template, 2, 2, "option", 39, _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterTrackByIdentity"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](20, ProfileComponent_Conditional_33_Conditional_35_Conditional_20_Template, 2, 1, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](21, ProfileComponent_Conditional_33_Conditional_35_Conditional_21_Template, 10, 5, "div", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](22, "div", 54)(23, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](25, "input", 146);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](26, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](28, "div", 54)(29, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](30);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](31, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](32, "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](33, "input", 147);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](34, ProfileComponent_Conditional_33_Conditional_35_Conditional_34_Template, 2, 1, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](35, "div", 54)(36, "label");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](37);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](38, "span", 142);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](39, "*");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](40, "div", 106);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](41, "input", 148);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](42, "ui-button", 149);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_35_Template_ui_button_clicked_42_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.toggleNewFormApiSecretVisibility());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](43, ProfileComponent_Conditional_33_Conditional_35_Conditional_43_Template, 3, 0, ":svg:svg", 150)(44, ProfileComponent_Conditional_33_Conditional_35_Conditional_44_Template, 3, 0, ":svg:svg", 150);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](45, ProfileComponent_Conditional_33_Conditional_35_Conditional_45_Template, 2, 1, "span", 145);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](46, "div", 151)(47, "ui-button", 152);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_35_Template_ui_button_clicked_47_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.testNewConnection());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](48, ProfileComponent_Conditional_33_Conditional_35_Conditional_48_Template, 2, 1, "span")(49, ProfileComponent_Conditional_33_Conditional_35_Conditional_49_Template, 2, 1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](50, "div", 153)(51, "ui-button", 76);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Conditional_35_Template_ui_button_clicked_51_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r17);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.closeAddCredentialModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](52);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](53, "ui-button", 75);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](54);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()()()()();
  }
  if (rf & 2) {
    let tmp_7_0;
    let tmp_14_0;
    let tmp_19_0;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.addNewCredential"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("formGroup", ctx_r2.newCredentialForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"]("", ctx_r2.translate("bot.exchange"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("bot.selectExchange"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](ctx_r2.exchanges);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](((tmp_7_0 = ctx_r2.newCredentialForm.get("exchange")) == null ? null : tmp_7_0.invalid) && ((tmp_7_0 = ctx_r2.newCredentialForm.get("exchange")) == null ? null : tmp_7_0.touched) ? 20 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.isAdmin() ? 21 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate2"]("", ctx_r2.translate("profile.label"), " (", ctx_r2.translate("profile.optional"), ")");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("placeholder", ctx_r2.translate("profile.labelPlaceholder"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.labelDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"]("", ctx_r2.translate("profile.apiKey"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("placeholder", ctx_r2.translate("profile.enterApiKey"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](((tmp_14_0 = ctx_r2.newCredentialForm.get("apiKey")) == null ? null : tmp_14_0.invalid) && ((tmp_14_0 = ctx_r2.newCredentialForm.get("apiKey")) == null ? null : tmp_14_0.touched) ? 34 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"]("", ctx_r2.translate("profile.apiSecret"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("type", ctx_r2.showApiSecret()["new"] ? "text" : "password")("placeholder", ctx_r2.translate("profile.enterApiSecret"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.showApiSecret()["new"] ? 43 : 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](((tmp_19_0 = ctx_r2.newCredentialForm.get("apiSecret")) == null ? null : tmp_19_0.invalid) && ((tmp_19_0 = ctx_r2.newCredentialForm.get("apiSecret")) == null ? null : tmp_19_0.touched) ? 45 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.testingConnectionId() === "new");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.testingConnectionId() === "new" ? 48 : 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("button.cancel"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("disabled", ctx_r2.newCredentialForm.invalid);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.saveCredential"), " ");
  }
}
function ProfileComponent_Conditional_33_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 26)(1, "div", 83)(2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "ui-button", 84);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_33_Template_ui_button_clicked_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r8);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.openAddCredentialModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "svg", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](6, "line", 85)(7, "line", 86);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](9, "div", 87);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](10, ProfileComponent_Conditional_33_Conditional_10_Template, 4, 1, "div", 88)(11, ProfileComponent_Conditional_33_Conditional_11_Template, 20, 7, "table", 89)(12, ProfileComponent_Conditional_33_Conditional_12_Template, 9, 3, "div", 90);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](13, "div", 91)(14, "div", 92)(15, "div", 93);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](16, "\uD83D\uDD10");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](17, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](19, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](21, "div", 92)(22, "div", 93);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](23, "\u26A1");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](24, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](25);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](26, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](28, "div", 92)(29, "div", 93);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](30, "\uD83C\uDF10");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](31, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](33, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](35, ProfileComponent_Conditional_33_Conditional_35_Template, 55, 23, "div", 94);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.tradingPlatforms"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.addNewCredential"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.exchangeCredentialsService.loading() ? 10 : ctx_r2.credentials().length > 0 ? 11 : 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.secureConnection"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.secureConnectionDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.realTimeData"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.realTimeDataDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.multiExchange"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.multiExchangeDesc"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.showAddCredentialModal() ? 35 : -1);
  }
}
function ProfileComponent_Conditional_34_For_8_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\u2139\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\u2705");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Case_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\u274C");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Case_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\uD83D\uDCC8");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Case_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, "\uD83D\uDCE7");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Conditional_17_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "ui-button", 172);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_34_For_8_Conditional_17_For_2_Template_ui_button_clicked_0_listener() {
      const action_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r20).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](4);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.executeMessageAction(action_r21));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const action_r21 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("className", "btn-" + action_r21.type);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", action_r21.label, " ");
  }
}
function ProfileComponent_Conditional_34_For_8_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 169);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](1, ProfileComponent_Conditional_34_For_8_Conditional_17_For_2_Template, 2, 2, "ui-button", 171, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const message_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](message_r22.actions);
  }
}
function ProfileComponent_Conditional_34_For_8_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "ui-button", 173);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_34_For_8_Conditional_18_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r23);
      const message_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]().$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.markAsRead(message_r22.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](1, "span", 174);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function ProfileComponent_Conditional_34_For_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 164)(1, "div", 165);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](2, ProfileComponent_Conditional_34_For_8_Case_2_Template, 2, 0, "span")(3, ProfileComponent_Conditional_34_For_8_Case_3_Template, 2, 0, "span")(4, ProfileComponent_Conditional_34_For_8_Case_4_Template, 2, 0, "span")(5, ProfileComponent_Conditional_34_For_8_Case_5_Template, 2, 0, "span")(6, ProfileComponent_Conditional_34_For_8_Case_6_Template, 2, 0, "span")(7, ProfileComponent_Conditional_34_For_8_Case_7_Template, 2, 0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](8, "div", 166)(9, "div", 167)(10, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](12, "span", 168);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipe"](14, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](15, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](17, ProfileComponent_Conditional_34_For_8_Conditional_17_Template, 3, 0, "div", 169);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](18, ProfileComponent_Conditional_34_For_8_Conditional_18_Template, 2, 0, "ui-button", 170);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    let tmp_13_0;
    const message_r22 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassProp"]("unread", !message_r22.read);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassMap"]("icon-" + message_r22.type);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"]((tmp_13_0 = message_r22.type) === "info" ? 2 : tmp_13_0 === "warning" ? 3 : tmp_13_0 === "success" ? 4 : tmp_13_0 === "error" ? 5 : tmp_13_0 === "trade" ? 6 : 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](message_r22.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipeBind2"](14, 10, message_r22.timestamp, "short"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](message_r22.content);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"]((message_r22.actions == null ? null : message_r22.actions.length) ? 17 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](!message_r22.read ? 18 : -1);
  }
}
function ProfileComponent_Conditional_34_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 163)(1, "span", 175);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](2, "\uD83D\uDCED");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.noMessages"));
  }
}
function ProfileComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 27)(1, "div", 159)(2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "ui-button", 160);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_34_Template_ui_button_clicked_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r19);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.markAllAsRead());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](6, "div", 161);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](7, ProfileComponent_Conditional_34_For_8_Template, 19, 13, "div", 162, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](9, ProfileComponent_Conditional_34_Conditional_9_Template, 5, 1, "div", 163);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.translate("profile.messages"));
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx_r2.translate("profile.markAllRead"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](ctx_r2.messages);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx_r2.messages.length === 0 ? 9 : -1);
  }
}
function ProfileComponent_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 176)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](3, "ui-button", 177);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Conditional_35_Template_ui_button_clicked_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r24);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.showToastSignal.set(false));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](4, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassMap"]("toast-" + ctx_r2.toastType());
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](ctx_r2.toastMessage());
  }
}
function ProfileComponent_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "app-trading-platform-info-modal", 178);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("closeModal", function ProfileComponent_Conditional_36_Template_app_trading_platform_info_modal_closeModal_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r25);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r2.closePlatformInfoModal());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("credential", ctx_r2.selectedCredentialForModal());
  }
}
let ProfileComponent = /*#__PURE__*/(() => {
  class ProfileComponent {
    constructor(fb, authService, translationService, themeService, userService, googleAuthService, exchangeCredentialsService, exchangeEnvironmentService, router) {
      this.fb = fb;
      this.authService = authService;
      this.translationService = translationService;
      this.themeService = themeService;
      this.userService = userService;
      this.googleAuthService = googleAuthService;
      this.exchangeCredentialsService = exchangeCredentialsService;
      this.exchangeEnvironmentService = exchangeEnvironmentService;
      this.router = router;
      // Signals and computed values
      this.currentUser = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.computed)(() => this.authService.currentUser());
      this.isDark = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.computed)(() => this.themeService.currentTheme() === 'dark');
      this.availableLanguages = this.translationService.availableLanguages;
      this.isAdmin = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.computed)(() => this.authService.hasRole('ADMIN'));
      // Component state
      this.activeTab = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('settings');
      // Tab configuration
      this.tabs = [{
        id: 'settings',
        label: 'profile.preferences',
        icon: '⚙️'
      }, {
        id: 'userinfo',
        label: 'profile.personalInfo',
        icon: '👤'
      }, {
        id: 'platforms',
        label: 'profile.tradingPlatforms',
        icon: '🔗'
      }, {
        id: 'messages',
        label: 'profile.messages',
        icon: '📧'
      }];
      // Settings
      this.selectedLanguage = 'en';
      this.selectedCurrency = 'USD';
      this.emailNotifications = true;
      this.priceAlerts = true;
      this.tradingAlerts = false;
      // Exchange Credentials State
      this.credentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)([]);
      this.editingCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      this.editFormData = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)({});
      this.showAddCredentialModal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(false);
      this.testingConnectionId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      this.deletingCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      this.savingCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      this.showApiSecret = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)({});
      this.revealedCredentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)({});
      // Toast notification state
      this.toastMessage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('');
      this.toastType = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('info');
      this.showToastSignal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(false);
      // Trading Platform Info Modal state
      this.showPlatformInfoModal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(false);
      this.selectedCredentialForModal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      // Confirmation Modal state
      this.showConfirmModal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(false);
      this.confirmModalTitle = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('');
      this.confirmModalMessage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('');
      this.confirmModalConfirmText = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('');
      this.confirmModalCancelText = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('');
      this.confirmModalVariant = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)('primary');
      this.confirmModalCallback = (0,_angular_core__WEBPACK_IMPORTED_MODULE_11__.signal)(null);
      // Enum references for template
      this.ExchangeType = _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType;
      this.EnvironmentType = _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType;
      this.EXCHANGE_METADATA = _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EXCHANGE_METADATA;
      this.getExchangeName = _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.getExchangeName;
      this.exchanges = Object.values(_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType);
      // Data
      this.messages = [{
        id: '1',
        type: 'trade',
        title: 'Order Filled',
        content: 'Your limit order for 0.5 BTC at $45,000 has been successfully filled.',
        timestamp: new Date('2024-12-12T10:30:00'),
        read: false,
        actions: [{
          label: 'View Order',
          type: 'primary',
          action: 'viewOrder'
        }, {
          label: 'Trade More',
          type: 'secondary',
          action: 'openTrading'
        }]
      }, {
        id: '2',
        type: 'warning',
        title: 'API Key Expiring Soon',
        content: 'Your Binance API key will expire in 7 days. Please renew it to continue trading.',
        timestamp: new Date('2024-12-11T14:15:00'),
        read: false,
        actions: [{
          label: 'Renew Key',
          type: 'primary',
          action: 'renewApiKey'
        }]
      }, {
        id: '3',
        type: 'success',
        title: 'Security Update',
        content: 'Your account security settings have been successfully updated.',
        timestamp: new Date('2024-12-10T09:00:00'),
        read: true
      }, {
        id: '4',
        type: 'info',
        title: 'New Feature Available',
        content: 'Check out our new advanced charting tools in the trading dashboard.',
        timestamp: new Date('2024-12-09T16:45:00'),
        read: true,
        actions: [{
          label: 'Learn More',
          type: 'secondary',
          action: 'learnMore'
        }]
      }];
      this.userInfoForm = this.fb.group({
        firstName: ['John'],
        lastName: ['Doe'],
        email: [{
          value: this.currentUser()?.email || '',
          disabled: true
        }],
        phone: ['+1234567890'],
        timezone: ['UTC']
      });
      this.newCredentialForm = this.fb.group({
        exchange: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_12__.Validators.required],
        environment: [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.Validators.required],
        apiKey: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_12__.Validators.required],
        apiSecret: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_12__.Validators.required],
        label: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_12__.Validators.maxLength(50)]]
      });
      this.selectedLanguage = this.translationService.currentLanguage();
    }
    ngOnInit() {
      // Initialize component
    }
    // Tab navigation
    setActiveTab(tabId) {
      this.activeTab.set(tabId);
      // Load credentials when switching to platforms tab
      if (tabId === 'platforms') {
        this.onPlatformsTabActivated();
      }
    }
    // Translation helper
    translate(key, params) {
      return this.translationService.translate(key, params);
    }
    // Settings operations
    changeLanguage(event) {
      const target = event.target;
      const newLanguage = target.value;
      this.translationService.setLanguage(newLanguage);
      this.selectedLanguage = newLanguage;
    }
    toggleTheme() {
      this.themeService.toggleTheme();
    }
    changeCurrency(event) {
      const target = event.target;
      this.selectedCurrency = target.value;
      // Save currency preference
      localStorage.setItem('preferred-currency', this.selectedCurrency);
    }
    updateNotificationSettings() {
      // Save notification settings
      const settings = {
        email: this.emailNotifications,
        priceAlerts: this.priceAlerts,
        tradingAlerts: this.tradingAlerts
      };
      localStorage.setItem('notification-settings', JSON.stringify(settings));
    }
    // User info operations
    updateUserInfo() {
      if (this.userInfoForm.valid) {
        console.log('Updating user info:', this.userInfoForm.value);
        // Simulate API call
        this.showToast('User information updated successfully!', 'success');
        this.userInfoForm.markAsPristine();
      }
    }
    resetUserInfo() {
      this.userInfoForm.reset();
    }
    changeAvatar() {
      // Open file picker or avatar selection modal
      console.log('Change avatar clicked');
      this.showToast('Avatar change functionality would be implemented here', 'info');
    }
    linkGoogleAccount() {
      this.googleAuthService.linkGoogleAccount().subscribe({
        next: response => {
          if (response.success) {
            this.showToast(`Google account linked successfully! ${response.message}`, 'success');
            // Refresh user data or update UI as needed
          } else {
            this.showToast(`Failed to link Google account: ${response.message}`, 'error');
          }
        },
        error: error => {
          console.error('Error linking Google account:', error);
          this.showToast('Failed to link Google account. Please try again.', 'error');
        }
      });
    }
    // Messages operations
    markAsRead(messageId) {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
      }
    }
    markAllAsRead() {
      this.messages.forEach(message => message.read = true);
    }
    executeMessageAction(action) {
      console.log('Executing action:', action);
      switch (action.action) {
        case 'viewOrder':
          this.showToast('Would navigate to order details', 'info');
          break;
        case 'openTrading':
          this.showToast('Would open trading interface', 'info');
          break;
        case 'renewApiKey':
          this.showToast('Would open API key renewal process', 'info');
          break;
        case 'learnMore':
          this.showToast('Would show feature information', 'info');
          break;
      }
    }
    // Logout functionality
    logout() {
      this.authService.logout().pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_13__.take)(1)).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
        }
      });
    }
    // ============================================================================
    // EXCHANGE CREDENTIALS METHODS
    // ============================================================================
    /**
     * Load credentials when tab opens
     */
    loadCredentials() {
      this.exchangeCredentialsService.fetchCredentials().subscribe({
        next: creds => {
          this.credentials.set(creds);
        },
        error: err => {
          console.error('Failed to load credentials:', err);
          this.showToast('Failed to load exchange credentials. Please try again.', 'error');
        }
      });
    }
    /**
     * Start editing a credential row
     */
    startEditCredential(credential) {
      this.editingCredentialId.set(credential.id);
      this.editFormData.set({
        label: credential.label,
        apiKey: '',
        // Empty string means "keep current"
        apiSecret: '',
        // Empty string means "keep current"
        // Store original values for canceling
        _originalLabel: credential.label
      });
    }
    /**
     * Test connection with edited values
     */
    testEditConnection(credential) {
      const editData = this.editFormData();
      // Get the revealed credentials
      const revealed = this.revealedCredentials()[credential.id];
      // Determine which API key and secret to use
      let apiKey;
      let apiSecret;
      // If user entered new values, use those
      if (editData.apiKey && editData.apiKey.trim() !== '') {
        apiKey = editData.apiKey.trim();
      } else if (revealed?.apiKey) {
        // Use revealed stored value
        apiKey = revealed.apiKey;
      } else {
        // Need to fetch the credential first
        console.log('No API key available, need to reveal first');
        this.showToast('Please click the eye icon to reveal the API Key first', 'warning');
        return;
      }
      if (editData.apiSecret && editData.apiSecret.trim() !== '') {
        apiSecret = editData.apiSecret.trim();
      } else if (revealed?.apiSecret) {
        apiSecret = revealed.apiSecret;
      } else {
        console.log('No API secret available, need to reveal first');
        this.showToast('Please click the eye icon to reveal the API Secret first', 'warning');
        return;
      }
      const testData = {
        exchange: credential.exchange,
        environment: credential.environment,
        apiKey: apiKey,
        apiSecret: apiSecret
      };
      this.testingConnectionId.set(credential.id);
      this.exchangeCredentialsService.testConnection(testData).subscribe({
        next: result => {
          this.testingConnectionId.set(null);
          if (result.success) {
            this.showToast('Connection successful! You can now save the credentials.', 'success');
          } else {
            this.showToast('Connection failed: ' + (result.message || 'Unknown error'), 'error');
          }
        },
        error: err => {
          this.testingConnectionId.set(null);
          this.showToast('Connection test failed: ' + (err.message || 'Unknown error'), 'error');
        }
      });
    }
    /**
     * Cancel editing
     */
    cancelEdit() {
      this.editingCredentialId.set(null);
      this.editFormData.set({});
    }
    /**
     * Save edited credential
     */
    saveCredential(credentialId) {
      const editData = this.editFormData();
      // Build update request with only changed fields
      const updateRequest = {};
      // Always include label (even if empty)
      if (editData.label !== undefined) {
        updateRequest.label = editData.label || undefined;
      }
      // Include apiKey only if it was changed (non-empty)
      if (editData.apiKey && editData.apiKey.trim() !== '') {
        updateRequest.apiKey = editData.apiKey.trim();
      }
      // Include apiSecret only if it was changed (non-empty)
      if (editData.apiSecret && editData.apiSecret.trim() !== '') {
        updateRequest.apiSecret = editData.apiSecret.trim();
      }
      // Set saving state
      this.savingCredentialId.set(credentialId);
      this.exchangeCredentialsService.updateCredential(credentialId, updateRequest).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_13__.take)(1)).subscribe({
        next: updated => {
          // Clear editing and saving state first
          this.editingCredentialId.set(null);
          this.editFormData.set({});
          this.savingCredentialId.set(null);
          // Clear visibility toggles for this credential
          const currentVisibility = this.showApiSecret();
          const updatedVisibility = {
            ...currentVisibility
          };
          delete updatedVisibility[credentialId + '_key'];
          delete updatedVisibility[credentialId + '_secret'];
          this.showApiSecret.set(updatedVisibility);
          // Service already updated the state - sync local component state
          this.credentials.set(this.exchangeCredentialsService.credentials());
          this.showToast('Credential updated successfully!', 'success');
        },
        error: err => {
          console.error('Failed to update credential:', err);
          this.savingCredentialId.set(null);
          this.showToast('Failed to update credential: ' + err.message, 'error');
        }
      });
    }
    /**
     * Update edit form data
     */
    updateEditField(field, value) {
      this.editFormData.set({
        ...this.editFormData(),
        [field]: value
      });
    }
    /**
     * Test connection for a credential
     */
    testConnection(credential) {
      this.testingConnectionId.set(credential.id);
      // Note: We can't test existing credentials without the secret
      // We need to show a message about this
      this.showToast('Connection testing requires API secret. Please use the "Add New Credential" form to test connections before saving.', 'info');
      this.testingConnectionId.set(null);
    }
    /**
     * Delete a credential
     */
    deleteCredential(credential) {
      const exchangeName = this.getExchangeName(credential.exchange);
      const labelPart = credential.label ? ` "${credential.label}"` : '';
      this.showConfirmation({
        title: this.translate('modal.deleteCredentialTitle'),
        message: this.translate('modal.deleteCredentialMessage', {
          exchangeName: exchangeName,
          label: labelPart
        }),
        confirmText: this.translate('button.delete'),
        variant: 'danger',
        onConfirm: () => {
          this.deletingCredentialId.set(credential.id);
          this.exchangeCredentialsService.deleteCredential(credential.id).subscribe({
            next: () => {
              // Service already updated the state - sync local component state
              this.credentials.set(this.exchangeCredentialsService.credentials());
              this.deletingCredentialId.set(null);
              this.showToast('Credential deleted successfully!', 'success');
            },
            error: err => {
              console.error('Failed to delete credential:', err);
              this.deletingCredentialId.set(null);
              this.showToast('Failed to delete credential: ' + err.message, 'error');
            }
          });
        }
      });
    }
    /**
     * Toggle active status
     */
    toggleActive(credential, e) {
      const isChecked = e.target.checked;
      this.exchangeCredentialsService.updateCredential(credential.id, {
        isActive: isChecked
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_13__.take)(1)).subscribe({
        next: updated => {
          // Service already updated the state - sync local component state
          this.credentials.set(this.exchangeCredentialsService.credentials());
          this.showToast(`Credential ${isChecked ? 'activated' : 'deactivated'} successfully!`, 'success');
        },
        error: err => {
          console.error('Failed to toggle credential:', err);
          this.showToast('Failed to toggle credential: ' + err.message, 'error');
        }
      });
    }
    /**
     * Open add credential modal
     */
    openAddCredentialModal() {
      this.newCredentialForm.reset({
        exchange: '',
        environment: _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET,
        apiKey: '',
        apiSecret: '',
        label: ''
      });
      this.showAddCredentialModal.set(true);
    }
    /**
     * Close add credential modal
     */
    closeAddCredentialModal() {
      if (this.newCredentialForm.dirty) {
        this.showConfirmation({
          title: this.translate('modal.unsavedChangesTitle'),
          message: this.translate('modal.unsavedChangesMessage'),
          confirmText: this.translate('modal.confirm'),
          variant: 'warning',
          onConfirm: () => {
            this.showAddCredentialModal.set(false);
            this.newCredentialForm.reset();
          }
        });
      } else {
        this.showAddCredentialModal.set(false);
        this.newCredentialForm.reset();
      }
    }
    /**
     * Test connection in the add form
     */
    testNewConnection() {
      if (this.newCredentialForm.invalid) {
        Object.keys(this.newCredentialForm.controls).forEach(key => {
          this.newCredentialForm.get(key)?.markAsTouched();
        });
        this.showToast('Please fill in all required fields before testing connection.', 'warning');
        return;
      }
      const testData = {
        exchange: this.newCredentialForm.value.exchange,
        environment: this.newCredentialForm.value.environment,
        apiKey: this.newCredentialForm.value.apiKey,
        apiSecret: this.newCredentialForm.value.apiSecret
      };
      this.testingConnectionId.set('new');
      this.exchangeCredentialsService.testConnection(testData).subscribe({
        next: result => {
          this.testingConnectionId.set(null);
          if (result.success) {
            this.showToast('Connection successful! You can now save the credentials.', 'success');
          } else {
            this.showToast('Connection failed: ' + result.message, 'error');
          }
        },
        error: err => {
          this.testingConnectionId.set(null);
          this.showToast('Connection test failed: ' + err.message, 'error');
        }
      });
    }
    /**
     * Save new credential
     */
    saveNewCredential() {
      if (this.newCredentialForm.invalid) {
        Object.keys(this.newCredentialForm.controls).forEach(key => {
          this.newCredentialForm.get(key)?.markAsTouched();
        });
        this.showToast('Please fill in all required fields.', 'warning');
        return;
      }
      const data = {
        exchange: this.newCredentialForm.value.exchange,
        environment: this.newCredentialForm.value.environment,
        apiKey: this.newCredentialForm.value.apiKey,
        apiSecret: this.newCredentialForm.value.apiSecret,
        label: this.newCredentialForm.value.label || undefined,
        isActive: true // Set new credentials as active by default
      };
      this.exchangeCredentialsService.createCredential(data).subscribe({
        next: newCred => {
          // Service already updated the state - sync local component state
          this.credentials.set(this.exchangeCredentialsService.credentials());
          // Close modal
          this.showAddCredentialModal.set(false);
          this.newCredentialForm.reset();
          this.showToast('Credential saved successfully!', 'success');
        },
        error: err => {
          console.error('Failed to create credential:', err);
          this.showToast('Failed to save credential: ' + err.message, 'error');
        }
      });
    }
    /**
     * Toggle API key visibility (in edit mode)
     */
    toggleApiKeyVisibility(credentialId) {
      const key = credentialId + '_key';
      const current = this.showApiSecret();
      const newVisibility = !current[key];
      this.showApiSecret.set({
        ...current,
        [key]: newVisibility
      });
      // If revealing and we don't have the decrypted value yet, fetch it
      if (newVisibility && !this.revealedCredentials()[credentialId]?.apiKey) {
        this.fetchDecryptedCredential(credentialId);
      }
    }
    /**
     * Toggle API secret visibility (in edit mode)
     */
    toggleApiSecretVisibility(credentialId) {
      const key = credentialId + '_secret';
      const current = this.showApiSecret();
      const newVisibility = !current[key];
      this.showApiSecret.set({
        ...current,
        [key]: newVisibility
      });
      // If revealing and we don't have the decrypted value yet, fetch it
      if (newVisibility && !this.revealedCredentials()[credentialId]?.apiSecret) {
        this.fetchDecryptedCredential(credentialId);
      }
    }
    /**
     * Fetch decrypted credential from backend
     */
    fetchDecryptedCredential(credentialId) {
      this.exchangeCredentialsService.getCredentialById(credentialId).subscribe({
        next: credential => {
          // Store the revealed credentials
          const current = this.revealedCredentials();
          this.revealedCredentials.set({
            ...current,
            [credentialId]: {
              apiKey: credential.apiKey || credential.apiKeyPreview,
              apiSecret: credential.apiSecret || '(Secret not returned by server)'
            }
          });
        },
        error: err => {
          console.error('Failed to fetch decrypted credential:', err);
          this.showToast('Failed to retrieve credential details: ' + err.message, 'error');
        }
      });
    }
    /**
     * Legacy method for modal form - toggle API secret visibility
     */
    toggleApiSecretVisibilityLegacy(credentialId) {
      const current = this.showApiSecret();
      this.showApiSecret.set({
        ...current,
        [credentialId]: !current[credentialId]
      });
    }
    /**
     * Toggle new form API secret visibility
     */
    toggleNewFormApiSecretVisibility() {
      this.toggleApiSecretVisibility('new');
    }
    /**
     * Get masked display for API key/secret
     */
    getMaskedValue(value) {
      if (!value || value.length <= 4) {
        return '****';
      }
      return '...' + value.slice(-4);
    }
    /**
     * Called when platforms tab is activated
     */
    onPlatformsTabActivated() {
      this.loadCredentials();
    }
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
      this.toastMessage.set(message);
      this.toastType.set(type);
      this.showToastSignal.set(true);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.showToastSignal.set(false);
      }, 5000);
    }
    /**
     * Open trading platform info modal
     * Shows detailed information about the selected exchange credential
     */
    openPlatformInfoModal(credential) {
      this.selectedCredentialForModal.set(credential);
      this.showPlatformInfoModal.set(true);
    }
    /**
     * Close trading platform info modal
     */
    closePlatformInfoModal() {
      this.showPlatformInfoModal.set(false);
      this.selectedCredentialForModal.set(null);
    }
    /**
     * Show confirmation modal
     */
    showConfirmation(config) {
      this.confirmModalTitle.set(config.title || this.translate('modal.confirmTitle'));
      this.confirmModalMessage.set(config.message);
      this.confirmModalConfirmText.set(config.confirmText || this.translate('modal.confirm'));
      this.confirmModalCancelText.set(config.cancelText || this.translate('modal.cancel'));
      this.confirmModalVariant.set(config.variant || 'primary');
      this.confirmModalCallback.set(config.onConfirm);
      this.showConfirmModal.set(true);
    }
    /**
     * Handle confirmation modal confirm action
     */
    onConfirmModalConfirm() {
      const callback = this.confirmModalCallback();
      this.closeConfirmModal();
      // Execute callback in next tick to ensure modal closes first
      setTimeout(() => {
        if (callback) {
          callback();
        }
      }, 0);
    }
    /**
     * Handle confirmation modal cancel action
     */
    onConfirmModalCancel() {
      this.closeConfirmModal();
    }
    /**
     * Close confirmation modal
     */
    closeConfirmModal() {
      this.showConfirmModal.set(false);
      this.confirmModalCallback.set(null);
    }
    static {
      this.ɵfac = function ProfileComponent_Factory(t) {
        return new (t || ProfileComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_4__.AuthService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_translation_service__WEBPACK_IMPORTED_MODULE_5__.TranslationService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_theme_service__WEBPACK_IMPORTED_MODULE_6__.ThemeService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_user_service__WEBPACK_IMPORTED_MODULE_7__.UserService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_google_auth_service__WEBPACK_IMPORTED_MODULE_8__.GoogleAuthService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_9__.ExchangeCredentialsService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_exchange_environment_service__WEBPACK_IMPORTED_MODULE_10__.ExchangeEnvironmentService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_14__.Router));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdefineComponent"]({
        type: ProfileComponent,
        selectors: [["app-profile"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵStandaloneFeature"]],
        decls: 38,
        vars: 24,
        consts: [[1, "profile-container"], [1, "profile-header"], [1, "user-avatar-section"], [1, "avatar-container"], [1, "user-avatar-xl", 3, "src", "alt"], ["variant", "ghost", "className", "avatar-edit-btn", 3, "clicked"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], ["d", "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "stroke", "currentColor", "stroke-width", "2"], ["d", "m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", "stroke", "currentColor", "stroke-width", "2"], [1, "user-basic-info"], [1, "user-name"], [1, "user-email"], [1, "user-status"], [1, "status-badge"], [1, "role-badge"], [1, "profile-header-actions"], ["variant", "tertiary", "className", "logout-btn", 3, "clicked"], ["d", "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], ["points", "16 17 21 12 16 7", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round", "stroke-linejoin", "round"], ["x1", "21", "y1", "12", "x2", "9", "y2", "12", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], [1, "profile-content"], [1, "profile-tabs"], ["variant", "ghost", "className", "tab-button", 3, "active"], [1, "tab-content"], [1, "settings-section"], [1, "userinfo-section"], [1, "platforms-section"], [1, "messages-section"], [1, "toast-notification", 3, "class"], [3, "credential"], [3, "confirm", "cancel", "openChange", "open", "title", "message", "confirmText", "cancelText", "confirmVariant", "open"], ["variant", "ghost", "className", "tab-button", 3, "clicked"], [1, "tab-icon"], [1, "tab-label"], [1, "settings-group"], [1, "setting-item"], [1, "setting-info"], [1, "setting-control"], [3, "ngModelChange", "change", "ngModel"], [3, "value"], ["variant", "secondary", "className", "theme-toggle-btn", 3, "clicked"], ["value", "USD"], ["value", "EUR"], ["value", "GBP"], ["value", "JPY"], ["value", "CAD"], ["value", "AUD"], ["value", "CHF"], [1, "toggle-switch"], ["type", "checkbox", 3, "ngModelChange", "change", "ngModel"], [1, "slider"], [1, "info-group"], [3, "ngSubmit", "formGroup"], [1, "form-row"], [1, "form-field"], ["type", "text", "formControlName", "firstName"], ["type", "text", "formControlName", "lastName"], [1, "email-input-group"], ["type", "email", "formControlName", "email"], [1, "google-badge"], ["type", "button", "variant", "secondary", "className", "link-google-btn"], ["type", "tel", "formControlName", "phone"], ["formControlName", "timezone"], ["value", "UTC"], ["value", "America/New_York"], ["value", "America/Chicago"], ["value", "America/Denver"], ["value", "America/Los_Angeles"], ["value", "Europe/London"], ["value", "Europe/Paris"], ["value", "Europe/Moscow"], ["value", "Asia/Tokyo"], ["value", "Asia/Shanghai"], ["value", "Asia/Dubai"], [1, "form-actions"], ["type", "submit", "variant", "primary", 3, "disabled"], ["type", "button", "variant", "secondary", 3, "clicked"], ["width", "16", "height", "16", "viewBox", "0 0 24 24", "fill", "none"], ["d", "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", "fill", "#4285F4"], ["d", "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", "fill", "#34A853"], ["d", "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", "fill", "#FBBC05"], ["d", "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", "fill", "#EA4335"], ["type", "button", "variant", "secondary", "className", "link-google-btn", 3, "clicked"], [1, "platforms-header"], ["variant", "primary", 3, "clicked"], ["x1", "12", "y1", "5", "x2", "12", "y2", "19", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], ["x1", "5", "y1", "12", "x2", "19", "y2", "12", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], [1, "credentials-table-container"], [1, "loading-state"], [1, "credentials-table"], [1, "empty-state"], [1, "platform-info-section"], [1, "info-card"], [1, "info-icon"], [1, "modal-overlay"], [1, "spinner"], [3, "editing"], [1, "platform-cell"], [1, "platform-name"], [1, "platform-badge", "clickable", 3, "click"], [1, "environment-cell"], [1, "env-badge"], [1, "label-cell"], ["type", "text", 1, "edit-input", 3, "value", "placeholder"], [1, "label-text"], [1, "api-key-cell"], [1, "password-input-wrapper"], [1, "api-key-preview"], [1, "api-secret-cell"], [1, "api-secret-preview"], [1, "status-cell"], [1, "toggle-switch-small"], ["type", "checkbox", 3, "change", "checked"], [1, "slider-small"], [1, "status-text"], [1, "actions-cell"], [1, "edit-actions"], [1, "row-actions"], ["type", "text", 1, "edit-input", 3, "input", "value", "placeholder"], [1, "edit-input", 3, "input", "type", "value", "placeholder"], ["type", "button", "variant", "ghost", "className", "toggle-visibility-btn-small", "tabindex", "-1", 3, "clicked"], ["d", "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z", "fill", "currentColor"], ["d", "M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z", "stroke", "currentColor", "stroke-width", "2"], ["cx", "12", "cy", "12.5", "r", "2.5", "fill", "currentColor"], ["size", "small", "variant", "secondary", "className", "btn-info", 3, "clicked", "disabled", "title"], [1, "spinner-small"], ["size", "small", "variant", "secondary", "className", "btn-success", 3, "clicked", "disabled"], ["size", "small", "variant", "secondary", 3, "clicked", "disabled"], ["variant", "ghost", "className", "btn-icon", 3, "clicked", "title"], ["variant", "danger", "className", "btn-icon", 3, "clicked", "disabled", "title"], ["points", "3 6 5 6 21 6", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], ["d", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "stroke", "currentColor", "stroke-width", "2"], ["width", "64", "height", "64", "viewBox", "0 0 24 24", "fill", "none", "xmlns", "http://www.w3.org/2000/svg"], ["d", "M12 2a5 5 0 0 1 5 5v3h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V7a5 5 0 0 1 5-5z", "stroke", "currentColor", "stroke-width", "2"], [1, "modal-overlay", 3, "click"], [1, "modal-content", 3, "click"], [1, "modal-header"], ["variant", "ghost", "className", "modal-close-btn", 3, "clicked"], ["width", "24", "height", "24", "viewBox", "0 0 24 24", "fill", "none"], ["x1", "18", "y1", "6", "x2", "6", "y2", "18", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], ["x1", "6", "y1", "6", "x2", "18", "y2", "18", "stroke", "currentColor", "stroke-width", "2", "stroke-linecap", "round"], [1, "modal-form", 3, "ngSubmit", "formGroup"], [1, "required"], ["formControlName", "exchange"], ["value", ""], [1, "field-error"], ["type", "text", "formControlName", "label", "maxlength", "50", 3, "placeholder"], ["type", "text", "formControlName", "apiKey", 3, "placeholder"], ["formControlName", "apiSecret", 3, "type", "placeholder"], ["type", "button", "variant", "ghost", "className", "toggle-visibility-btn", "tabindex", "-1", 3, "clicked"], ["width", "20", "height", "20", "viewBox", "0 0 24 24", "fill", "none"], [1, "modal-actions"], ["type", "button", "variant", "tertiary", 3, "clicked", "disabled"], [1, "actions-right"], ["formControlName", "environment"], ["d", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "stroke", "currentColor", "stroke-width", "2"], ["cx", "12", "cy", "12", "r", "3", "stroke", "currentColor", "stroke-width", "2"], ["d", "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "stroke", "currentColor", "stroke-width", "2"], ["x1", "1", "y1", "1", "x2", "23", "y2", "23", "stroke", "currentColor", "stroke-width", "2"], [1, "messages-header"], ["variant", "secondary", "className", "mark-all-read-btn", 3, "clicked"], [1, "messages-list"], [1, "message-item", 3, "unread"], [1, "no-messages"], [1, "message-item"], [1, "message-icon"], [1, "message-content"], [1, "message-header"], [1, "message-time"], [1, "message-actions"], ["variant", "ghost", "className", "mark-read-btn"], ["size", "small", "variant", "secondary", 3, "className"], ["size", "small", "variant", "secondary", 3, "clicked", "className"], ["variant", "ghost", "className", "mark-read-btn", 3, "clicked"], [1, "unread-dot"], [1, "no-messages-icon"], [1, "toast-notification"], ["variant", "ghost", "className", "toast-close", 3, "clicked"], [3, "closeModal", "credential"]],
        template: function ProfileComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](4, "img", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](5, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Template_ui_button_clicked_5_listener() {
              return ctx.changeAvatar();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](6, "svg", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](7, "path", 7)(8, "path", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](9, "div", 9)(10, "h1", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](11);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](12, "p", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](13);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](14, "div", 12)(15, "span", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](16);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](17, "span", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](18);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](19, "div", 15)(20, "ui-button", 16);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("clicked", function ProfileComponent_Template_ui_button_clicked_20_listener() {
              return ctx.logout();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](21, "svg", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](22, "path", 17)(23, "polyline", 18)(24, "line", 19);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](25);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](26, "div", 20)(27, "div", 21);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeaterCreate"](28, ProfileComponent_For_29_Template, 5, 4, "ui-button", 22, _forTrack0);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](30, "div", 23);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](31, ProfileComponent_Conditional_31_Template, 78, 20, "div", 24)(32, ProfileComponent_Conditional_32_Template, 56, 21, "div", 25)(33, ProfileComponent_Conditional_33_Template, 36, 10, "div", 26)(34, ProfileComponent_Conditional_34_Template, 10, 3, "div", 27);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](35, ProfileComponent_Conditional_35_Template, 5, 3, "div", 28)(36, ProfileComponent_Conditional_36_Template, 1, 1, "app-trading-platform-info-modal", 29);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](37, "ui-confirmation-modal", 30);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("confirm", function ProfileComponent_Template_ui_confirmation_modal_confirm_37_listener() {
              return ctx.onConfirmModalConfirm();
            })("cancel", function ProfileComponent_Template_ui_confirmation_modal_cancel_37_listener() {
              return ctx.onConfirmModalCancel();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayListener"]("openChange", function ProfileComponent_Template_ui_confirmation_modal_openChange_37_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayBindingSet"](ctx.showConfirmModal, $event) || (ctx.showConfirmModal = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            let tmp_0_0;
            let tmp_1_0;
            let tmp_2_0;
            let tmp_3_0;
            let tmp_4_0;
            let tmp_5_0;
            let tmp_6_0;
            let tmp_7_0;
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("src", ((tmp_0_0 = ctx.currentUser()) == null ? null : tmp_0_0.avatar) || "/placeholder/120", _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵsanitizeUrl"])("alt", ((tmp_1_0 = ctx.currentUser()) == null ? null : tmp_1_0.name) || ((tmp_1_0 = ctx.currentUser()) == null ? null : tmp_1_0.email));
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"](((tmp_2_0 = ctx.currentUser()) == null ? null : tmp_2_0.name) || ctx.translate("profile.anonymous"));
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate"]((tmp_3_0 = ctx.currentUser()) == null ? null : tmp_3_0.email);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassMap"]("status-" + (((tmp_4_0 = ctx.currentUser()) == null ? null : tmp_4_0.subscriptionActive) ? "active" : "inactive"));
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ((tmp_5_0 = ctx.currentUser()) == null ? null : tmp_5_0.subscriptionActive) ? ctx.translate("profile.premium") : ctx.translate("profile.free"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵclassMap"]("role-" + ((tmp_6_0 = ctx.currentUser()) == null ? null : tmp_6_0.role == null ? null : tmp_6_0.role.toLowerCase()));
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", (tmp_7_0 = ctx.currentUser()) == null ? null : tmp_7_0.role, " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtextInterpolate1"](" ", ctx.translate("dashboard.logout"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrepeater"](ctx.tabs);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.activeTab() === "settings" ? 31 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.activeTab() === "userinfo" ? 32 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.activeTab() === "platforms" ? 33 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.activeTab() === "messages" ? 34 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.showToastSignal() ? 35 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵconditional"](ctx.showPlatformInfoModal() && ctx.selectedCredentialForModal() ? 36 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("open", ctx.showConfirmModal())("title", ctx.confirmModalTitle())("message", ctx.confirmModalMessage())("confirmText", ctx.confirmModalConfirmText())("cancelText", ctx.confirmModalCancelText())("confirmVariant", ctx.confirmModalVariant());
            _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtwoWayProperty"]("open", ctx.showConfirmModal);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_15__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_15__.DatePipe, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_12__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgSelectOption, _angular_forms__WEBPACK_IMPORTED_MODULE_12__["ɵNgSelectMultipleOption"], _angular_forms__WEBPACK_IMPORTED_MODULE_12__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.CheckboxControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.SelectControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.MaxLengthValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_12__.NgModel, _trading_platform_info_modal_trading_platform_info_modal_component__WEBPACK_IMPORTED_MODULE_1__.TradingPlatformInfoModalComponent, _ui_confirmation_modal_confirmation_modal_component__WEBPACK_IMPORTED_MODULE_2__.ConfirmationModalComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_3__.ButtonComponent],
        styles: [".profile-container[_ngcontent-%COMP%] {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n  min-height: 100vh;\n}\n\n.profile-header[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border-radius: 16px;\n  padding: 2rem;\n  margin-bottom: 2rem;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 2rem;\n  flex-wrap: wrap;\n}\n\n.user-avatar-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2rem;\n  flex: 1;\n}\n\n.profile-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n}\n\n.logout-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: rgba(255, 255, 255, 0.2);\n  border: 2px solid rgba(255, 255, 255, 0.5);\n  color: white;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 1rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  transition: all 0.2s ease;\n}\n.logout-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.3);\n  border-color: rgba(255, 255, 255, 0.8);\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n.logout-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease;\n}\n.logout-btn[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%] {\n  transform: translateX(3px);\n}\n\n.avatar-container[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n}\n\n.user-avatar-xl[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 120px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 4px solid rgba(255, 255, 255, 0.3);\n}\n\n.avatar-edit-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  background: rgba(255, 255, 255, 0.9);\n  color: #333;\n  border: none;\n  border-radius: 50%;\n  width: 36px;\n  height: 36px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.avatar-edit-btn[_ngcontent-%COMP%]:hover {\n  background: white;\n  transform: scale(1.1);\n}\n\n.user-basic-info[_ngcontent-%COMP%] {\n  flex: 1;\n  margin-left: 2rem;\n}\n\n.user-name[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 2rem;\n  font-weight: 700;\n}\n\n.user-email[_ngcontent-%COMP%] {\n  margin: 0 0 1rem 0;\n  font-size: 1.125rem;\n  opacity: 0.9;\n}\n\n.user-status[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n\n.status-badge[_ngcontent-%COMP%], .role-badge[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border-radius: 20px;\n  font-size: 0.875rem;\n  font-weight: 600;\n  background: rgba(255, 255, 255, 0.2);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n}\n\n.status-active[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.3);\n  border-color: rgba(34, 197, 94, 0.5);\n}\n\n.status-inactive[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.3);\n  border-color: rgba(239, 68, 68, 0.5);\n}\n\n.profile-content[_ngcontent-%COMP%] {\n  background: var(--card-background, white);\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);\n  overflow: hidden;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n}\n\n.profile-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  background: var(--tab-background, #f8f9fa);\n  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));\n  overflow-x: auto;\n}\n\n.tab-button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  padding: 1rem 1.5rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  color: var(--text-secondary, #666);\n  font-weight: 500;\n  white-space: nowrap;\n}\n.tab-button[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, rgba(0, 0, 0, 0.05));\n  color: var(--text-primary, #333);\n}\n.tab-button.active[_ngcontent-%COMP%] {\n  background: var(--card-background, white);\n  color: var(--primary-color, #667eea);\n  border-bottom: 2px solid var(--primary-color, #667eea);\n}\n\n.tab-icon[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n}\n\n.tab-content[_ngcontent-%COMP%] {\n  padding: 2rem;\n}\n\n.settings-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2rem;\n}\n\n.settings-group[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n\n.setting-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1.5rem;\n  background: var(--card-background, white);\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));\n  border-radius: 8px;\n  margin-bottom: 1rem;\n}\n.setting-item[_ngcontent-%COMP%]   .setting-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.setting-item[_ngcontent-%COMP%]   .setting-info[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n  margin-bottom: 0.25rem;\n}\n.setting-item[_ngcontent-%COMP%]   .setting-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.875rem;\n  color: var(--text-secondary, #666);\n}\n.setting-item[_ngcontent-%COMP%]   .setting-control[_ngcontent-%COMP%] {\n  min-width: 200px;\n}\n.setting-item[_ngcontent-%COMP%]   .setting-control[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.5rem;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.2));\n  border-radius: 6px;\n  background: var(--card-background, white);\n  color: var(--text-primary, #333);\n}\n\n.theme-toggle-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.2));\n  border-radius: 6px;\n  background: var(--card-background, white);\n  color: var(--text-primary, #333);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.theme-toggle-btn[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, #f8f9fa);\n}\n\n.toggle-switch[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  width: 60px;\n  height: 34px;\n}\n.toggle-switch[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.toggle-switch[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .slider[_ngcontent-%COMP%] {\n  background-color: var(--primary-color, #667eea);\n}\n.toggle-switch[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .slider[_ngcontent-%COMP%]:before {\n  transform: translateX(26px);\n}\n.toggle-switch[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%] {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  border-radius: 34px;\n  transition: 0.4s;\n}\n.toggle-switch[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%]:before {\n  position: absolute;\n  content: \"\";\n  height: 26px;\n  width: 26px;\n  left: 4px;\n  bottom: 4px;\n  background-color: white;\n  border-radius: 50%;\n  transition: 0.4s;\n}\n\n.userinfo-section[_ngcontent-%COMP%]   .info-group[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n\n.form-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n\n.form-field[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n}\n.form-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n.form-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.75rem;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.2));\n  border-radius: 8px;\n  background: var(--card-background, white);\n  color: var(--text-primary, #333);\n  font-size: 1rem;\n}\n.form-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color, #667eea);\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);\n}\n\n.email-input-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n}\n.email-input-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.google-badge[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem 1rem;\n  background: #4285f4;\n  color: white;\n  border-radius: 6px;\n  font-size: 0.875rem;\n  font-weight: 500;\n}\n\n.link-google-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: #4285f4;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.875rem;\n  font-weight: 500;\n  transition: all 0.2s ease;\n}\n.link-google-btn[_ngcontent-%COMP%]:hover {\n  background: #3367d6;\n}\n\n.form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  margin-top: 2rem;\n}\n.form-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n.form-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%] {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n.form-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #5a67d8;\n}\n.form-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.form-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%] {\n  background: #6b7280;\n  color: white;\n}\n.form-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #4b5563;\n}\n\n.messages-section[_ngcontent-%COMP%]   .messages-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1.5rem;\n}\n.messages-section[_ngcontent-%COMP%]   .messages-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n.messages-section[_ngcontent-%COMP%]   .mark-all-read-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: transparent;\n  color: var(--primary-color, #667eea);\n  border: 1px solid var(--primary-color, #667eea);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.875rem;\n  font-weight: 500;\n  transition: all 0.2s ease;\n}\n.messages-section[_ngcontent-%COMP%]   .mark-all-read-btn[_ngcontent-%COMP%]:hover {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n\n.messages-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n.message-item[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  padding: 1.5rem;\n  background: var(--card-background, white);\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));\n  border-radius: 8px;\n  position: relative;\n  transition: all 0.2s ease;\n}\n.message-item.unread[_ngcontent-%COMP%] {\n  background: rgba(102, 126, 234, 0.05);\n  border-color: rgba(102, 126, 234, 0.2);\n}\n.message-item[_ngcontent-%COMP%]   .message-icon[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: #f3f4f6;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.25rem;\n  flex-shrink: 0;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 0.5rem;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-header[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-header[_ngcontent-%COMP%]   .message-time[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-secondary, #666);\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 1rem 0;\n  color: var(--text-secondary, #666);\n  line-height: 1.5;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.75rem;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  font-weight: 500;\n  transition: all 0.2s ease;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn.btn-sm[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  padding: 0.25rem 0.75rem;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%] {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%]:hover {\n  background: #5a67d8;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%] {\n  background: #6b7280;\n  color: white;\n}\n.message-item[_ngcontent-%COMP%]   .message-content[_ngcontent-%COMP%]   .message-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #4b5563;\n}\n.message-item[_ngcontent-%COMP%]   .mark-read-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 0.25rem;\n}\n.message-item[_ngcontent-%COMP%]   .mark-read-btn[_ngcontent-%COMP%]   .unread-dot[_ngcontent-%COMP%] {\n  width: 12px;\n  height: 12px;\n  background: var(--primary-color, #667eea);\n  border-radius: 50%;\n  display: block;\n}\n\n.no-messages[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 3rem;\n  color: var(--text-secondary, #666);\n}\n.no-messages[_ngcontent-%COMP%]   .no-messages-icon[_ngcontent-%COMP%] {\n  font-size: 3rem;\n  margin-bottom: 1rem;\n  display: block;\n}\n.no-messages[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.125rem;\n}\n\n.dark[_nghost-%COMP%], .dark   [_nghost-%COMP%] {\n  --card-background: #1f2937;\n  --text-primary: #f9fafb;\n  --text-secondary: #d1d5db;\n  --border-color: rgba(255, 255, 255, 0.1);\n  --hover-background: #374151;\n  --tab-background: #111827;\n}\n\n@media (max-width: 768px) {\n  .profile-container[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .profile-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .user-avatar-section[_ngcontent-%COMP%] {\n    flex-direction: column;\n    text-align: center;\n    gap: 1rem;\n  }\n  .user-basic-info[_ngcontent-%COMP%] {\n    margin-left: 0;\n  }\n  .profile-header-actions[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: center;\n  }\n  .logout-btn[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: center;\n  }\n  .profile-tabs[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n  .tab-content[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n  .form-row[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .setting-item[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 1rem;\n  }\n  .setting-item[_ngcontent-%COMP%]   .setting-control[_ngcontent-%COMP%] {\n    width: 100%;\n    min-width: auto;\n  }\n  .email-input-group[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .email-input-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n    flex: none;\n  }\n  .form-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n}\n.platforms-section[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_fadeIn 0.3s ease;\n}\n\n.platforms-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 2rem;\n}\n.platforms-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n}\n.platforms-header[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.platforms-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n  gap: 1.5rem;\n  margin-bottom: 2rem;\n}\n\n.platform-card[_ngcontent-%COMP%] {\n  position: relative;\n  background: var(--card-background);\n  border: 1px solid var(--border-color);\n  border-radius: 12px;\n  padding: 1.5rem;\n  transition: all 0.3s ease;\n}\n.platform-card[_ngcontent-%COMP%]:hover:not(.platform-disabled) {\n  transform: translateY(-4px);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);\n  border-color: var(--primary-color);\n}\n.platform-card.platform-disabled[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  pointer-events: none;\n}\n.platform-card.platform-disabled[_ngcontent-%COMP%]   .platform-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 1rem;\n  right: 1rem;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  padding: 0.25rem 0.75rem;\n  border-radius: 20px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n\n.platform-icon[_ngcontent-%COMP%] {\n  width: 64px;\n  height: 64px;\n  margin-bottom: 1rem;\n  border-radius: 12px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);\n}\n.platform-icon[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n}\n.platform-icon[_ngcontent-%COMP%]   .platform-icon-fallback[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);\n}\n.platform-icon[_ngcontent-%COMP%]   .platform-icon-fallback[_ngcontent-%COMP%]   .platform-initial[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  font-weight: 700;\n  color: white;\n}\n\n.platform-info[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n.platform-info[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.platform-info[_ngcontent-%COMP%]   .platform-description[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n  font-size: 0.875rem;\n  line-height: 1.5;\n  margin-bottom: 1rem;\n}\n.platform-info[_ngcontent-%COMP%]   .platform-features[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.platform-info[_ngcontent-%COMP%]   .feature-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.25rem 0.75rem;\n  background: rgba(99, 102, 241, 0.1);\n  color: var(--primary-color);\n  border-radius: 20px;\n  font-size: 0.75rem;\n  font-weight: 500;\n}\n\n.platform-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n.platform-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 120px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  padding: 0.625rem 1rem;\n  font-size: 0.875rem;\n}\n.platform-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n}\n\n.platform-info-section[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1.5rem;\n  margin-top: 2rem;\n}\n\n.info-card[_ngcontent-%COMP%] {\n  background: var(--card-background);\n  border: 1px solid var(--border-color);\n  border-radius: 12px;\n  padding: 1.5rem;\n  text-align: center;\n  transition: all 0.3s ease;\n}\n.info-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.info-card[_ngcontent-%COMP%]   .info-icon[_ngcontent-%COMP%] {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n}\n.info-card[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.info-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.875rem;\n  color: var(--text-secondary);\n  line-height: 1.5;\n}\n\n.credentials-table-container[_ngcontent-%COMP%] {\n  margin: 2rem 0;\n  overflow-x: auto;\n  background: var(--card-background);\n  border-radius: 12px;\n  border: 1px solid var(--border-color);\n  min-height: 200px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.loading-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  gap: 1rem;\n}\n.loading-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  color: var(--text-secondary);\n  font-size: 1rem;\n  margin: 0;\n}\n\n.spinner[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border: 4px solid rgba(102, 126, 234, 0.1);\n  border-top-color: var(--primary-color, #667eea);\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.spinner-small[_ngcontent-%COMP%] {\n  display: inline-block;\n  width: 14px;\n  height: 14px;\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-top-color: white;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n}\n\n.credentials-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.9rem;\n  display: table;\n}\n.credentials-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  background: var(--tab-background, #f8f9fa);\n  border-bottom: 2px solid var(--border-color);\n}\n.credentials-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 0.75rem 0.5rem;\n  text-align: left;\n  font-weight: 600;\n  color: var(--text-primary);\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  white-space: nowrap;\n}\n.credentials-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  border-bottom: 1px solid var(--border-color);\n  transition: all 0.2s ease;\n}\n.credentials-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: rgba(102, 126, 234, 0.03);\n}\n.credentials-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.editing[_ngcontent-%COMP%] {\n  background: rgba(102, 126, 234, 0.08);\n  box-shadow: inset 0 0 0 2px var(--primary-color, #667eea);\n}\n.credentials-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr.active[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.05);\n}\n.credentials-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.75rem 0.5rem;\n  vertical-align: middle;\n}\n\n.platform-cell[_ngcontent-%COMP%]   .platform-name[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.platform-cell[_ngcontent-%COMP%]   .platform-badge[_ngcontent-%COMP%] {\n  padding: 0.375rem 0.75rem;\n  border-radius: 6px;\n  color: white;\n  font-weight: 600;\n  font-size: 0.875rem;\n  white-space: nowrap;\n}\n.platform-cell[_ngcontent-%COMP%]   .platform-badge.clickable[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n.platform-cell[_ngcontent-%COMP%]   .platform-badge.clickable[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n  opacity: 0.9;\n}\n.platform-cell[_ngcontent-%COMP%]   .platform-badge.clickable[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n\n.environment-cell[_ngcontent-%COMP%]   .env-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.25rem 0.75rem;\n  border-radius: 20px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  background: #2196F3;\n  color: white;\n}\n.environment-cell[_ngcontent-%COMP%]   .env-badge.testnet[_ngcontent-%COMP%] {\n  background: #FF9800;\n}\n\n.label-cell[_ngcontent-%COMP%] {\n  min-width: 100px;\n  max-width: 150px;\n}\n.label-cell[_ngcontent-%COMP%]   .label-text[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n  font-weight: 500;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.label-cell[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.5rem;\n  border: 2px solid var(--primary-color, #667eea);\n  border-radius: 6px;\n  background: var(--card-background);\n  color: var(--text-primary);\n  font-size: 0.875rem;\n  font-weight: 500;\n}\n.label-cell[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n\n.api-key-cell[_ngcontent-%COMP%] {\n  min-width: 150px;\n  max-width: 200px;\n}\n.api-key-cell[_ngcontent-%COMP%]   .api-key-preview[_ngcontent-%COMP%] {\n  font-family: \"Courier New\", monospace;\n  font-size: 0.8rem;\n  color: var(--text-secondary);\n  background: rgba(0, 0, 0, 0.05);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  display: block;\n}\n\n.api-secret-cell[_ngcontent-%COMP%] {\n  min-width: 100px;\n  max-width: 150px;\n  font-family: \"Courier New\", monospace;\n  font-size: 0.8rem;\n  color: var(--text-secondary);\n}\n.api-secret-cell[_ngcontent-%COMP%]   .api-secret-preview[_ngcontent-%COMP%] {\n  letter-spacing: 1px;\n  background: rgba(0, 0, 0, 0.05);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  display: inline-block;\n}\n\n.password-input-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 100%;\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding-right: 35px;\n  font-family: \"Courier New\", monospace;\n  font-size: 0.85rem;\n  width: 100%;\n  padding: 0.5rem;\n  border: 2px solid var(--primary-color, #667eea);\n  border-radius: 6px;\n  background: var(--card-background);\n  color: var(--text-primary);\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%]::placeholder {\n  font-size: 0.75rem;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn-small[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--text-secondary);\n  opacity: 0.6;\n  transition: opacity 0.2s;\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn-small[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn-small[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n}\n\n.status-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.status-cell[_ngcontent-%COMP%]   .status-text[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n  color: var(--text-secondary);\n}\n\n.toggle-switch-small[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  width: 44px;\n  height: 24px;\n}\n.toggle-switch-small[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.toggle-switch-small[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .slider-small[_ngcontent-%COMP%] {\n  background-color: #22c55e;\n}\n.toggle-switch-small[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:checked    + .slider-small[_ngcontent-%COMP%]:before {\n  transform: translateX(20px);\n}\n.toggle-switch-small[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:disabled    + .slider-small[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n.toggle-switch-small[_ngcontent-%COMP%]   .slider-small[_ngcontent-%COMP%] {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  border-radius: 24px;\n  transition: 0.3s;\n}\n.toggle-switch-small[_ngcontent-%COMP%]   .slider-small[_ngcontent-%COMP%]:before {\n  position: absolute;\n  content: \"\";\n  height: 18px;\n  width: 18px;\n  left: 3px;\n  bottom: 3px;\n  background-color: white;\n  border-radius: 50%;\n  transition: 0.3s;\n}\n\n.actions-cell[_ngcontent-%COMP%] {\n  min-width: 180px;\n}\n.actions-cell[_ngcontent-%COMP%]   .row-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n.actions-cell[_ngcontent-%COMP%]   .edit-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-sm[_ngcontent-%COMP%] {\n  padding: 0.375rem 0.75rem;\n  font-size: 0.75rem;\n  border-radius: 4px;\n  border: none;\n  cursor: pointer;\n  font-weight: 600;\n  transition: all 0.2s ease;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-sm.btn-success[_ngcontent-%COMP%] {\n  background: #22c55e;\n  color: white;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-sm.btn-success[_ngcontent-%COMP%]:hover {\n  background: #16a34a;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-sm.btn-secondary[_ngcontent-%COMP%] {\n  background: #6b7280;\n  color: white;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-sm.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #4b5563;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-icon[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border-color);\n  border-radius: 6px;\n  padding: 0.5rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s ease;\n  color: var(--text-primary);\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-icon[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, #f8f9fa);\n  border-color: var(--primary-color, #667eea);\n  color: var(--primary-color, #667eea);\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-icon.btn-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.1);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-icon[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.actions-cell[_ngcontent-%COMP%]   .btn-icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n}\n\n.empty-state[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 4rem 2rem;\n  color: var(--text-secondary);\n}\n.empty-state[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n  opacity: 0.3;\n  stroke: currentColor;\n}\n.empty-state[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 1.5rem 0;\n  font-size: 1rem;\n}\n.empty-state[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n}\n\n.modal-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n  padding: 1rem;\n  backdrop-filter: blur(4px);\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n}\n\n.modal-content[_ngcontent-%COMP%] {\n  background: var(--card-background);\n  border-radius: 16px;\n  width: 100%;\n  max-width: 600px;\n  max-height: 90vh;\n  overflow-y: auto;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\n  animation: _ngcontent-%COMP%_slideUp 0.3s ease;\n}\n\n.modal-header[_ngcontent-%COMP%] {\n  padding: 1.5rem 2rem;\n  border-bottom: 1px solid var(--border-color);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.modal-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  font-weight: 600;\n  color: var(--text-primary);\n}\n.modal-header[_ngcontent-%COMP%]   .modal-close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  color: var(--text-secondary);\n  padding: 0.5rem;\n  border-radius: 6px;\n  transition: all 0.2s ease;\n}\n.modal-header[_ngcontent-%COMP%]   .modal-close-btn[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, #f8f9fa);\n  color: var(--text-primary);\n}\n.modal-header[_ngcontent-%COMP%]   .modal-close-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.modal-form[_ngcontent-%COMP%] {\n  padding: 2rem;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: var(--text-primary);\n  font-size: 0.875rem;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   .required[_ngcontent-%COMP%] {\n  color: #ef4444;\n  margin-left: 0.25rem;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.75rem;\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  background: var(--card-background);\n  color: var(--text-primary);\n  font-size: 0.9375rem;\n  transition: all 0.2s ease;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--primary-color, #667eea);\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder, \n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]::placeholder {\n  color: var(--text-secondary);\n  opacity: 0.6;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.375rem;\n  font-size: 0.8125rem;\n  color: var(--text-secondary);\n}\n.modal-form[_ngcontent-%COMP%]   .form-field[_ngcontent-%COMP%]   .field-error[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 0.375rem;\n  font-size: 0.8125rem;\n  color: #ef4444;\n  font-weight: 500;\n}\n.modal-form[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n}\n.modal-form[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding-right: 3rem;\n}\n.modal-form[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0.5rem;\n  top: 50%;\n  transform: translateY(-50%);\n  background: none;\n  border: none;\n  cursor: pointer;\n  padding: 0.5rem;\n  color: var(--text-secondary);\n  transition: color 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.modal-form[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn[_ngcontent-%COMP%]:hover {\n  color: var(--text-primary);\n}\n.modal-form[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .toggle-visibility-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.modal-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n  margin-top: 2rem;\n  padding-top: 1.5rem;\n  border-top: 1px solid var(--border-color);\n}\n.modal-actions[_ngcontent-%COMP%]   .actions-right[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 0.9375rem;\n  transition: all 0.2s ease;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%] {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #5a67d8;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%] {\n  background: #6b7280;\n  color: white;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: #4b5563;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-outline[_ngcontent-%COMP%] {\n  background: transparent;\n  color: var(--primary-color, #667eea);\n  border: 2px solid var(--primary-color, #667eea);\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-outline[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n.modal-actions[_ngcontent-%COMP%]   .btn.btn-outline[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes _ngcontent-%COMP%_slideUp {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n@media (max-width: 1024px) {\n  .credentials-table[_ngcontent-%COMP%] {\n    font-size: 0.8125rem;\n  }\n  .credentials-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .credentials-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 0.75rem;\n  }\n  .platform-badge[_ngcontent-%COMP%] {\n    font-size: 0.8125rem;\n  }\n}\n@media (max-width: 768px) {\n  .credentials-table-container[_ngcontent-%COMP%] {\n    overflow-x: scroll;\n    -webkit-overflow-scrolling: touch;\n  }\n  .credentials-table[_ngcontent-%COMP%] {\n    min-width: 800px;\n  }\n  .api-key-cell[_ngcontent-%COMP%], \n   .api-secret-cell[_ngcontent-%COMP%] {\n    min-width: 120px;\n  }\n  .api-key-cell[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%], \n   .api-secret-cell[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%] {\n    font-size: 0.75rem;\n  }\n  .api-key-cell[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%]::placeholder, \n   .api-secret-cell[_ngcontent-%COMP%]   .password-input-wrapper[_ngcontent-%COMP%]   .edit-input[_ngcontent-%COMP%]::placeholder {\n    font-size: 0.7rem;\n  }\n  .modal-content[_ngcontent-%COMP%] {\n    max-height: 95vh;\n  }\n  .modal-form[_ngcontent-%COMP%] {\n    padding: 1.5rem;\n  }\n  .modal-header[_ngcontent-%COMP%] {\n    padding: 1rem 1.5rem;\n  }\n  .modal-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n    font-size: 1.25rem;\n  }\n  .modal-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n  }\n  .modal-actions[_ngcontent-%COMP%]   .actions-right[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .modal-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n.toast-notification[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  min-width: 300px;\n  max-width: 500px;\n  padding: 1rem 3rem 1rem 1.25rem;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  z-index: 10000;\n  animation: _ngcontent-%COMP%_slideInRight 0.3s ease-out;\n  font-size: 0.95rem;\n  line-height: 1.4;\n}\n.toast-notification[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  flex: 1;\n  color: white;\n}\n.toast-notification[_ngcontent-%COMP%]   .toast-close[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  background: none;\n  border: none;\n  color: white;\n  font-size: 1.5rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0.8;\n  transition: opacity 0.2s;\n}\n.toast-notification[_ngcontent-%COMP%]   .toast-close[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.toast-notification.toast-success[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);\n}\n.toast-notification.toast-error[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);\n}\n.toast-notification.toast-warning[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);\n}\n.toast-notification.toast-info[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);\n}\n\n@keyframes _ngcontent-%COMP%_slideInRight {\n  from {\n    transform: translateX(400px);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9wcm9maWxlL3Byb2ZpbGUuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxhQUFBO0VBQ0EsaUJBQUE7QUFDRjs7QUFHQTtFQUNFLDZEQUFBO0VBQ0EsWUFBQTtFQUNBLG1CQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EseUNBQUE7RUFDQSxhQUFBO0VBQ0EsOEJBQUE7RUFDQSxtQkFBQTtFQUNBLFNBQUE7RUFDQSxlQUFBO0FBQUY7O0FBR0E7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxTQUFBO0VBQ0EsT0FBQTtBQUFGOztBQUdBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsU0FBQTtBQUFGOztBQUdBO0VBQ0UsdUJBQUE7RUFDQSxvQ0FBQTtFQUNBLDBDQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7RUFDQSx5QkFBQTtBQUFGO0FBRUU7RUFDRSxvQ0FBQTtFQUNBLHNDQUFBO0VBQ0EsMkJBQUE7RUFDQSwwQ0FBQTtBQUFKO0FBR0U7RUFDRSwrQkFBQTtBQURKO0FBSUU7RUFDRSwwQkFBQTtBQUZKOztBQU1BO0VBQ0Usa0JBQUE7RUFDQSxxQkFBQTtBQUhGOztBQU1BO0VBQ0UsWUFBQTtFQUNBLGFBQUE7RUFDQSxrQkFBQTtFQUNBLGlCQUFBO0VBQ0EsMENBQUE7QUFIRjs7QUFNQTtFQUNFLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFFBQUE7RUFDQSxvQ0FBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EsZUFBQTtFQUNBLHlCQUFBO0FBSEY7QUFLRTtFQUNFLGlCQUFBO0VBQ0EscUJBQUE7QUFISjs7QUFPQTtFQUNFLE9BQUE7RUFDQSxpQkFBQTtBQUpGOztBQU9BO0VBQ0Usb0JBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7QUFKRjs7QUFPQTtFQUNFLGtCQUFBO0VBQ0EsbUJBQUE7RUFDQSxZQUFBO0FBSkY7O0FBT0E7RUFDRSxhQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7QUFKRjs7QUFPQTtFQUNFLG9CQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0VBQ0Esb0NBQUE7RUFDQSwyQkFBQTtFQUNBLDBDQUFBO0FBSkY7O0FBT0E7RUFDRSxrQ0FBQTtFQUNBLG9DQUFBO0FBSkY7O0FBT0E7RUFDRSxrQ0FBQTtFQUNBLG9DQUFBO0FBSkY7O0FBUUE7RUFDRSx5Q0FBQTtFQUNBLG1CQUFBO0VBQ0EseUNBQUE7RUFDQSxnQkFBQTtFQUNBLDBEQUFBO0FBTEY7O0FBU0E7RUFDRSxhQUFBO0VBQ0EsMENBQUE7RUFDQSxnRUFBQTtFQUNBLGdCQUFBO0FBTkY7O0FBU0E7RUFDRSx1QkFBQTtFQUNBLFlBQUE7RUFDQSxvQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxlQUFBO0VBQ0EseUJBQUE7RUFDQSxrQ0FBQTtFQUNBLGdCQUFBO0VBQ0EsbUJBQUE7QUFORjtBQVFFO0VBQ0Usd0RBQUE7RUFDQSxnQ0FBQTtBQU5KO0FBU0U7RUFDRSx5Q0FBQTtFQUNBLG9DQUFBO0VBQ0Esc0RBQUE7QUFQSjs7QUFXQTtFQUNFLGtCQUFBO0FBUkY7O0FBV0E7RUFDRSxhQUFBO0FBUkY7O0FBWUE7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxTQUFBO0FBVEY7O0FBYUU7RUFDRSxvQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQ0FBQTtBQVZKOztBQWNBO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxlQUFBO0VBQ0EseUNBQUE7RUFDQSx5REFBQTtFQUNBLGtCQUFBO0VBQ0EsbUJBQUE7QUFYRjtBQWFFO0VBQ0UsT0FBQTtBQVhKO0FBYUk7RUFDRSxjQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQ0FBQTtFQUNBLHNCQUFBO0FBWE47QUFjSTtFQUNFLFNBQUE7RUFDQSxtQkFBQTtFQUNBLGtDQUFBO0FBWk47QUFnQkU7RUFDRSxnQkFBQTtBQWRKO0FBZ0JJO0VBQ0UsV0FBQTtFQUNBLGVBQUE7RUFDQSx5REFBQTtFQUNBLGtCQUFBO0VBQ0EseUNBQUE7RUFDQSxnQ0FBQTtBQWROOztBQW1CQTtFQUNFLG9CQUFBO0VBQ0EseURBQUE7RUFDQSxrQkFBQTtFQUNBLHlDQUFBO0VBQ0EsZ0NBQUE7RUFDQSxlQUFBO0VBQ0EseUJBQUE7QUFoQkY7QUFrQkU7RUFDRSw0Q0FBQTtBQWhCSjs7QUFxQkE7RUFDRSxrQkFBQTtFQUNBLHFCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7QUFsQkY7QUFvQkU7RUFDRSxVQUFBO0VBQ0EsUUFBQTtFQUNBLFNBQUE7QUFsQko7QUFvQkk7RUFDRSwrQ0FBQTtBQWxCTjtBQW9CTTtFQUNFLDJCQUFBO0FBbEJSO0FBdUJFO0VBQ0Usa0JBQUE7RUFDQSxlQUFBO0VBQ0EsTUFBQTtFQUNBLE9BQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtFQUNBLHNCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtBQXJCSjtBQXVCSTtFQUNFLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7QUFyQk47O0FBNEJFO0VBQ0Usb0JBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0NBQUE7QUF6Qko7O0FBNkJBO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsU0FBQTtFQUNBLG1CQUFBO0FBMUJGOztBQTZCQTtFQUNFLG1CQUFBO0FBMUJGO0FBNEJFO0VBQ0UsY0FBQTtFQUNBLHFCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQ0FBQTtBQTFCSjtBQTZCRTtFQUNFLFdBQUE7RUFDQSxnQkFBQTtFQUNBLHlEQUFBO0VBQ0Esa0JBQUE7RUFDQSx5Q0FBQTtFQUNBLGdDQUFBO0VBQ0EsZUFBQTtBQTNCSjtBQTZCSTtFQUNFLGFBQUE7RUFDQSwyQ0FBQTtFQUNBLDhDQUFBO0FBM0JOOztBQWdDQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFNBQUE7QUE3QkY7QUErQkU7RUFDRSxPQUFBO0FBN0JKOztBQWlDQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxvQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtBQTlCRjs7QUFpQ0E7RUFDRSxvQkFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0VBQ0EseUJBQUE7QUE5QkY7QUFnQ0U7RUFDRSxtQkFBQTtBQTlCSjs7QUFrQ0E7RUFDRSxhQUFBO0VBQ0EsU0FBQTtFQUNBLGdCQUFBO0FBL0JGO0FBaUNFO0VBQ0UsdUJBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtBQS9CSjtBQWlDSTtFQUNFLHlDQUFBO0VBQ0EsWUFBQTtBQS9CTjtBQWlDTTtFQUNFLG1CQUFBO0FBL0JSO0FBa0NNO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBaENSO0FBb0NJO0VBQ0UsbUJBQUE7RUFDQSxZQUFBO0FBbENOO0FBb0NNO0VBQ0UsbUJBQUE7QUFsQ1I7O0FBMENFO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsbUJBQUE7RUFDQSxxQkFBQTtBQXZDSjtBQXlDSTtFQUNFLFNBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0NBQUE7QUF2Q047QUEyQ0U7RUFDRSxvQkFBQTtFQUNBLHVCQUFBO0VBQ0Esb0NBQUE7RUFDQSwrQ0FBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtBQXpDSjtBQTJDSTtFQUNFLHlDQUFBO0VBQ0EsWUFBQTtBQXpDTjs7QUE4Q0E7RUFDRSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxTQUFBO0FBM0NGOztBQThDQTtFQUNFLGFBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtFQUNBLHlDQUFBO0VBQ0EseURBQUE7RUFDQSxrQkFBQTtFQUNBLGtCQUFBO0VBQ0EseUJBQUE7QUEzQ0Y7QUE2Q0U7RUFDRSxxQ0FBQTtFQUNBLHNDQUFBO0FBM0NKO0FBOENFO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLGNBQUE7QUE1Q0o7QUErQ0U7RUFDRSxPQUFBO0FBN0NKO0FBK0NJO0VBQ0UsYUFBQTtFQUNBLDhCQUFBO0VBQ0EsdUJBQUE7RUFDQSxxQkFBQTtBQTdDTjtBQStDTTtFQUNFLFNBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQ0FBQTtBQTdDUjtBQWdETTtFQUNFLGtCQUFBO0VBQ0Esa0NBQUE7QUE5Q1I7QUFrREk7RUFDRSxrQkFBQTtFQUNBLGtDQUFBO0VBQ0EsZ0JBQUE7QUFoRE47QUFtREk7RUFDRSxhQUFBO0VBQ0EsV0FBQTtBQWpETjtBQW1ETTtFQUNFLHdCQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtBQWpEUjtBQW1EUTtFQUNFLGtCQUFBO0VBQ0Esd0JBQUE7QUFqRFY7QUFvRFE7RUFDRSx5Q0FBQTtFQUNBLFlBQUE7QUFsRFY7QUFvRFU7RUFDRSxtQkFBQTtBQWxEWjtBQXNEUTtFQUNFLG1CQUFBO0VBQ0EsWUFBQTtBQXBEVjtBQXNEVTtFQUNFLG1CQUFBO0FBcERaO0FBMkRFO0VBQ0UsZ0JBQUE7RUFDQSxZQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0FBekRKO0FBMkRJO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSx5Q0FBQTtFQUNBLGtCQUFBO0VBQ0EsY0FBQTtBQXpETjs7QUE4REE7RUFDRSxrQkFBQTtFQUNBLGFBQUE7RUFDQSxrQ0FBQTtBQTNERjtBQTZERTtFQUNFLGVBQUE7RUFDQSxtQkFBQTtFQUNBLGNBQUE7QUEzREo7QUE4REU7RUFDRSxTQUFBO0VBQ0EsbUJBQUE7QUE1REo7O0FBaUVBO0VBQ0UsMEJBQUE7RUFDQSx1QkFBQTtFQUNBLHlCQUFBO0VBQ0Esd0NBQUE7RUFDQSwyQkFBQTtFQUNBLHlCQUFBO0FBOURGOztBQWtFQTtFQUNFO0lBQ0UsYUFBQTtFQS9ERjtFQWtFQTtJQUNFLHNCQUFBO0lBQ0Esb0JBQUE7RUFoRUY7RUFtRUE7SUFDRSxzQkFBQTtJQUNBLGtCQUFBO0lBQ0EsU0FBQTtFQWpFRjtFQW9FQTtJQUNFLGNBQUE7RUFsRUY7RUFxRUE7SUFDRSxXQUFBO0lBQ0EsdUJBQUE7RUFuRUY7RUFzRUE7SUFDRSxXQUFBO0lBQ0EsdUJBQUE7RUFwRUY7RUF1RUE7SUFDRSxlQUFBO0VBckVGO0VBd0VBO0lBQ0UsYUFBQTtFQXRFRjtFQXlFQTtJQUNFLDBCQUFBO0VBdkVGO0VBMEVBO0lBQ0Usc0JBQUE7SUFDQSx1QkFBQTtJQUNBLFNBQUE7RUF4RUY7RUEwRUU7SUFDRSxXQUFBO0lBQ0EsZUFBQTtFQXhFSjtFQTRFQTtJQUNFLHNCQUFBO0lBQ0Esb0JBQUE7RUExRUY7RUE0RUU7SUFDRSxVQUFBO0VBMUVKO0VBOEVBO0lBQ0Usc0JBQUE7RUE1RUY7QUFDRjtBQStFQTtFQUNFLDJCQUFBO0FBN0VGOztBQWdGQTtFQUNFLGFBQUE7RUFDQSw4QkFBQTtFQUNBLG1CQUFBO0VBQ0EsbUJBQUE7QUE3RUY7QUErRUU7RUFDRSxTQUFBO0VBQ0EsaUJBQUE7RUFDQSxnQkFBQTtBQTdFSjtBQWdGRTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7QUE5RUo7O0FBa0ZBO0VBQ0UsYUFBQTtFQUNBLDREQUFBO0VBQ0EsV0FBQTtFQUNBLG1CQUFBO0FBL0VGOztBQWtGQTtFQUNFLGtCQUFBO0VBQ0Esa0NBQUE7RUFDQSxxQ0FBQTtFQUNBLG1CQUFBO0VBQ0EsZUFBQTtFQUNBLHlCQUFBO0FBL0VGO0FBaUZFO0VBQ0UsMkJBQUE7RUFDQSwwQ0FBQTtFQUNBLGtDQUFBO0FBL0VKO0FBa0ZFO0VBQ0UsWUFBQTtFQUNBLG9CQUFBO0FBaEZKO0FBa0ZJO0VBQ0Usa0JBQUE7RUFDQSxTQUFBO0VBQ0EsV0FBQTtFQUNBLDZEQUFBO0VBQ0EsWUFBQTtFQUNBLHdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EseUJBQUE7RUFDQSxxQkFBQTtBQWhGTjs7QUFxRkE7RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLG1CQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EsNkZBQUE7QUFsRkY7QUFvRkU7RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLG1CQUFBO0FBbEZKO0FBcUZFO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLDZEQUFBO0FBbkZKO0FBcUZJO0VBQ0UsZUFBQTtFQUNBLGdCQUFBO0VBQ0EsWUFBQTtBQW5GTjs7QUF3RkE7RUFDRSxxQkFBQTtBQXJGRjtBQXVGRTtFQUNFLG9CQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLDBCQUFBO0FBckZKO0FBd0ZFO0VBQ0UsNEJBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0VBQ0EsbUJBQUE7QUF0Rko7QUF5RkU7RUFDRSxhQUFBO0VBQ0EsZUFBQTtFQUNBLFdBQUE7QUF2Rko7QUEwRkU7RUFDRSxxQkFBQTtFQUNBLHdCQUFBO0VBQ0EsbUNBQUE7RUFDQSwyQkFBQTtFQUNBLG1CQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtBQXhGSjs7QUE0RkE7RUFDRSxhQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7QUF6RkY7QUEyRkU7RUFDRSxPQUFBO0VBQ0EsZ0JBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLFdBQUE7RUFDQSxzQkFBQTtFQUNBLG1CQUFBO0FBekZKO0FBMkZJO0VBQ0UsV0FBQTtFQUNBLFlBQUE7QUF6Rk47O0FBOEZBO0VBQ0UsYUFBQTtFQUNBLDJEQUFBO0VBQ0EsV0FBQTtFQUNBLGdCQUFBO0FBM0ZGOztBQThGQTtFQUNFLGtDQUFBO0VBQ0EscUNBQUE7RUFDQSxtQkFBQTtFQUNBLGVBQUE7RUFDQSxrQkFBQTtFQUNBLHlCQUFBO0FBM0ZGO0FBNkZFO0VBQ0UsMkJBQUE7RUFDQSx5Q0FBQTtBQTNGSjtBQThGRTtFQUNFLGlCQUFBO0VBQ0EsbUJBQUE7QUE1Rko7QUErRkU7RUFDRSxvQkFBQTtFQUNBLGVBQUE7RUFDQSxnQkFBQTtFQUNBLDBCQUFBO0FBN0ZKO0FBZ0dFO0VBQ0UsU0FBQTtFQUNBLG1CQUFBO0VBQ0EsNEJBQUE7RUFDQSxnQkFBQTtBQTlGSjs7QUFzR0E7RUFDRSxjQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQ0FBQTtFQUNBLG1CQUFBO0VBQ0EscUNBQUE7RUFDQSxpQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0FBbkdGOztBQXVHQTtFQUNFLGFBQUE7RUFDQSxzQkFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSxhQUFBO0VBQ0EsU0FBQTtBQXBHRjtBQXNHRTtFQUNFLDRCQUFBO0VBQ0EsZUFBQTtFQUNBLFNBQUE7QUFwR0o7O0FBd0dBO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSwwQ0FBQTtFQUNBLCtDQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQ0FBQTtBQXJHRjs7QUF3R0E7RUFDRTtJQUNFLHlCQUFBO0VBckdGO0FBQ0Y7QUF5R0E7RUFDRSxxQkFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsMENBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0Esb0NBQUE7QUF2R0Y7O0FBMEdBO0VBQ0UsV0FBQTtFQUNBLHlCQUFBO0VBQ0EsaUJBQUE7RUFDQSxjQUFBO0FBdkdGO0FBeUdFO0VBQ0UsMENBQUE7RUFDQSw0Q0FBQTtBQXZHSjtBQXlHSTtFQUNFLHVCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtFQUNBLDBCQUFBO0VBQ0EsaUJBQUE7RUFDQSx5QkFBQTtFQUNBLHFCQUFBO0VBQ0EsbUJBQUE7QUF2R047QUE0R0k7RUFDRSw0Q0FBQTtFQUNBLHlCQUFBO0FBMUdOO0FBNEdNO0VBQ0UscUNBQUE7QUExR1I7QUE2R007RUFDRSxxQ0FBQTtFQUNBLHlEQUFBO0FBM0dSO0FBOEdNO0VBQ0UsbUNBQUE7QUE1R1I7QUErR007RUFDRSx1QkFBQTtFQUNBLHNCQUFBO0FBN0dSOztBQXFIRTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7QUFsSEo7QUFxSEU7RUFDRSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsWUFBQTtFQUNBLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtBQW5ISjtBQXFISTtFQUNFLGVBQUE7RUFDQSx5QkFBQTtBQW5ITjtBQXFITTtFQUNFLDJCQUFBO0VBQ0EseUNBQUE7RUFDQSxZQUFBO0FBbkhSO0FBc0hNO0VBQ0Usd0JBQUE7QUFwSFI7O0FBMkhFO0VBQ0UscUJBQUE7RUFDQSx3QkFBQTtFQUNBLG1CQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLHlCQUFBO0VBQ0EscUJBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7QUF4SEo7QUEwSEk7RUFDRSxtQkFBQTtBQXhITjs7QUE2SEE7RUFDRSxnQkFBQTtFQUNBLGdCQUFBO0FBMUhGO0FBNEhFO0VBQ0UsMEJBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0VBQ0EsdUJBQUE7RUFDQSxtQkFBQTtBQTFISjtBQTZIRTtFQUNFLFdBQUE7RUFDQSxlQUFBO0VBQ0EsK0NBQUE7RUFDQSxrQkFBQTtFQUNBLGtDQUFBO0VBQ0EsMEJBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0FBM0hKO0FBNkhJO0VBQ0UsYUFBQTtFQUNBLDhDQUFBO0FBM0hOOztBQWdJQTtFQUNFLGdCQUFBO0VBQ0EsZ0JBQUE7QUE3SEY7QUErSEU7RUFDRSxxQ0FBQTtFQUNBLGlCQUFBO0VBQ0EsNEJBQUE7RUFDQSwrQkFBQTtFQUNBLHVCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0FBN0hKOztBQWlJQTtFQUNFLGdCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxxQ0FBQTtFQUNBLGlCQUFBO0VBQ0EsNEJBQUE7QUE5SEY7QUFnSUU7RUFDRSxtQkFBQTtFQUNBLCtCQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0FBOUhKOztBQWtJQTtFQUNFLGtCQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsV0FBQTtBQS9IRjtBQWlJRTtFQUNFLE9BQUE7RUFDQSxtQkFBQTtFQUNBLHFDQUFBO0VBQ0Esa0JBQUE7RUFDQSxXQUFBO0VBQ0EsZUFBQTtFQUNBLCtDQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQ0FBQTtFQUNBLDBCQUFBO0FBL0hKO0FBaUlJO0VBQ0UsYUFBQTtFQUNBLDhDQUFBO0FBL0hOO0FBa0lJO0VBQ0Usa0JBQUE7RUFDQSw4RUFBQTtBQWhJTjtBQW9JRTtFQUNFLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLGdCQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSw0QkFBQTtFQUNBLFlBQUE7RUFDQSx3QkFBQTtBQWxJSjtBQW9JSTtFQUNFLFVBQUE7QUFsSU47QUFxSUk7RUFDRSxXQUFBO0VBQ0EsWUFBQTtBQW5JTjs7QUF3SUE7RUFDRSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxXQUFBO0FBcklGO0FBdUlFO0VBQ0UsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLDRCQUFBO0FBcklKOztBQTBJQTtFQUNFLGtCQUFBO0VBQ0EscUJBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtBQXZJRjtBQXlJRTtFQUNFLFVBQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtBQXZJSjtBQXlJSTtFQUNFLHlCQUFBO0FBdklOO0FBeUlNO0VBQ0UsMkJBQUE7QUF2SVI7QUEySUk7RUFDRSxZQUFBO0VBQ0EsbUJBQUE7QUF6SU47QUE2SUU7RUFDRSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0Esc0JBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0FBM0lKO0FBNklJO0VBQ0Usa0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLFdBQUE7RUFDQSxTQUFBO0VBQ0EsV0FBQTtFQUNBLHVCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtBQTNJTjs7QUFnSkE7RUFDRSxnQkFBQTtBQTdJRjtBQStJRTtFQUNFLGFBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7QUE3SUo7QUFnSkU7RUFDRSxhQUFBO0VBQ0EsV0FBQTtBQTlJSjtBQWlKRTtFQUNFLHlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQkFBQTtFQUNBLFlBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSx5QkFBQTtBQS9JSjtBQWlKSTtFQUNFLG1CQUFBO0VBQ0EsWUFBQTtBQS9JTjtBQWlKTTtFQUNFLG1CQUFBO0FBL0lSO0FBbUpJO0VBQ0UsbUJBQUE7RUFDQSxZQUFBO0FBakpOO0FBbUpNO0VBQ0UsbUJBQUE7QUFqSlI7QUFzSkU7RUFDRSx1QkFBQTtFQUNBLHFDQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsZUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EseUJBQUE7RUFDQSwwQkFBQTtBQXBKSjtBQXNKSTtFQUNFLDRDQUFBO0VBQ0EsMkNBQUE7RUFDQSxvQ0FBQTtBQXBKTjtBQXdKTTtFQUNFLGtDQUFBO0VBQ0EscUJBQUE7RUFDQSxjQUFBO0FBdEpSO0FBMEpJO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBeEpOO0FBMkpJO0VBQ0UsV0FBQTtFQUNBLFlBQUE7QUF6Sk47O0FBK0pBO0VBQ0Usa0JBQUE7RUFDQSxrQkFBQTtFQUNBLDRCQUFBO0FBNUpGO0FBOEpFO0VBQ0UscUJBQUE7RUFDQSxZQUFBO0VBQ0Esb0JBQUE7QUE1Sko7QUErSkU7RUFDRSxvQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSwwQkFBQTtBQTdKSjtBQWdLRTtFQUNFLG9CQUFBO0VBQ0EsZUFBQTtBQTlKSjtBQWlLRTtFQUNFLGdCQUFBO0FBL0pKOztBQXVLQTtFQUNFLGVBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0EsOEJBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSx1QkFBQTtFQUNBLGFBQUE7RUFDQSxhQUFBO0VBQ0EsMEJBQUE7RUFDQSwyQkFBQTtBQXBLRjs7QUF1S0E7RUFDRSxrQ0FBQTtFQUNBLG1CQUFBO0VBQ0EsV0FBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxnQkFBQTtFQUNBLDBDQUFBO0VBQ0EsNEJBQUE7QUFwS0Y7O0FBdUtBO0VBQ0Usb0JBQUE7RUFDQSw0Q0FBQTtFQUNBLGFBQUE7RUFDQSw4QkFBQTtFQUNBLG1CQUFBO0FBcEtGO0FBc0tFO0VBQ0UsU0FBQTtFQUNBLGlCQUFBO0VBQ0EsZ0JBQUE7RUFDQSwwQkFBQTtBQXBLSjtBQXVLRTtFQUNFLGdCQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7RUFDQSw0QkFBQTtFQUNBLGVBQUE7RUFDQSxrQkFBQTtFQUNBLHlCQUFBO0FBcktKO0FBdUtJO0VBQ0UsNENBQUE7RUFDQSwwQkFBQTtBQXJLTjtBQXdLSTtFQUNFLGNBQUE7QUF0S047O0FBMktBO0VBQ0UsYUFBQTtBQXhLRjtBQTBLRTtFQUNFLHFCQUFBO0FBeEtKO0FBMEtJO0VBQ0UsY0FBQTtFQUNBLHFCQUFBO0VBQ0EsZ0JBQUE7RUFDQSwwQkFBQTtFQUNBLG1CQUFBO0FBeEtOO0FBMEtNO0VBQ0UsY0FBQTtFQUNBLG9CQUFBO0FBeEtSO0FBNEtJOztFQUVFLFdBQUE7RUFDQSxnQkFBQTtFQUNBLHFDQUFBO0VBQ0Esa0JBQUE7RUFDQSxrQ0FBQTtFQUNBLDBCQUFBO0VBQ0Esb0JBQUE7RUFDQSx5QkFBQTtBQTFLTjtBQTRLTTs7RUFDRSxhQUFBO0VBQ0EsMkNBQUE7RUFDQSw4Q0FBQTtBQXpLUjtBQTRLTTs7RUFDRSw0QkFBQTtFQUNBLFlBQUE7QUF6S1I7QUE2S0k7RUFDRSxlQUFBO0FBM0tOO0FBOEtJO0VBQ0UsY0FBQTtFQUNBLG9CQUFBO0VBQ0Esb0JBQUE7RUFDQSw0QkFBQTtBQTVLTjtBQStLSTtFQUNFLGNBQUE7RUFDQSxvQkFBQTtFQUNBLG9CQUFBO0VBQ0EsY0FBQTtFQUNBLGdCQUFBO0FBN0tOO0FBaUxFO0VBQ0Usa0JBQUE7QUEvS0o7QUFpTEk7RUFDRSxtQkFBQTtBQS9LTjtBQWtMSTtFQUNFLGtCQUFBO0VBQ0EsYUFBQTtFQUNBLFFBQUE7RUFDQSwyQkFBQTtFQUNBLGdCQUFBO0VBQ0EsWUFBQTtFQUNBLGVBQUE7RUFDQSxlQUFBO0VBQ0EsNEJBQUE7RUFDQSwyQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0FBaExOO0FBa0xNO0VBQ0UsMEJBQUE7QUFoTFI7QUFtTE07RUFDRSxjQUFBO0FBakxSOztBQXVMQTtFQUNFLGFBQUE7RUFDQSw4QkFBQTtFQUNBLG1CQUFBO0VBQ0EsU0FBQTtFQUNBLGdCQUFBO0VBQ0EsbUJBQUE7RUFDQSx5Q0FBQTtBQXBMRjtBQXNMRTtFQUNFLGFBQUE7RUFDQSxZQUFBO0FBcExKO0FBdUxFO0VBQ0UsdUJBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxvQkFBQTtFQUNBLHlCQUFBO0FBckxKO0FBdUxJO0VBQ0UseUNBQUE7RUFDQSxZQUFBO0FBckxOO0FBdUxNO0VBQ0UsbUJBQUE7RUFDQSwyQkFBQTtFQUNBLCtDQUFBO0FBckxSO0FBd0xNO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBdExSO0FBMExJO0VBQ0UsbUJBQUE7RUFDQSxZQUFBO0FBeExOO0FBMExNO0VBQ0UsbUJBQUE7QUF4TFI7QUE0TEk7RUFDRSx1QkFBQTtFQUNBLG9DQUFBO0VBQ0EsK0NBQUE7QUExTE47QUE0TE07RUFDRSx5Q0FBQTtFQUNBLFlBQUE7QUExTFI7QUE2TE07RUFDRSxZQUFBO0VBQ0EsbUJBQUE7QUEzTFI7O0FBa01BO0VBQ0U7SUFDRSxVQUFBO0VBL0xGO0VBaU1BO0lBQ0UsVUFBQTtFQS9MRjtBQUNGO0FBa01BO0VBQ0U7SUFDRSxVQUFBO0lBQ0EsMkJBQUE7RUFoTUY7RUFrTUE7SUFDRSxVQUFBO0lBQ0Esd0JBQUE7RUFoTUY7QUFDRjtBQW9NQTtFQUNFO0lBQ0Usb0JBQUE7RUFsTUY7RUFvTUU7SUFDRSxnQkFBQTtFQWxNSjtFQXNNQTtJQUNFLG9CQUFBO0VBcE1GO0FBQ0Y7QUF1TUE7RUFDRTtJQUNFLGtCQUFBO0lBQ0EsaUNBQUE7RUFyTUY7RUF3TUE7SUFDRSxnQkFBQTtFQXRNRjtFQXlNQTs7SUFFRSxnQkFBQTtFQXZNRjtFQTBNSTs7SUFDRSxrQkFBQTtFQXZNTjtFQXlNTTs7SUFDRSxpQkFBQTtFQXRNUjtFQTRNQTtJQUNFLGdCQUFBO0VBMU1GO0VBNk1BO0lBQ0UsZUFBQTtFQTNNRjtFQThNQTtJQUNFLG9CQUFBO0VBNU1GO0VBOE1FO0lBQ0Usa0JBQUE7RUE1TUo7RUFnTkE7SUFDRSxzQkFBQTtJQUNBLG9CQUFBO0VBOU1GO0VBZ05FO0lBQ0Usc0JBQUE7RUE5TUo7RUFpTkU7SUFDRSxXQUFBO0VBL01KO0FBQ0Y7QUF1TkE7RUFDRSxlQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0VBQ0EsK0JBQUE7RUFDQSxrQkFBQTtFQUNBLDBDQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsWUFBQTtFQUNBLGNBQUE7RUFDQSxxQ0FBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7QUFyTkY7QUF1TkU7RUFDRSxPQUFBO0VBQ0EsWUFBQTtBQXJOSjtBQXdORTtFQUNFLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLFVBQUE7RUFDQSxnQkFBQTtFQUNBLFlBQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxjQUFBO0VBQ0EsZUFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EsWUFBQTtFQUNBLHdCQUFBO0FBdE5KO0FBd05JO0VBQ0UsVUFBQTtBQXROTjtBQTBORTtFQUNFLDZEQUFBO0FBeE5KO0FBMk5FO0VBQ0UsNkRBQUE7QUF6Tko7QUE0TkU7RUFDRSw2REFBQTtBQTFOSjtBQTZORTtFQUNFLDZEQUFBO0FBM05KOztBQStOQTtFQUNFO0lBQ0UsNEJBQUE7SUFDQSxVQUFBO0VBNU5GO0VBOE5BO0lBQ0Usd0JBQUE7SUFDQSxVQUFBO0VBNU5GO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIucHJvZmlsZS1jb250YWluZXIge1xuICBtYXgtd2lkdGg6IDEyMDBweDtcbiAgbWFyZ2luOiAwIGF1dG87XG4gIHBhZGRpbmc6IDJyZW07XG4gIG1pbi1oZWlnaHQ6IDEwMHZoO1xufVxuXG4vLyBQcm9maWxlIEhlYWRlclxuLnByb2ZpbGUtaGVhZGVyIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzY2N2VlYSAwJSwgIzc2NGJhMiAxMDAlKTtcbiAgY29sb3I6IHdoaXRlO1xuICBib3JkZXItcmFkaXVzOiAxNnB4O1xuICBwYWRkaW5nOiAycmVtO1xuICBtYXJnaW4tYm90dG9tOiAycmVtO1xuICBib3gtc2hhZG93OiAwIDhweCAzMnB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDJyZW07XG4gIGZsZXgtd3JhcDogd3JhcDtcbn1cblxuLnVzZXItYXZhdGFyLXNlY3Rpb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDJyZW07XG4gIGZsZXg6IDE7XG59XG5cbi5wcm9maWxlLWhlYWRlci1hY3Rpb25zIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAxcmVtO1xufVxuXG4ubG9nb3V0LWJ0biB7XG4gIHBhZGRpbmc6IDAuNzVyZW0gMS41cmVtO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTtcbiAgY29sb3I6IHdoaXRlO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgZm9udC1zaXplOiAxcmVtO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDAuNXJlbTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAmOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyk7XG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOCk7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcbiAgfVxuXG4gIHN2ZyB7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZTtcbiAgfVxuXG4gICY6aG92ZXIgc3ZnIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoM3B4KTtcbiAgfVxufVxuXG4uYXZhdGFyLWNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xufVxuXG4udXNlci1hdmF0YXIteGwge1xuICB3aWR0aDogMTIwcHg7XG4gIGhlaWdodDogMTIwcHg7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgb2JqZWN0LWZpdDogY292ZXI7XG4gIGJvcmRlcjogNHB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbn1cblxuLmF2YXRhci1lZGl0LWJ0biB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgYm90dG9tOiAwO1xuICByaWdodDogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjkpO1xuICBjb2xvcjogIzMzMztcbiAgYm9yZGVyOiBub25lO1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIHdpZHRoOiAzNnB4O1xuICBoZWlnaHQ6IDM2cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cbiAgJjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpO1xuICB9XG59XG5cbi51c2VyLWJhc2ljLWluZm8ge1xuICBmbGV4OiAxO1xuICBtYXJnaW4tbGVmdDogMnJlbTtcbn1cblxuLnVzZXItbmFtZSB7XG4gIG1hcmdpbjogMCAwIDAuNXJlbSAwO1xuICBmb250LXNpemU6IDJyZW07XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG59XG5cbi51c2VyLWVtYWlsIHtcbiAgbWFyZ2luOiAwIDAgMXJlbSAwO1xuICBmb250LXNpemU6IDEuMTI1cmVtO1xuICBvcGFjaXR5OiAwLjk7XG59XG5cbi51c2VyLXN0YXR1cyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogMC43NXJlbTtcbiAgZmxleC13cmFwOiB3cmFwO1xufVxuXG4uc3RhdHVzLWJhZGdlLCAucm9sZS1iYWRnZSB7XG4gIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xuICBib3JkZXItcmFkaXVzOiAyMHB4O1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBmb250LXdlaWdodDogNjAwO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMHB4KTtcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xufVxuXG4uc3RhdHVzLWFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMzQsIDE5NywgOTQsIDAuMyk7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgzNCwgMTk3LCA5NCwgMC41KTtcbn1cblxuLnN0YXR1cy1pbmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMyk7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyMzksIDY4LCA2OCwgMC41KTtcbn1cblxuLy8gUHJvZmlsZSBDb250ZW50XG4ucHJvZmlsZS1jb250ZW50IHtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gIGJvcmRlci1yYWRpdXM6IDE2cHg7XG4gIGJveC1zaGFkb3c6IDAgNHB4IDIwcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xufVxuXG4vLyBUYWJzXG4ucHJvZmlsZS10YWJzIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYmFja2dyb3VuZDogdmFyKC0tdGFiLWJhY2tncm91bmQsICNmOGY5ZmEpO1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMSkpO1xuICBvdmVyZmxvdy14OiBhdXRvO1xufVxuXG4udGFiLWJ1dHRvbiB7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBib3JkZXI6IG5vbmU7XG4gIHBhZGRpbmc6IDFyZW0gMS41cmVtO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDAuNXJlbTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICM2NjYpO1xuICBmb250LXdlaWdodDogNTAwO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWJhY2tncm91bmQsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xuICB9XG5cbiAgJi5hY3RpdmUge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCwgd2hpdGUpO1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvciwgIzY2N2VlYSk7XG4gIH1cbn1cblxuLnRhYi1pY29uIHtcbiAgZm9udC1zaXplOiAxLjI1cmVtO1xufVxuXG4udGFiLWNvbnRlbnQge1xuICBwYWRkaW5nOiAycmVtO1xufVxuXG4vLyBTZXR0aW5ncyBTZWN0aW9uXG4uc2V0dGluZ3Mtc2VjdGlvbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMnJlbTtcbn1cblxuLnNldHRpbmdzLWdyb3VwIHtcbiAgaDMge1xuICAgIG1hcmdpbjogMCAwIDEuNXJlbSAwO1xuICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xuICB9XG59XG5cbi5zZXR0aW5nLWl0ZW0ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLCAwLCAwLCAwLjEpKTtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xuXG4gIC5zZXR0aW5nLWluZm8ge1xuICAgIGZsZXg6IDE7XG5cbiAgICBsYWJlbCB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICAgIG1hcmdpbi1ib3R0b206IDAuMjVyZW07XG4gICAgfVxuXG4gICAgcCB7XG4gICAgICBtYXJnaW46IDA7XG4gICAgICBmb250LXNpemU6IDAuODc1cmVtO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgICB9XG4gIH1cblxuICAuc2V0dGluZy1jb250cm9sIHtcbiAgICBtaW4td2lkdGg6IDIwMHB4O1xuXG4gICAgc2VsZWN0IHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgcGFkZGluZzogMC41cmVtO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMikpO1xuICAgICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICB9XG4gIH1cbn1cblxuLnRoZW1lLXRvZ2dsZS1idG4ge1xuICBwYWRkaW5nOiAwLjVyZW0gMXJlbTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMikpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCwgd2hpdGUpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWJhY2tncm91bmQsICNmOGY5ZmEpO1xuICB9XG59XG5cbi8vIFRvZ2dsZSBTd2l0Y2hcbi50b2dnbGUtc3dpdGNoIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIHdpZHRoOiA2MHB4O1xuICBoZWlnaHQ6IDM0cHg7XG5cbiAgaW5wdXQge1xuICAgIG9wYWNpdHk6IDA7XG4gICAgd2lkdGg6IDA7XG4gICAgaGVpZ2h0OiAwO1xuXG4gICAgJjpjaGVja2VkICsgLnNsaWRlciB7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcblxuICAgICAgJjpiZWZvcmUge1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMjZweCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLnNsaWRlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjYztcbiAgICBib3JkZXItcmFkaXVzOiAzNHB4O1xuICAgIHRyYW5zaXRpb246IC40cztcblxuICAgICY6YmVmb3JlIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGNvbnRlbnQ6IFwiXCI7XG4gICAgICBoZWlnaHQ6IDI2cHg7XG4gICAgICB3aWR0aDogMjZweDtcbiAgICAgIGxlZnQ6IDRweDtcbiAgICAgIGJvdHRvbTogNHB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB0cmFuc2l0aW9uOiAuNHM7XG4gICAgfVxuICB9XG59XG5cbi8vIFVzZXIgSW5mbyBTZWN0aW9uXG4udXNlcmluZm8tc2VjdGlvbiB7XG4gIC5pbmZvLWdyb3VwIGgzIHtcbiAgICBtYXJnaW46IDAgMCAxLjVyZW0gMDtcbiAgICBmb250LXNpemU6IDEuMjVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgfVxufVxuXG4uZm9ybS1yb3cge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciAxZnI7XG4gIGdhcDogMXJlbTtcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbn1cblxuLmZvcm0tZmllbGQge1xuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xuXG4gIGxhYmVsIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgfVxuXG4gIGlucHV0LCBzZWxlY3Qge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHBhZGRpbmc6IDAuNzVyZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMikpO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jYXJkLWJhY2tncm91bmQsIHdoaXRlKTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICBmb250LXNpemU6IDFyZW07XG5cbiAgICAmOmZvY3VzIHtcbiAgICAgIG91dGxpbmU6IG5vbmU7XG4gICAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4xKTtcbiAgICB9XG4gIH1cbn1cblxuLmVtYWlsLWlucHV0LWdyb3VwIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAxcmVtO1xuXG4gIGlucHV0IHtcbiAgICBmbGV4OiAxO1xuICB9XG59XG5cbi5nb29nbGUtYmFkZ2Uge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDAuNXJlbTtcbiAgcGFkZGluZzogMC41cmVtIDFyZW07XG4gIGJhY2tncm91bmQ6ICM0Mjg1ZjQ7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBmb250LXdlaWdodDogNTAwO1xufVxuXG4ubGluay1nb29nbGUtYnRuIHtcbiAgcGFkZGluZzogMC41cmVtIDFyZW07XG4gIGJhY2tncm91bmQ6ICM0Mjg1ZjQ7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm9yZGVyOiBub25lO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAmOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiAjMzM2N2Q2O1xuICB9XG59XG5cbi5mb3JtLWFjdGlvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDFyZW07XG4gIG1hcmdpbi10b3A6IDJyZW07XG5cbiAgLmJ0biB7XG4gICAgcGFkZGluZzogMC43NXJlbSAxLjVyZW07XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICAgJi5idG4tcHJpbWFyeSB7XG4gICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6ICM1YTY3ZDg7XG4gICAgICB9XG5cbiAgICAgICY6ZGlzYWJsZWQge1xuICAgICAgICBvcGFjaXR5OiAwLjU7XG4gICAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJi5idG4tc2Vjb25kYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICM2YjcyODA7XG4gICAgICBjb2xvcjogd2hpdGU7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjNGI1NTYzO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBNZXNzYWdlcyBTZWN0aW9uXG4ubWVzc2FnZXMtc2VjdGlvbiB7XG4gIC5tZXNzYWdlcy1oZWFkZXIge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xuXG4gICAgaDMge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xuICAgIH1cbiAgfVxuXG4gIC5tYXJrLWFsbC1yZWFkLWJ0biB7XG4gICAgcGFkZGluZzogMC41cmVtIDFyZW07XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgIH1cbiAgfVxufVxuXG4ubWVzc2FnZXMtbGlzdCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMXJlbTtcbn1cblxuLm1lc3NhZ2UtaXRlbSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogMXJlbTtcbiAgcGFkZGluZzogMS41cmVtO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jYXJkLWJhY2tncm91bmQsIHdoaXRlKTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMSkpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAmLnVucmVhZCB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjA1KTtcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4yKTtcbiAgfVxuXG4gIC5tZXNzYWdlLWljb24ge1xuICAgIHdpZHRoOiA0MHB4O1xuICAgIGhlaWdodDogNDBweDtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgYmFja2dyb3VuZDogI2YzZjRmNjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgIGZsZXgtc2hyaW5rOiAwO1xuICB9XG5cbiAgLm1lc3NhZ2UtY29udGVudCB7XG4gICAgZmxleDogMTtcblxuICAgIC5tZXNzYWdlLWhlYWRlciB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gICAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07XG5cbiAgICAgIGg0IHtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICBmb250LXNpemU6IDFyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xuICAgICAgfVxuXG4gICAgICAubWVzc2FnZS10aW1lIHtcbiAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICM2NjYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHAge1xuICAgICAgbWFyZ2luOiAwIDAgMXJlbSAwO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgfVxuXG4gICAgLm1lc3NhZ2UtYWN0aW9ucyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZ2FwOiAwLjVyZW07XG5cbiAgICAgIC5idG4ge1xuICAgICAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNzVyZW07XG4gICAgICAgIGJvcmRlcjogbm9uZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAgICAgICAmLmJ0bi1zbSB7XG4gICAgICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgICAgIHBhZGRpbmc6IDAuMjVyZW0gMC43NXJlbTtcbiAgICAgICAgfVxuXG4gICAgICAgICYuYnRuLXByaW1hcnkge1xuICAgICAgICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcblxuICAgICAgICAgICY6aG92ZXIge1xuICAgICAgICAgICAgYmFja2dyb3VuZDogIzVhNjdkODtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAmLmJ0bi1zZWNvbmRhcnkge1xuICAgICAgICAgIGJhY2tncm91bmQ6ICM2YjcyODA7XG4gICAgICAgICAgY29sb3I6IHdoaXRlO1xuXG4gICAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjNGI1NTYzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC5tYXJrLXJlYWQtYnRuIHtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgcGFkZGluZzogMC4yNXJlbTtcblxuICAgIC51bnJlYWQtZG90IHtcbiAgICAgIHdpZHRoOiAxMnB4O1xuICAgICAgaGVpZ2h0OiAxMnB4O1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1jb2xvciwgIzY2N2VlYSk7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICB9XG4gIH1cbn1cblxuLm5vLW1lc3NhZ2VzIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBwYWRkaW5nOiAzcmVtO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICM2NjYpO1xuXG4gIC5uby1tZXNzYWdlcy1pY29uIHtcbiAgICBmb250LXNpemU6IDNyZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgfVxuXG4gIHAge1xuICAgIG1hcmdpbjogMDtcbiAgICBmb250LXNpemU6IDEuMTI1cmVtO1xuICB9XG59XG5cbi8vIFRoZW1lLXNwZWNpZmljIHN0eWxlc1xuOmhvc3QtY29udGV4dCguZGFyaykge1xuICAtLWNhcmQtYmFja2dyb3VuZDogIzFmMjkzNztcbiAgLS10ZXh0LXByaW1hcnk6ICNmOWZhZmI7XG4gIC0tdGV4dC1zZWNvbmRhcnk6ICNkMWQ1ZGI7XG4gIC0tYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XG4gIC0taG92ZXItYmFja2dyb3VuZDogIzM3NDE1MTtcbiAgLS10YWItYmFja2dyb3VuZDogIzExMTgyNztcbn1cblxuLy8gUmVzcG9uc2l2ZSBEZXNpZ25cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAucHJvZmlsZS1jb250YWluZXIge1xuICAgIHBhZGRpbmc6IDFyZW07XG4gIH1cblxuICAucHJvZmlsZS1oZWFkZXIge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG4gIH1cblxuICAudXNlci1hdmF0YXItc2VjdGlvbiB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZ2FwOiAxcmVtO1xuICB9XG5cbiAgLnVzZXItYmFzaWMtaW5mbyB7XG4gICAgbWFyZ2luLWxlZnQ6IDA7XG4gIH1cblxuICAucHJvZmlsZS1oZWFkZXItYWN0aW9ucyB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIH1cblxuICAubG9nb3V0LWJ0biB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIH1cblxuICAucHJvZmlsZS10YWJzIHtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gIH1cblxuICAudGFiLWNvbnRlbnQge1xuICAgIHBhZGRpbmc6IDFyZW07XG4gIH1cblxuICAuZm9ybS1yb3cge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLnNldHRpbmctaXRlbSB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgICBnYXA6IDFyZW07XG5cbiAgICAuc2V0dGluZy1jb250cm9sIHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLXdpZHRoOiBhdXRvO1xuICAgIH1cbiAgfVxuXG4gIC5lbWFpbC1pbnB1dC1ncm91cCB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDtcblxuICAgIGlucHV0IHtcbiAgICAgIGZsZXg6IG5vbmU7XG4gICAgfVxuICB9XG5cbiAgLmZvcm0tYWN0aW9ucyB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgfVxufVxuLy8gVHJhZGluZyBQbGF0Zm9ybXMgU2VjdGlvblxuLnBsYXRmb3Jtcy1zZWN0aW9uIHtcbiAgYW5pbWF0aW9uOiBmYWRlSW4gMC4zcyBlYXNlO1xufVxuXG4ucGxhdGZvcm1zLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcblxuICBoMyB7XG4gICAgbWFyZ2luOiAwO1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIH1cblxuICAuYnRuIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZ2FwOiAwLjVyZW07XG4gIH1cbn1cblxuLnBsYXRmb3Jtcy1ncmlkIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMzIwcHgsIDFmcikpO1xuICBnYXA6IDEuNXJlbTtcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcbn1cblxuLnBsYXRmb3JtLWNhcmQge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcblxuICAmOmhvdmVyOm5vdCgucGxhdGZvcm0tZGlzYWJsZWQpIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTRweCk7XG4gICAgYm94LXNoYWRvdzogMCA4cHggMjRweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xuICAgIGJvcmRlci1jb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvcik7XG4gIH1cblxuICAmLnBsYXRmb3JtLWRpc2FibGVkIHtcbiAgICBvcGFjaXR5OiAwLjY7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG5cbiAgICAucGxhdGZvcm0tYmFkZ2Uge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiAxcmVtO1xuICAgICAgcmlnaHQ6IDFyZW07XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY3ZWVhIDAlLCAjNzY0YmEyIDEwMCUpO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgcGFkZGluZzogMC4yNXJlbSAwLjc1cmVtO1xuICAgICAgYm9yZGVyLXJhZGl1czogMjBweDtcbiAgICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xuICAgIH1cbiAgfVxufVxuXG4ucGxhdGZvcm0taWNvbiB7XG4gIHdpZHRoOiA2NHB4O1xuICBoZWlnaHQ6IDY0cHg7XG4gIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDk5LCAxMDIsIDI0MSwgMC4xKSAwJSwgcmdiYSgxNjgsIDg1LCAyNDcsIDAuMSkgMTAwJSk7XG5cbiAgaW1nIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgb2JqZWN0LWZpdDogY29udGFpbjtcbiAgfVxuXG4gIC5wbGF0Zm9ybS1pY29uLWZhbGxiYWNrIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM2MzY2ZjEgMCUsICNhODU1ZjcgMTAwJSk7XG5cbiAgICAucGxhdGZvcm0taW5pdGlhbCB7XG4gICAgICBmb250LXNpemU6IDJyZW07XG4gICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgY29sb3I6IHdoaXRlO1xuICAgIH1cbiAgfVxufVxuXG4ucGxhdGZvcm0taW5mbyB7XG4gIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcblxuICBoNCB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAucGxhdGZvcm0tZGVzY3JpcHRpb24ge1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBsaW5lLWhlaWdodDogMS41O1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cblxuICAucGxhdGZvcm0tZmVhdHVyZXMge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuICAgIGdhcDogMC41cmVtO1xuICB9XG5cbiAgLmZlYXR1cmUtYmFkZ2Uge1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNzVyZW07XG4gICAgYmFja2dyb3VuZDogcmdiYSg5OSwgMTAyLCAyNDEsIDAuMSk7XG4gICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7XG4gICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIH1cbn1cblxuLnBsYXRmb3JtLWFjdGlvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDAuNzVyZW07XG4gIGZsZXgtd3JhcDogd3JhcDtcblxuICAuYnRuIHtcbiAgICBmbGV4OiAxO1xuICAgIG1pbi13aWR0aDogMTIwcHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGdhcDogMC41cmVtO1xuICAgIHBhZGRpbmc6IDAuNjI1cmVtIDFyZW07XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcblxuICAgIHN2ZyB7XG4gICAgICB3aWR0aDogMTZweDtcbiAgICAgIGhlaWdodDogMTZweDtcbiAgICB9XG4gIH1cbn1cblxuLnBsYXRmb3JtLWluZm8tc2VjdGlvbiB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjUwcHgsIDFmcikpO1xuICBnYXA6IDEuNXJlbTtcbiAgbWFyZ2luLXRvcDogMnJlbTtcbn1cblxuLmluZm8tY2FyZCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xuXG4gICY6aG92ZXIge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMnB4KTtcbiAgICBib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgfVxuXG4gIC5pbmZvLWljb24ge1xuICAgIGZvbnQtc2l6ZTogMi41cmVtO1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cblxuICBoNCB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgZm9udC1zaXplOiAxcmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRVhDSEFOR0UgQ1JFREVOVElBTFMgU0VDVElPTlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uY3JlZGVudGlhbHMtdGFibGUtY29udGFpbmVyIHtcbiAgbWFyZ2luOiAycmVtIDA7XG4gIG92ZXJmbG93LXg6IGF1dG87XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCk7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIG1pbi1oZWlnaHQ6IDIwMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbn1cblxuLy8gTG9hZGluZyBTdGF0ZVxuLmxvYWRpbmctc3RhdGUge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgcGFkZGluZzogM3JlbTtcbiAgZ2FwOiAxcmVtO1xuXG4gIHAge1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgZm9udC1zaXplOiAxcmVtO1xuICAgIG1hcmdpbjogMDtcbiAgfVxufVxuXG4uc3Bpbm5lciB7XG4gIHdpZHRoOiA0OHB4O1xuICBoZWlnaHQ6IDQ4cHg7XG4gIGJvcmRlcjogNHB4IHNvbGlkIHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4xKTtcbiAgYm9yZGVyLXRvcC1jb2xvcjogdmFyKC0tcHJpbWFyeS1jb2xvciwgIzY2N2VlYSk7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcbn1cblxuQGtleWZyYW1lcyBzcGluIHtcbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gIH1cbn1cblxuLy8gU21hbGwgaW5saW5lIHNwaW5uZXIgZm9yIGJ1dHRvbnNcbi5zcGlubmVyLXNtYWxsIHtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICB3aWR0aDogMTRweDtcbiAgaGVpZ2h0OiAxNHB4O1xuICBib3JkZXI6IDJweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyk7XG4gIGJvcmRlci10b3AtY29sb3I6IHdoaXRlO1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIGFuaW1hdGlvbjogc3BpbiAwLjhzIGxpbmVhciBpbmZpbml0ZTtcbn1cblxuLmNyZWRlbnRpYWxzLXRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG4gIGZvbnQtc2l6ZTogMC45cmVtO1xuICBkaXNwbGF5OiB0YWJsZTtcblxuICB0aGVhZCB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tdGFiLWJhY2tncm91bmQsICNmOGY5ZmEpO1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuXG4gICAgdGgge1xuICAgICAgcGFkZGluZzogMC43NXJlbSAwLjVyZW07XG4gICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAwLjhyZW07XG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgICAgbGV0dGVyLXNwYWNpbmc6IDAuM3B4O1xuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICB9XG4gIH1cblxuICB0Ym9keSB7XG4gICAgdHIge1xuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjAzKTtcbiAgICAgIH1cblxuICAgICAgJi5lZGl0aW5nIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjA4KTtcbiAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMnB4IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgfVxuXG4gICAgICAmLmFjdGl2ZSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMzQsIDE5NywgOTQsIDAuMDUpO1xuICAgICAgfVxuXG4gICAgICB0ZCB7XG4gICAgICAgIHBhZGRpbmc6IDAuNzVyZW0gMC41cmVtO1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBUYWJsZSBDZWxsc1xuLnBsYXRmb3JtLWNlbGwge1xuICAucGxhdGZvcm0tbmFtZSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGdhcDogMC43NXJlbTtcbiAgfVxuXG4gIC5wbGF0Zm9ybS1iYWRnZSB7XG4gICAgcGFkZGluZzogMC4zNzVyZW0gMC43NXJlbTtcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgY29sb3I6IHdoaXRlO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuXG4gICAgJi5jbGlja2FibGUge1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMnB4KTtcbiAgICAgICAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMik7XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgIH1cblxuICAgICAgJjphY3RpdmUge1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi5lbnZpcm9ubWVudC1jZWxsIHtcbiAgLmVudi1iYWRnZSB7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIHBhZGRpbmc6IDAuMjVyZW0gMC43NXJlbTtcbiAgICBib3JkZXItcmFkaXVzOiAyMHB4O1xuICAgIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xuICAgIGJhY2tncm91bmQ6ICMyMTk2RjM7XG4gICAgY29sb3I6IHdoaXRlO1xuXG4gICAgJi50ZXN0bmV0IHtcbiAgICAgIGJhY2tncm91bmQ6ICNGRjk4MDA7XG4gICAgfVxuICB9XG59XG5cbi5sYWJlbC1jZWxsIHtcbiAgbWluLXdpZHRoOiAxMDBweDtcbiAgbWF4LXdpZHRoOiAxNTBweDtcblxuICAubGFiZWwtdGV4dCB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIH1cblxuICAuZWRpdC1pbnB1dCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcGFkZGluZzogMC41cmVtO1xuICAgIGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1jYXJkLWJhY2tncm91bmQpO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcblxuICAgICY6Zm9jdXMge1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMik7XG4gICAgfVxuICB9XG59XG5cbi5hcGkta2V5LWNlbGwge1xuICBtaW4td2lkdGg6IDE1MHB4O1xuICBtYXgtd2lkdGg6IDIwMHB4O1xuXG4gIC5hcGkta2V5LXByZXZpZXcge1xuICAgIGZvbnQtZmFtaWx5OiAnQ291cmllciBOZXcnLCBtb25vc3BhY2U7XG4gICAgZm9udC1zaXplOiAwLjhyZW07XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMDUpO1xuICAgIHBhZGRpbmc6IDAuMjVyZW0gMC41cmVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gIH1cbn1cblxuLmFwaS1zZWNyZXQtY2VsbCB7XG4gIG1pbi13aWR0aDogMTAwcHg7XG4gIG1heC13aWR0aDogMTUwcHg7XG4gIGZvbnQtZmFtaWx5OiAnQ291cmllciBOZXcnLCBtb25vc3BhY2U7XG4gIGZvbnQtc2l6ZTogMC44cmVtO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuXG4gIC5hcGktc2VjcmV0LXByZXZpZXcge1xuICAgIGxldHRlci1zcGFjaW5nOiAxcHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjA1KTtcbiAgICBwYWRkaW5nOiAwLjI1cmVtIDAuNXJlbTtcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICB9XG59XG5cbi5wYXNzd29yZC1pbnB1dC13cmFwcGVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB3aWR0aDogMTAwJTtcblxuICAuZWRpdC1pbnB1dCB7XG4gICAgZmxleDogMTtcbiAgICBwYWRkaW5nLXJpZ2h0OiAzNXB4O1xuICAgIGZvbnQtZmFtaWx5OiAnQ291cmllciBOZXcnLCBtb25vc3BhY2U7XG4gICAgZm9udC1zaXplOiAwLjg1cmVtO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHBhZGRpbmc6IDAuNXJlbTtcbiAgICBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kKTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICY6Zm9jdXMge1xuICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDNweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMik7XG4gICAgfVxuXG4gICAgJjo6cGxhY2Vob2xkZXIge1xuICAgICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgIH1cbiAgfVxuXG4gIC50b2dnbGUtdmlzaWJpbGl0eS1idG4tc21hbGwge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICByaWdodDogOHB4O1xuICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBwYWRkaW5nOiA0cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gICAgb3BhY2l0eTogMC42O1xuICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycztcblxuICAgICY6aG92ZXIge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICB9XG5cbiAgICBzdmcge1xuICAgICAgd2lkdGg6IDE2cHg7XG4gICAgICBoZWlnaHQ6IDE2cHg7XG4gICAgfVxuICB9XG59XG5cbi5zdGF0dXMtY2VsbCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMC41cmVtO1xuXG4gIC5zdGF0dXMtdGV4dCB7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG4gIH1cbn1cblxuLy8gU21hbGwgVG9nZ2xlIFN3aXRjaFxuLnRvZ2dsZS1zd2l0Y2gtc21hbGwge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2lkdGg6IDQ0cHg7XG4gIGhlaWdodDogMjRweDtcblxuICBpbnB1dCB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB3aWR0aDogMDtcbiAgICBoZWlnaHQ6IDA7XG5cbiAgICAmOmNoZWNrZWQgKyAuc2xpZGVyLXNtYWxsIHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMyMmM1NWU7XG5cbiAgICAgICY6YmVmb3JlIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDIwcHgpO1xuICAgICAgfVxuICAgIH1cblxuICAgICY6ZGlzYWJsZWQgKyAuc2xpZGVyLXNtYWxsIHtcbiAgICAgIG9wYWNpdHk6IDAuNjtcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gICAgfVxuICB9XG5cbiAgLnNsaWRlci1zbWFsbCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjYztcbiAgICBib3JkZXItcmFkaXVzOiAyNHB4O1xuICAgIHRyYW5zaXRpb246IC4zcztcblxuICAgICY6YmVmb3JlIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGNvbnRlbnQ6IFwiXCI7XG4gICAgICBoZWlnaHQ6IDE4cHg7XG4gICAgICB3aWR0aDogMThweDtcbiAgICAgIGxlZnQ6IDNweDtcbiAgICAgIGJvdHRvbTogM3B4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB0cmFuc2l0aW9uOiAuM3M7XG4gICAgfVxuICB9XG59XG5cbi5hY3Rpb25zLWNlbGwge1xuICBtaW4td2lkdGg6IDE4MHB4O1xuXG4gIC5yb3ctYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBnYXA6IDAuNXJlbTtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB9XG5cbiAgLmVkaXQtYWN0aW9ucyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBnYXA6IDAuNXJlbTtcbiAgfVxuXG4gIC5idG4tc20ge1xuICAgIHBhZGRpbmc6IDAuMzc1cmVtIDAuNzVyZW07XG4gICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICBib3JkZXI6IG5vbmU7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAgICYuYnRuLXN1Y2Nlc3Mge1xuICAgICAgYmFja2dyb3VuZDogIzIyYzU1ZTtcbiAgICAgIGNvbG9yOiB3aGl0ZTtcblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6ICMxNmEzNGE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJi5idG4tc2Vjb25kYXJ5IHtcbiAgICAgIGJhY2tncm91bmQ6ICM2YjcyODA7XG4gICAgICBjb2xvcjogd2hpdGU7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjNGI1NTYzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC5idG4taWNvbiB7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XG4gICAgcGFkZGluZzogMC41cmVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcblxuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItYmFja2dyb3VuZCwgI2Y4ZjlmYSk7XG4gICAgICBib3JkZXItY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgIH1cblxuICAgICYuYnRuLWRhbmdlciB7XG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjZWY0NDQ0O1xuICAgICAgICBjb2xvcjogI2VmNDQ0NDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAmOmRpc2FibGVkIHtcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gICAgfVxuXG4gICAgc3ZnIHtcbiAgICAgIHdpZHRoOiAxNnB4O1xuICAgICAgaGVpZ2h0OiAxNnB4O1xuICAgIH1cbiAgfVxufVxuXG4vLyBFbXB0eSBTdGF0ZVxuLmVtcHR5LXN0YXRlIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBwYWRkaW5nOiA0cmVtIDJyZW07XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG5cbiAgc3ZnIHtcbiAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gICAgb3BhY2l0eTogMC4zO1xuICAgIHN0cm9rZTogY3VycmVudENvbG9yO1xuICB9XG5cbiAgaDQge1xuICAgIG1hcmdpbjogMCAwIDAuNXJlbSAwO1xuICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICB9XG5cbiAgcCB7XG4gICAgbWFyZ2luOiAwIDAgMS41cmVtIDA7XG4gICAgZm9udC1zaXplOiAxcmVtO1xuICB9XG5cbiAgLmJ0biB7XG4gICAgbWFyZ2luLXRvcDogMXJlbTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBBREQgQ1JFREVOVElBTCBNT0RBTFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4ubW9kYWwtb3ZlcmxheSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNik7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB6LWluZGV4OiAxMDAwO1xuICBwYWRkaW5nOiAxcmVtO1xuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoNHB4KTtcbiAgYW5pbWF0aW9uOiBmYWRlSW4gMC4ycyBlYXNlO1xufVxuXG4ubW9kYWwtY29udGVudCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCk7XG4gIGJvcmRlci1yYWRpdXM6IDE2cHg7XG4gIHdpZHRoOiAxMDAlO1xuICBtYXgtd2lkdGg6IDYwMHB4O1xuICBtYXgtaGVpZ2h0OiA5MHZoO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICBib3gtc2hhZG93OiAwIDIwcHggNjBweCByZ2JhKDAsIDAsIDAsIDAuMyk7XG4gIGFuaW1hdGlvbjogc2xpZGVVcCAwLjNzIGVhc2U7XG59XG5cbi5tb2RhbC1oZWFkZXIge1xuICBwYWRkaW5nOiAxLjVyZW0gMnJlbTtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcblxuICBoMyB7XG4gICAgbWFyZ2luOiAwO1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gIH1cblxuICAubW9kYWwtY2xvc2UtYnRuIHtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICBwYWRkaW5nOiAwLjVyZW07XG4gICAgYm9yZGVyLXJhZGl1czogNnB4O1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWJhY2tncm91bmQsICNmOGY5ZmEpO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSk7XG4gICAgfVxuXG4gICAgc3ZnIHtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIH1cbiAgfVxufVxuXG4ubW9kYWwtZm9ybSB7XG4gIHBhZGRpbmc6IDJyZW07XG5cbiAgLmZvcm0tZmllbGQge1xuICAgIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcblxuICAgIGxhYmVsIHtcbiAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMC41cmVtO1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAwLjg3NXJlbTtcblxuICAgICAgLnJlcXVpcmVkIHtcbiAgICAgICAgY29sb3I6ICNlZjQ0NDQ7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAwLjI1cmVtO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlucHV0LFxuICAgIHNlbGVjdCB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIHBhZGRpbmc6IDAuNzVyZW07XG4gICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kKTtcbiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICAgICAgZm9udC1zaXplOiAwLjkzNzVyZW07XG4gICAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuXG4gICAgICAmOmZvY3VzIHtcbiAgICAgICAgb3V0bGluZTogbm9uZTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICAgICAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoMTAyLCAxMjYsIDIzNCwgMC4xKTtcbiAgICAgIH1cblxuICAgICAgJjo6cGxhY2Vob2xkZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgICAgICBvcGFjaXR5OiAwLjY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0IHtcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICB9XG5cbiAgICBzbWFsbCB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIG1hcmdpbi10b3A6IDAuMzc1cmVtO1xuICAgICAgZm9udC1zaXplOiAwLjgxMjVyZW07XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICAgIH1cblxuICAgIC5maWVsZC1lcnJvciB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgIG1hcmdpbi10b3A6IDAuMzc1cmVtO1xuICAgICAgZm9udC1zaXplOiAwLjgxMjVyZW07XG4gICAgICBjb2xvcjogI2VmNDQ0NDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgfVxuICB9XG5cbiAgLnBhc3N3b3JkLWlucHV0LXdyYXBwZXIge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgIGlucHV0IHtcbiAgICAgIHBhZGRpbmctcmlnaHQ6IDNyZW07XG4gICAgfVxuXG4gICAgLnRvZ2dsZS12aXNpYmlsaXR5LWJ0biB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICByaWdodDogMC41cmVtO1xuICAgICAgdG9wOiA1MCU7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG4gICAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgICAgYm9yZGVyOiBub25lO1xuICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgcGFkZGluZzogMC41cmVtO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5KTtcbiAgICAgIHRyYW5zaXRpb246IGNvbG9yIDAuMnMgZWFzZTtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgICAgIH1cblxuICAgICAgc3ZnIHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi5tb2RhbC1hY3Rpb25zIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDFyZW07XG4gIG1hcmdpbi10b3A6IDJyZW07XG4gIHBhZGRpbmctdG9wOiAxLjVyZW07XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuXG4gIC5hY3Rpb25zLXJpZ2h0IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGdhcDogMC43NXJlbTtcbiAgfVxuXG4gIC5idG4ge1xuICAgIHBhZGRpbmc6IDAuNzVyZW0gMS41cmVtO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgZm9udC1zaXplOiAwLjkzNzVyZW07XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcblxuICAgICYuYnRuLXByaW1hcnkge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tcHJpbWFyeS1jb2xvciwgIzY2N2VlYSk7XG4gICAgICBjb2xvcjogd2hpdGU7XG5cbiAgICAgICY6aG92ZXI6bm90KDpkaXNhYmxlZCkge1xuICAgICAgICBiYWNrZ3JvdW5kOiAjNWE2N2Q4O1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XG4gICAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjQpO1xuICAgICAgfVxuXG4gICAgICAmOmRpc2FibGVkIHtcbiAgICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICAgICAgfVxuICAgIH1cblxuICAgICYuYnRuLXNlY29uZGFyeSB7XG4gICAgICBiYWNrZ3JvdW5kOiAjNmI3MjgwO1xuICAgICAgY29sb3I6IHdoaXRlO1xuXG4gICAgICAmOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZDogIzRiNTU2MztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAmLmJ0bi1vdXRsaW5lIHtcbiAgICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICAgICAgY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgICAgYm9yZGVyOiAycHggc29saWQgdmFyKC0tcHJpbWFyeS1jb2xvciwgIzY2N2VlYSk7XG5cbiAgICAgICY6aG92ZXI6bm90KDpkaXNhYmxlZCkge1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICAgICAgY29sb3I6IHdoaXRlO1xuICAgICAgfVxuXG4gICAgICAmOmRpc2FibGVkIHtcbiAgICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBBbmltYXRpb25zXG5Aa2V5ZnJhbWVzIGZhZGVJbiB7XG4gIGZyb20ge1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gIH1cbn1cblxuQGtleWZyYW1lcyBzbGlkZVVwIHtcbiAgZnJvbSB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjBweCk7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICB9XG59XG5cbi8vIFJlc3BvbnNpdmUgRGVzaWduIGZvciBDcmVkZW50aWFscyBUYWJsZVxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMjRweCkge1xuICAuY3JlZGVudGlhbHMtdGFibGUge1xuICAgIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xuXG4gICAgdGgsIHRkIHtcbiAgICAgIHBhZGRpbmc6IDAuNzVyZW07XG4gICAgfVxuICB9XG5cbiAgLnBsYXRmb3JtLWJhZGdlIHtcbiAgICBmb250LXNpemU6IDAuODEyNXJlbTtcbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcbiAgLmNyZWRlbnRpYWxzLXRhYmxlLWNvbnRhaW5lciB7XG4gICAgb3ZlcmZsb3cteDogc2Nyb2xsO1xuICAgIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaDtcbiAgfVxuXG4gIC5jcmVkZW50aWFscy10YWJsZSB7XG4gICAgbWluLXdpZHRoOiA4MDBweDsgLy8gUmVkdWNlZCBmb3IgYmV0dGVyIG1vYmlsZSBkaXNwbGF5XG4gIH1cblxuICAuYXBpLWtleS1jZWxsLFxuICAuYXBpLXNlY3JldC1jZWxsIHtcbiAgICBtaW4td2lkdGg6IDEyMHB4O1xuXG4gICAgLnBhc3N3b3JkLWlucHV0LXdyYXBwZXIge1xuICAgICAgLmVkaXQtaW5wdXQge1xuICAgICAgICBmb250LXNpemU6IDAuNzVyZW07XG5cbiAgICAgICAgJjo6cGxhY2Vob2xkZXIge1xuICAgICAgICAgIGZvbnQtc2l6ZTogMC43cmVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLm1vZGFsLWNvbnRlbnQge1xuICAgIG1heC1oZWlnaHQ6IDk1dmg7XG4gIH1cblxuICAubW9kYWwtZm9ybSB7XG4gICAgcGFkZGluZzogMS41cmVtO1xuICB9XG5cbiAgLm1vZGFsLWhlYWRlciB7XG4gICAgcGFkZGluZzogMXJlbSAxLjVyZW07XG5cbiAgICBoMyB7XG4gICAgICBmb250LXNpemU6IDEuMjVyZW07XG4gICAgfVxuICB9XG5cbiAgLm1vZGFsLWFjdGlvbnMge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XG5cbiAgICAuYWN0aW9ucy1yaWdodCB7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIH1cblxuICAgIC5idG4ge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgfVxuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRPQVNUIE5PVElGSUNBVElPTlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4udG9hc3Qtbm90aWZpY2F0aW9uIHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDIwcHg7XG4gIHJpZ2h0OiAyMHB4O1xuICBtaW4td2lkdGg6IDMwMHB4O1xuICBtYXgtd2lkdGg6IDUwMHB4O1xuICBwYWRkaW5nOiAxcmVtIDNyZW0gMXJlbSAxLjI1cmVtO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjc1cmVtO1xuICB6LWluZGV4OiAxMDAwMDtcbiAgYW5pbWF0aW9uOiBzbGlkZUluUmlnaHQgMC4zcyBlYXNlLW91dDtcbiAgZm9udC1zaXplOiAwLjk1cmVtO1xuICBsaW5lLWhlaWdodDogMS40O1xuXG4gIHNwYW4ge1xuICAgIGZsZXg6IDE7XG4gICAgY29sb3I6IHdoaXRlO1xuICB9XG5cbiAgLnRvYXN0LWNsb3NlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA4cHg7XG4gICAgcmlnaHQ6IDhweDtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHBhZGRpbmc6IDA7XG4gICAgd2lkdGg6IDI0cHg7XG4gICAgaGVpZ2h0OiAyNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBvcGFjaXR5OiAwLjg7XG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzO1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cbiAgfVxuXG4gICYudG9hc3Qtc3VjY2VzcyB7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzRDQUY1MCAwJSwgIzQ1YTA0OSAxMDAlKTtcbiAgfVxuXG4gICYudG9hc3QtZXJyb3Ige1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmNDQzMzYgMCUsICNkMzJmMmYgMTAwJSk7XG4gIH1cblxuICAmLnRvYXN0LXdhcm5pbmcge1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmZjk4MDAgMCUsICNmNTdjMDAgMTAwJSk7XG4gIH1cblxuICAmLnRvYXN0LWluZm8ge1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMyMTk2RjMgMCUsICMxOTc2RDIgMTAwJSk7XG4gIH1cbn1cblxuQGtleWZyYW1lcyBzbGlkZUluUmlnaHQge1xuICBmcm9tIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNDAwcHgpO1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTtcbiAgICBvcGFjaXR5OiAxO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return ProfileComponent;
})();

/***/ }),

/***/ 8905:
/*!*************************************************************************************************!*\
  !*** ./src/app/components/trading-platform-info-modal/trading-platform-info-modal.component.ts ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TradingPlatformInfoModalComponent: () => (/* binding */ TradingPlatformInfoModalComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 819);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 3900);
/* harmony import */ var _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/exchange-credentials.model */ 7392);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/translation.service */ 6845);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/button/button.component */ 5782);
/* harmony import */ var _services_bybit_user_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/bybit-user.service */ 9894);
/* harmony import */ var _services_bingx_user_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../services/bingx-user.service */ 7568);





/**
 * Trading Platform Info Modal Component
 *
 * Displays comprehensive trading platform information in a modal dialog.
 * Supports multiple exchanges (Bybit, Binance, etc.) with testnet/mainnet environments.
 *
 * Features:
 * - Account overview with wallet balance and equity
 * - Coin balances breakdown
 * - Active positions with PnL
 * - Active orders and order history
 * - Loading and error states
 * - Responsive design
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 */





const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.coin;
const _forTrack2 = ($index, $item) => $item.symbol;
const _forTrack3 = ($index, $item) => $item.orderId;
function TradingPlatformInfoModalComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.credential().label);
  }
}
function TradingPlatformInfoModalComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](1, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.loadingAccount"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 16)(1, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "ui-button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function TradingPlatformInfoModalComponent_Conditional_23_Template_ui_button_clicked_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r2);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r0.retryLoad());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.unableToLoad"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.error());
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("button.tryAgain"), " ");
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_For_37_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "ui-button", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function TradingPlatformInfoModalComponent_Conditional_24_For_37_Template_ui_button_clicked_0_listener() {
      const tab_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r3).$implicit;
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r0.setActiveTab(tab_r4.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "span", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "span", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const tab_r4 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("active", ctx_r0.activeTab() === tab_r4.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](tab_r4.icon);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate(tab_r4.label));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 42)(1, "div", 43)(2, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "div", 44)(5, "div", 45)(6, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "div", 45)(11, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "div", 45)(16, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "span", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](20, "div", 45)(21, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](23, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](24);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](25, "div", 45)(26, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](28, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](29);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](30, "div", 45)(31, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](32);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](33, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](35, "div", 42)(36, "div", 43)(37, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](38);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](39, "div", 44)(40, "div", 45)(41, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](42);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](43, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](44);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](45, "div", 45)(46, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](48, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](50, "div", 45)(51, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](52);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](53, "span", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](54);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](55, "div", 45)(56, "span", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](57);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](58, "span", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](60, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.accountSummary"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.totalEquity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalEquity")), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.walletBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalWalletBalance")), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.availableBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalAvailableBalance")), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.marginBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalMarginBalance")), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.initialMargin"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalInitialMargin")), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.unrealizedPnL"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getPnlColorClass(ctx_r0.getAccountField("totalPerpUPL")));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" $", ctx_r0.formatCurrency(ctx_r0.getAccountField("totalPerpUPL")), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.quickStats"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.activePositions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.activePositions().length);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.activeOrders"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.activeOrders().length);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.nonZeroBalances"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.nonZeroBalances().length);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.lastUpdated"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](60, 24, ctx_r0.userInfo().timestamp, "short"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 41)(1, "span", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.failedToLoadAccount"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Conditional_1_Template, 61, 27)(2, TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Conditional_2_Template, 5, 1, "div", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.accountInfo() ? 1 : 2);
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_For_2_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 57)(1, "span", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "span", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const balance_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]().$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.unrealizedPnL"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getPnlColorClass(balance_r5.unrealisedPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.formatCurrency(balance_r5.unrealisedPnl, 8), " ");
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 52)(1, "div", 53)(2, "div", 54)(3, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "span", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div", 56)(8, "div", 57)(9, "span", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "span", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "div", 57)(14, "span", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "span", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "div", 57)(19, "span", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "span", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](22);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](23, TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_For_2_Conditional_23_Template, 5, 4, "div", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const balance_r5 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](balance_r5.coin);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(balance_r5.usdValue), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.walletBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.formatCurrency(balance_r5.walletBalance, 8));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.available"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.formatCurrency(balance_r5.availableToWithdraw, 8));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.equity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.formatCurrency(balance_r5.equity, 8));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.parseFloat(balance_r5.unrealisedPnl) !== 0 ? 23 : -1);
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeaterCreate"](1, TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_For_2_Template, 24, 9, "div", 52, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeater"](ctx_r0.nonZeroBalances());
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 51)(1, "div", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\uD83D\uDCB0");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noBalances"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noBalancesDesc"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_1_Template, 3, 0, "div", 50)(2, TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Conditional_2_Template, 7, 2, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.nonZeroBalances().length > 0 ? 1 : 2);
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_1_For_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "tr")(1, "td")(2, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "td")(5, "span", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const position_r6 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](position_r6.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getSideClass(ctx_r0.getPositionSide(position_r6)));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.getPositionSide(position_r6), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.formatCurrency(ctx_r0.getPositionSize(position_r6), 4));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(position_r6.entryPrice), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(position_r6.markPrice), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", position_r6.leverage, "x");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getPnlColorClass(ctx_r0.getPositionUnrealizedPnl(position_r6)));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" $", ctx_r0.formatCurrency(ctx_r0.getPositionUnrealizedPnl(position_r6)), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getPnlColorClass(ctx_r0.calculatePositionProfitPct(position_r6)));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx_r0.formatCurrency(ctx_r0.calculatePositionProfitPct(position_r6)), "% ");
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 62)(1, "table", 63)(2, "thead")(3, "tr")(4, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](20, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeaterCreate"](21, TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_1_For_22_Template, 19, 14, "tr", null, _forTrack2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("dashboard.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.side"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.size"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.entryPrice"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.markPrice"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.leverage"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.unrealizedPnL"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.pnlPercent"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeater"](ctx_r0.activePositions());
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 51)(1, "div", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\uD83D\uDCC8");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noPositions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noPositionsDesc"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_1_Template, 23, 8, "div", 62)(2, TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Conditional_2_Template, 7, 2, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activePositions().length > 0 ? 1 : 2);
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_1_For_20_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "tr")(1, "td")(2, "strong");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "td")(5, "span", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](9, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "td")(14, "span", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "td", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](18, "date");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const order_r7 = ctx.$implicit;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](order_r7.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getSideClass(order_r7.side));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", order_r7.side, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](order_r7.orderType);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.formatCurrency(order_r7.qty, 4));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(order_r7.price), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getOrderStatusClass(order_r7.orderStatus));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", order_r7.orderStatus, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](18, 11, order_r7.createdTime, "short"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 62)(1, "table", 63)(2, "thead")(3, "tr")(4, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeaterCreate"](19, TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_1_For_20_Template, 19, 14, "tr", null, _forTrack3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("dashboard.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.side"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.type"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.quantity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.price"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.status"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.created"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeater"](ctx_r0.activeOrders());
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 51)(1, "div", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "\uD83D\uDCCB");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noActiveOrders"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.noOrdersDesc"));
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](1, TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_1_Template, 21, 7, "div", 62)(2, TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Conditional_2_Template, 7, 2, "div", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activeOrders().length > 0 ? 1 : 2);
  }
}
function TradingPlatformInfoModalComponent_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "section", 22)(1, "div", 23)(2, "div", 24)(3, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](4, "\uD83D\uDCB0");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "div", 26)(6, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "div", 27)(11, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12, "\uD83D\uDCB5");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "div", 26)(14, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "div", 28)(19, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20, "\uD83D\uDCBC");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "div", 26)(22, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](24, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](26, "div", 29)(27, "div", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](28, "\uD83D\uDCC8");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](29, "div", 26)(30, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](32, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](34, "nav", 30)(35, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeaterCreate"](36, TradingPlatformInfoModalComponent_Conditional_24_For_37_Template, 5, 4, "ui-button", 32, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](38, "section", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](39, TradingPlatformInfoModalComponent_Conditional_24_Conditional_39_Template, 3, 1, "div", 34)(40, TradingPlatformInfoModalComponent_Conditional_24_Conditional_40_Template, 3, 1, "div", 35)(41, TradingPlatformInfoModalComponent_Conditional_24_Conditional_41_Template, 3, 1, "div", 36)(42, TradingPlatformInfoModalComponent_Conditional_24_Conditional_42_Template, 3, 1, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.totalEquity()), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.totalEquity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.availableBalance()), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.availableBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.walletBalance()), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.walletBalance"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("danger", ctx_r0.unrealizedPnl() < 0)("success", ctx_r0.unrealizedPnl() > 0);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassMap"](ctx_r0.getPnlColorClass(ctx_r0.unrealizedPnl()));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("$", ctx_r0.formatCurrency(ctx_r0.unrealizedPnl()), "");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx_r0.translate("modal.unrealizedPnL"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrepeater"](ctx_r0.tabs);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activeTab() === "overview" ? 39 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activeTab() === "balances" ? 40 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activeTab() === "positions" ? 41 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx_r0.activeTab() === "orders" ? 42 : -1);
  }
}
let TradingPlatformInfoModalComponent = /*#__PURE__*/(() => {
  class TradingPlatformInfoModalComponent {
    constructor(bybitUserService, bingxUserService) {
      this.bybitUserService = bybitUserService;
      this.bingxUserService = bingxUserService;
      this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_6__.Subject();
      // Input: Exchange credential to display information for
      this.credential = _angular_core__WEBPACK_IMPORTED_MODULE_5__.input.required();
      // Output: Event emitted when modal should be closed
      this.closeModal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.output)();
      // Component state signals
      this.userInfo = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(null);
      this.loading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(false);
      this.error = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(null);
      this.activeTab = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)('overview');
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_1__.TranslationService);
      // Tab configuration
      this.tabs = [{
        id: 'overview',
        label: 'modal.accountOverview',
        icon: '📊'
      }, {
        id: 'balances',
        label: 'modal.balances',
        icon: '💰'
      }, {
        id: 'positions',
        label: 'modal.positions',
        icon: '📈'
      }, {
        id: 'orders',
        label: 'modal.activeOrders',
        icon: '📋'
      }];
      // Computed values
      this.exchangeName = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => (0,_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.getExchangeName)(this.credential().exchange));
      this.exchangeLogo = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => (0,_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.getExchangeLogo)(this.credential().exchange));
      this.exchangeColor = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EXCHANGE_METADATA[this.credential().exchange]?.color);
      this.isTestnet = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => this.credential().environment === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET);
      this.environmentName = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => this.credential().environment === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET ? 'Testnet' : 'Mainnet');
      this.environmentColor = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ENVIRONMENT_METADATA[this.credential().environment]?.color);
      this.totalEquity = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return '0.00';
        const accountInfo = info.data.accountInfo;
        if ('error' in accountInfo) return '0.00';
        // Check if it's Bybit or BingX
        if ('totalEquity' in accountInfo) {
          // Bybit
          return accountInfo.totalEquity || '0.00';
        } else if ('balance' in accountInfo) {
          // BingX
          return accountInfo.balance.equity || '0.00';
        }
        return '0.00';
      });
      this.availableBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return '0.00';
        const accountInfo = info.data.accountInfo;
        if ('error' in accountInfo) return '0.00';
        // Check if it's Bybit or BingX
        if ('totalAvailableBalance' in accountInfo) {
          // Bybit
          return accountInfo.totalAvailableBalance || '0.00';
        } else if ('balance' in accountInfo) {
          // BingX
          return accountInfo.balance.availableMargin || '0.00';
        }
        return '0.00';
      });
      this.walletBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return '0.00';
        const accountInfo = info.data.accountInfo;
        if ('error' in accountInfo) return '0.00';
        // Check if it's Bybit or BingX
        if ('totalWalletBalance' in accountInfo) {
          // Bybit
          return accountInfo.totalWalletBalance || '0.00';
        } else if ('balance' in accountInfo) {
          // BingX
          return accountInfo.balance.balance || '0.00';
        }
        return '0.00';
      });
      this.unrealizedPnl = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return 0;
        const cred = this.credential();
        if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BYBIT) {
          return this.bybitUserService.calculateUnrealizedPnl(info);
        } else if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BINGX) {
          return this.bingxUserService.calculateUnrealizedPnl(info);
        }
        return 0;
      });
      this.nonZeroBalances = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info) return [];
        const cred = this.credential();
        if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BYBIT) {
          return this.bybitUserService.getNonZeroBalances(info);
        }
        // BingX doesn't have coin balances in the same way, return empty
        return [];
      });
      this.activePositions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info) return [];
        const cred = this.credential();
        if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BYBIT) {
          return this.bybitUserService.getActivePositions(info);
        } else if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BINGX) {
          return this.bingxUserService.getActivePositions(info);
        }
        return [];
      });
      this.activeOrders = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return [];
        // Bybit has activeOrders, BingX doesn't currently fetch orders
        const data = info.data;
        return data.activeOrders || [];
      });
      this.hasError = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info) return false;
        const accountInfo = info.data.accountInfo;
        return 'error' in accountInfo;
      });
      this.accountInfo = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const info = this.userInfo();
        if (!info || !info.success) return null;
        const accInfo = info.data.accountInfo;
        if ('error' in accInfo) return null;
        return accInfo;
      });
      /**
       * Handle keyboard events
       */
      this.handleKeyDown = event => {
        if (event.key === 'Escape') {
          this.close();
        }
      };
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    ngOnInit() {
      // Load user info when modal opens
      this.loadUserInfo();
      // Add keyboard event listener for ESC key
      document.addEventListener('keydown', this.handleKeyDown);
    }
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
      // Remove keyboard event listener
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    /**
     * Load user information from exchange
     * Supports Bybit and BingX exchanges
     */
    loadUserInfo() {
      const cred = this.credential();
      this.loading.set(true);
      this.error.set(null);
      if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BYBIT) {
        // Subscribe to Bybit service observables
        this.bybitUserService.userInfo$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.takeUntil)(this.destroy$)).subscribe(info => this.userInfo.set(info));
        this.bybitUserService.error$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.takeUntil)(this.destroy$)).subscribe(error => this.error.set(error));
        // Fetch Bybit user info
        this.bybitUserService.getUserInfo().subscribe({
          next: () => {
            this.loading.set(false);
          },
          error: err => {
            this.loading.set(false);
            console.error('Failed to load Bybit user info:', err);
          }
        });
      } else if (cred.exchange === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.ExchangeType.BINGX) {
        // Subscribe to BingX service observables
        this.bingxUserService.userInfo$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.takeUntil)(this.destroy$)).subscribe(info => this.userInfo.set(info));
        this.bingxUserService.error$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.takeUntil)(this.destroy$)).subscribe(error => this.error.set(error));
        // Fetch BingX user info (uses active credentials from backend)
        this.bingxUserService.getUserInfo().subscribe({
          next: () => {
            this.loading.set(false);
          },
          error: err => {
            this.loading.set(false);
            console.error('Failed to load BingX user info:', err);
          }
        });
      } else {
        this.error.set(`Exchange ${cred.exchange} is not yet supported`);
        this.loading.set(false);
      }
    }
    /**
     * Refresh user information
     */
    refreshUserInfo() {
      this.loadUserInfo();
    }
    /**
     * Change active tab
     */
    setActiveTab(tabId) {
      this.activeTab.set(tabId);
    }
    /**
     * Close modal
     */
    close() {
      this.closeModal.emit();
    }
    /**
     * Handle overlay click (close modal)
     */
    handleOverlayClick() {
      this.close();
    }
    /**
     * Stop event propagation (prevent closing when clicking modal content)
     */
    handleContentClick(event) {
      event.stopPropagation();
    }
    /**
     * Parse float helper for templates
     */
    parseFloat(value) {
      return parseFloat(value);
    }
    /**
     * Format large numbers with proper units (K, M, B)
     */
    formatNumber(value) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '0';
      const absNum = Math.abs(num);
      if (absNum >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
      } else if (absNum >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (absNum >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      } else {
        return num.toFixed(2);
      }
    }
    /**
     * Format currency with proper decimals
     */
    formatCurrency(value, decimals = 2) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '0.00';
      return num.toFixed(decimals);
    }
    /**
     * Format percentage
     */
    formatPercentage(value) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '0.00%';
      return (num * 100).toFixed(2) + '%';
    }
    /**
     * Get position PnL color class
     */
    getPnlColorClass(pnl) {
      const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
      if (isNaN(num) || num === 0) return 'text-muted';
      return num > 0 ? 'text-success' : 'text-danger';
    }
    /**
     * Get order status badge class
     */
    getOrderStatusClass(status) {
      const statusClasses = {
        'Filled': 'badge-success',
        'PartiallyFilled': 'badge-info',
        'Cancelled': 'badge-secondary',
        'Rejected': 'badge-danger',
        'New': 'badge-primary',
        'PendingCancel': 'badge-warning'
      };
      return statusClasses[status] || 'badge-secondary';
    }
    /**
     * Get side badge class (Buy/Sell)
     */
    getSideClass(side) {
      return side === 'Buy' ? 'badge-success' : 'badge-danger';
    }
    /**
     * Calculate position profit percentage
     */
    calculatePositionProfitPct(position) {
      // Bybit position
      if ('side' in position && 'entryPrice' in position && 'markPrice' in position) {
        const entryPrice = parseFloat(position.entryPrice);
        const markPrice = parseFloat(position.markPrice);
        if (isNaN(entryPrice) || isNaN(markPrice) || entryPrice === 0) {
          return 0;
        }
        const pct = (markPrice - entryPrice) / entryPrice * 100;
        return position.side === 'Buy' ? pct : -pct;
      }
      // BingX position
      if ('positionSide' in position && 'entryPrice' in position && 'markPrice' in position) {
        const entryPrice = parseFloat(position.entryPrice);
        const markPrice = parseFloat(position.markPrice);
        if (isNaN(entryPrice) || isNaN(markPrice) || entryPrice === 0) {
          return 0;
        }
        const pct = (markPrice - entryPrice) / entryPrice * 100;
        return position.positionSide === 'LONG' ? pct : -pct;
      }
      return 0;
    }
    /**
     * Get position side for display (handles both Bybit and BingX)
     */
    getPositionSide(position) {
      if ('side' in position) {
        return position.side; // Bybit: 'Buy' or 'Sell'
      }
      if ('positionSide' in position) {
        return position.positionSide; // BingX: 'LONG' or 'SHORT'
      }
      return '';
    }
    /**
     * Get position size for display (handles both Bybit and BingX)
     */
    getPositionSize(position) {
      if ('size' in position) {
        return position.size; // Bybit
      }
      if ('positionAmt' in position) {
        return position.positionAmt; // BingX
      }
      return '0';
    }
    /**
     * Get position unrealized PnL (handles both Bybit and BingX)
     */
    getPositionUnrealizedPnl(position) {
      if ('unrealisedPnl' in position) {
        return position.unrealisedPnl; // Bybit
      }
      if ('unrealizedProfit' in position) {
        return position.unrealizedProfit; // BingX
      }
      return '0';
    }
    /**
     * Get account field value (handles both Bybit and BingX)
     */
    getAccountField(field) {
      const info = this.accountInfo();
      if (!info) return '0.00';
      // Bybit fields
      if (field === 'totalEquity' && 'totalEquity' in info) {
        return info.totalEquity || '0.00';
      }
      if (field === 'totalWalletBalance' && 'totalWalletBalance' in info) {
        return info.totalWalletBalance || '0.00';
      }
      if (field === 'totalAvailableBalance' && 'totalAvailableBalance' in info) {
        return info.totalAvailableBalance || '0.00';
      }
      if (field === 'totalMarginBalance' && 'totalMarginBalance' in info) {
        return info.totalMarginBalance || '0.00';
      }
      if (field === 'totalInitialMargin' && 'totalInitialMargin' in info) {
        return info.totalInitialMargin || '0.00';
      }
      if (field === 'totalPerpUPL' && 'totalPerpUPL' in info) {
        return info.totalPerpUPL || '0.00';
      }
      // BingX fields
      if ('balance' in info) {
        const balance = info.balance;
        if (field === 'totalEquity') return balance.equity || '0.00';
        if (field === 'totalWalletBalance') return balance.balance || '0.00';
        if (field === 'totalAvailableBalance') return balance.availableMargin || '0.00';
        if (field === 'totalMarginBalance') return balance.usedMargin || '0.00';
        if (field === 'totalInitialMargin') return balance.usedMargin || '0.00';
        if (field === 'totalPerpUPL') return balance.unrealizedProfit || '0.00';
      }
      return '0.00';
    }
    /**
     * Clear error message
     */
    clearError() {
      this.error.set(null);
    }
    /**
     * Retry loading after error
     */
    retryLoad() {
      this.clearError();
      this.loadUserInfo();
    }
    static {
      this.ɵfac = function TradingPlatformInfoModalComponent_Factory(t) {
        return new (t || TradingPlatformInfoModalComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_bybit_user_service__WEBPACK_IMPORTED_MODULE_3__.BybitUserService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_bingx_user_service__WEBPACK_IMPORTED_MODULE_4__.BingXUserService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
        type: TradingPlatformInfoModalComponent,
        selectors: [["app-trading-platform-info-modal"]],
        inputs: {
          credential: [1, "credential"]
        },
        outputs: {
          closeModal: "closeModal"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵStandaloneFeature"]],
        decls: 25,
        vars: 19,
        consts: [[1, "modal-overlay", 3, "click"], [1, "modal-content", 3, "click"], [1, "modal-header"], [1, "header-info"], [1, "exchange-logo"], [1, "logo-text"], [1, "header-title"], [1, "header-badges"], [1, "env-badge"], [1, "label-badge"], [1, "header-actions"], ["variant", "ghost", "size", "small", "className", "refresh-btn", 3, "clicked", "disabled", "title"], [1, "icon"], ["variant", "ghost", "size", "small", "className", "close-btn", 3, "clicked", "title"], [1, "modal-body"], [1, "loading-container"], [1, "error-container"], [1, "spinner-large"], [1, "error-icon"], [1, "error-message"], ["variant", "primary", "size", "medium", 3, "clicked"], [1, "btn-icon"], [1, "stats-section"], [1, "stats-grid"], [1, "stat-card", "primary"], [1, "stat-icon"], [1, "stat-content"], [1, "stat-card", "success"], [1, "stat-card", "info"], [1, "stat-card"], [1, "tabs-navigation"], [1, "tabs-list"], ["variant", "ghost", "size", "medium", "className", "tab-button", 3, "active"], [1, "tab-content"], [1, "overview-container"], [1, "balances-container"], [1, "positions-container"], [1, "orders-container"], ["variant", "ghost", "size", "medium", "className", "tab-button", 3, "clicked"], [1, "tab-icon"], [1, "tab-label"], [1, "error-message-inline"], [1, "info-card"], [1, "card-header"], [1, "card-body"], [1, "info-row"], [1, "info-label"], [1, "info-value"], [1, "info-value", "text-success"], [1, "info-value", "text-muted"], [1, "balances-grid"], [1, "empty-state"], [1, "balance-card"], [1, "balance-header"], [1, "coin-info"], [1, "usd-value"], [1, "balance-body"], [1, "balance-row"], [1, "label"], [1, "value"], [1, "value", "text-success"], [1, "empty-icon"], [1, "table-responsive"], [1, "data-table"], [1, "badge"], [1, "text-muted"]],
        template: function TradingPlatformInfoModalComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function TradingPlatformInfoModalComponent_Template_div_click_0_listener() {
              return ctx.handleOverlayClick();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](1, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function TradingPlatformInfoModalComponent_Template_div_click_1_listener($event) {
              return ctx.handleContentClick($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](2, "header", 2)(3, "div", 3)(4, "div", 4)(5, "span", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "div", 6)(8, "h2");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](9);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "div", 7)(11, "span", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](13, TradingPlatformInfoModalComponent_Conditional_13_Template, 2, 1, "span", 9);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](14, "div", 10)(15, "ui-button", 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function TradingPlatformInfoModalComponent_Template_ui_button_clicked_15_listener() {
              return ctx.refreshUserInfo();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](17, "\uD83D\uDD04");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](18, "ui-button", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function TradingPlatformInfoModalComponent_Template_ui_button_clicked_18_listener() {
              return ctx.close();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](19, "span", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](20, "\u2715");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "div", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](22, TradingPlatformInfoModalComponent_Conditional_22_Template, 4, 1, "div", 15)(23, TradingPlatformInfoModalComponent_Conditional_23_Template, 11, 3, "div", 16)(24, TradingPlatformInfoModalComponent_Conditional_24_Template, 43, 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵstyleProp"]("background-color", ctx.exchangeColor());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](ctx.exchangeName().substring(0, 2));
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate2"]("", ctx.exchangeName(), " ", ctx.translate("modal.account"), "");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵstyleProp"]("background-color", ctx.environmentColor());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("testnet", ctx.isTestnet());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx.environmentName(), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx.credential().label ? 13 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("disabled", ctx.loading())("title", ctx.translate("modal.refreshData"));
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("spinning", ctx.loading());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("title", ctx.translate("button.close"));
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx.loading() && !ctx.userInfo() ? 22 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx.error() && !ctx.userInfo() ? 23 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵconditional"](ctx.userInfo() && !ctx.loading() ? 24 : -1);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_8__.DatePipe, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_2__.ButtonComponent],
        styles: ["\n\n\n\n\n\n.modal-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--background-overlay);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: var(--z-modal-backdrop);\n  padding: var(--spacing-lg);\n  animation: _ngcontent-%COMP%_overlayFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@keyframes _ngcontent-%COMP%_overlayFadeIn {\n  from {\n    opacity: 0;\n    backdrop-filter: blur(0);\n    -webkit-backdrop-filter: blur(0);\n  }\n  to {\n    opacity: 1;\n    backdrop-filter: blur(8px);\n    -webkit-backdrop-filter: blur(8px);\n  }\n}\n.modal-content[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border-radius: var(--border-radius-2xl);\n  box-shadow: var(--shadow-overlay);\n  width: 100%;\n  max-width: 1200px;\n  max-height: 90vh;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  border: 1px solid var(--border-color);\n  will-change: transform, opacity;\n}\n\n@keyframes _ngcontent-%COMP%_modalSlideUp {\n  from {\n    transform: translateY(20px) scale(0.96);\n    opacity: 0;\n  }\n  to {\n    transform: translateY(0) scale(1);\n    opacity: 1;\n  }\n}\n.modal-header[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);\n  color: var(--text-inverse);\n  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: var(--spacing-md);\n  flex-shrink: 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  position: relative;\n}\n.modal-header[_ngcontent-%COMP%]::before {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px);\n  pointer-events: none;\n}\n\n.header-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  flex: 1;\n  min-width: 0;\n}\n\n.exchange-logo[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.2);\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  flex-shrink: 0;\n}\n\n.logo-text[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 700;\n  color: white;\n  text-transform: uppercase;\n}\n\n.header-title[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.header-title[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.5rem;\n  font-weight: 700;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.header-badges[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex-wrap: wrap;\n}\n\n.env-badge[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.75rem;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: rgba(255, 255, 255, 0.25);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.env-badge.testnet[_ngcontent-%COMP%] {\n  background: rgba(255, 152, 0, 0.3);\n  border-color: rgba(255, 152, 0, 0.5);\n}\n\n.label-badge[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.75rem;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  font-weight: 500;\n  background: rgba(255, 255, 255, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex-shrink: 0;\n}\n\n.btn-icon-only[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  color: white;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s ease;\n  font-size: 1.25rem;\n  padding: 0;\n}\n.btn-icon-only[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: rgba(255, 255, 255, 0.3);\n  transform: scale(1.05);\n}\n.btn-icon-only[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-icon-only[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%] {\n  display: block;\n  line-height: 1;\n}\n.btn-icon-only[_ngcontent-%COMP%]   .icon.spinning[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n.modal-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 2rem;\n}\n\n.loading-container[_ngcontent-%COMP%], \n.error-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  text-align: center;\n  min-height: 300px;\n}\n\n.spinner-large[_ngcontent-%COMP%] {\n  width: 60px;\n  height: 60px;\n  border: 4px solid var(--border-color, rgba(0, 0, 0, 0.1));\n  border-top-color: var(--primary-color, #667eea);\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n  margin-bottom: 1rem;\n}\n\n.error-container[_ngcontent-%COMP%]   .error-icon[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  margin-bottom: 1rem;\n}\n.error-container[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  color: var(--text-primary, #333);\n  font-size: 1.5rem;\n}\n.error-container[_ngcontent-%COMP%]   .error-message[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #666);\n  margin: 0 0 1.5rem 0;\n  max-width: 400px;\n}\n.error-container[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n}\n\n.error-message-inline[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  padding: 1.5rem;\n  background: var(--error-background, #fee);\n  border: 1px solid var(--error-border, #fcc);\n  border-radius: 8px;\n  color: var(--error-text, #c33);\n}\n.error-message-inline[_ngcontent-%COMP%]   .error-icon[_ngcontent-%COMP%] {\n  font-size: 2rem;\n}\n.error-message-inline[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n}\n\n.stats-section[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n}\n\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n.stat-card[_ngcontent-%COMP%] {\n  background: var(--card-background, white);\n  border-radius: 12px;\n  padding: 1.5rem;\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.stat-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);\n}\n.stat-card.primary[_ngcontent-%COMP%] {\n  border-left: 4px solid #667eea;\n}\n.stat-card.success[_ngcontent-%COMP%] {\n  border-left: 4px solid #10b981;\n}\n.stat-card.info[_ngcontent-%COMP%] {\n  border-left: 4px solid #3b82f6;\n}\n.stat-card.danger[_ngcontent-%COMP%] {\n  border-left: 4px solid #ef4444;\n}\n\n.stat-icon[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  flex-shrink: 0;\n}\n\n.stat-content[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.stat-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.25rem 0;\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: var(--text-primary, #333);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.stat-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.875rem;\n  color: var(--text-secondary, #666);\n}\n\n.tabs-navigation[_ngcontent-%COMP%] {\n  background: var(--card-background, white);\n  border-radius: 12px;\n  margin-bottom: 1rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n  overflow-x: auto;\n}\n\n.tabs-list[_ngcontent-%COMP%] {\n  display: flex;\n  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));\n}\n\n.tab-button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  padding: 1rem 1.5rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  color: var(--text-secondary, #666);\n  font-weight: 500;\n  white-space: nowrap;\n  position: relative;\n}\n.tab-button[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, rgba(0, 0, 0, 0.03));\n  color: var(--text-primary, #333);\n}\n.tab-button.active[_ngcontent-%COMP%] {\n  color: var(--primary-color, #667eea);\n  font-weight: 600;\n}\n.tab-button.active[_ngcontent-%COMP%]::after {\n  content: \"\";\n  position: absolute;\n  bottom: -1px;\n  left: 0;\n  right: 0;\n  height: 2px;\n  background: var(--primary-color, #667eea);\n}\n\n.tab-icon[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n}\n\n.tab-content[_ngcontent-%COMP%] {\n  background: var(--card-background, white);\n  border-radius: 12px;\n  padding: 2rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n  min-height: 300px;\n}\n\n.overview-container[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\n.info-card[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  padding: 1.5rem;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n}\n.info-card[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));\n}\n.info-card[_ngcontent-%COMP%]   .card-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.125rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n.info-card[_ngcontent-%COMP%]   .card-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n\n.info-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n}\n.info-row[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n\n.info-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--text-secondary, #666);\n  font-weight: 500;\n}\n\n.info-value[_ngcontent-%COMP%] {\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n\n.balances-container[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.balances-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1rem;\n}\n\n.balance-card[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  padding: 1.25rem;\n  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n.balance-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.balance-card[_ngcontent-%COMP%]   .balance-header[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));\n}\n.balance-card[_ngcontent-%COMP%]   .balance-header[_ngcontent-%COMP%]   .coin-info[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.balance-card[_ngcontent-%COMP%]   .balance-header[_ngcontent-%COMP%]   .coin-info[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 700;\n  color: var(--text-primary, #333);\n}\n.balance-card[_ngcontent-%COMP%]   .balance-header[_ngcontent-%COMP%]   .coin-info[_ngcontent-%COMP%]   .usd-value[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 600;\n  color: var(--primary-color, #667eea);\n}\n.balance-card[_ngcontent-%COMP%]   .balance-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n.balance-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 0.875rem;\n}\n.balance-row[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #666);\n}\n.balance-row[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n\n.positions-container[_ngcontent-%COMP%], \n.orders-container[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.table-responsive[_ngcontent-%COMP%] {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n}\n.data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  background: var(--background-color, #f8f9fa);\n  border-bottom: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));\n}\n.data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  text-align: left;\n  font-weight: 600;\n  color: var(--text-secondary, #666);\n  white-space: nowrap;\n  text-transform: uppercase;\n  font-size: 0.75rem;\n  letter-spacing: 0.5px;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));\n  transition: background-color 0.2s ease;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: var(--hover-background, rgba(0, 0, 0, 0.02));\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 1rem;\n  color: var(--text-primary, #333);\n}\n.data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  text-align: center;\n}\n.empty-state[_ngcontent-%COMP%]   .empty-icon[_ngcontent-%COMP%] {\n  font-size: 4rem;\n  margin-bottom: 1rem;\n  opacity: 0.5;\n}\n.empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.25rem;\n  font-weight: 600;\n  color: var(--text-primary, #333);\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text-secondary, #666);\n}\n\n.badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.25rem 0.75rem;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.badge.badge-success[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.15);\n  color: #059669;\n}\n.badge.badge-danger[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.15);\n  color: #dc2626;\n}\n.badge.badge-info[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.15);\n  color: #2563eb;\n}\n.badge.badge-warning[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.15);\n  color: #d97706;\n}\n.badge.badge-primary[_ngcontent-%COMP%] {\n  background: rgba(102, 126, 234, 0.15);\n  color: #667eea;\n}\n.badge.badge-secondary[_ngcontent-%COMP%] {\n  background: rgba(107, 114, 128, 0.15);\n  color: #4b5563;\n}\n\n.text-success[_ngcontent-%COMP%] {\n  color: #10b981 !important;\n}\n\n.text-danger[_ngcontent-%COMP%] {\n  color: #ef4444 !important;\n}\n\n.text-muted[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #666) !important;\n}\n\n.btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  border-radius: 8px;\n  font-weight: 600;\n  font-size: 0.9375rem;\n  cursor: pointer;\n  border: none;\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  transition: all 0.2s ease;\n}\n.btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn.btn-primary[_ngcontent-%COMP%] {\n  background: var(--primary-color, #667eea);\n  color: white;\n}\n.btn.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: var(--primary-hover, #5568d3);\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);\n}\n.btn[_ngcontent-%COMP%]   .btn-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n\n@media (max-width: 768px) {\n  .modal-overlay[_ngcontent-%COMP%] {\n    padding: 0;\n    align-items: flex-end;\n  }\n  .modal-content[_ngcontent-%COMP%] {\n    width: 100%;\n    max-width: 100%;\n    max-height: 95vh;\n    height: auto;\n    border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;\n    animation: modalSlideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  }\n  @keyframes modalSlideUpMobile {\n    from {\n      opacity: 0;\n      transform: translateY(100%);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n  .modal-header[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);\n    flex-wrap: wrap;\n    position: relative;\n  }\n  .modal-header[_ngcontent-%COMP%]::after {\n    content: \"\";\n    position: absolute;\n    top: var(--spacing-sm);\n    left: 50%;\n    transform: translateX(-50%);\n    width: 40px;\n    height: 4px;\n    background: rgba(255, 255, 255, 0.4);\n    border-radius: var(--border-radius-full);\n    z-index: 2;\n  }\n  .modal-header[_ngcontent-%COMP%]   .header-title[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n    font-size: var(--font-size-xl);\n    margin-top: var(--spacing-sm);\n  }\n  .modal-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg);\n  }\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .overview-container[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .balances-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .tab-content[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg);\n  }\n  .tabs-list[_ngcontent-%COMP%] {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n  .data-table[_ngcontent-%COMP%] {\n    font-size: var(--font-size-sm);\n  }\n  .data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: var(--spacing-sm);\n  }\n}\n@media (max-width: 480px) {\n  .modal-header[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n  .exchange-logo[_ngcontent-%COMP%] {\n    width: 40px;\n    height: 40px;\n  }\n  .stat-card[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg);\n  }\n  .stat-card[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n    font-size: 1.5rem;\n  }\n  .stat-card[_ngcontent-%COMP%]   .stat-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n    font-size: 1.5rem;\n  }\n  .modal-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n  .tab-content[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n}\n[data-theme=dark][_ngcontent-%COMP%]   .modal-content[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .modal-content[_ngcontent-%COMP%] {\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .modal-header[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .modal-header[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%], \n[data-theme=dark][_ngcontent-%COMP%]   .info-card[_ngcontent-%COMP%], \n[data-theme=dark][_ngcontent-%COMP%]   .balance-card[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .info-card[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .balance-card[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border-color: var(--border-color);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:hover, \n[data-theme=dark][_ngcontent-%COMP%]   .info-card[_ngcontent-%COMP%]:hover, \n[data-theme=dark][_ngcontent-%COMP%]   .balance-card[_ngcontent-%COMP%]:hover, \n.dark-theme[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:hover, \n.dark-theme[_ngcontent-%COMP%]   .info-card[_ngcontent-%COMP%]:hover, \n.dark-theme[_ngcontent-%COMP%]   .balance-card[_ngcontent-%COMP%]:hover {\n  background: var(--background-tertiary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .tabs-navigation[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .tabs-navigation[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border-color: var(--border-color);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .tab-content[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .tab-content[_ngcontent-%COMP%] {\n  background: var(--background-secondary);\n  border-color: var(--border-color);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .data-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  background: var(--background-tertiary);\n}\n[data-theme=dark][_ngcontent-%COMP%]   .data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover, \n.dark-theme[_ngcontent-%COMP%]   .data-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: var(--background-tertiary);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .modal-overlay[_ngcontent-%COMP%], \n   .modal-content[_ngcontent-%COMP%], \n   .stat-card[_ngcontent-%COMP%], \n   .balance-card[_ngcontent-%COMP%], \n   .tab-button[_ngcontent-%COMP%] {\n    animation: none;\n    transition: none;\n  }\n}\n@media print {\n  .modal-overlay[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nLXBsYXRmb3JtLWluZm8tbW9kYWwvdHJhZGluZy1wbGF0Zm9ybS1pbmZvLW1vZGFsLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0VBQUE7QUFVQTtFQUNFLGVBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0VBQ0EscUNBQUE7RUFDQSwwQkFBQTtFQUNBLGtDQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSxnQ0FBQTtFQUNBLDBCQUFBO0VBQ0EsMkRBQUE7QUFKRjs7QUFPQTtFQUNFO0lBQ0UsVUFBQTtJQUNBLHdCQUFBO0lBQ0EsZ0NBQUE7RUFKRjtFQU1BO0lBQ0UsVUFBQTtJQUNBLDBCQUFBO0lBQ0Esa0NBQUE7RUFKRjtBQUNGO0FBT0E7RUFDRSxxQ0FBQTtFQUNBLHVDQUFBO0VBQ0EsaUNBQUE7RUFDQSxXQUFBO0VBQ0EsaUJBQUE7RUFDQSxnQkFBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0EseURBQUE7RUFDQSxxQ0FBQTtFQUNBLCtCQUFBO0FBTEY7O0FBUUE7RUFDRTtJQUNFLHVDQUFBO0lBQ0EsVUFBQTtFQUxGO0VBT0E7SUFDRSxpQ0FBQTtJQUNBLFVBQUE7RUFMRjtBQUNGO0FBWUE7RUFDRSxzRkFBQTtFQUNBLDBCQUFBO0VBQ0EsOERBQUE7RUFDQSxhQUFBO0VBQ0EsOEJBQUE7RUFDQSxtQkFBQTtFQUNBLHNCQUFBO0VBQ0EsY0FBQTtFQUNBLGlEQUFBO0VBQ0Esa0JBQUE7QUFWRjtBQWFFO0VBQ0UsV0FBQTtFQUNBLGtCQUFBO0VBQ0EsTUFBQTtFQUNBLE9BQUE7RUFDQSxRQUFBO0VBQ0EsU0FBQTtFQUNBLDJJQUFBO0VBT0Esb0JBQUE7QUFqQko7O0FBcUJBO0VBQ0UsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsU0FBQTtFQUNBLE9BQUE7RUFDQSxZQUFB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QTdJSjtBQStJSTs7Ozs7O0VBQ0Usc0NBQUE7QUF4SU47QUE0SUU7O0VBQ0UsdUNBQUE7RUFDQSxpQ0FBQTtBQXpJSjtBQTRJRTs7RUFDRSx1Q0FBQTtFQUNBLGlDQUFBO0FBeklKO0FBNklJOztFQUNFLHNDQUFBO0FBMUlOO0FBNklJOztFQUNFLHNDQUFBO0FBMUlOOztBQW1KQTtFQUNFOzs7OztJQUtFLGVBQUE7SUFDQSxnQkFBQTtFQWhKRjtBQUNGO0FBdUpBO0VBQ0U7SUFDRSxhQUFBO0VBckpGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRyYWRpbmcgUGxhdGZvcm0gSW5mbyBNb2RhbCBTdHlsZXNcbiAqIFVuaWZpZWQgd2l0aCB0aGUgZ2xvYmFsIG1vZGFsIGRlc2lnbiBzeXN0ZW1cbiAqIFVzZXMgQ1NTIHZhcmlhYmxlcyBmb3IgZnVsbCB0aGVtZSBzdXBwb3J0XG4gKi9cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTW9kYWwgT3ZlcmxheSBhbmQgQ29udGFpbmVyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5tb2RhbC1vdmVybGF5IHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtb3ZlcmxheSk7XG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgei1pbmRleDogdmFyKC0tei1tb2RhbC1iYWNrZHJvcCk7XG4gIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbGcpO1xuICBhbmltYXRpb246IG92ZXJsYXlGYWRlSW4gMC4yNXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbn1cblxuQGtleWZyYW1lcyBvdmVybGF5RmFkZUluIHtcbiAgZnJvbSB7XG4gICAgb3BhY2l0eTogMDtcbiAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMCk7XG4gICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoMCk7XG4gIH1cbiAgdG8ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDhweCk7XG4gICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoOHB4KTtcbiAgfVxufVxuXG4ubW9kYWwtY29udGVudCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtMnhsKTtcbiAgYm94LXNoYWRvdzogdmFyKC0tc2hhZG93LW92ZXJsYXkpO1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiAxMjAwcHg7XG4gIG1heC1oZWlnaHQ6IDkwdmg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGFuaW1hdGlvbjogbW9kYWxTbGlkZVVwIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybSwgb3BhY2l0eTtcbn1cblxuQGtleWZyYW1lcyBtb2RhbFNsaWRlVXAge1xuICBmcm9tIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjBweCkgc2NhbGUoMC45Nik7XG4gICAgb3BhY2l0eTogMDtcbiAgfVxuICB0byB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApIHNjYWxlKDEpO1xuICAgIG9wYWNpdHk6IDE7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTW9kYWwgSGVhZGVyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5tb2RhbC1oZWFkZXIge1xuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1wcmltYXJ5LWNvbG9yKSAwJSwgdmFyKC0tcHJpbWFyeS1kYXJrKSAxMDAlKTtcbiAgY29sb3I6IHZhcigtLXRleHQtaW52ZXJzZSk7XG4gIHBhZGRpbmc6IHZhcigtLXNwYWNpbmcteGwpIHZhcigtLXNwYWNpbmcteGwpIHZhcigtLXNwYWNpbmctbGcpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogdmFyKC0tc3BhY2luZy1tZCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgLy8gU3VidGxlIHBhdHRlcm4gb3ZlcmxheSBmb3IgdmlzdWFsIGRlcHRoXG4gICY6OmJlZm9yZSB7XG4gICAgY29udGVudDogJyc7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICBiYWNrZ3JvdW5kOiByZXBlYXRpbmctbGluZWFyLWdyYWRpZW50KFxuICAgICAgNDVkZWcsXG4gICAgICB0cmFuc3BhcmVudCxcbiAgICAgIHRyYW5zcGFyZW50IDEwcHgsXG4gICAgICByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIDEwcHgsXG4gICAgICByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIDIwcHhcbiAgICApO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG59XG5cbi5oZWFkZXItaW5mbyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMXJlbTtcbiAgZmxleDogMTtcbiAgbWluLXdpZHRoOiAwO1xufVxuXG4uZXhjaGFuZ2UtbG9nbyB7XG4gIHdpZHRoOiA0OHB4O1xuICBoZWlnaHQ6IDQ4cHg7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gIGJvcmRlcjogMnB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG5cbi5sb2dvLXRleHQge1xuICBmb250LXNpemU6IDEuMjVyZW07XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbn1cblxuLmhlYWRlci10aXRsZSB7XG4gIGZsZXg6IDE7XG4gIG1pbi13aWR0aDogMDtcblxuICBoMiB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIH1cbn1cblxuLmhlYWRlci1iYWRnZXMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDAuNXJlbTtcbiAgZmxleC13cmFwOiB3cmFwO1xufVxuXG4uZW52LWJhZGdlIHtcbiAgcGFkZGluZzogMC4yNXJlbSAwLjc1cmVtO1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xuXG4gICYudGVzdG5ldCB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDE1MiwgMCwgMC4zKTtcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAxNTIsIDAsIDAuNSk7XG4gIH1cbn1cblxuLmxhYmVsLWJhZGdlIHtcbiAgcGFkZGluZzogMC4yNXJlbSAwLjc1cmVtO1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xufVxuXG4uaGVhZGVyLWFjdGlvbnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDAuNXJlbTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG5cbi5idG4taWNvbi1vbmx5IHtcbiAgd2lkdGg6IDQwcHg7XG4gIGhlaWdodDogNDBweDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKTtcbiAgY29sb3I6IHdoaXRlO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICBmb250LXNpemU6IDEuMjVyZW07XG4gIHBhZGRpbmc6IDA7XG5cbiAgJjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wNSk7XG4gIH1cblxuICAmOmRpc2FibGVkIHtcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgfVxuXG4gIC5pY29uIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBsaW5lLWhlaWdodDogMTtcblxuICAgICYuc3Bpbm5pbmcge1xuICAgICAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcbiAgICB9XG4gIH1cbn1cblxuQGtleWZyYW1lcyBzcGluIHtcbiAgZnJvbSB7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG4gIH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTW9kYWwgQm9keVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4ubW9kYWwtYm9keSB7XG4gIGZsZXg6IDE7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIHBhZGRpbmc6IDJyZW07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExvYWRpbmcgYW5kIEVycm9yIFN0YXRlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4ubG9hZGluZy1jb250YWluZXIsXG4uZXJyb3ItY29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHBhZGRpbmc6IDNyZW07XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgbWluLWhlaWdodDogMzAwcHg7XG59XG5cbi5zcGlubmVyLWxhcmdlIHtcbiAgd2lkdGg6IDYwcHg7XG4gIGhlaWdodDogNjBweDtcbiAgYm9yZGVyOiA0cHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMSkpO1xuICBib3JkZXItdG9wLWNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMC44cyBsaW5lYXIgaW5maW5pdGU7XG4gIG1hcmdpbi1ib3R0b206IDFyZW07XG59XG5cbi5lcnJvci1jb250YWluZXIge1xuICAuZXJyb3ItaWNvbiB7XG4gICAgZm9udC1zaXplOiA0cmVtO1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cblxuICBoMyB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgIzMzMyk7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gIH1cblxuICAuZXJyb3ItbWVzc2FnZSB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgICBtYXJnaW46IDAgMCAxLjVyZW0gMDtcbiAgICBtYXgtd2lkdGg6IDQwMHB4O1xuICB9XG5cbiAgLmJ0biB7XG4gICAgbWFyZ2luLXRvcDogMXJlbTtcbiAgfVxufVxuXG4uZXJyb3ItbWVzc2FnZS1pbmxpbmUge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDFyZW07XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZXJyb3ItYmFja2dyb3VuZCwgI2ZlZSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWVycm9yLWJvcmRlciwgI2ZjYyk7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgY29sb3I6IHZhcigtLWVycm9yLXRleHQsICNjMzMpO1xuXG4gIC5lcnJvci1pY29uIHtcbiAgICBmb250LXNpemU6IDJyZW07XG4gIH1cblxuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZmxleDogMTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTdGF0cyBTZWN0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi5zdGF0cy1zZWN0aW9uIHtcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcbn1cblxuLnN0YXRzLWdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI1MHB4LCAxZnIpKTtcbiAgZ2FwOiAxcmVtO1xufVxuXG4uc3RhdC1jYXJkIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIHBhZGRpbmc6IDEuNXJlbTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAxcmVtO1xuICBib3gtc2hhZG93OiAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjA4KTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMDUpKTtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2U7XG5cbiAgJjpob3ZlciB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjEyKTtcbiAgfVxuXG4gICYucHJpbWFyeSB7XG4gICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCAjNjY3ZWVhO1xuICB9XG5cbiAgJi5zdWNjZXNzIHtcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkICMxMGI5ODE7XG4gIH1cblxuICAmLmluZm8ge1xuICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgIzNiODJmNjtcbiAgfVxuXG4gICYuZGFuZ2VyIHtcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkICNlZjQ0NDQ7XG4gIH1cbn1cblxuLnN0YXQtaWNvbiB7XG4gIGZvbnQtc2l6ZTogMnJlbTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG5cbi5zdGF0LWNvbnRlbnQge1xuICBmbGV4OiAxO1xuICBtaW4td2lkdGg6IDA7XG5cbiAgaDMge1xuICAgIG1hcmdpbjogMCAwIDAuMjVyZW0gMDtcbiAgICBmb250LXNpemU6IDEuNzVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIH1cblxuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gICAgZm9udC1zaXplOiAwLjg3NXJlbTtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICM2NjYpO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRhYnMgTmF2aWdhdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4udGFicy1uYXZpZ2F0aW9uIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tY2FyZC1iYWNrZ3JvdW5kLCB3aGl0ZSk7XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIGJveC1zaGFkb3c6IDAgMnB4IDhweCByZ2JhKDAsIDAsIDAsIDAuMDgpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xuICBvdmVyZmxvdy14OiBhdXRvO1xufVxuXG4udGFicy1saXN0IHtcbiAgZGlzcGxheTogZmxleDtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgcmdiYSgwLCAwLCAwLCAwLjEpKTtcbn1cblxuLnRhYi1idXR0b24ge1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiBub25lO1xuICBwYWRkaW5nOiAxcmVtIDEuNXJlbTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjVyZW07XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWJhY2tncm91bmQsIHJnYmEoMCwgMCwgMCwgMC4wMykpO1xuICAgIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xuICB9XG5cbiAgJi5hY3RpdmUge1xuICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuXG4gICAgJjo6YWZ0ZXIge1xuICAgICAgY29udGVudDogJyc7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBib3R0b206IC0xcHg7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBoZWlnaHQ6IDJweDtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktY29sb3IsICM2NjdlZWEpO1xuICAgIH1cbiAgfVxufVxuXG4udGFiLWljb24ge1xuICBmb250LXNpemU6IDEuMjVyZW07XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRhYiBDb250ZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi50YWItY29udGVudCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWNhcmQtYmFja2dyb3VuZCwgd2hpdGUpO1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBwYWRkaW5nOiAycmVtO1xuICBib3gtc2hhZG93OiAwIDJweCA4cHggcmdiYSgwLCAwLCAwLCAwLjA4KTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMDUpKTtcbiAgbWluLWhlaWdodDogMzAwcHg7XG59XG5cbi8vIE92ZXJ2aWV3IFRhYlxuLm92ZXJ2aWV3LWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMzAwcHgsIDFmcikpO1xuICBnYXA6IDEuNXJlbTtcbn1cblxuLmluZm8tY2FyZCB7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgcGFkZGluZzogMS41cmVtO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xuXG4gIC5jYXJkLWhlYWRlciB7XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICBwYWRkaW5nLWJvdHRvbTogMC43NXJlbTtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMSkpO1xuXG4gICAgaDMge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgZm9udC1zaXplOiAxLjEyNXJlbTtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICB9XG4gIH1cblxuICAuY2FyZC1ib2R5IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZ2FwOiAwLjc1cmVtO1xuICB9XG59XG5cbi5pbmZvLXJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgcGFkZGluZzogMC41cmVtIDA7XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xuXG4gICY6bGFzdC1jaGlsZCB7XG4gICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgfVxufVxuXG4uaW5mby1sYWJlbCB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgIzY2Nik7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG59XG5cbi5pbmZvLXZhbHVlIHtcbiAgZm9udC1zaXplOiAwLjkzNzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICMzMzMpO1xufVxuXG4vLyBCYWxhbmNlcyBUYWJcbi5iYWxhbmNlcy1jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbn1cblxuLmJhbGFuY2VzLWdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpbGwsIG1pbm1heCgyODBweCwgMWZyKSk7XG4gIGdhcDogMXJlbTtcbn1cblxuLmJhbGFuY2UtY2FyZCB7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgcGFkZGluZzogMS4yNXJlbTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMDUpKTtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2U7XG5cbiAgJjpob3ZlciB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xuICAgIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAwLCAwLCAwLjEpO1xuICB9XG5cbiAgLmJhbGFuY2UtaGVhZGVyIHtcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xuICAgIHBhZGRpbmctYm90dG9tOiAwLjc1cmVtO1xuICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4xKSk7XG5cbiAgICAuY29pbi1pbmZvIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICAgICBoNCB7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgICAgIH1cblxuICAgICAgLnVzZC12YWx1ZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIGNvbG9yOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAuYmFsYW5jZS1ib2R5IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgZ2FwOiAwLjVyZW07XG4gIH1cbn1cblxuLmJhbGFuY2Utcm93IHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuXG4gIC5sYWJlbCB7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgfVxuXG4gIC52YWx1ZSB7XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjMzMzKTtcbiAgfVxufVxuXG4vLyBQb3NpdGlvbnMgJiBPcmRlcnMgVGFic1xuLnBvc2l0aW9ucy1jb250YWluZXIsXG4ub3JkZXJzLWNvbnRhaW5lciB7XG4gIHdpZHRoOiAxMDAlO1xufVxuXG4udGFibGUtcmVzcG9uc2l2ZSB7XG4gIHdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdy14OiBhdXRvO1xufVxuXG4uZGF0YS10YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuXG4gIHRoZWFkIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLCAjZjhmOWZhKTtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCByZ2JhKDAsIDAsIDAsIDAuMSkpO1xuXG4gICAgdGgge1xuICAgICAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xuICAgICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICM2NjYpO1xuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgICBmb250LXNpemU6IDAuNzVyZW07XG4gICAgICBsZXR0ZXItc3BhY2luZzogMC41cHg7XG4gICAgfVxuICB9XG5cbiAgdGJvZHkge1xuICAgIHRyIHtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IsIHJnYmEoMCwgMCwgMCwgMC4wNSkpO1xuICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAwLjJzIGVhc2U7XG5cbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1iYWNrZ3JvdW5kLCByZ2JhKDAsIDAsIDAsIDAuMDIpKTtcbiAgICAgIH1cblxuICAgICAgJjpsYXN0LWNoaWxkIHtcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZCB7XG4gICAgICBwYWRkaW5nOiAxcmVtO1xuICAgICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgIzMzMyk7XG5cbiAgICAgIHN0cm9uZyB7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIEVtcHR5IFN0YXRlXG4uZW1wdHktc3RhdGUge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgcGFkZGluZzogM3JlbTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuXG4gIC5lbXB0eS1pY29uIHtcbiAgICBmb250LXNpemU6IDRyZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgICBvcGFjaXR5OiAwLjU7XG4gIH1cblxuICBoMyB7XG4gICAgbWFyZ2luOiAwIDAgMC41cmVtIDA7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgIzMzMyk7XG4gIH1cblxuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gICAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBCYWRnZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLmJhZGdlIHtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICBwYWRkaW5nOiAwLjI1cmVtIDAuNzVyZW07XG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xuXG4gICYuYmFkZ2Utc3VjY2VzcyB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgxNiwgMTg1LCAxMjksIDAuMTUpO1xuICAgIGNvbG9yOiAjMDU5NjY5O1xuICB9XG5cbiAgJi5iYWRnZS1kYW5nZXIge1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMTUpO1xuICAgIGNvbG9yOiAjZGMyNjI2O1xuICB9XG5cbiAgJi5iYWRnZS1pbmZvIHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xNSk7XG4gICAgY29sb3I6ICMyNTYzZWI7XG4gIH1cblxuICAmLmJhZGdlLXdhcm5pbmcge1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjE1KTtcbiAgICBjb2xvcjogI2Q5NzcwNjtcbiAgfVxuXG4gICYuYmFkZ2UtcHJpbWFyeSB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgxMDIsIDEyNiwgMjM0LCAwLjE1KTtcbiAgICBjb2xvcjogIzY2N2VlYTtcbiAgfVxuXG4gICYuYmFkZ2Utc2Vjb25kYXJ5IHtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDEwNywgMTE0LCAxMjgsIDAuMTUpO1xuICAgIGNvbG9yOiAjNGI1NTYzO1xuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRleHQgVXRpbGl0aWVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi50ZXh0LXN1Y2Nlc3Mge1xuICBjb2xvcjogIzEwYjk4MSAhaW1wb3J0YW50O1xufVxuXG4udGV4dC1kYW5nZXIge1xuICBjb2xvcjogI2VmNDQ0NCAhaW1wb3J0YW50O1xufVxuXG4udGV4dC1tdXRlZCB7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgIzY2NikgIWltcG9ydGFudDtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQnV0dG9uIFV0aWxpdGllc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4uYnRuIHtcbiAgcGFkZGluZzogMC43NXJlbSAxLjVyZW07XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgZm9udC1zaXplOiAwLjkzNzVyZW07XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgYm9yZGVyOiBub25lO1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAwLjVyZW07XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG5cbiAgJjpkaXNhYmxlZCB7XG4gICAgb3BhY2l0eTogMC41O1xuICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gIH1cblxuICAmLmJ0bi1wcmltYXJ5IHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wcmltYXJ5LWNvbG9yLCAjNjY3ZWVhKTtcbiAgICBjb2xvcjogd2hpdGU7XG5cbiAgICAmOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXByaW1hcnktaG92ZXIsICM1NTY4ZDMpO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xuICAgICAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuMyk7XG4gICAgfVxuICB9XG5cbiAgLmJ0bi1pY29uIHtcbiAgICBmb250LXNpemU6IDFyZW07XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUmVzcG9uc2l2ZSBEZXNpZ24gLSBNb2JpbGUtZmlyc3Qgd2l0aCBib3R0b20gc2hlZXRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gIC5tb2RhbC1vdmVybGF5IHtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcbiAgfVxuXG4gIC5tb2RhbC1jb250ZW50IHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG4gICAgbWF4LWhlaWdodDogOTV2aDtcbiAgICBoZWlnaHQ6IGF1dG87XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy0yeGwpIHZhcigtLWJvcmRlci1yYWRpdXMtMnhsKSAwIDA7XG4gICAgYW5pbWF0aW9uOiBtb2RhbFNsaWRlVXBNb2JpbGUgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICB9XG5cbiAgQGtleWZyYW1lcyBtb2RhbFNsaWRlVXBNb2JpbGUge1xuICAgIGZyb20ge1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICB9XG4gIH1cblxuICAubW9kYWwtaGVhZGVyIHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLWxnKSB2YXIoLS1zcGFjaW5nLWxnKSB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuXG4gICAgLy8gTW9iaWxlIGRyYWcgaGFuZGxlIGluZGljYXRvclxuICAgICY6OmFmdGVyIHtcbiAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiB2YXIoLS1zcGFjaW5nLXNtKTtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcbiAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgaGVpZ2h0OiA0cHg7XG4gICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7XG4gICAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLWZ1bGwpO1xuICAgICAgei1pbmRleDogMjtcbiAgICB9XG5cbiAgICAuaGVhZGVyLXRpdGxlIGgyIHtcbiAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXhsKTtcbiAgICAgIG1hcmdpbi10b3A6IHZhcigtLXNwYWNpbmctc20pO1xuICAgIH1cbiAgfVxuXG4gIC5tb2RhbC1ib2R5IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgfVxuXG4gIC5zdGF0cy1ncmlkIHtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgfVxuXG4gIC5vdmVydmlldy1jb250YWluZXIge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLmJhbGFuY2VzLWdyaWQge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLnRhYi1jb250ZW50IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgfVxuXG4gIC50YWJzLWxpc3Qge1xuICAgIG92ZXJmbG93LXg6IGF1dG87XG4gICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICB9XG5cbiAgLmRhdGEtdGFibGUge1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXNtKTtcblxuICAgIHRoZWFkIHRoLFxuICAgIHRib2R5IHRkIHtcbiAgICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctc20pO1xuICAgIH1cbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNDgwcHgpIHtcbiAgLm1vZGFsLWhlYWRlciB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1tZCk7XG4gIH1cblxuICAuZXhjaGFuZ2UtbG9nbyB7XG4gICAgd2lkdGg6IDQwcHg7XG4gICAgaGVpZ2h0OiA0MHB4O1xuICB9XG5cbiAgLnN0YXQtY2FyZCB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZyk7XG5cbiAgICAuc3RhdC1pY29uIHtcbiAgICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICAgIH1cblxuICAgIC5zdGF0LWNvbnRlbnQgaDMge1xuICAgICAgZm9udC1zaXplOiAxLjVyZW07XG4gICAgfVxuICB9XG5cbiAgLm1vZGFsLWJvZHkge1xuICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbWQpO1xuICB9XG5cbiAgLnRhYi1jb250ZW50IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBEYXJrIFRoZW1lIEVuaGFuY2VtZW50c1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5bZGF0YS10aGVtZT1cImRhcmtcIl0sXG4uZGFyay10aGVtZSB7XG4gIC5tb2RhbC1jb250ZW50IHtcbiAgICBib3gtc2hhZG93OiAwIDIwcHggNjBweCByZ2JhKDAsIDAsIDAsIDAuNiksIDAgMCAwIDFweCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpO1xuICB9XG5cbiAgLm1vZGFsLWhlYWRlciB7XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzFlM2E4YSAwJSwgIzFlMjkzYiAxMDAlKTtcbiAgfVxuXG4gIC5zdGF0LWNhcmQsXG4gIC5pbmZvLWNhcmQsXG4gIC5iYWxhbmNlLWNhcmQge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1jb2xvcik7XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuICAgIH1cbiAgfVxuXG4gIC50YWJzLW5hdmlnYXRpb24ge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1jb2xvcik7XG4gIH1cblxuICAudGFiLWNvbnRlbnQge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgICBib3JkZXItY29sb3I6IHZhcigtLWJvcmRlci1jb2xvcik7XG4gIH1cblxuICAuZGF0YS10YWJsZSB7XG4gICAgdGhlYWQge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgfVxuXG4gICAgdGJvZHkgdHI6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG4gICAgfVxuICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFJlZHVjZWQgTW90aW9uIFN1cHBvcnRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgLm1vZGFsLW92ZXJsYXksXG4gIC5tb2RhbC1jb250ZW50LFxuICAuc3RhdC1jYXJkLFxuICAuYmFsYW5jZS1jYXJkLFxuICAudGFiLWJ1dHRvbiB7XG4gICAgYW5pbWF0aW9uOiBub25lO1xuICAgIHRyYW5zaXRpb246IG5vbmU7XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUHJpbnQgU3R5bGVzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbkBtZWRpYSBwcmludCB7XG4gIC5tb2RhbC1vdmVybGF5IHtcbiAgICBkaXNwbGF5OiBub25lO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return TradingPlatformInfoModalComponent;
})();

/***/ }),

/***/ 252:
/*!**********************************************************************************!*\
  !*** ./src/app/components/ui/confirmation-modal/confirmation-modal.component.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfirmationModalComponent: () => (/* binding */ ConfirmationModalComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _dialog_dialog_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dialog/dialog.component */ 1686);
/* harmony import */ var _button_button_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../button/button.component */ 5782);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);






let ConfirmationModalComponent = /*#__PURE__*/(() => {
  class ConfirmationModalComponent {
    constructor() {
      this.open = false;
      this.title = '';
      this.message = '';
      this.confirmText = '';
      this.cancelText = '';
      this.confirmVariant = 'primary';
      this.loading = false;
      this.openChange = new _angular_core__WEBPACK_IMPORTED_MODULE_3__.EventEmitter();
      this.confirm = new _angular_core__WEBPACK_IMPORTED_MODULE_3__.EventEmitter();
      this.cancel = new _angular_core__WEBPACK_IMPORTED_MODULE_3__.EventEmitter();
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_2__.TranslationService);
    }
    translate(key, params) {
      return this.translationService.translate(key, params);
    }
    onConfirm() {
      if (!this.loading) {
        this.confirm.emit();
      }
    }
    onCancel() {
      if (!this.loading) {
        this.cancel.emit();
        this.closeModal();
      }
    }
    onDialogClose() {
      if (!this.loading) {
        this.cancel.emit();
        this.closeModal();
      }
    }
    closeModal() {
      this.open = false;
      this.openChange.emit(false);
    }
    getConfirmText() {
      return this.confirmText || this.translate('modal.confirm');
    }
    getCancelText() {
      return this.cancelText || this.translate('modal.cancel');
    }
    getTitle() {
      return this.title || this.translate('modal.confirmTitle');
    }
    static {
      this.ɵfac = function ConfirmationModalComponent_Factory(t) {
        return new (t || ConfirmationModalComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
        type: ConfirmationModalComponent,
        selectors: [["ui-confirmation-modal"]],
        inputs: {
          open: "open",
          title: "title",
          message: "message",
          confirmText: "confirmText",
          cancelText: "cancelText",
          confirmVariant: "confirmVariant",
          loading: "loading"
        },
        outputs: {
          openChange: "openChange",
          confirm: "confirm",
          cancel: "cancel"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
        decls: 9,
        vars: 13,
        consts: [[3, "close", "open", "title", "size", "closable", "closeOnBackdrop"], [1, "confirmation-content"], [1, "confirmation-message"], [1, "confirmation-actions"], [3, "clicked", "variant", "disabled"], [3, "clicked", "variant", "loading", "disabled"]],
        template: function ConfirmationModalComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "ui-dialog", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("close", function ConfirmationModalComponent_Template_ui_dialog_close_0_listener() {
              return ctx.onDialogClose();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 1)(2, "p", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "div", 3)(5, "ui-button", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function ConfirmationModalComponent_Template_ui_button_clicked_5_listener() {
              return ctx.onCancel();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](7, "ui-button", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function ConfirmationModalComponent_Template_ui_button_clicked_7_listener() {
              return ctx.onConfirm();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("open", ctx.open)("title", ctx.getTitle())("size", "small")("closable", !ctx.loading)("closeOnBackdrop", !ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.message);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("variant", "secondary")("disabled", ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.getCancelText(), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("variant", ctx.confirmVariant)("loading", ctx.loading)("disabled", ctx.loading);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.getConfirmText(), " ");
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule, _dialog_dialog_component__WEBPACK_IMPORTED_MODULE_0__.DialogComponent, _button_button_component__WEBPACK_IMPORTED_MODULE_1__.ButtonComponent],
        styles: ["\n\n\n\n\n\n\n\n\n\n.confirmation-content[_ngcontent-%COMP%] {\n  padding: var(--spacing-md) 0;\n  min-height: 80px;\n  display: flex;\n  align-items: center;\n}\n\n.confirmation-message[_ngcontent-%COMP%] {\n  font-size: var(--font-size-base);\n  line-height: var(--line-height-relaxed);\n  color: var(--text-primary);\n  margin: 0;\n  text-align: left;\n}\n\n\n\n\n\n.confirmation-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: var(--spacing-md);\n  justify-content: flex-end;\n  margin-top: var(--spacing-xl);\n  padding-top: var(--spacing-lg);\n  border-top: 1px solid var(--border-color);\n  align-items: center;\n}\n\n\n\n\n\n[data-variant=\"danger\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"danger\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], \n[data-variant=\"warning\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"warning\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%] {\n  border-left: 4px solid var(--danger-color);\n  padding-left: var(--spacing-lg);\n  background: rgba(239, 68, 68, 0.05);\n  border-radius: var(--border-radius-md);\n  padding-top: var(--spacing-lg);\n  padding-bottom: var(--spacing-lg);\n}\n\n[data-variant=\"warning\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"warning\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%] {\n  border-left-color: var(--warning-color);\n  background: rgba(255, 152, 0, 0.05);\n}\n\n\n\n\n\n@media (max-width: 480px) {\n  .confirmation-actions[_ngcontent-%COMP%] {\n    flex-direction: column-reverse;\n    gap: var(--spacing-sm);\n  }\n\n  .confirmation-actions[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n\n  .confirmation-message[_ngcontent-%COMP%] {\n    font-size: var(--font-size-sm);\n  }\n}\n\n\n\n\n\n[data-theme=\"dark\"][_ngcontent-%COMP%]   .confirmation-message[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .confirmation-message[_ngcontent-%COMP%] {\n  color: var(--text-primary);\n}\n\n[data-theme=\"dark\"][_ngcontent-%COMP%]   .confirmation-actions[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .confirmation-actions[_ngcontent-%COMP%] {\n  border-top-color: var(--border-color);\n}\n\n[data-theme=\"dark\"]   [data-variant=\"danger\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"danger\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], \n.dark-theme   [data-variant=\"danger\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"danger\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n}\n\n[data-theme=\"dark\"]   [data-variant=\"warning\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"warning\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], \n.dark-theme   [data-variant=\"warning\"][_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%], [data-variant=\"warning\"]   [_nghost-%COMP%]   .confirmation-content[_ngcontent-%COMP%] {\n  background: rgba(255, 152, 0, 0.1);\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9jb25maXJtYXRpb24tbW9kYWwvY29uZmlybWF0aW9uLW1vZGFsLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztFQUdFOztBQUVGOztpRkFFaUY7QUFDakY7RUFDRSw0QkFBNEI7RUFDNUIsZ0JBQWdCO0VBQ2hCLGFBQWE7RUFDYixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxnQ0FBZ0M7RUFDaEMsdUNBQXVDO0VBQ3ZDLDBCQUEwQjtFQUMxQixTQUFTO0VBQ1QsZ0JBQWdCO0FBQ2xCOztBQUVBOztpRkFFaUY7QUFDakY7RUFDRSxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLHlCQUF5QjtFQUN6Qiw2QkFBNkI7RUFDN0IsOEJBQThCO0VBQzlCLHlDQUF5QztFQUN6QyxtQkFBbUI7QUFDckI7O0FBRUE7O2lGQUVpRjtBQUNqRjs7RUFFRSwwQ0FBMEM7RUFDMUMsK0JBQStCO0VBQy9CLG1DQUFtQztFQUNuQyxzQ0FBc0M7RUFDdEMsOEJBQThCO0VBQzlCLGlDQUFpQztBQUNuQzs7QUFFQTtFQUNFLHVDQUF1QztFQUN2QyxtQ0FBbUM7QUFDckM7O0FBRUE7O2lGQUVpRjtBQUNqRjtFQUNFO0lBQ0UsOEJBQThCO0lBQzlCLHNCQUFzQjtFQUN4Qjs7RUFFQTtJQUNFLFdBQVc7RUFDYjs7RUFFQTtJQUNFLDhCQUE4QjtFQUNoQztBQUNGOztBQUVBOztpRkFFaUY7QUFDakY7O0VBRUUsMEJBQTBCO0FBQzVCOztBQUVBOztFQUVFLHFDQUFxQztBQUN2Qzs7QUFFQTs7RUFFRSxrQ0FBa0M7QUFDcEM7O0FBRUE7O0VBRUUsa0NBQWtDO0FBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb25maXJtYXRpb24gTW9kYWwgU3R5bGVzXG4gKiBFeHRlbmRzIHRoZSB1bmlmaWVkIGRpYWxvZyBkZXNpZ24gc3lzdGVtIHdpdGggY29uZmlybWF0aW9uLXNwZWNpZmljIHN0eWxpbmdcbiAqL1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBDb25maXJtYXRpb24gQ29udGVudCBBcmVhXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4uY29uZmlybWF0aW9uLWNvbnRlbnQge1xuICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLW1kKSAwO1xuICBtaW4taGVpZ2h0OiA4MHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uY29uZmlybWF0aW9uLW1lc3NhZ2Uge1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS1iYXNlKTtcbiAgbGluZS1oZWlnaHQ6IHZhcigtLWxpbmUtaGVpZ2h0LXJlbGF4ZWQpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgbWFyZ2luOiAwO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBDb25maXJtYXRpb24gQWN0aW9ucyAtIEJ1dHRvbiBsYXlvdXRcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbi5jb25maXJtYXRpb24tYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogdmFyKC0tc3BhY2luZy1tZCk7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gIG1hcmdpbi10b3A6IHZhcigtLXNwYWNpbmcteGwpO1xuICBwYWRkaW5nLXRvcDogdmFyKC0tc3BhY2luZy1sZyk7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBXYXJuaW5nL0RhbmdlciBDb25maXJtYXRpb24gU3R5bGluZ1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuOmhvc3QtY29udGV4dChbZGF0YS12YXJpYW50PVwiZGFuZ2VyXCJdKSAuY29uZmlybWF0aW9uLWNvbnRlbnQsXG46aG9zdC1jb250ZXh0KFtkYXRhLXZhcmlhbnQ9XCJ3YXJuaW5nXCJdKSAuY29uZmlybWF0aW9uLWNvbnRlbnQge1xuICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLWRhbmdlci1jb2xvcik7XG4gIHBhZGRpbmctbGVmdDogdmFyKC0tc3BhY2luZy1sZyk7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjM5LCA2OCwgNjgsIDAuMDUpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLW1kKTtcbiAgcGFkZGluZy10b3A6IHZhcigtLXNwYWNpbmctbGcpO1xuICBwYWRkaW5nLWJvdHRvbTogdmFyKC0tc3BhY2luZy1sZyk7XG59XG5cbjpob3N0LWNvbnRleHQoW2RhdGEtdmFyaWFudD1cIndhcm5pbmdcIl0pIC5jb25maXJtYXRpb24tY29udGVudCB7XG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB2YXIoLS13YXJuaW5nLWNvbG9yKTtcbiAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDE1MiwgMCwgMC4wNSk7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFJlc3BvbnNpdmUgRGVzaWduIC0gU3RhY2sgYnV0dG9ucyBvbiBtb2JpbGVcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkge1xuICAuY29uZmlybWF0aW9uLWFjdGlvbnMge1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW4tcmV2ZXJzZTtcbiAgICBnYXA6IHZhcigtLXNwYWNpbmctc20pO1xuICB9XG5cbiAgLmNvbmZpcm1hdGlvbi1hY3Rpb25zID4gKiB7XG4gICAgd2lkdGg6IDEwMCU7XG4gIH1cblxuICAuY29uZmlybWF0aW9uLW1lc3NhZ2Uge1xuICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplLXNtKTtcbiAgfVxufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBEYXJrIFRoZW1lIFN1cHBvcnRcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbltkYXRhLXRoZW1lPVwiZGFya1wiXSAuY29uZmlybWF0aW9uLW1lc3NhZ2UsXG4uZGFyay10aGVtZSAuY29uZmlybWF0aW9uLW1lc3NhZ2Uge1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbn1cblxuW2RhdGEtdGhlbWU9XCJkYXJrXCJdIC5jb25maXJtYXRpb24tYWN0aW9ucyxcbi5kYXJrLXRoZW1lIC5jb25maXJtYXRpb24tYWN0aW9ucyB7XG4gIGJvcmRlci10b3AtY29sb3I6IHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbltkYXRhLXRoZW1lPVwiZGFya1wiXSA6aG9zdC1jb250ZXh0KFtkYXRhLXZhcmlhbnQ9XCJkYW5nZXJcIl0pIC5jb25maXJtYXRpb24tY29udGVudCxcbi5kYXJrLXRoZW1lIDpob3N0LWNvbnRleHQoW2RhdGEtdmFyaWFudD1cImRhbmdlclwiXSkgLmNvbmZpcm1hdGlvbi1jb250ZW50IHtcbiAgYmFja2dyb3VuZDogcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbn1cblxuW2RhdGEtdGhlbWU9XCJkYXJrXCJdIDpob3N0LWNvbnRleHQoW2RhdGEtdmFyaWFudD1cIndhcm5pbmdcIl0pIC5jb25maXJtYXRpb24tY29udGVudCxcbi5kYXJrLXRoZW1lIDpob3N0LWNvbnRleHQoW2RhdGEtdmFyaWFudD1cIndhcm5pbmdcIl0pIC5jb25maXJtYXRpb24tY29udGVudCB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAxNTIsIDAsIDAuMSk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return ConfirmationModalComponent;
})();

/***/ }),

/***/ 1686:
/*!**********************************************************!*\
  !*** ./src/app/components/ui/dialog/dialog.component.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DialogComponent: () => (/* binding */ DialogComponent),
/* harmony export */   DialogContentComponent: () => (/* binding */ DialogContentComponent),
/* harmony export */   DialogFooterComponent: () => (/* binding */ DialogFooterComponent),
/* harmony export */   DialogHeaderComponent: () => (/* binding */ DialogHeaderComponent),
/* harmony export */   DialogTitleComponent: () => (/* binding */ DialogTitleComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_animations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/animations */ 7172);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);






const _c0 = ["dialogElement"];
const _c1 = [[["ui-dialog-content"]], "*", [["ui-dialog-header"]], [["ui-dialog-footer"]]];
const _c2 = ["ui-dialog-content", "*", "ui-dialog-header", "ui-dialog-footer"];
function DialogComponent_div_0_div_2_h2_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h2", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r1.title, " ");
  }
}
function DialogComponent_div_0_div_2_button_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function DialogComponent_div_0_div_2_button_3_Template_button_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r1.onCloseClick());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "span", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "\u2715");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("disabled", !ctx_r1.closable);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("aria-label", ctx_r1.translate("dialog.closeAriaLabel"));
  }
}
function DialogComponent_div_0_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, DialogComponent_div_0_div_2_h2_1_Template, 2, 1, "h2", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](2, 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, DialogComponent_div_0_div_2_button_3_Template, 3, 2, "button", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.title);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.closable);
  }
}
function DialogComponent_div_0_div_6_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](1, 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("aria-label", ctx_r1.translate("dialog.actionsAriaLabel"));
  }
}
function DialogComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function DialogComponent_div_0_Template_div_click_0_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r1.onBackdropClick($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, DialogComponent_div_0_div_2_Template, 4, 2, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](5, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](6, DialogComponent_div_0_div_6_Template, 2, 1, "div", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("@fadeIn", undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassMap"](ctx_r1.getDialogClasses());
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("@slideUp", undefined);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵattribute"]("aria-labelledby", ctx_r1.title ? "dialog-title" : null)("aria-describedby", "dialog-content")("aria-modal", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.showHeader);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx_r1.showFooter);
  }
}
const _c3 = ["*"];
/**
 * Professional Dialog Component
 *
 * A fully accessible, theme-aware modal dialog component with:
 * - Smooth animations (fade-in overlay, slide-up content)
 * - Focus trap for keyboard navigation
 * - ESC key to close
 * - Backdrop click to close
 * - Mobile-responsive with bottom sheet on small screens
 * - Light/dark theme support using CSS variables
 * - WCAG 2.1 AA compliant accessibility
 */
let DialogComponent = /*#__PURE__*/(() => {
  class DialogComponent {
    constructor() {
      this.open = false;
      this.title = '';
      this.size = 'medium';
      this.closable = true;
      this.closeOnBackdrop = true;
      this.showHeader = true;
      this.showFooter = false;
      this.openChange = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
      this.close = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
      // Inject TranslationService
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_0__.TranslationService);
      this.previousActiveElement = null;
      this.focusableElements = [];
      this.scrollbarWidth = 0;
      /**
       * Handle keyboard events for accessibility
       */
      this.handleEscape = event => {
        if (event.key === 'Escape' && this.open && this.closable) {
          event.preventDefault();
          this.closeDialog();
        }
        // Focus trap - Tab navigation
        if (event.key === 'Tab' && this.open) {
          this.handleTabKey(event);
        }
      };
    }
    translate(key) {
      return this.translationService.translate(key);
    }
    ngOnInit() {
      if (this.open) {
        this.calculateScrollbarWidth();
        this.addBodyClass();
        this.addEscapeListener();
        this.saveFocusState();
      }
    }
    ngAfterViewInit() {
      if (this.open) {
        setTimeout(() => this.setInitialFocus(), 0);
      }
    }
    ngOnDestroy() {
      this.removeBodyClass();
      this.removeEscapeListener();
      this.restoreFocusState();
    }
    ngOnChanges(changes) {
      if (changes['open']) {
        if (this.open) {
          this.calculateScrollbarWidth();
          this.addBodyClass();
          this.addEscapeListener();
          this.saveFocusState();
          setTimeout(() => this.setInitialFocus(), 100);
        } else {
          this.removeBodyClass();
          this.removeEscapeListener();
          this.restoreFocusState();
        }
      }
    }
    onBackdropClick(event) {
      if (this.closeOnBackdrop && event.target === event.currentTarget) {
        this.closeDialog();
      }
    }
    onCloseClick() {
      if (this.closable) {
        this.closeDialog();
      }
    }
    closeDialog() {
      this.open = false;
      this.openChange.emit(false);
      this.close.emit();
    }
    /**
     * Implement focus trap for keyboard navigation
     */
    handleTabKey(event) {
      this.updateFocusableElements();
      if (this.focusableElements.length === 0) return;
      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];
      if (event.shiftKey) {
        // Shift + Tab: move focus backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move focus forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
    /**
     * Update list of focusable elements within the dialog
     */
    updateFocusableElements() {
      const dialog = document.querySelector('.dialog');
      if (!dialog) return;
      const focusableSelectors = ['button:not([disabled])', 'a[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]'].join(', ');
      this.focusableElements = Array.from(dialog.querySelectorAll(focusableSelectors)).filter(el => {
        return el.offsetParent !== null &&
        // Element is visible
        !el.hasAttribute('disabled') && el.tabIndex !== -1;
      });
    }
    /**
     * Set initial focus when dialog opens
     */
    setInitialFocus() {
      this.updateFocusableElements();
      if (this.focusableElements.length > 0) {
        // Focus the first focusable element (usually the close button or first input)
        this.focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the dialog itself
        const dialog = document.querySelector('.dialog');
        if (dialog) {
          dialog.focus();
        }
      }
    }
    /**
     * Save the currently focused element before opening dialog
     */
    saveFocusState() {
      this.previousActiveElement = document.activeElement;
    }
    /**
     * Restore focus to the previously focused element after closing dialog
     */
    restoreFocusState() {
      if (this.previousActiveElement && this.previousActiveElement.focus) {
        setTimeout(() => {
          this.previousActiveElement?.focus();
          this.previousActiveElement = null;
        }, 0);
      }
    }
    /**
     * Calculate scrollbar width to prevent layout shift
     */
    calculateScrollbarWidth() {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);
      const inner = document.createElement('div');
      outer.appendChild(inner);
      this.scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      document.body.removeChild(outer);
    }
    addEscapeListener() {
      document.addEventListener('keydown', this.handleEscape);
    }
    removeEscapeListener() {
      document.removeEventListener('keydown', this.handleEscape);
    }
    addBodyClass() {
      document.body.classList.add('dialog-open');
      // Prevent layout shift by adding padding equal to scrollbar width
      if (this.scrollbarWidth > 0) {
        document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      }
    }
    removeBodyClass() {
      document.body.classList.remove('dialog-open');
      document.body.style.paddingRight = '';
    }
    getDialogClasses() {
      const classes = ['dialog'];
      classes.push(`dialog-${this.size}`);
      return classes.join(' ');
    }
    static {
      this.ɵfac = function DialogComponent_Factory(t) {
        return new (t || DialogComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: DialogComponent,
        selectors: [["ui-dialog"]],
        viewQuery: function DialogComponent_Query(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c0, 5);
          }
          if (rf & 2) {
            let _t;
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.dialogElement = _t.first);
          }
        },
        inputs: {
          open: "open",
          title: "title",
          size: "size",
          closable: "closable",
          closeOnBackdrop: "closeOnBackdrop",
          showHeader: "showHeader",
          showFooter: "showFooter"
        },
        outputs: {
          openChange: "openChange",
          close: "close"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵNgOnChangesFeature"], _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c2,
        decls: 1,
        vars: 1,
        consts: [["class", "dialog-overlay", "role", "presentation", 3, "click", 4, "ngIf"], ["role", "presentation", 1, "dialog-overlay", 3, "click"], ["role", "dialog", "tabindex", "-1"], ["class", "dialog-header", 4, "ngIf"], ["id", "dialog-content", "role", "document", 1, "dialog-body"], ["class", "dialog-footer", "role", "group", 4, "ngIf"], [1, "dialog-header"], ["id", "dialog-title", "class", "dialog-title", 4, "ngIf"], ["class", "dialog-close-button", "type", "button", 3, "disabled", "click", 4, "ngIf"], ["id", "dialog-title", 1, "dialog-title"], ["type", "button", 1, "dialog-close-button", 3, "click", "disabled"], ["aria-hidden", "true", 1, "close-icon"], ["role", "group", 1, "dialog-footer"]],
        template: function DialogComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojectionDef"](_c1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, DialogComponent_div_0_Template, 7, 9, "div", 0);
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.open);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf],
        styles: ["\n\n\n\n\n\n\n\n\n\n.dialog-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--background-overlay);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: var(--z-modal-backdrop);\n  animation: _ngcontent-%COMP%_overlayFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n  padding: var(--spacing-lg);\n  box-sizing: border-box;\n}\n\n@keyframes _ngcontent-%COMP%_overlayFadeIn {\n  from {\n    opacity: 0;\n    backdrop-filter: blur(0);\n    -webkit-backdrop-filter: blur(0);\n  }\n  to {\n    opacity: 1;\n    backdrop-filter: blur(8px);\n    -webkit-backdrop-filter: blur(8px);\n  }\n}\n\n\n\n\n\n.dialog[_ngcontent-%COMP%] {\n  background: var(--background-primary);\n  border-radius: var(--border-radius-2xl);\n  box-shadow: var(--shadow-overlay);\n  display: flex;\n  flex-direction: column;\n  max-height: 90vh;\n  position: relative;\n  animation: _ngcontent-%COMP%_dialogSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  overflow: hidden;\n  border: 1px solid var(--border-color);\n  will-change: transform, opacity;\n}\n\n@keyframes _ngcontent-%COMP%_dialogSlideUp {\n  from {\n    opacity: 0;\n    transform: translateY(20px) scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n\n\n\n\n\n.dialog-small[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 420px;\n}\n\n.dialog-medium[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 640px;\n}\n\n.dialog-large[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 900px;\n}\n\n.dialog-fullscreen[_ngcontent-%COMP%] {\n  width: 95vw;\n  height: 95vh;\n  max-width: none;\n  max-height: none;\n  border-radius: var(--border-radius-xl);\n}\n\n\n\n\n\n.dialog-header[_ngcontent-%COMP%] {\n  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);\n  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);\n  color: var(--text-inverse);\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--spacing-md);\n  flex-shrink: 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  position: relative;\n}\n\n\n\n.dialog-header[_ngcontent-%COMP%]::before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: repeating-linear-gradient(\n    45deg,\n    transparent,\n    transparent 10px,\n    rgba(255, 255, 255, 0.02) 10px,\n    rgba(255, 255, 255, 0.02) 20px\n  );\n  pointer-events: none;\n}\n\n.dialog-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: var(--font-size-2xl);\n  font-weight: var(--font-weight-bold);\n  color: var(--text-inverse);\n  flex: 1;\n  line-height: var(--line-height-tight);\n  position: relative;\n  z-index: 1;\n}\n\n\n\n\n\n.dialog-close-button[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.15);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  cursor: pointer;\n  padding: var(--spacing-sm);\n  border-radius: var(--border-radius-lg);\n  color: var(--text-inverse);\n  transition: var(--transition-normal);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-left: var(--spacing-sm);\n  width: 36px;\n  height: 36px;\n  flex-shrink: 0;\n  position: relative;\n  z-index: 1;\n}\n\n.dialog-close-button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: rgba(255, 255, 255, 0.25);\n  border-color: rgba(255, 255, 255, 0.3);\n  transform: scale(1.05);\n}\n\n.dialog-close-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--text-inverse);\n  outline-offset: 2px;\n}\n\n.dialog-close-button[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n\n.dialog-close-button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.close-icon[_ngcontent-%COMP%] {\n  font-size: var(--font-size-xl);\n  font-weight: var(--font-weight-bold);\n  line-height: 1;\n}\n\n\n\n\n\n.dialog-body[_ngcontent-%COMP%] {\n  padding: var(--spacing-xl);\n  color: var(--text-primary);\n  line-height: var(--line-height-relaxed);\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n}\n\n\n\n.dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n}\n\n.dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-secondary);\n  border-radius: var(--border-radius-sm);\n}\n\n.dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border-color);\n  border-radius: var(--border-radius-sm);\n  -webkit-transition: var(--transition-normal);\n  transition: var(--transition-normal);\n}\n\n.dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--border-hover);\n}\n\n\n\n\n\n.dialog-footer[_ngcontent-%COMP%] {\n  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);\n  border-top: 1px solid var(--border-color);\n  display: flex;\n  gap: var(--spacing-md);\n  justify-content: flex-end;\n  flex-shrink: 0;\n  background: var(--background-secondary);\n  align-items: center;\n}\n\n\n\n\n\n[_ngcontent-%COMP%]:global(body.dialog-open) {\n  overflow: hidden;\n  padding-right: var(--scrollbar-width, 0);\n}\n\n\n\n\n\n@media (max-width: 768px) {\n  .dialog-overlay[_ngcontent-%COMP%] {\n    padding: 0;\n    align-items: flex-end;\n  }\n\n  .dialog[_ngcontent-%COMP%] {\n    width: 100%;\n    max-width: 100%;\n    max-height: 95vh;\n    border-radius: var(--border-radius-2xl) var(--border-radius-2xl) 0 0;\n    animation: dialogSlideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  }\n\n  @keyframes dialogSlideUpMobile {\n    from {\n      opacity: 0;\n      transform: translateY(100%);\n    }\n    to {\n      opacity: 1;\n      transform: translateY(0);\n    }\n  }\n\n  .dialog-small[_ngcontent-%COMP%], \n   .dialog-medium[_ngcontent-%COMP%], \n   .dialog-large[_ngcontent-%COMP%] {\n    width: 100%;\n    max-width: none;\n  }\n\n  .dialog-fullscreen[_ngcontent-%COMP%] {\n    width: 100vw;\n    height: 100vh;\n    max-height: 100vh;\n    border-radius: 0;\n  }\n\n  .dialog-header[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);\n    position: relative;\n  }\n\n  \n\n  .dialog-header[_ngcontent-%COMP%]::after {\n    content: '';\n    position: absolute;\n    top: var(--spacing-sm);\n    left: 50%;\n    transform: translateX(-50%);\n    width: 40px;\n    height: 4px;\n    background: rgba(255, 255, 255, 0.4);\n    border-radius: var(--border-radius-full);\n  }\n\n  .dialog-title[_ngcontent-%COMP%] {\n    font-size: var(--font-size-xl);\n    margin-top: var(--spacing-sm);\n  }\n\n  .dialog-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-lg);\n  }\n\n  .dialog-footer[_ngcontent-%COMP%] {\n    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);\n    flex-direction: column-reverse;\n    gap: var(--spacing-sm);\n  }\n\n  .dialog-footer[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n\n@media (max-width: 480px) {\n  .dialog-header[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n\n  .dialog-title[_ngcontent-%COMP%] {\n    font-size: var(--font-size-lg);\n  }\n\n  .dialog-body[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n\n  .dialog-footer[_ngcontent-%COMP%] {\n    padding: var(--spacing-md);\n  }\n\n  .dialog-close-button[_ngcontent-%COMP%] {\n    width: 32px;\n    height: 32px;\n  }\n\n  .close-icon[_ngcontent-%COMP%] {\n    font-size: var(--font-size-lg);\n  }\n}\n\n\n\n\n\n.dialog[_ngcontent-%COMP%]:focus {\n  outline: none;\n}\n\n.dialog[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--primary-color);\n  outline-offset: -2px;\n}\n\n\n\n\n\n@media (prefers-reduced-motion: reduce) {\n  .dialog-overlay[_ngcontent-%COMP%], \n   .dialog[_ngcontent-%COMP%], \n   .dialog-close-button[_ngcontent-%COMP%] {\n    animation: none;\n    transition: none;\n  }\n}\n\n\n\n\n\n[data-theme=\"dark\"][_ngcontent-%COMP%]   .dialog[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .dialog[_ngcontent-%COMP%] {\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);\n}\n\n[data-theme=\"dark\"][_ngcontent-%COMP%]   .dialog-header[_ngcontent-%COMP%], \n.dark-theme[_ngcontent-%COMP%]   .dialog-header[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);\n}\n\n[data-theme=\"dark\"][_ngcontent-%COMP%]   .dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar-track, \n.dark-theme[_ngcontent-%COMP%]   .dialog-body[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--background-tertiary);\n}\n\n\n\n\n\n@media print {\n  .dialog-overlay[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztFQUdFOztBQUVGOztpRkFFaUY7QUFDakY7RUFDRSxlQUFlO0VBQ2YsTUFBTTtFQUNOLE9BQU87RUFDUCxRQUFRO0VBQ1IsU0FBUztFQUNULHFDQUFxQztFQUNyQywwQkFBMEI7RUFDMUIsa0NBQWtDO0VBQ2xDLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIsdUJBQXVCO0VBQ3ZCLGdDQUFnQztFQUNoQywyREFBMkQ7RUFDM0QsMEJBQTBCO0VBQzFCLHNCQUFzQjtBQUN4Qjs7QUFFQTtFQUNFO0lBQ0UsVUFBVTtJQUNWLHdCQUF3QjtJQUN4QixnQ0FBZ0M7RUFDbEM7RUFDQTtJQUNFLFVBQVU7SUFDViwwQkFBMEI7SUFDMUIsa0NBQWtDO0VBQ3BDO0FBQ0Y7O0FBRUE7O2lGQUVpRjtBQUNqRjtFQUNFLHFDQUFxQztFQUNyQyx1Q0FBdUM7RUFDdkMsaUNBQWlDO0VBQ2pDLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtFQUNsQiwwREFBMEQ7RUFDMUQsZ0JBQWdCO0VBQ2hCLHFDQUFxQztFQUNyQywrQkFBK0I7QUFDakM7O0FBRUE7RUFDRTtJQUNFLFVBQVU7SUFDVix1Q0FBdUM7RUFDekM7RUFDQTtJQUNFLFVBQVU7SUFDVixpQ0FBaUM7RUFDbkM7QUFDRjs7QUFFQTs7aUZBRWlGO0FBQ2pGO0VBQ0UsV0FBVztFQUNYLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLFdBQVc7RUFDWCxnQkFBZ0I7QUFDbEI7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsZ0JBQWdCO0FBQ2xCOztBQUVBO0VBQ0UsV0FBVztFQUNYLFlBQVk7RUFDWixlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLHNDQUFzQztBQUN4Qzs7QUFFQTs7aUZBRWlGO0FBQ2pGO0VBQ0UsOERBQThEO0VBQzlELHNGQUFzRjtF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O0VBRUE7SUFDRSw4QkFBOEI7RUFDaEM7O0VBRUE7SUFDRSwwQkFBMEI7RUFDNUI7O0VBRUE7SUFDRSwwQkFBMEI7RUFDNUI7O0VBRUE7SUFDRSxXQUFXO0lBQ1gsWUFBWTtFQUNkOztFQUVBO0lBQ0UsOEJBQThCO0VBQ2hDO0FBQ0Y7O0FBRUE7O2lGQUVpRjtBQUNqRjtFQUNFLGFBQWE7QUFDZjs7QUFFQTtFQUNFLHVDQUF1QztFQUN2QyxvQkFBb0I7QUFDdEI7O0FBRUE7O2lGQUVpRjtBQUNqRjtFQUNFOzs7SUFHRSxlQUFlO0lBQ2YsZ0JBQWdCO0VBQ2xCO0FBQ0Y7O0FBRUE7O2lGQUVpRjtBQUNqRjs7RUFFRSwrRUFBK0U7QUFDakY7O0FBRUE7O0VBRUUsNkRBQTZEO0FBQy9EOztBQUVBOztFQUVFLHNDQUFzQztBQUN4Qzs7QUFFQTs7aUZBRWlGO0FBQ2pGO0VBQ0U7SUFDRSxhQUFhO0VBQ2Y7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVW5pZmllZCBNb2RhbCBEZXNpZ24gU3lzdGVtXG4gKiBQcm9mZXNzaW9uYWwsIHRoZW1lLWF3YXJlIGRpYWxvZyBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIERpYWxvZyBPdmVybGF5IC0gQmFja2Ryb3Agd2l0aCBzbW9vdGggZmFkZS1pbiBhbmltYXRpb25cbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbi5kaWFsb2ctb3ZlcmxheSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLW92ZXJsYXkpO1xuICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoOHB4KTtcbiAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoOHB4KTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHotaW5kZXg6IHZhcigtLXotbW9kYWwtYmFja2Ryb3ApO1xuICBhbmltYXRpb246IG92ZXJsYXlGYWRlSW4gMC4yNXMgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZyk7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG59XG5cbkBrZXlmcmFtZXMgb3ZlcmxheUZhZGVJbiB7XG4gIGZyb20ge1xuICAgIG9wYWNpdHk6IDA7XG4gICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDApO1xuICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDApO1xuICB9XG4gIHRvIHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xuICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDhweCk7XG4gIH1cbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgQmFzZSBEaWFsb2cgLSBDb250YWluZXIgd2l0aCBzbGlkZS11cCBhbmltYXRpb25cbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbi5kaWFsb2cge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLTJ4bCk7XG4gIGJveC1zaGFkb3c6IHZhcigtLXNoYWRvdy1vdmVybGF5KTtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgbWF4LWhlaWdodDogOTB2aDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBhbmltYXRpb246IGRpYWxvZ1NsaWRlVXAgMC4zcyBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xuICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtLCBvcGFjaXR5O1xufVxuXG5Aa2V5ZnJhbWVzIGRpYWxvZ1NsaWRlVXAge1xuICBmcm9tIHtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgyMHB4KSBzY2FsZSgwLjk2KTtcbiAgfVxuICB0byB7XG4gICAgb3BhY2l0eTogMTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCkgc2NhbGUoMSk7XG4gIH1cbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgU2l6ZSBWYXJpYW50cyAtIFJlc3BvbnNpdmUgd2lkdGhzIGZvciBkaWZmZXJlbnQgZGlhbG9nIHR5cGVzXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4uZGlhbG9nLXNtYWxsIHtcbiAgd2lkdGg6IDEwMCU7XG4gIG1heC13aWR0aDogNDIwcHg7XG59XG5cbi5kaWFsb2ctbWVkaXVtIHtcbiAgd2lkdGg6IDEwMCU7XG4gIG1heC13aWR0aDogNjQwcHg7XG59XG5cbi5kaWFsb2ctbGFyZ2Uge1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiA5MDBweDtcbn1cblxuLmRpYWxvZy1mdWxsc2NyZWVuIHtcbiAgd2lkdGg6IDk1dnc7XG4gIGhlaWdodDogOTV2aDtcbiAgbWF4LXdpZHRoOiBub25lO1xuICBtYXgtaGVpZ2h0OiBub25lO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXhsKTtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgRGlhbG9nIEhlYWRlciAtIFByb2Zlc3Npb25hbCBncmFkaWVudCBoZWFkZXIgd2l0aCBwcm9wZXIgc3BhY2luZ1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuLmRpYWxvZy1oZWFkZXIge1xuICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLXhsKSB2YXIoLS1zcGFjaW5nLXhsKSB2YXIoLS1zcGFjaW5nLWxnKTtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tcHJpbWFyeS1jb2xvcikgMCUsIHZhcigtLXByaW1hcnktZGFyaykgMTAwJSk7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWludmVyc2UpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBnYXA6IHZhcigtLXNwYWNpbmctbWQpO1xuICBmbGV4LXNocmluazogMDtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuXG4vKiBTdWJ0bGUgcGF0dGVybiBvdmVybGF5IGZvciB2aXN1YWwgZGVwdGggKi9cbi5kaWFsb2ctaGVhZGVyOjpiZWZvcmUge1xuICBjb250ZW50OiAnJztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGJhY2tncm91bmQ6IHJlcGVhdGluZy1saW5lYXItZ3JhZGllbnQoXG4gICAgNDVkZWcsXG4gICAgdHJhbnNwYXJlbnQsXG4gICAgdHJhbnNwYXJlbnQgMTBweCxcbiAgICByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIDEwcHgsXG4gICAgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSAyMHB4XG4gICk7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuXG4uZGlhbG9nLXRpdGxlIHtcbiAgbWFyZ2luOiAwO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS0yeGwpO1xuICBmb250LXdlaWdodDogdmFyKC0tZm9udC13ZWlnaHQtYm9sZCk7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWludmVyc2UpO1xuICBmbGV4OiAxO1xuICBsaW5lLWhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQtdGlnaHQpO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHotaW5kZXg6IDE7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIENsb3NlIEJ1dHRvbiAtIEFjY2Vzc2libGUgY2xvc2UgYnV0dG9uIHdpdGggaG92ZXIgZWZmZWN0c1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuLmRpYWxvZy1jbG9zZS1idXR0b24ge1xuICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTUpO1xuICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1zbSk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtbGcpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1pbnZlcnNlKTtcbiAgdHJhbnNpdGlvbjogdmFyKC0tdHJhbnNpdGlvbi1ub3JtYWwpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLXNwYWNpbmctc20pO1xuICB3aWR0aDogMzZweDtcbiAgaGVpZ2h0OiAzNnB4O1xuICBmbGV4LXNocmluazogMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiAxO1xufVxuXG4uZGlhbG9nLWNsb3NlLWJ1dHRvbjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSk7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpO1xuICB0cmFuc2Zvcm06IHNjYWxlKDEuMDUpO1xufVxuXG4uZGlhbG9nLWNsb3NlLWJ1dHRvbjpmb2N1cyB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS10ZXh0LWludmVyc2UpO1xuICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuXG4uZGlhbG9nLWNsb3NlLWJ1dHRvbjphY3RpdmUge1xuICB0cmFuc2Zvcm06IHNjYWxlKDAuOTUpO1xufVxuXG4uZGlhbG9nLWNsb3NlLWJ1dHRvbjpkaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDAuNTtcbiAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbn1cblxuLmNsb3NlLWljb24ge1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14bCk7XG4gIGZvbnQtd2VpZ2h0OiB2YXIoLS1mb250LXdlaWdodC1ib2xkKTtcbiAgbGluZS1oZWlnaHQ6IDE7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIERpYWxvZyBCb2R5IC0gU2Nyb2xsYWJsZSBjb250ZW50IGFyZWEgd2l0aCBwcm9wZXIgc3BhY2luZ1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuLmRpYWxvZy1ib2R5IHtcbiAgcGFkZGluZzogdmFyKC0tc3BhY2luZy14bCk7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICBsaW5lLWhlaWdodDogdmFyKC0tbGluZS1oZWlnaHQtcmVsYXhlZCk7XG4gIGZsZXg6IDE7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xufVxuXG4vKiBDdXN0b20gc2Nyb2xsYmFyIHN0eWxpbmcgKi9cbi5kaWFsb2ctYm9keTo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICB3aWR0aDogOHB4O1xufVxuXG4uZGlhbG9nLWJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1ib3JkZXItcmFkaXVzLXNtKTtcbn1cblxuLmRpYWxvZy1ib2R5Ojotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtc20pO1xuICB0cmFuc2l0aW9uOiB2YXIoLS10cmFuc2l0aW9uLW5vcm1hbCk7XG59XG5cbi5kaWFsb2ctYm9keTo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1ib3JkZXItaG92ZXIpO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBEaWFsb2cgRm9vdGVyIC0gQWN0aW9uIGJ1dHRvbnMgYXJlYSB3aXRoIHByb3BlciBzZXBhcmF0aW9uXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG4uZGlhbG9nLWZvb3RlciB7XG4gIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbGcpIHZhcigtLXNwYWNpbmcteGwpIHZhcigtLXNwYWNpbmcteGwpO1xuICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcbiAgZmxleC1zaHJpbms6IDA7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgQm9keSBTY3JvbGwgTG9jayAtIFByZXZlbnQgYmFja2dyb3VuZCBzY3JvbGxpbmcgd2hlbiBkaWFsb2cgaXMgb3BlblxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuOmdsb2JhbChib2R5LmRpYWxvZy1vcGVuKSB7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHBhZGRpbmctcmlnaHQ6IHZhcigtLXNjcm9sbGJhci13aWR0aCwgMCk7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFJlc3BvbnNpdmUgRGVzaWduIC0gTW9iaWxlLWZpcnN0IGFwcHJvYWNoIHdpdGggYm90dG9tIHNoZWV0IG9uIHNtYWxsIHNjcmVlbnNcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAuZGlhbG9nLW92ZXJsYXkge1xuICAgIHBhZGRpbmc6IDA7XG4gICAgYWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuICB9XG5cbiAgLmRpYWxvZyB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIG1heC1oZWlnaHQ6IDk1dmg7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0tYm9yZGVyLXJhZGl1cy0yeGwpIHZhcigtLWJvcmRlci1yYWRpdXMtMnhsKSAwIDA7XG4gICAgYW5pbWF0aW9uOiBkaWFsb2dTbGlkZVVwTW9iaWxlIDAuM3MgY3ViaWMtYmV6aWVyKDAuNCwgMCwgMC4yLCAxKTtcbiAgfVxuXG4gIEBrZXlmcmFtZXMgZGlhbG9nU2xpZGVVcE1vYmlsZSB7XG4gICAgZnJvbSB7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuICAgIH1cbiAgICB0byB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgIH1cbiAgfVxuXG4gIC5kaWFsb2ctc21hbGwsXG4gIC5kaWFsb2ctbWVkaXVtLFxuICAuZGlhbG9nLWxhcmdlIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IG5vbmU7XG4gIH1cblxuICAuZGlhbG9nLWZ1bGxzY3JlZW4ge1xuICAgIHdpZHRoOiAxMDB2dztcbiAgICBoZWlnaHQ6IDEwMHZoO1xuICAgIG1heC1oZWlnaHQ6IDEwMHZoO1xuICAgIGJvcmRlci1yYWRpdXM6IDA7XG4gIH1cblxuICAuZGlhbG9nLWhlYWRlciB7XG4gICAgcGFkZGluZzogdmFyKC0tc3BhY2luZy1sZykgdmFyKC0tc3BhY2luZy1sZykgdmFyKC0tc3BhY2luZy1tZCk7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB9XG5cbiAgLyogTW9iaWxlIGRyYWcgaGFuZGxlIGluZGljYXRvciAqL1xuICAuZGlhbG9nLWhlYWRlcjo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IHZhcigtLXNwYWNpbmctc20pO1xuICAgIGxlZnQ6IDUwJTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgd2lkdGg6IDQwcHg7XG4gICAgaGVpZ2h0OiA0cHg7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLWJvcmRlci1yYWRpdXMtZnVsbCk7XG4gIH1cblxuICAuZGlhbG9nLXRpdGxlIHtcbiAgICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZS14bCk7XG4gICAgbWFyZ2luLXRvcDogdmFyKC0tc3BhY2luZy1zbSk7XG4gIH1cblxuICAuZGlhbG9nLWJvZHkge1xuICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbGcpO1xuICB9XG5cbiAgLmRpYWxvZy1mb290ZXIge1xuICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbWQpIHZhcigtLXNwYWNpbmctbGcpIHZhcigtLXNwYWNpbmctbGcpO1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW4tcmV2ZXJzZTtcbiAgICBnYXA6IHZhcigtLXNwYWNpbmctc20pO1xuICB9XG5cbiAgLmRpYWxvZy1mb290ZXIgPiAqIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgfVxufVxuXG5AbWVkaWEgKG1heC13aWR0aDogNDgwcHgpIHtcbiAgLmRpYWxvZy1oZWFkZXIge1xuICAgIHBhZGRpbmc6IHZhcigtLXNwYWNpbmctbWQpO1xuICB9XG5cbiAgLmRpYWxvZy10aXRsZSB7XG4gICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtbGcpO1xuICB9XG5cbiAgLmRpYWxvZy1ib2R5IHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgfVxuXG4gIC5kaWFsb2ctZm9vdGVyIHtcbiAgICBwYWRkaW5nOiB2YXIoLS1zcGFjaW5nLW1kKTtcbiAgfVxuXG4gIC5kaWFsb2ctY2xvc2UtYnV0dG9uIHtcbiAgICB3aWR0aDogMzJweDtcbiAgICBoZWlnaHQ6IDMycHg7XG4gIH1cblxuICAuY2xvc2UtaWNvbiB7XG4gICAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUtbGcpO1xuICB9XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIEZvY3VzIE1hbmFnZW1lbnQgLSBBY2Nlc3NpYmlsaXR5IGVuaGFuY2VtZW50c1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuLmRpYWxvZzpmb2N1cyB7XG4gIG91dGxpbmU6IG5vbmU7XG59XG5cbi5kaWFsb2c6Zm9jdXMtdmlzaWJsZSB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFJlZHVjZWQgTW90aW9uIFN1cHBvcnQgLSBSZXNwZWN0IHVzZXIgcHJlZmVyZW5jZXNcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbkBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gIC5kaWFsb2ctb3ZlcmxheSxcbiAgLmRpYWxvZyxcbiAgLmRpYWxvZy1jbG9zZS1idXR0b24ge1xuICAgIGFuaW1hdGlvbjogbm9uZTtcbiAgICB0cmFuc2l0aW9uOiBub25lO1xuICB9XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIERhcmsgVGhlbWUgRW5oYW5jZW1lbnRzIC0gQWRkaXRpb25hbCBkYXJrIG1vZGUgcmVmaW5lbWVudHNcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cbltkYXRhLXRoZW1lPVwiZGFya1wiXSAuZGlhbG9nLFxuLmRhcmstdGhlbWUgLmRpYWxvZyB7XG4gIGJveC1zaGFkb3c6IDAgMjBweCA2MHB4IHJnYmEoMCwgMCwgMCwgMC42KSwgMCAwIDAgMXB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XG59XG5cbltkYXRhLXRoZW1lPVwiZGFya1wiXSAuZGlhbG9nLWhlYWRlcixcbi5kYXJrLXRoZW1lIC5kaWFsb2ctaGVhZGVyIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzFlM2E4YSAwJSwgIzFlMjkzYiAxMDAlKTtcbn1cblxuW2RhdGEtdGhlbWU9XCJkYXJrXCJdIC5kaWFsb2ctYm9keTo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2ssXG4uZGFyay10aGVtZSAuZGlhbG9nLWJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC10ZXJ0aWFyeSk7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIFByaW50IFN0eWxlcyAtIEhpZGUgZGlhbG9ncyB3aGVuIHByaW50aW5nXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5AbWVkaWEgcHJpbnQge1xuICAuZGlhbG9nLW92ZXJsYXkge1xuICAgIGRpc3BsYXk6IG5vbmU7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"],
        data: {
          animation: [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.trigger)('fadeIn', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.transition)(':enter', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 0
          }), (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.animate)('250ms cubic-bezier(0.4, 0, 0.2, 1)', (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 1
          }))]), (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.transition)(':leave', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.animate)('200ms cubic-bezier(0.4, 0, 0.2, 1)', (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 0
          }))])]), (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.trigger)('slideUp', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.transition)(':enter', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 0,
            transform: 'translateY(20px) scale(0.96)'
          }), (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.animate)('300ms cubic-bezier(0.4, 0, 0.2, 1)', (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          }))]), (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.transition)(':leave', [(0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.animate)('200ms cubic-bezier(0.4, 0, 0.2, 1)', (0,_angular_animations__WEBPACK_IMPORTED_MODULE_3__.style)({
            opacity: 0,
            transform: 'translateY(20px) scale(0.96)'
          }))])])]
        }
      });
    }
  }
  return DialogComponent;
})();
let DialogHeaderComponent = /*#__PURE__*/(() => {
  class DialogHeaderComponent {
    static {
      this.ɵfac = function DialogHeaderComponent_Factory(t) {
        return new (t || DialogHeaderComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: DialogHeaderComponent,
        selectors: [["ui-dialog-header"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c3,
        decls: 2,
        vars: 0,
        consts: [[1, "dialog-header"]],
        template: function DialogHeaderComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule],
        styles: [".dialog-header[_ngcontent-%COMP%] {\n      padding: 20px 24px 16px;\n      border-bottom: 1px solid #e5e7eb;\n    }\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9kaWFsb2cvZGlhbG9nLWhlYWRlci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJJQUFJO01BQ0UsdUJBQXVCO01BQ3ZCLGdDQUFnQztJQUNsQyIsInNvdXJjZXNDb250ZW50IjpbIiAgICAuZGlhbG9nLWhlYWRlciB7XG4gICAgICBwYWRkaW5nOiAyMHB4IDI0cHggMTZweDtcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTVlN2ViO1xuICAgIH0iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return DialogHeaderComponent;
})();
let DialogTitleComponent = /*#__PURE__*/(() => {
  class DialogTitleComponent {
    static {
      this.ɵfac = function DialogTitleComponent_Factory(t) {
        return new (t || DialogTitleComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: DialogTitleComponent,
        selectors: [["ui-dialog-title"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c3,
        decls: 2,
        vars: 0,
        consts: [[1, "dialog-title"]],
        template: function DialogTitleComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "h2", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule],
        styles: [".dialog-title[_ngcontent-%COMP%] {\n      margin: 0;\n      font-size: 20px;\n      font-weight: 600;\n      color: #111827;\n    }\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9kaWFsb2cvZGlhbG9nLXRpdGxlLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBQUk7TUFDRSxTQUFTO01BQ1QsZUFBZTtNQUNmLGdCQUFnQjtNQUNoQixjQUFjO0lBQ2hCIiwic291cmNlc0NvbnRlbnQiOlsiICAgIC5kaWFsb2ctdGl0bGUge1xuICAgICAgbWFyZ2luOiAwO1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgIGNvbG9yOiAjMTExODI3O1xuICAgIH0iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return DialogTitleComponent;
})();
let DialogContentComponent = /*#__PURE__*/(() => {
  class DialogContentComponent {
    static {
      this.ɵfac = function DialogContentComponent_Factory(t) {
        return new (t || DialogContentComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: DialogContentComponent,
        selectors: [["ui-dialog-content"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c3,
        decls: 2,
        vars: 0,
        consts: [[1, "dialog-content"]],
        template: function DialogContentComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule],
        styles: [".dialog-content[_ngcontent-%COMP%] {\n      padding: 20px 24px;\n      color: #374151;\n      line-height: 1.6;\n      flex: 1;\n      overflow-y: auto;\n    }\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9kaWFsb2cvZGlhbG9nLWNvbnRlbnQuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFBSTtNQUNFLGtCQUFrQjtNQUNsQixjQUFjO01BQ2QsZ0JBQWdCO01BQ2hCLE9BQU87TUFDUCxnQkFBZ0I7SUFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyIgICAgLmRpYWxvZy1jb250ZW50IHtcbiAgICAgIHBhZGRpbmc6IDIwcHggMjRweDtcbiAgICAgIGNvbG9yOiAjMzc0MTUxO1xuICAgICAgbGluZS1oZWlnaHQ6IDEuNjtcbiAgICAgIGZsZXg6IDE7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIH0iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return DialogContentComponent;
})();
let DialogFooterComponent = /*#__PURE__*/(() => {
  class DialogFooterComponent {
    static {
      this.ɵfac = function DialogFooterComponent_Factory(t) {
        return new (t || DialogFooterComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
        type: DialogFooterComponent,
        selectors: [["ui-dialog-footer"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c3,
        decls: 2,
        vars: 0,
        consts: [[1, "dialog-footer"]],
        template: function DialogFooterComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule],
        styles: [".dialog-footer[_ngcontent-%COMP%] {\n      padding: 16px 24px 20px;\n      border-top: 1px solid #e5e7eb;\n      display: flex;\n      gap: 12px;\n      justify-content: flex-end;\n    }\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS9kaWFsb2cvZGlhbG9nLWZvb3Rlci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJJQUFJO01BQ0UsdUJBQXVCO01BQ3ZCLDZCQUE2QjtNQUM3QixhQUFhO01BQ2IsU0FBUztNQUNULHlCQUF5QjtJQUMzQiIsInNvdXJjZXNDb250ZW50IjpbIiAgICAuZGlhbG9nLWZvb3RlciB7XG4gICAgICBwYWRkaW5nOiAxNnB4IDI0cHggMjBweDtcbiAgICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCAjZTVlN2ViO1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGdhcDogMTJweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gICAgfSJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return DialogFooterComponent;
})();

/***/ }),

/***/ 7568:
/*!************************************************!*\
  !*** ./src/app/services/bingx-user.service.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BingXUserService: () => (/* binding */ BingXUserService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exchange-environment.service */ 5731);







/**
 * BingX User Service
 *
 * Handles all BingX user-related operations including:
 * - Fetching user account information
 * - Managing account balance data
 * - Retrieving positions
 */
let BingXUserService = /*#__PURE__*/(() => {
  class BingXUserService {
    constructor(http, environmentService) {
      this.http = http;
      this.environmentService = environmentService;
      this.userInfoSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(null);
      this.loadingSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(false);
      this.errorSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(null);
      this.userInfo$ = this.userInfoSubject.asObservable();
      this.loading$ = this.loadingSubject.asObservable();
      this.error$ = this.errorSubject.asObservable();
      // React to environment changes - clear cached data when environment switches
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.effect)(() => {
        const env = this.environmentService.currentEnvironment();
        console.log('[BingXUserService] Environment changed to:', env);
        this.clearUserInfo();
      }, {
        allowSignalWrites: true
      });
    }
    /**
     * Get comprehensive BingX user information using stored API keys
     * This method uses the active BingX credentials from the backend
     * @returns Observable<BingXUserInfo>
     */
    getUserInfo() {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bingx', 'userInfo');
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(info => {
        this.userInfoSubject.next(info);
        this.loadingSubject.next(false);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Refresh user information using stored API keys
     */
    refreshUserInfo() {
      return this.getUserInfo();
    }
    /**
     * Get current user info from cache (if available)
     */
    getCurrentUserInfo() {
      return this.userInfoSubject.value;
    }
    /**
     * Clear cached user info
     */
    clearUserInfo() {
      this.userInfoSubject.next(null);
      this.errorSubject.next(null);
    }
    /**
     * Check if user info is currently loading
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
     * Calculate total portfolio value in USD
     */
    calculateTotalValue(userInfo) {
      if (!userInfo.success || !userInfo.data.accountInfo) {
        return 0;
      }
      const accountInfo = userInfo.data.accountInfo;
      if ('error' in accountInfo) {
        return 0;
      }
      return parseFloat(accountInfo.balance.equity || '0');
    }
    /**
     * Get active (non-zero) positions
     */
    getActivePositions(userInfo) {
      if (!userInfo.success || !userInfo.data.positions) {
        return [];
      }
      return userInfo.data.positions.filter(position => parseFloat(position.positionAmt) > 0);
    }
    /**
     * Calculate total unrealized PnL from positions
     */
    calculateUnrealizedPnl(userInfo) {
      const activePositions = this.getActivePositions(userInfo);
      return activePositions.reduce((total, position) => total + parseFloat(position.unrealizedProfit || '0'), 0);
    }
    /**
     * Get wallet balance
     */
    getWalletBalance() {
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bingx', 'walletBalance');
      const env = this.environmentService.currentEnvironment();
      const params = {
        environment: env
      };
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params);
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error fetching wallet balance:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Get tickers
     */
    getTickers(symbol) {
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bingx', 'tickers');
      const env = this.environmentService.currentEnvironment();
      const params = {
        environment: env
      };
      if (symbol) {
        params['symbol'] = symbol;
      }
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params);
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error fetching tickers:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Handle HTTP errors and return user-friendly messages
     */
    handleError(error) {
      console.error('BingX User Service Error:', error);
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 0) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (error.status === 401) {
        return 'Invalid API credentials. Please check your BingX API key and secret.';
      }
      if (error.status === 403) {
        return 'Access forbidden. Please check your API key permissions.';
      }
      if (error.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message || 'An unexpected error occurred. Please try again.';
    }
    static {
      this.ɵfac = function BingXUserService_Factory(t) {
        return new (t || BingXUserService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__.ExchangeEnvironmentService));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({
        token: BingXUserService,
        factory: BingXUserService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return BingXUserService;
})();

/***/ }),

/***/ 9894:
/*!************************************************!*\
  !*** ./src/app/services/bybit-user.service.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BybitUserService: () => (/* binding */ BybitUserService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exchange-environment.service */ 5731);







/**
 * Bybit User Service
 *
 * Handles all Bybit user-related operations including:
 * - Fetching user account information
 * - Testing API credentials
 * - Managing account balance data
 * - Retrieving positions and orders
 */
let BybitUserService = /*#__PURE__*/(() => {
  class BybitUserService {
    constructor(http, environmentService) {
      this.http = http;
      this.environmentService = environmentService;
      this.userInfoSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(null);
      this.loadingSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(false);
      this.errorSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(null);
      this.storedKeysSubject = new rxjs__WEBPACK_IMPORTED_MODULE_2__.BehaviorSubject(null);
      this.userInfo$ = this.userInfoSubject.asObservable();
      this.loading$ = this.loadingSubject.asObservable();
      this.error$ = this.errorSubject.asObservable();
      this.storedKeys$ = this.storedKeysSubject.asObservable();
      // React to environment changes - clear cached data when environment switches
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.effect)(() => {
        const env = this.environmentService.currentEnvironment();
        console.log('[BybitUserService] Environment changed to:', env);
        this.clearUserInfo();
      }, {
        allowSignalWrites: true
      });
    }
    /**
     * Get comprehensive Bybit user information using stored API keys
     * This method now only works with stored credentials in the backend
     * @returns Observable<BybitUserInfo>
     */
    getUserInfo() {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'userInfo');
      const env = this.environmentService.currentEnvironment();
      return this.http.get(url, {
        params: {
          environment: env
        }
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(info => {
        this.userInfoSubject.next(info);
        this.loadingSubject.next(false);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Refresh user information using stored API keys
     */
    refreshUserInfo() {
      return this.getUserInfo();
    }
    /**
     * Get current user info from cache (if available)
     */
    getCurrentUserInfo() {
      return this.userInfoSubject.value;
    }
    /**
     * Clear cached user info
     */
    clearUserInfo() {
      this.userInfoSubject.next(null);
      this.errorSubject.next(null);
    }
    /**
     * Check if user info is currently loading
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
     * Calculate total portfolio value in USD
     */
    calculateTotalValue(userInfo) {
      if (!userInfo.success || !userInfo.data.accountInfo) {
        return 0;
      }
      const accountInfo = userInfo.data.accountInfo;
      if ('error' in accountInfo) {
        return 0;
      }
      return parseFloat(accountInfo.totalEquity || '0');
    }
    /**
     * Get all non-zero coin balances
     */
    getNonZeroBalances(userInfo) {
      if (!userInfo.success || !userInfo.data.walletBalance) {
        return [];
      }
      const walletBalance = userInfo.data.walletBalance;
      if ('error' in walletBalance || !walletBalance.list || walletBalance.list.length === 0) {
        return [];
      }
      const coins = walletBalance.list[0].coin || [];
      return coins.filter(coin => parseFloat(coin.walletBalance) > 0);
    }
    /**
     * Get active (non-zero) positions
     */
    getActivePositions(userInfo) {
      if (!userInfo.success || !userInfo.data.positions) {
        return [];
      }
      return userInfo.data.positions.filter(position => parseFloat(position.size) > 0 && position.side !== 'None');
    }
    /**
     * Calculate total unrealized PnL from positions
     */
    calculateUnrealizedPnl(userInfo) {
      const activePositions = this.getActivePositions(userInfo);
      return activePositions.reduce((total, position) => total + parseFloat(position.unrealisedPnl || '0'), 0);
    }
    /**
     * Save API keys to the database
     * This method now validates AND saves the keys in a single operation
     * The backend tests the credentials before storing them
     * @param apiKey - Bybit API key
     * @param apiSecret - Bybit API secret
     * @param testnet - Whether to use testnet
     * @returns Observable<BybitSaveApiKeysResponse>
     */
    saveApiKeys(apiKey, apiSecret, testnet) {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const request = {
        apiKey,
        apiSecret,
        testnet
      };
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'apiKeys'), request).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          // Update stored keys status
          this.storedKeysSubject.next({
            success: true,
            data: {
              hasKeys: true,
              testnet,
              apiKeyPreview: this.maskApiKey(apiKey)
            },
            timestamp: new Date().toISOString()
          });
        }
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Get stored API keys information (without exposing actual keys)
     * @returns Observable<BybitStoredApiKeysResponse>
     */
    getStoredApiKeys() {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return this.http.get((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'storedApiKeys')).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
        this.loadingSubject.next(false);
        this.storedKeysSubject.next(response);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Delete stored API keys from the database
     * @returns Observable<BybitDeleteApiKeysResponse>
     */
    deleteApiKeys() {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return this.http.delete((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'deleteApiKeys')).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
        this.loadingSubject.next(false);
        if (response.success) {
          // Clear stored keys status
          this.storedKeysSubject.next(null);
          // Clear user info as well
          this.userInfoSubject.next(null);
        }
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.loadingSubject.next(false);
        const errorMessage = this.handleError(error);
        this.errorSubject.next(errorMessage);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Get current stored keys status
     */
    getStoredKeysStatus() {
      return this.storedKeysSubject.value;
    }
    /**
     * Check if user has stored API keys
     */
    hasStoredKeys() {
      const storedKeys = this.storedKeysSubject.value;
      return storedKeys?.data?.hasKeys ?? false;
    }
    /**
     * Get detailed wallet balance from Bybit
     * @param accountType - Account type (UNIFIED or CONTRACT)
     * @param coin - Optional specific coin to query
     * @returns Observable<BybitWalletBalanceResponse>
     */
    getWalletBalance(accountType = 'UNIFIED', coin) {
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'walletBalance');
      const env = this.environmentService.currentEnvironment();
      const params = {
        accountType,
        environment: env
      };
      if (coin) {
        params['coin'] = coin;
      }
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params);
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error fetching wallet balance:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Get asset information from Bybit
     * Retrieves detailed asset information for different account types
     * @param accountType - Optional account type (SPOT, CONTRACT, UNIFIED, etc.)
     * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
     * @returns Observable<BybitAssetInfoResponse>
     */
    getAssetInfo(accountType, coin) {
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'assetInfo');
      const env = this.environmentService.currentEnvironment();
      const params = {
        environment: env
      };
      if (accountType) {
        params['accountType'] = accountType.toUpperCase();
      }
      if (coin) {
        params['coin'] = coin.toUpperCase();
      }
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params);
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error fetching asset info:', error);
        const errorMessage = this.handleError(error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Get all coins balance from Bybit
     * Retrieves comprehensive balance information for all coins in a specific account type.
     * This endpoint can query the FUND (Funding wallet) where balances may be stored.
     *
     * @param accountType - Optional account type (UNIFIED, SPOT, CONTRACT, FUND, OPTION, etc.)
     *                      Default: FUND (Funding wallet)
     * @param coin - Optional specific coin to query (BTC, ETH, USDT, etc.)
     * @returns Observable<BybitAllCoinsBalanceResponse>
     */
    getAllCoinsBalance(accountType, coin) {
      const baseUrl = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('bybit', 'allCoinsBalance');
      const env = this.environmentService.currentEnvironment();
      const params = {
        environment: env
      };
      if (accountType) {
        params['accountType'] = accountType.toUpperCase();
      }
      if (coin) {
        params['coin'] = coin.toUpperCase();
      }
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.buildUrlWithQuery)(baseUrl, params);
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error fetching all coins balance:', error);
        const errorMessage = this.handleError(error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
      }));
    }
    /**
     * Mask API key for display (show only last 4 characters)
     */
    maskApiKey(apiKey) {
      if (apiKey.length <= 4) {
        return '****';
      }
      return '****' + apiKey.slice(-4);
    }
    /**
     * Handle HTTP errors and return user-friendly messages
     */
    handleError(error) {
      console.error('Bybit User Service Error:', error);
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 0) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (error.status === 401) {
        return 'Invalid API credentials. Please check your Bybit API key and secret.';
      }
      if (error.status === 403) {
        return 'Access forbidden. Please check your API key permissions.';
      }
      if (error.status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message || 'An unexpected error occurred. Please try again.';
    }
    static {
      this.ɵfac = function BybitUserService_Factory(t) {
        return new (t || BybitUserService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__.ExchangeEnvironmentService));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({
        token: BybitUserService,
        factory: BybitUserService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return BybitUserService;
})();

/***/ }),

/***/ 8802:
/*!*************************************************!*\
  !*** ./src/app/services/google-auth.service.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GoogleAuthService: () => (/* binding */ GoogleAuthService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 8764);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../environments/environment */ 5312);
/* harmony import */ var _auth_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./auth.service */ 4796);








let GoogleAuthService = /*#__PURE__*/(() => {
  class GoogleAuthService {
    constructor(http, authService) {
      this.http = http;
      this.authService = authService;
      this.isLinking = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.signal)(false);
      this.isUnlinking = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.signal)(false);
      this.isLinking$ = this.isLinking.asReadonly();
      this.isUnlinking$ = this.isUnlinking.asReadonly();
    }
    getAuthHeaders() {
      const token = this.authService.authState().token;
      return new _angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    /**
     * Initiate Google OAuth login
     * This should redirect to Google OAuth or return a URL for redirect
     */
    loginWithGoogle() {
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('google', 'auth'), {}).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error initiating Google login:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Handle Google OAuth callback
     * This processes the authorization code received from Google
     */
    handleGoogleCallback(code, state) {
      return this.http.post(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('google', 'auth')}/callback`, {
        code,
        state
      }).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error handling Google callback:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Link existing account with Google
     * For users who are already logged in and want to connect their Google account
     */
    linkGoogleAccount(googleToken) {
      this.isLinking.set(true);
      const headers = this.getAuthHeaders();
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('google', 'link'), {
        googleToken
      }, {
        headers
      }).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.tap)(() => this.isLinking.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.isLinking.set(false);
        console.error('Error linking Google account:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Unlink Google account from current user
     */
    unlinkGoogleAccount() {
      this.isUnlinking.set(true);
      const headers = this.getAuthHeaders();
      return this.http.post((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('google', 'unlink'), {}, {
        headers
      }).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_7__.tap)(() => this.isUnlinking.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this.isUnlinking.set(false);
        console.error('Error unlinking Google account:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Get Google account linking status
     */
    getGoogleLinkStatus() {
      const headers = this.getAuthHeaders();
      return this.http.get(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('google', 'link')}/status`, {
        headers
      }).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        console.error('Error getting Google link status:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => error);
      }));
    }
    /**
     * Initialize Google Sign-In button
     * This sets up the Google Sign-In button for client-side authentication
     */
    initializeGoogleSignIn(containerId) {
      // Load Google Sign-In script if not already loaded
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.renderGoogleButton(containerId);
        };
        document.head.appendChild(script);
      } else if (window.google) {
        this.renderGoogleButton(containerId);
      }
    }
    renderGoogleButton(containerId) {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: _environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.googleClientId,
          callback: response => {
            this.handleClientSideGoogleResponse(response);
          }
        });
        window.google.accounts.id.renderButton(document.getElementById(containerId), {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular'
        });
      }
    }
    handleClientSideGoogleResponse(response) {
      // Handle the JWT token from Google
      const credential = response.credential;
      if (credential) {
        this.linkGoogleAccount(credential).subscribe({
          next: result => {
            console.log('Google account linked successfully:', result);
            // Update user data or show success message
          },
          error: error => {
            console.error('Failed to link Google account:', error);
            // Show error message
          }
        });
      }
    }
    /**
     * Create Google OAuth URL for manual redirect
     */
    createGoogleAuthUrl(redirectUri, state) {
      const params = new URLSearchParams({
        client_id: _environments_environment__WEBPACK_IMPORTED_MODULE_1__.environment.googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
      });
      if (state) {
        params.append('state', state);
      }
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    static {
      this.ɵfac = function GoogleAuthService_Factory(t) {
        return new (t || GoogleAuthService)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵinject"](_auth_service__WEBPACK_IMPORTED_MODULE_2__.AuthService));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjectable"]({
        token: GoogleAuthService,
        factory: GoogleAuthService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return GoogleAuthService;
})();

/***/ }),

/***/ 9885:
/*!******************************************!*\
  !*** ./src/app/services/user.service.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UserService: () => (/* binding */ UserService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 8764);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common/http */ 6443);





let UserService = /*#__PURE__*/(() => {
  class UserService {
    constructor(http) {
      this.http = http;
      this.isUpdatingPreferences = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false);
      this.isLoadingMessages = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(false);
      this.isUpdatingPreferences$ = this.isUpdatingPreferences.asReadonly();
      this.isLoadingMessages$ = this.isLoadingMessages.asReadonly();
    }
    // Get user preferences
    getPreferences() {
      return this.http.get((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'preferences')).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error fetching preferences:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Update user preferences
    updatePreferences(preferences) {
      this.isUpdatingPreferences.set(true);
      return this.http.put((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'preferences'), preferences).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(() => this.isUpdatingPreferences.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        this.isUpdatingPreferences.set(false);
        console.error('Error updating preferences:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Get user messages
    getMessages(page = 1, limit = 20, unreadOnly = false) {
      this.isLoadingMessages.set(true);
      const params = `?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`;
      return this.http.get(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'messages')}${params}`).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(() => this.isLoadingMessages.set(false)), (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        this.isLoadingMessages.set(false);
        console.error('Error fetching messages:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Mark message as read
    markMessageAsRead(messageId) {
      return this.http.patch(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'messages')}/${messageId}/read`, {}).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error marking message as read:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Mark all messages as read
    markAllMessagesAsRead() {
      return this.http.patch(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'messages')}/read-all`, {}).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error marking all messages as read:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Delete message
    deleteMessage(messageId) {
      return this.http.delete(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'messages')}/${messageId}`).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error deleting message:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Get notification settings
    getNotificationSettings() {
      return this.http.get((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'notifications')).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error fetching notification settings:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Update notification settings
    updateNotificationSettings(settings) {
      return this.http.put((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'notifications'), settings).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error updating notification settings:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Update user profile
    updateProfile(profileData) {
      return this.http.put((0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'profile'), profileData).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error updating profile:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Upload avatar
    uploadAvatar(file) {
      const formData = new FormData();
      formData.append('avatar', file);
      return this.http.post(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'profile')}/avatar`, formData).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error uploading avatar:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    // Execute message action
    executeMessageAction(messageId, action) {
      return this.http.post(`${(0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('user', 'messages')}/${messageId}/action`, {
        action: action.action,
        data: action.data
      }).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.catchError)(error => {
        console.error('Error executing message action:', error);
        return (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.throwError)(() => error);
      }));
    }
    static {
      this.ɵfac = function UserService_Factory(t) {
        return new (t || UserService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_5__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
        token: UserService,
        factory: UserService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return UserService;
})();

/***/ })

}]);
//# sourceMappingURL=245.js.map