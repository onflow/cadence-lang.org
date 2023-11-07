import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';

export const CustomIcon = ({
  customProps,
}: {
  customProps?: Record<string, any>;
}): JSX.Element | null | string => {
  const customIcon =
    Boolean(customProps?.icon) && (customProps?.icon as string);
  if (!customIcon) {
    return null;
  }
  if (customIcon.match(/^\//) != null) {
    return <img src={useBaseUrl(customIcon)} className="h-16" />;
  }

  if (customIcon.match(/^https?/) != null) {
    return <img src={customIcon} className="h-16" />;
  }

  return customIcon;
};
