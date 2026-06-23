/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  HTMLAttributes,
  FunctionComponent,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export interface OuiSessionRecentsItem {
  key: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
}

export interface OuiSessionRecentsProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  items: OuiSessionRecentsItem[];
  onItemClick?: (key: string) => void;
}

export const OuiSessionRecents: FunctionComponent<OuiSessionRecentsProps> = ({
  title = 'Recent',
  items,
  onItemClick,
  className,
  ...rest
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleHover = useCallback((hoveredIndex: number) => {
    if (!listRef.current) return;
    const els = listRef.current.querySelectorAll('.ouiSessionRecents__item');
    const seps = listRef.current.querySelectorAll(
      '.ouiSessionRecents__separator'
    );
    els.forEach((el, i) => {
      const distance = Math.abs(i - hoveredIndex);
      let scale = 1;
      if (distance === 0) scale = 1.03;
      else if (distance === 1) scale = 1.015;
      else if (distance === 2) scale = 1.005;
      (el as HTMLElement).style.transform = `scale(${scale})`;
    });
    seps.forEach((el, i) => {
      const distBefore = Math.abs(i - hoveredIndex);
      const distAfter = Math.abs(i + 1 - hoveredIndex);
      const minDist = Math.min(distBefore, distAfter);
      (el as HTMLElement).style.opacity = minDist === 0 ? '0' : '1';
    });
  }, []);

  const handleMouseDown = useCallback((pressedIndex: number) => {
    if (!listRef.current) return;
    const els = listRef.current.querySelectorAll('.ouiSessionRecents__item');
    els.forEach((el, i) => {
      const distance = Math.abs(i - pressedIndex);
      let scale = 1;
      if (distance === 0) scale = 0.97;
      else if (distance === 1) scale = 0.985;
      else if (distance === 2) scale = 0.995;
      (el as HTMLElement).style.transform = `scale(${scale})`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!listRef.current) return;
    listRef.current
      .querySelectorAll('.ouiSessionRecents__item')
      .forEach((el) => {
        (el as HTMLElement).style.transform = '';
      });
    listRef.current
      .querySelectorAll('.ouiSessionRecents__separator')
      .forEach((el) => {
        (el as HTMLElement).style.opacity = '';
      });
  }, []);

  const classes = classNames('ouiSessionRecents', className);

  return (
    <div
      className={classes}
      ref={listRef}
      onMouseLeave={handleMouseLeave}
      {...rest}>
      {title && (
        <div className="ouiSessionRecents__header">
          <h5 className="ouiSessionRecents__title">{title}</h5>
          <span className="ouiSessionRecents__count">{items.length}</span>
        </div>
      )}
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && <div className="ouiSessionRecents__separator" />}
          <button
            type="button"
            className="ouiSessionRecents__item"
            onClick={() => onItemClick && onItemClick(item.key)}
            onMouseEnter={() => handleHover(index)}
            onMouseDown={() => handleMouseDown(index)}
            onMouseUp={() => handleHover(index)}>
            <div className="ouiSessionRecents__itemContent">
              {item.title && (
                <p className="ouiSessionRecents__itemTitle">{item.title}</p>
              )}
              {item.description && (
                <p className="ouiSessionRecents__itemDescription">
                  {item.description}
                </p>
              )}
              {item.meta && (
                <p className="ouiSessionRecents__itemMeta">{item.meta}</p>
              )}
            </div>
            <span className="ouiSessionRecents__arrow">→</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

OuiSessionRecents.displayName = 'OuiSessionRecents';
