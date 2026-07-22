import { useState } from "react";

// ── Color tokens (locked per canonical v3.2; status palette uses on-brand non-green signals per lilly-brand-assets brand-colors) ──
// POS is the positive/good/passing signal: Bold Blue #0F3A85 (Lilly has no on-brand green; positive stays on blue). OK is the positive background tint: Neutral Sky #D4E5F7.
const R="#E1251B",DK="#212121",POS="#0F3A85",BRN="#521207",CARD="#E4EBF1",
  WARM="#FFF0D8",RISK="#FFF5F5",OK="#D4E5F7",BD="#E2E8F0",MUT="#71717A",
  LT="#A1A1AA",BLU="#1D4ED8",AMB="#B45309",GOLD="#854D0E",PUR="#7030A0",W="#FFFFFF",BG="#F8FAFC";
const TIER={HIGH:R,MEDIUM:AMB,LOW:POS};
const COV={Covered:POS,Confirm:AMB,Gap:R};
const POS_C={"RED LINE":R,"HOLD FIRM":AMB,TRADE:GOLD,CONCEDE:POS};

// ── Reusable components ──
const Metric=({v,l,c=DK})=><div style={{textAlign:"center",padding:"12px 8px"}}><div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:11,color:MUT,marginTop:4}}>{l}</div></div>;
const Pill=({t,bg,fg=W})=><span style={{display:"inline-block",padding:"2px 10px",borderRadius:12,fontSize:11,fontWeight:600,background:bg,color:fg,marginRight:4}}>{t}</span>;
const Badge=({t,bg})=><span style={{display:"inline-block",padding:"4px 12px",borderRadius:4,fontSize:12,fontWeight:600,background:bg,color:W,marginRight:6}}>{t}</span>;
const Card=({children,border,bg=W,title,note})=><div style={{background:bg,borderLeft:`4px solid ${border||BD}`,borderRadius:"0 6px 6px 0",padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>{title&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}><span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700}}>{title}</span>{note&&<span style={{fontSize:11,color:LT}}>{note}</span>}</div>}{children}</div>;
const Callout=({children,bg=CARD,bc=BD})=><div style={{background:bg,borderLeft:`4px solid ${bc}`,padding:"14px 18px",borderRadius:"0 6px 6px 0",marginBottom:14,fontSize:13,lineHeight:1.6}}>{children}</div>;
const Sub=({tabs,active,set})=><div style={{display:"flex",gap:0,borderBottom:`2px solid ${BD}`,marginBottom:16,overflowX:"auto"}}>{tabs.map(t=><button key={t} onClick={()=>set(t)} style={{padding:"8px 16px",border:"none",borderBottom:active===t?`3px solid ${R}`:"3px solid transparent",background:"none",fontSize:13,fontWeight:active===t?700:400,color:active===t?DK:MUT,cursor:"pointer",whiteSpace:"nowrap"}}>{t}</button>)}</div>;
const STable=({headers,rows})=><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:16}}><thead><tr>{headers.map((h,i)=><th key={i} style={{background:DK,color:W,padding:"8px 10px",textAlign:"left",fontWeight:600,fontSize:12}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} style={{background:i%2===0?W:"#F8FAFC"}}>{r.map((c,j)=><td key={j} style={{padding:"8px 10px",borderBottom:`1px solid ${BD}`,verticalAlign:"top"}}>{c}</td>)}</tr>)}</tbody></table>;
const KPI=({items})=><div style={{display:"grid",gridTemplateColumns:`repeat(${items.length},1fr)`,gap:12,marginBottom:20}}>{items.map(([v,l,c],i)=><div key={i} style={{background:W,borderRadius:8,border:`1px solid ${BD}`,padding:4}}><Metric v={v} l={l} c={c}/></div>)}</div>;
const Section=({title})=><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,marginBottom:10,marginTop:20,color:DK}}>{title}</div>;
const SubHead=({title})=><div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:700,color:BLU,marginTop:14,marginBottom:4,paddingBottom:4,borderBottom:`1px solid ${BD}`}}>{title}</div>;

// ── Gauge (semicircular, 4 fixed color bands; canonical component per dashboard-canonical.md) ──
const polarPt=(cx,cy,r,angleDeg)=>{const rad=angleDeg*Math.PI/180;return {x:cx+r*Math.cos(rad),y:cy-r*Math.sin(rad)};};
const bandArc=(cx,cy,r,v0,v1)=>{const a0=180-(v0/100)*180,a1=180-(v1/100)*180;const p0=polarPt(cx,cy,r,a0),p1=polarPt(cx,cy,r,a1);return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;};
const GAUGE_BANDS=[[0,25,R,"Critical"],[25,50,AMB,"High"],[50,75,GOLD,"Moderate"],[75,100,POS,"Low"]];
const gaugeTier=(v)=>v>=75?"Low":v>=50?"Moderate":v>=25?"High":"Critical";
const gaugeColor=(v)=>v>=75?POS:v>=50?GOLD:v>=25?AMB:R;
const Gauge=({value})=>{
  const cx=100,cy=104,r=78,sw=16;
  const needleAngle=180-(value/100)*180;
  const np=polarPt(cx,cy,r-4,needleAngle);
  const tier=gaugeTier(value),tColor=gaugeColor(value);
  return <div style={{textAlign:"center"}}>
    <svg viewBox="0 0 200 118" style={{width:"100%",maxWidth:260,display:"block",margin:"0 auto"}}>
      {GAUGE_BANDS.map(b=><path key={b[0]} d={bandArc(cx,cy,r,b[0],b[1])} stroke={b[2]} strokeWidth={sw} fill="none"/>)}
      <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke={DK} strokeWidth={3} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={6} fill={DK}/>
      <text x={cx} y={cy-32} textAnchor="middle" style={{fontFamily:"Georgia,serif",fontSize:34,fontWeight:700,fill:tColor}}>{value}</text>
      <text x={cx} y={cy-14} textAnchor="middle" style={{fontFamily:"Arial",fontSize:11,fill:MUT}}>out of 100</text>
    </svg>
    <Pill t={`${tier.toUpperCase()} PROTECTION`} bg={tColor}/>
    <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
      {GAUGE_BANDS.map(b=><div key={b[3]} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:MUT}}><span style={{width:8,height:8,borderRadius:2,background:b[2],display:"inline-block"}}/>{b[3]} {b[0]}-{b[1]===100?100:b[1]-1}</div>)}
    </div>
  </div>;
};

// ── Retention classification (pure deterministic lookup; always carries a records-SME confirm tag) ──
const RETENTION_MAP={MSA:"CONTRACT-ACTIVE",Exhibit:"CONTRACT-ACTIVE",Addendum:"CONTRACT-ACTIVE",WO:"CONTRACT-ACTIVE",Invoice:"WORKING","Compliance Evidence":"COMPLIANCE-EVIDENCE","Risk & Deviation Approval":"COMPLIANCE-EVIDENCE"};
const retentionClass=(type)=>RETENTION_MAP[type]||"WORKING";

// ── Obligation deadline formatting (pure functions over the obligation.days sort key) ──
const daysLabel=(d)=>{
  if(d===0) return "Continuous / 1-2 day trigger";
  if(d>=8000) return "On demand / conditional";
  if(d>=365) return `~${Math.round(d/30)} mo out`;
  return `${d}d out`;
};
const urgencyColor=(d)=> d===0?R : d<=120?AMB : d<=400?BLU : MUT;

// ── DATA MODEL ──
const D = {
  supplier:"Supplier A", doc:"Work Order 10: Conversational Intelligence (illustrative)",
  value:"$617,953/yr", term:"Signature to Jun 2, 2027 (~12 mo)", riskScore:64, hardStops:0,

  findings:[
    {id:1,t:"HIGH",title:"Missing call volume period",where:"Section 1.1, para 3",ev:"\"up to 15,000 recorded calls per [blank]\" with tracked deletion of 'month' found in XML. Blocks entitlement verification and per-unit economics ($3.43/call at 15K/mo vs $41.20 at 15K/yr).",msa:"N/A (WO-specific)",v:true,impact:"Entire pricing basis unverifiable.",action:"Restore 'per month.' Confirm with Supplier A.",cat:"Scope"},
    {id:2,t:"HIGH",title:"SLA degraded 150 bps from MSA template",where:"WO Sections 6.1-6.2",ev:"WO: 98% annual, 5% credit. MSA Exhibit B §5.1/7.4: 99.50% monthly, 5% credit, material breach at <98% for 3/12 months. Annual measurement hides individual bad months. Exclusion list broader than MSA Force Majeure.",msa:"Exhibit B §5.1, §7.4, §7.4.1 (VERIFIED)",v:true,impact:"150 bps degradation + annual averaging + broad exclusions = substantially weakened SLA.",action:"Restore Exhibit B defaults. Narrow exclusions to FM only.",cat:"SLA"},
    {id:3,t:"HIGH",title:"HITL training data use ambiguity (AI Standard conflict)",where:"WO Section 1.1 (HITL/Supervised Training)",ev:"WO describes HITL to 'improve model accuracy' without specifying which models. Definition trace: call recordings = Lilly Information (A.1.19), NOT Usage Data (A.1.37). Lilly Content per AI Standard. §3.5 bars use as Supplier Training Content. Supplier A Addendum A discloses General Use Models (cross-client) and Client-Dedicated Models (Lilly-specific). If HITL feedback from Lilly data flows to General Use Models, violates §3.5.",msa:"AI Standard §2, §3.5; MSA A.1.19, A.1.37; Addendum A §3 (VERIFIED)",v:true,impact:"Potential unauthorized use of Lilly data for cross-client model improvement.",action:"Add clause: HITL on Lilly Content improves only Client-Dedicated Models.",cat:"AI/Data"},
    {id:4,t:"MEDIUM",title:"Annual prepayment erodes TfC value",where:"Pricing; Table 2 billing",ev:"$205,984 at execution + $411,969 Aug/Sep. 30% discount conditioned on annual prepay. MSA §4.4 is Net-60. MSA §13.4: on TfC for SaaS, Lilly liable for unused remainder up to 12 months. Combined with prepayment, up to $617,953 may be unrecoverable on early termination.",msa:"MSA §4.4, §13.4 (VERIFIED)",v:true,impact:"$617,953 at risk if Lilly terminates for convenience after annual prepayment.",action:"Negotiate pro-rata refund on TfC, or switch to quarterly billing.",cat:"Commercial"},
    {id:5,t:"MEDIUM",title:"Custom AI model ownership not explicit in WO",where:"WO Table 1 (Custom Classifiers, Quality Models, autoscoring)",ev:"Custom models = Work Product (MSA A.1.39) + Lilly Trained Models (AI Standard §2/§15). Both assign to Lilly. WO silent on this. In SaaS context where models run on vendor infra, explicit language prevents portability/deletion disputes.",msa:"MSA §9.1.2, AI Standard §15 (VERIFIED)",v:true,impact:"Ambiguity about model ownership, portability, deletion at WO end.",action:"Add explicit ownership + export/deletion clause.",cat:"IP"},
    {id:6,t:"MEDIUM",title:"No AE/product complaint detection process at scale",where:"WO scope vs MSA §3.8",ev:"180K calls/yr with patients, HCPs, caregivers. MSA §3.8: 1-biz-day AE reporting. WO AI models cover experience, friction, quality but not AE detection. At 0.1-0.5% AE signal rate: 180-900 potential AE calls/yr. 5% false negative = 9-45 missed AE signals.",msa:"MSA §3.8 (VERIFIED)",v:true,impact:"Regulatory risk from AI misclassification at scale.",action:"Add AE flag classifier + quarterly reporting.",cat:"Pharma"},
    {id:7,t:"MEDIUM",title:"Telephony migration without transition plan",where:"WO Table 2",ev:"Billing split: Twilio/Scriptly (4 mo) then Genesys/LSC (8 mo). No timeline, acceptance criteria, continuity guarantee, or risk allocation.",msa:"N/A",v:true,impact:"Service gap and data loss risk during cutover.",action:"Add migration section.",cat:"Delivery"},
    {id:8,t:"MEDIUM",title:"June 15 execution deadline is a discount-expiry pressure lever",where:"WO Table 1 (Additional Discounts)",ev:"$264,837 discount (30%) conditioned on annual payment + execution by June 15. Creates artificial urgency that may compress FRAP or SME review.",msa:"N/A",v:true,impact:"$264,837 at risk if execution slips.",action:"Extend deadline through Lilly approval cycle.",cat:"Commercial"},
    {id:9,t:"MEDIUM",title:"Missing acceptance criteria",where:"WO (absent)",ev:"MSA Exhibit B WO Template §1.5 requires acceptance criteria. None in WO. SFTP/API integration with two telephony platforms needs formal go-live gate.",msa:"Exhibit B Attachment 2 §1.5 (VERIFIED)",v:true,impact:"No formal acceptance gate for implementation.",action:"Add acceptance criteria per deliverable.",cat:"Delivery"},
    {id:10,t:"LOW",title:"Contradictory expense language",where:"WO Section 1.4",ev:"States both 'no additional compensation for expenses' and 'will be compensated for expenses per Agreement.' Template artifact.",msa:"N/A",v:true,impact:"Ambiguity only.",action:"Delete second sentence.",cat:"Commercial"},
    {id:11,t:"LOW",title:"'Up to' qualifier on Insight Sessions",where:"WO Section 1.1",ev:"'Up to twelve (12)' creates ceiling, not floor. No minimum delivery commitment.",msa:"N/A",v:true,impact:"Supplier A could deliver fewer than 12.",action:"Change to 'twelve (12)' without 'up to.'",cat:"Scope"},
  ],

  coverage:[
    {cat:"Termination",s:"Covered",src:"MSA §13.1, §13.4 (TfC 120 days, for cause 30-day cure)"},
    {cat:"SLA/Performance",s:"Gap",src:"WO degrades Exhibit B defaults (Finding #2)"},
    {cat:"Data Protection",s:"Covered",src:"SPS via MSA §3.2.2; SPS Exhibit A completed; BAA status: confirm"},
    {cat:"AI Governance",s:"Confirm",src:"Exhibit C in place; HITL needs WO clarification (Finding #3)"},
    {cat:"Security",s:"Covered",src:"ISS via MSA §3.2.3"},
    {cat:"Audit Rights",s:"Covered",src:"MSA §11.4 (annual, 10 biz day notice)"},
    {cat:"IP Ownership",s:"Confirm",src:"MSA §9.1.2 + AI Std §15; custom models need explicit WO clause (#5)"},
    {cat:"Indemnification",s:"Covered",src:"MSA §14 (mutual, IP infringement included)"},
    {cat:"Liability",s:"Covered",src:"MSA §15 (general >$3M; data/privacy 5x/$10M; broad carve-outs)"},
    {cat:"Insurance",s:"Covered",src:"MSA §16 (CGL $1M/$3M, Prof $2M, Cyber $10M, Umbrella $2M)"},
    {cat:"Renewal/Price",s:"Covered",src:"MSA §1.2 + Exhibit B §4.1 (5-yr lock, CPI/5% cap)"},
    {cat:"Flexibility",s:"Gap",src:"No volume reduction or scope adjustment mechanism"},
    {cat:"Pharma-Specific",s:"Covered",src:"MSA §3.8 (AE 1 biz day), §3.9 (debarment), §3.7 (sanctions)"},
    {cat:"Commitment",s:"Confirm",src:"Fixed annual; MSA §13.4 caps TfC at 12 mo; prepay risk (#4)"},
  ],

  obligations:[
    {what:"AE/Product Complaint reporting",who:"Supplier A",when:"Within 1 business day of awareness",src:"MSA §3.8",quote:"\"Supplier shall notify Lilly of any Adverse Event or Product Complaint of which it becomes aware within one (1) business day.\"",days:0,consequence:"Regulatory violation; potential FDA action",type:"Compliance",status:"Active"},
    {what:"Confidentiality breach notification",who:"Supplier A",when:"Within 24 hours of awareness",src:"MSA §10.4",quote:"\"Supplier shall notify Lilly within twenty-four (24) hours of discovering any unauthorized access to Confidential Information.\"",days:0,consequence:"Lilly unable to mitigate; potential regulatory/reputational harm",type:"Notice Period",status:"Active"},
    {what:"Privacy Communication forwarding",who:"Supplier A",when:"Within 72 hours",src:"SPS §3.3",quote:"\"Supplier shall forward any Privacy Communication received from a data subject to Lilly within seventy-two (72) hours of receipt.\"",days:0,consequence:"Failure to comply with data subject rights",type:"Compliance",status:"Active"},
    {what:"Personal Data Breach notification",who:"Supplier A",when:"Within 72 hours of discovery",src:"SPS §3.5",quote:"\"Supplier shall notify Lilly without undue delay, and in no event later than seventy-two (72) hours, after becoming aware of a Personal Data Breach.\"",days:0,consequence:"Regulatory violation; Supplier A bears all breach costs",type:"Notice Period",status:"Active"},
    {what:"Anti-corruption training + evidence",who:"Supplier A",when:"Within 90 days of execution, then annually",src:"MSA §7.2",quote:"\"Supplier shall complete anti-corruption training and provide evidence of completion within ninety (90) days of the Effective Date and annually thereafter.\"",days:90,consequence:"Compliance gap; potential FCPA exposure",type:"Compliance Certification",status:"Active"},
    {what:"Diversity purchasing report",who:"Supplier A",when:"Quarterly (within 25 days of request, max 1/quarter)",src:"MSA §8.1",quote:"\"Supplier shall provide a diversity purchasing report within twenty-five (25) days of Lilly's request, not more than once per quarter.\"",days:95,consequence:"Not specified",type:"SLA Reporting",status:"Active"},
    {what:"MSA renewal notice",who:"Lilly",when:"30 days prior to term/renewal expiration (MSA expires Jul 1, 2029)",src:"MSA §1.2",quote:"\"Either party may decline renewal by providing written notice at least thirty (30) days prior to the end of the then-current Term.\"",days:1103,consequence:"MSA expires; WOs survive independently but no new WOs",type:"Renewal Window",status:"Future (2029)"},
    {what:"Insurance certificate",who:"Supplier A",when:"Upon Lilly request",src:"MSA §16.10",quote:"\"Supplier shall furnish a certificate of insurance evidencing the coverage required herein promptly upon Lilly's request.\"",days:9000,consequence:"Lilly cannot verify coverage; potential uninsured exposure",type:"Insurance Requirement",status:"On Demand"},
    {what:"Audit cooperation",who:"Supplier A",when:"10 business days advance notice, max 1/year",src:"MSA §11.4",quote:"\"Lilly may audit Supplier's records and facilities upon ten (10) business days' notice, not more than once annually absent cause.\"",days:365,consequence:"Corrective action plan within 30 days of findings",type:"Audit Right",status:"Annual"},
    {what:"Data return/destruction post-termination",who:"Supplier A",when:"Within 90 days of WO termination",src:"Exhibit B §11.4",quote:"\"Supplier shall return or destroy all Lilly Information within ninety (90) days of termination or expiration of the applicable Work Order.\"",days:9500,consequence:"Lilly cannot recover data; Supplier A cannot refuse return regardless of disputes",type:"Data Obligation",status:"At Termination"},
    {what:"Record retention post-MSA",who:"Supplier A",when:"1 year after MSA Term expires; 90-day destruction notice",src:"MSA §11.3",quote:"\"Supplier shall retain records for one (1) year following expiration of the Term and shall provide ninety (90) days' notice prior to destruction.\"",days:9999,consequence:"Lilly may request delivery instead of destruction",type:"Data Obligation",status:"Post-Term"},
    {what:"Deliver up to 12 Insight Sessions",who:"Supplier A",when:"Annually, mutually agreeable dates",src:"WO §1.1",quote:"\"Supplier will deliver up to twelve (12) Insight Sessions annually on dates mutually agreed by the parties.\"",days:180,consequence:"Not specified (no minimum; 'up to' qualifier)",type:"Milestone Deliverable",status:"Active"},
    {what:"SFTP/API integration setup",who:"Supplier A",when:"Not specified (no target date)",src:"WO §1.3",quote:"\"Supplier will establish SFTP and API connectivity to the telephony platforms identified in Table 2.\"",days:9200,consequence:"Not specified",type:"Milestone Deliverable",status:"Missing Timeline"},
    {what:"Payment: First 4 months",who:"Lilly",when:"At contract execution",src:"WO Table 2",quote:"\"Lilly will remit payment for the first four (4) months of service upon execution of this Work Order.\"",days:0,consequence:"Not specified",type:"Payment Deadline",status:"At Execution"},
    {what:"Payment: Remaining 8 months",who:"Lilly",when:"Aug/Sep 2026",src:"WO Table 2",quote:"\"Lilly will remit payment for the remaining eight (8) months of service in August/September 2026.\"",days:95,consequence:"Not specified",type:"Payment Deadline",status:"Aug/Sep 2026"},
    {what:"TfC notice to Supplier A",who:"Lilly",when:"120 days before desired termination",src:"MSA §13.4",quote:"\"Lilly may terminate for convenience upon one hundred twenty (120) days' prior written notice to Supplier.\"",days:8800,consequence:"Lilly liable for unused SaaS remainder up to 12 months",type:"Notice Period",status:"If Needed"},
  ],

  // ── Document family register (Documents sub-tab) ──
  docs:[
    {name:"Master Services Agreement (MPT 5.0)",type:"MSA",status:"Executed",date:"Jun 7, 2024",value:null,owner:"Legal AIPC",folder:"Contracts / Executed / 2024"},
    {name:"Exhibit A - Definitions",type:"Exhibit",status:"Executed",date:"Jun 7, 2024",value:null,owner:"Legal AIPC",folder:"Contracts / Executed / 2024"},
    {name:"Exhibit B - SaaS Terms",type:"Exhibit",status:"Executed",date:"Jun 7, 2024",value:null,owner:"Legal AIPC",folder:"Contracts / Executed / 2024"},
    {name:"Exhibit C - AI Standard Addendum",type:"Exhibit",status:"Executed",date:"Jun 7, 2024",value:null,owner:"Legal AIPC",folder:"Contracts / Executed / 2024"},
    {name:"Supplier Privacy Standard Exhibit A",type:"Addendum",status:"Executed",date:"Jun 7, 2024",value:null,owner:"Privacy Office",folder:"Contracts / Executed / 2024"},
    {name:"Work Order 9: Conversational Intelligence (prior term)",type:"WO",status:"Executed",date:"Jun 2, 2025",value:"$583,200/yr",owner:"Marc Lane (Procurement)",folder:"Contracts / Executed / 2025"},
    {name:"Work Order 10: Conversational Intelligence (this review)",type:"WO",status:"Under Review",date:"Drafted May 20, 2026",value:"$617,953/yr",owner:"Marc Lane (Procurement)",folder:"Sourcing / Bids"},
    {name:"SOC 2 Type II Report",type:"Compliance Evidence",status:"Filed",date:"Mar 2026",value:null,owner:"Cyber ISS",folder:"Reviews"},
    {name:"ISS Security Questionnaire",type:"Compliance Evidence",status:"Filed",date:"Apr 2026",value:null,owner:"Cyber ISS",folder:"Reviews"},
    {name:"W-9",type:"Compliance Evidence",status:"Filed",date:"Jun 2024",value:null,owner:"AP / Vendor Master",folder:"Reviews"},
    {name:"Data Escrow Decision Memo",type:"Risk & Deviation Approval",status:"Draft",date:"May 2026",value:null,owner:"Cyber ISS Review",folder:"Risk & deviation approvals"},
    {name:"Invoice batch Q2 FY26",type:"Invoice",status:"Filed",date:"Apr 2026",value:"$205,984",owner:"Accounts Payable",folder:"Sourcing / Bids"},
  ],

  // ── Compliance evidence checklist: fixed required-evidence list vs what is actually filed (Documents sub-tab) ──
  requiredEvidence:[
    {item:"W-9",gate:"Vendor Master / Payment Setup"},
    {item:"SOC 2 Type II Report",gate:"Cyber ISS Sign-off"},
    {item:"ISS Security Questionnaire",gate:"Cyber ISS Sign-off"},
    {item:"Data Escrow Decision Memo",gate:"Cyber ISS Sign-off"},
    {item:"SCC / Transfer Impact Assessment (TIA)",gate:"Privacy Office Sign-off"},
    {item:"Data Residency Screen",gate:"Privacy Office Sign-off"},
    {item:"Risk Acceptance Memo",gate:"Risk & Deviation Approval"},
  ],

  tactics:[
    {cat:"Pricing Integrity",s:"FLAG",note:"Multi-layer discount (40-60% line + 30% blanket) obscures true list-to-net"},
    {cat:"Deliverable Ambiguity",s:"FLAG",note:"Missing volume period; 'up to' on sessions"},
    {cat:"Timeline Manipulation",s:"FLAG",note:"June 15 deadline for 30% discount"},
    {cat:"Resource Substitution",s:"CLEAR",note:""},
    {cat:"Responsibility Shifting",s:"FLAG",note:"Broad SLA exclusions shift availability risk to Lilly"},
    {cat:"Hidden Recurring Costs",s:"FLAG",note:"Enterprise Success $115K: may overlap with MSA-baseline support obligations"},
    {cat:"Contractual Conflicts",s:"FLAG",note:"Contradictory expense language; annual prepay vs Net-60 MSA terms"},
    {cat:"Compliance/Security Gaps",s:"CLEAR",note:"MSA exhibits comprehensive"},
    {cat:"Dependency Inflation",s:"CLEAR",note:""},
    {cat:"Hidden Scope Reduction",s:"CLEAR",note:""},
    {cat:"Approval Manipulation",s:"CLEAR",note:""},
    {cat:"Effort Padding",s:"CLEAR",note:"Fixed-price SaaS, not T&M"},
  ],

  // ── PLAYBOOK: per-term with arguments, pushback, rebuttal, personas ──
  playbook:[
    { term:"Volume period (15,000/month)",
      pos:"Restore 'per month.' Confirm $617,953 covers 180K calls/year.",
      args:["Tracked deletion of 'month' in document XML confirms original intent.","Per-unit economics ($3.43/call) only work at monthly volume.","Entitlement verification is blocked without this clarification."],
      push:"None expected. This is an editing error.",
      reb:"N/A",
      fall:"If Supplier A claims a different period, request per-call rate card to recalculate.",
      personas:{
        Standard:"The volume period appears to have been inadvertently deleted during editing. Please confirm this should read 'per month' so we can verify entitlements.",
        Collaborative:"We noticed the volume period dropped out during drafting. Could we confirm it should read 'per month'? That way we're both working from the same entitlement basis.",
        Aggressive:"The entitlement clause is incomplete. Insert 'per month' after 'recorded calls per.' We cannot evaluate pricing without a defined volume period.",
        Curious:"We see '15,000 recorded calls per' without a unit period. Can you clarify what was intended? We want to make sure our per-unit economics are aligned with your pricing model.",
        Astonished:"We're surprised the volume period is missing from the entitlement clause. This is a fundamental pricing term. We assume this should read 'per month' based on the deleted text we found, but need your confirmation."
      }
    },
    { term:"SLA: restore MSA Exhibit B defaults",
      pos:"99.50% monthly uptime, 5% credit below that, material breach at <98% for 3/12 months. Exclusions limited to MSA Force Majeure (§17).",
      args:["The MSA SaaS Exhibit (§5.1, §7.4) sets these as the default framework.","98% annual allows individual months to drop far below without triggering credits.","The exclusion list is broader than MSA Force Majeure and could excuse most downtime events.","'Third-party acts' exclusion is a catch-all that could encompass cloud provider outages Supplier A should own."],
      push:"Our infrastructure can't guarantee 99.5%. The 98% annual is realistic for our platform. The exclusions are standard.",
      reb:"The exclusions in the MSA SaaS Exhibit Section 5.2 already address legitimate carve-outs. If infrastructure constraints exist, let's discuss 99.0% monthly as a compromise, but annual measurement and the broad exclusion list are not acceptable.",
      fall:"99.0% monthly (not annual). Narrow exclusions to FM only. Retain material breach trigger at <98% for 3/12.",
      acc:"67% (industry standard for SaaS, N=42)",
      personas:{
        Standard:"The proposed SLA departs from our MSA SaaS Exhibit framework. We require monthly measurement at 99.50% with exclusions limited to Force Majeure per MSA Section 17.",
        Collaborative:"We'd like to align the SLA with our existing MSA framework, which both parties agreed to. Could we work together to find a threshold that's realistic for your infrastructure while maintaining monthly measurement?",
        Aggressive:"This SLA is unacceptable. It drops 150 basis points from our agreed MSA framework and shifts to annual measurement that masks individual bad months. Restore Exhibit B Section 7.4 defaults.",
        Curious:"Can you help us understand why the SLA was set at 98% annual rather than using the MSA SaaS Exhibit framework? Is there an infrastructure constraint we should be aware of?",
        Astonished:"We're quite surprised to see the SLA set at 98% annually when our MSA SaaS Exhibit establishes 99.50% monthly as the baseline. This is a significant departure from the framework we negotiated."
      }
    },
    { term:"HITL training: Lilly-only models",
      pos:"All HITL and Supervised Training on Lilly Content improves only Client-Dedicated Models per Addendum A. No Lilly Content used for General Use Models.",
      args:["AI Standard §3.5 already bars Lilly Content as Supplier Training Content.","Definition trace: call recordings = Lilly Information (A.1.19), not Usage Data (A.1.37). Usage Data explicitly excludes Lilly Information.","Addendum A discloses General Use Models trained on 'anonymized pool including a wide range of healthcare interactions.' Lilly data must not flow there.","A one-line confirmation costs nothing if Supplier A already complies."],
      push:"Human labels are 'Usage Data' under A.1.37 that we can use to improve the platform.",
      reb:"Usage Data is defined as 'usage and operations data...including query logs and metadata' and explicitly excludes Lilly Information. Human labels derived from reviewing Lilly call recordings are derived from Lilly Content, not operational telemetry. The definition trace is unambiguous.",
      fall:"None. This is a compliance position under the executed AI Standard.",
      acc:"43% (N=28, emerging clause)",
      personas:{
        Standard:"Per AI Standard Section 3.5, Lilly Content cannot be used as Supplier Training Content. Please add a clause confirming HITL feedback from Lilly data improves only Client-Dedicated Models.",
        Collaborative:"We want to make sure both parties are comfortable with how HITL training data flows. Our AI Standard requires that Lilly Content only improve Lilly-dedicated models. Could we add a brief clause confirming this is already your practice?",
        Aggressive:"The AI Standard is clear: Lilly Content is not Supplier Training Content. The HITL section must explicitly restrict training feedback to Client-Dedicated Models. This is non-negotiable.",
        Curious:"The HITL section describes improving 'model accuracy' but doesn't specify which models. Can you confirm whether HITL feedback from Lilly data flows only to our dedicated models, or also to your general platform models?",
        Astonished:"We're concerned that the HITL description doesn't distinguish between your General Use Models and Client-Dedicated Models. Given that our AI Standard explicitly bars use of Lilly Content for supplier training, this omission is surprising."
      }
    },
    { term:"Prepay/TfC: pro-rata refund",
      pos:"If Lilly exercises TfC, pro-rata refund of prepaid unused fees.",
      args:["MSA §13.4 says Lilly liable for unused SaaS remainder up to 12 months, so prepaid fees may be unrecoverable.","Annual prepay of $617,953 combined with TfC liability creates maximum financial exposure.","MSA §4.4 is Net-60; annual prepay deviates from standard payment terms."],
      push:"The 30% discount is the consideration for annual prepay. Can't have the discount and the refund.",
      reb:"Then let's discuss quarterly billing at a reduced discount (e.g., 20%) that preserves some savings while eliminating the prepay/TfC exposure.",
      fall:"Quarterly billing at 20% discount instead of 30%. Eliminates prepay risk.",
      acc:"55% (N=31)",
      personas:{
        Standard:"Annual prepayment combined with MSA Section 13.4 creates up to $617,953 in unrecoverable exposure on termination for convenience. We require either a pro-rata refund clause or quarterly billing.",
        Collaborative:"We'd like to find a structure that works for both sides. The annual prepay creates a TfC exposure we need to manage. Would quarterly billing with an adjusted discount be workable?",
        Aggressive:"We will not prepay $617,953 without a refund mechanism on early termination. Either add a pro-rata refund clause or switch to quarterly billing.",
        Curious:"How does annual prepayment interact with the TfC provisions in our MSA? We want to understand whether prepaid fees are recoverable if we exercise termination for convenience.",
        Astonished:"We're surprised the WO requires annual prepayment given that our MSA establishes Net-60 payment terms. Combined with the TfC provisions, this creates significant unrecoverable exposure."
      }
    },
    { term:"Custom model ownership",
      pos:"Explicit WO clause: all custom models trained on Lilly data = Work Product (MSA §9.1.2) + Lilly Trained Models (AI Standard §15), owned by Lilly, with export and deletion obligations.",
      args:["MSA already assigns Work Product; the ask is clarification, not a new right.","In SaaS context, models run on vendor infrastructure, making explicit ownership language important for portability.","AI Standard §15 independently assigns Lilly Automated Property to Lilly."],
      push:"Our platform doesn't support model export. The models are embedded in our infrastructure.",
      reb:"Understood, but ownership and export are separate questions. We need ownership confirmed now; export mechanics can be addressed in a technical addendum. At minimum, deletion at termination must be confirmed.",
      fall:"Written email confirmation that custom models are Work Product under §9.1.2, without WO language. Deletion at termination confirmed.",
      trade:"Concede Insight Sessions minimum (#11) or June 15 deadline (#8).",
      acc:"61% (N=35)",
      personas:{
        Standard:"Please add a clause confirming that Custom Classifiers, Custom Quality Models, and Custom autoscoring models trained on Lilly data are Work Product per MSA Section 9.1.2 and Lilly Trained Models per AI Standard Section 15.",
        Collaborative:"We think both parties would benefit from explicit clarity on custom model ownership. Our MSA already addresses this through the Work Product assignment, so this is really just making the implicit explicit.",
        Aggressive:"Custom models trained on Lilly data are Lilly property under two independent assignment clauses. Add explicit confirmation to the WO.",
        Curious:"Can you describe how custom models trained on our data are managed in your infrastructure? We want to understand the ownership and portability picture so we can align the WO language.",
        Astonished:"We're surprised there's no ownership clause for the custom models, given that both our MSA and AI Standard independently assign these to Lilly."
      }
    },
    { term:"AE detection at scale",
      pos:"Configure AE/product complaint classifier. Flag potential AEs within 1 business day. Quarterly accuracy reporting.",
      args:["At 180K calls/year, even 0.1% AE rate = 180 potential AE conversations.","5% false negative rate = 9 missed AEs per year at that volume.","MSA §3.8 covers reactive reporting; this is proactive screening at AI scale."],
      push:"Our AI models aren't trained for AE detection. That would require new development.",
      reb:"Your topic classification models already identify 'fulfillment barriers' and 'competitive intel.' Configuring a flag for safety-related language patterns is comparable scope. We're not asking for a medical-grade diagnostic; we need a screening flag that routes calls to human PV review.",
      fall:"Quarterly report on potential AE/PC flags surfaced by existing topic models, without a dedicated classifier SLA.",
      trade:"Concede June 15 deadline (#8).",
      acc:"38% (N=22, pharma-specific)",
      personas:{
        Standard:"Given the volume of healthcare conversations processed (180K/year), we need an AE detection process. Please configure a classifier to flag potential adverse event signals and route them within 1 business day.",
        Collaborative:"We'd like to work together on an approach to AE detection that fits within your existing model architecture. At 180K calls per year, proactive screening would benefit both parties from a compliance standpoint.",
        Aggressive:"At 180K calls/year with patient and HCP conversations, proactive AE detection is a regulatory necessity. Add a classifier with quarterly accuracy reporting.",
        Curious:"Your AI models classify by sentiment, theme, and quality. Have you considered whether those models could also flag potential adverse event signals? At our call volume, this would be valuable for pharmacovigilance.",
        Astonished:"We're struck that a healthcare-specific AI platform processing 180K patient/HCP calls per year doesn't include adverse event detection as a standard feature."
      }
    },
    { term:"June 15 discount deadline extension",
      pos:"Extend the 30% discount through Lilly's approval cycle.",
      args:["$264,837 discount is significant and worth preserving.","The deadline compresses FRAP and review timelines."],
      push:"This is an end-of-quarter offer. We can't hold pricing indefinitely.",
      reb:"We're committed to closing promptly. A 30-day extension from today gives both sides time to finalize without compressing quality review.",
      fall:"Accept June 15 if all other items can be resolved in a single round.",
      acc:"72% (N=18)",
      personas:{
        Standard:"We request extending the 30% discount deadline to allow completion of our review and approval process.",
        Collaborative:"We're eager to close quickly and preserve the discount. Could we extend the deadline by 30 days to ensure both parties can complete their review processes?",
        Aggressive:"The June 15 deadline is artificial. Extend the discount through our approval cycle or we will evaluate the deal at the undiscounted price.",
        Curious:"Can you help us understand the constraint behind the June 15 deadline? Is there flexibility if we can commit to executing within a defined window?",
        Astonished:"We're surprised by a hard deadline that could force us to choose between a thorough review and a $264,837 discount. We'd expect more flexibility in a mature partnership."
      }
    },
  ],

  sequencing:[
    {round:"Round 1: Collaborative alignment",c:POS,bg:OK,
      goal:"Resolve all items in a single collaborative exchange",
      items:["Lead with volume period fix (#1) as goodwill/editing correction.","Present SLA restoration (#2) as 'aligning with our MSA framework we already agreed to.'","Present HITL clause (#3) as 'clarifying the AI Standard both parties executed.'","Concede June 15 deadline (#8) immediately to signal flexibility and urgency to close.","Request acceptance criteria (#9) and migration plan (#7).","Raise prepay/TfC issue (#4): offer quarterly billing at 20% as alternative."],
      risk:"Low. Most items are error corrections or MSA alignment, not new asks."},
    {round:"Round 2: Deploy fallbacks if needed",c:AMB,bg:WARM,
      goal:"Close remaining items with calibrated fallbacks",
      items:["If SLA resisted: offer 99.0% monthly (do NOT accept annual measurement or broad exclusions).","If custom model ownership resisted: accept email confirmation instead of WO clause.","Trade Insight Sessions minimum (#11) for AE detection process (#6).","If prepay/TfC resisted: accept quarterly billing at reduced discount as compromise."],
      risk:"Low-Medium. If Round 1 is collaborative, Round 2 should be cleanup only."},
  ],

  smes:[
    {name:"Legal AIPC / Privacy Contracts",email:"Mailbox_Privacy_Contracts@lilly.com",topic:"AI Standard §3.5 interpretation: HITL training data use",urgency:"Standard",
      brief:"Supplier A processes ~180K Lilly Direct calls/year using proprietary AI. Their AI Standard disclosure (Exhibit C Addendum A) describes three model types: General Use (cross-client), Client-Dedicated (Lilly-specific), and External Dataset. The WO HITL section describes training to 'improve model accuracy' without specifying which models. Definition trace shows call data is Lilly Content (not Usage Data per A.1.37 explicit exclusion), so §3.5 bars its use as Supplier Training Content. We plan to add a WO clause restricting HITL to Client-Dedicated Models only. Please confirm our interpretation is correct and review the proposed clause language.",
      asks:["Confirm AI Standard §3.5 interpretation re: HITL training data classification","Review proposed HITL restriction clause language","Advise whether Addendum A disclosure is sufficient or needs amendment"]},
    {name:"Contracts COE (or affiliate escalation path)",email:"",topic:"TfC/prepay exposure: pro-rata refund vs quarterly billing",urgency:"Standard",
      brief:"WO 10 requires annual prepayment of $617,953 ($205,984 at execution + $411,969 Aug/Sep). The 30% discount ($264,837) is conditioned on annual prepay. MSA §13.4 states that on TfC for SaaS subscriptions, Lilly remains liable for unused remainder up to 12 months. Combined with prepayment, up to $617,953 may be unrecoverable if Lilly terminates for convenience. MSA §4.4 standard payment terms are Net-60; annual prepay deviates. Two paths: (1) add a pro-rata refund clause for unused prepaid fees on TfC, or (2) switch to quarterly billing at a reduced discount (~20%). Please advise on preferred approach.",
      asks:["Advise on pro-rata refund clause vs quarterly billing for TfC exposure","Confirm whether annual prepay deviation from Net-60 needs additional approval"]},
    {name:"Cyber ISS Review",email:"Cyber_ISS_Review@lilly.com",topic:"Data escrow decision; SFTP/API integration security review",urgency:"Standard",
      brief:"WO 10 involves SFTP/API file transfer of Lilly Direct call recordings to Supplier A's Azure-hosted platform (Central US, East US, East US 2). The WO checked 'No' on data escrow. Given the volume (180K calls/year with patient/HCP/caregiver conversations), please confirm: (1) data escrow decision is appropriate, and (2) SFTP/API integration meets ISS requirements.",
      asks:["Confirm data escrow 'No' is appropriate for this scope","Review SFTP/API integration security posture"]},
  ],

  pricing:{pre:882790,disc:264837,net:617953,
    components:[{n:"Platform (Insights+Quality)",v:49340,p:"5.6%"},{n:"AI Compute (Insights+Quality)",v:670800,p:"76.0%"},{n:"Professional Services",v:162650,p:"18.4%"},{n:"30% Discount",v:-264837,p:"-30.0%"}],
    waterfall:[
      {layer:"Gross list (implied)",val:"~$1.96M",note:"Estimated from stated 40-60% line-item discounts"},
      {layer:"Layer 1: Line-item discounts (40-60%)",val:"-~$1.08M",note:"Applied per line; waived items ($0) absorb cost into remaining lines"},
      {layer:"Subtotal after Layer 1",val:"$882,790",note:"Sum of discounted line items"},
      {layer:"Layer 2: Blanket 30%",val:"-$264,837",note:"Conditioned on annual prepay + June 15 execution"},
      {layer:"Net annual",val:"$617,953",note:"Final price after all layers"},
    ],
    counter:[
      ["Confirm 'per month' volume","Entire pricing basis unverifiable without it","Must-have"],
      ["Pro-rata TfC refund or quarterly billing","Up to $617,953 unrecoverable on early termination","High"],
      ["Remove/extend June 15 deadline","$264,837 at risk if review takes longer","Med"],
      ["Separate Enterprise Success from baseline MSA support","$115,154 may overlap with MSA-standard obligations","Med"],
      ["Quarterly billing at ~20% discount","Reduces prepay risk while preserving savings","Med"],
    ],
  },
};

// ── Evidence gate status: checks the fixed required-evidence list against the actual document register. Never marks Filed without a matching doc. ──
const evidenceStatus=(item)=>{
  const match=D.docs.find(d=>d.name.toLowerCase().indexOf(item.toLowerCase())>=0 || item.toLowerCase().indexOf(d.name.toLowerCase())>=0);
  if(!match) return "Awaiting";
  if(match.status==="Draft") return "Draft";
  if(match.status==="Filed"||match.status==="Executed") return "Filed";
  return "Pending";
};
const EV_STATUS_COLOR={Filed:POS,Draft:AMB,Pending:AMB,Awaiting:R};

// ── PERSONA LABELS ──
const PERSONAS = ["Standard","Collaborative","Aggressive","Curious","Astonished"];
const PERSONA_COLORS = {Standard:DK,Collaborative:POS,Aggressive:R,Curious:BLU,Astonished:PUR};

// ── MAIN COMPONENT ──
export default function Dashboard(){
  const [panel,setPanel]=useState("review");
  const [sub,setSub]=useState({review:"Overview",legal:"Strategy",commercial:"Cost Build"});
  const [persona,setPersona]=useState("Standard");
  const [obSort,setObSort]=useState("party");
  const [docView,setDocView]=useState("list");
  const setS=(p,t)=>setSub(prev=>({...prev,[p]:t}));

  return(
  <div style={{fontFamily:"Arial,sans-serif",background:BG,minHeight:"100vh",color:DK}}>
    {/* ── HEADER ── */}
    <div style={{background:DK,padding:"16px 24px",borderLeft:`4px solid ${R}`}}>
      <div style={{fontSize:11,fontWeight:700,color:R,letterSpacing:1.5,textTransform:"uppercase"}}>Lilly Contract Review: Work Order</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:22,color:W,marginTop:4}}>{D.supplier} - {D.doc}</div>
      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
        <Badge t="MSA VERIFIED" bg={POS}/><Badge t="AI STANDARD" bg={BLU}/><Badge t="SPS VERIFIED" bg={POS}/>
        <span style={{fontSize:12,color:LT,marginLeft:8}}>{D.value} | {D.term} | May 25, 2026</span>
      </div>
    </div>

    {/* ── PANEL NAV ── */}
    <div style={{display:"flex",gap:0,background:W,borderBottom:`2px solid ${BD}`,paddingLeft:24}}>
      {[["review","Contract Review"],["legal","Legal Negotiation"],["commercial","Commercial Analysis"]].map(([id,l])=>
        <button key={id} onClick={()=>setPanel(id)} style={{padding:"12px 24px",border:"none",borderBottom:panel===id?`3px solid ${R}`:"3px solid transparent",background:"none",fontFamily:"Georgia,serif",fontSize:15,fontWeight:panel===id?700:400,color:panel===id?DK:MUT,cursor:"pointer"}}>{l}</button>
      )}
    </div>

    <div style={{maxWidth:980,margin:"0 auto",padding:"20px 24px"}}>

    {/* ═══════════ PANEL 1: CONTRACT REVIEW ═══════════ */}
    {panel==="review"&&<>
      <Sub tabs={["Overview","Risk Heatmap","Findings","Protection & Coverage","Obligations","Vendor Tactics","Documents"]} active={sub.review} set={t=>setS("review",t)}/>

      {sub.review==="Overview"&&<>
        <KPI items={[[D.value,"Annual Value",DK],[D.hardStops,"Hard Stops",POS],["1-2","Est. Rounds",BLU]]}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:14,marginBottom:14}}>
          <Card border={gaugeColor(D.riskScore)} title="Protection Score">
            <Gauge value={D.riskScore}/>
          </Card>
          <Card border={BLU} title="Score Methodology" note="G9 formula, risk-scoring.md">
            <div style={{fontSize:12,color:MUT,lineHeight:1.7}}>
              Starts at 100 (no risk). Deducts by finding severity weighted against combined protection. 9 of 14 categories are Covered by the verified MSA (3 Confirm, 2 Gap), so most findings represent clarifications or restorations of existing MSA protections, not unprotected gaps. Zero Hard Stops. The 3 HIGH findings are: an editing error (volume period), an MSA-template restoration (SLA), and a compliance clarification (HITL/AI Standard). Total deductions: 36 points (see Risk Heatmap calculation), so 100 minus 36 equals 64.
              <br/><br/>
              MSA-governed findings carry reduced deductions because the MSA provides the fallback position (HIGH -3 to -5, MEDIUM -2 to -3, LOW -1); the five standalone findings have no MSA analog and so take the full Standalone-column ranges (HIGH -7 to -10, MEDIUM -4 to -6, LOW -2 to -3). Scale: 75-100 Low, 50-74 Moderate, 25-49 High, 0-24 Critical. This review lands in Moderate.
            </div>
          </Card>
        </div>
        <Callout bg={OK} bc={POS}>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,marginBottom:6}}>Go/No-Go: SIGN WITH MODIFICATIONS</div>
          <p style={{margin:0}}>WO 10 is commercially reasonable at $617,953/year ($3.43/call at 15K/month). Three high-risk items require resolution: (1) missing volume period, (2) SLA degraded 150 bps from MSA template, (3) HITL training data ambiguity under AI Standard. A fourth finding (annual prepay eroding TfC value) affects financial exposure. The MSA provides strong baseline protections: 9 of 14 categories Covered, 3 to Confirm, 2 with residual Gaps. Zero Hard Stops. Recommend resolving high-risk items and signing.</p>
        </Callout>
        <Card border={BLU} bg={CARD} title="Governing Agreement Status">
          <p style={{margin:0,fontSize:13,lineHeight:1.6}}>MSA (MPT 5.0, June 7, 2024) read in full. Exhibits A (Definitions), B (SaaS), C (AI Standard), SPS all incorporated and verified. This is WO 10, indicating a mature relationship. All definition traces completed: Lilly Information, Usage Data, Work Product, Lilly Content, Supplier Training Content, Lilly Trained Models, Automated System. Every finding in this review cross-references the governing documents.</p>
        </Card>
        <Section title="Conditions Before Signature"/>
        {["Restore missing volume period ('per month')","Restore SLA to MSA Exhibit B defaults (99.50% monthly)","Add HITL training data restriction per AI Standard §3.5","Resolve prepay/TfC exposure (pro-rata refund or quarterly billing)"].map((c,i)=>
          <div key={i} style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:6}}><Pill t={`${i+1}`} bg={R}/><span style={{fontSize:13}}>{c}</span></div>
        )}
      </>}

      {sub.review==="Risk Heatmap"&&<>
        <STable headers={["Category","Status","Source / Notes"]} rows={D.coverage.map(c=>[<b>{c.cat}</b>,<Pill t={c.s} bg={COV[c.s]||MUT}/>,<span style={{fontSize:12}}>{c.src}</span>])}/>
        <div style={{display:"flex",gap:16,marginTop:12}}>{[["HIGH",D.findings.filter(f=>f.t==="HIGH").length],["MEDIUM",D.findings.filter(f=>f.t==="MEDIUM").length],["LOW",D.findings.filter(f=>f.t==="LOW").length]].map(([t,n])=><div key={t} style={{flex:1,textAlign:"center",padding:12,background:W,borderRadius:8,border:`1px solid ${BD}`}}><div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:700,color:TIER[t]}}>{n}</div><div style={{fontSize:11,color:MUT}}>{t} RISK</div></div>)}</div>
        <Callout bg={CARD} bc={MUT}>
          <b>Severity vs. coverage read:</b> of the {D.findings.filter(f=>f.t==="HIGH").length} HIGH findings, only #2 (SLA) traces to one of the two true Gap categories (SLA/Performance); #3 (HITL) traces to a Confirm-level category (AI Governance) and #1 (volume period) is a WO-specific drafting issue with no MSA analog. Most MEDIUM findings are standalone WO terms (Delivery, Commercial) rather than absent MSA protection; #5 (model ownership) and #4 (prepay/TfC) both trace to Confirm-level categories (IP Ownership, Commitment). See the Covered/Confirm/Gap rollup on the Protection & Coverage sub-tab for the full 14-category picture.
        </Callout>
      </>}

      {sub.review==="Findings"&&<>
        {["HIGH","MEDIUM","LOW"].map(t=><div key={t}>
          <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:TIER[t],marginBottom:8,marginTop:16}}>{t} RISK ({D.findings.filter(f=>f.t===t).length})</div>
          {D.findings.filter(f=>f.t===t).map(f=><Card key={f.id} border={TIER[f.t]}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:4}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700}}>#{f.id}: {f.title}</span>
              <div><Pill t={f.t} bg={TIER[f.t]}/><Pill t={f.v?"VERIFIED":"ASSUMED"} bg={f.v?POS:AMB}/></div>
            </div>
            <div style={{fontSize:13,lineHeight:1.6,marginBottom:4}}><b>Evidence:</b> {f.ev}</div>
            <div style={{fontSize:13,lineHeight:1.6,marginBottom:4}}><b>MSA Cross-Ref:</b> {f.msa}</div>
            <div style={{fontSize:13,lineHeight:1.6,marginBottom:4}}><b>Impact:</b> {f.impact}</div>
            <div style={{fontSize:13,lineHeight:1.6,color:BLU}}><b>Action:</b> {f.action}</div>
            <div style={{fontSize:11,color:LT,marginTop:4}}>Category: {f.cat} | Location: {f.where}</div>
          </Card>)}
        </div>)}
      </>}

      {sub.review==="Protection & Coverage"&&<>
        <p style={{fontSize:13,color:MUT,marginBottom:12}}>Scored on COMBINED protection (MSA + Exhibits + WO). Per Anti-Drift Rule 9.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
          <div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              {["Covered","Confirm","Gap"].map(s=>{
                const n=D.coverage.filter(c=>c.s===s).length;
                return <div key={s} style={{flex:1,textAlign:"center",padding:12,background:W,borderRadius:8,border:`1px solid ${BD}`}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:700,color:COV[s]}}>{n}</div>
                  <div style={{fontSize:11,color:MUT}}>{s.toUpperCase()}</div>
                </div>;
              })}
            </div>
            <div style={{display:"flex",height:22,borderRadius:6,overflow:"hidden",border:`1px solid ${BD}`}}>
              {["Covered","Confirm","Gap"].map(s=>{
                const n=D.coverage.filter(c=>c.s===s).length;
                if(n===0) return null;
                const pct=Math.round(n/D.coverage.length*100);
                return <div key={s} title={`${s}: ${n} of ${D.coverage.length} (${pct}%)`} style={{flex:`${n} 0 0`,background:COV[s],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:W,fontWeight:700}}>{pct>=10?`${pct}%`:""}</div>;
              })}
            </div>
            <div style={{fontSize:11,color:MUT,marginTop:6}}>{D.coverage.length} categories assessed against the combined MSA + Exhibit + WO protection.</div>
          </div>
          <Callout bg={CARD} bc={BLU}>
            <b>Coverage posture:</b> {D.coverage.filter(c=>c.s==="Covered").length} of {D.coverage.length} categories ({Math.round(D.coverage.filter(c=>c.s==="Covered").length/D.coverage.length*100)}%) are fully Covered by the verified MSA and Exhibits, so most findings in this review are clarifications or restorations of existing protection rather than fresh gaps. {D.coverage.filter(c=>c.s==="Confirm").length} categories need a Confirm-level follow-up (AI Governance, IP Ownership, Commitment) before signature. Only {D.coverage.filter(c=>c.s==="Gap").length} categories (SLA/Performance, Flexibility) show a genuine Gap with no fallback in the governing documents, which is why those two drive a disproportionate share of the Protection Score deduction.
          </Callout>
        </div>
        <STable headers={["#","Category","Status","Governing Document Source"]} rows={D.coverage.map((c,i)=>[i+1,<b>{c.cat}</b>,<Pill t={c.s} bg={COV[c.s]||MUT}/>,<span style={{fontSize:12}}>{c.src}</span>])}/>
      </>}

      {sub.review==="Obligations"&&<>
        <p style={{fontSize:13,color:MUT,marginBottom:8}}>Extracted from WO 10 and governing MSA/Exhibits. Per Step 6.5 obligation extraction.</p>
        <KPI items={[
          [D.obligations.filter(o=>o.who==="Supplier A").length,"Supplier Obligations",AMB],
          [D.obligations.filter(o=>o.who==="Lilly").length,"Lilly Obligations",BLU],
          [D.obligations.filter(o=>o.who==="Both").length,"Mutual",MUT],
          [D.obligations.filter(o=>o.status==="Missing Timeline").length,"Missing Timeline",R],
        ]}/>

        <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Tracked Dates & Deadlines</div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
              {D.obligations.slice().sort((a,b)=>a.days-b.days).map((o,i)=>
                <div key={i} style={{flexShrink:0,minWidth:132,background:W,border:`1px solid ${BD}`,borderTop:`3px solid ${urgencyColor(o.days)}`,borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:urgencyColor(o.days)}}>{daysLabel(o.days)}</div>
                  <div style={{fontSize:11,fontWeight:600,marginTop:3,lineHeight:1.3}}>{o.what}</div>
                  <div style={{fontSize:10,color:LT,marginTop:3}}>{o.who}</div>
                </div>
              )}
            </div>
          </div>
          <Callout bg={CARD} bc={MUT}>
            <b>Deadline risk:</b> {D.obligations.filter(o=>o.days===0).length} obligations carry continuous, 1-2 business day compliance triggers (AE reporting, breach notice, privacy forwarding) that should be treated as always-live rather than calendar dates. The nearest fixed-calendar items are the anti-corruption training deadline and the Aug/Sep 2026 payment tranche, both roughly 90 days out. {D.obligations.filter(o=>o.days>=8000).length} obligations are open-ended or on-demand (insurance certificate, data return, TfC notice) and should be tracked as standing triggers, not dates. The furthest-dated item is the MSA renewal notice window ahead of the 2029 expiration.
          </Callout>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:700,color:MUT,textTransform:"uppercase"}}>Sort:</span>
          {[["party","By Party"],["date","By Date"]].map(([id,l])=>
            <button key={id} onClick={()=>setObSort(id)} style={{padding:"6px 14px",borderRadius:20,border:obSort===id?`2px solid ${BLU}`:`1px solid ${BD}`,background:obSort===id?BG:W,fontWeight:obSort===id?700:400,color:obSort===id?BLU:MUT,cursor:"pointer",fontSize:12}}>{l}</button>
          )}
        </div>

        {obSort==="party"?<>
        {D.obligations.filter(o=>o.who==="Supplier A").length > 0 && <Section title="Supplier Obligations"/>}
        <STable headers={["Obligation","When","Source","Consequence","Type"]}
          rows={D.obligations.filter(o=>o.who==="Supplier A").map(o=>[
            <span style={{fontWeight:600}}>{o.what}</span>,
            <span style={{fontSize:12}}>{o.when}</span>,
            <span><span style={{fontSize:12,color:BLU}}>{o.src}</span><div style={{fontSize:11,color:LT,fontStyle:"italic",marginTop:2}}>{o.quote}</div></span>,
            <span style={{fontSize:12}}>{o.consequence}</span>,
            <Pill t={o.type} bg={o.status==="Missing Timeline"?R:o.type==="Compliance"||o.type==="Notice Period"?AMB:POS}/>
          ])}/>
        <Section title="Lilly Obligations"/>
        <STable headers={["Obligation","When","Source","Consequence","Type"]}
          rows={D.obligations.filter(o=>o.who==="Lilly").map(o=>[
            <span style={{fontWeight:600}}>{o.what}</span>,
            <span style={{fontSize:12}}>{o.when}</span>,
            <span><span style={{fontSize:12,color:BLU}}>{o.src}</span><div style={{fontSize:11,color:LT,fontStyle:"italic",marginTop:2}}>{o.quote}</div></span>,
            <span style={{fontSize:12}}>{o.consequence}</span>,
            <Pill t={o.type} bg={o.type==="Payment Deadline"?AMB:POS}/>
          ])}/>
        </>:<>
        <STable headers={["Obligation","Who","When","Source","Type"]}
          rows={D.obligations.slice().sort((a,b)=>a.days-b.days).map(o=>[
            <span style={{fontWeight:600}}>{o.what}</span>,
            <Pill t={o.who} bg={o.who==="Supplier A"?AMB:BLU}/>,
            <span style={{fontSize:12}}>{o.when}</span>,
            <span><span style={{fontSize:12,color:BLU}}>{o.src}</span><div style={{fontSize:11,color:LT,fontStyle:"italic",marginTop:2}}>{o.quote}</div></span>,
            <Pill t={o.type} bg={o.status==="Missing Timeline"?R:o.type==="Compliance"||o.type==="Notice Period"?AMB:POS}/>
          ])}/>
        </>}

        <Callout bg={WARM} bc={AMB}>
          <b>Imbalance Analysis:</b> {D.obligations.filter(o=>o.who==="Supplier A").length} supplier obligations vs {D.obligations.filter(o=>o.who==="Lilly").length} Lilly obligations. Ratio is within normal range (no 3:1 imbalance flag). However, 1 supplier obligation has a missing timeline (SFTP/API setup) that should be addressed in acceptance criteria.
        </Callout>
        <Callout bg={RISK} bc={R}>
          <b>Missing Standard Obligations (Negotiation Gaps):</b> No SLA reporting cadence defined (SLA exists but no quarterly report obligation). No subcontractor notification for HITL personnel changes. No insurance certificate renewal trigger (on-demand only). Recommend adding SLA quarterly reporting to WO.
        </Callout>
      </>}

      {sub.review==="Vendor Tactics"&&<>
        <STable headers={["Category","Status","Triggering Text"]} rows={D.tactics.map(t=>[t.cat,<Pill t={t.s} bg={t.s==="FLAG"?AMB:POS}/>,t.note||<span style={{color:LT}}>None detected</span>])}/>
      </>}

      {sub.review==="Documents"&&<>
        <p style={{fontSize:13,color:MUT,marginBottom:8}}>Document family across the MSA + WO relationship, plus the compliance-evidence gate for this review. Sourced from SharePoint/OneDrive where connected; upload otherwise.</p>
        <KPI items={[
          [D.docs.length,"Documents in Family",DK],
          [D.docs.filter(d=>d.status==="Executed"||d.status==="Filed").length,"Executed / Filed",POS],
          [D.docs.filter(d=>d.status==="Draft"||d.status==="Under Review").length,"Draft / Under Review",AMB],
          [D.requiredEvidence.filter(e=>evidenceStatus(e.item)==="Awaiting").length,"Evidence Awaiting",R],
        ]}/>

        <Section title="Document Register"/>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {[["list","List"],["tree","Folder Tree"]].map(([id,l])=>
            <button key={id} onClick={()=>setDocView(id)} style={{padding:"6px 14px",borderRadius:20,border:docView===id?`2px solid ${BLU}`:`1px solid ${BD}`,background:docView===id?BG:W,fontWeight:docView===id?700:400,color:docView===id?BLU:MUT,cursor:"pointer",fontSize:12}}>{l}</button>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14,marginBottom:16}}>
          <div>
            {docView==="list"?
              <STable headers={["Document","Type","Status","Date","Value","Owner","Retention"]}
                rows={D.docs.map(d=>[
                  <span style={{fontWeight:600}}>{d.name}</span>,
                  <span style={{fontSize:12}}>{d.type}</span>,
                  <Pill t={d.status} bg={d.status==="Executed"||d.status==="Filed"?POS:d.status==="Draft"?AMB:d.status==="Under Review"?BLU:MUT}/>,
                  <span style={{fontSize:12}}>{d.date}</span>,
                  <span style={{fontSize:12}}>{d.value?d.value:<span style={{color:LT}}>-</span>}</span>,
                  <span style={{fontSize:12}}>{d.owner}</span>,
                  <span><Pill t={retentionClass(d.type)} bg={MUT}/><div style={{fontSize:10,color:LT,marginTop:2}}>Draft, confirm with records SME</div></span>,
                ])}/>
              :
              <div>
                {[...new Set(D.docs.map(d=>d.folder))].sort().map(folder=>
                  <div key={folder}>
                    <SubHead title={folder}/>
                    {D.docs.filter(d=>d.folder===folder).map((d,i)=>
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0 5px 14px",fontSize:12,borderBottom:`1px solid ${BD}`}}>
                        <span>{d.name}</span>
                        <span style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{color:LT}}>{d.date}</span>
                          <Pill t={d.status} bg={d.status==="Executed"||d.status==="Filed"?POS:d.status==="Draft"?AMB:d.status==="Under Review"?BLU:MUT}/>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          </div>
          <Callout bg={CARD} bc={BLU}>
            <b>Document family analysis:</b> {D.docs.filter(d=>d.status==="Executed"||d.status==="Filed").length} of {D.docs.length} documents in the family are executed or filed. WO 10 (this review) remains Under Review; the prior WO 9 term is fully executed, giving a clean continuation precedent. One Risk & Deviation Approval item, the data escrow decision memo, is still in Draft and should be finalized before WO 10 signature, since the SME Pre-Engagement brief to Cyber ISS Review depends on it. Retention classes are a draft lookup by document type; confirm against the records-retention schedule before relying on them.
          </Callout>
        </div>

        <Section title="Compliance Evidence Checklist"/>
        <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14}}>
          <STable headers={["Required Evidence","Status","Blocks"]}
            rows={D.requiredEvidence.map(e=>{
              const st=evidenceStatus(e.item);
              return [<span style={{fontWeight:600}}>{e.item}</span>,<Pill t={st} bg={EV_STATUS_COLOR[st]}/>,<span style={{fontSize:12}}>{e.gate}</span>];
            })}/>
          <Callout bg={RISK} bc={R}>
            <b>Evidence gate analysis:</b> {D.requiredEvidence.filter(e=>evidenceStatus(e.item)==="Awaiting").length} items are Awaiting (SCC/TIA, Data Residency Screen, Risk Acceptance Memo) and block Privacy Office and Risk & Deviation sign-off. The Data Escrow Decision Memo is Draft, blocking Cyber ISS sign-off, the same open item flagged in the SME Pre-Engagement brief on the Legal Negotiation panel. {D.requiredEvidence.filter(e=>evidenceStatus(e.item)==="Filed").length} items are Filed and clear. An item is never marked Filed without a matching document on record.
          </Callout>
        </div>
      </>}
    </>}

    {/* ═══════════ PANEL 2: LEGAL NEGOTIATION ═══════════ */}
    {panel==="legal"&&<>
      <Sub tabs={["Strategy","Playbook","Position Map","Concession Sequencing","SME Pre-Engagement"]} active={sub.legal} set={t=>setS("legal",t)}/>

      {sub.legal==="Strategy"&&<>
        <KPI items={[["Low","Difficulty",POS],["0","Red Lines",POS],[String(D.playbook.length),"Total Positions",DK],["1","Compliance Leverage (AI Std)",AMB]]}/>
        <Callout bg={WARM} bc={AMB}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,marginBottom:6}}>Opening Posture: Collaborative but Firm on MSA Alignment</div>
          <p style={{margin:0,fontSize:13,lineHeight:1.6}}>This is WO 10 under a mature MSA relationship. Frame all asks as "aligning the WO with our existing MSA framework," not as new demands. The SLA restoration and HITL clarification enforce protections already negotiated. The volume period is an editing error. Lead with that to build early agreement, concede the June 15 deadline to signal urgency, then address the substantive items. The AI Standard §3.5 position is the one item with compliance teeth; use it as leverage for the entire package.</p>
        </Callout>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
          {[["HOLD FIRM",D.playbook.filter(p=>!p.term.includes("June 15")&&!p.term.includes("Custom model")&&!p.term.includes("AE detection")).length,AMB,WARM],["TRADE",D.playbook.filter(p=>p.trade).length,GOLD,"#FFF8E1"],["CONCEDE",D.playbook.filter(p=>p.term.includes("June 15")).length,POS,OK],["RED LINE",0,R,RISK]].map(([l,n,c,bg])=>
            <div key={l} style={{background:bg,border:`2px solid ${c}`,borderRadius:8,textAlign:"center",padding:12}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:700,color:c}}>{n}</div>
              <div style={{fontSize:11,color:MUT}}>{l}</div>
            </div>
          )}
        </div>
      </>}

      {sub.legal==="Playbook"&&<>
        {/* PERSONA SELECTOR */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:700}}>Argument Tone:</span>
          {PERSONAS.map(p=><button key={p} onClick={()=>setPersona(p)} style={{padding:"6px 14px",borderRadius:20,border:persona===p?`2px solid ${PERSONA_COLORS[p]}`:`1px solid ${BD}`,background:persona===p?"#F8FAFC":W,fontWeight:persona===p?700:400,color:persona===p?PERSONA_COLORS[p]:MUT,cursor:"pointer",fontSize:12}}>{p}</button>)}
        </div>
        <p style={{fontSize:12,color:MUT,marginBottom:16}}>Each position below shows arguments, predicted supplier pushback, your rebuttal, and fallback. Toggle the tone above to see how the same position sounds in each persona. The substance never changes; only the framing.</p>

        {D.playbook.map((p,i)=><div key={i} style={{border:`1px solid ${BD}`,background:W,borderRadius:8,overflow:"hidden",marginBottom:14}}>
          <div style={{background:DK,color:W,fontFamily:"Georgia,serif",fontWeight:700,padding:"10px 16px",fontSize:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{p.term}</span>
            {p.acc&&<span style={{fontSize:11,background:"rgba(255,255,255,0.15)",padding:"2px 8px",borderRadius:10}}>{p.acc}</span>}
          </div>
          <div style={{padding:16,fontSize:13,lineHeight:1.6}}>
            {/* Persona-specific argument */}
            <div style={{background:"#F0F4FF",borderRadius:6,padding:"10px 14px",marginBottom:10,borderLeft:`4px solid ${PERSONA_COLORS[persona]}`}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:PERSONA_COLORS[persona],marginBottom:4}}>{persona} Tone</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{p.personas[persona]}</div>
            </div>

            <div style={{marginBottom:8}}><span style={{color:POS,fontWeight:700,textTransform:"uppercase",fontSize:10}}>Position: </span>{p.pos}</div>
            <div style={{marginBottom:8}}>
              <span style={{color:MUT,fontWeight:700,textTransform:"uppercase",fontSize:10}}>Arguments</span>
              {p.args.map((a,j)=><div key={j} style={{display:"flex",gap:6,marginTop:3}}><span style={{color:R,flexShrink:0}}>{'>'}</span><span>{a}</span></div>)}
            </div>
            <div style={{marginBottom:8}}><span style={{color:AMB,fontWeight:700,textTransform:"uppercase",fontSize:10}}>Likely Pushback: </span>{p.push}</div>
            <div style={{marginBottom:8}}><span style={{color:DK,fontWeight:700,textTransform:"uppercase",fontSize:10}}>Rebuttal: </span>{p.reb||"N/A"}</div>
            <div><span style={{color:LT,fontWeight:700,textTransform:"uppercase",fontSize:10}}>Fallback: </span>{p.fall}</div>
            {p.trade&&<div style={{marginTop:6,color:GOLD,fontSize:12}}><b>Trade against:</b> {p.trade}</div>}
          </div>
        </div>)}
      </>}

      {sub.legal==="Position Map"&&<>
        {[{tier:"HOLD FIRM",c:AMB,items:D.playbook.filter(p=>!p.trade&&p.fall!=="None. This is a compliance position under the executed AI Standard."&&!p.term.includes("June 15"))},
          {tier:"HOLD FIRM (Compliance)",c:R,items:D.playbook.filter(p=>p.fall&&p.fall.includes("compliance"))},
          {tier:"STRATEGIC TRADE",c:GOLD,items:D.playbook.filter(p=>p.trade)},
          {tier:"CONCEDE",c:POS,items:D.playbook.filter(p=>p.term.includes("June 15"))},
        ].filter(g=>g.items.length>0).map(g=><div key={g.tier}>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:g.c,marginBottom:8,marginTop:16}}>{g.tier} ({g.items.length})</div>
          {g.items.map((p,i)=><Card key={i} border={g.c}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:4}}>
              <span style={{fontWeight:700,fontSize:13}}>{p.term}</span>
              {p.acc&&<span style={{fontSize:11,color:LT}}>Acceptance: {p.acc}</span>}
            </div>
            <div style={{background:"#FAFAFA",borderRadius:4,padding:"7px 10px",marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:700,color:LT,textTransform:"uppercase"}}>Position</span>
              <div style={{fontSize:12,marginTop:2,lineHeight:1.5}}>{p.pos}</div>
            </div>
            {p.fall&&<div style={{background:g.tier.includes("CONCEDE")?OK:WARM,borderRadius:4,padding:"5px 10px",marginBottom:4}}>
              <span style={{fontSize:10,fontWeight:700,color:LT,textTransform:"uppercase"}}>Fallback</span>
              <div style={{fontSize:12,marginTop:2,lineHeight:1.5}}>{p.fall}</div>
            </div>}
            {p.trade&&<div style={{fontSize:12,color:GOLD}}><b>Trade:</b> {p.trade}</div>}
          </Card>)}
        </div>)}
      </>}

      {sub.legal==="Concession Sequencing"&&<>
        {D.sequencing.map((r,i)=><Card key={i} border={r.c}>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:r.c,marginBottom:8}}>{r.round}</div>
          <div style={{background:r.bg,borderRadius:4,padding:"6px 10px",marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:700,color:LT,textTransform:"uppercase"}}>Objective</span>
            <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{r.goal}</div>
          </div>
          {r.items.map((it,j)=><div key={j} style={{padding:"3px 0",fontSize:13,display:"flex",gap:6,lineHeight:1.5}}><span style={{color:r.c,fontWeight:700,flexShrink:0}}>{'>'}</span><span>{it}</span></div>)}
          <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid #F4F4F5"}}><span style={{fontSize:10,fontWeight:700,color:LT,textTransform:"uppercase"}}>Key risk</span><div style={{fontSize:12,color:MUT,marginTop:2}}>{r.risk}</div></div>
        </Card>)}
        <Callout bg={RISK} bc={R}>
          <b>BATNA / Escalation:</b> If Supplier A refuses SLA restoration and HITL clarification, escalate through Contracts COE (or your affiliate escalation path) to engage Erika Sylvester (Supplier A GC) directly. The AI Standard positions are contractually grounded and backed by Mailbox_Privacy_Contracts. No alternative vendor switching is contemplated; this is a continuation WO.
        </Callout>
      </>}

      {sub.legal==="SME Pre-Engagement"&&<>
        {D.smes.map((s,i)=><Card key={i} border={BLU}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:6}}>
            <div><div style={{fontWeight:700,fontSize:14}}>{s.name}</div><div style={{fontSize:12,color:BLU}}>{s.email}</div></div>
            <Badge t={s.urgency} bg={s.urgency==="Urgent"?R:MUT}/>
          </div>
          <div style={{fontSize:13,marginBottom:6}}><b>Topic:</b> {s.topic}</div>
          <div style={{fontSize:13,marginBottom:8,lineHeight:1.6}}>{s.brief}</div>
          <Section title="Specific Asks"/>
          {s.asks.map((a,j)=><div key={j} style={{display:"flex",gap:6,marginBottom:4,fontSize:13}}><span style={{color:BLU,fontWeight:700}}>{j+1}.</span><span>{a}</span></div>)}
        </Card>)}
      </>}
    </>}

    {/* ═══════════ PANEL 3: COMMERCIAL ANALYSIS ═══════════ */}
    {panel==="commercial"&&<>
      <Sub tabs={["Cost Build","Benchmarks","Counter-Proposal","Discount Architecture","Renewal Strategy"]} active={sub.commercial} set={t=>setS("commercial",t)}/>

      {sub.commercial==="Cost Build"&&<>
        <KPI items={[["$617,953","Annual Net",DK],["$3.43","Per Call (15K/mo)",BLU],["PASSED","Arithmetic",POS],["$617,953","TfC Exposure",R]]}/>
        <STable headers={["Component","Annual Cost","% of Total"]} rows={D.pricing.components.map(c=>[c.n,<span style={{fontWeight:600,color:c.v<0?POS:DK}}>{c.v<0?`-$${Math.abs(c.v).toLocaleString()}`:`$${c.v.toLocaleString()}`}</span>,c.p])}/>
        <Card border={BLU} title="Payment Structure">
          <div style={{fontSize:13,lineHeight:1.6}}>First 4 months (Twilio/Scriptly): $205,984 at execution. Remaining 8 months (Genesys/LSC): $411,969 Aug/Sep 2026. Proration verified (4/12 + 8/12). MSA payment terms are Net-60 (§4.4); annual prepay deviates from standard.</div>
        </Card>
        <Section title="Value at Risk"/>
        <STable headers={["Risk Category","$ Exposure","Notes"]} rows={[
          ["Prepay + TfC exposure","$617,953","Annual prepay; MSA §13.4 liability up to 12 mo"],
          ["Discount expiry (June 15)","$264,837","30% discount lost if execution slips"],
          ["Volume mismatch","Unquantifiable","Cannot calculate without confirmed volume period"],
          ["Migration service gap","TBD","No SLA or continuity guarantee for Twilio-to-Genesys cutover"],
        ]}/>
        <Section title="Assumptions Register"/>
        <STable headers={["#","Assumption","Risk if Broken","Bearer","Protection"]} rows={[
          ["1","Volume = 15K calls/month","Overpay if lower; no overage if higher","Lilly","None"],
          ["2","Telephony migration succeeds","Service gap, data loss","Shared","None"],
          ["3","Annual prepay + June 15","Lose $265K discount or lock $618K","Lilly","Conditional"],
          ["4","12 Insight Sessions delivered","Under-delivery","Lilly","'Up to' qualifier only"],
          ["5","AI model accuracy stable","Degraded insights, missed AEs","Lilly","No accuracy SLA"],
        ]}/>
      </>}

      {sub.commercial==="Benchmarks"&&<>
        <Callout bg={WARM} bc={AMB}><b>Benchmark Confidence: LOW.</b> Supplier A is private with no published pricing. Healthcare conversational intelligence is niche. External rates are estimates from public materials and may not reflect enterprise deals. Recommend commercial-negotiation-prep for primary market research if deeper benchmarking needed.</Callout>
        <STable headers={["Platform","Rate Range","Scope","Notes"]} rows={[
          ["Supplier A (this WO)","$3.43/call","Healthcare AI + HITL + 12 insight sessions + enterprise support","Assumes 15K/month"],
          ["CallMiner Eureka","$2.50-5.00/call","Generic contact center speech analytics","No healthcare AI, no HITL"],
          ["Observe.AI","$3.00-6.00/call","Agent assist + QA + coaching","No healthcare-specific models"],
          ["NICE CXone Analytics","$1.50-4.00/call","Volume-dependent, basic analytics tier","Enterprise pricing varies widely"],
          ["Verint Speech Analytics","$2.00-5.50/call","Enterprise analytics + compliance","Compliance focus, not healthcare AI"],
        ]}/>
        <p style={{fontSize:12,color:MUT}}>The $3.43/call rate is mid-range for enterprise speech analytics. The inclusion of 12 dedicated insight sessions ($47,496), HITL model management ($0 in WO), and enterprise support ($115,154) differentiates from pure SaaS analytics pricing. Comparable packages from competitors would likely price higher for equivalent scope.</p>
      </>}

      {sub.commercial==="Counter-Proposal"&&<>
        <STable headers={["Ask","Why It Matters / $ Impact","Priority"]} rows={D.pricing.counter.map(c=>[<b>{c[0]}</b>,c[1],<Pill t={c[2]} bg={c[2]==="Must-have"?R:c[2]==="High"?AMB:GOLD}/>])}/>
      </>}

      {sub.commercial==="Discount Architecture"&&<>
        <Section title="Discount Waterfall"/>
        {D.pricing.waterfall.map((w,i)=><div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"stretch"}}>
          <div style={{width:200,flexShrink:0,textAlign:"right",padding:"8px 12px",background:i===D.pricing.waterfall.length-1?DK:i===0?"#F8FAFC":CARD,color:i===D.pricing.waterfall.length-1?W:DK,borderRadius:6,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"flex-end"}}>{w.val}</div>
          <div style={{flex:1,padding:"8px 12px",background:W,border:`1px solid ${BD}`,borderRadius:6}}>
            <div style={{fontWeight:600,fontSize:13}}>{w.layer}</div>
            <div style={{fontSize:12,color:MUT,marginTop:2}}>{w.note}</div>
          </div>
        </div>)}
        <Callout bg={WARM} bc={GOLD}>
          <b>Leverage Insight:</b> Four discount layers totaling roughly 55% off implied list. This is aggressive discounting that suggests either market-entry pricing to deepen the Lilly relationship, or inflated list prices designed to make discounts look generous. Either way, it signals significant pricing flexibility. In a renewal or recompete, Lilly has room to push for deeper net discounts or to decouple the 30% from the execution date condition.
        </Callout>
      </>}

      {sub.commercial==="Renewal Strategy"&&<>
        <Card border={POS} title="Price Protection in Place">
          <div style={{fontSize:13,lineHeight:1.6}}>MSA Exhibit B §4.1: fees constant for 5 years (through June 2029). After that, increases capped at lesser of 5% or CPI. This WO falls entirely within the rate lock period. No escalation risk for this term.</div>
        </Card>
        <Card border={BLU} title="Governance Carry-Forward">
          <div style={{fontSize:13,lineHeight:1.6}}>If renewed (WO 11), carry forward: (1) HITL training data restriction, (2) restored SLA, (3) AE detection process, (4) explicit custom model ownership. Consider MSA amendment if relationship scales further.</div>
        </Card>
        <Card border={GOLD} title="Volume Optimization">
          <div style={{fontSize:13,lineHeight:1.6}}>Current flat rate does not incentivize volume growth. For renewal, negotiate tiered pricing: first 15K at current rate, 15K-25K at 85%, 25K+ at 75%. Align pricing with Lilly Direct's growth trajectory.</div>
        </Card>
        <Card border={MUT} title="Forward Lock Recommendations">
          <div style={{fontSize:13,lineHeight:1.6}}>Lock quarterly billing in WO 11 to eliminate prepay/TfC exposure. Add annual model accuracy review with minimum thresholds. Define migration SLA template for future telephony changes. Add SLA quarterly reporting as a standard WO provision.</div>
        </Card>
      </>}
    </>}

    </div>
    {/* ── FOOTER ── */}
    <div style={{background:DK,padding:"12px 24px",marginTop:32,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
      <div style={{fontSize:11,color:LT}}>Governing: MPT 5.0 MSA (Jun 7, 2024) + Exhibits A, B, C + SPS | Procurement guidance, not legal advice</div>
      <div style={{fontSize:11,color:LT}}>Eli Lilly and Company: Confidential | 2026 | lilly-contract-review canonical dashboard v3.2</div>
    </div>
  </div>);
}