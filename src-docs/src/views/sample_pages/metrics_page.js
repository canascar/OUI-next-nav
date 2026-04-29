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

import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  OuiBasicTable,
  OuiButton,
  OuiButtonEmpty,
  OuiButtonIcon,
  OuiCheckbox,
  OuiCompressedFieldText,
  OuiCompressedSelect,
  OuiCompressedTextArea,
  OuiFieldSearch,
  OuiFormRow,
  OuiHorizontalRule,
  OuiIcon,
  OuiLink,
  OuiModal,
  OuiModalBody,
  OuiModalFooter,
  OuiModalHeader,
  OuiModalHeaderTitle,
  OuiPanel,
  OuiSuperDatePicker,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToken,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

// --- Query definitions keyed by selectedItem ---

const QUERY_DEFS = {
  throughput: {
    title: 'Throughput over time',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | stats avg(throughput) as avg_throughput by span(timestamp, 5m)',
  },
  'cpu-utilization': {
    title: 'CPU utilization',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | stats avg(cpu_percent) as avg_cpu by host | sort -avg_cpu',
  },
  'memory-pressure': {
    title: 'Memory pressure',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | stats max(mem_used_percent) as max_mem by host | sort -max_mem',
  },
};

const DEFAULT_QUERY_DEF = QUERY_DEFS['throughput'];

// --- Mock result data (flight log documents) ---

const FLIGHT_DATA = [
  { id: '1', FlightNum: '2H60FMN', Origin: 'Chubu Centrair International Airport', Dest: "Xi'an Xianyang International Airport", FlightDelayMin: 105 },
  { id: '2', FlightNum: 'OE1F975', Origin: 'Melbourne International Airport', Dest: 'Sheremetyevo International Airport', FlightDelayMin: 150 },
  { id: '3', FlightNum: '1FPP0G6', Origin: 'Leonardo da Vinci - Fiumicino Airport', Dest: 'Memphis International Airport', FlightDelayMin: 285 },
  { id: '4', FlightNum: 'O433ACB', Origin: 'Adolfo Suarez Madrid-Barajas Airport', Dest: 'OR Tambo International Airport', FlightDelayMin: 15 },
  { id: '5', FlightNum: 'FN09ASF', Origin: 'Denver International Airport', Dest: 'Warsaw Chopin Airport', FlightDelayMin: 105 },
  { id: '6', FlightNum: 'A7048AT', Origin: 'Catania-Fontanarossa Airport', Dest: 'Milano Linate Airport', FlightDelayMin: 125 },
  { id: '7', FlightNum: '9OGHNE', Origin: 'Venice Marco Polo Airport', Dest: "Xi'an Xianyang International Airport", FlightDelayMin: 145 },
  { id: '8', FlightNum: 'W5S2AT5', Origin: 'Rochester International Airport', Dest: 'Shanghai Hongqiao International Airport', FlightDelayMin: 155 },
  { id: '9', FlightNum: 'GLRDTMA', Origin: 'Chubu Centrair International Airport', Dest: 'Lester B. Pearson International Airport', FlightDelayMin: 135 },
  { id: '10', FlightNum: 'YYM0920', Origin: 'Abu Dhabi International Airport', Dest: 'Bari Karol Wojty_a Airport', FlightDelayMin: 90 },
  { id: '11', FlightNum: 'ZOUK4GU', Origin: 'Sheremetyevo International Airport', Dest: 'Turin Airport', FlightDelayMin: 285 },
  { id: '12', FlightNum: 'H030T30', Origin: 'Helsinki International Airport', Dest: 'Il Caravaggio International Airport', FlightDelayMin: 75 },
  { id: '13', FlightNum: 'DBROENB', Origin: 'London Gatwick Airport', Dest: 'Wichita Mid Continent Airport', FlightDelayMin: 60 },
  { id: '14', FlightNum: '4F3U08A', Origin: 'London Gatwick Airport', Dest: 'Rajiv Gandhi International Airport', FlightDelayMin: 165 },
  { id: '15', FlightNum: '0VTGH80', Origin: 'Rajiv Gandhi International Airport', Dest: 'Savannah Hilton Head International Airport', FlightDelayMin: 255 },
  { id: '16', FlightNum: 'HOMCZSP', Origin: 'El Dorado International Airport', Dest: 'Zurich Airport', FlightDelayMin: 345 },
  { id: '17', FlightNum: 'KY3SM80', Origin: 'Chicago Midway International Airport', Dest: 'Ministro Pistarini International Airport', FlightDelayMin: 165 },
  { id: '18', FlightNum: '6KT3Y7H', Origin: 'Huntsville International Carl T Jones Field', Dest: 'Munich Airport', FlightDelayMin: 45 },
  { id: '19', FlightNum: 'GAUTSOV', Origin: 'Shanghai Pudong International Airport', Dest: "Treviso-Sant'Angelo Airport", FlightDelayMin: 105 },
  { id: '20', FlightNum: 'TQA0Y30', Origin: 'Genoa Cristoforo Colombo Airport', Dest: 'Mariscal Sucre International Airport', FlightDelayMin: 240 },
  { id: '21', FlightNum: 'F3WBTEP', Origin: 'Genoa Cristoforo Colombo Airport', Dest: 'Kempegowda International Airport', FlightDelayMin: 210 },
  { id: '22', FlightNum: 'ULINNLO', Origin: 'Al Maktoum International Airport', Dest: 'Sheremetyevo International Airport', FlightDelayMin: 315 },
  { id: '23', FlightNum: 'AHQCJLL', Origin: 'Stockholm Arlanda Airport', Dest: 'Verona Villafranca Airport', FlightDelayMin: 240 },
  { id: '24', FlightNum: '413KDT0', Origin: 'Manchester Airport', Dest: 'Venice Marco Polo Airport', FlightDelayMin: 120 },
  { id: '25', FlightNum: 'G64XA34', Origin: 'Warsaw Chopin Airport', Dest: 'Warsaw Chopin Airport', FlightDelayMin: 270 },
];

// --- Fields panel (left sidebar) ---

const FIELD_LIST = [
  { name: '_id', token: 'tokenString' },
  { name: '_index', token: 'tokenString' },
  { name: '_score', token: 'tokenNumber' },
  { name: '_type', token: 'tokenString' },
  { name: 'Dest', token: 'tokenString' },
  { name: 'FlightDelayMin', token: 'tokenNumber' },
  { name: 'FlightNum', token: 'tokenString' },
  { name: 'Origin', token: 'tokenString' },
];

const FieldsPanel = () => {
  const [fieldSearch, setFieldSearch] = useState('');
  const [selectedOpen, setSelectedOpen] = useState(true);
  const [queryOpen, setQueryOpen] = useState(true);
  const [discoveredOpen, setDiscoveredOpen] = useState(false);

  const filtered = FIELD_LIST.filter((f) =>
    f.name.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  return (
    <OuiPanel
      paddingSize="none"
      className="discoverPage__fieldsPanel"
      hasShadow={false}
      hasBorder>
      <div className="discoverPage__fieldsPanelHeader">
        <OuiTitle size="xxs">
          <h2>Fields</h2>
        </OuiTitle>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <OuiFieldSearch
          placeholder="Search field na..."
          value={fieldSearch}
          onChange={(e) => setFieldSearch(e.target.value)}
          compressed
          fullWidth
          aria-label="Search field names"
        />
      </div>
      <div className="discoverPage__fieldsListScroll">
        <button
          type="button"
          className="discoverPage__fieldAccordion"
          onClick={() => setSelectedOpen(!selectedOpen)}>
          <OuiIcon type={selectedOpen ? 'arrowDown' : 'arrowRight'} size="s" />
          <OuiText size="xs"><strong>Selected</strong></OuiText>
        </button>
        <button
          type="button"
          className="discoverPage__fieldAccordion"
          onClick={() => setQueryOpen(!queryOpen)}>
          <OuiIcon type={queryOpen ? 'arrowDown' : 'arrowRight'} size="s" />
          <OuiText size="xs"><strong>Query</strong></OuiText>
        </button>
        {queryOpen && (
          <div style={{ paddingLeft: 16 }}>
            {filtered.map((field) => (
              <div key={field.name} className="discoverPage__fieldItem">
                <OuiToken iconType={field.token} size="s" />
                <OuiText size="xs">{field.name}</OuiText>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="discoverPage__fieldAccordion"
          onClick={() => setDiscoveredOpen(!discoveredOpen)}>
          <OuiIcon type={discoveredOpen ? 'arrowDown' : 'arrowRight'} size="s" />
          <OuiText size="xs"><strong>Discovered</strong></OuiText>
        </button>
      </div>
    </OuiPanel>
  );
};

// --- Expanded row detail view ---

const DETAIL_FIELDS = [
  { token: 'tokenString', name: 'Dest', key: 'Dest' },
  { token: 'tokenNumber', name: 'FlightDelayMin', key: 'FlightDelayMin' },
  { token: 'tokenString', name: 'FlightNum', key: 'FlightNum' },
  { token: 'tokenString', name: 'Origin', key: 'Origin' },
  { token: 'tokenString', name: '_id', key: '_id', value: '–' },
  { token: 'tokenString', name: '_index', key: '_index' },
  { token: 'tokenNumber', name: '_score', key: '_score', value: '–' },
  { token: 'tokenString', name: '_type', key: '_type', value: '–' },
];

const ExpandedRow = ({ item }) => {
  const [detailTab, setDetailTab] = useState('table');

  return (
    <div className="discoverPage__expandedRow">
      <div className="discoverPage__expandedHeader">
        <OuiIcon type="document" size="m" />
        <OuiText size="s"><strong>Expanded document</strong></OuiText>
      </div>
      <OuiTabs size="s" display="condensed">
        <OuiTab isSelected={detailTab === 'table'} onClick={() => setDetailTab('table')}>Table</OuiTab>
        <OuiTab isSelected={detailTab === 'json'} onClick={() => setDetailTab('json')}>JSON</OuiTab>
      </OuiTabs>
      {detailTab === 'table' ? (
        <table className="discoverPage__detailTable">
          <tbody>
            {DETAIL_FIELDS.map((field) => (
              <tr key={field.name}>
                <td className="discoverPage__detailToken"><OuiToken iconType={field.token} size="s" /></td>
                <td className="discoverPage__detailName"><OuiText size="xs">{field.name}</OuiText></td>
                <td className="discoverPage__detailValue">
                  <OuiText size="xs">
                    {field.value || (field.key === '_index'
                      ? 'gGt-Sn_7d03f9f5-b9c4-38d3-b888-751575bb49df_d3d7af60-4c81-11e8-b3d7-01146121b73d'
                      : String(item[field.key] || '–'))}
                  </OuiText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <pre className="discoverPage__detailJson">{JSON.stringify(item, null, 2)}</pre>
      )}
    </div>
  );
};

// --- Table columns ---

const SourceCell = ({ item }) => (
  <OuiText size="xs" className="discoverPage__mono">
    <span className="discoverPage__sourceKey">FlightNum:</span>{' '}
    <OuiLink href="#" onClick={(e) => e.preventDefault()}>{item.FlightNum}</OuiLink>
    {'  '}
    <span className="discoverPage__sourceKey">Origin:</span> {item.Origin}
    {'  '}
    <span className="discoverPage__sourceKey">Dest:</span> {item.Dest}
    {'  '}
    <span className="discoverPage__sourceKey">FlightDelayMin:</span>{' '}
    <OuiLink href="#" onClick={(e) => e.preventDefault()}>{item.FlightDelayMin}</OuiLink>
  </OuiText>
);

const getColumns = (expandedRows, toggleRowExpansion) => [
  {
    width: '40px',
    isExpander: true,
    render: (item) => (
      <OuiButtonIcon
        onClick={() => toggleRowExpansion(item)}
        aria-label={expandedRows[item.id] ? 'Collapse' : 'Expand'}
        iconType={expandedRows[item.id] ? 'arrowDown' : 'arrowRight'}
        size="s"
        color="text"
      />
    ),
  },
  { field: 'id', name: 'Time', width: '50px', render: () => <span>–</span> },
  { field: 'FlightNum', name: '_source', render: (val, item) => <SourceCell item={item} /> },
];

// --- Main MetricsPage Component ---

export const MetricsPage = ({
  selectedItem,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
}) => {
  const queryDef = selectedItem && QUERY_DEFS[selectedItem];
  const results = queryDef ? FLIGHT_DATA : [];

  const [activeTab, setActiveTab] = useState('metrics');
  const [queryText, setQueryText] = useState(queryDef ? queryDef.query : '');
  const [isQueryEditable, setIsQueryEditable] = useState(!queryDef);
  const queryRef = useRef(null);

  // Auto-focus textarea when landing on empty page
  useEffect(() => {
    if (!queryDef && queryRef.current) {
      setTimeout(() => queryRef.current.focus(), 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [expandedRows, setExpandedRows] = useState({});
  const [dataSource, setDataSource] = useState('opensearch_sample_data');
  const [dateStart, setDateStart] = useState('now-30m');
  const [dateEnd, setDateEnd] = useState('now');
  const [isDateLoading, setIsDateLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [includeFilters, setIncludeFilters] = useState(false);
  const [includeTimeFilters, setIncludeTimeFilters] = useState(false);
  const [saveSearchResults, setSaveSearchResults] = useState(false);

  const onTimeChange = ({ start, end }) => {
    setDateStart(start);
    setDateEnd(end);
    setIsDateLoading(true);
    setTimeout(() => setIsDateLoading(false), 1000);
  };

  const dataSourceOptions = [
    { value: 'opensearch_sample_data', text: 'opensearch_sample_data' },
    { value: 'opensearch_sample_logs', text: 'opensearch_sample_logs' },
    { value: 'opensearch_sample_flights', text: 'opensearch_sample_flights' },
  ];

  const toggleRowExpansion = (item) => {
    setExpandedRows((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = <ExpandedRow item={item} />;
      }
      return next;
    });
  };
  const [fieldsPanelWidth, setFieldsPanelWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    setQueryText(queryDef ? queryDef.query : '');
    setIsQueryEditable(!queryDef);
    if (!queryDef && queryRef.current) {
      setTimeout(() => queryRef.current.focus(), 0);
    }
  }, [queryDef]);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleResizeMove = (e) => {
      if (!dragging.current || !bodyRef.current) return;
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const newWidth = e.clientX - bodyRect.left;
      setFieldsPanelWidth(Math.max(140, Math.min(newWidth, 500)));
    };
    const handleResizeEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader
        title={queryDef ? queryDef.title : 'New metric'}
        onContinueAsThread={onContinueAsThread}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
        firstActionIcon={isQueryEditable ? 'save' : 'pencil'}
        firstActionLabel={isQueryEditable ? 'Save' : 'Edit'}
        onFirstAction={() => {
          if (isQueryEditable) {
            setIsSaveModalOpen(true);
          } else {
            setIsQueryEditable(true);
            if (queryRef.current) {
              setTimeout(() => queryRef.current.focus(), 0);
            }
          }
        }}
        extraActions={[
          { iconType: 'importAction', label: 'Import' },
        ]}
        headerControls={
          <>
            <OuiCompressedSelect
              options={dataSourceOptions}
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              aria-label="Data source"
              style={{ width: 280 }}
            />
            <div style={{ width: 280 }}>
              <OuiSuperDatePicker
                start={dateStart}
                end={dateEnd}
                onTimeChange={onTimeChange}
                isLoading={isDateLoading}
                compressed
                showUpdateButton={false}
              />
            </div>
          </>
        }
      />

      <div className="discoverPage__queryArea">
        <OuiCompressedTextArea
          placeholder="Search with PPL"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          rows={2}
          resize="none"
          fullWidth
          disabled={false}
          readOnly={!isQueryEditable}
          className="discoverPage__queryTextarea"
          inputRef={queryRef}
        />
      </div>

      <div className="discoverPage__tabBar">
        <div className="discoverPage__tabBarLeft">
          <OuiTabs size="s" display="condensed">
            <OuiTab
              isSelected={activeTab === 'metrics'}
              onClick={() => setActiveTab('metrics')}>
              Metrics
            </OuiTab>
            <OuiTab
              isSelected={activeTab === 'visualization'}
              onClick={() => setActiveTab('visualization')}>
              Visualization
            </OuiTab>
          </OuiTabs>
          <OuiText size="s" className="discoverPage__hitsInfo">
            <strong>{results.length.toLocaleString()} hits</strong>
            <span className="discoverPage__hitsDot">&middot;</span>
            <strong>323 ms</strong>
          </OuiText>
        </div>
        <div className="discoverPage__tabActions">
          <OuiButtonEmpty size="s" iconType="exportAction" iconSide="left">
            Export
          </OuiButtonEmpty>
          <OuiButtonEmpty size="s" iconType="dashboardApp" iconSide="left">
            Add to dashboard
          </OuiButtonEmpty>
        </div>
      </div>

      <div className="discoverPage__body" ref={bodyRef}>
        <div style={{ width: fieldsPanelWidth, flexShrink: 0 }}>
          <FieldsPanel />
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className={`discoverPage__resizeHandle${
            isDragging ? ' discoverPage__resizeHandle--active' : ''
          }`}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize fields panel"
          tabIndex={0}
        />
        <div className="discoverPage__contentCol">
          <div style={{ padding: '0', overflow: 'auto', flex: 1 }}>
            <OuiPanel paddingSize="none" hasShadow={false} hasBorder>
              <OuiBasicTable
                items={results}
                itemId="id"
                columns={getColumns(expandedRows, toggleRowExpansion)}
                rowHeader="FlightNum"
                tableLayout="auto"
                compressed
                isExpandable
                itemIdToExpandedRowMap={expandedRows}
              />
            </OuiPanel>
          </div>
        </div>
      </div>

      {isSaveModalOpen && (
        <OuiModal onClose={() => setIsSaveModalOpen(false)}>
          <OuiModalHeader>
            <OuiModalHeaderTitle>
              <h1>Save metric</h1>
            </OuiModalHeaderTitle>
          </OuiModalHeader>
          <OuiModalBody>
            <OuiFormRow label="Name">
              <OuiCompressedFieldText
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </OuiFormRow>
            <OuiFormRow label="Description">
              <OuiCompressedFieldText
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
              />
            </OuiFormRow>
            <OuiHorizontalRule margin="m" />
            <OuiCheckbox
              id="save-include-filters"
              label="Include filters"
              checked={includeFilters}
              onChange={() => setIncludeFilters(!includeFilters)}
            />
            <OuiCheckbox
              id="save-include-time-filters"
              label="Include time filters"
              checked={includeTimeFilters}
              onChange={() => setIncludeTimeFilters(!includeTimeFilters)}
            />
            <OuiHorizontalRule margin="m" />
            <OuiCheckbox
              id="save-search-results"
              label="Save search results"
              checked={saveSearchResults}
              onChange={() => setSaveSearchResults(!saveSearchResults)}
            />
          </OuiModalBody>
          <OuiModalFooter>
            <OuiButtonEmpty onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </OuiButtonEmpty>
            <OuiButton
              fill
              onClick={() => {
                setIsSaveModalOpen(false);
                setIsQueryEditable(false);
              }}>
              Save
            </OuiButton>
          </OuiModalFooter>
        </OuiModal>
      )}
    </div>
  );
};
