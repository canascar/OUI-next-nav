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
import {
  OuiIcon,
  OuiLoadingSpinner,
  OuiText,
} from '../../../../src/components';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

/**
 * ProgressTracker — OUI-skinned version of Tool UI's Progress Tracker.
 *
 * Props:
 *   id: string
 *   steps: Array<{ id, label, description?, status: 'pending' | 'in-progress' | 'completed' | 'failed' }>
 *   elapsedTime?: number (milliseconds)
 *   collapsed?: boolean (receipt/collapsed state)
 */

const formatElapsedTime = (ms) => {
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

const StepIcon = ({ status, mascotColor, mascotEyeColor }) => {
  switch (status) {
    case 'completed':
      return <OuiIcon type="checkInCircleEmpty" size="m" color="success" />;
    case 'in-progress':
      return <OuiAgenticSpinner size="s" />;
    case 'failed':
      return <OuiIcon type="crossInACircleFilled" size="m" color="danger" />;
    case 'pending':
    default:
      return <OuiIcon type="dot" size="m" color="subdued" />;
  }
};

export const ProgressTracker = ({ id, steps, elapsedTime, collapsed }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';
  if (collapsed) {
    const completedCount = steps.filter((s) => s.status === 'completed').length;
    const hasFailed = steps.some((s) => s.status === 'failed');
    return (
      <div
        className="progressTracker progressTracker--collapsed"
        id={id}
        role="status"
        aria-live="polite">
        <OuiIcon
          type={hasFailed ? 'crossInACircleFilled' : 'checkInCircleEmpty'}
          size="m"
          color={hasFailed ? 'danger' : 'success'}
        />
        <OuiText size="xs" color="subdued">
          <span>
            {hasFailed
              ? `${completedCount} of ${steps.length} steps completed`
              : `${steps.length} steps completed`}
          </span>
        </OuiText>
        {elapsedTime && (
          <time
            className="progressTracker__elapsed"
            dateTime={`PT${Math.round(elapsedTime / 1000)}S`}>
            {formatElapsedTime(elapsedTime)}
          </time>
        )}
      </div>
    );
  }

  return (
    <article
      className="progressTracker"
      id={id}
      role="status"
      aria-live="polite"
      aria-busy={steps.some((s) => s.status === 'in-progress')}>
      {elapsedTime && (
        <div className="progressTracker__header">
          <time
            className="progressTracker__elapsed"
            dateTime={`PT${Math.round(elapsedTime / 1000)}S`}>
            {formatElapsedTime(elapsedTime)}
          </time>
        </div>
      )}
      <ol className="progressTracker__steps">
        {steps.map((step) => {
          const isCurrent = step.status === 'in-progress';
          return (
            <li
              key={step.id}
              className={`progressTracker__step progressTracker__step--${step.status}`}
              aria-current={isCurrent ? 'step' : undefined}>
              <div className="progressTracker__stepIcon">
                <StepIcon status={step.status} mascotColor={mascotColor} mascotEyeColor={mascotEyeColor} />
              </div>
              <div className="progressTracker__stepContent">
                <OuiText size="xs">
                  <span className="progressTracker__stepLabel">
                    {step.label}
                  </span>
                </OuiText>
                {step.description && (
                  <OuiText size="xs" color="subdued">
                    <span>{step.description}</span>
                  </OuiText>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
};
