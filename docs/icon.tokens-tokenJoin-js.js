"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.tokens-tokenJoin-js"],{

/***/ "../../src/components/icon/assets/tokens/tokenJoin.js":
/*!************************************************************!*\
  !*** ../../src/components/icon/assets/tokens/tokenJoin.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   icon: function() { return /* binding */ icon; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.index-of */ "../../node_modules/core-js/modules/es.array.index-of.js");
/* harmony import */ var core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_index_of__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../node_modules/react/index.js");

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) { ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) { o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) { if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } } return t; }
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */


var OuiIconTokenJoin = function OuiIconTokenJoin(_ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, ["title", "titleId"]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("path", {
    fillRule: "evenodd",
    d: "M7.5 4.5v1.025c0 1.269-1.185 1.908-2.112 1.737a.75.75 0 1 0 0 1.475c.927-.17 2.112.47 2.112 1.739v1.023h4v-1.005a2.5 2.5 0 0 1 0-4.988V4.5h-4ZM13 4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1.525c0 .172-.172.293-.341.262a2.25 2.25 0 1 0 0 4.426c.17-.031.341.09.341.262V12a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9.004a.16.16 0 0 0-.04-.105c-.109-.125-.594-.16-.732-.068a1 1 0 1 1 0-1.662c.138.092.623.057.732-.068a.16.16 0 0 0 .04-.105V4Z",
    clipRule: "evenodd"
  }));
};
var icon = OuiIconTokenJoin;

/***/ })

}]);
//# sourceMappingURL=icon.tokens-tokenJoin-js.js.map