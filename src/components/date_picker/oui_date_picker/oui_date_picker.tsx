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

import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';

// @ts-ignore - JS component import
import { OuiPopover } from '../../popover';
// @ts-ignore - JS component import
import { OuiTabs, OuiTab } from '../../tabs';
// @ts-ignore - JS component import
import { OuiButton, OuiButtonEmpty } from '../../button';
// @ts-ignore - JS component import
import { OuiFlexGroup, OuiFlexItem } from '../../flex';
// @ts-ignore - JS component import
import { OuiSpacer } from '../../spacer';
// @ts-ignore - JS component import
import { OuiText } from '../../text';
// @ts-ignore - JS component import
import { OuiFormRow } from '../../form/form_row';
// @ts-ignore - JS component import
import { OuiFieldNumber } from '../../form/field_number';
// @ts-ignore - JS component import
import { OuiFieldText } from '../../form/field_text';
// @ts-ignore - JS component import
import { OuiSelect } from '../../form/select';

import {
  prettyDuration,
  commonDurationRanges,
} from '../super_date_picker/pretty_duration';

import { DurationRange, TimeUnitId } from '../types';

const TIME_TENSE_OPTIONS = [
  { value: 'last', text: 'Last' },
  { value: 'next', text: 'Next' },
];

const TIME_UNIT_OPTIONS: Array<{ value: TimeUnitId; text: string }> = [
  { value: 's', text: 'Seconds' },
  { value: 'm', text: 'Minutes' },
  { value: 'h', text: 'Hours' },
  { value: 'd', text: 'Days' },
  { value: 'w', text: 'Weeks' },
  { value: 'M', text: 'Months' },
  { value: 'y', text: 'Years' },
];

type TabId = 'quick' | 'absolute' | 'relative' | 'now';

export interface OuiDatePickerUnifiedProps {
  /** Start date string, e.g. 'now-15m' or an absolute ISO date */
  start: string;
  /** End date string, e.g. 'now' or an absolute ISO date */
  end: string;
  /** Callback fired when the time range changes */
  onTimeChange: (params: {
    start: string;
    end: string;
    isQuickSelection: boolean;
    isInvalid: boolean;
  }) => void;
  /** Commonly used quick-select ranges */
  commonlyUsedRanges?: DurationRange[];
  /** Date format string for display (moment format) */
  dateFormat?: string;
  /** Whether the picker is disabled */
  isDisabled?: boolean;
  /** Whether to show the Update button */
  showUpdateButton?: boolean;
  /** Whether to use compressed styling */
  compressed?: boolean;
}

export const OuiDatePickerUnified: React.FC<OuiDatePickerUnifiedProps> = ({
  start,
  end,
  onTimeChange,
  commonlyUsedRanges = commonDurationRanges,
  dateFormat = 'MMM D, YYYY @ HH:mm:ss.SSS',
  isDisabled = false,
  showUpdateButton = true,
  compressed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>('quick');

  // Internal state for pending changes
  const [pendingStart, setPendingStart] = useState(start);
  const [pendingEnd, setPendingEnd] = useState(end);

  // Quick select custom state
  const [quickSelectValue, setQuickSelectValue] = useState(15);
  const [quickSelectUnit, setQuickSelectUnit] = useState<TimeUnitId>('m');
  const [quickSelectTense, setQuickSelectTense] = useState('last');

  // Relative tab state
  const [relStartCount, setRelStartCount] = useState(15);
  const [relStartUnit, setRelStartUnit] = useState<TimeUnitId>('m');
  const [relStartTense, setRelStartTense] = useState('last');
  const [relEndCount, setRelEndCount] = useState(0);
  const [relEndUnit, setRelEndUnit] = useState<TimeUnitId>('m');
  const [relEndTense, setRelEndTense] = useState('last');

  // Absolute tab state
  const [absStart, setAbsStart] = useState(start);
  const [absEnd, setAbsEnd] = useState(end);

  const displayText = useMemo(
    () => prettyDuration(start, end, commonlyUsedRanges, dateFormat),
    [start, end, commonlyUsedRanges, dateFormat]
  );

  const openPopover = useCallback(() => {
    if (!isDisabled) {
      setPendingStart(start);
      setPendingEnd(end);
      setAbsStart(start);
      setAbsEnd(end);
      setIsOpen(true);
    }
  }, [isDisabled, start, end]);

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  const applyTime = useCallback(
    (
      newStart: string,
      newEnd: string,
      isQuickSelection: boolean,
      closeAfter = true
    ) => {
      onTimeChange({
        start: newStart,
        end: newEnd,
        isQuickSelection,
        isInvalid: false,
      });
      if (closeAfter) {
        closePopover();
      }
    },
    [onTimeChange, closePopover]
  );

  const handleQuickRangeClick = useCallback(
    (range: DurationRange) => {
      applyTime(range.start, range.end, true);
    },
    [applyTime]
  );

  const handleCustomQuickSelect = useCallback(() => {
    const newStart =
      quickSelectTense === 'last'
        ? `now-${quickSelectValue}${quickSelectUnit}`
        : 'now';
    const newEnd =
      quickSelectTense === 'last'
        ? 'now'
        : `now+${quickSelectValue}${quickSelectUnit}`;
    applyTime(newStart, newEnd, true);
  }, [quickSelectTense, quickSelectValue, quickSelectUnit, applyTime]);

  const handleRelativeApply = useCallback(() => {
    let newStart: string;
    if (relStartCount === 0) {
      newStart = 'now';
    } else if (relStartTense === 'last') {
      newStart = `now-${relStartCount}${relStartUnit}`;
    } else {
      newStart = `now+${relStartCount}${relStartUnit}`;
    }

    let newEnd: string;
    if (relEndCount === 0) {
      newEnd = 'now';
    } else if (relEndTense === 'last') {
      newEnd = `now-${relEndCount}${relEndUnit}`;
    } else {
      newEnd = `now+${relEndCount}${relEndUnit}`;
    }

    applyTime(newStart, newEnd, false);
  }, [
    relStartCount,
    relStartUnit,
    relStartTense,
    relEndCount,
    relEndUnit,
    relEndTense,
    applyTime,
  ]);

  const handleAbsoluteApply = useCallback(() => {
    applyTime(absStart, absEnd, false);
  }, [absStart, absEnd, applyTime]);

  const handleNowClick = useCallback(() => {
    const now = new Date().toISOString();
    applyTime(now, now, false);
  }, [applyTime]);

  const handleUpdateClick = useCallback(() => {
    applyTime(pendingStart, pendingEnd, false, false);
  }, [pendingStart, pendingEnd, applyTime]);

  // --- Tab content renderers ---

  const renderQuickSelectTab = () => (
    <div style={{ padding: '8px 0' }}>
      {/* Custom quick select */}
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiSelect
            compressed
            options={TIME_TENSE_OPTIONS}
            value={quickSelectTense}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setQuickSelectTense(e.target.value)
            }
            aria-label="Time tense"
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiFieldNumber
            compressed
            min={1}
            value={quickSelectValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuickSelectValue(parseInt(e.target.value, 10) || 1)
            }
            style={{ width: 64 }}
            aria-label="Time value"
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiSelect
            compressed
            options={TIME_UNIT_OPTIONS}
            value={quickSelectUnit}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setQuickSelectUnit(e.target.value as TimeUnitId)
            }
            aria-label="Time unit"
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty
            size="s"
            onClick={handleCustomQuickSelect}
            data-test-subj="ouiDatePickerUnified-quickSelectApply">
            Apply
          </OuiButtonEmpty>
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="m" />

      {/* Commonly used ranges */}
      <OuiText size="xs">
        <strong>Commonly used</strong>
      </OuiText>
      <OuiSpacer size="s" />
      <OuiFlexGroup gutterSize="s" wrap responsive={false}>
        {commonlyUsedRanges.map((range, index) => (
          <OuiFlexItem key={index} grow={false}>
            <OuiButtonEmpty
              size="s"
              onClick={() => handleQuickRangeClick(range)}
              data-test-subj={`ouiDatePickerUnified-commonRange-${
                range.label || index
              }`}>
              {range.label ||
                prettyDuration(
                  range.start,
                  range.end,
                  commonlyUsedRanges,
                  dateFormat
                )}
            </OuiButtonEmpty>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>
    </div>
  );

  const renderAbsoluteTab = () => (
    <div style={{ padding: '8px 0' }}>
      <OuiFormRow label="Start date" fullWidth>
        <OuiFieldText
          compressed
          fullWidth
          value={absStart}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setAbsStart(e.target.value)
          }
          placeholder="e.g. 2024-01-01T00:00:00.000Z"
          aria-label="Absolute start date"
        />
      </OuiFormRow>
      <OuiSpacer size="m" />
      <OuiFormRow label="End date" fullWidth>
        <OuiFieldText
          compressed
          fullWidth
          value={absEnd}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setAbsEnd(e.target.value)
          }
          placeholder="e.g. 2024-12-31T23:59:59.999Z"
          aria-label="Absolute end date"
        />
      </OuiFormRow>
      <OuiSpacer size="m" />
      <OuiButton
        size="s"
        fill
        onClick={handleAbsoluteApply}
        data-test-subj="ouiDatePickerUnified-absoluteApply">
        Apply
      </OuiButton>
    </div>
  );

  const renderRelativeInput = (
    label: string,
    count: number,
    setCount: (v: number) => void,
    unit: TimeUnitId,
    setUnit: (v: TimeUnitId) => void,
    tense: string,
    setTense: (v: string) => void
  ) => (
    <OuiFormRow label={label} fullWidth>
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiFieldNumber
            compressed
            min={0}
            value={count}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCount(parseInt(e.target.value, 10) || 0)
            }
            style={{ width: 64 }}
            aria-label={`${label} value`}
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiSelect
            compressed
            options={TIME_UNIT_OPTIONS}
            value={unit}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setUnit(e.target.value as TimeUnitId)
            }
            aria-label={`${label} unit`}
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiSelect
            compressed
            options={[
              { value: 'last', text: 'ago' },
              { value: 'next', text: 'from now' },
            ]}
            value={tense}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTense(e.target.value)
            }
            aria-label={`${label} direction`}
          />
        </OuiFlexItem>
      </OuiFlexGroup>
    </OuiFormRow>
  );

  const renderRelativeTab = () => (
    <div style={{ padding: '8px 0' }}>
      {renderRelativeInput(
        'Start',
        relStartCount,
        setRelStartCount,
        relStartUnit,
        setRelStartUnit,
        relStartTense,
        setRelStartTense
      )}
      <OuiSpacer size="m" />
      {renderRelativeInput(
        'End',
        relEndCount,
        setRelEndCount,
        relEndUnit,
        setRelEndUnit,
        relEndTense,
        setRelEndTense
      )}
      <OuiSpacer size="m" />
      <OuiButton
        size="s"
        fill
        onClick={handleRelativeApply}
        data-test-subj="ouiDatePickerUnified-relativeApply">
        Apply
      </OuiButton>
    </div>
  );

  const renderNowTab = () => (
    <div style={{ padding: '16px 0', textAlign: 'center' }}>
      <OuiText size="s">
        <p>
          Setting the time to &quot;now&quot; means the time will be calculated
          at query time. Use this for dashboards that should always show the
          most recent data.
        </p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiButton
        fill
        onClick={handleNowClick}
        data-test-subj="ouiDatePickerUnified-setNow">
        Set start &amp; end to now
      </OuiButton>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'quick':
        return renderQuickSelectTab();
      case 'absolute':
        return renderAbsoluteTab();
      case 'relative':
        return renderRelativeTab();
      case 'now':
        return renderNowTab();
      default:
        return null;
    }
  };

  const triggerButton = (
    <OuiButtonEmpty
      className={classNames('ouiDatePickerUnified__trigger', {
        'ouiDatePickerUnified__trigger--compressed': compressed,
      })}
      onClick={openPopover}
      isDisabled={isDisabled}
      iconType="calendar"
      iconSide="left"
      size={compressed ? 'xs' : 's'}
      data-test-subj="ouiDatePickerUnified-triggerButton">
      {displayText}
    </OuiButtonEmpty>
  );

  return (
    <OuiFlexGroup gutterSize="s" responsive={false} alignItems="center">
      <OuiFlexItem grow={false}>
        <OuiPopover
          button={triggerButton}
          isOpen={isOpen}
          closePopover={closePopover}
          anchorPosition="downLeft"
          panelPaddingSize="m"
          ownFocus
          data-test-subj="ouiDatePickerUnified-popover">
          <div
            style={{ width: 400 }}
            data-test-subj="ouiDatePickerUnified-panel">
            <OuiTabs size="s">
              <OuiTab
                isSelected={selectedTab === 'quick'}
                onClick={() => setSelectedTab('quick')}>
                Quick select
              </OuiTab>
              <OuiTab
                isSelected={selectedTab === 'absolute'}
                onClick={() => setSelectedTab('absolute')}>
                Absolute
              </OuiTab>
              <OuiTab
                isSelected={selectedTab === 'relative'}
                onClick={() => setSelectedTab('relative')}>
                Relative
              </OuiTab>
              <OuiTab
                isSelected={selectedTab === 'now'}
                onClick={() => setSelectedTab('now')}>
                Now
              </OuiTab>
            </OuiTabs>
            {renderTabContent()}
          </div>
        </OuiPopover>
      </OuiFlexItem>
      {showUpdateButton && (
        <OuiFlexItem grow={false}>
          <OuiButton
            size={compressed ? 'xs' : 's'}
            fill
            isDisabled={isDisabled}
            onClick={handleUpdateClick}
            data-test-subj="ouiDatePickerUnified-updateButton">
            Update
          </OuiButton>
        </OuiFlexItem>
      )}
    </OuiFlexGroup>
  );
};

OuiDatePickerUnified.displayName = 'OuiDatePickerUnified';
