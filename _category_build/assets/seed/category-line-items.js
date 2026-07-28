/* Line-item segmentation for Market & Risk: THE MARKET PER CONSUMPTION UNIT.
   ---------------------------------------------------------------------------
   This is market data, not Lilly data. The other two segmentations on this tab
   cut Lilly's own portfolio by business purpose and delivery model. This one
   cuts the OUTSIDE world by what is being bought, because the market for GPU
   compute and the market for object storage are not the same market and do not
   behave the same way, even when the same three vendors sell both.

   Each entry carries what the market for that unit looks like: how concentrated
   it is, where price is going, and what the buyer can actually do about it. The
   Kraljic axes are read from those market properties, not from Lilly spend. The
   Porter read is per unit for the same reason.

   Researched 28 July 2026. Sources on each claim.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;

  var S = {
    opslyft: { n: 'OpsLyft, cloud cost management 2026', u: 'https://www.opslyft.com/guides/oci-cost-optimization' },
    avasant: { n: 'Avasant, software maintenance fees', u: 'https://avasant.com/report/high-software-maintenance-fees-and-what-to-do-about-them/' },
    vbm:     { n: 'VendorBenchmark, maintenance and support fees', u: 'https://vendorbenchmark.com/glossary/software-maintenance-support-fees' },
    stripo:  { n: 'Stripo, SaaS pricing trends 2026', u: 'https://research.stripo.email/saas-pricing-trends-2026' },
    saasmag: { n: 'SaaSMag, hybrid pricing 2026', u: 'https://www.saasmag.com/hybrid-pricing-saas-growth-2026/' },
    zylo:    { n: 'Zylo, 2026 SaaS pricing trends', u: 'https://zylo.com/blog/saas-pricing-trends' },
    lynton:  { n: 'Lynton, 2026 SaaS pricing squeeze', u: 'https://www.lyntonweb.com/library/saas-pricing-sqeeze-2026/' },
    hg:      { n: 'HG Insights, global IT spend 2026', u: 'https://hginsights.com/blog/global-it-spend-forecast-2026-what-enterprise-buyers-are-really-investing-in/' },
    flexera: { n: 'Flexera via Axis, FinOps statistics 2026', u: 'https://axis-intelligence.com/finops-statistics/' }
  };

  /* concentration 0-1, where 1 means a handful of sellers control the market.
     priceDir: rising | flat | falling. buyerPower 0-1. */
  var UNITS = [
    {
      key: 'AI and GPU compute',
      concentration: 0.92, buyerPower: 0.15, priceDir: 'rising',
      headline: 'Supply-constrained, one silicon vendor upstream',
      market: 'The scarcest market in the category. GPU and generative-AI services averaged 19% of the '
            + 'cloud bill in Q2 2026 and are the fastest-growing line on enterprise estates, overtaking '
            + 'steady-state compute. Every hyperscaler resells the same constrained silicon, so switching '
            + 'between them moves the logo, not the leverage.',
      play: 'Do not compete this on price; compete it on commitment shape and the right to re-rate as '
          + 'capacity loosens. Insist on model portability so today\'s constraint is not tomorrow\'s lock-in.',
      forces: { 'Rivalry': 'Low', 'Supplier power': 'High', 'Substitutes': 'Low',
                'New entrants': 'Low', 'Buyer power': 'Low' },
      src: [S.opslyft, S.zylo]
    },
    {
      key: 'Maintenance and support',
      concentration: 0.95, buyerPower: 0.12, priceDir: 'rising',
      headline: 'A captive annuity, priced at 18 to 22% of licence',
      market: 'Structurally the worst market a buyer faces, because the seller is the only possible '
            + 'supplier of support for its own product. Oracle charges 22% of net licence, SAP 19%, IBM '
            + '20 to 25%; the wider band is 15 to 25% and vendors are pushing the top of it.',
      play: 'The only real levers are third-party support, dropping to self-support on stable estates, '
          + 'and negotiating the uplift cap at the point the licence is bought, never after.',
      forces: { 'Rivalry': 'Low', 'Supplier power': 'High', 'Substitutes': 'Low-Medium',
                'New entrants': 'Low', 'Buyer power': 'Low' },
      src: [S.avasant, S.vbm]
    },
    {
      key: 'Seats and subscriptions',
      concentration: 0.68, buyerPower: 0.45, priceDir: 'rising',
      headline: 'Megavendor bundling is eating the discount',
      market: 'Still the largest unit by share: seat-based pricing is used by about 58% of SaaS products. '
            + 'But AI features are being bundled into mainstream plans, which raises contract value and '
            + 'removes the cheaper AI-free path, and the routine renewal bump has moved from 5 to 7% up '
            + 'to 15% or more.',
      play: 'Ask for the AI-free SKU price in writing even with no intention of buying it. The refusal is '
          + 'itself leverage, and it is the only way to see what the bundle actually costs.',
      forces: { 'Rivalry': 'Medium-High', 'Supplier power': 'Medium-High', 'Substitutes': 'Medium',
                'New entrants': 'Medium', 'Buyer power': 'Medium-High' },
      src: [S.stripo, S.lynton, S.saasmag]
    },
    {
      key: 'Usage and consumption',
      concentration: 0.55, buyerPower: 0.62, priceDir: 'rising',
      headline: 'The fastest-shifting pricing model, and the least budgeted',
      market: 'Usage-based options are offered by 42% of products, up from 27% in 2023, and hybrid '
            + 'adoption reaches 61% by the end of 2026. Gartner expects at least 40% of enterprise SaaS '
            + 'spend on usage, agent or outcome pricing by 2030, with seat-based vendor revenue share '
            + 'falling from 21% to 15%. 78% of IT leaders met unexpected consumption or AI charges last year.',
      play: 'This is the one unit where the buyer genuinely holds power, because consumption is '
          + 'measurable and commitments are negotiable. Coverage discipline recovers more than a '
          + 'list-price argument ever will.',
      forces: { 'Rivalry': 'High', 'Supplier power': 'Medium', 'Substitutes': 'Medium-High',
                'New entrants': 'Medium', 'Buyer power': 'High' },
      src: [S.stripo, S.saasmag, S.zylo]
    },
    {
      key: 'General compute',
      concentration: 0.78, buyerPower: 0.55, priceDir: 'flat',
      headline: 'Three sellers, real rivalry, high switching cost per workload',
      market: 'Genuinely contested at the point of sale and genuinely sticky afterwards. Data-centre '
            + 'spend is up 55.8% to $788B on the AI build-out, which keeps capacity tight even where the '
            + 'underlying compute is commoditised. Cloud waste sits at 29% of spend, so most buyers are '
            + 'paying for more than they use.',
      play: 'Leverage comes from committed-use coverage and rightsizing, not from a migration threat that '
          + 'nobody believes. Fix the 29% before arguing about the rate.',
      forces: { 'Rivalry': 'High', 'Supplier power': 'Medium-High', 'Substitutes': 'Low-Medium',
                'New entrants': 'Low', 'Buyer power': 'High' },
      src: [S.hg, S.flexera]
    },
    {
      key: 'Storage and egress',
      concentration: 0.72, buyerPower: 0.58, priceDir: 'falling',
      headline: 'Commoditised at rest, penalised in motion',
      market: 'Storage itself is the most commoditised unit in the category and its unit price keeps '
            + 'falling. Egress is the opposite: it is the deliberate switching tax, priced to make moving '
            + 'data between providers uneconomic, and it is where the real cost of a multi-cloud position '
            + 'shows up.',
      play: 'Negotiate storage on rate and egress on waiver. Egress relief at renewal is worth more than '
          + 'a storage discount, because it is what makes the next negotiation credible.',
      forces: { 'Rivalry': 'High', 'Supplier power': 'Medium', 'Substitutes': 'High',
                'New entrants': 'Medium', 'Buyer power': 'High' },
      src: [S.hg, S.flexera]
    },
    {
      key: 'Implementation and services',
      concentration: 0.35, buyerPower: 0.72, priceDir: 'flat',
      headline: 'The most competitive unit, and the most substitutable',
      market: 'IT services account for over 43% of total enterprise IT spend. Unlike every other unit '
            + 'here, the work is portable: partners, boutiques and internal teams all do it, and the '
            + 'vendor is rarely the only option even for its own product.',
      play: 'Compete this properly on a rate card. It is the one unit where a competitive event moves '
          + 'the price, and where the incumbent has the least structural hold.',
      forces: { 'Rivalry': 'High', 'Supplier power': 'Low-Medium', 'Substitutes': 'High',
                'New entrants': 'High', 'Buyer power': 'High' },
      src: [S.hg]
    }
  ];

  /* Kraljic for a market segment: profit impact is how much of the market's
     value moves through this unit for a buyer of this shape, supply risk is
     market concentration. Both are market properties, not Lilly figures. */
  /* Profit impact = how much of the buyer's value is genuinely at stake in this
     unit. Maintenance is deliberately low: it is a captive market, but at 20% of
     a licence base it is not where the money is. That combination is the
     textbook Bottleneck, and the first pass got it wrong by scoring dependency
     as if it were value. */
  var IMPACT = {
    'Seats and subscriptions': 1.00,
    'General compute':         0.78,
    'AI and GPU compute':      0.62,
    'Usage and consumption':   0.55,
    'Maintenance and support': 0.36,
    'Storage and egress':      0.30,
    'Implementation and services': 0.27
  };

  (CATEGORY_SEED.categories || []).forEach(function (c) {
    if ((c.meta || {}).commodity !== '205' && !/software/i.test(c.title || '')) return;
    c.lineItems = UNITS.map(function (u) {
      return { key: u.key, market: true, concentration: u.concentration, buyerPower: u.buyerPower,
               priceDir: u.priceDir, headline: u.headline, blurb: u.market, play: u.play,
               src: u.src, impact: IMPACT[u.key] != null ? IMPACT[u.key] : 0.5 };
    });
    c.lineItemForces = {};
    UNITS.forEach(function (u) {
      c.lineItemForces[u.key] = {
        'Rivalry': u.forces.Rivalry, 'Supplier power': u.forces['Supplier power'],
        'Substitutes': u.forces.Substitutes, 'New entrants': u.forces['New entrants'],
        'Buyer power': u.forces['Buyer power'], read: u.play
      };
    });
    c.lineItemsMeta = {
      market: true,
      asOf: 'researched 28 July 2026',
      basis: 'Market structure per consumption unit. This segmentation cuts the supply market, not '
           + 'Lilly spend: the market for GPU compute and the market for object storage behave nothing '
           + 'alike even when the same three vendors sell both. Concentration and buyer power are market '
           + 'properties; no Lilly figure is used to place a unit.',
      sources: [S.opslyft, S.avasant, S.vbm, S.stripo, S.saasmag, S.zylo, S.lynton, S.hg, S.flexera]
    };
  });
}());
