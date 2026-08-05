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

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  OuiButtonIcon,
  OuiIcon,
  OuiSmallButton,
  OuiSmallButtonEmpty,
  OuiCompressedSelect,
  OuiThreadInput,
} from '../../../../src/components';

import { SessionLeftNav } from './session_left_nav';
import { OpenSearch3DLogo } from './opensearch_3d_logo';
import {
  getAccountScan,
  CONNECT_STEPS,
  AMBIENT_TILE,
  SAMPLE_DATA_BEATS,
} from './onboarding_scan_data';

/**
 * ONBOARDING — two views: Welcome (route default) and Setup.
 *
 * AWS vended telemetry is already flowing before setup starts. Onboarding
 * deepens coverage; it never gates the product. So every step is skippable
 * and the product is reachable from every screen.
 */

const HOME_ROUTE = '/sample-pages';

// Copy held as strings so apostrophes stay literal and greppable.
const COPY = {
  title: 'Welcome to OpenSearch',
  ready: 'Your observability stack is ready.',
  envLabel: "Here's what I found in your environment:",
  secondaryCta: 'Complete set up',
  sampleCta: 'Try with sample data',
  setupTitle: 'Connect your data sources',
  setupProse:
    'Your AWS vended telemetry is already flowing in. Select the services ' +
    "you'd like to connect for deeper monitoring — you can always add more " +
    'later in Settings.',
  installsToggle: 'View what this installs',
  skip: 'Skip this step',
  vendedTitle: 'AWS vended telemetry',
  vendedSubtitle: 'Metrics · Logs · Traces',
};

const goHome = () => {
  window.location.hash = HOME_ROUTE;
};

// ---------------------------------------------------------------------------
// Live sparkline — pure SVG, inherits its color from CSS so it stays on-theme
// ---------------------------------------------------------------------------

const SPARK_POINTS = 32;

const seedSeries = (points, base, variance) =>
  Array.from(
    { length: points },
    () => base + Math.floor(Math.random() * variance)
  );

const LiveSparkline = () => {
  const width = 320;
  const height = 56;
  const padding = 4;
  const gradientId = useMemo(
    () => `onboardSpark-${Math.floor(Math.random() * 100000)}`,
    []
  );
  const [series, setSeries] = useState(() => seedSeries(SPARK_POINTS, 14, 10));

  // Telemetry is already flowing — the line keeps moving on its own.
  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) => [
        ...prev.slice(1),
        14 + Math.floor(Math.random() * 10),
      ]);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const max = Math.max(...series) || 1;
  const coords = series.map((val, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = padding + (1 - val / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${coords.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      className="onboardEstate__spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// VIEW 1 — Welcome
// ---------------------------------------------------------------------------

const WelcomeView = ({ scan, onCompleteSetup }) => {
  const [sampleBeats, setSampleBeats] = useState([]);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach((t) => clearTimeout(t)), []);

  // Progress reports on the link itself, then the product opens on its own.
  const handleSampleData = useCallback(() => {
    if (sampleBeats.length) return;
    SAMPLE_DATA_BEATS.forEach((beat, i) => {
      timersRef.current.push(
        setTimeout(() => setSampleBeats((prev) => [...prev, beat]), i * 340)
      );
    });
    timersRef.current.push(setTimeout(goHome, 1400));
  }, [sampleBeats.length]);

  const isStandingUp = sampleBeats.length > 0;

  return (
    <div className="onboardWelcome">
      <div className="onboardWelcome__logoCol">
        <div className="onboardWelcome__logoShadow">
          <OpenSearch3DLogo size={340} />
        </div>
      </div>

      <div className="onboardWelcome__col">
        <h1 className="onboardWelcome__title">{COPY.title}</h1>

        <p className="onboardWelcome__ready">
          <OuiIcon type="check" size="s" />
          {COPY.ready}
        </p>

        <div className="onboardWelcome__envCard">
          <div className="onboardWelcome__envLabel">{COPY.envLabel}</div>
          <div className="onboardWelcome__envGrid">
            {scan.tiles.map((tile) => (
              <div className="onboardWelcome__envTile" key={tile.key}>
                <OuiIcon
                  className="onboardWelcome__envIcon"
                  type={tile.icon}
                  size="m"
                />
                <div className="onboardWelcome__envStat">{tile.stat}</div>
                <div className="onboardWelcome__envSub">{tile.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="onboardWelcome__ctas">
          <button
            type="button"
            className="onboardWelcome__primary"
            onClick={goHome}>
            Experience OpenSearch <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className="onboardWelcome__secondary"
            onClick={onCompleteSetup}>
            {COPY.secondaryCta}
          </button>

          <button
            type="button"
            className={`onboardWelcome__sample${
              isStandingUp ? ' onboardWelcome__sample--busy' : ''
            }`}
            onClick={handleSampleData}
            disabled={isStandingUp}>
            {isStandingUp ? (
              <span className="onboardWelcome__sampleBeats">
                {sampleBeats.map((beat) => (
                  <span className="onboardWelcome__sampleBeat" key={beat}>
                    {beat}
                  </span>
                ))}
              </span>
            ) : (
              COPY.sampleCta
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// VIEW 2 — Setup: the wizard column
// ---------------------------------------------------------------------------

const StepCard = ({ step, selection, onSelectionChange, onSkip, onNext }) => {
  const [installsOpen, setInstallsOpen] = useState(false);
  const selectId = `onboardSetup-${step.key}-select`;

  return (
    <div className="onboardStep">
      <div className="onboardStep__eyebrow">{step.eyebrow}</div>
      <div className="onboardStep__title">{step.title}</div>

      <div className="onboardStep__oneClick">
        <OuiIcon type="check" size="s" />
        {step.oneClick}
      </div>

      <label className="onboardStep__selectLabel" htmlFor={selectId}>
        {step.selectLabel}
      </label>
      <OuiCompressedSelect
        id={selectId}
        options={step.options}
        value={selection}
        onChange={(e) => onSelectionChange(step.key, e.target.value)}
        aria-label={step.selectLabel}
      />

      <button
        type="button"
        className="onboardStep__disclosure"
        aria-expanded={installsOpen}
        onClick={() => setInstallsOpen((open) => !open)}>
        <span className="onboardStep__caret" aria-hidden="true">
          {installsOpen ? '▾' : '▸'}
        </span>
        {COPY.installsToggle}
        <span className="onboardStep__tag">Read-only</span>
      </button>

      {installsOpen && (
        <ul className="onboardStep__installs">
          {step.installs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className="onboardStep__actions">
        <OuiSmallButtonEmpty onClick={() => onSkip(step.key)}>
          {COPY.skip}
        </OuiSmallButtonEmpty>
        <OuiSmallButton fill onClick={() => onNext(step.key)}>
          {step.nextLabel}
        </OuiSmallButton>
      </div>
    </div>
  );
};

const ResolvedStepCard = ({ step, status }) => (
  <div className="onboardStep onboardStep--resolved">
    <div className="onboardStep__eyebrow">{step.eyebrow}</div>
    <div className="onboardStep__resolvedRow">
      <span className="onboardStep__title">{step.title}</span>
      <span className={`onboardStep__status onboardStep__status--${status}`}>
        {status === 'connected' ? (
          <>
            <OuiIcon type="checkInCircleFilled" size="s" />
            Connected
          </>
        ) : (
          'Skipped'
        )}
      </span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// VIEW 2 — Setup: the live estate preview
// ---------------------------------------------------------------------------

const EstateTile = ({ label, icon, isDone }) => (
  <div
    className={`onboardEstate__tile${
      isDone ? ' onboardEstate__tile--done' : ''
    }`}>
    <OuiIcon type={icon} size="l" />
    <span className="onboardEstate__tileLabel">{label}</span>
    {isDone && (
      <span className="onboardEstate__tileBadge">
        <OuiIcon type="check" size="s" />
      </span>
    )}
  </div>
);

const EstatePreview = ({ statuses }) => (
  <div className="onboardEstate">
    <div className="onboardEstate__glow" aria-hidden="true" />

    <div className="onboardEstate__inner">
      <div className="onboardEstate__card">
        <div className="onboardEstate__cardHead">
          <span className="onboardEstate__bolt">
            <OuiIcon type="bolt" size="m" />
          </span>
          <div className="onboardEstate__cardText">
            <div className="onboardEstate__cardTitle">{COPY.vendedTitle}</div>
            <div className="onboardEstate__cardSubtitle">
              {COPY.vendedSubtitle}
            </div>
          </div>
          <span className="onboardEstate__live">
            <span className="onboardEstate__liveDot" aria-hidden="true" />
            Live
          </span>
        </div>
        <div className="onboardEstate__sparkWrap">
          <LiveSparkline />
        </div>
      </div>

      <div className="onboardEstate__tiles">
        {CONNECT_STEPS.map((step) => (
          <EstateTile
            key={step.key}
            label={step.tileLabel}
            icon={step.tileIcon}
            isDone={statuses[step.key] === 'connected'}
          />
        ))}
        <EstateTile
          label={AMBIENT_TILE.tileLabel}
          icon={AMBIENT_TILE.tileIcon}
          isDone={false}
        />
      </div>

      <button type="button" className="onboardEstate__escape" onClick={goHome}>
        Experience OpenSearch <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
);

const SetupView = () => {
  const [statuses, setStatuses] = useState({});
  const [selections, setSelections] = useState(() =>
    CONNECT_STEPS.reduce(
      (acc, step) => ({ ...acc, [step.key]: step.options[0].value }),
      {}
    )
  );

  const activeIndex = CONNECT_STEPS.findIndex((step) => !statuses[step.key]);
  const activeStep = activeIndex === -1 ? null : CONNECT_STEPS[activeIndex];

  const handleSelectionChange = useCallback((key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Skip and connect both advance; the last step lands on the product.
  const resolve = useCallback((key, status) => {
    const isLast = key === CONNECT_STEPS[CONNECT_STEPS.length - 1].key;
    setStatuses((prev) => ({ ...prev, [key]: status }));
    if (isLast) {
      // Let the tile flip land before the route changes.
      setTimeout(goHome, status === 'connected' ? 700 : 250);
    }
  }, []);

  const handleSkip = useCallback((key) => resolve(key, 'skipped'), [resolve]);
  const handleNext = useCallback((key) => resolve(key, 'connected'), [resolve]);

  const stepNumber =
    activeIndex === -1 ? CONNECT_STEPS.length : activeIndex + 1;

  return (
    <div className="onboardSetup">
      <div className="onboardSetup__wizard">
        <div className="onboardSetup__eyebrow">
          STEP {stepNumber} OF {CONNECT_STEPS.length}
        </div>
        <h1 className="onboardSetup__title">{COPY.setupTitle}</h1>
        <p className="onboardSetup__prose">{COPY.setupProse}</p>

        <div className="onboardSetup__steps">
          {CONNECT_STEPS.map((step, i) => {
            if (statuses[step.key]) {
              return (
                <ResolvedStepCard
                  key={step.key}
                  step={step}
                  status={statuses[step.key]}
                />
              );
            }
            // Later steps stay hidden until the one before them resolves.
            if (i !== activeIndex) return null;
            return (
              <StepCard
                key={step.key}
                step={step}
                selection={selections[step.key]}
                onSelectionChange={handleSelectionChange}
                onSkip={handleSkip}
                onNext={handleNext}
              />
            );
          })}
        </div>

        {!activeStep && (
          <button type="button" className="onboardSetup__done" onClick={goHome}>
            Experience OpenSearch <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <div className="onboardSetup__estate">
        <EstatePreview statuses={statuses} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Route shell — nav, view, and the pinned Ask-AI bar
// ---------------------------------------------------------------------------

const AskAiBar = () => {
  const [value, setValue] = useState('');

  // Asking a question is another way out — it opens the product.
  const handleSubmit = useCallback(() => goHome(), []);

  return (
    <div className="onboardShell__ask">
      <OuiThreadInput
        placeholder="Ask anything or use / for commands"
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        actionsLeft={
          <OuiButtonIcon
            iconType="plus"
            aria-label="Add attachment"
            size="s"
            color="text"
          />
        }
        actionsRight={
          <OuiButtonIcon
            iconType="sortUp"
            aria-label="Send message"
            display="fill"
            size="s"
            color="primary"
            isDisabled={!value.trim()}
            onClick={handleSubmit}
          />
        }
      />
    </div>
  );
};

export const OnboardingWizardPage = () => {
  // Deep-linking the route always lands on Welcome with zero completed steps.
  const [view, setView] = useState('welcome');
  const scan = useMemo(() => getAccountScan(), []);

  const showSetup = useCallback(() => setView('setup'), []);

  return (
    <div className="onboardShell">
      <SessionLeftNav
        isEmptySession={true}
        activeView="session"
        disableActions={true}
        onCreateSession={() => {}}
        onBrowseSessions={() => {}}
        onBrowseLibrary={() => {}}
        onSelectSession={() => {}}
      />

      <div className="onboardShell__main">
        <div className="samplePagesContentPanel onboardShell__panel">
          <div className="onboardShell__view">
            {view === 'welcome' ? (
              <WelcomeView scan={scan} onCompleteSetup={showSetup} />
            ) : (
              <SetupView />
            )}
          </div>
          <AskAiBar />
        </div>
      </div>
    </div>
  );
};
