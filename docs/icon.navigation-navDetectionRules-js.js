"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.navigation-navDetectionRules-js"],{

/***/ "../../src/components/icon/assets/navigation/navDetectionRules.js":
/*!************************************************************************!*\
  !*** ../../src/components/icon/assets/navigation/navDetectionRules.js ***!
  \************************************************************************/
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


var OuiIconNavDetectionRules = function OuiIconNavDetectionRules(_ref) {
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
    d: "M13.688 2.574v6.768a.913.913 0 0 1-.911.911H5.389l.896.896a.39.39 0 0 1-.273.676.395.395 0 0 1-.28-.124L4.17 10.139a.391.391 0 0 1 0-.552l1.562-1.562a.391.391 0 0 1 .552.552l-.895.896h7.387a.132.132 0 0 0 .13-.131V2.574a.132.132 0 0 0-.13-.131H5.487a.132.132 0 0 0-.13.131v.52a.391.391 0 0 1-.781 0v-.52a.913.913 0 0 1 .911-.911h7.289a.913.913 0 0 1 .911.911m-3.514 9.501a.39.39 0 0 0-.391.391v.521a.132.132 0 0 1-.13.13h-7.29a.132.132 0 0 1-.13-.13V6.218a.132.132 0 0 1 .13-.13H9.75l-.896.895a.391.391 0 1 0 .552.552l1.562-1.562a.391.391 0 0 0 0-.552L9.407 3.859a.391.391 0 0 0-.552.552l.895.896H2.363a.913.913 0 0 0-.911.911v6.769a.913.913 0 0 0 .911.911h7.289a.913.913 0 0 0 .911-.911v-.521a.391.391 0 0 0-.391-.391"
  }));
};
var icon = OuiIconNavDetectionRules;

/***/ })

}]);
//# sourceMappingURL=icon.navigation-navDetectionRules-js.js.map