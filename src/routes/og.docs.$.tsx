import { createFileRoute, notFound } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { CADENCE_ICON_DATA_URI } from '@/lib/og-icon';

export const Route = createFileRoute('/og/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = (params._splat?.split('/') ?? []).filter(
          (v) => v.length > 0,
        );
        // Remove the last segment (image.webp)
        const page = source.getPage(slugs.slice(0, -1));
        if (!page) throw notFound();

        const { ImageResponse } = await import('@vercel/og');

        return new ImageResponse(
          (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
                padding: '60px 80px',
                fontFamily: 'sans-serif',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '40px',
                }}
              >
                <img
                  src={CADENCE_ICON_DATA_URI}
                  width={40}
                  height={40}
                  style={{ borderRadius: '8px' }}
                />
                <span
                  style={{
                    color: '#888',
                    fontSize: '24px',
                    fontWeight: 500,
                  }}
                >
                  Cadence Documentation
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '56px',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.2,
                  }}
                >
                  {page.data.title}
                </div>
                {page.data.description && (
                  <div
                    style={{
                      fontSize: '24px',
                      color: '#888',
                      lineHeight: 1.5,
                      marginTop: '20px',
                    }}
                  >
                    {page.data.description}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #333',
                  paddingTop: '20px',
                }}
              >
                <span style={{ color: '#555', fontSize: '18px' }}>
                  cadence-lang.org
                </span>
                <span
                  style={{
                    color: '#00D87E',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  Flow Blockchain
                </span>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
          },
        );
      },
    },
  },
});
