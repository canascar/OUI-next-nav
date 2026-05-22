/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * OpenSearch Mascot — extracted from design handoff.
 * Circular SVG mascot with comma-shaped eyes, idle animations,
 * cursor following, and expression vocabulary.
 */

import React, { useState, useEffect, useRef } from 'react';

const _slicedToArray = (arr, i) => [arr[0], arr[1]];

function Mascot(_ref) {
  var _ref$size = _ref.size,
    size = _ref$size === void 0 ? 240 : _ref$size,
    _ref$expression = _ref.expression,
    expression = _ref$expression === void 0 ? "comma" : _ref$expression,
    _ref$color = _ref.color,
    color = _ref$color === void 0 ? ["#14558E", "#153A5A"] : _ref$color,
    _ref$eyeColor = _ref.eyeColor,
    eyeColor = _ref$eyeColor === void 0 ? "#fff" : _ref$eyeColor,
    _ref$follow = _ref.follow,
    follow = _ref$follow === void 0 ? true : _ref$follow,
    _ref$idle = _ref.idle,
    idle = _ref$idle === void 0 ? true : _ref$idle,
    _ref$bob = _ref.bob,
    bob = _ref$bob === void 0 ? true : _ref$bob,
    onClick = _ref.onClick;
  var wrapRef = useRef(null);
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    autoState = _useState2[0],
    setAutoState = _useState2[1]; // overrides `expression` briefly
  var _useState3 = useState({
      x: 0,
      y: 0
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    pupilOffset = _useState4[0],
    setPupilOffset = _useState4[1];

  // ---- Auto idle loop ----
  // Cycles through micro-expressions between the resting `comma` state:
  // ,, → _ _ → ,, → . . → ,, → > < → ,, → ^ ^ → ,, ...
  // Most pulses are short (blink-length); some emotes linger a beat longer.
  useEffect(function () {
    if (!idle) return;
    var alive = true;
    // Pool of states the mascot drifts through. Blink is weighted heavier
    // because blinks should still feel like the dominant idle gesture.
    var POOL = [{
      id: "blink",
      weight: 4,
      hold: 130
    }, {
      id: "dot",
      weight: 2,
      hold: 320
    }, {
      id: "squint",
      weight: 1,
      hold: 380
    }, {
      id: "happy",
      weight: 1,
      hold: 420
    }, {
      id: "wow",
      weight: 1,
      hold: 360
    }, {
      id: "wink",
      weight: 1,
      hold: 380
    }];
    var totalWeight = POOL.reduce(function (s, p) {
      return s + p.weight;
    }, 0);
    var pick = function pick() {
      var r = Math.random() * totalWeight;
      for (var _i = 0, _POOL = POOL; _i < _POOL.length; _i++) {
        var p = _POOL[_i];
        if ((r -= p.weight) <= 0) return p;
      }
      return POOL[0];
    };
    var timer;
    var _tick = function tick() {
      if (!alive) return;
      var p = pick();
      setAutoState(p.id);
      // Sometimes follow a blink with a quick second blink.
      var _double = p.id === "blink" && Math.random() < 0.18;
      setTimeout(function () {
        if (!alive) return;
        setAutoState(null);
        if (_double) {
          setTimeout(function () {
            if (!alive) return;
            setAutoState("blink");
            setTimeout(function () {
              return alive && setAutoState(null);
            }, 120);
          }, 150);
        }
      }, p.hold);
      // Schedule next pulse. Slightly longer rest after a held emote
      // so the mascot doesn't feel twitchy.
      var rest = (p.id === "blink" ? 2400 : 3200) + Math.random() * 2600;
      timer = setTimeout(_tick, rest);
    };
    timer = setTimeout(_tick, 1600);
    return function () {
      alive = false;
      clearTimeout(timer);
    };
  }, [idle]);

  // ---- Eye-tracking ----
  useEffect(function () {
    if (!follow) {
      setPupilOffset({
        x: 0,
        y: 0
      });
      return;
    }
    var onMove = function onMove(e) {
      var el = wrapRef.current;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var len = Math.hypot(dx, dy) || 1;
      // Clamp to small offset relative to viewbox (80 units)
      var maxOff = 1.2;
      var k = Math.min(len / 220, 1);
      setPupilOffset({
        x: dx / len * maxOff * k,
        y: dy / len * maxOff * k
      });
    };
    window.addEventListener("mousemove", onMove);
    return function () {
      return window.removeEventListener("mousemove", onMove);
    };
  }, [follow]);
  var active = autoState || expression;
  var geom = EYE_GEOMETRY[active] || EYE_GEOMETRY.comma;

  // Eye scaling: as the mascot shrinks below ~200px, eyes get proportionally
  // larger so the expression remains readable at small sizes. At >=200px,
  // eyes are at native scale (1.0). At ~32px, eyes are scaled ~1.65×.
  // The eye-pair is centered at (48, 31) in viewBox space; we anchor the
  // scale transform there so both eyes scale outward symmetrically.
  var eyeScale = function () {
    if (size >= 200) return 1.0;
    if (size <= 32) return 1.65;
    // Smooth interpolation between (200, 1.0) and (32, 1.65)
    var t = (200 - size) / (200 - 32);
    return 1.0 + t * 0.65;
  }();
  var EYE_CX = 48,
    EYE_CY = 31;

  // Color: accept either an array [from, to] (preferred) or a single hex string.
  var palette = Array.isArray(color) ? color : [color, color];
  var scheme = {
    from: palette[0],
    to: palette[1] || palette[0]
  };
  var gid = useMemo(function () {
    return "g_" + Math.random().toString(36).slice(2, 8);
  }, []);
  var bobClass = bob ? "mascot-bob" : "";
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    className: "mascot-wrap ".concat(bobClass),
    style: {
      width: size,
      height: size,
      cursor: onClick ? "pointer" : "default"
    },
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "mascot-shadow",
    style: {
      width: size * 0.55,
      height: size * 0.08,
      bottom: -size * 0.04
    }
  }), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 80 80",
    width: size,
    height: size,
    className: "mascot-svg"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: gid,
    x1: "40",
    y1: "80",
    x2: "40",
    y2: "0",
    gradientUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("stop", {
    stopColor: scheme.to
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: scheme.from
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: gid + "_hl",
    cx: "0.3",
    cy: "0.25",
    r: "0.6"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(255,255,255,0.18)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "rgba(255,255,255,0)"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "40",
    r: "39.5",
    fill: "url(#".concat(gid, ")")
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "28",
    cy: "22",
    rx: "22",
    ry: "14",
    fill: "url(#".concat(gid, "_hl)")
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(".concat(EYE_CX, ", ").concat(EYE_CY, ") scale(").concat(eyeScale, ") translate(").concat(-EYE_CX + pupilOffset.x / eyeScale, ", ").concat(-EYE_CY + pupilOffset.y / eyeScale, ")")
  }, /*#__PURE__*/React.createElement(MorphPath, {
    d: geom.left,
    fill: eyeColor
  }), /*#__PURE__*/React.createElement(MorphPath, {
    d: geom.right,
    fill: eyeColor
  }))));
}