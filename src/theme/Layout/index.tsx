import React from 'react';
import Layout from '@theme-original/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  return (
    <>
      <Layout className="content-wrapper" {...props} />
      {/* Site-wide, matching the reference build where the assistant is part
          of the shell rather than the landing page. BrowserOnly because it
          reads localStorage-free but streams from /api/chat on mount only. */}
      <BrowserOnly>
        {() => {
          const AskCadenceAI =
            require('@site/src/components/AskCadenceAI').default;
          return <AskCadenceAI />;
        }}
      </BrowserOnly>
    </>
  );
}
