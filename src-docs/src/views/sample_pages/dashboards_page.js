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

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiStat,
  OuiSpacer,
  OuiText,
  OuiTitle,
  OuiHorizontalRule,
  OuiBasicTable,
  OuiHealth,
  OuiIcon,
  OuiButtonEmpty,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';
import { DashboardPageMock } from './mock_canvas_pages';

// ============================================================
// SYSTEM OVERVIEW DASHBOARD
// ============================================================

const SystemOverviewDashboard = () => (
  <div className="dashboardPage__content">
    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="99.7%"
            description="Uptime"
            titleColor="success"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat title="24" description="Active nodes" titleSize="m" />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="3"
            description="Active alerts"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat title="1.2 TB" description="Storage used" titleSize="m" />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem grow={2}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Cluster health</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                name: 'node-prod-01',
                status: 'healthy',
                cpu: '34%',
                memory: '62%',
                disk: '45%',
              },
              {
                name: 'node-prod-02',
                status: 'healthy',
                cpu: '28%',
                memory: '58%',
                disk: '41%',
              },
              {
                name: 'node-prod-03',
                status: 'warning',
                cpu: '78%',
                memory: '85%',
                disk: '72%',
              },
              {
                name: 'node-prod-04',
                status: 'healthy',
                cpu: '42%',
                memory: '67%',
                disk: '53%',
              },
              {
                name: 'node-prod-05',
                status: 'healthy',
                cpu: '19%',
                memory: '44%',
                disk: '38%',
              },
              {
                name: 'node-prod-06',
                status: 'danger',
                cpu: '92%',
                memory: '94%',
                disk: '88%',
              },
            ]}
            columns={[
              { field: 'name', name: 'Node' },
              {
                field: 'status',
                name: 'Status',
                render: (status) => (
                  <OuiHealth
                    color={
                      status === 'healthy'
                        ? 'success'
                        : status === 'warning'
                        ? 'warning'
                        : 'danger'
                    }>
                    {status}
                  </OuiHealth>
                ),
              },
              { field: 'cpu', name: 'CPU' },
              { field: 'memory', name: 'Memory' },
              { field: 'disk', name: 'Disk' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem grow={1}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Recent alerts</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <div className="dashboardPage__alertList">
            <div className="dashboardPage__alertItem">
              <OuiIcon type="alert" color="danger" size="s" />
              <div>
                <OuiText size="xs">
                  <strong>CPU threshold exceeded</strong>
                </OuiText>
                <OuiText size="xs" color="subdued">
                  node-prod-06 · 10 min ago
                </OuiText>
              </div>
            </div>
            <OuiHorizontalRule margin="xs" />
            <div className="dashboardPage__alertItem">
              <OuiIcon type="alert" color="warning" size="s" />
              <div>
                <OuiText size="xs">
                  <strong>Memory pressure warning</strong>
                </OuiText>
                <OuiText size="xs" color="subdued">
                  node-prod-03 · 25 min ago
                </OuiText>
              </div>
            </div>
            <OuiHorizontalRule margin="xs" />
            <div className="dashboardPage__alertItem">
              <OuiIcon type="alert" color="danger" size="s" />
              <div>
                <OuiText size="xs">
                  <strong>Disk usage critical</strong>
                </OuiText>
                <OuiText size="xs" color="subdued">
                  node-prod-06 · 1 hour ago
                </OuiText>
              </div>
            </div>
          </div>
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <OuiTitle size="xs">
        <h3>Index statistics</h3>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiBasicTable
        items={[
          {
            index: 'logs-2026.05.*',
            docs: '12.4M',
            size: '8.2 GB',
            health: 'green',
          },
          {
            index: 'metrics-2026.05.*',
            docs: '8.1M',
            size: '5.6 GB',
            health: 'green',
          },
          {
            index: 'traces-2026.05.*',
            docs: '3.2M',
            size: '2.1 GB',
            health: 'green',
          },
          {
            index: 'alerts-2026.05.*',
            docs: '45.2K',
            size: '128 MB',
            health: 'yellow',
          },
        ]}
        columns={[
          { field: 'index', name: 'Index pattern' },
          { field: 'docs', name: 'Documents' },
          { field: 'size', name: 'Size' },
          {
            field: 'health',
            name: 'Health',
            render: (health) => (
              <OuiHealth color={health === 'green' ? 'success' : 'warning'}>
                {health}
              </OuiHealth>
            ),
          },
        ]}
        compressed
      />
    </OuiPanel>
  </div>
);

// ============================================================
// WEB TRAFFIC ANALYTICS DASHBOARD
// ============================================================

const WebTrafficDashboard = () => (
  <div className="dashboardPage__content">
    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat title="2.4M" description="Page views (24h)" titleSize="m" />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat title="842K" description="Unique visitors" titleSize="m" />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="3.2s"
            description="Avg. load time"
            titleColor="primary"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="32.1%"
            description="Bounce rate"
            titleColor="accent"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Top pages</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                page: '/home',
                views: '482,310',
                avgTime: '2.1s',
                bounceRate: '24%',
              },
              {
                page: '/products',
                views: '321,450',
                avgTime: '3.4s',
                bounceRate: '31%',
              },
              {
                page: '/checkout',
                views: '198,220',
                avgTime: '4.2s',
                bounceRate: '18%',
              },
              {
                page: '/blog',
                views: '156,890',
                avgTime: '5.1s',
                bounceRate: '45%',
              },
              {
                page: '/api/docs',
                views: '134,200',
                avgTime: '2.8s',
                bounceRate: '22%',
              },
              {
                page: '/support',
                views: '98,450',
                avgTime: '3.9s',
                bounceRate: '38%',
              },
            ]}
            columns={[
              { field: 'page', name: 'Page' },
              { field: 'views', name: 'Views' },
              { field: 'avgTime', name: 'Avg. time' },
              { field: 'bounceRate', name: 'Bounce rate' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Traffic sources</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                source: 'Organic search',
                sessions: '412,300',
                percentage: '38.2%',
              },
              { source: 'Direct', sessions: '298,100', percentage: '27.6%' },
              {
                source: 'Social media',
                sessions: '187,400',
                percentage: '17.4%',
              },
              { source: 'Referral', sessions: '112,800', percentage: '10.5%' },
              { source: 'Email', sessions: '68,200', percentage: '6.3%' },
            ]}
            columns={[
              { field: 'source', name: 'Source' },
              { field: 'sessions', name: 'Sessions' },
              { field: 'percentage', name: '% of total' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Geographic distribution</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                country: 'United States',
                visitors: '312,400',
                percentage: '37.1%',
              },
              {
                country: 'United Kingdom',
                visitors: '98,200',
                percentage: '11.7%',
              },
              { country: 'Germany', visitors: '87,600', percentage: '10.4%' },
              { country: 'Japan', visitors: '72,100', percentage: '8.6%' },
              { country: 'Canada', visitors: '64,300', percentage: '7.6%' },
              { country: 'France', visitors: '58,900', percentage: '7.0%' },
              { country: 'Australia', visitors: '45,200', percentage: '5.4%' },
              { country: 'Other', visitors: '103,300', percentage: '12.3%' },
            ]}
            columns={[
              { field: 'country', name: 'Country' },
              { field: 'visitors', name: 'Visitors' },
              { field: 'percentage', name: '% of total' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Browser &amp; device</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              { browser: 'Chrome', share: '58.4%', device: 'Desktop' },
              { browser: 'Safari', share: '22.1%', device: 'Mobile' },
              { browser: 'Firefox', share: '9.8%', device: 'Desktop' },
              { browser: 'Edge', share: '6.2%', device: 'Desktop' },
              { browser: 'Other', share: '3.5%', device: 'Mixed' },
            ]}
            columns={[
              { field: 'browser', name: 'Browser' },
              { field: 'share', name: 'Share' },
              { field: 'device', name: 'Primary device' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>
  </div>
);

// ============================================================
// API PERFORMANCE DASHBOARD
// ============================================================

const ApiPerformanceDashboard = () => (
  <div className="dashboardPage__content">
    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="142ms"
            description="P50 latency"
            titleColor="success"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="487ms"
            description="P95 latency"
            titleColor="primary"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="1.2%"
            description="Error rate"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat title="18.4K" description="Requests/min" titleSize="m" />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem grow={2}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Endpoint performance</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                endpoint: 'GET /api/v2/users',
                p50: '89ms',
                p95: '210ms',
                p99: '450ms',
                rpm: '4,200',
                errors: '0.3%',
                status: 'healthy',
              },
              {
                endpoint: 'POST /api/v2/orders',
                p50: '156ms',
                p95: '520ms',
                p99: '1.2s',
                rpm: '2,800',
                errors: '1.8%',
                status: 'warning',
              },
              {
                endpoint: 'GET /api/v2/products',
                p50: '112ms',
                p95: '340ms',
                p99: '680ms',
                rpm: '5,100',
                errors: '0.5%',
                status: 'healthy',
              },
              {
                endpoint: 'PUT /api/v2/cart',
                p50: '198ms',
                p95: '680ms',
                p99: '1.5s',
                rpm: '1,900',
                errors: '2.4%',
                status: 'danger',
              },
              {
                endpoint: 'GET /api/v2/search',
                p50: '245ms',
                p95: '890ms',
                p99: '2.1s',
                rpm: '3,400',
                errors: '1.1%',
                status: 'warning',
              },
              {
                endpoint: 'DELETE /api/v2/sessions',
                p50: '45ms',
                p95: '120ms',
                p99: '280ms',
                rpm: '980',
                errors: '0.1%',
                status: 'healthy',
              },
            ]}
            columns={[
              { field: 'endpoint', name: 'Endpoint' },
              { field: 'p50', name: 'P50' },
              { field: 'p95', name: 'P95' },
              { field: 'p99', name: 'P99' },
              { field: 'rpm', name: 'RPM' },
              { field: 'errors', name: 'Errors' },
              {
                field: 'status',
                name: 'Health',
                render: (status) => (
                  <OuiHealth
                    color={
                      status === 'healthy'
                        ? 'success'
                        : status === 'warning'
                        ? 'warning'
                        : 'danger'
                    }>
                    {status}
                  </OuiHealth>
                ),
              },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Error breakdown</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                code: '500',
                description: 'Internal Server Error',
                count: '1,245',
                trend: 'up',
              },
              {
                code: '429',
                description: 'Too Many Requests',
                count: '892',
                trend: 'stable',
              },
              {
                code: '503',
                description: 'Service Unavailable',
                count: '234',
                trend: 'down',
              },
              {
                code: '408',
                description: 'Request Timeout',
                count: '156',
                trend: 'up',
              },
              {
                code: '502',
                description: 'Bad Gateway',
                count: '89',
                trend: 'down',
              },
            ]}
            columns={[
              { field: 'code', name: 'Status code' },
              { field: 'description', name: 'Description' },
              { field: 'count', name: 'Count (24h)' },
              {
                field: 'trend',
                name: 'Trend',
                render: (trend) => (
                  <OuiIcon
                    type={
                      trend === 'up'
                        ? 'sortUp'
                        : trend === 'down'
                        ? 'sortDown'
                        : 'minus'
                    }
                    color={
                      trend === 'up'
                        ? 'danger'
                        : trend === 'down'
                        ? 'success'
                        : 'subdued'
                    }
                  />
                ),
              },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Downstream dependencies</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                service: 'PostgreSQL',
                latency: '12ms',
                availability: '99.99%',
                status: 'healthy',
              },
              {
                service: 'Redis cache',
                latency: '2ms',
                availability: '99.98%',
                status: 'healthy',
              },
              {
                service: 'Payment gateway',
                latency: '340ms',
                availability: '99.2%',
                status: 'warning',
              },
              {
                service: 'Email service',
                latency: '890ms',
                availability: '98.5%',
                status: 'danger',
              },
              {
                service: 'CDN',
                latency: '8ms',
                availability: '99.99%',
                status: 'healthy',
              },
            ]}
            columns={[
              { field: 'service', name: 'Service' },
              { field: 'latency', name: 'Latency' },
              { field: 'availability', name: 'Availability' },
              {
                field: 'status',
                name: 'Status',
                render: (status) => (
                  <OuiHealth
                    color={
                      status === 'healthy'
                        ? 'success'
                        : status === 'warning'
                        ? 'warning'
                        : 'danger'
                    }>
                    {status}
                  </OuiHealth>
                ),
              },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>
  </div>
);

// ============================================================
// MAIN DASHBOARDS PAGE
// ============================================================

const DASHBOARD_TITLES = {
  'system-overview': 'System overview',
  'web-traffic': 'Web traffic analytics',
  'api-performance': 'API performance',
  'payment-pool-dashboard': 'Payment service — connection pool',
};

export const DashboardsPage = ({
  selectedItem,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => {
  const currentTitle =
    (selectedItem && DASHBOARD_TITLES[selectedItem]) || 'Dashboards';

  const renderDashboard = () => {
    switch (selectedItem) {
      case 'system-overview':
        return <SystemOverviewDashboard />;
      case 'web-traffic':
        return <WebTrafficDashboard />;
      case 'api-performance':
        return <ApiPerformanceDashboard />;
      case 'payment-pool-dashboard':
        return <DashboardPageMock />;
      default:
        return <SystemOverviewDashboard />;
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader
        title={currentTitle}
        onContinueAsThread={onContinueAsThread}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
        isAskAiPanelOpen={isAskAiPanelOpen}
        onAskAiToggle={onAskAiToggle}
        extraActions={[{ iconType: 'refresh', label: 'Refresh' }]}
        headerControls={
          <OuiButtonEmpty size="s" iconType="calendar" iconSide="left">
            Last 24 hours
          </OuiButtonEmpty>
        }
      />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}>
        {renderDashboard()}
      </div>
    </div>
  );
};
