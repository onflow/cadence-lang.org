const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b-1 my-4 border-b border-b-primary-gray-100 pt-2 pb-4">
    {children}
  </div>
)

const Title = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs text-primary-gray-300">{children}</div>
)

export function TypeStyles() {
  return (
    <div>
      <Section>
        <Title>Title / H1</Title>
        <div className="text-h1">Get Started</div>
      </Section>
      <Section>
        <Title>Title / H2</Title>
        <div className="text-h2">Flow App Quickstart</div>
      </Section>
      <Section>
        <Title>Title / H3</Title>
        <div className="text-h3">Flow App Quickstart</div>
      </Section>
      <Section>
        <Title>Title / H4</Title>
        <div className="text-h4">This is a featured article</div>
      </Section>
      <Section>
        <Title>Title / H5</Title>
        <div className="text-h5">This is a featured article</div>
      </Section>
      <Section>
        <Title>Title / H6</Title>
        <div className="text-h6">This is a featured article</div>
      </Section>
      <Section>
        <Title>Body / Normal / Regular</Title>
        <div className="text-base">This is a body text</div>
      </Section>
      <Section>
        <Title>Body / Normal / Bold</Title>
        <div className="text-base font-bold">This is a body text</div>
      </Section>
      <Section>
        <Title>Body / Small / Bold</Title>
        <div className="text-sm">This is a small body text</div>
      </Section>
      <Section>
        <Title>Body / Small / Caps</Title>
        <div className="text-sm uppercase">
          Title of category in interior pages
        </div>
      </Section>
      <Section>
        <Title>Description / Regular</Title>
        <div className="text-xs">This is a description</div>
      </Section>
      <Section>
        <Title>Description / Regular Mono</Title>
        <div className="font-mono text-xs">This is a description</div>
      </Section>
    </div>
  )
}
