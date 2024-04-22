// This component is overriden in order to allow the find in page feature to work

import React from 'react';
import Details from '@theme/Details';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function MDXDetails(props) {
  const items = React.Children.toArray(props.children);
  // Split summary item from the rest to pass it as a separate prop to the
  // Details theme component
  const summary = items.find(
    (item) => React.isValidElement(item) && item.type === 'summary',
  );
  const children = <>{items.filter((item) => item !== summary)}</>;

  return (
    <Details {...props} summary={summary}

    // Hack to make the component searchable using find in page
    className={clsx(props.className, styles.details)}

    // Hack to acknowledge browser-induced toggling of details element
    // simulates a click on the summary element when the details element is toggled
    onToggle={(e) => {
      e.preventDefault();
      e.stopPropagation();

      e.target.querySelector('summary').click();
    }}>
      {children}
    </Details>
  );
}
