/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This file has been copied from the original source code located in
 * `@docusaurus/theme-common/src/components/Details/index.tsx` and modified
 * to include a workaround for the Details component.
 * 
 * It is needed to allow the Details component to be searchable using
 * the find in page feature of the browser.
 */

import React, {
    useRef,
    useState,
    type ComponentProps,
    type ReactElement,
  } from 'react';
  import clsx from 'clsx';
  import useIsBrowser from '@docusaurus/useIsBrowser';
  import {useCollapsible, Collapsible} from '@docusaurus/theme-common';
  import styles from './styles.module.css';
  
  function isInSummary(node: HTMLElement | null): boolean {
    if (!node) {
      return false;
    }
    return node.tagName === 'SUMMARY' || isInSummary(node.parentElement);
  }
  
  function hasParent(node: HTMLElement | null, parent: HTMLElement): boolean {
    if (!node) {
      return false;
    }
    return node === parent || hasParent(node.parentElement, parent);
  }
  
  export type DetailsProps = {
    /**
     * Summary is provided as props, optionally including the wrapping
     * `<summary>` tag
     */
    summary?: ReactElement | string;
  } & ComponentProps<'details'>;
  
  /**
   * A mostly un-styled `<details>` element with smooth collapsing. Provides some
   * very lightweight styles, but you should bring your UI.
   */
  export function Details({
    summary,
    children,
    ...props
  }: DetailsProps): JSX.Element {
    const isBrowser = useIsBrowser();
    const detailsRef = useRef<HTMLDetailsElement>(null);
  
    const {collapsed, setCollapsed} = useCollapsible({
      initialState: !props.open,
    });
    // Use a separate state for the actual details prop, because it must be set
    // only after animation completes, otherwise close animations won't work
    const [open, setOpen] = useState(props.open);
  
    const summaryElement = React.isValidElement(summary) ? (
      summary
    ) : (
      <summary>{summary ?? 'Details'}</summary>
    );

    // Part of the workaround for the Details component
    const [skipAnimation, setSkipAnimation] = useState(false);
  
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <details
        {...props}
        ref={detailsRef}
        open={open}
        data-collapsed={collapsed}
        className={clsx(
          styles.details,
          isBrowser && styles.isBrowser,
          props.className,
        )}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          // Prevent a double-click to highlight summary text
          if (isInSummary(target) && e.detail > 1) {
            e.preventDefault();
          }
        }}
        onClick={(e) => {
          e.stopPropagation(); // For isolation of multiple nested details/summary
          const target = e.target as HTMLElement;
          const shouldToggle =
            isInSummary(target) && hasParent(target, detailsRef.current!);
          if (!shouldToggle) {
            return;
          }
          e.preventDefault();

          setSkipAnimation(false);
          if (collapsed) {
            setCollapsed(false);
            setOpen(true);
          } else {
            setCollapsed(true);
            // Don't do this, it breaks close animation!
            // setOpen(false);
          }
        }}

        ///////////////////////////////////////////////////////
        //   THIS IS THE WORKAROUND FOR DETAILS COMPONENT    //
        //   this is the reason why this element has been    //
        // copied from the original source code and modified //
        ///////////////////////////////////////////////////////
        onToggle={(e) => {
          if (e.target !== detailsRef.current || detailsRef.current === null) return;
          const isDOMOpen = detailsRef.current.open;

          // May skip closing animation if DOM state is forcefully closed
          // But generally this workaround here is needed for triggering open toggle
          if (isDOMOpen !== open) {
            setSkipAnimation(true);
            setOpen(isDOMOpen);
            setCollapsed(!isDOMOpen);
          }
        }}>
        {summaryElement}
  
        <Collapsible
          lazy={false} // Content might matter for SEO in this case
          collapsed={collapsed}
          disableSSRStyle // Allows component to work fine even with JS disabled!
          onCollapseTransitionEnd={(newCollapsed) => {
            setCollapsed(newCollapsed);
            setOpen(!newCollapsed);
          }}
          animation={skipAnimation ? {
            duration: 0,
          } : undefined}

          // Part of the workaround for the Details component
          // 1. Must be displayed to be searchable
          // 2. Must have a height to find location of the element
          className={!open && collapsed ? clsx(styles.collapsibleContainer, styles.autoHeight) : styles.collapsibleContainer }
        >
          <div className={styles.collapsibleContent}>{children}</div>
        </Collapsible>
      </details>
    );
  }
  