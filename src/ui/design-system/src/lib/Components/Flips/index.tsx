import React, { useState } from 'react';
import { ButtonLink } from '../Button';
import { HeaderWithLink } from '../HeaderWithLink';
import FlipCell, { FlipCellHeader, type FlipCellProps } from './FlipCell';

export interface FlipsProps {
  goodPlacesToStartFlips: FlipCellProps[];
  headerLink?: string;
  openFlips: FlipCellProps[];
}

export default function Flips({
  goodPlacesToStartFlips,
  headerLink = '',
  openFlips,
}: FlipsProps): JSX.Element {
  const [selectedTab] = useState(0);
  const flips: [FlipCellProps[], FlipCellProps[]] = [
    openFlips,
    goodPlacesToStartFlips,
  ];

  return (
    <div className="container">
      <div className="flex items-center justify-between">
        <HeaderWithLink className="text-h2" headerLink={headerLink}>
          FLIPs
        </HeaderWithLink>
        <ButtonLink
          rightIcon="right"
          href="https://github.com/onflow/flips"
          variant="secondary"
        >
          Go to GitHub
        </ButtonLink>
      </div>
      <p className="mt-4 mb-6 max-w-[480px] text-primary-gray-400 dark:text-primary-gray-100">
        Flow improvement proposals can be submitted through a PR and are
        intended to propose changes to Flow's network and standards
      </p>
    </div>
  );
}
