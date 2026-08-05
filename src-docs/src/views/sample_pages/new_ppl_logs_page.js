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

import React, { useState, useRef, useCallback, useEffect } from 'react';

import {
  OuiBasicTable,
  OuiButtonEmpty,
  OuiButtonIcon,
  OuiFieldSearch,
  OuiIcon,
  OuiLink,
  OuiPanel,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToken,
  OuiDatePickerUnified,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

// ─── Source & Language definitions ───────────────────────────────────────────

const SOURCE_TYPES = [
  { id: 'opensearch', label: 'OpenSearch indexes' },
  { id: 'cloudwatch', label: 'CloudWatch logs' },
  { id: 's3', label: 'S3 / Glue tables' },
];

const LANGUAGE_OPTIONS = [
  { id: 'ppl', label: 'PPL' },
  { id: 'sql', label: 'SQL' },
  { id: 'dql', label: 'DQL' },
];

// ─── Mock data ──────────────────────────────────────────────────────────────

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

const MOCK_RESULTS = [
  {
    id: '1',
    FlightNum: '2H60FMN',
    Origin: 'Chubu Centrair International Airport',
    Dest: "Xi'an Xianyang International Airport",
    FlightDelayMin: 105,
  },
  {
    id: '2',
    FlightNum: 'OE1F975',
    Origin: 'Melbourne International Airport',
    Dest: 'Sheremetyevo International Airport',
    FlightDelayMin: 150,
  },
  {
    id: '3',
    FlightNum: '1FPP0G6',
    Origin: 'Leonardo da Vinci - Fiumicino Airport',
    Dest: 'Memphis International Airport',
    FlightDelayMin: 285,
  },
  {
    id: '4',
    FlightNum: 'O433ACB',
    Origin: 'Adolfo Suarez Madrid-Barajas Airport',
    Dest: 'OR Tambo International Airport',
    FlightDelayMin: 15,
  },
  {
    id: '5',
    FlightNum: 'FN09ASF',
    Origin: 'Denver International Airport',
    Dest: 'Warsaw Chopin Airport',
    FlightDelayMin: 105,
  },
  {
    id: '6',
    FlightNum: 'A7048AT',
    Origin: 'Catania-Fontanarossa Airport',
    Dest: 'Milano Linate Airport',
    FlightDelayMin: 125,
  },
  {
    id: '7',
    FlightNum: '9OGHNE',
    Origin: 'Venice Marco Polo Airport',
    Dest: "Xi'an Xianyang International Airport",
    FlightDelayMin: 145,
  },
  {
    id: '8',
    FlightNum: 'W5S2AT5',
    Origin: 'Rochester International Airport',
    Dest: 'Shanghai Hongqiao International Airport',
    FlightDelayMin: 155,
  },
];

// ─── AI Generation explanations ─────────────────────────────────────────────

const GENERATION_EXPLANATIONS = [
  {
    type: 'grounded',
    field: 'where response >= 500',
    reasoning: '"5xx" → the numeric status field in this index.',
  },
  {
    type: 'assumed',
    field: 'by Dest',
    reasoning:
      'Two candidates: Dest (98% populated) vs Origin (94%). Change field',
  },
  {
    type: 'grounded',
    field: 'span(timestamp, 1h)',
    reasoning: '"hourly" → the dataset\'s designated time field.',
  },
];

// ─── Fields Panel ───────────────────────────────────────────────────────────

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
          <OuiText size="xs">
            <strong>Selected</strong>
          </OuiText>
        </button>
        <button
          type="button"
          className="discoverPage__fieldAccordion"
          onClick={() => setQueryOpen(!queryOpen)}>
          <OuiIcon type={queryOpen ? 'arrowDown' : 'arrowRight'} size="s" />
          <OuiText size="xs">
            <strong>Query</strong>
          </OuiText>
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
          <OuiIcon
            type={discoveredOpen ? 'arrowDown' : 'arrowRight'}
            size="s"
          />
          <OuiText size="xs">
            <strong>Discovered</strong>
          </OuiText>
        </button>
      </div>
    </OuiPanel>
  );
};

// ─── Source Picker Dropdown ─────────────────────────────────────────────────

const SourcePicker = ({
  sourceType,
  onSourceTypeChange,
  dataSource,
  language,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="newPplLogs__sourcePicker">
      <button
        type="button"
        className="newPplLogs__sourceButton"
        onClick={() => setIsOpen(!isOpen)}>
        <OuiIcon type="database" size="s" />
        <span className="newPplLogs__sourceLabel">
          <span className="newPplLogs__sourceType">OpenSearch</span>
          <span className="newPplLogs__sourceName">{dataSource}</span>
          <span className="newPplLogs__sourceLang">{language.toUpperCase()}</span>
        </span>
        <OuiIcon type="arrowDown" size="s" />
      </button>

      {isOpen && (
        <div className="newPplLogs__sourceDropdown">
          <div className="newPplLogs__sourceDropdownSection">
            {SOURCE_TYPES.map((src) => (
              <button
                key={src.id}
                type="button"
                className={`newPplLogs__sourceDropdownItem ${
                  sourceType === src.id
                    ? 'newPplLogs__sourceDropdownItem--active'
                    : ''
                }`}
                onClick={() => {
                  onSourceTypeChange(src.id);
                }}>
                {src.label}
              </button>
            ))}
          </div>
          <div className="newPplLogs__sourceDropdownDivider" />
          <div className="newPplLogs__sourceDropdownSection">
            <div className="newPplLogs__sourceDropdownLabel">Language</div>
            <div className="newPplLogs__languageChips">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className={`newPplLogs__languageChip ${
                    language === lang.id
                      ? 'newPplLogs__languageChip--active'
                      : ''
                  }`}
                  onClick={() => onLanguageChange(lang.id)}>
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="newPplLogs__sourceDropdownHint">
              set by the source
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Query Bar ──────────────────────────────────────────────────────────────

const QueryBar = ({
  queryMode,
  onModeChange,
  queryText,
  onQueryChange,
  onGenerate,
  generatedQuery,
  isGenerating,
  aiPrompt,
  onAiPromptChange,
}) => {
  const textareaRef = useRef(null);

  return (
    <div className="newPplLogs__queryBar">
      {/* Mode toggle + actions row */}
      <div className="newPplLogs__queryBarHeader">
        <div className="newPplLogs__modeToggle">
          <button
            type="button"
            className={`newPplLogs__modeBtn ${
              queryMode === 'code' ? 'newPplLogs__modeBtn--active' : ''
            }`}
            onClick={() => onModeChange('code')}>
            Code
          </button>
          <button
            type="button"
            className={`newPplLogs__modeBtn ${
              queryMode === 'builder' ? 'newPplLogs__modeBtn--active' : ''
            }`}
            onClick={() => onModeChange('builder')}>
            Builder
          </button>
        </div>

        <div className="newPplLogs__queryActions">
          <button
            type="button"
            className="newPplLogs__generateBtn"
            onClick={onGenerate}>
            <OuiIcon type="sparkles" size="s" />
            Generate
          </button>
          <span className="newPplLogs__queryDivider">/</span>
          <OuiButtonEmpty size="xs" iconType="save" iconSide="left">
            Saved queries
          </OuiButtonEmpty>
          <OuiButtonEmpty size="xs" iconType="clock" iconSide="left">
            Recent
          </OuiButtonEmpty>
          <OuiButtonEmpty size="xs" iconType="inspect" iconSide="left">
            Analyze
          </OuiButtonEmpty>
        </div>
      </div>

      {/* AI prompt input (when generating) */}
      {isGenerating && (
        <div className="newPplLogs__aiPromptWrap">
          <input
            type="text"
            className="newPplLogs__aiPromptInput"
            placeholder="Describe what you want to query..."
            value={aiPrompt}
            onChange={(e) => onAiPromptChange(e.target.value)}
          />
          <span className="newPplLogs__aiPromptEsc">esc</span>
          <button type="button" className="newPplLogs__aiPromptSubmit">
            Generate
          </button>
        </div>
      )}

      {/* Generated query explanation */}
      {generatedQuery && !isGenerating && (
        <div className="newPplLogs__generatedBanner">
          <span className="newPplLogs__generatedLabel">
            ✦ generated from &ldquo;{aiPrompt || 'query'}&rdquo;
          </span>
          <OuiButtonIcon
            iconType="pencil"
            aria-label="Edit prompt"
            size="xs"
            color="text"
          />
          <OuiButtonIcon
            iconType="cross"
            aria-label="Dismiss"
            size="xs"
            color="text"
          />
        </div>
      )}

      {/* Explanation cards */}
      {generatedQuery && !isGenerating && (
        <div className="newPplLogs__explanations">
          {GENERATION_EXPLANATIONS.map((exp, idx) => (
            <div
              key={idx}
              className={`newPplLogs__explanation newPplLogs__explanation--${exp.type}`}>
              <span className="newPplLogs__explanationType">{exp.type}</span>
              <span className="newPplLogs__explanationField">{exp.field}</span>
              <span className="newPplLogs__explanationReasoning">
                {exp.reasoning}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code mode: textarea */}
      {queryMode === 'code' && (
        <div className="newPplLogs__codeEditor">
          <textarea
            ref={textareaRef}
            className="newPplLogs__codeTextarea"
            value={queryText}
            onChange={(e) => onQueryChange(e.target.value)}
            rows={2}
            placeholder="source = opensearch_sample_data"
          />
        </div>
      )}

      {/* Builder mode: filter chips */}
      {queryMode === 'builder' && (
        <div className="newPplLogs__builderStrip">
          <button type="button" className="newPplLogs__builderChip">
            ＋ Where
          </button>
          <button type="button" className="newPplLogs__builderChip">
            ＋ Aggregation
          </button>
          <button type="button" className="newPplLogs__builderChip">
            ＋ by
          </button>
          <button type="button" className="newPplLogs__builderChip">
            ＋ Sort by
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Table Columns ──────────────────────────────────────────────────────────

const SourceCell = ({ item }) => (
  <OuiText size="xs" className="discoverPage__mono">
    <span className="discoverPage__sourceKey">FlightNum:</span>{' '}
    <OuiLink href="#" onClick={(e) => e.preventDefault()}>
      {item.FlightNum}
    </OuiLink>
    {'  '}
    <span className="discoverPage__sourceKey">Origin:</span> {item.Origin}
    {'  '}
    <span className="discoverPage__sourceKey">Dest:</span> {item.Dest}
    {'  '}
    <span className="discoverPage__sourceKey">FlightDelayMin:</span>{' '}
    <OuiLink href="#" onClick={(e) => e.preventDefault()}>
      {item.FlightDelayMin}
    </OuiLink>
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
  {
    field: 'FlightNum',
    name: '_source',
    render: (val, item) => <SourceCell item={item} />,
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const NewPplLogsPage = ({
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
  hideAskAi,
}) => {
  // Source & language state
  const [sourceType, setSourceType] = useState('opensearch');
  const [dataSource, setDataSource] = useState('opensearch_sample_data');
  const [language, setLanguage] = useState('ppl');

  // Query state
  const [queryMode, setQueryMode] = useState('code');
  const [queryText, setQueryText] = useState('source = opensearch_sample_data');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Date range
  const [dateStart, setDateStart] = useState('now-30m');
  const [dateEnd, setDateEnd] = useState('now');

  // Results
  const [activeTab, setActiveTab] = useState('logs');
  const [expandedRows, setExpandedRows] = useState({});
  const [isFieldsPanelCollapsed, setIsFieldsPanelCollapsed] = useState(false);
  const [fieldsPanelWidth, setFieldsPanelWidth] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  const results = MOCK_RESULTS;

  const onTimeChange = ({ start, end }) => {
    setDateStart(start);
    setDateEnd(end);
  };

  const handleGenerate = () => {
    if (isGenerating) {
      // Submit the prompt
      setIsGenerating(false);
      setGeneratedQuery(true);
      setQueryText(
        'source = opensearch_sample_data | where response >= 500 | stats count() by Dest | sort -count()'
      );
    } else {
      setIsGenerating(true);
    }
  };

  const toggleRowExpansion = (item) => {
    setExpandedRows((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = (
          <div className="discoverPage__expandedRow">
            <table className="discoverPage__detailTable">
              <tbody>
                <tr>
                  <td className="discoverPage__detailToken">
                    <OuiToken iconType="tokenString" size="s" />
                  </td>
                  <td className="discoverPage__detailName">
                    <OuiText size="xs">FlightNum</OuiText>
                  </td>
                  <td className="discoverPage__detailValue">
                    <OuiText size="xs">{item.FlightNum}</OuiText>
                  </td>
                </tr>
                <tr>
                  <td className="discoverPage__detailToken">
                    <OuiToken iconType="tokenString" size="s" />
                  </td>
                  <td className="discoverPage__detailName">
                    <OuiText size="xs">Origin</OuiText>
                  </td>
                  <td className="discoverPage__detailValue">
                    <OuiText size="xs">{item.Origin}</OuiText>
                  </td>
                </tr>
                <tr>
                  <td className="discoverPage__detailToken">
                    <OuiToken iconType="tokenString" size="s" />
                  </td>
                  <td className="discoverPage__detailName">
                    <OuiText size="xs">Dest</OuiText>
                  </td>
                  <td className="discoverPage__detailValue">
                    <OuiText size="xs">{item.Dest}</OuiText>
                  </td>
                </tr>
                <tr>
                  <td className="discoverPage__detailToken">
                    <OuiToken iconType="tokenNumber" size="s" />
                  </td>
                  <td className="discoverPage__detailName">
                    <OuiText size="xs">FlightDelayMin</OuiText>
                  </td>
                  <td className="discoverPage__detailValue">
                    <OuiText size="xs">{item.FlightDelayMin}</OuiText>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      return next;
    });
  };

  // Resize handle logic
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
      {/* Page header */}
      <DetailPageHeader
        title="New log"
        onContinueAsThread={onContinueAsThread}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
        isAskAiPanelOpen={isAskAiPanelOpen}
        onAskAiToggle={onAskAiToggle}
        hideAskAi={hideAskAi}
        firstActionIcon="save"
        firstActionLabel="Save"
        onFirstAction={() => {}}
        headerControls={
          <>
            <SourcePicker
              sourceType={sourceType}
              onSourceTypeChange={setSourceType}
              dataSource={dataSource}
              language={language}
              onLanguageChange={setLanguage}
            />
            <div style={{ width: 280 }}>
              <OuiDatePickerUnified
                start={dateStart}
                end={dateEnd}
                onTimeChange={onTimeChange}
                compressed
              />
            </div>
          </>
        }
      />

      {/* Query bar */}
      <QueryBar
        queryMode={queryMode}
        onModeChange={setQueryMode}
        queryText={queryText}
        onQueryChange={setQueryText}
        onGenerate={handleGenerate}
        generatedQuery={generatedQuery}
        isGenerating={isGenerating}
        aiPrompt={aiPrompt}
        onAiPromptChange={setAiPrompt}
      />

      {/* Tab bar */}
      <div className="discoverPage__tabBar">
        <div className="discoverPage__tabBarLeft">
          <OuiButtonIcon
            iconType={isFieldsPanelCollapsed ? 'menuRight' : 'menuLeft'}
            aria-label={
              isFieldsPanelCollapsed
                ? 'Expand fields panel'
                : 'Collapse fields panel'
            }
            onClick={() => setIsFieldsPanelCollapsed(!isFieldsPanelCollapsed)}
            size="s"
            color="text"
            className="discoverPage__fieldsPanelToggle"
          />
          <OuiTabs size="s" display="condensed">
            <OuiTab
              isSelected={activeTab === 'logs'}
              onClick={() => setActiveTab('logs')}>
              Logs
            </OuiTab>
            <OuiTab
              isSelected={activeTab === 'visualization'}
              onClick={() => setActiveTab('visualization')}>
              Visualization
            </OuiTab>
          </OuiTabs>
          <OuiText size="s" className="discoverPage__hitsInfo">
            <strong>0 hits</strong>
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

      {/* Body: fields + results */}
      <div className="discoverPage__body" ref={bodyRef}>
        {!isFieldsPanelCollapsed && (
          <>
            <div style={{ width: fieldsPanelWidth, flexShrink: 0 }}>
              <FieldsPanel />
            </div>
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
          </>
        )}
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
    </div>
  );
};
