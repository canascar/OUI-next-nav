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

import React, { useContext } from 'react';
import { OuiText } from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';

// Mini chart SVG placeholder
export const MiniChart = ({ type, color, width = '100%', height = 60 }) => {
  const charts = {
    line: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        <path d="M0 45 Q25 42 50 38 T100 25 T150 30 T200 15" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M0 45 Q25 42 50 38 T100 25 T150 30 T200 15 V60 H0 Z" fill={color} fillOpacity="0.1"/>
      </svg>
    ),
    bar: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        {[15,25,40,35,50,30,45,20,38,42].map((h,i) => (
          <rect key={i} x={i*20+2} y={60-h} width="16" height={h} fill={color} fillOpacity="0.7" rx="2"/>
        ))}
      </svg>
    ),
    area: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        <path d="M0 50 Q30 35 60 40 T120 20 T180 30 L200 25 V60 H0 Z" fill={color} fillOpacity="0.2"/>
        <path d="M0 50 Q30 35 60 40 T120 20 T180 30 L200 25" stroke={color} strokeWidth="2" fill="none"/>
      </svg>
    ),
    gauge: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        <rect x="10" y="25" width="180" height="10" rx="5" fill={color} fillOpacity="0.15"/>
        <rect x="10" y="25" width="165" height="10" rx="5" fill={color} fillOpacity="0.7"/>
        <text x="100" y="55" textAnchor="middle" fontSize="11" fill={color} fontWeight="600">92%</text>
      </svg>
    ),
    pie: (
      <svg width={width} height={height} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="25" fill={color} fillOpacity="0.15"/>
        <path d="M30 5 A25 25 0 0 1 55 30 L30 30 Z" fill={color} fillOpacity="0.7"/>
        <path d="M55 30 A25 25 0 0 1 30 55 L30 30 Z" fill={color} fillOpacity="0.4"/>
      </svg>
    ),
    table: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        {[0,1,2,3].map(i => (
          <g key={i}>
            <rect x="5" y={i*15+2} width="190" height="12" rx="2" fill={color} fillOpacity={i===0?0.15:0.06}/>
            <line x1="70" y1={i*15+2} x2="70" y2={i*15+14} stroke={color} strokeOpacity="0.2"/>
            <line x1="140" y1={i*15+2} x2="140" y2={i*15+14} stroke={color} strokeOpacity="0.2"/>
          </g>
        ))}
      </svg>
    ),
    heatmap: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        {Array.from({length: 40}).map((_,i) => (
          <rect key={i} x={(i%10)*20+2} y={Math.floor(i/10)*15+2} width="16" height="12" rx="2" fill={color} fillOpacity={Math.random()*0.7+0.1}/>
        ))}
      </svg>
    ),
    histogram: (
      <svg width={width} height={height} viewBox="0 0 200 60" fill="none">
        {[8,15,28,45,38,25,18,10,5,3].map((h,i) => (
          <rect key={i} x={i*20} y={60-h} width="19" height={h} fill={color} fillOpacity="0.6"/>
        ))}
      </svg>
    ),
  };
  return charts[type] || charts.line;
};

/**
 * TempVisualizationCard - A temporary visualization card component
 * with frosted glass effect background
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.type - Chart type: 'line', 'bar', 'area', 'gauge', 'pie', 'table', 'heatmap', 'histogram'
 * @param {string} props.color - Chart color (hex or rgba)
 * @param {function} props.onClick - Click handler
 * @param {number} props.index - Animation delay index
 * @param {Object} props.style - Additional styles
 */
export const TempVisualizationCard = ({ 
  title, 
  description, 
  type = 'line', 
  color = '#7dd3fc',
  onClick,
  index = 0,
  style = {},
  children,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  // Frosted glass background styles
  const cardStyle = {
    backgroundColor: isDark 
      ? 'rgba(14, 21, 37, 0.7)'  // Obsidian with 70% opacity
      : 'rgba(255, 255, 255, 0.7)', // White with 70% opacity
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: isDark
      ? '1px solid rgba(122, 159, 212, 0.15)'  // Sky blue border for dark
      : '1px solid rgba(46, 74, 143, 0.12)',   // Deep blue border for light
    borderRadius: 8,
    padding: 12,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
    marginBottom: 8,
    animationDelay: `${index * 150}ms`,
    ...style,
  };

  const hoverStyle = onClick ? {
    ':hover': {
      borderColor: isDark 
        ? 'rgba(122, 159, 212, 0.4)' 
        : 'rgba(46, 74, 143, 0.3)',
      boxShadow: isDark
        ? '0 4px 20px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px rgba(46, 74, 143, 0.15)',
      transform: 'translateY(-2px)',
    }
  } : {};

  return (
    <div
      className="tempVisualizationCard"
      onClick={onClick}
      style={cardStyle}
    >
      {title && (
        <OuiText size="xs"><strong>{title}</strong></OuiText>
      )}
      {(type || children) && (
        <div style={{ margin: '8px 0' }}>
          {children || <MiniChart type={type} color={color} />}
        </div>
      )}
      {description && (
        <OuiText size="xs" color="subdued">{description}</OuiText>
      )}
    </div>
  );
};

// Visualization data structure for easy reuse
export const VISUALIZATION_TYPES = {
  ERROR_RATE: {
    id: 'error-rate-timeline',
    title: 'Error Rate Over Time',
    type: 'line',
    description: 'Error rate across all services in the last 24h',
    color: '#ED6F73', // Coral from Agentic OSD
  },
  LATENCY_P99: {
    id: 'latency-p99',
    title: 'P99 Latency by Service',
    type: 'bar',
    description: 'Tail latency distribution across services',
    color: '#7dd3fc',
  },
  THROUGHPUT: {
    id: 'throughput-overview',
    title: 'Throughput Overview',
    type: 'area',
    description: 'Requests per second across the stack',
    color: '#5CB198', // Jade from Agentic OSD
  },
  CONNECTION_POOL: {
    id: 'connection-pool',
    title: 'Connection Pool Utilization',
    type: 'gauge',
    description: 'Active connections vs. pool capacity',
    color: '#CDA849', // Citrine from Agentic OSD
  },
};

export default TempVisualizationCard;
