"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.timeslider-js"],{

/***/ "../../src/components/icon/assets/timeslider.js":
/*!******************************************************!*\
  !*** ../../src/components/icon/assets/timeslider.js ***!
  \******************************************************/
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


var OuiIconTimeslider = function OuiIconTimeslider(_ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, ["title", "titleId"]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    fill: "none",
    viewBox: "0 0 16 16",
    "aria-labelledby": titleId
  }, props), title ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("title", {
    id: titleId
  }, title) : null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("path", {
    d: "M13.923 8A5.93 5.93 0 0 0 8 2.077 5.93 5.93 0 0 0 2.077 8a5.93 5.93 0 0 0 6.296 5.912c.328-.021.625.227.625.556a.504.504 0 0 1-.458.511 7 7 0 1 1 6.43-6.333c-.036.398-.487.58-.817.354a.595.595 0 0 1-.248-.54c.012-.152.018-.305.018-.46zm1.684 3.2-4.32-3.055c-.56-.396-1.287.059-1.287.8v6.108c0 .74.726 1.196 1.287.8l4.32-3.055c.524-.37.524-1.228 0-1.598zM7.462 7.462H4.769a.539.539 0 0 0 0 1.076H8A.539.539 0 0 0 8.538 8V3.692a.539.539 0 0 0-1.076 0v3.77z",
    clipRule: "evenodd"
  }));
};
var icon = OuiIconTimeslider;

/***/ })

}]);
//# sourceMappingURL=icon.timeslider-js.js.map