/* Market intelligence for the Software category.
   ---------------------------------------------------------------------------
   This is EXTERNAL research, not Lilly spend data, and it is real: every claim
   below carries the source it came from and the date it was read. It loads into
   the production build as well as the demo, because unlike the illustrative
   figures it is genuinely sourced.

   Read 27 July 2026. Attached to commodity 205 (Software) only. Other
   categories carry no market block and their panel states that gap.
   =========================================================================== */
(function () {
  if (typeof CATEGORY_SEED === 'undefined') return;

  var S = {
    lynton:   { n: 'Lynton, 2026 SaaS pricing squeeze', u: 'https://www.lyntonweb.com/library/saas-pricing-sqeeze-2026/' },
    baytech:  { n: 'BayTech, negotiating AI-driven renewals', u: 'https://www.baytechconsulting.com/blog/saas-pricing-shift-negotiate-ai-driven-renewals' },
    zyloAi:   { n: 'Zylo, true AI cost 2026', u: 'https://zylo.com/blog/ai-cost' },
    zyloTr:   { n: 'Zylo, 2026 SaaS pricing trends', u: 'https://zylo.com/blog/saas-pricing-trends' },
    honigman: { n: 'Honigman, the AI insurance gap', u: 'https://www.honigman.com/the-matrix/ai-insurance-gap-what-it-means-for-technology-contracts' },
    aigl:     { n: 'AI Governance Library, contracting with AI vendors', u: 'https://www.aigl.blog/contracting-with-ai-vendors-a-practical-guide-for-lawyers/' },
    founders: { n: 'Founders Legal, how 2026 reshapes AI law', u: 'https://founderslegal.com/how-2026-will-reshape-technology-and-ai-law/' },
    chiefs:   { n: 'Digital Chiefs, vendor consolidation 2026', u: 'https://www.digital-chiefs.de/en/vendor-consolidation-2026/' },
    ainformat:{ n: 'Enterprise software vendor consolidation and M&A', u: 'https://www.ainformat.com/detail/1372' }
  };

  var MARKET = {
    asOf: 'read 27 July 2026',
    headlines: [
      {
        k: '15% or higher',
        t: 'The routine renewal bump is gone',
        d: 'What used to be a 5 to 7 per cent renewal increase is now commonly 15 per cent or more. '
         + 'Average annual SaaS price rises run about 8.7 per cent, but aggressive vendors are taking 15 to 25 per cent, '
         + 'and once migration fees and credit multipliers are counted the effective increase often lands at 20 to 30 per cent.',
        src: [S.baytech, S.lynton]
      },
      {
        k: '78%',
        t: 'AI charges are arriving after the signature, not before it',
        d: 'Seventy-eight per cent of IT leaders saw unexpected charges tied to consumption or AI features in the past year, '
         + 'and seventy-seven per cent met costs that only surfaced after the contract was signed. AI features are being '
         + 'bundled into mainstream plans, which raises contract value and removes the lower-cost AI-free path.',
        src: [S.zyloAi, S.zyloTr]
      },
      {
        k: '9 to 33%',
        t: 'Megavendors are funding their AI build from the installed base',
        d: 'Microsoft raised commercial M365 list prices by between 9 and 33 per cent from July 2026. Bundling AI into '
         + 'existing SKUs is how the AI investment gets recovered, which makes the whole installed base a funding source '
         + 'rather than a set of individual negotiations.',
        src: [S.lynton]
      },
      {
        k: 'EUR 35M or 7%',
        t: 'AI regulation now has teeth, and it lands in the contract',
        d: 'The EU AI Act high-risk obligations apply from August 2026, carrying penalties up to 35 million euro or 7 per cent '
         + 'of global turnover. Buyers are expected to hold training-data restrictions, model-governance audit rights, '
         + 'incident notification windows and bias-testing commitments, which turns an ordinary SaaS renewal into a legal review.',
        src: [S.founders, S.aigl]
      },
      {
        k: 'Sole recovery',
        t: 'The insurance gap makes vendor indemnity the only backstop',
        d: 'Cyber and professional-liability policies largely do not answer for AI output failures, so the vendor indemnity is '
         + 'often the enterprise deployer’s only route to recovery. That makes IP indemnity covering the tool, its outputs '
         + 'and its training data the single most consequential clause in an AI agreement.',
        src: [S.honigman]
      },
      {
        k: '68%',
        t: 'Everyone is consolidating, which cuts both ways',
        d: 'Sixty-eight per cent of IT organisations plan vendor consolidation, targeting a 20 per cent reduction in providers, '
         + 'and AI is the primary catalyst as it erodes feature differentiation. Consolidation buys leverage through volume, '
         + 'but eliminating every viable alternative removes the competitive tension that produced the leverage.',
        src: [S.chiefs, S.ainformat]
      }
    ],
    implications: [
      'Model renewals at 15 per cent, not at inflation. A budget built on a 5 per cent assumption will be wrong on the largest agreements in the portfolio.',
      'Price the AI clause set before the commercial terms. Training-data restriction, audit rights, incident notification and output-IP indemnity are now the gating items, and they take longer to land than the discount does.',
      'Ask what the AI-free SKU costs, in writing, even where there is no intention of buying it. Its absence is the whole pricing strategy, and a documented refusal is leverage at the next renewal.',
      'Consumption commitments are where the money is. Unbudgeted AI and consumption charges hit roughly three quarters of buyers, and coverage discipline recovers more than a list-price argument will.',
      'Consolidate deliberately, not reflexively. Removing the last credible alternative in a subcategory converts a leverage position into a dependency, and the price follows about one renewal cycle later.'
    ]
  };

  (CATEGORY_SEED.categories || []).forEach(function (c) {
    if ((c.meta || {}).commodity === '205' || /software/i.test(c.title || '')) c.market = MARKET;
  });
}());
