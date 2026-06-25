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

import React, { useState, useEffect, useCallback } from 'react';

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiSpacer,
  OuiTitle,
  OuiText,
  OuiIcon,
  OuiStat,
  OuiButtonIcon,
  OuiToolTip,
  OuiBadge,
  OuiInsightCard,
  OuiSmallButton,
  OuiSmallButtonEmpty,
  OuiTab,
  OuiTabs,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

const POSTURE_STATS = [
  {
    title: '94.2%',
    description: 'Automation coverage',
    color: 'success',
    trend: '+3.1%',
    trendDirection: 'up',
  },
  {
    title: '87%',
    description: 'Human workload reduction',
    color: 'success',
    trend: '+12%',
    trendDirection: 'up',
  },
  {
    title: '4.2 min',
    description: 'Mean time to remediate',
    color: 'success',
    trend: '-68%',
    trendDirection: 'down',
  },
  {
    title: '2.1%',
    description: 'Recurrence rate',
    color: 'success',
    trend: '-0.8%',
    trendDirection: 'down',
  },
];

const AUTONOMOUS_FINDINGS = [
  {
    id: 'f-001',
    title: 'S3 bucket public access detected',
    severity: 'Critical',
    status: 'auto-remediated',
    service: 'data-pipeline-prod',
    detectedAt: '2 min ago',
    resolvedAt: '2 min ago',
    action: 'Block public access policy applied',
    guardrail: 'Matches policy: "No public S3 in production"',
  },
  {
    id: 'f-002',
    title: 'Security group allows 0.0.0.0/0 on port 22',
    severity: 'High',
    status: 'auto-remediated',
    service: 'web-fleet-staging',
    detectedAt: '8 min ago',
    resolvedAt: '7 min ago',
    action: 'Restricted to VPN CIDR 10.0.0.0/8',
    guardrail: 'Matches policy: "SSH only from corporate network"',
  },
  {
    id: 'f-003',
    title: 'IAM user access key older than 90 days',
    severity: 'Medium',
    status: 'auto-remediated',
    service: 'ci-cd-service-account',
    detectedAt: '15 min ago',
    resolvedAt: '14 min ago',
    action: 'Rotated key, updated secrets manager reference',
    guardrail: 'Matches policy: "Rotate credentials every 90 days"',
  },
  {
    id: 'f-004',
    title: 'CloudTrail logging disabled in us-west-2',
    severity: 'Critical',
    status: 'escalated',
    service: 'account-level',
    detectedAt: '3 min ago',
    resolvedAt: null,
    action: null,
    guardrail: 'Escalation: "CloudTrail changes require human approval"',
    escalationReason:
      'Disabling CloudTrail may be intentional maintenance. Requires security lead confirmation.',
  },
  {
    id: 'f-005',
    title: 'Unencrypted EBS volume attached to production instance',
    severity: 'High',
    status: 'investigating',
    service: 'payment-service',
    detectedAt: '1 min ago',
    resolvedAt: null,
    action: null,
    guardrail: 'Investigating: Checking if volume contains sensitive data',
  },
];

const SEMANTIC_POLICIES = [
  {
    id: 'p-001',
    name: 'No public S3 in production',
    intent:
      'Production S3 buckets must never be publicly accessible. Auto-block public access immediately.',
    scope: 'All accounts tagged environment:production',
    remediations: 142,
    lastTriggered: '2 min ago',
    confidence: 99,
  },
  {
    id: 'p-002',
    name: 'SSH only from corporate network',
    intent:
      'SSH access should only come from our corporate VPN range. Restrict any security group that opens port 22 to the internet.',
    scope: 'All VPCs in us-east-1, us-west-2',
    remediations: 87,
    lastTriggered: '7 min ago',
    confidence: 97,
  },
  {
    id: 'p-003',
    name: 'Rotate credentials every 90 days',
    intent:
      'All service account credentials and IAM access keys must be rotated within 90 days. Auto-rotate and update downstream consumers.',
    scope: 'All IAM users and service accounts',
    remediations: 234,
    lastTriggered: '14 min ago',
    confidence: 95,
  },
  {
    id: 'p-004',
    name: 'Encrypt all data at rest in production',
    intent:
      'Any unencrypted storage in production accounts must be encrypted. For EBS volumes, create encrypted snapshot and replace. For RDS, enable encryption on next maintenance window.',
    scope: 'Production accounts',
    remediations: 56,
    lastTriggered: '1 hour ago',
    confidence: 92,
  },
];

const ACTIVITY_FEED = [
  {
    time: '2 min ago',
    event: 'Auto-remediated',
    detail: 'S3 bucket public access blocked on data-pipeline-prod',
    type: 'success',
  },
  {
    time: '3 min ago',
    event: 'Escalated',
    detail: 'CloudTrail disabled in us-west-2 — awaiting human review',
    type: 'warning',
  },
  {
    time: '7 min ago',
    event: 'Auto-remediated',
    detail: 'Security group restricted for web-fleet-staging',
    type: 'success',
  },
  {
    time: '14 min ago',
    event: 'Auto-remediated',
    detail: 'IAM access key rotated for ci-cd-service-account',
    type: 'success',
  },
  {
    time: '22 min ago',
    event: 'Policy matched',
    detail: 'New instance launched with untagged security group',
    type: 'info',
  },
  {
    time: '35 min ago',
    event: 'Auto-remediated',
    detail: 'Unused IAM role detached from production',
    type: 'success',
  },
  {
    time: '1 hour ago',
    event: 'Auto-remediated',
    detail: 'EBS volume encrypted on analytics-cluster',
    type: 'success',
  },
];

const severityColor = (severity) => {
  switch (severity) {
    case 'Critical':
      return '#f87171';
    case 'High':
      return '#fb923c';
    case 'Medium':
      return '#fbbf24';
    case 'Low':
      return '#34d399';
    default:
      return '#94a3b8';
  }
};

const statusBadge = (status) => {
  switch (status) {
    case 'auto-remediated':
      return (
        <OuiBadge color="#dcfce7" style={{ color: '#166534' }}>
          Auto-remediated
        </OuiBadge>
      );
    case 'escalated':
      return (
        <OuiBadge color="#fef3c7" style={{ color: '#92400e' }}>
          Escalated to human
        </OuiBadge>
      );
    case 'investigating':
      return (
        <OuiBadge color="#dbeafe" style={{ color: '#1e40af' }}>
          Investigating
        </OuiBadge>
      );
    default:
      return <OuiBadge color="hollow">{status}</OuiBadge>;
  }
};

const PostureGauge = ({ value, label }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#34d399' : value >= 70 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="700"
          fill="currentColor">
          {value}%
        </text>
      </svg>
      <OuiText size="xs" color="subdued" style={{ marginTop: 4 }}>
        <p style={{ margin: 0 }}>{label}</p>
      </OuiText>
    </div>
  );
};

const FindingRow = ({ finding }) => (
  <div
    className="securityHub__findingRow"
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--ouiBorderColor, #eee)',
    }}>
    <div
      style={{
        width: 4,
        height: 40,
        borderRadius: 2,
        background: severityColor(finding.severity),
        flexShrink: 0,
        marginTop: 2,
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
        }}>
        <OuiText size="s">
          <strong>{finding.title}</strong>
        </OuiText>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
        <OuiText size="xs" color="subdued">
          {finding.service}
        </OuiText>
        <span style={{ opacity: 0.3 }}>|</span>
        <OuiText size="xs" color="subdued">
          {finding.detectedAt}
        </OuiText>
        {finding.action && (
          <>
            <span style={{ opacity: 0.3 }}>|</span>
            <OuiText size="xs" color="success">
              {finding.action}
            </OuiText>
          </>
        )}
      </div>
      {finding.escalationReason && (
        <OuiText
          size="xs"
          color="warning"
          style={{ marginTop: 4, fontStyle: 'italic' }}>
          {finding.escalationReason}
        </OuiText>
      )}
      <OuiText
        size="xs"
        color="subdued"
        style={{ marginTop: 2, opacity: 0.7 }}>
        {finding.guardrail}
      </OuiText>
    </div>
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
      {statusBadge(finding.status)}
    </div>
  </div>
);

const PolicyCard = ({ policy }) => (
  <OuiPanel paddingSize="m" hasBorder style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <OuiText size="s">
          <strong>{policy.name}</strong>
        </OuiText>
        <OuiText size="xs" color="subdued" style={{ marginTop: 4 }}>
          &ldquo;{policy.intent}&rdquo;
        </OuiText>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
          <OuiText size="xs" color="subdued">
            Scope: {policy.scope}
          </OuiText>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
        <OuiText size="xs" color="success">
          <strong>{policy.remediations}</strong> auto-remediations
        </OuiText>
        <OuiText size="xs" color="subdued" style={{ marginTop: 2 }}>
          Last triggered: {policy.lastTriggered}
        </OuiText>
        <OuiText size="xs" color="subdued" style={{ marginTop: 2 }}>
          Confidence: {policy.confidence}%
        </OuiText>
      </div>
    </div>
  </OuiPanel>
);

const ActivityItem = ({ item }) => {
  const iconMap = {
    success: 'checkInCircleFilled',
    warning: 'alert',
    info: 'iInCircle',
  };
  const colorMap = {
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '8px 0',
        fontSize: 13,
      }}>
      <OuiIcon
        type={iconMap[item.type]}
        size="s"
        color={colorMap[item.type]}
        style={{ marginTop: 2 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>{item.event}</span>
        <span style={{ opacity: 0.6, marginLeft: 8 }}>{item.detail}</span>
      </div>
      <OuiText size="xs" color="subdued" style={{ flexShrink: 0 }}>
        {item.time}
      </OuiText>
    </div>
  );
};

export const SecurityHubPage = ({
  selectedItem,
  onContinueAsThread,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => {
  const [activeTab, setActiveTab] = useState('posture');
  const [findingFilter, setFindingFilter] = useState('all');

  const filteredFindings =
    findingFilter === 'all'
      ? AUTONOMOUS_FINDINGS
      : AUTONOMOUS_FINDINGS.filter((f) => f.status === findingFilter);

  const autoRemediatedCount = AUTONOMOUS_FINDINGS.filter(
    (f) => f.status === 'auto-remediated'
  ).length;
  const escalatedCount = AUTONOMOUS_FINDINGS.filter(
    (f) => f.status === 'escalated'
  ).length;
  const investigatingCount = AUTONOMOUS_FINDINGS.filter(
    (f) => f.status === 'investigating'
  ).length;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader
        title="Security Hub — Omni"
        onContinueAsThread={onContinueAsThread}
        isAskAiPanelOpen={isAskAiPanelOpen}
        onAskAiToggle={onAskAiToggle}
        mockAiResponses={[
          {
            prompt: 'security posture',
            response:
              'Your security posture score is 94.2%. 142 findings were auto-remediated in the last 24 hours with zero recurrence. One escalation is pending human review: CloudTrail was disabled in us-west-2.',
          },
        ]}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 4px' }}>
        {/* Tabs */}
        <OuiTabs size="s" style={{ marginBottom: 16 }}>
          <OuiTab
            isSelected={activeTab === 'posture'}
            onClick={() => setActiveTab('posture')}>
            Posture Overview
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'findings'}
            onClick={() => setActiveTab('findings')}>
            Findings ({AUTONOMOUS_FINDINGS.length})
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'policies'}
            onClick={() => setActiveTab('policies')}>
            Semantic Policies ({SEMANTIC_POLICIES.length})
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}>
            Activity Feed
          </OuiTab>
        </OuiTabs>

        {/* Posture Overview Tab */}
        {activeTab === 'posture' && (
          <div>
            {/* Gauges row */}
            <OuiPanel paddingSize="l" hasBorder>
              <OuiFlexGroup
                justifyContent="spaceAround"
                alignItems="center"
                responsive={false}>
                <OuiFlexItem grow={false}>
                  <PostureGauge value={94} label="Automation coverage" />
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <PostureGauge value={87} label="Workload reduction" />
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <PostureGauge value={98} label="Findings resolved < 5min" />
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <PostureGauge value={97} label="Policy compliance" />
                </OuiFlexItem>
              </OuiFlexGroup>
            </OuiPanel>

            <OuiSpacer size="m" />

            {/* Stats row */}
            <OuiFlexGroup gutterSize="m" responsive={false}>
              {POSTURE_STATS.map((stat, i) => (
                <OuiFlexItem key={i}>
                  <OuiPanel paddingSize="m" hasBorder>
                    <OuiText size="xs" color="subdued">
                      <p style={{ margin: 0 }}>{stat.description}</p>
                    </OuiText>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 8,
                        marginTop: 4,
                      }}>
                      <span
                        style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                        {stat.title}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            stat.trendDirection === 'up' &&
                            stat.description.includes('reduction')
                              ? '#34d399'
                              : stat.trendDirection === 'down'
                              ? '#34d399'
                              : '#34d399',
                        }}>
                        {stat.trend}
                      </span>
                    </div>
                  </OuiPanel>
                </OuiFlexItem>
              ))}
            </OuiFlexGroup>

            <OuiSpacer size="m" />

            {/* Two-column: recent auto-remediations + escalations */}
            <OuiFlexGroup gutterSize="m">
              <OuiFlexItem grow={2}>
                <OuiPanel paddingSize="m" hasBorder>
                  <OuiFlexGroup
                    alignItems="center"
                    justifyContent="spaceBetween"
                    responsive={false}
                    gutterSize="none">
                    <OuiFlexItem grow={false}>
                      <OuiTitle size="xs">
                        <h3>Recent autonomous actions</h3>
                      </OuiTitle>
                    </OuiFlexItem>
                    <OuiFlexItem grow={false}>
                      <OuiSmallButtonEmpty
                        onClick={() => setActiveTab('findings')}>
                        View all
                      </OuiSmallButtonEmpty>
                    </OuiFlexItem>
                  </OuiFlexGroup>
                  <OuiSpacer size="s" />
                  {AUTONOMOUS_FINDINGS.filter(
                    (f) => f.status === 'auto-remediated'
                  ).map((finding) => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                </OuiPanel>
              </OuiFlexItem>
              <OuiFlexItem grow={1}>
                <OuiPanel paddingSize="m" hasBorder>
                  <OuiTitle size="xs">
                    <h3>Pending escalations</h3>
                  </OuiTitle>
                  <OuiSpacer size="s" />
                  {AUTONOMOUS_FINDINGS.filter(
                    (f) => f.status === 'escalated'
                  ).map((finding) => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                  {AUTONOMOUS_FINDINGS.filter(
                    (f) => f.status === 'investigating'
                  ).map((finding) => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                  {escalatedCount + investigatingCount === 0 && (
                    <OuiText
                      size="s"
                      color="subdued"
                      textAlign="center"
                      style={{ padding: '24px 0' }}>
                      <p>No pending escalations</p>
                    </OuiText>
                  )}
                </OuiPanel>
              </OuiFlexItem>
            </OuiFlexGroup>

            <OuiSpacer size="m" />

            {/* Remediation velocity chart (mock SVG) */}
            <OuiPanel paddingSize="m" hasBorder>
              <OuiFlexGroup
                alignItems="center"
                justifyContent="spaceBetween"
                responsive={false}
                gutterSize="none">
                <OuiFlexItem grow={false}>
                  <OuiTitle size="xs">
                    <h3>Remediation velocity (last 7 days)</h3>
                  </OuiTitle>
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <OuiText size="xs" color="subdued">
                    Avg: 4.2 min (down from 2.3 hours manual)
                  </OuiText>
                </OuiFlexItem>
              </OuiFlexGroup>
              <OuiSpacer size="s" />
              <svg viewBox="0 0 600 120" style={{ width: '100%', height: 120 }}>
                <defs>
                  <linearGradient id="velFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                <line x1="40" y1="50" x2="580" y2="50" stroke="currentColor" strokeOpacity="0.08" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" strokeOpacity="0.08" />
                {/* Y-axis labels */}
                <text x="35" y="23" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="end">150</text>
                <text x="35" y="53" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="end">100</text>
                <text x="35" y="83" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="end">50</text>
                <text x="35" y="108" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="end">0</text>
                {/* Area fill */}
                <path
                  d="M60,85 L140,78 L220,72 L300,60 L380,55 L460,48 L540,42 V105 H60 Z"
                  fill="url(#velFill)"
                />
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points="60,85 140,78 220,72 300,60 380,55 460,48 540,42"
                />
                {/* Points */}
                <circle cx="60" cy="85" r="4" fill="#34d399" />
                <circle cx="140" cy="78" r="4" fill="#34d399" />
                <circle cx="220" cy="72" r="4" fill="#34d399" />
                <circle cx="300" cy="60" r="4" fill="#34d399" />
                <circle cx="380" cy="55" r="4" fill="#34d399" />
                <circle cx="460" cy="48" r="4" fill="#34d399" />
                <circle cx="540" cy="42" r="4" fill="#34d399" />
                {/* X-axis labels */}
                <text x="60" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Mon</text>
                <text x="140" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Tue</text>
                <text x="220" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Wed</text>
                <text x="300" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Thu</text>
                <text x="380" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Fri</text>
                <text x="460" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Sat</text>
                <text x="540" y="118" fontSize="9" fill="currentColor" opacity="0.5" textAnchor="middle">Today</text>
              </svg>
            </OuiPanel>
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div>
            {/* Filter chips */}
            <OuiFlexGroup gutterSize="s" responsive={false} style={{ marginBottom: 12 }}>
              <OuiFlexItem grow={false}>
                <OuiSmallButton
                  color={findingFilter === 'all' ? 'primary' : 'text'}
                  fill={findingFilter === 'all'}
                  onClick={() => setFindingFilter('all')}>
                  All ({AUTONOMOUS_FINDINGS.length})
                </OuiSmallButton>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiSmallButton
                  color={findingFilter === 'auto-remediated' ? 'primary' : 'text'}
                  fill={findingFilter === 'auto-remediated'}
                  onClick={() => setFindingFilter('auto-remediated')}>
                  Auto-remediated ({autoRemediatedCount})
                </OuiSmallButton>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiSmallButton
                  color={findingFilter === 'escalated' ? 'primary' : 'text'}
                  fill={findingFilter === 'escalated'}
                  onClick={() => setFindingFilter('escalated')}>
                  Escalated ({escalatedCount})
                </OuiSmallButton>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiSmallButton
                  color={findingFilter === 'investigating' ? 'primary' : 'text'}
                  fill={findingFilter === 'investigating'}
                  onClick={() => setFindingFilter('investigating')}>
                  Investigating ({investigatingCount})
                </OuiSmallButton>
              </OuiFlexItem>
            </OuiFlexGroup>

            <OuiPanel paddingSize="m" hasBorder>
              {filteredFindings.map((finding) => (
                <FindingRow key={finding.id} finding={finding} />
              ))}
              {filteredFindings.length === 0 && (
                <OuiText
                  size="s"
                  color="subdued"
                  textAlign="center"
                  style={{ padding: '32px 0' }}>
                  <p>No findings match this filter.</p>
                </OuiText>
              )}
            </OuiPanel>
          </div>
        )}

        {/* Semantic Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <OuiFlexGroup
              alignItems="center"
              justifyContent="spaceBetween"
              responsive={false}
              gutterSize="none"
              style={{ marginBottom: 12 }}>
              <OuiFlexItem grow={false}>
                <OuiText size="s" color="subdued">
                  <p style={{ margin: 0 }}>
                    Express security intent in natural language. The system
                    interprets contextually and remediates within guardrails.
                  </p>
                </OuiText>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiSmallButton iconType="plus" fill>
                  Add policy
                </OuiSmallButton>
              </OuiFlexItem>
            </OuiFlexGroup>

            {SEMANTIC_POLICIES.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === 'activity' && (
          <OuiPanel paddingSize="m" hasBorder>
            <OuiTitle size="xs">
              <h3>Autonomous agent activity</h3>
            </OuiTitle>
            <OuiSpacer size="s" />
            {ACTIVITY_FEED.map((item, i) => (
              <ActivityItem key={i} item={item} />
            ))}
          </OuiPanel>
        )}

        <OuiSpacer size="xl" />
      </div>
    </div>
  );
};
