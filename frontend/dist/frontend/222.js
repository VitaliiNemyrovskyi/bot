"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[222],{

/***/ 9222:
/*!******************************************************!*\
  !*** ./src/app/components/ui/tabs/tabs.component.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TabContentComponent: () => (/* binding */ TabContentComponent),
/* harmony export */   TabsComponent: () => (/* binding */ TabsComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ 316);




const _c0 = ["*"];
function TabsComponent_button_2_span_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "span");
  }
  if (rf & 2) {
    const tab_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"]("tab-icon " + tab_r2.icon);
  }
}
function TabsComponent_button_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function TabsComponent_button_2_Template_button_click_0_listener() {
      const tab_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r1).$implicit;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵresetView"](ctx_r2.selectTab(tab_r2.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](1, TabsComponent_button_2_span_1_Template, 1, 2, "span", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "span", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const tab_r2 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx_r2.getTabClasses(tab_r2));
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("disabled", tab_r2.disabled)("id", "tab-" + tab_r2.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵattribute"]("aria-selected", tab_r2.id === ctx_r2.activeTabId)("aria-controls", "tabpanel-" + tab_r2.id);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", tab_r2.icon);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate"](tab_r2.label);
  }
}
let TabsComponent = /*#__PURE__*/(() => {
  class TabsComponent {
    constructor() {
      this.tabs = [];
      this.activeTabId = '';
      this.variant = 'default';
      this.size = 'medium';
      this.fullWidth = false;
      this.tabChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__.EventEmitter();
    }
    selectTab(tabId) {
      const tab = this.tabs.find(t => t.id === tabId);
      if (tab && !tab.disabled) {
        this.activeTabId = tabId;
        this.tabChange.emit(tabId);
      }
    }
    getTabsClasses() {
      const classes = ['tabs'];
      classes.push(`tabs-${this.variant}`);
      classes.push(`tabs-${this.size}`);
      if (this.fullWidth) {
        classes.push('tabs-full-width');
      }
      return classes.join(' ');
    }
    getTabClasses(tab) {
      const classes = ['tab'];
      classes.push(`tab-${this.variant}`);
      classes.push(`tab-${this.size}`);
      if (tab.id === this.activeTabId) {
        classes.push('tab-active');
      }
      if (tab.disabled) {
        classes.push('tab-disabled');
      }
      return classes.join(' ');
    }
    static {
      this.ɵfac = function TabsComponent_Factory(t) {
        return new (t || TabsComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
        type: TabsComponent,
        selectors: [["ui-tabs"]],
        inputs: {
          tabs: "tabs",
          activeTabId: "activeTabId",
          variant: "variant",
          size: "size",
          fullWidth: "fullWidth"
        },
        outputs: {
          tabChange: "tabChange"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c0,
        decls: 5,
        vars: 3,
        consts: [[1, "tabs-container"], ["role", "tablist"], ["role", "tab", "type", "button", 3, "class", "disabled", "id", "click", 4, "ngFor", "ngForOf"], [1, "tab-panels"], ["role", "tab", "type", "button", 3, "click", "disabled", "id"], [3, "class", 4, "ngIf"], [1, "tab-label"]],
        template: function TabsComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0)(1, "div", 1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, TabsComponent_button_2_Template, 4, 8, "button", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassMap"](ctx.getTabsClasses());
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.tabs);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_1__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_1__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_1__.NgIf],
        styles: ["\n\n.tabs-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n\n\n.tabs[_ngcontent-%COMP%] {\n  display: flex;\n  border-bottom: 1px solid #e5e7eb;\n}\n\n.tabs-full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.tabs-full-width[_ngcontent-%COMP%]   .tab[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n\n\n.tab[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  transition: all 0.2s ease-in-out;\n  font-family: inherit;\n  font-weight: 500;\n  white-space: nowrap;\n  outline: none;\n}\n\n.tab[_ngcontent-%COMP%]:focus {\n  outline: 2px solid #4f46e5;\n  outline-offset: -2px;\n}\n\n.tab[_ngcontent-%COMP%]:disabled {\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n\n\n\n.tab-small[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  font-size: 14px;\n}\n\n.tab-medium[_ngcontent-%COMP%] {\n  padding: 12px 20px;\n  font-size: 16px;\n}\n\n.tab-large[_ngcontent-%COMP%] {\n  padding: 16px 24px;\n  font-size: 18px;\n}\n\n\n\n.tab-default[_ngcontent-%COMP%] {\n  color: #6b7280;\n  border-bottom: 2px solid transparent;\n}\n\n.tab-default[_ngcontent-%COMP%]:hover:not(:disabled) {\n  color: #374151;\n  background: #f9fafb;\n}\n\n.tab-default.tab-active[_ngcontent-%COMP%] {\n  color: #667eea;\n  border-bottom-color: #667eea;\n  background: white;\n}\n\n\n\n.tabs-pills[_ngcontent-%COMP%] {\n  border-bottom: none;\n  gap: 4px;\n  padding: 4px;\n  background: #f9fafb;\n  border-radius: 8px;\n}\n\n.tab-pills[_ngcontent-%COMP%] {\n  color: #6b7280;\n  border-radius: 6px;\n  border-bottom: none;\n}\n\n.tab-pills[_ngcontent-%COMP%]:hover:not(:disabled) {\n  color: #374151;\n  background: #f3f4f6;\n}\n\n.tab-pills.tab-active[_ngcontent-%COMP%] {\n  color: #667eea;\n  background: white;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n}\n\n\n\n.tabs-underline[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #e5e7eb;\n}\n\n.tab-underline[_ngcontent-%COMP%] {\n  color: #6b7280;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n}\n\n.tab-underline[_ngcontent-%COMP%]:hover:not(:disabled) {\n  color: #374151;\n}\n\n.tab-underline.tab-active[_ngcontent-%COMP%] {\n  color: #667eea;\n  border-bottom-color: #667eea;\n}\n\n\n\n.tab-icon[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 16px;\n}\n\n.tab-label[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n\n\n.tab-panels[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n\n\n.icon-dashboard[_ngcontent-%COMP%]::before { content: '\uD83D\uDCCA'; }\n.icon-settings[_ngcontent-%COMP%]::before { content: '\u2699\uFE0F'; }\n.icon-profile[_ngcontent-%COMP%]::before { content: '\uD83D\uDC64'; }\n.icon-chart[_ngcontent-%COMP%]::before { content: '\uD83D\uDCC8'; }\n.icon-table[_ngcontent-%COMP%]::before { content: '\uD83D\uDCCB'; }\n.icon-config[_ngcontent-%COMP%]::before { content: '\uD83D\uDD27'; }\n.icon-history[_ngcontent-%COMP%]::before { content: '\uD83D\uDCDC'; }\n.icon-analytics[_ngcontent-%COMP%]::before { content: '\uD83D\uDCCA'; }\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS90YWJzL3RhYnMuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtQkFBbUI7QUFDbkI7RUFDRSxhQUFhO0VBQ2Isc0JBQXNCO0FBQ3hCOztBQUVBLHFCQUFxQjtBQUNyQjtFQUNFLGFBQWE7RUFDYixnQ0FBZ0M7QUFDbEM7O0FBRUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxPQUFPO0FBQ1Q7O0FBRUEsb0JBQW9CO0FBQ3BCO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQix1QkFBdUI7RUFDdkIsUUFBUTtFQUNSLFlBQVk7RUFDWix1QkFBdUI7RUFDdkIsZUFBZTtFQUNmLGdDQUFnQztFQUNoQyxvQkFBb0I7RUFDcEIsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtFQUNuQixhQUFhO0FBQ2Y7O0FBRUE7RUFDRSwwQkFBMEI7RUFDMUIsb0JBQW9CO0FBQ3RCOztBQUVBO0VBQ0UsbUJBQW1CO0VBQ25CLFlBQVk7QUFDZDs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxpQkFBaUI7RUFDakIsZUFBZTtBQUNqQjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixlQUFlO0FBQ2pCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLGVBQWU7QUFDakI7O0FBRUEsb0JBQW9CO0FBQ3BCO0VBQ0UsY0FBYztFQUNkLG9DQUFvQztBQUN0Qzs7QUFFQTtFQUNFLGNBQWM7RUFDZCxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxjQUFjO0VBQ2QsNEJBQTRCO0VBQzVCLGlCQUFpQjtBQUNuQjs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxtQkFBbUI7RUFDbkIsUUFBUTtFQUNSLFlBQVk7RUFDWixtQkFBbUI7RUFDbkIsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsY0FBYztFQUNkLGtCQUFrQjtFQUNsQixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxjQUFjO0VBQ2QsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsY0FBYztFQUNkLGlCQUFpQjtFQUNqQix3Q0FBd0M7QUFDMUM7O0FBRUEsc0JBQXNCO0FBQ3RCO0VBQ0UsZ0NBQWdDO0FBQ2xDOztBQUVBO0VBQ0UsY0FBYztFQUNkLG9DQUFvQztFQUNwQyxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxjQUFjO0FBQ2hCOztBQUVBO0VBQ0UsY0FBYztFQUNkLDRCQUE0QjtBQUM5Qjs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLHVCQUF1QjtFQUN2QixlQUFlO0FBQ2pCOztBQUVBO0VBQ0UsT0FBTztBQUNUOztBQUVBLGVBQWU7QUFDZjtFQUNFLE9BQU87QUFDVDs7QUFFQSxrQ0FBa0M7QUFDbEMsMEJBQTBCLGFBQWEsRUFBRTtBQUN6Qyx5QkFBeUIsYUFBYSxFQUFFO0FBQ3hDLHdCQUF3QixhQUFhLEVBQUU7QUFDdkMsc0JBQXNCLGFBQWEsRUFBRTtBQUNyQyxzQkFBc0IsYUFBYSxFQUFFO0FBQ3JDLHVCQUF1QixhQUFhLEVBQUU7QUFDdEMsd0JBQXdCLGFBQWEsRUFBRTtBQUN2QywwQkFBMEIsYUFBYSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyogVGFicyBjb250YWluZXIgKi9cbi50YWJzLWNvbnRhaW5lciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG59XG5cbi8qIEJhc2UgdGFicyBzdHlsZXMgKi9cbi50YWJzIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlNWU3ZWI7XG59XG5cbi50YWJzLWZ1bGwtd2lkdGgge1xuICB3aWR0aDogMTAwJTtcbn1cblxuLnRhYnMtZnVsbC13aWR0aCAudGFiIHtcbiAgZmxleDogMTtcbn1cblxuLyogQmFzZSB0YWIgc3R5bGVzICovXG4udGFiIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGdhcDogOHB4O1xuICBib3JkZXI6IG5vbmU7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2UtaW4tb3V0O1xuICBmb250LWZhbWlseTogaW5oZXJpdDtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgb3V0bGluZTogbm9uZTtcbn1cblxuLnRhYjpmb2N1cyB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCAjNGY0NmU1O1xuICBvdXRsaW5lLW9mZnNldDogLTJweDtcbn1cblxuLnRhYjpkaXNhYmxlZCB7XG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gIG9wYWNpdHk6IDAuNTtcbn1cblxuLyogU2l6ZSB2YXJpYW50cyAqL1xuLnRhYi1zbWFsbCB7XG4gIHBhZGRpbmc6IDhweCAxNnB4O1xuICBmb250LXNpemU6IDE0cHg7XG59XG5cbi50YWItbWVkaXVtIHtcbiAgcGFkZGluZzogMTJweCAyMHB4O1xuICBmb250LXNpemU6IDE2cHg7XG59XG5cbi50YWItbGFyZ2Uge1xuICBwYWRkaW5nOiAxNnB4IDI0cHg7XG4gIGZvbnQtc2l6ZTogMThweDtcbn1cblxuLyogRGVmYXVsdCB2YXJpYW50ICovXG4udGFiLWRlZmF1bHQge1xuICBjb2xvcjogIzZiNzI4MDtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHRyYW5zcGFyZW50O1xufVxuXG4udGFiLWRlZmF1bHQ6aG92ZXI6bm90KDpkaXNhYmxlZCkge1xuICBjb2xvcjogIzM3NDE1MTtcbiAgYmFja2dyb3VuZDogI2Y5ZmFmYjtcbn1cblxuLnRhYi1kZWZhdWx0LnRhYi1hY3RpdmUge1xuICBjb2xvcjogIzY2N2VlYTtcbiAgYm9yZGVyLWJvdHRvbS1jb2xvcjogIzY2N2VlYTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG59XG5cbi8qIFBpbGxzIHZhcmlhbnQgKi9cbi50YWJzLXBpbGxzIHtcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbiAgZ2FwOiA0cHg7XG4gIHBhZGRpbmc6IDRweDtcbiAgYmFja2dyb3VuZDogI2Y5ZmFmYjtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xufVxuXG4udGFiLXBpbGxzIHtcbiAgY29sb3I6ICM2YjcyODA7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcbn1cblxuLnRhYi1waWxsczpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIGNvbG9yOiAjMzc0MTUxO1xuICBiYWNrZ3JvdW5kOiAjZjNmNGY2O1xufVxuXG4udGFiLXBpbGxzLnRhYi1hY3RpdmUge1xuICBjb2xvcjogIzY2N2VlYTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG4gIGJveC1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XG59XG5cbi8qIFVuZGVybGluZSB2YXJpYW50ICovXG4udGFicy11bmRlcmxpbmUge1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U1ZTdlYjtcbn1cblxuLnRhYi11bmRlcmxpbmUge1xuICBjb2xvcjogIzZiNzI4MDtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBtYXJnaW4tYm90dG9tOiAtMXB4O1xufVxuXG4udGFiLXVuZGVybGluZTpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIGNvbG9yOiAjMzc0MTUxO1xufVxuXG4udGFiLXVuZGVybGluZS50YWItYWN0aXZlIHtcbiAgY29sb3I6ICM2NjdlZWE7XG4gIGJvcmRlci1ib3R0b20tY29sb3I6ICM2NjdlZWE7XG59XG5cbi8qIFRhYiBjb250ZW50ICovXG4udGFiLWljb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgZm9udC1zaXplOiAxNnB4O1xufVxuXG4udGFiLWxhYmVsIHtcbiAgZmxleDogMTtcbn1cblxuLyogVGFiIHBhbmVscyAqL1xuLnRhYi1wYW5lbHMge1xuICBmbGV4OiAxO1xufVxuXG4vKiBJY29uIGNsYXNzZXMgZm9yIGNvbW1vbiBpY29ucyAqL1xuLmljb24tZGFzaGJvYXJkOjpiZWZvcmUgeyBjb250ZW50OiAnw7DCn8KTwoonOyB9XG4uaWNvbi1zZXR0aW5nczo6YmVmb3JlIHsgY29udGVudDogJ8OiwprCmcOvwrjCjyc7IH1cbi5pY29uLXByb2ZpbGU6OmJlZm9yZSB7IGNvbnRlbnQ6ICfDsMKfwpHCpCc7IH1cbi5pY29uLWNoYXJ0OjpiZWZvcmUgeyBjb250ZW50OiAnw7DCn8KTwognOyB9XG4uaWNvbi10YWJsZTo6YmVmb3JlIHsgY29udGVudDogJ8Owwp/Ck8KLJzsgfVxuLmljb24tY29uZmlnOjpiZWZvcmUgeyBjb250ZW50OiAnw7DCn8KUwqcnOyB9XG4uaWNvbi1oaXN0b3J5OjpiZWZvcmUgeyBjb250ZW50OiAnw7DCn8KTwpwnOyB9XG4uaWNvbi1hbmFseXRpY3M6OmJlZm9yZSB7IGNvbnRlbnQ6ICfDsMKfwpPCiic7IH1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return TabsComponent;
})();
let TabContentComponent = /*#__PURE__*/(() => {
  class TabContentComponent {
    constructor() {
      this.tabId = '';
      this.active = false;
    }
    static {
      this.ɵfac = function TabContentComponent_Factory(t) {
        return new (t || TabContentComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({
        type: TabContentComponent,
        selectors: [["ui-tab-content"]],
        inputs: {
          tabId: "tabId",
          active: "active"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵStandaloneFeature"]],
        ngContentSelectors: _c0,
        decls: 2,
        vars: 2,
        consts: [[1, "tab-content"]],
        template: function TabContentComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojectionDef"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵprojection"](1);
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵclassProp"]("tab-content-active", ctx.active);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_1__.CommonModule],
        styles: [".tab-content[_ngcontent-%COMP%] {\n      display: none;\n      padding: 20px 0;\n    }\n\n    .tab-content-active[_ngcontent-%COMP%] {\n      display: block;\n    }\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy91aS90YWJzL3RhYi1jb250ZW50LmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBQUk7TUFDRSxhQUFhO01BQ2IsZUFBZTtJQUNqQjs7SUFFQTtNQUNFLGNBQWM7SUFDaEIiLCJzb3VyY2VzQ29udGVudCI6WyIgICAgLnRhYi1jb250ZW50IHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICBwYWRkaW5nOiAyMHB4IDA7XG4gICAgfVxuXG4gICAgLnRhYi1jb250ZW50LWFjdGl2ZSB7XG4gICAgICBkaXNwbGF5OiBibG9jaztcbiAgICB9Il0sInNvdXJjZVJvb3QiOiIifQ== */"]
      });
    }
  }
  return TabContentComponent;
})();

/***/ })

}]);
//# sourceMappingURL=222.js.map