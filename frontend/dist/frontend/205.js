"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[205],{

/***/ 205:
/*!*****************************************************!*\
  !*** ./src/app/components/login/login.component.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LoginComponent: () => (/* binding */ LoginComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ui/button/button.component */ 5782);
/* harmony import */ var _services_auth_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/auth.service */ 4796);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/translation.service */ 6845);









function LoginComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 3)(1, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "\u23F0");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.sessionMessage(), " ");
  }
}
function LoginComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 4)(1, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2, "\u26A0\uFE0F");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](4, "ui-button", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function LoginComponent_Conditional_8_Template_ui_button_clicked_4_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r2);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r0.clearError());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](5, "\u00D7");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.authError(), " ");
  }
}
function LoginComponent_Conditional_9_Conditional_5_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.emailRequired"), " ");
  }
}
function LoginComponent_Conditional_9_Conditional_5_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.validEmail"), " ");
  }
}
function LoginComponent_Conditional_9_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, LoginComponent_Conditional_9_Conditional_5_Conditional_1_Template, 1, 1)(2, LoginComponent_Conditional_9_Conditional_5_Conditional_2_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    let tmp_2_0;
    let tmp_3_0;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_2_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_2_0.hasError("required")) ? 1 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_3_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_3_0.hasError("email")) ? 2 : -1);
  }
}
function LoginComponent_Conditional_9_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.passwordRequired"), " ");
  }
}
function LoginComponent_Conditional_9_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("login.signingIn"), " ");
  }
}
function LoginComponent_Conditional_9_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("login.signIn"), " ");
  }
}
function LoginComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "form", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function LoginComponent_Conditional_9_Template_form_ngSubmit_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r3);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r0.onLogin());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 13)(2, "label", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "input", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](5, LoginComponent_Conditional_9_Conditional_5_Template, 3, 2, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](6, "div", 13)(7, "label", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](9, "input", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](10, LoginComponent_Conditional_9_Conditional_10_Template, 2, 1, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "ui-button", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](12, LoginComponent_Conditional_9_Conditional_12_Template, 2, 1)(13, LoginComponent_Conditional_9_Conditional_13_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    let tmp_3_0;
    let tmp_5_0;
    let tmp_7_0;
    let tmp_9_0;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("formGroup", ctx_r0.loginForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.emailAddress"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("is-invalid", ((tmp_3_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_3_0.invalid) && ((tmp_3_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_3_0.touched));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx_r0.translate("login.enterEmail"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_5_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_5_0.invalid) && ((tmp_5_0 = ctx_r0.loginForm.get("email")) == null ? null : tmp_5_0.touched) ? 5 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.password"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("is-invalid", ((tmp_7_0 = ctx_r0.loginForm.get("password")) == null ? null : tmp_7_0.invalid) && ((tmp_7_0 = ctx_r0.loginForm.get("password")) == null ? null : tmp_7_0.touched));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx_r0.translate("login.enterPassword"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_9_0 = ctx_r0.loginForm.get("password")) == null ? null : tmp_9_0.invalid) && ((tmp_9_0 = ctx_r0.loginForm.get("password")) == null ? null : tmp_9_0.touched) ? 10 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", ctx_r0.loginForm.invalid || ctx_r0.isLoading());
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx_r0.isLoading() ? 12 : 13);
  }
}
function LoginComponent_Conditional_10_Conditional_9_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.emailRequired"), " ");
  }
}
function LoginComponent_Conditional_10_Conditional_9_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.validEmail"), " ");
  }
}
function LoginComponent_Conditional_10_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, LoginComponent_Conditional_10_Conditional_9_Conditional_1_Template, 1, 1)(2, LoginComponent_Conditional_10_Conditional_9_Conditional_2_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    let tmp_2_0;
    let tmp_3_0;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_2_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_2_0.hasError("required")) ? 1 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_3_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_3_0.hasError("email")) ? 2 : -1);
  }
}
function LoginComponent_Conditional_10_Conditional_14_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.passwordRequired"), " ");
  }
}
function LoginComponent_Conditional_10_Conditional_14_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("validation.passwordMinLength"), " ");
  }
}
function LoginComponent_Conditional_10_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](1, LoginComponent_Conditional_10_Conditional_14_Conditional_1_Template, 1, 1)(2, LoginComponent_Conditional_10_Conditional_14_Conditional_2_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    let tmp_2_0;
    let tmp_3_0;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_2_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_2_0.hasError("required")) ? 1 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_3_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_3_0.hasError("minlength")) ? 2 : -1);
  }
}
function LoginComponent_Conditional_10_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](0, "span", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("login.creatingAccount"), " ");
  }
}
function LoginComponent_Conditional_10_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](0);
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx_r0.translate("login.createAccountBtn"), " ");
  }
}
function LoginComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "form", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("ngSubmit", function LoginComponent_Conditional_10_Template_form_ngSubmit_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r4);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r0.onRegister());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](1, "div", 13)(2, "label", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](4, "input", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "div", 13)(6, "label", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](8, "input", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](9, LoginComponent_Conditional_10_Conditional_9_Template, 3, 2, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](10, "div", 13)(11, "label", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelement"](13, "input", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](14, LoginComponent_Conditional_10_Conditional_14_Template, 3, 2, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "ui-button", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](16, LoginComponent_Conditional_10_Conditional_16_Template, 2, 1)(17, LoginComponent_Conditional_10_Conditional_17_Template, 1, 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    let tmp_5_0;
    let tmp_7_0;
    let tmp_9_0;
    let tmp_11_0;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("formGroup", ctx_r0.registerForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.fullName"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx_r0.translate("login.enterFullName"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.emailAddress"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("is-invalid", ((tmp_5_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_5_0.invalid) && ((tmp_5_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_5_0.touched));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx_r0.translate("login.enterEmail"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_7_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_7_0.invalid) && ((tmp_7_0 = ctx_r0.registerForm.get("email")) == null ? null : tmp_7_0.touched) ? 9 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.password"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵclassProp"]("is-invalid", ((tmp_9_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_9_0.invalid) && ((tmp_9_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_9_0.touched));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("placeholder", ctx_r0.translate("login.createSecurePassword"));
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](((tmp_11_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_11_0.invalid) && ((tmp_11_0 = ctx_r0.registerForm.get("password")) == null ? null : tmp_11_0.touched) ? 14 : -1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", ctx_r0.registerForm.invalid || ctx_r0.isLoading());
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx_r0.isLoading() ? 16 : 17);
  }
}
function LoginComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "a", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function LoginComponent_Conditional_19_Template_a_click_2_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r5);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r0.toggleMode());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("", ctx_r0.translate("login.dontHaveAccount"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.signUpHere"));
  }
}
function LoginComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](2, "a", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("click", function LoginComponent_Conditional_20_Template_a_click_2_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r6);
      const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r0.toggleMode());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("", ctx_r0.translate("login.alreadyHaveAccount"), " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx_r0.translate("login.signInHere"));
  }
}
let LoginComponent = /*#__PURE__*/(() => {
  class LoginComponent {
    constructor(fb, authService, router, route, translationService) {
      this.fb = fb;
      this.authService = authService;
      this.router = router;
      this.route = route;
      this.translationService = translationService;
      // Signals for component state
      this.showRegisterSignal = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.signal)(false);
      // Computed values
      this.showRegister = this.showRegisterSignal.asReadonly();
      this.isLoading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.authService.isLoading());
      this.authError = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => this.authService.error());
      this.sessionMessage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.computed)(() => {
        if (this.loginReason === 'session_expired') {
          return this.translate('auth.sessionExpired');
        }
        return null;
      });
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
      this.loginReason = this.route.snapshot.queryParams['reason'] || null;
      this.loginForm = this.fb.group({
        email: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.email]],
        password: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required]
      });
      this.registerForm = this.fb.group({
        name: [''],
        email: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.email]],
        password: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.Validators.minLength(6)]]
      });
      // Effect to navigate when authenticated
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_3__.effect)(() => {
        if (this.authService.isAuthenticated()) {
          this.router.navigate([this.returnUrl]);
        }
      });
    }
    onLogin() {
      if (this.loginForm.valid) {
        const {
          email,
          password
        } = this.loginForm.value;
        this.authService.login(email, password).subscribe();
      }
    }
    onRegister() {
      if (this.registerForm.valid) {
        const {
          email,
          password,
          name
        } = this.registerForm.value;
        this.authService.register(email, password, name).subscribe();
      }
    }
    loginWithGoogle() {
      // Placeholder for Google login
      // In a real app, this would integrate with Google Identity Services
      console.log('Google login clicked');
      alert('Google login would be implemented with Google Identity Services');
    }
    toggleMode() {
      this.showRegisterSignal.update(value => !value);
      this.clearError();
      this.resetForms();
    }
    clearError() {
      this.authService.clearError();
    }
    translate(key, params) {
      return this.translationService.translate(key, params);
    }
    resetForms() {
      this.loginForm.reset();
      this.registerForm.reset();
      this.loginForm.markAsUntouched();
      this.registerForm.markAsUntouched();
    }
    static {
      this.ɵfac = function LoginComponent_Factory(t) {
        return new (t || LoginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_4__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_auth_service__WEBPACK_IMPORTED_MODULE_1__.AuthService), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_5__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_translation_service__WEBPACK_IMPORTED_MODULE_2__.TranslationService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
        type: LoginComponent,
        selectors: [["app-login"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
        decls: 21,
        vars: 10,
        consts: [[1, "auth-container"], [1, "auth-card"], [1, "auth-header"], [1, "alert", "alert-warning"], [1, "alert", "alert-error"], [1, "auth-form", 3, "formGroup"], [1, "divider"], ["variant", "secondary", "size", "large", "className", "btn-google btn-full", 3, "clicked", "disabled"], [1, "google-icon"], [1, "auth-footer"], [1, "alert-icon"], ["variant", "ghost", "size", "small", "type", "button", "className", "alert-close", 3, "clicked"], [1, "auth-form", 3, "ngSubmit", "formGroup"], [1, "form-group"], ["for", "loginEmail", 1, "form-label"], ["type", "email", "id", "loginEmail", "formControlName", "email", 1, "form-control", 3, "placeholder"], [1, "invalid-feedback"], ["for", "loginPassword", 1, "form-label"], ["type", "password", "id", "loginPassword", "formControlName", "password", 1, "form-control", 3, "placeholder"], ["type", "submit", "variant", "primary", "size", "large", "className", "btn-full", 3, "disabled"], [1, "spinner"], ["for", "registerName", 1, "form-label"], ["type", "text", "id", "registerName", "formControlName", "name", 1, "form-control", 3, "placeholder"], ["for", "registerEmail", 1, "form-label"], ["type", "email", "id", "registerEmail", "formControlName", "email", 1, "form-control", 3, "placeholder"], ["for", "registerPassword", 1, "form-label"], ["type", "password", "id", "registerPassword", "formControlName", "password", 1, "form-control", 3, "placeholder"], [1, "link", 3, "click"]],
        template: function LoginComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h1");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](5, "p");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](7, LoginComponent_Conditional_7_Template, 4, 1, "div", 3)(8, LoginComponent_Conditional_8_Template, 6, 1, "div", 4)(9, LoginComponent_Conditional_9_Template, 14, 13, "form", 5)(10, LoginComponent_Conditional_10_Template, 18, 15, "form", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](11, "div", 6)(12, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](13);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](14, "ui-button", 7);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("clicked", function LoginComponent_Template_ui_button_clicked_14_listener() {
              return ctx.loginWithGoogle();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](15, "span", 8);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](16, "\uD83D\uDD0D");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](17);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](18, "div", 9);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](19, LoginComponent_Conditional_19_Template, 4, 2, "p")(20, LoginComponent_Conditional_20_Template, 4, 2, "p");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.showRegister() ? ctx.translate("login.joinUs") : ctx.translate("login.welcomeBack"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.showRegister() ? ctx.translate("login.createAccount") : ctx.translate("login.signInToAccount"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx.sessionMessage() ? 7 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx.authError() ? 8 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](!ctx.showRegister() ? 9 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](ctx.showRegister() ? 10 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate"](ctx.translate("login.or"));
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("disabled", ctx.isLoading());
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"](" ", ctx.translate("login.continueWithGoogle"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵconditional"](!ctx.showRegister() ? 19 : 20);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_6__.CommonModule, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_4__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_4__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_4__.FormControlName, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__.ButtonComponent],
        styles: [".auth-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 70vh;\n  padding: 2rem;\n}\n\n.auth-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 12px;\n  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);\n  padding: 2.5rem;\n  width: 100%;\n  max-width: 420px;\n  border: 1px solid rgba(0, 0, 0, 0.05);\n}\n\n.auth-header[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 2rem;\n}\n.auth-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.75rem;\n  font-weight: 700;\n  color: #1a1a1a;\n}\n.auth-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #666;\n  font-size: 0.95rem;\n}\n\n.alert[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-radius: 8px;\n  margin-bottom: 1.5rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  position: relative;\n}\n.alert.alert-error[_ngcontent-%COMP%] {\n  background: #fef2f2;\n  border: 1px solid #fecaca;\n  color: #dc2626;\n}\n.alert[_ngcontent-%COMP%]   .alert-close[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0.75rem;\n  background: none;\n  border: none;\n  font-size: 1.25rem;\n  cursor: pointer;\n  color: inherit;\n  opacity: 0.7;\n}\n.alert[_ngcontent-%COMP%]   .alert-close[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n\n.auth-form[_ngcontent-%COMP%] {\n  margin-bottom: 1.5rem;\n}\n\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n\n.form-label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #374151;\n  font-size: 0.9rem;\n}\n\n.form-control[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.75rem 1rem;\n  border: 2px solid #e5e7eb;\n  border-radius: 8px;\n  font-size: 1rem;\n  transition: all 0.2s ease;\n  background: #f9fafb;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #3b82f6;\n  background: white;\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n}\n.form-control.is-invalid[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n  background: #fef2f2;\n}\n.form-control[_ngcontent-%COMP%]::placeholder {\n  color: #9ca3af;\n}\n\n.invalid-feedback[_ngcontent-%COMP%] {\n  color: #ef4444;\n  font-size: 0.875rem;\n  margin-top: 0.25rem;\n  display: block;\n}\n\n.btn[_ngcontent-%COMP%] {\n  padding: 0.875rem 1.5rem;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  font-size: 1rem;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  text-decoration: none;\n}\n.btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n\n.btn-full[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.btn-primary[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);\n}\n\n.btn-google[_ngcontent-%COMP%] {\n  background: white;\n  border: 2px solid #e5e7eb;\n  color: #374151;\n}\n.btn-google[_ngcontent-%COMP%]:hover:not(:disabled) {\n  border-color: #d1d5db;\n  background: #f9fafb;\n}\n\n.google-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n\n.spinner[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  border: 2px solid transparent;\n  border-top: 2px solid currentColor;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.divider[_ngcontent-%COMP%] {\n  text-align: center;\n  margin: 1.5rem 0;\n  position: relative;\n  color: #9ca3af;\n  font-size: 0.875rem;\n}\n.divider[_ngcontent-%COMP%]::before {\n  content: \"\";\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: #e5e7eb;\n}\n.divider[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  background: white;\n  padding: 0 1rem;\n  position: relative;\n  z-index: 1;\n}\n\n.auth-footer[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-top: 1.5rem;\n  padding-top: 1.5rem;\n  border-top: 1px solid #f3f4f6;\n}\n.auth-footer[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #6b7280;\n  font-size: 0.9rem;\n}\n\n.link[_ngcontent-%COMP%] {\n  color: #3b82f6;\n  cursor: pointer;\n  font-weight: 600;\n  text-decoration: none;\n}\n.link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9sb2dpbi9sb2dpbi5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGFBQUE7RUFDQSxtQkFBQTtFQUNBLHVCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxhQUFBO0FBQ0Y7O0FBRUE7RUFDRSxpQkFBQTtFQUNBLG1CQUFBO0VBQ0EseUNBQUE7RUFDQSxlQUFBO0VBQ0EsV0FBQTtFQUNBLGdCQUFBO0VBQ0EscUNBQUE7QUFDRjs7QUFFQTtFQUNFLGtCQUFBO0VBQ0EsbUJBQUE7QUFDRjtBQUNFO0VBQ0Usb0JBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtBQUNKO0FBRUU7RUFDRSxTQUFBO0VBQ0EsV0FBQTtFQUNBLGtCQUFBO0FBQUo7O0FBSUE7RUFDRSxhQUFBO0VBQ0Esa0JBQUE7RUFDQSxxQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLFdBQUE7RUFDQSxrQkFBQTtBQURGO0FBR0U7RUFDRSxtQkFBQTtFQUNBLHlCQUFBO0VBQ0EsY0FBQTtBQURKO0FBSUU7RUFDRSxrQkFBQTtFQUNBLGNBQUE7RUFDQSxnQkFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtBQUZKO0FBSUk7RUFDRSxVQUFBO0FBRk47O0FBT0E7RUFDRSxxQkFBQTtBQUpGOztBQU9BO0VBQ0Usc0JBQUE7QUFKRjs7QUFPQTtFQUNFLGNBQUE7RUFDQSxxQkFBQTtFQUNBLGdCQUFBO0VBQ0EsY0FBQTtFQUNBLGlCQUFBO0FBSkY7O0FBT0E7RUFDRSxXQUFBO0VBQ0EscUJBQUE7RUFDQSx5QkFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtFQUNBLHlCQUFBO0VBQ0EsbUJBQUE7QUFKRjtBQU1FO0VBQ0UsYUFBQTtFQUNBLHFCQUFBO0VBQ0EsaUJBQUE7RUFDQSw2Q0FBQTtBQUpKO0FBT0U7RUFDRSxxQkFBQTtFQUNBLG1CQUFBO0FBTEo7QUFRRTtFQUNFLGNBQUE7QUFOSjs7QUFVQTtFQUNFLGNBQUE7RUFDQSxtQkFBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQVBGOztBQVVBO0VBQ0Usd0JBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxlQUFBO0VBQ0EseUJBQUE7RUFDQSxvQkFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSxXQUFBO0VBQ0EscUJBQUE7QUFQRjtBQVNFO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBUEo7O0FBV0E7RUFDRSxXQUFBO0FBUkY7O0FBV0E7RUFDRSw2REFBQTtFQUNBLFlBQUE7QUFSRjtBQVVFO0VBQ0UsMkJBQUE7RUFDQSwrQ0FBQTtBQVJKOztBQVlBO0VBQ0UsaUJBQUE7RUFDQSx5QkFBQTtFQUNBLGNBQUE7QUFURjtBQVdFO0VBQ0UscUJBQUE7RUFDQSxtQkFBQTtBQVRKOztBQWFBO0VBQ0UsaUJBQUE7QUFWRjs7QUFhQTtFQUNFLFdBQUE7RUFDQSxZQUFBO0VBQ0EsNkJBQUE7RUFDQSxrQ0FBQTtFQUNBLGtCQUFBO0VBQ0Esa0NBQUE7QUFWRjs7QUFhQTtFQUNFO0lBQ0UseUJBQUE7RUFWRjtBQUNGO0FBYUE7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxjQUFBO0VBQ0EsbUJBQUE7QUFYRjtBQWFFO0VBQ0UsV0FBQTtFQUNBLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLE9BQUE7RUFDQSxRQUFBO0VBQ0EsV0FBQTtFQUNBLG1CQUFBO0FBWEo7QUFjRTtFQUNFLGlCQUFBO0VBQ0EsZUFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtBQVpKOztBQWdCQTtFQUNFLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxtQkFBQTtFQUNBLDZCQUFBO0FBYkY7QUFlRTtFQUNFLFNBQUE7RUFDQSxjQUFBO0VBQ0EsaUJBQUE7QUFiSjs7QUFpQkE7RUFDRSxjQUFBO0VBQ0EsZUFBQTtFQUNBLGdCQUFBO0VBQ0EscUJBQUE7QUFkRjtBQWdCRTtFQUNFLDBCQUFBO0FBZEoiLCJzb3VyY2VzQ29udGVudCI6WyIuYXV0aC1jb250YWluZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbWluLWhlaWdodDogNzB2aDtcbiAgcGFkZGluZzogMnJlbTtcbn1cblxuLmF1dGgtY2FyZCB7XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBib3gtc2hhZG93OiAwIDRweCAyNXB4IHJnYmEoMCwgMCwgMCwgMC4xKTtcbiAgcGFkZGluZzogMi41cmVtO1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiA0MjBweDtcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjA1KTtcbn1cblxuLmF1dGgtaGVhZGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBtYXJnaW4tYm90dG9tOiAycmVtO1xuXG4gIGgxIHtcbiAgICBtYXJnaW46IDAgMCAwLjVyZW0gMDtcbiAgICBmb250LXNpemU6IDEuNzVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBjb2xvcjogIzFhMWExYTtcbiAgfVxuXG4gIHAge1xuICAgIG1hcmdpbjogMDtcbiAgICBjb2xvcjogIzY2NjtcbiAgICBmb250LXNpemU6IDAuOTVyZW07XG4gIH1cbn1cblxuLmFsZXJ0IHtcbiAgcGFkZGluZzogMXJlbTtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMC41cmVtO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG5cbiAgJi5hbGVydC1lcnJvciB7XG4gICAgYmFja2dyb3VuZDogI2ZlZjJmMjtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjZmVjYWNhO1xuICAgIGNvbG9yOiAjZGMyNjI2O1xuICB9XG5cbiAgLmFsZXJ0LWNsb3NlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgcmlnaHQ6IDAuNzVyZW07XG4gICAgYmFja2dyb3VuZDogbm9uZTtcbiAgICBib3JkZXI6IG5vbmU7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBvcGFjaXR5OiAwLjc7XG4gICAgXG4gICAgJjpob3ZlciB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cbiAgfVxufVxuXG4uYXV0aC1mb3JtIHtcbiAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xufVxuXG4uZm9ybS1ncm91cCB7XG4gIG1hcmdpbi1ib3R0b206IDEuMjVyZW07XG59XG5cbi5mb3JtLWxhYmVsIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIG1hcmdpbi1ib3R0b206IDAuNXJlbTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgY29sb3I6ICMzNzQxNTE7XG4gIGZvbnQtc2l6ZTogMC45cmVtO1xufVxuXG4uZm9ybS1jb250cm9sIHtcbiAgd2lkdGg6IDEwMCU7XG4gIHBhZGRpbmc6IDAuNzVyZW0gMXJlbTtcbiAgYm9yZGVyOiAycHggc29saWQgI2U1ZTdlYjtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBmb250LXNpemU6IDFyZW07XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gIGJhY2tncm91bmQ6ICNmOWZhZmI7XG5cbiAgJjpmb2N1cyB7XG4gICAgb3V0bGluZTogbm9uZTtcbiAgICBib3JkZXItY29sb3I6ICMzYjgyZjY7XG4gICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgYm94LXNoYWRvdzogMCAwIDAgM3B4IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjEpO1xuICB9XG5cbiAgJi5pcy1pbnZhbGlkIHtcbiAgICBib3JkZXItY29sb3I6ICNlZjQ0NDQ7XG4gICAgYmFja2dyb3VuZDogI2ZlZjJmMjtcbiAgfVxuXG4gICY6OnBsYWNlaG9sZGVyIHtcbiAgICBjb2xvcjogIzljYTNhZjtcbiAgfVxufVxuXG4uaW52YWxpZC1mZWVkYmFjayB7XG4gIGNvbG9yOiAjZWY0NDQ0O1xuICBmb250LXNpemU6IDAuODc1cmVtO1xuICBtYXJnaW4tdG9wOiAwLjI1cmVtO1xuICBkaXNwbGF5OiBibG9jaztcbn1cblxuLmJ0biB7XG4gIHBhZGRpbmc6IDAuODc1cmVtIDEuNXJlbTtcbiAgYm9yZGVyOiBub25lO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGZvbnQtc2l6ZTogMXJlbTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGdhcDogMC41cmVtO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG5cbiAgJjpkaXNhYmxlZCB7XG4gICAgb3BhY2l0eTogMC42O1xuICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gIH1cbn1cblxuLmJ0bi1mdWxsIHtcbiAgd2lkdGg6IDEwMCU7XG59XG5cbi5idG4tcHJpbWFyeSB7XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM2NjdlZWEgMCUsICM3NjRiYTIgMTAwJSk7XG4gIGNvbG9yOiB3aGl0ZTtcblxuICAmOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XG4gICAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDEwMiwgMTI2LCAyMzQsIDAuNCk7XG4gIH1cbn1cblxuLmJ0bi1nb29nbGUge1xuICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgYm9yZGVyOiAycHggc29saWQgI2U1ZTdlYjtcbiAgY29sb3I6ICMzNzQxNTE7XG5cbiAgJjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gICAgYm9yZGVyLWNvbG9yOiAjZDFkNWRiO1xuICAgIGJhY2tncm91bmQ6ICNmOWZhZmI7XG4gIH1cbn1cblxuLmdvb2dsZS1pY29uIHtcbiAgZm9udC1zaXplOiAxLjFyZW07XG59XG5cbi5zcGlubmVyIHtcbiAgd2lkdGg6IDE2cHg7XG4gIGhlaWdodDogMTZweDtcbiAgYm9yZGVyOiAycHggc29saWQgdHJhbnNwYXJlbnQ7XG4gIGJvcmRlci10b3A6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTtcbn1cblxuQGtleWZyYW1lcyBzcGluIHtcbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XG4gIH1cbn1cblxuLmRpdmlkZXIge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIG1hcmdpbjogMS41cmVtIDA7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgY29sb3I6ICM5Y2EzYWY7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG5cbiAgJjo6YmVmb3JlIHtcbiAgICBjb250ZW50OiAnJztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA1MCU7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBoZWlnaHQ6IDFweDtcbiAgICBiYWNrZ3JvdW5kOiAjZTVlN2ViO1xuICB9XG5cbiAgc3BhbiB7XG4gICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgcGFkZGluZzogMCAxcmVtO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB6LWluZGV4OiAxO1xuICB9XG59XG5cbi5hdXRoLWZvb3RlciB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xuICBwYWRkaW5nLXRvcDogMS41cmVtO1xuICBib3JkZXItdG9wOiAxcHggc29saWQgI2YzZjRmNjtcblxuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gICAgY29sb3I6ICM2YjcyODA7XG4gICAgZm9udC1zaXplOiAwLjlyZW07XG4gIH1cbn1cblxuLmxpbmsge1xuICBjb2xvcjogIzNiODJmNjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LXdlaWdodDogNjAwO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG5cbiAgJjpob3ZlciB7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG4gIH1cbn0iXSwic291cmNlUm9vdCI6IiJ9 */"]
      });
    }
  }
  return LoginComponent;
})();

/***/ })

}]);
//# sourceMappingURL=205.js.map