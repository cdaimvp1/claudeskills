/**
 * Lilly Universal RFI/RFP Instructions Document Template Builder
 * 
 * Generates a DOCX with one unified structure. Optional sections toggled via flags.
 * 
 * Usage:
 *   node lilly_rfx_template.js --mode RFP --output /path/to/output.docx [flags]
 * 
 * Flags (all default to false unless specified):
 *   --mode RFP|RFI              Document type (required)
 *   --output PATH               Output file path
 *   --eval-criteria             Include Section 1.7 Evaluation Criteria
 *   --current-env               Include Section 2.1 Current Environment
 *   --data-integration          Include Section 2.4 Data & Integration Landscape
 *   --infosec                   Include Section 2.5 Information Security Requirements
 *   --diversity                 Include Section 2.6 Supplier Diversity Expectations
 *   --contracting               Include Section 3 Contracting & Commercial Principles
 *   --sla                       Include Section 3.3 Service Levels / Credits (requires --contracting)
 *   --demos                     Include Section 4 Presentation & Demo Guidance
 *   --demo-scenarios            Include Section 4.2 Demo Scenarios (requires --demos)
 *   --demo-questions            Include Section 4.3 Additional Questions (requires --demos)
 *   --all                       Include all optional sections
 * 
 * Smart defaults for --mode RFP: auto-enables --contracting --eval-criteria
 * Smart defaults for --mode RFI: no auto-enables
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, TabStopType, ImageRun
} = require("docx");

// --- CLI ---
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const param = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i+1] ? args[i+1] : null; };

let mode = (param("mode") || "RFP").toUpperCase();
let outputPath = param("output") || "/home/claude/lilly_rfx_template.docx";
const isRFP = mode === "RFP";
const docType = isRFP ? "RFP" : "RFI";
const all = flag("all");

// Smart defaults + explicit flags
const OPT = {
  evalCriteria:    all || flag("eval-criteria")    || isRFP,
  currentEnv:      all || flag("current-env"),
  dataIntegration: all || flag("data-integration"),
  infosec:         all || flag("infosec"),
  diversity:       all || flag("diversity"),
  contracting:     all || flag("contracting")      || isRFP,
  sla:             all || flag("sla"),
  demos:           all || flag("demos"),
  demoScenarios:   all || flag("demo-scenarios"),
  demoQuestions:    all || flag("demo-questions"),
};
const branded = flag("branded");
const logoPath = param("logo") || null;

// --- Design tokens ---
const FONT = "Arial";
const SZ = 22; // 11pt
const GRAY = "D9D9D9";
const RED = "E1251B";
const DK = "212121";
const BDR = { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" };
const BDRS = { top: BDR, bottom: BDR, left: BDR, right: BDR };
const CMAR = { top: 60, bottom: 60, left: 100, right: 100 };
const TW = 9360;

// --- Helpers ---
function p(text, o={}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font:FONT, size:o.size||SZ, bold:o.bold, italics:o.italics, color:o.color||DK }));
  } else if (Array.isArray(text)) {
    text.forEach(t => runs.push(new TextRun({ ...t, font:FONT, size:t.size||o.size||SZ, color:t.color||o.color||DK })));
  }
  return new Paragraph({
    children: runs,
    spacing: o.spacing || { after: 120 },
    alignment: o.align,
    heading: o.heading,
    ...(o.numbering ? { numbering: o.numbering } : {}),
  });
}

function h(text, level, num) {
  const prefix = num !== undefined ? `${num}\t` : "";
  const hColor = (branded && level === 1) ? RED : DK;
  return p([{ text: prefix + text, bold: true, size: level===1?32:level===2?26:24, color: hColor }], {
    heading: level===1?HeadingLevel.HEADING_1:level===2?HeadingLevel.HEADING_2:HeadingLevel.HEADING_3,
    spacing: { before: level===1?360:240, after: 120 },
  });
}

function hc(text, w) {
  const fill = branded ? "F2E6E5" : GRAY;
  return new TableCell({ borders:BDRS, margins:CMAR, width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR}, children:[p(text,{bold:true,size:20})] });
}
function tc(text, w, o={}) {
  const c = typeof text==="string" ? [p(text,{size:20,italics:o.ph,color:o.ph?"808080":DK})] : text;
  return new TableCell({ borders:BDRS, margins:CMAR, width:{size:w,type:WidthType.DXA},
    ...(o.shade?{shading:{fill:o.shade,type:ShadingType.CLEAR}}:{}), children:c });
}
function tbl(headers, rows, cw) {
  const tot = cw.reduce((a,b)=>a+b,0);
  return new Table({ width:{size:tot,type:WidthType.DXA}, columnWidths:cw, rows:[
    new TableRow({ children: headers.map((h,i)=>hc(h,cw[i])) }),
    ...rows.map(row=>new TableRow({ children: row.map((c,i)=>tc(c,cw[i],{ph:typeof c==="string"&&c.startsWith("[")}))})),
  ]});
}
function bul(text) { return p(typeof text==="string"?text:text, { numbering:{reference:"bullets",level:0} }); }
function ph(text) { return p([{text,italics:true,color:"808080"}]); }
function sp() { return p("",{spacing:{after:0}}); }
function pb() { return new Paragraph({children:[new PageBreak()]}); }

// --- Sections ---
function titlePage() {
  const items = [sp(),sp(),sp()];
  if (branded && logoPath && fs.existsSync(logoPath)) {
    items.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 260, height: 49 }, type: "png" })],
    }));
  } else { items.push(sp(),sp(),sp()); }
  items.push(
    p([{text:"[Project Name]",bold:true,size:56,color:RED}],{align:AlignmentType.CENTER,spacing:{after:200}}),
    p([{text:`Request for ${isRFP?"Proposal":"Information"} (${docType})`,bold:true,size:36}],{align:AlignmentType.CENTER,spacing:{after:400}}),
    p([{text:"Eli Lilly and Company",bold:true,size:28}],{align:AlignmentType.CENTER,spacing:{after:200}}),
    p([{text:"[Date]",size:24}],{align:AlignmentType.CENTER,spacing:{after:200}}),
    p([{text:"[Business Unit / Function]",italics:true,size:24,color:"808080"}],{align:AlignmentType.CENTER}),
    sp(),sp(),sp(),sp(),sp(),sp(),sp(),sp(),pb());
  return items;
}

function frontMatter() {
  return [
    p([{text:"Contents",bold:true,size:32}],{spacing:{after:200}}),
    new TableOfContents("Table of Contents",{hyperlink:true,headingStyleRange:"1-3"}), pb(),
    p([{text:"Revision History",bold:true,size:26}],{spacing:{before:240,after:120}}),
    tbl(["Version","Date","Revision Details","Revised By"],
      [["1.0","[Date]","Initial Release",`Lilly ${docType} Team`],["","","",""]],[1200,1800,3960,2400]),sp(),
    p([{text:"Glossary",bold:true,size:26}],{spacing:{before:240,after:120}}),
    tbl(["Term","Definition"],[["[Term]","[Definition]"],["[Term]","[Definition]"],["[Term]","[Definition]"]],[2400,6960]),pb(),
  ];
}

function sec0() {
  return [
    h("Preface",1,"0"),
    h("Overview",2,"0.1"),
    p("This document provides suppliers bidding on this project with information on the scope of the service and instructions/guidance on how to provide a response to Lilly."),
    h("Contact Information",2,"0.2"),
    p(`Please limit communication regarding this ${docType} to the Lilly Procurement Contact below or through the Ariba Sourcing Portal. You may be disqualified if this information is inappropriately dispersed or shared.`),sp(),
    p([{text:"[Procurement Contact Name]",bold:true}]), p("[Title]"), p("[Organization]"),
    p("Lilly Corporate Center Indianapolis, IN 46285"), p("[email@lilly.com]"), p("[Phone]"),
    h("Resources and Help Guides",2,"0.3"),
    p("For help related to system access in Ariba, please rely on the links below available within Lilly's Supplier website or contact Lilly Procurement's Support Desk provided on the Supplier website."),sp(),
    p("https://www.lilly.com/suppliers/supplier-resources"),
    p("https://www.ariba.com/support/supplier-support"),
    h("Copyright",2,"0.4"),
    p("This document is copyright and contains proprietary information of Eli Lilly and Company and as such shall not be reproduced or disclosed to a third party without the prior written consent of Lilly."),
    p("Lilly assumes no responsibility for any errors that may appear in this document."),
    p("Copyright \u00A9 [Year] Eli Lilly and Company"), p("All Rights Reserved"),
    h("Confidentiality Notice",2,"0.5"),
    p([{text:"CONFIDENTIALITY NOTICE: ",bold:true},{text:`This ${docType} from Eli Lilly and Company (including all attachments) is for the sole use of the intended recipient(s) and contains confidential and privileged information. Any unauthorized review, use, disclosure, copying, or distribution is strictly prohibited. In addition, all ${docType} content is expected to be treated in accordance with the confidentiality provisions of the effective master agreement.`}]),
    pb(),
  ];
}

function sec1() {
  const c = [
    h(`${docType} Background & Instructions`,1,"1"),
    h("Background",2,"1.1"),
    p('Eli Lilly and Company ("Lilly") is a global pharmaceutical company headquartered in Indianapolis, IN, U.S.A. [Current revenue figure], with products marketed in more than 120 countries. With a heritage of over 145 years, our mission is to make medicines that help people live longer, healthier, more active lives.'),
    p("Our businesses include diabetes and obesity, oncology, immunology, and neuroscience. Lilly has over [employee count] employees, approximately [percentage] of which are located outside the United States. Lilly also employs a wide range of contract labor supporting various business areas."),sp(),
    ph("[PROJECT-SPECIFIC BACKGROUND: Describe the sourcing need, business problem, current state, and what Lilly is looking for.]"),
    h("Definitions",2,"1.2"),
    tbl(["Term","Definition"],[["[Term]","[Definition]"],["[Term]","[Definition]"]],[2400,6960]),
    h(`${docType} Response Expectations`,2,"1.3"),
  ];

  // Response expectations - adapted format
  if (isRFP) {
    c.push(
      p(`Suppliers must respond to the ${docType} through Lilly's Ariba Tool. Final responses must include the following components:`),sp(),
      tbl(["Document Type & Count","Response Description","Format"],
        [["REQUIRED -- Master Service Agreement with [applicable addendum]","Sign and upload the document. If you cannot agree as-is, note changes in redline. If you believe your company already has a Master Agreement with Lilly, confirm with the RFP Contact.","PDF or Word"],
         ["REQUIRED -- Solution Pricing Quotes","[Specify term options, sizing parameters, renewal language, module breakdown, support tier pricing.]","PDF or Excel"],
         ["REQUIRED -- Requirements Document","Provide responses to each item in the requirements document. Provide additional comments as needed.","Excel"],
         ["REQUIRED -- Technical Diagram(s)","Provide diagram(s) illustrating: cloud infrastructure, system architecture, functional modules, user interfaces, and integration landscape.","PDF Preferred"],
         ["REQUIRED -- Implementation Plan and Approach","Statement of work with approach, timeline, roles, responsibilities, milestones, resources, deliverables, underlying hourly rates, and optional services.","PDF Preferred"],
         ["OPTIONAL -- Supplemental Information","Any other information including key differentiators, partnerships, company revenue, legal obligations, global support capacity.","PDF Preferred"]],
        [2600,4760,2000]));
  } else {
    c.push(
      p(`Vendors are asked to respond to the ${docType} by returning responses through the Lilly Ariba eSourcing tool. Responses should consist of ONLY:`),
      bul("An Executive Summary consisting of no more than 2 sides of A4/Letter"),
      bul("A general description of a proposed solution to meet the requirements described in Section 2"),
      bul("Responses to the detailed questions/requirements in the Requirements spreadsheet along with supporting attachments where necessary"),
      bul("Details of the licensing and charging metrics such that Lilly can ensure this information is provided if a subsequent RFP were to be issued"),
      bul("List pricing for all components including maintenance/support along with the typical level of discount"),
      bul("Recommended implementation support and training for the solution"),
      bul("Overview of your near-term product roadmap and longer-term vision and strategy"),
      bul("Support model during and after implementation"),
      bul("Details (case studies) of two customers with requirements and volumes similar to those of Lilly"));
  }

  // 1.4 Supporting Documents
  c.push(
    h("Supporting Documents",2,"1.4"),
    p(`The ${docType} includes the following documents:`),
    tbl(["Document","Description"],
      [[`${docType} Instructions`,"This document. Contains an overview of the project, a description of the services required and the information to be returned."],
       ["Requirements","Requirements spreadsheet. Vendors should add their responses to the spreadsheet."],
       ["[Additional Document]","[Description]"]],[3000,6360]));

  // 1.5 Timeline
  c.push(h(`${docType} Timeline`,2,"1.5"));
  const milestones = [
    [`Release ${docType}`,"[Date]"],
    ["Supplier Intent to Respond Due","[Date]"],
    ["Q&A Session","[Date, Time, Duration]"],
    [`${docType} Responses Due`,"[Date, Time EST]"],
  ];
  if (isRFP) {
    milestones.push(
      ["Lilly Evaluations","[Date Range]"],
      ["Supplier Follow-Ups / Clarifications","[Date]"],
      ["Customer Reference Calls","[Date Range]"],
      ["Supplier Presentations / Demos","[Date Range with time slot options]"],
      ["Negotiations","[Date Range]"],
      ["Vendor Selection","[Date]"],
      ["Contract Execution","[Date]"],
      ["Project Start","[Date]"]);
  } else {
    milestones.push(
      ["Vendor Presentations","[Date Range]"],
      ["Further steps will be defined at this point.",""]);
  }
  c.push(tbl(["Milestone","Date"],milestones,[4680,4680]),sp());
  c.push(isRFP
    ? p([{text:`Responses must be submitted by [Time] on [Date] in Lilly's Ariba tool.`,bold:true}])
    : p("Please note these timescales are indicative and not a commitment to complete the process in this timescale."));

  // 1.6 Q&A
  c.push(h("Questions and Q&A Session",2,"1.6"),
    p(`There will be an opportunity for all suppliers to join a [duration] Question & Answer session via [Teams | WebEx] on [date and time]. Dial-in information will be shared with each individual supplier contact via email.`),
    p(`Please utilize this time to test your understanding of our requirements and ask clarifying questions. Each supplier will receive an anonymous ID prior to the call, and you are encouraged to use this ID during the call to promote candid discussion.`),
    p(`All further inquiries and questions after the Q&A meeting must be submitted via email or Ariba to the ${docType} Contact no later than [date and time]. Any questions that the Lilly team can answer will be sent to all ${docType} participants.`));

  // 1.7 Evaluation Criteria (optional)
  if (OPT.evalCriteria) {
    c.push(h("Evaluation Criteria",2,"1.7"),
      p("The following categories and approximate weights will be used to evaluate responses:"),sp(),
      tbl(["Evaluation Category","Weight"],
        [["[e.g., Functional Fit]","[X]%"],["[e.g., Technical Architecture]","[X]%"],
         ["[e.g., Pricing & Commercial]","[X]%"],["[e.g., Implementation Approach]","[X]%"],
         ["[e.g., Company Viability & References]","[X]%"]],[5000,4360]),sp(),
      p([{text:"Note: ",italics:true},{text:"Detailed evaluation methodology is not disclosed. Weights reflect relative importance to Lilly's decision.",italics:true}]));
  }

  c.push(pb());
  return c;
}

function sec2() {
  // Compute subsection numbering dynamically
  let sub = 1;
  const c = [h("Service Requirements & Specifications",1,"2")];

  // 2.1 Current Environment (optional)
  if (OPT.currentEnv) {
    c.push(h("Current Environment",2,`2.${sub}`),
      ph("[Describe the current state: existing systems, processes, pain points, volumes, user counts. Gives suppliers context for proposing a solution.]"));
    sub++;
  }

  // 2.X Project Objectives (core)
  c.push(h("Project Objectives / Desired Future State",2,`2.${sub}`),
    ph("[Describe what Lilly wants to achieve. Use a bulleted list of specific, measurable objectives.]"));
  sub++;

  // 2.X Requirements (core)
  c.push(h("Requirements",2,`2.${sub}`),
    p("Requirements are broken down into several categories as indicated in the table below and elaborated in the attached requirements response spreadsheet."),sp(),
    tbl(["Requirement Category","Definition"],
      [["[Category 1]","[Definition of what this category covers]"],["[Category 2]","[Definition]"],
       ["[Category 3]","[Definition]"],["[Category 4]","[Definition]"],["[Category 5]","[Definition]"]],
      [3200,6160]),sp());

  if (isRFP) {
    c.push(
      p("Please respond individually to each requirement within the spreadsheet. The completed spreadsheet must be returned as per the instructions above. For each requirement, respond by placing an X in the appropriate column and add comments or explanation in the far right column:"),sp(),
      bul([{text:"Meets out of the box: ",bold:true},{text:"The current production version satisfies the requirement without any software modifications."}]),
      bul([{text:"Meets with Standard Configuration: ",bold:true},{text:"Requires non-programming standard configuration through the system UI or config files, accomplishable by a Lilly administrator without writing code."}]),
      bul([{text:"Meets with Major Configuration: ",bold:true},{text:"Requires significant configuration effort. If it requires scripting or cannot be done through the standard UI, the configuration is considered major. Include in implementation services pricing."}]),
      bul([{text:"Meets with Vendor Customization: ",bold:true},{text:"New functionality not part of standard product. Exclusively for Lilly, not maintained across future releases. Include in implementation services pricing."}]),
      bul([{text:"Does Not Meet: ",bold:true},{text:"Functionality not available. Vendor can explain alternative approaches or future roadmap."}]),sp(),
      p([{text:"Note: ",bold:true},{text:"It is important that you do not add or insert rows within the requirements response spreadsheet."}]));
  } else {
    c.push(p("Please respond to each requirement in the attached spreadsheet with a description of how your solution addresses it. Reference supporting documentation where applicable."),sp(),
      p([{text:"Note: ",bold:true},{text:"It is important that you do not add or insert rows within the requirements response spreadsheet."}]));
  }
  sub++;

  // 2.X Data & Integration (optional)
  if (OPT.dataIntegration) {
    c.push(h("Data and Integration Landscape",2,`2.${sub}`),
      ph("[Describe Lilly's technology environment relevant to this sourcing: key systems the solution must integrate with (SAP, Ariba, SuccessFactors, Workday, etc.), data flows, authentication requirements (SSO, Okta/Entra ID), data residency or sovereignty requirements.]"));
    sub++;
  }

  // 2.X InfoSec (optional)
  if (OPT.infosec) {
    c.push(h("Information Security Requirements",2,`2.${sub}`),
      p("Lilly Information Security Standard is non-negotiable. A detailed security questionnaire will be provided separately. Suppliers should be prepared to provide evidence of their security posture including certifications, audit reports, and incident response capabilities."),sp(),
      p("Key areas of assessment include:"),
      bul("Data Security and Privacy"),bul("Access Control"),bul("Audit and Accountability"),
      bul("Secure Integration"),bul("Resilience and Business Continuity"),bul("Secure Development Practices"),
      bul("Incident Response"),bul("Regulatory Compliance"));
    sub++;
  }

  // 2.X Diversity (optional)
  if (OPT.diversity) {
    c.push(h("Supplier Diversity Expectations",2,`2.${sub}`),
      p("Lilly is committed to supplier diversity and inclusion. Suppliers are encouraged to include information about their diversity certifications (SBE, MBE, WBE, LGBTQ, SDVOSB, HubZone, etc.), subcontracting plans with diverse suppliers, and commitment to diverse hiring practices."),sp(),
      ph("[Add category-specific diversity goals or expectations if applicable.]"));
    sub++;
  }

  c.push(pb());
  return c;
}

function sec3() {
  if (!OPT.contracting) return [];
  const c = [
    h("Contracting & Commercial Principles",1,"3"),
    h("Contracting",2,"3.1"),
    p("All suppliers will be required to agree to a [Master Service Agreement with SaaS Addendum | Master Professional Services Agreement | applicable agreement type] with Lilly to be awarded the business."),sp(),
    bul("The master set of terms will be contracted with Eli Lilly and Company (the US parent company)."),
    bul("Pricing for the services will be in USD."),
    bul("Irrespective of any existing master agreement, payment terms are 60 days from date of receipt of a valid invoice."),
    bul("Invoicing will be through Lilly's e-invoicing system: Ariba."),
    bul("Lilly Information Security Standard, Supplier Privacy Standard, and Anti-Bribery Policies are non-negotiable. They can also be found in the Supplier Resources section on www.lilly.com/suppliers."),
    h("Pricing & Commercial Principles",2,"3.2"),
    bul("Lilly seeks a supplier who can meet the requirements at the most competitive price and provide a basis for future expansion."),
    bul("Pricing must separately show any one-time charges, recurring charges, training, support/maintenance, and professional services costs."),
    bul("Pricing for additional/optional modules that Lilly may require should be shown."),
    bul("List and discounted price, including all units of measure, must be shown."),
    bul("A proposed/typical project timeline for implementation should also be included."),
  ];

  let sub = 3;
  if (OPT.sla) {
    c.push(h("Service Levels / Credits",2,`3.${sub}`),
      p("Please include any information about Service Levels/Credits in terms of service/platform uptime and response/resolution of reported faults."));
    sub++;
  }

  c.push(h("Protocol",2,`3.${sub}`),
    p(`The Supplier must comply fully with the engagement protocols and terms and conditions set forth in this ${docType} or as otherwise communicated by Lilly.`),sp(),
    p('The Supplier should comply with the "Lilly Supplier Code of Business Conduct", a copy of which is available at: https://www.lilly.com/suppliers/supplier-resources/operating-responsibly'),sp(),
    p(`No Supplier personnel should make any contact with any Lilly personnel related to this ${docType}, including senior management, without first having obtained the primary contact's approval.`),sp(),
    p(`The Supplier must not provide any form of special incentive to Lilly representatives during this ${docType} process.`),sp(),
    p("Lilly will accept no requests for exclusivity during the evaluation process."));
  sub++;

  c.push(h("No Implied Offer",2,`3.${sub}`),
    p(`The issuance of this ${docType} does not imply that Lilly is making an offer to do business with any ${docType} recipient or respondent. No Agreement or other binding obligation on Lilly is implied or will occur unless and until a definitive Services Agreement is executed. The issuance of this ${docType} and the submission of the Supplier's proposal do not create any obligation upon Lilly to purchase goods or Services from the Supplier, or to enter into any binding legal relationship with any one or more of the Suppliers.`));

  c.push(pb());
  return c;
}

function sec4() {
  if (!OPT.demos) return [];
  const c = [
    h("Presentation & Demo Guidance",1,"4"),
    h("Presentation Topics",2,"4.1"),
    p("Please prepare a presentation covering the following topics. Have resources with relevant expertise available for questions during the presentation."),sp(),
    ph("[List presentation topics as bullets. Adapt to the sourcing domain. Examples: Solution architecture, Implementation methodology, Pricing model walkthrough, Support model, Customer references, Roadmap and innovation, Team composition and qualifications.]"),
  ];

  let sub = 2;
  if (OPT.demoScenarios) {
    c.push(h("Demo Scenarios",2,`4.${sub}`),
      p("Please prepare live demonstrations for the following scenarios. Each scenario includes business context, a task to demonstrate, and what Lilly evaluators will be looking for."),sp(),
      tbl(["Scenario","Business Context","Task","Success Criteria","Time"],
        [["S-01","[Context]","[What to demonstrate]","[What evaluators look for]","[Minutes]"],
         ["S-02","[Context]","[Task]","[Criteria]","[Minutes]"],
         ["S-03","[Context]","[Task]","[Criteria]","[Minutes]"]],
        [800,2200,2200,2800,1360]));
    sub++;
  }

  if (OPT.demoQuestions) {
    c.push(h("Additional Questions",2,`4.${sub}`),
      p("Please provide written responses to the following questions prior to the presentation, and be prepared to discuss during the session."),sp(),
      ph("[List additional operational, technical, or commercial questions specific to this sourcing domain. These are questions that go beyond the requirements matrix and are best answered in conversation.]"));
  }

  return c;
}

// --- Build ---
async function build() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font:FONT, size:SZ, color:DK } } },
      paragraphStyles: [
        { id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
          run:{size:32,bold:true,font:FONT,color:branded?RED:DK}, paragraph:{spacing:{before:360,after:120},outlineLevel:0} },
        { id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
          run:{size:26,bold:true,font:FONT,color:DK}, paragraph:{spacing:{before:240,after:120},outlineLevel:1} },
        { id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,
          run:{size:24,bold:true,font:FONT,color:DK}, paragraph:{spacing:{before:200,after:100},outlineLevel:2} },
      ],
    },
    numbering: { config: [{ reference:"bullets", levels:[{
      level:0, format:LevelFormat.BULLET, text:"\u2022", alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{left:720,hanging:360} } } }] }] },
    sections: [{
      properties: { page: { size:{width:12240,height:15840}, margin:{top:1440,right:1440,bottom:1440,left:1440} } },
      headers: { default: new Header({ children: [
        p([{text:`${docType} -- [Project Name]`,italics:true,size:18,color:"808080"}],{align:AlignmentType.RIGHT,spacing:{after:0}}) ] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        children: [
          new TextRun({text: branded ? "Company Confidential  \u00A9 2026 Eli Lilly and Company" : "Eli Lilly and Company - Confidential", font:FONT,size:16,italics:true,color:"808080"}),
          new TextRun({text:"\t"}), new TextRun({text:"\t"}),
          new TextRun({children:[PageNumber.CURRENT],font:FONT,size:16,color:"808080"})],
        tabStops: [{type:TabStopType.CENTER,position:4680},{type:TabStopType.RIGHT,position:9360}]})]})},
      children: [
        ...titlePage(), ...frontMatter(), ...sec0(), ...sec1(), ...sec2(), ...sec3(), ...sec4(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  // Summary
  const active = Object.entries(OPT).filter(([,v])=>v).map(([k])=>k);
  console.log(`Generated: ${outputPath}`);
  console.log(`Mode: ${mode} | Optional sections: ${active.join(", ") || "none"}`);
  console.log(`Size: ${Math.round(buffer.length/1024)}KB`);
}

build().catch(err => { console.error(err); process.exit(1); });