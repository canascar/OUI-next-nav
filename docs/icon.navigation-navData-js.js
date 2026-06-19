"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.navigation-navData-js"],{

/***/ "../../src/components/icon/assets/navigation/navData.js":
/*!**************************************************************!*\
  !*** ../../src/components/icon/assets/navigation/navData.js ***!
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


var OuiIconNavData = function OuiIconNavData(_ref) {
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
    d: "M7.57 1.192c-3.405 0-6.072 1.531-6.072 3.487v6.201c0 1.956 2.666 3.488 6.071 3.488s6.072-1.532 6.072-3.488v-6.2c0-1.956-2.667-3.487-6.072-3.487m0 .775c2.871 0 5.296 1.242 5.296 2.712S10.44 7.393 7.569 7.393 2.272 6.151 2.272 4.68 4.698 1.967 7.57 1.967m5.296 8.913c0 1.471-2.425 2.713-5.296 2.713s-5.297-1.242-5.297-2.712v-1.37c1.033 1.058 2.996 1.757 5.297 1.757s4.264-.699 5.296-1.757zm0-3.099c0 1.47-2.425 2.712-5.296 2.712S2.273 9.251 2.273 7.781V6.409C3.306 7.466 5.269 8.166 7.57 8.166s4.264-.7 5.296-1.757z"
  }));
};
var icon = OuiIconNavData;

/***/ })

}]);
//# sourceMappingURL=icon.navigation-navData-js.js.map