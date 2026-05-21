import { createFileRoute } from '@tanstack/react-router';
import { CADENCE_ICON_DATA_URI } from '@/lib/og-icon';

export const Route = createFileRoute('/og/home')({
  server: {
    handlers: {
      GET: async () => {
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
                  gap: '16px',
                  marginBottom: '40px',
                }}
              >
                <img
                  src={CADENCE_ICON_DATA_URI}
                  width={48}
                  height={48}
                  style={{ borderRadius: '10px' }}
                />
                <span
                  style={{
                    color: '#fff',
                    fontSize: '32px',
                    fontWeight: 700,
                  }}
                >
                  Cadence
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
                  Smart Contracts Built for the AI Era
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    color: '#888',
                    lineHeight: 1.5,
                    marginTop: '24px',
                    maxWidth: '900px',
                  }}
                >
                  A safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.
                </div>
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
