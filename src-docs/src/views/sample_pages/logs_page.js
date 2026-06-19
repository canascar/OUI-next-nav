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
  OuiDatePickerUnified,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToken,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

// --- Query definitions keyed by selectedItem ---

const QUERY_DEFS = {
  'error-rate': {
    title: 'Error rate by service',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | where level="ERROR" | stats count() as errors by service | sort -errors',
  },
  'auth-failures': {
    title: 'Auth failure events',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | where event="auth_fail" | stats count() as failures by user, source_ip',
  },
  'slow-queries': {
    title: 'Slow query log',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | where duration > 5000 | sort -duration | head 100',
  },
  'query-latency-by-host': {
    title: 'Latency by host',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | stats avg(latency) as avg_latency by host | sort -avg_latency',
    queryOnly: true,
  },
  'query-5xx-responses': {
    title: '5xx responses',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | where status >= 500 | stats count() as errors by path | sort -errors',
    queryOnly: true,
  },
  'query-top-users': {
    title: 'Top users by request count',
    language: 'PPL',
    query:
      'source=opensearch_dashboards_sample_data_logs | stats count() as requests by user | sort -requests | head 50',
    queryOnly: true,
  },
  'payment-timeout-logs': {
    title: 'Payment service timeout logs',
    language: 'PPL',
    query:
      'source=opensearch_metrics_payment_service | where level="WARN" OR message LIKE "%timeout%" | sort -timestamp | head 25',
  },
  'connection-timeout-errors': {
    title: 'Connection timeout errors',
    language: 'PPL',
    query:
      'source = logs | where severity = "ERROR" | stats count() by message',
  },
};

const DEFAULT_QUERY_DEF = QUERY_DEFS['error-rate'];

// --- Mock result data per query ---

const QUERY_DATA = {
  'error-rate': [
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
    {
      id: '9',
      FlightNum: 'GLRDTMA',
      Origin: 'Chubu Centrair International Airport',
      Dest: 'Lester B. Pearson International Airport',
      FlightDelayMin: 135,
    },
    {
      id: '10',
      FlightNum: 'YYM0920',
      Origin: 'Abu Dhabi International Airport',
      Dest: 'Bari Karol Wojty_a Airport',
      FlightDelayMin: 90,
    },
    {
      id: '11',
      FlightNum: 'ZOUK4GU',
      Origin: 'Sheremetyevo International Airport',
      Dest: 'Turin Airport',
      FlightDelayMin: 285,
    },
    {
      id: '12',
      FlightNum: 'H030T30',
      Origin: 'Helsinki International Airport',
      Dest: 'Il Caravaggio International Airport',
      FlightDelayMin: 75,
    },
    {
      id: '13',
      FlightNum: 'DBROENB',
      Origin: 'London Gatwick Airport',
      Dest: 'Wichita Mid Continent Airport',
      FlightDelayMin: 60,
    },
    {
      id: '14',
      FlightNum: '4F3U08A',
      Origin: 'London Gatwick Airport',
      Dest: 'Rajiv Gandhi International Airport',
      FlightDelayMin: 165,
    },
    {
      id: '15',
      FlightNum: '0VTGH80',
      Origin: 'Rajiv Gandhi International Airport',
      Dest: 'Savannah Hilton Head International Airport',
      FlightDelayMin: 255,
    },
    {
      id: '16',
      FlightNum: 'HOMCZSP',
      Origin: 'El Dorado International Airport',
      Dest: 'Zurich Airport',
      FlightDelayMin: 345,
    },
    {
      id: '17',
      FlightNum: 'KY3SM80',
      Origin: 'Chicago Midway International Airport',
      Dest: 'Ministro Pistarini International Airport',
      FlightDelayMin: 165,
    },
    {
      id: '18',
      FlightNum: '6KT3Y7H',
      Origin: 'Huntsville International Carl T Jones Field',
      Dest: 'Munich Airport',
      FlightDelayMin: 45,
    },
    {
      id: '19',
      FlightNum: 'GAUTSOV',
      Origin: 'Shanghai Pudong International Airport',
      Dest: "Treviso-Sant'Angelo Airport",
      FlightDelayMin: 105,
    },
    {
      id: '20',
      FlightNum: 'TQA0Y30',
      Origin: 'Genoa Cristoforo Colombo Airport',
      Dest: 'Mariscal Sucre International Airport',
      FlightDelayMin: 240,
    },
    {
      id: '21',
      FlightNum: 'F3WBTEP',
      Origin: 'Genoa Cristoforo Colombo Airport',
      Dest: 'Kempegowda International Airport',
      FlightDelayMin: 210,
    },
    {
      id: '22',
      FlightNum: 'ULINNLO',
      Origin: 'Al Maktoum International Airport',
      Dest: 'Sheremetyevo International Airport',
      FlightDelayMin: 315,
    },
    {
      id: '23',
      FlightNum: 'AHQCJLL',
      Origin: 'Stockholm Arlanda Airport',
      Dest: 'Verona Villafranca Airport',
      FlightDelayMin: 240,
    },
    {
      id: '24',
      FlightNum: '413KDT0',
      Origin: 'Manchester Airport',
      Dest: 'Venice Marco Polo Airport',
      FlightDelayMin: 120,
    },
    {
      id: '25',
      FlightNum: 'G64XA34',
      Origin: 'Warsaw Chopin Airport',
      Dest: 'Warsaw Chopin Airport',
      FlightDelayMin: 270,
    },
  ],
  'auth-failures': [
    {
      id: '1',
      FlightNum: 'BX72KLP',
      Origin: 'Narita International Airport',
      Dest: 'São Paulo–Guarulhos International Airport',
      FlightDelayMin: 190,
    },
    {
      id: '2',
      FlightNum: 'QR41VNE',
      Origin: 'Hamad International Airport',
      Dest: 'Los Angeles International Airport',
      FlightDelayMin: 30,
    },
    {
      id: '3',
      FlightNum: 'JT88MWC',
      Origin: 'Suvarnabhumi Airport',
      Dest: 'Frankfurt Airport',
      FlightDelayMin: 220,
    },
    {
      id: '4',
      FlightNum: 'PL03DFR',
      Origin: 'Incheon International Airport',
      Dest: 'Dubai International Airport',
      FlightDelayMin: 85,
    },
    {
      id: '5',
      FlightNum: 'NK56YHT',
      Origin: 'John F. Kennedy International Airport',
      Dest: 'Heathrow Airport',
      FlightDelayMin: 310,
    },
    {
      id: '6',
      FlightNum: 'WZ19QAB',
      Origin: 'Singapore Changi Airport',
      Dest: 'Sydney Kingsford Smith Airport',
      FlightDelayMin: 55,
    },
    {
      id: '7',
      FlightNum: 'CV84RTE',
      Origin: 'Indira Gandhi International Airport',
      Dest: 'Kuala Lumpur International Airport',
      FlightDelayMin: 175,
    },
    {
      id: '8',
      FlightNum: 'MH37UPO',
      Origin: "O'Hare International Airport",
      Dest: 'Charles de Gaulle Airport',
      FlightDelayMin: 140,
    },
    {
      id: '9',
      FlightNum: 'DF62SLK',
      Origin: 'Hong Kong International Airport',
      Dest: 'Taipei Taoyuan International Airport',
      FlightDelayMin: 25,
    },
    {
      id: '10',
      FlightNum: 'AX95WBN',
      Origin: 'Istanbul Airport',
      Dest: 'Amsterdam Airport Schiphol',
      FlightDelayMin: 200,
    },
    {
      id: '11',
      FlightNum: 'RG28HJD',
      Origin: 'Hartsfield-Jackson Atlanta International Airport',
      Dest: 'Mexico City International Airport',
      FlightDelayMin: 95,
    },
    {
      id: '12',
      FlightNum: 'TK51CZX',
      Origin: 'Beijing Capital International Airport',
      Dest: 'Kansai International Airport',
      FlightDelayMin: 265,
    },
    {
      id: '13',
      FlightNum: 'UE74FGM',
      Origin: 'Zurich Airport',
      Dest: 'Cape Town International Airport',
      FlightDelayMin: 330,
    },
    {
      id: '14',
      FlightNum: 'YP16NVR',
      Origin: 'Toronto Pearson International Airport',
      Dest: 'Jorge Chávez International Airport',
      FlightDelayMin: 110,
    },
    {
      id: '15',
      FlightNum: 'LW43BQS',
      Origin: 'Munich Airport',
      Dest: 'Doha Hamad International Airport',
      FlightDelayMin: 70,
    },
    {
      id: '16',
      FlightNum: 'HN89XTL',
      Origin: 'San Francisco International Airport',
      Dest: 'Haneda Airport',
      FlightDelayMin: 185,
    },
    {
      id: '17',
      FlightNum: 'GK02YMW',
      Origin: 'Barcelona-El Prat Airport',
      Dest: 'Bogotá El Dorado International Airport',
      FlightDelayMin: 250,
    },
    {
      id: '18',
      FlightNum: 'FJ57APE',
      Origin: 'Copenhagen Airport',
      Dest: 'Johannesburg OR Tambo International Airport',
      FlightDelayMin: 40,
    },
    {
      id: '19',
      FlightNum: 'SO31DKR',
      Origin: 'Guangzhou Baiyun International Airport',
      Dest: 'Auckland Airport',
      FlightDelayMin: 295,
    },
    {
      id: '20',
      FlightNum: 'XC68VHJ',
      Origin: 'Vienna International Airport',
      Dest: 'Montréal-Trudeau International Airport',
      FlightDelayMin: 160,
    },
    {
      id: '21',
      FlightNum: 'BI45GNP',
      Origin: 'Dallas/Fort Worth International Airport',
      Dest: 'Rome Fiumicino Airport',
      FlightDelayMin: 215,
    },
    {
      id: '22',
      FlightNum: 'EW90TRC',
      Origin: 'Lisbon Humberto Delgado Airport',
      Dest: 'Chhatrapati Shivaji Maharaj International Airport',
      FlightDelayMin: 130,
    },
  ],
  'slow-queries': [
    {
      id: '1',
      FlightNum: 'ZM14KQW',
      Origin: 'Miami International Airport',
      Dest: 'Cancún International Airport',
      FlightDelayMin: 50,
    },
    {
      id: '2',
      FlightNum: 'RA67XBP',
      Origin: 'Oslo Gardermoen Airport',
      Dest: 'Atatürk International Airport',
      FlightDelayMin: 180,
    },
    {
      id: '3',
      FlightNum: 'VT23NHG',
      Origin: 'Ninoy Aquino International Airport',
      Dest: 'Perth Airport',
      FlightDelayMin: 305,
    },
    {
      id: '4',
      FlightNum: 'OC58DLF',
      Origin: 'Brussels Airport',
      Dest: 'Jomo Kenyatta International Airport',
      FlightDelayMin: 115,
    },
    {
      id: '5',
      FlightNum: 'IB92YSR',
      Origin: 'Chengdu Shuangliu International Airport',
      Dest: 'Helsinki-Vantaa Airport',
      FlightDelayMin: 235,
    },
    {
      id: '6',
      FlightNum: 'KP46AMT',
      Origin: 'Seattle-Tacoma International Airport',
      Dest: 'Dublin Airport',
      FlightDelayMin: 65,
    },
    {
      id: '7',
      FlightNum: 'WN71EJC',
      Origin: 'Soekarno-Hatta International Airport',
      Dest: 'Lisbon Humberto Delgado Airport',
      FlightDelayMin: 340,
    },
    {
      id: '8',
      FlightNum: 'DG05RVU',
      Origin: 'Riga International Airport',
      Dest: 'Tan Son Nhat International Airport',
      FlightDelayMin: 145,
    },
    {
      id: '9',
      FlightNum: 'HL39QKB',
      Origin: 'Arturo Merino Benítez International Airport',
      Dest: 'Václav Havel Airport Prague',
      FlightDelayMin: 80,
    },
    {
      id: '10',
      FlightNum: 'FX83WPN',
      Origin: 'Bengaluru Kempegowda International Airport',
      Dest: 'Montréal-Trudeau International Airport',
      FlightDelayMin: 275,
    },
    {
      id: '11',
      FlightNum: 'SJ17CTG',
      Origin: 'Gimpo International Airport',
      Dest: 'Palma de Mallorca Airport',
      FlightDelayMin: 195,
    },
    {
      id: '12',
      FlightNum: 'NE50HYZ',
      Origin: 'Pulkovo Airport',
      Dest: 'Ngurah Rai International Airport',
      FlightDelayMin: 35,
    },
    {
      id: '13',
      FlightNum: 'UC26LDA',
      Origin: 'George Bush Intercontinental Airport',
      Dest: 'Edinburgh Airport',
      FlightDelayMin: 260,
    },
    {
      id: '14',
      FlightNum: 'BW94FXM',
      Origin: 'Noi Bai International Airport',
      Dest: 'Adolfo Suárez Madrid-Barajas Airport',
      FlightDelayMin: 100,
    },
    {
      id: '15',
      FlightNum: 'AG61SJR',
      Origin: 'Heydar Aliyev International Airport',
      Dest: 'Ministro Pistarini International Airport',
      FlightDelayMin: 355,
    },
    {
      id: '16',
      FlightNum: 'TX08BEV',
      Origin: 'Tallinn Airport',
      Dest: 'Chhatrapati Shivaji Maharaj International Airport',
      FlightDelayMin: 155,
    },
    {
      id: '17',
      FlightNum: 'MR75GKN',
      Origin: 'Cologne Bonn Airport',
      Dest: 'Hamad International Airport',
      FlightDelayMin: 20,
    },
    {
      id: '18',
      FlightNum: 'PQ42WDH',
      Origin: 'Kuala Lumpur International Airport',
      Dest: 'Leonardo da Vinci-Fiumicino Airport',
      FlightDelayMin: 225,
    },
    {
      id: '19',
      FlightNum: 'YL30AXC',
      Origin: 'Sheremetyevo International Airport',
      Dest: 'Tocumen International Airport',
      FlightDelayMin: 170,
    },
    {
      id: '20',
      FlightNum: 'JH59NTQ',
      Origin: 'Haneda Airport',
      Dest: 'Suvarnabhumi Airport',
      FlightDelayMin: 290,
    },
  ],
  'payment-timeout-logs': [
    {
      id: '1',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 1842,
    },
    {
      id: '2',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-mn4qr',
      FlightDelayMin: 2103,
    },
    {
      id: '3',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 1654,
    },
    {
      id: '4',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-ab8st',
      FlightDelayMin: 1920,
    },
    {
      id: '5',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-mn4qr',
      FlightDelayMin: 2340,
    },
    {
      id: '6',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 1780,
    },
    {
      id: '7',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-ab8st',
      FlightDelayMin: 1560,
    },
    {
      id: '8',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-mn4qr',
      FlightDelayMin: 2210,
    },
    {
      id: '9',
      FlightNum: 'INFO',
      Origin: 'request completed successfully',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 45,
    },
    {
      id: '10',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 1890,
    },
    {
      id: '11',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-ab8st',
      FlightDelayMin: 1720,
    },
    {
      id: '12',
      FlightNum: 'DEBUG',
      Origin: 'pool checkout attempt',
      Dest: 'payment-7f8b9-mn4qr',
      FlightDelayMin: 3,
    },
    {
      id: '13',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-xk2lp',
      FlightDelayMin: 2050,
    },
    {
      id: '14',
      FlightNum: 'WARN',
      Origin: 'connection acquire timeout exceeded 1000ms',
      Dest: 'payment-7f8b9-mn4qr',
      FlightDelayMin: 1680,
    },
    {
      id: '15',
      FlightNum: 'INFO',
      Origin: 'request completed successfully',
      Dest: 'payment-7f8b9-ab8st',
      FlightDelayMin: 38,
    },
  ],
  'connection-timeout-errors': [
    {
      id: '1',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 1/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1002,
    },
    {
      id: '2',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 2/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1005,
    },
    {
      id: '3',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (failed)',
      Dest: 'payment-service',
      FlightDelayMin: 1009,
    },
    {
      id: '4',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 1/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1012,
    },
    {
      id: '5',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 2/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1015,
    },
    {
      id: '6',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (failed)',
      Dest: 'payment-service',
      FlightDelayMin: 1018,
    },
    {
      id: '7',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 1/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1021,
    },
    {
      id: '8',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 2/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1024,
    },
    {
      id: '9',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (failed)',
      Dest: 'payment-service',
      FlightDelayMin: 1027,
    },
    {
      id: '10',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 1/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1030,
    },
    {
      id: '11',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 2/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1033,
    },
    {
      id: '12',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (failed)',
      Dest: 'payment-service',
      FlightDelayMin: 1036,
    },
    {
      id: '13',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 1/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1039,
    },
    {
      id: '14',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (retry 2/3)',
      Dest: 'payment-service',
      FlightDelayMin: 1042,
    },
    {
      id: '15',
      FlightNum: 'ERROR',
      Origin: 'Connection timeout to payments-db (failed)',
      Dest: 'payment-service',
      FlightDelayMin: 1045,
    },
  ],
};

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
        <OuiText size="s">
          <strong>Expanded document</strong>
        </OuiText>
      </div>
      <OuiTabs size="s" display="condensed">
        <OuiTab
          isSelected={detailTab === 'table'}
          onClick={() => setDetailTab('table')}>
          Table
        </OuiTab>
        <OuiTab
          isSelected={detailTab === 'json'}
          onClick={() => setDetailTab('json')}>
          JSON
        </OuiTab>
        <OuiTab
          isSelected={detailTab === 'traces'}
          onClick={() => setDetailTab('traces')}>
          Related traces
        </OuiTab>
      </OuiTabs>
      {detailTab === 'table' ? (
        <table className="discoverPage__detailTable">
          <tbody>
            {DETAIL_FIELDS.map((field) => (
              <tr key={field.name}>
                <td className="discoverPage__detailToken">
                  <OuiToken iconType={field.token} size="s" />
                </td>
                <td className="discoverPage__detailName">
                  <OuiText size="xs">{field.name}</OuiText>
                </td>
                <td className="discoverPage__detailValue">
                  <OuiText size="xs">
                    {field.value ||
                      (field.key === '_index'
                        ? 'gGt-Sn_7d03f9f5-b9c4-38d3-b888-751575bb49df_d3d7af60-4c81-11e8-b3d7-01146121b73d'
                        : String(item[field.key] || '–'))}
                  </OuiText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : detailTab === 'json' ? (
        <pre className="discoverPage__detailJson">
          {JSON.stringify(item, null, 2)}
        </pre>
      ) : (
        <div className="discoverPage__traceWaterfall">
          <div className="discoverPage__traceSpanRow">
            <span className="discoverPage__traceSpanName">payment-service</span>
            <div
              className="discoverPage__traceSpanBarWrap"
              style={{ backgroundColor: 'rgba(0,119,204,0.15)' }}>
              <div
                className="discoverPage__traceSpanBar"
                style={{ width: '100%', backgroundColor: '#0077CC' }}
              />
            </div>
            <span className="discoverPage__traceSpanDuration">8.4s</span>
          </div>
          <div className="discoverPage__traceSpanRow">
            <span
              className="discoverPage__traceSpanName"
              style={{ paddingLeft: 12 }}>
              → acquire_conn
            </span>
            <div
              className="discoverPage__traceSpanBarWrap"
              style={{ backgroundColor: 'rgba(255,100,103,0.15)' }}>
              <div
                className="discoverPage__traceSpanBar"
                style={{ width: '97.6%', backgroundColor: '#FF6467' }}
              />
            </div>
            <span className="discoverPage__traceSpanDuration">8.2s</span>
          </div>
          <div className="discoverPage__traceSpanRow">
            <span
              className="discoverPage__traceSpanName"
              style={{ paddingLeft: 12 }}>
              → query payments-db
            </span>
            <div
              className="discoverPage__traceSpanBarWrap"
              style={{ backgroundColor: 'rgba(0,191,179,0.15)' }}>
              <div
                className="discoverPage__traceSpanBar"
                style={{ width: '1.4%', backgroundColor: '#00BFB3' }}
              />
            </div>
            <span className="discoverPage__traceSpanDuration">12ms</span>
          </div>
          <div className="discoverPage__traceSpanRow">
            <span
              className="discoverPage__traceSpanName"
              style={{ paddingLeft: 12 }}>
              → serialize
            </span>
            <div
              className="discoverPage__traceSpanBarWrap"
              style={{ backgroundColor: 'rgba(0,191,179,0.15)' }}>
              <div
                className="discoverPage__traceSpanBar"
                style={{ width: '0.4%', backgroundColor: '#00BFB3' }}
              />
            </div>
            <span className="discoverPage__traceSpanDuration">3ms</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Table columns ---

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

// --- Standalone body component for embedding (e.g. in canvas panel) ---

export const LogsPageBody = ({
  queryText: customQuery,
  results: customResults,
  compact,
  onQueryExecute,
}) => {
  const results = customResults || QUERY_DATA['error-rate'];
  const queryText = customQuery || DEFAULT_QUERY_DEF.query;
  const [activeTab, setActiveTab] = useState('logs');
  const [expandedRows, setExpandedRows] = useState({});
  const [fieldsPanelOpen, setFieldsPanelOpen] = useState(!compact);

  const handleQueryKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onQueryExecute) {
        onQueryExecute();
      }
    }
  };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="discoverPage__queryArea">
        <OuiCompressedTextArea
          placeholder="Search with PPL"
          value={queryText}
          rows={2}
          resize="none"
          fullWidth
          readOnly={!onQueryExecute}
          onKeyDown={handleQueryKeyDown}
          className="discoverPage__queryTextarea"
        />
      </div>

      <div className="discoverPage__tabBar">
        <div className="discoverPage__tabBarLeft">
          <OuiButtonIcon
            iconType={fieldsPanelOpen ? 'menuLeft' : 'menuRight'}
            aria-label={
              fieldsPanelOpen ? 'Collapse fields panel' : 'Expand fields panel'
            }
            onClick={() => setFieldsPanelOpen(!fieldsPanelOpen)}
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
            <strong>{results.length.toLocaleString()} hits</strong>
            <span className="discoverPage__hitsDot">&middot;</span>
            <strong>323 ms</strong>
          </OuiText>
        </div>
        <div className="discoverPage__tabActions">
          {!compact && (
            <>
              <OuiButtonEmpty size="s" iconType="exportAction" iconSide="left">
                Export
              </OuiButtonEmpty>
              <OuiButtonEmpty size="s" iconType="dashboardApp" iconSide="left">
                Add to dashboard
              </OuiButtonEmpty>
            </>
          )}
        </div>
      </div>

      <div className="discoverPage__body">
        {fieldsPanelOpen && (
          <div style={{ width: 200, flexShrink: 0 }}>
            <FieldsPanel />
          </div>
        )}
        {fieldsPanelOpen && (
          <div
            className="discoverPage__resizeHandle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize fields panel"
            tabIndex={0}
          />
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

// --- Main LogsPage Component ---

export const LogsPage = ({
  selectedItem,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
  hideAskAi,
  onQueryExecute,
}) => {
  const queryDef = selectedItem && QUERY_DEFS[selectedItem];
  const savedResults =
    queryDef && !queryDef.queryOnly ? QUERY_DATA[selectedItem] || [] : [];

  const [activeTab, setActiveTab] = useState('logs');
  const [queryText, setQueryText] = useState(queryDef ? queryDef.query : '');
  const [isQueryEditable, setIsQueryEditable] = useState(
    !queryDef || !!queryDef.queryOnly
  );
  const [queryExecuted, setQueryExecuted] = useState(
    !!queryDef && !queryDef.queryOnly
  );
  const [highlightAskAi, setHighlightAskAi] = useState(null);
  const highlightTimer = useRef(null);
  const queryRef = useRef(null);

  // Results: show saved results if a query def is selected, or show executed results
  const results = queryExecuted
    ? savedResults.length > 0
      ? savedResults
      : QUERY_DATA['connection-timeout-errors'] || []
    : [];

  // Auto-focus textarea when landing on empty page or query-only page
  useEffect(() => {
    if ((!queryDef || queryDef.queryOnly) && queryRef.current) {
      setTimeout(() => queryRef.current.focus(), 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Enter to run query
  const handleQueryKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (queryText.trim()) {
        setQueryExecuted(true);
        // If onQueryExecute is provided (tab bar generate icon flow), signal parent
        if (onQueryExecute) {
          onQueryExecute(queryText);
        } else {
          // Fallback: highlight the Ask AI button in the header
          if (highlightTimer.current) clearTimeout(highlightTimer.current);
          highlightTimer.current = setTimeout(() => {
            setHighlightAskAi('loading');
            // After 6s (2 loops × 3s), switch to pulse highlight
            highlightTimer.current = setTimeout(() => {
              setHighlightAskAi('pulse');
            }, 6000);
          }, 500);
        }
      }
    }
  };

  // Clean up highlight timer
  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  // Reset highlight when Ask AI is opened
  useEffect(() => {
    if (isAskAiPanelOpen) {
      setHighlightAskAi(null);
    }
  }, [isAskAiPanelOpen]);
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
  const [isFieldsPanelCollapsed, setIsFieldsPanelCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    setQueryText(queryDef ? queryDef.query : '');
    setIsQueryEditable(!queryDef || !!queryDef.queryOnly);
    setQueryExecuted(!!queryDef && !queryDef.queryOnly);
    setHighlightAskAi(null);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    if ((!queryDef || queryDef.queryOnly) && queryRef.current) {
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
        title={queryDef ? queryDef.title : 'New log'}
        onContinueAsThread={onContinueAsThread}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
        isAskAiPanelOpen={isAskAiPanelOpen}
        onAskAiToggle={onAskAiToggle}
        hideAskAi={hideAskAi}
        firstActionIcon={isQueryEditable ? 'save' : 'pencil'}
        firstActionLabel={isQueryEditable ? 'Save' : 'Edit'}
        mockAiResponses={
          selectedItem === 'connection-timeout-errors' ||
          queryText.includes('connection timeout') ||
          queryText.includes('severity = "ERROR"')
            ? [
                'I see 847 connection timeout errors to payments-db starting at 14:30. Want me to check the trace data for this dependency?',
              ]
            : undefined
        }
        highlightAskAi={highlightAskAi}
        autoOpenAskAi={highlightAskAi === 'pulse'}
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
        extraActions={[{ iconType: 'importAction', label: 'Import' }]}
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

      <div className="discoverPage__queryArea">
        <OuiCompressedTextArea
          placeholder="Search with PPL"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={handleQueryKeyDown}
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
        {!isFieldsPanelCollapsed && (
          <>
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

      {isSaveModalOpen && (
        <OuiModal onClose={() => setIsSaveModalOpen(false)}>
          <OuiModalHeader>
            <OuiModalHeaderTitle>
              <h1>Save log</h1>
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
