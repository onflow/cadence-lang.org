import { loader } from 'fumadocs-core/source';
import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType } from 'fumadocs-core/source';

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.webp'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}
