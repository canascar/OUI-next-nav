"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.tokens-tokenObject-js"],{

/***/ "../../src/components/icon/assets/tokens/tokenObject.js":
/*!**************************************************************!*\
  !*** ../../src/components/icon/assets/tokens/tokenObject.js ***!
  \**************************************************************/
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


var OuiIconTokenObject = function OuiIconTokenObject(_ref) {
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
    d: "M6.63 12c-1.294 0-2.383-.105-2.383-1.802V9.6c0-.638-.247-.914-.98-.914v-1.37c.733 0 .98-.28.98-.915v-.6C4.247 4.105 5.336 4 6.631 4v1.14c-.759 0-.886.272-.886.843v.813c0 .479-.225.936-1.212 1.133v.142c.987.197 1.212.654 1.212 1.133v.813c0 .57.127.844.886.844V12Zm2.266-8c1.295 0 2.384.105 2.384 1.802V6.4c0 .638.247.914.98.914v1.37c-.733 0-.98.28-.98.915v.6C11.28 11.895 10.19 12 8.896 12v-1.14c.759 0 .886-.272.886-.843v-.813c0-.479.225-.936 1.212-1.133V7.93c-.987-.197-1.212-.654-1.212-1.133v-.813c0-.57-.127-.844-.886-.844V4Z"
  }));
};
var icon = OuiIconTokenObject;

/***/ })

}]);
//# sourceMappingURL=icon.tokens-tokenObject-js.js.map