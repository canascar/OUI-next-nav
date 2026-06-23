"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["icon.tokens-tokenAnnotation-js"],{

/***/ "../../src/components/icon/assets/tokens/tokenAnnotation.js":
/*!******************************************************************!*\
  !*** ../../src/components/icon/assets/tokens/tokenAnnotation.js ***!
  \******************************************************************/
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


var OuiIconTokenAnnotation = function OuiIconTokenAnnotation(_ref) {
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
    d: "M8.15 3.392c2.797 0 4.524 1.644 4.517 4.289.007 1.816-.708 2.893-2.21 3.004-.908.076-1.081-.287-1.157-.725h-.041c-.163.42-.964.732-1.744.683-1.053-.065-2.082-.842-2.09-2.572.008-1.72 1.071-2.441 1.959-2.586.804-.135 1.598.158 1.723.462h.051v-.386h1.195v3.452c.007.3.128.425.304.425.4 0 .677-.583.673-1.861.004-2.376-1.705-2.914-3.187-2.914-2.34 0-3.415 1.522-3.422 3.387.007 2.127 1.22 3.277 3.433 3.277.808 0 1.598-.176 2.006-.349l.393 1.122c-.435.27-1.419.508-2.493.508-2.98 0-4.723-1.66-4.727-4.496.004-2.804 1.748-4.72 4.817-4.72ZM7.964 6.79c-.76 0-1.185.459-1.188 1.24.003.683.3 1.332 1.202 1.332.821 0 1.094-.473 1.077-1.343-.004-.718-.204-1.23-1.091-1.23Z"
  }));
};
var icon = OuiIconTokenAnnotation;

/***/ })

}]);
//# sourceMappingURL=icon.tokens-tokenAnnotation-js.js.map