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

import React from 'react';

// ─────────────────────────────────────────────
// STYLES (self-contained — no dependency on app SCSS)
// ─────────────────────────────────────────────

const colors = {
  awsNavBg: '#232f3e',
  awsOrange: '#ff9900',
  awsOrangeHover: '#ec7211',
  awsNavText: '#ffffff',
  pageBg: '#ffffff',
  sectionGreyBg: '#f2f3f3',
  textPrimary: '#16191f',
  textSecondary: '#545b64',
  textMuted: '#687078',
  borderLight: '#eaeded',
  linkBlue: '#0073bb',
  cardBorder: '#d5dbdb',
};

const fonts = {
  base: "'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif",
};

// ─────────────────────────────────────────────
// TOP NAVIGATION BAR (AWS global nav)
// ─────────────────────────────────────────────
const TopNav = () => (
  <header
    style={{
      backgroundColor: colors.awsNavBg,
      padding: '0 24px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
    }}>
    <nav
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: fonts.base,
      }}
      aria-label="AWS global navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="#" style={topNavLinkStyle}>
          AWS Summits
        </a>
        <a href="#" style={topNavLinkStyle}>
          Discover AWS
        </a>
        <a href="#" style={topNavLinkStyle}>
          Products
        </a>
        <a href="#" style={topNavLinkStyle}>
          Solutions
        </a>
        <a href="#" style={topNavLinkStyle}>
          Pricing
        </a>
        <a href="#" style={topNavLinkStyle}>
          Resources
        </a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a
          href="#"
          style={{
            ...topNavLinkStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ marginRight: '2px' }}>
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <line
              x1="11"
              y1="11"
              x2="14"
              y2="14"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Search
        </a>
        <a href="#" style={topNavLinkStyle}>
          Sign in to console
        </a>
        <button
          style={{
            backgroundColor: colors.awsOrange,
            color: '#0f1b2d',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: fonts.base,
          }}>
          Create account
        </button>
      </div>
    </nav>
  </header>
);

const topNavLinkStyle = {
  color: colors.awsNavText,
  fontSize: '13px',
  fontWeight: 400,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

// ─────────────────────────────────────────────
// SECONDARY NAVIGATION (Product tabs)
// ─────────────────────────────────────────────
const SecondaryNav = () => (
  <nav
    style={{
      backgroundColor: colors.pageBg,
      borderBottom: `1px solid ${colors.borderLight}`,
      padding: '0 24px',
      fontFamily: fonts.base,
    }}
    aria-label="Product navigation">
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        height: '48px',
      }}>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: colors.textPrimary,
          whiteSpace: 'nowrap',
        }}>
        Amazon OpenSearch Service
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <a
          href="#"
          style={{
            ...tabStyle,
            color: colors.linkBlue,
            borderBottom: `2px solid ${colors.linkBlue}`,
            fontWeight: 600,
          }}>
          Overview
        </a>
        <a href="#" style={tabStyle}>
          Features ›
        </a>
        <a href="#" style={tabStyle}>
          Pricing
        </a>
        <a href="#" style={tabStyle}>
          Getting Started ›
        </a>
        <a href="#" style={tabStyle}>
          Resources ›
        </a>
        <a href="#" style={tabStyle}>
          Migrations
        </a>
        <a href="#" style={tabStyle}>
          More ›
        </a>
      </div>
    </div>
  </nav>
);

const tabStyle = {
  fontSize: '13px',
  fontWeight: 400,
  color: colors.textSecondary,
  textDecoration: 'none',
  padding: '14px 0',
  borderBottom: '2px solid transparent',
  whiteSpace: 'nowrap',
};

// ─────────────────────────────────────────────
// HERO SECTION (Amazon Quick-inspired left-aligned style)
// ─────────────────────────────────────────────
const HeroSection = () => (
  <section
    style={{
      padding: '64px 24px 72px',
      fontFamily: fonts.base,
      background:
        'linear-gradient(135deg, #ffffff 0%, #fdf4ff 25%, #f5d0fe 50%, #e9b5f7 75%, #d8b4fe 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <nav
        style={{
          fontSize: '13px',
          margin: '0 0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-label="Breadcrumb">
        <a
          href="#"
          style={{
            color: '#7c3aed',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}>
          Products
        </a>
        <span style={{ color: colors.textMuted }}>›</span>
        <a
          href="#"
          style={{
            color: '#7c3aed',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}>
          Analytics
        </a>
        <span style={{ color: colors.textMuted }}>›</span>
        <span style={{ color: colors.textPrimary }}>
          Amazon OpenSearch Service
        </span>
      </nav>
      <h1
        style={{
          fontSize: '42px',
          fontWeight: 700,
          lineHeight: 1.15,
          color: colors.textPrimary,
          margin: '0 0 16px',
          fontFamily: fonts.base,
          maxWidth: '560px',
        }}>
        Unified Observability
      </h1>
      <p
        style={{
          maxWidth: '480px',
          fontSize: '16px',
          lineHeight: 1.6,
          color: colors.textSecondary,
          margin: '0 0 32px',
        }}>
        Logs, metrics, traces, and AI agent monitoring in one platform.
      </p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={() => {
            window.location.href = '/#/onboarding-wizard';
          }}
          style={{
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: fonts.base,
          }}>
          Launch in OpenSearch UI
        </button>
        <button
          style={{
            backgroundColor: '#ffffff',
            color: '#1a1a2e',
            border: '2px solid #1a1a2e',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: fonts.base,
          }}>
          Launch in IDE
        </button>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// OVERVIEW SECTION
// ─────────────────────────────────────────────
const OverviewSection = () => (
  <section style={{ padding: '64px 24px', fontFamily: fonts.base }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: '0 0 24px',
        }}>
        Overview
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
        <div>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: colors.textSecondary,
              margin: 0,
            }}>
            OpenSearch Service unifies logs, metrics, and traces on a single
            OpenTelemetry-native platform. Ingest telemetry from containers,
            serverless functions, applications, and infrastructure, then
            correlate signals in real time to find the root cause of an issue in
            seconds instead of hours. Pre-built dashboards for application
            performance, infrastructure health, and security give teams an
            instant starting point, while intelligent storage tiering keeps
            recent data hot for fast queries and ages older data into low-cost
            storage automatically. Available fully managed or serverless, with
            the open-source flexibility of OpenSearch.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '16 / 9',
              backgroundColor: colors.sectionGreyBg,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Overview video">
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(22, 25, 31, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '4px',
              }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
                <polygon points="3,1 13,8 3,15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// BENEFITS SECTION
// ─────────────────────────────────────────────
const BENEFITS = [
  {
    title: 'One platform for logs, metrics, and traces',
    description:
      'Stop stitching tools together. Correlate all three signal types in a single query and jump from a spiking metric straight to the log line or trace span behind it — less context-switching, faster answers.',
  },
  {
    title: 'Root-cause analysis in seconds, at any scale',
    description:
      'Query petabytes of telemetry with sub-second latency using purpose-built time-series indexing. Auto-scaling absorbs the traffic spikes that happen during incidents, so investigations stay fast exactly when you need them to be.',
  },
  {
    title: 'Cost-optimized storage that grows with you',
    description:
      'Hot-warm-cold tiering keeps the last few days instantly queryable and ages older data into low-cost storage automatically. Pay only for what you use with serverless, or reserve capacity for steady production workloads. Up to 70% lower storage cost versus all-hot retention.',
  },
  {
    title: 'OpenTelemetry-native ingestion',
    description:
      'Collect data through OpenTelemetry, the AWS Distro for OpenTelemetry, FluentBit, and CloudWatch Logs subscriptions — no proprietary agents. Native integrations with Amazon EKS, AWS Lambda, and VPC Flow Logs get you collecting in minutes.',
  },
  {
    title: 'Fully managed and open source',
    description:
      'Run observability on the open-source engine trusted across the industry, without the operational overhead. OpenSearch Service handles scaling, patching, and availability with a 99.9% SLA, while Apache 2.0 licensing keeps you free from lock-in.',
  },
];

const BenefitsSection = () => (
  <section
    style={{
      padding: '64px 24px',
      backgroundColor: colors.sectionGreyBg,
      fontFamily: fonts.base,
    }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: '0 0 32px',
        }}>
        Benefits
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px 64px',
        }}>
        {BENEFITS.map((benefit, idx) => (
          <div key={idx}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: '0 0 8px',
              }}>
              {benefit.title}
            </h3>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: colors.textSecondary,
                margin: 0,
              }}>
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// USE CASES SECTION
// ─────────────────────────────────────────────
const USE_CASES = [
  {
    title: 'Application performance monitoring',
    description:
      'Trace requests end-to-end across microservices, surface slow endpoints, and tie latency spikes to the deploys and dependencies that caused them. Trace a checkout-latency regression to a single downstream service in one investigation.',
  },
  {
    title: 'Infrastructure and container monitoring',
    description:
      'Watch the health of EKS clusters, EC2 fleets, and serverless functions from one dashboard. Set thresholds on CPU, memory, and custom metrics, and drill straight into the logs behind any anomaly.',
  },
  {
    title: 'Security analytics and SIEM',
    description:
      'Analyze security logs at scale to detect threats in real time. Pre-built detection rules and SIGMA rule import help your security team spot suspicious patterns, investigate incidents, and meet compliance requirements.',
  },
  {
    title: 'Real-time alerting and anomaly detection',
    description:
      'Get notified the moment a metric crosses a threshold or ML-based anomaly detection flags unusual behavior. Route alerts to the channels your on-call team already uses — before small issues become outages.',
  },
];

const UseCasesSection = () => (
  <section style={{ padding: '64px 24px', fontFamily: fonts.base }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: '0 0 32px',
        }}>
        Use cases
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
        {USE_CASES.map((useCase, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: colors.pageBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: '8px',
              padding: '24px',
            }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: '0 0 8px',
              }}>
              {useCase.title}
            </h3>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: colors.textSecondary,
                margin: 0,
              }}>
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// MAIN PAGE EXPORT
// ─────────────────────────────────────────────
export const MarketingPage = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: colors.pageBg,
        fontFamily: fonts.base,
      }}>
      <TopNav />
      <SecondaryNav />
      <main>
        <HeroSection />
        <div style={{ position: 'relative' }}>
          {/* PLACEHOLDER overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '320px',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
            <span
              style={{
                fontSize: '72px',
                fontWeight: 300,
                color: '#e53e3e',
                letterSpacing: '8px',
                textTransform: 'uppercase',
                transform: 'rotate(-45deg)',
                fontFamily: fonts.base,
                opacity: 0.85,
              }}>
              PLACEHOLDER
            </span>
          </div>
          {/* Faded content */}
          <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
            <OverviewSection />
            <BenefitsSection />
            <UseCasesSection />
          </div>
        </div>
      </main>
    </div>
  );
};
