const pillars = [
  {
    title: 'Pure Ingredients',
    body:
      'Our formulas are crafted with the finest, ethically-sourced natural minerals, free from harmful chemicals, talc, synthetic fragrances, parabens and other toxins. We believe that what you put on your skin should be as pure as what you put in your body.',
  },
  {
    title: 'Ethical and Sustainable',
    body:
      'We are committed to ethical sourcing and cruelty-free practices. Our eco-friendly, secondary-packaging ensures you can look good and feel good about your impact on the planet.',
  },
];

const journeyParagraphs = [
  'FeatherLite Cosmetics was founded by Kim Harvell in 2004, a visionary dedicated to handcrafting truly clean, all-natural mineral makeup for individuals with extremely sensitive skin. Kim, a dear friend and business colleague to Tamara Vander Lugt, sadly passed away in July 2023. Tamara met Kim in 2016, after years of searching for a “natural” foundation that wouldn’t cause breakouts, she was captivated by Kim’s products. From then on, Tamara used nothing else.',
  'FeatherLite’s mission has always been clear: to create lightweight, clean, all-natural mineral makeup that enhances natural beauty while prioritizing skin health. Inspired by the belief that beauty is empowering, FeatherLite combines nature’s finest ingredients to produce high-quality, cruelty-free products that blend seamlessly, feel weightless, and nurture radiant, healthy skin.',
  'Today, Tamara continues this legacy alongside Lee West, ensuring FeatherLite has the resources to uphold Kim’s vision, delivering a new generation of formulas that inspire confidence and well-being. Why? Because You’re Beautiful.',
];

const team = [
  {
    name: 'Kim Harvell',
    role: 'Founder',
    bio: 'Kim was known for her generous, bubbly personality, bringing joy and laughter to everyone she met. A passionate entrepreneur for over 20 years, she is deeply missed by all who knew her.',
    lifespan: 'January 13, 1964 – July 17, 2023',
  },
  {
    name: 'Tamara Vander Lugt',
    role: 'CEO & Co-founder',
    bio: 'Having struggled with problem, oily/combination skin, Tamara found FeatherLite after years of searching for a mineral foundation that was as gentle as it was beautiful. She now stewards the brand’s next chapter with the same care Kim began with.',
  },
];

const productDetails = [
  'Our foundations contain just six natural ingredients. These include sericite, kaolin, magnesium carbonate, zinc stearate, zinc oxide, titanium dioxide, and in some colors, micas and iron oxides to provide a range of colors for different skin tones.',
  'Sericite (a type of mica) gives the formula a silky texture, while kaolin, a natural French clay, absorbs excess oil. Titanium dioxide and zinc oxide offer natural SPF protection, and zinc stearate helps the mineral powders adhere smoothly to the skin.',
  'We never use talc, parabens, fragrances, oils, dyes, or bismuth oxychloride in any of our products.',
  'Natural mineral makeup is renowned for being gentle on the skin and a healthier alternative to traditional cosmetics. It supports skin health by being non-comedogenic, lightweight, and free from harsh chemicals, while providing natural sun protection. Its soothing, anti-inflammatory properties make it ideal for sensitive or acne-prone skin, and its ability to control oil and reduce bacterial growth promotes a clear, balanced complexion.',
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-20 px-4 pb-20 pt-16">
      <section className="rounded-[3rem] border border-border/60 bg-white/85 p-12 shadow-lg backdrop-blur">
        <p className="text-xs uppercase tracking-wide text-muted">About FeatherLite</p>
        <h1 className="mt-4 font-heading text-4xl text-text">Why FeatherLite?</h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          FeatherLite Cosmetics is crafted for those who prioritize green, clean, gentle cosmetics. Our products are
          all-natural, lightweight, and specifically formulated for sensitive and problematic skin, providing flawless coverage
          without irritation. Each product is made with non-toxic, cruelty-free ingredients, blending effortlessly to enhance
          your natural beauty while nurturing skin health. With FeatherLite, you’re choosing a brand committed to quality,
          transparency, and empowering beauty that feels as good as it looks.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-[2.5rem] border border-border/60 bg-white/80 p-8 shadow-sm">
            <h2 className="font-heading text-2xl text-text">{pillar.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[3rem] border border-border/60 bg-white/80 p-10 shadow-md">
        <p className="text-xs uppercase tracking-wide text-muted">The FeatherLite Journey</p>
        <h2 className="mt-3 font-heading text-3xl text-text">The passing of a torch.</h2>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted">
          {journeyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="rounded-[3rem] border border-border/60 bg-white/80 p-10 shadow-md">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-muted">Behind FeatherLite Cosmetics</p>
            <h2 className="font-heading text-3xl text-text">Our Philosophy</h2>
            <p className="text-sm leading-relaxed text-muted">
              Our products are crafted with 100% mineral-based, ethically sourced ingredients that are naturally gentle and
              non-irritating. Free from harsh chemicals, parabens, and artificial fragrances, they are perfect for all skin
              types, particularly sensitive and problematic skin types. Additionally, our formulations are endorsed by
              board-certified dermatologists and estheticians, ensuring they meet the highest standards for safety and
              effectiveness.
            </p>
            <div className="rounded-2xl border border-border/50 bg-surface/80 p-5 text-sm text-muted">
              <p className="font-semibold text-text">Our Inspiration: A note from the CEO</p>
              <p className="mt-3 text-sm leading-relaxed">
                Having struggled with problem, oily/combination skin my entire life, Kim’s products were the first I found that
                didn’t cause breakouts. I could wear them all day, even sleep in them or sweat at the gym, and my skin still
                remained clear. It made me realize that not all mineral or ‘natural’ cosmetics are created equal.
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                FeatherLite Cosmetics focuses on creating ultra-lightweight, unique formulations that blend effortlessly into the
                skin, delivering a natural, breathable finish. Our makeup doesn’t cake or feel heavy, a common issue with mineral
                products. We’ve also designed them for versatility, whether you prefer a sheer, everyday look or full-coverage glam,
                offering flexibility to suit your needs.
              </p>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-border/60 bg-white/70 p-8 shadow-sm">
            <h3 className="font-heading text-2xl text-text">Our Products</h3>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
              {productDetails.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[3rem] border border-border/60 bg-white/85 p-10 shadow-md">
        <p className="text-xs uppercase tracking-wide text-muted">The Force Behind FeatherLite Cosmetics</p>
        <h2 className="mt-3 font-heading text-3xl text-text">Meet the women carrying the legacy</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <article key={member.name} className="rounded-[2.5rem] border border-border/60 bg-white/80 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-2xl text-text">{member.name}</h3>
                {member.lifespan && <span className="text-xs uppercase tracking-wide text-muted">{member.lifespan}</span>}
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">{member.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
