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
  const _ref$size = _ref.size;
  const size = _ref$size === void 0 ? 240 : _ref$size;
  const _ref$expression = _ref.expression;
  const expression = _ref$expression === void 0 ? 'comma' : _ref$expression;
  const _ref$color = _ref.color;
  const color = _ref$color === void 0 ? ['#14558E', '#153A5A'] : _ref$color;
  const _ref$eyeColor = _ref.eyeColor;
  const eyeColor = _ref$eyeColor === void 0 ? '#fff' : _ref$eyeColor;
  const _ref$follow = _ref.follow;
  const follow = _ref$follow === void 0 ? true : _ref$follow;
  const _ref$idle = _ref.idle;
  const idle = _ref$idle === void 0 ? true : _ref$idle;
  const _ref$bob = _ref.bob;
  const bob = _ref$bob === void 0 ? true : _ref$bob;
  const onClick = _ref.onClick;
  const wrapRef = useRef(null);
  const _useState = useState(null);
  const _useState2 = _slicedToArray(_useState, 2);
  const autoState = _useState2[0];
  const setAutoState = _useState2[1]; // overrides `expression` briefly
  const _useState3 = useState({
    x: 0,
    y: 0,
  });
  const _useState4 = _slicedToArray(_useState3, 2);
  const pupilOffset = _useState4[0];
  const setPupilOffset = _useState4[1];

  // ---- Auto idle loop ----
  // Cycles through micro-expressions between the resting `comma` state:
  // ,, → _ _ → ,, → . . → ,, → > < → ,, → ^ ^ → ,, ...
  // Most pulses are short (blink-length); some emotes linger a beat longer.
  useEffect(
    function () {
      if (!idle) return;
      let alive = true;
      // Pool of states the mascot drifts through. Blink is weighted heavier
      // because blinks should still feel like the dominant idle gesture.
      const POOL = [
        {
          id: 'blink',
          weight: 4,
          hold: 130,
        },
        {
          id: 'dot',
          weight: 2,
          hold: 320,
        },
        {
          id: 'squint',
          weight: 1,
          hold: 380,
        },
        {
          id: 'happy',
          weight: 1,
          hold: 420,
        },
        {
          id: 'wow',
          weight: 1,
          hold: 360,
        },
        {
          id: 'wink',
          weight: 1,
          hold: 380,
        },
      ];
      const totalWeight = POOL.reduce(function (s, p) {
        return s + p.weight;
      }, 0);
      const pick = function pick() {
        let r = Math.random() * totalWeight;
        for (let _i = 0, _POOL = POOL; _i < _POOL.length; _i++) {
          const p = _POOL[_i];
          if ((r -= p.weight) <= 0) return p;
        }
        return POOL[0];
      };
      let timer;
      var _tick = function tick() {
        if (!alive) return;
        const p = pick();
        setAutoState(p.id);
        // Sometimes follow a blink with a quick second blink.
        const _double = p.id === 'blink' && Math.random() < 0.18;
        setTimeout(function () {
          if (!alive) return;
          setAutoState(null);
          if (_double) {
            setTimeout(function () {
              if (!alive) return;
              setAutoState('blink');
              setTimeout(function () {
                return alive && setAutoState(null);
              }, 120);
            }, 150);
          }
        }, p.hold);
        // Schedule next pulse. Slightly longer rest after a held emote
        // so the mascot doesn't feel twitchy.
        const rest = (p.id === 'blink' ? 2400 : 3200) + Math.random() * 2600;
        timer = setTimeout(_tick, rest);
      };
      timer = setTimeout(_tick, 1600);
      return function () {
        alive = false;
        clearTimeout(timer);
      };
    },
    [idle]
  );

  // ---- Eye-tracking ----
  useEffect(
    function () {
      if (!follow) {
        setPupilOffset({
          x: 0,
          y: 0,
        });
        return;
      }
      const onMove = function onMove(e) {
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const len = Math.hypot(dx, dy) || 1;
        // Clamp to small offset relative to viewbox (80 units)
        const maxOff = 1.2;
        const k = Math.min(len / 220, 1);
        setPupilOffset({
          x: (dx / len) * maxOff * k,
          y: (dy / len) * maxOff * k,
        });
      };
      window.addEventListener('mousemove', onMove);
      return function () {
        return window.removeEventListener('mousemove', onMove);
      };
    },
    [follow]
  );
  const active = autoState || expression;
  const geom = EYE_GEOMETRY[active] || EYE_GEOMETRY.comma;

  // Eye scaling: as the mascot shrinks below ~200px, eyes get proportionally
  // larger so the expression remains readable at small sizes. At >=200px,
  // eyes are at native scale (1.0). At ~32px, eyes are scaled ~1.65×.
  // The eye-pair is centered at (48, 31) in viewBox space; we anchor the
  // scale transform there so both eyes scale outward symmetrically.
  const eyeScale = (function () {
    if (size >= 200) return 1.0;
    if (size <= 32) return 1.65;
    // Smooth interpolation between (200, 1.0) and (32, 1.65)
    const t = (200 - size) / (200 - 32);
    return 1.0 + t * 0.65;
  })();
  const EYE_CX = 48;
  const EYE_CY = 31;

  // Color: accept either an array [from, to] (preferred) or a single hex string.
  const palette = Array.isArray(color) ? color : [color, color];
  const scheme = {
    from: palette[0],
    to: palette[1] || palette[0],
  };
  const gid = useMemo(function () {
    return `g_${Math.random().toString(36).slice(2, 8)}`;
  }, []);
  const bobClass = bob ? 'mascot-bob' : '';
  return /*#__PURE__*/ React.createElement(
    'div',
    {
      ref: wrapRef,
      className: 'mascot-wrap '.concat(bobClass),
      style: {
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
      },
      onClick: onClick,
    },
    /*#__PURE__*/ React.createElement('div', {
      className: 'mascot-shadow',
      style: {
        width: size * 0.55,
        height: size * 0.08,
        bottom: -size * 0.04,
      },
    }),
    /*#__PURE__*/ React.createElement(
      'svg',
      {
        viewBox: '0 0 80 80',
        width: size,
        height: size,
        className: 'mascot-svg',
      },
      /*#__PURE__*/ React.createElement(
        'defs',
        null,
        /*#__PURE__*/ React.createElement(
          'linearGradient',
          {
            id: gid,
            x1: '40',
            y1: '80',
            x2: '40',
            y2: '0',
            gradientUnits: 'userSpaceOnUse',
          },
          /*#__PURE__*/ React.createElement('stop', {
            stopColor: scheme.to,
          }),
          /*#__PURE__*/ React.createElement('stop', {
            offset: '1',
            stopColor: scheme.from,
          })
        ),
        /*#__PURE__*/ React.createElement(
          'radialGradient',
          {
            id: `${gid}_hl`,
            cx: '0.3',
            cy: '0.25',
            r: '0.6',
          },
          /*#__PURE__*/ React.createElement('stop', {
            offset: '0',
            stopColor: 'rgba(255,255,255,0.18)',
          }),
          /*#__PURE__*/ React.createElement('stop', {
            offset: '1',
            stopColor: 'rgba(255,255,255,0)',
          })
        )
      ),
      /*#__PURE__*/ React.createElement('circle', {
        cx: '40',
        cy: '40',
        r: '39.5',
        fill: 'url(#'.concat(gid, ')'),
      }),
      /*#__PURE__*/ React.createElement('ellipse', {
        cx: '28',
        cy: '22',
        rx: '22',
        ry: '14',
        fill: 'url(#'.concat(gid, '_hl)'),
      }),
      /*#__PURE__*/ React.createElement(
        'g',
        {
          transform: 'translate('
            .concat(EYE_CX, ', ')
            .concat(EYE_CY, ') scale(')
            .concat(eyeScale, ') translate(')
            .concat(-EYE_CX + pupilOffset.x / eyeScale, ', ')
            .concat(-EYE_CY + pupilOffset.y / eyeScale, ')'),
        },
        /*#__PURE__*/ React.createElement(MorphPath, {
          d: geom.left,
          fill: eyeColor,
        }),
        /*#__PURE__*/ React.createElement(MorphPath, {
          d: geom.right,
          fill: eyeColor,
        })
      )
    )
  );
}
