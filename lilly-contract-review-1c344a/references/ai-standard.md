# Lilly Artificial Intelligence Standard

Reference module for the `lilly-contract-review` skill. This is the Lilly AI Standard (dated 09/03/2024) that governs the provision and use of Automated Systems by or on behalf of Lilly. Always loaded for contracts involving AI/ML services, SaaS platforms with AI features, or suppliers that use AI in service delivery.

## Key Provisions for Contract Review

### Critical Sections (most commonly triggered in negotiations):

**§3.2 - Permitted Uses:** Supplier cannot introduce an AI system, use AI with Lilly Content, or use AI for High-Impact or Restricted Use WITHOUT Lilly's prior written approval. Each new AI system, model, feature, and provider requires separate approval. If a use is not Low-Impact, it's treated as High-Impact.

**§3.6 - Third-Party AI Providers as Subcontractors (HARD STOP - HS-5):** Unless the use is Low-Impact, an AI Provider is considered a SUBCONTRACTOR requiring Lilly approval. This is the provision that drives the subcontractor treatment requirement in AI/SaaS contracts. Supplier must inform Lilly if the AI system is subject to abuse monitoring by the AI Provider.

**§3.4 - Lilly Content:** Supplier may only use Lilly Content, Outputs, and Trained Models for Lilly's sole benefit. CANNOT use them for Supplier's benefit or as Training Content.

**§3.10 - Storage and Purging:** Upon cessation of use, Supplier must permanently delete Trained Models, Training Content, Inputs, Lilly Content, and Outputs. Written certification required.

**§3.5 - Security/Hosting:** AI System must be hosted in environment only accessible to Lilly. No human oversight or monitoring by Supplier/AI Provider except for Lilly's benefit.

**§3.3 - Low-Impact Use (does NOT require prior approval if):**
- (a) Ancillary tool - no Lilly Content input, no Output incorporated into deliverables, OR
- (b) No storage/retention - Inputs/Outputs not stored, retained, or used as Training Content

**§3.8 - Cost Impact:** Use of AI will NOT increase Compensation. Any AI introduced after agreement date must REDUCE Compensation to reflect savings.

### Definitions to Watch:

- **High-Impact Use:** Affects individual rights (housing, employment, credit, healthcare), designated as high-risk by regulators, or processes personal information (employee, customer, healthcare, clinical trial data)
- **Lilly Automated Property:** Lilly Content + Inputs + Outputs + Trained Models - all owned by Lilly
- **AI Provider:** Entity other than Supplier providing an Automated System - triggers Subcontractor treatment under §3.6

### Representations and Warranties (§3.11):
Supplier warrants: compliance with specs, no restrictions on Output use, proper consents for Training Content, compliance with all AI laws, no IP infringement, no sharing of Lilly Content without authorization, no vulnerabilities introduced, designed to minimize High-Impact Results, annual testing, appropriate Training Content, no copyright management info tampering, and AI Provider terms consistent with this Standard.

### Notice and Remediation:
- **48-hour notification** of any non-compliance (§3.12)
- **48-hour cure** for variances/errors generating High-Impact Results (§3.15)
- Failure to cure = Lilly right to terminate without penalty

---

## Full Standard Text

Purpose. 

This Artificial Intelligence (AI) Standard (“Standard”) (a) governs the provision and use of an Automated System (as defined below) for use by or on behalf of Lilly or in connection with the use by or through Supplier of an Automated System to provide Services, Work Product or Deliverables to or for the benefit of Lilly and (b) supplements the Agreement.

Definitions.

Capitalized terms or phrases used in this Standard have the meanings stated in this Standard or if not defined in this Standard, then elsewhere in the Agreement. 

“AI Model” means a mathematical, economic or statistical representation, framework or computational technique, calculation, algorithm or structure that (a) is designed to perform specific tasks without explicit programming or to produce outputs from a given set of Inputs or (b) used to optimize the output of a large language or other model (e.g., retrieval augmented generation or other contextual models).  AI Models include machine learning (including deep learning), neural networks, large language models, natural language processing models, computer vision models and other artificial intelligence techniques, approaches and methodologies, including those generating (or capable of generating) output in response to an Input (i.e., generative artificial intelligence).

“AI System” means a machine-based system that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.

“AI Provider” means an entity or Person other than Supplier that supplies, licenses, or otherwise provides or makes available an Automated System, regardless of whether via a cloud- or SaaS-based solution or other delivery model.

“Applicable AI Law” means any statute, law, treaty, rule, code, ordinance, regulation, permit, interpretation, certificate, judgment, decree, injunction, writ, order, subpoena, or like action of a Governmental Authority that applies, as the context requires to: (i) an AI Model; (ii) an AI System; and (iii) the performance of obligations or other activities related to the Automated System, including but not limited to the EU AI Act, Colorado AI Act, and Illinois House Bill (HB) 3773.

“Automated System” means any AI System, AI Model, robotics, robotic process automation and other technology enabling automation of processes, procedures or activities used or introduced by or through Supplier, directly or indirectly, in connection with the provision of, or forming part of, the Services, Work Product or Deliverables.

“Copyleft Open Source License” means an Open Source License that requires, as a condition of distribution of the software, project, database or other work licensed thereunder, that other software, projects, databases or other work incorporated into, derived from or distributed with, such software, project, database or work (i) be disclosed or distributed in source code form, (ii) be licensed for purposes of preparing derivative works or (iii) be redistributed at no charge. Copyleft open-source software includes the GNU General Public License, the GNU Lesser General Public License, the GNU Affero General Public License, the Creative Commons Attribution Share-Alike License (CC BY-SA); and the Mozilla Public License.

“High-Impact Use” means use of an Automated System that:

is developed or deployed with the intended purpose of making predictions, recommendations, decisions, or other outputs that could or actually have a legal or similarly significant effect on the access of an individual to housing, employment, credit, education, healthcare, or insurance in a manner that poses a significant risk to rights afforded under Applicable Law or regulations;

operates, facilitates, performs, or otherwise engages in an activity, process, business, or function that is designated as high risk, high impact, or other comparable designation by Applicable AI Law, regulations or Governmental Authorities or agencies in the jurisdictions where Lilly conducts its business or such activity, process, business, or function operates or impacts others, or affects the safety or loss of tangible or physical property; or

involves the processing of individual Personal Information as it pertains to employee data, customer data, healthcare data, clinical trial subject data, clinical investigator data or supplier and other contractor employee data.

“Input” means a prompt, input, query, command, or other user instruction. For clarity and where the context so requires, Input includes Lilly Content.

“Lilly Automated Property” means Lilly Content, Inputs, Outputs, and Trained Models.

“Lilly Content” means: (a) Lilly Information (including Lilly Personal and Confidential Information); and (b) any Input, Information, content, material or other form of Information or communication that is (i) owned or controlled by Lilly or (ii) provided to Supplier or the AI System by, through or on behalf of Lilly, whether owned by Lilly or third parties.

“Lilly Policies and Standards” means the Supplier Privacy Standard and Information Security Standard as described in the Agreement.  

“Low-Impact Use” means use of an AI System where the use is not a High-Impact Use and meets any of the following deployment or operating models:

(a)	Ancillary Supporting/Productivity Tool - where Supplier merely uses the AI System as an ancillary supporting or productivity tool in support of the provision of the applicable Service, Work Product or Deliverable and does not (i) input or provide to the AI System any Lilly Content or other Confidential Information of Lilly (or any other person or entity whose Confidential Information is provided by or through Lilly) and (ii) incorporate any Output into the applicable Product, Service or Deliverable; or 

(b)	No Storage / Retention - where Supplier provides AI System Inputs containing Lilly Content or other Confidential Information of Lilly (or any other person or entity whose confidential information is provided by or through Lilly) and such Inputs and any Outputs are not stored, retained, saved, or collected by the AI System nor used as Training Content. 

“Open Source” means any software or other work licensed under an Open Source License.

“Open Source License” means any license that (i) is approved by the Open Source Initiative and listed at http://www.opensource.org/licenses or considered to be a free software license by the Free Software Foundation, or (ii) any similar license for “free,” “publicly available” or “open source” software, including the GNU General Public License, the GNU Lesser General Public License, the Apache License, the BSD License, Mozilla Public License (MPL), and the MIT License.

“Output” means any data, text, content, sound, videos, software code, image, material, Information, communication, and other output, outcome, action or result generated from use of an AI System, including predictions, recommendations, or decisions influencing or impacting the environments, systems and/or processes in which they operate, integrate or interact.  

“Restricted Use” means any of the following: (a) Copyleft Open Source; and (b) the prohibition to use the AI System or any Outputs for commercial purposes.

“Supplier Automated Property” means an AI System that is owned by Supplier or an AI Provider prior to engaging in, or outside, the performance or delivery of Services Work Product or Deliverables for the benefit of Lilly. Supplier Automated Property excludes Lilly Automated Property.

“Training Content” means any Information or material used to create, develop, train, validate, test, or improve any AI Model or AI System.

“Trained Models” means an AI Model created, customized, developed, fine-tuned, trained, validated, tested, or improved with Lilly Content by or on behalf of Lilly, and includes any retrieval or contextual mechanism, model, engine, or process to augment the generation process of an AI System.  

General Terms Applicable to the Use of Automated Systems.

General.  Any variations or exceptions to this Standard must be documented in the Work Order to which use of an AI System applies and using the table attached to this Standard as Addendum A. 

Permitted uses. Supplier shall not, without Lilly’s prior written approval (which Lilly has the right to withhold in Lilly’s sole discretion):

introduce an Automated System into any systems, networks, software, equipment or other environments owned or controlled (by license, lease or otherwise) by Lilly, any of its Affiliates or any supplier or service provider providing services, products, deliverables or goods to or for the benefit of Lilly or any of its Affiliates;

use any AI System in connection with (i) the processing of, access to, or use of any Lilly Content (including the use of Lilly Content as Training Content), or (ii) the Services or the provision of any Deliverables, Products or results to be provided to Lilly under the Agreement; nor

use any Automated System or Outputs for a High-Impact Use or that are based on, use, incorporate or otherwise involve a Restricted Use. 

Any such prior written approval by Lilly must be obtained for each new Automated System, each new AI Model and/or new feature within the AI Model, and/or any new AI Provider or other provider of an Automated System not previously and specifically approved by Lilly. If a particular use does not constitute a Low-Impact Use, it shall be treated as a High-Impact Use.

Low-Impact Use. Use of an AI System for Low-Impact Use does not require Lilly’s prior written approval as long as the following conditions are met: 

the Low-Impact Use (i) complies with the requirements and provisions of this Standard, and (ii) the representations and warranties made under this Standard are true and accurate at all times; and

where Supplier uses an AI System provided by an AI Provider that is not hosted within an environment hosted or controlled by Supplier (e.g., the AI System accesses or uses a third party large language or foundation model (“LLM”) via an application programming interface to the LLM provider), the Work Order or Statement of Work (i) specifies the identity of the applicable AI Provider and (ii) the environment (including geographic location and region) in which the AI System resides.

Revocation; Suspension. Notwithstanding Section 3.2 (Permitted Uses) above and/or any approval granted thereunder, Lilly reserves the right to revoke and/or suspend the use of any Automated System at any time and for any reason and Supplier shall comply immediately with any such revocation or suspension, and immediately, but in no event more than thirty (30) days, return and/or delete related Lilly Content, Outputs and Trained Models at Lilly’s request.

Lilly Content. Supplier only may use and process Lilly Content, Outputs and Trained Models for the sole benefit of Lilly and shall not use any of them (a) for the benefit of Supplier or any Person or entity other than Lilly or (b) as Training Content.

Security; Hosting. When using an Automated System, Supplier represents and warrants that:

Supplier and each AI Provider is compliant and will comply with all of the provisions of the Agreement applicable to information and cybersecurity, including any requirements regarding notice of a security breach or incident (and any such requirements extend to a breach or incident impacting the Automated System, regardless of whether Lilly Content is impacted);

the AI System is hosted in an environment that is only accessible to, and used, by Lilly and its representatives;

Supplier and each AI Provider has implemented and will maintain appropriate technical, administrative and operational safeguards to prevent access to the AI System, Outputs and Lilly Content by Persons or entities other than Lilly, which safeguards are no less restrictive than industry standards and the safeguards required for the protection of confidential information of Lilly; and

neither Supplier nor the AI Provider shall, nor shall any of its representatives, have any right or ability to implement human oversight or monitoring of the use by Lilly of the Automated System or any Trained Model, or to the Lilly Content or Outputs other than as necessary for the sole benefit of Lilly. 

Use of Third-Party Automated Systems. If Supplier uses an Automated System provided by an AI Provider, unless the Automated System is used for a Low-Impact Use, the AI Provider of such Automated System is considered a Subcontractor for which Lilly approval is required in accordance with the Agreement and any approval granted by Lilly is limited to the specific Automated System and use of any additional Automated System must be approved. Supplier must inform Lilly if the Automated System is subject or becomes subject to any abuse monitoring review by the AI Provider and provide a detail of the data flow to and from the AI System.

Open Source. Supplier must identify any Open Source that is used in connection with an Automated System or generated as or with an Output from use of an Automated System.

Cost-impact of Using an Automated System. Supplier acknowledges and agrees that use of an Automated System will not increase the Compensation and for any Automated System that is introduced following the effective date of the Agreement, Supplier shall reduce the Compensation to reflect any savings generated from use of an Automated System.

Information Sharing; Cooperation. Lilly may reasonably request, and Supplier shall reasonably cooperate to provide results of any testing, evaluation, validation and verification of the Automated System as necessary to demonstrate compliance with Applicable AI Law. Lilly has the right to share Information regarding the Automated System, its use and/or AI Provider with any Governmental Authority to the extent requested by any of them. Supplier shall cooperate with any audits, inspections, assessments, or other steps to be performed by Lilly or Governmental Authority to confirm that Supplier provides the Automated Systems consistent with this Standard and any Applicable Law or regulations.

Storage and Purging. Upon cessation of Lilly’s need for use of the AI System (which Supplier shall first receive confirmation from Lilly in writing that Lilly’s use has so ceased) or earlier upon Lilly’s request, Supplier shall (and shall ensure that any AI Provider) permanently delete the Trained Model, Training Content, Input and any Lilly Content and Outputs used or otherwise processed in connection with the AI System, and shall provide written certification of the deletion.

Additional Representations and Warranties. In addition to other representations and warranties in the Agreement, Supplier represents and warrants as follows:

the Automated System operates and performs in accordance with Project Specifications and professional or good practice standards or codes applicable to the nature of the Services provided;

except as otherwise agreed in writing, there are no restrictions of any kind to Lilly’s use of any Outputs;

Supplier and the applicable AI Provider have obtained and shall maintain any and all required consents, authorizations, and licenses to use any Training Content (other than Lilly Content);

Supplier and the applicable AI Provider comply with all laws, regulations, standards, and ethical principles applicable to the development, testing, deployment, and use of the Automated System, including but not limited to those related to data protection, privacy, security, transparency, accountability, fairness, non-discrimination, and human dignity; 

there are no actions, suits, proceedings, or investigations, pending or, to the best of its knowledge, threatened, against Supplier, its representatives, or its customers, and, to the extent of Supplier’s knowledge (and due inquiry), there is no reasonable basis for any such actions, suits, proceedings or investigations arising out of or in connection with the provision or use of any Automated System;

the Automated System, Inputs (other than Lilly Content), Output, and the Training Content do not, nor result from any activity(ies) that, (i) infringe, misappropriate, or otherwise violate Intellectual Property Rights or any other proprietary (including rights of privacy and publicity) or contractual rights of any Person or entity, or (ii) violate Applicable Law, including copyright laws;

neither Supplier nor any AI Provider will share any Inputs, Outputs, Lilly Content or the Trained Model with any entity or Person other than as specifically authorized by Lilly in advance and in writing; 

the Automated System and any Outputs do not have and will not introduce (i) any vulnerability to the systems, code or networks of Lilly and (ii) code that will subject Lilly (or any of systems, code or networks of or used by Lilly) to any Copyleft Open Source Licenses;

the Automated System was and is designed, developed, trained, tested and deployed (a) in compliance with all Applicable AI Law, (b) to ensure it is safe, reliable and effective, and (b) to minimize High-Impact Results;

Supplier conducts periodic (but not less than annual) testing, evaluations, verifications, and validations of the Automated System to ensure that the Automated System (i) operates within its intended service levels (if any) and parameters while minimizing High-Impact Results, and (ii) complies with Lilly’s security requirements;

all Training Content is appropriate, relevant, representative, accurate and complete for the purposes of the AI System and Services, Work Product or Deliverables to be provided.

any Training Content and Output does not tamper with or remove any information that accompanies a copyrighted work and is used to identify the copyright owner or the terms and conditions of use of a copyrighted work (i.e., rights associated with that work); and

in connection with use of an Automated System from an AI Provider, Supplier shall (i) ensure that the terms and conditions with respect to such Automated System are consistent with, do not conflict with, and do not cause Supplier to violate, this Standard or any other part of the Agreement or the applicable Work Order; (ii) only use the version of such technology made available for use by commercial enterprise customers and that use of such version otherwise complies with provisions of the this Standard and the Agreement; (iii) prohibit such AI Provider from using any Output generated or created in connection with the Automated System; and (iv) ensure that all rights required to be assigned or vested in Lilly are so assigned and vested by the AI Provider.

Notice of Non-compliance. Supplier shall immediately upon discovery of, but in no event more than forty-eight (48) hours after, notify Lilly in writing of any noncompliance by Supplier with this Standard, including (a) notice of any variances and corrections to the intended operating parameters of the Automated System that may have an adverse impact on the intended use of the Automated System or reliance on the Outputs generated from use of the Automated System or (b) any significant disparities, variances or anomalies identified through such testing, evaluations, validations or verifications where mitigation is not possible or practicable; 

Source Identification. Lilly has the right to identify the Automated System and/or the AI Provider as the source of any Outputs and disclose the use of the Automated System to third parties.

Proprietary Rights. Supplier retains and owns all Supplier Automated Property. Lilly retains and owns all Lilly Automated Property. Supplier hereby assigns (and shall ensure that all AI Providers hereby assign) to Lilly without any additional consideration to Supplier, AI Provider or their respective personnel, all right, title and interest any of them have or may have to any Lilly Automated Property, including all Intellectual Property Rights therein and thereto, and all Outputs of any Supplier Automated Property or Lilly Automated Property. Any copyrightable aspects of Lilly Automated Property that qualify as a “Work Made For Hire” under the copyright laws of the United States (and comparable laws in other jurisdictions) are considered “Work Made For Hire” as defined therein. Supplier shall render reasonable assistance as needed to give effect to such transfer. Lilly hereby grants Supplier, during the term of the Work Order or Statement of Work to which the Lilly Automated Property relates, a non-exclusive, non-transferable license to use the Lilly Automated Property solely to provide Services, Deliverables and Work Product to and for Lilly and for no other purpose. For any Lilly Automated Property, Supplier shall implement all necessary transparency measures and disclosures that may be required by Applicable Law and to properly vest any rights in Lilly as well as assist with any disclosures required to identify automated-generated Outputs.

Indemnification. Supplier agrees to defend and indemnify Lilly from and against any Losses arising from any Claim any breach of the obligations, representations or warranties stated in this Standard, including any Addendum to this Standard or a Work Order relating to use of an Automated System.

Termination. Supplier shall immediately, but in no event more than forty-eight (48) hours, at Supplier’s sole cost and expense, cure any variances, errors, and operating parameters from specifications or that otherwise generate or produce High-Impact Results. If such variances or errors have not been cured within forty-eight (48) hours, Lilly has the right to terminate the Agreement or applicable Work Order without incurring any penalty or termination fee or any other liability where Supplier fails to comply with this Standard.

Exhibit A Description of Permitted Use of an AI System

(To be completed by Supplier and returned to Lilly)

Supplier represents that the following is accurate to the best of its knowledge:

Supplier’s Registered Name and Address:

Describe the nature and purpose of the Automated System and its intended purpose and benefits:

Describe the AI Model(s) and AI Provider:

Include the applicable terms of service and policies:

Indicate the location of hosted Automated System (description of location of where AI Model/Systems is hosted - e.g., name of hyperscaler, data center location/region, etc.):

If applicable, describe the approved High-Impact Use:

If applicable, describe the fine-tuning of AI Model (specify whether fine-tuning by or through Supplier is in-scope and if so, describe the process, methods, etc.):

If applicable, describe the Lilly Content that will be processed:

If applicable, describe the categories of Training Content and formats:

If applicable, describe portability (describe how the Lilly Automated Property will be transferred upon cessation of the Services):


---