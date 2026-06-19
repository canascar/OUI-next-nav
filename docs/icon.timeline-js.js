"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.timeline-js"],{

/***/ "../../src/components/icon/assets/timeline.js":
/*!****************************************************!*\
  !*** ../../src/components/icon/assets/timeline.js ***!
  \****************************************************/
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


var OuiIconTimeline = function OuiIconTimeline(_ref) {
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
    d: "M7 4.5a.5.5 0 0 0 1 0V4h1a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v.5zM9 1H6v2h3V1zM2 7.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0zM2.5 9a1.5 1.5 0 0 1-1.415-1H.5a.5.5 0 0 1 0-1h.585a1.5 1.5 0 0 1 2.83 0h2.17a1.5 1.5 0 0 1 2.83 0h2.17a1.5 1.5 0 0 1 2.83 0h.585a.5.5 0 0 1 0 1h-.585a1.5 1.5 0 0 1-2.83 0h-2.17a1.5 1.5 0 0 1-2.83 0h-2.17A1.5 1.5 0 0 1 2.5 9zM13 7.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0zm-5 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0zM2.5 10a.5.5 0 0 0-.5.5v.5H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3v-.5a.5.5 0 0 0-.5-.5zM4 14v-2H1v2h3zm8-3.5a.5.5 0 0 1 1 0v.5h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-.5zm2 2.5v1h-3v-2h3v1z"
  }));
};
var icon = OuiIconTimeline;

/***/ })

}]);
//# sourceMappingURL=icon.timeline-js.js.map