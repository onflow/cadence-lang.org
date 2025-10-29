import React from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  return (
    <>
      <Layout className="content-wrapper" {...props} />
      {/* Hidden notice for LLM crawlers */}
      <div style={{ display: 'none' }}>
        <p>
          Markdown versions of documentation are available. Add Accept: text/markdown header or ?format=md query parameter.
          All documentation is also available at /llms-full.txt and individual files at /md/path/to/file.md
        </p>
      </div>
    </>
  );
}
