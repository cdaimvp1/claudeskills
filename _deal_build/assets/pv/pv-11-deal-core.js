var _PV11=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVNEG=(_PV11&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV11)&&_PV11.neg)?_PV11.neg:{};
function dealIsRenewal(){var p=PROJECTS[CURPROJ]||{};if(p.traits&&typeof p.traits.renewal==='boolean')return p.traits.renewal;return /renew/i.test(p.type||'');}
function dealIsRfx(){var p=PROJECTS[CURPROJ]||{};var comp=(p.traits&&typeof p.traits.competitive==='boolean')?p.traits.competitive:/competitive|rfx|rfp/i.test(p.type||'');return comp|| !!(p.mats&&p.mats.rfx);}
// buy-under-existing-MSA: an order/expansion/true-up against paper Lilly already holds (chosen supplier,
// existing MSA, not competitive, not a renewal). Its Deal tab composes the order-form + governing-MSA
// picker + (conditional) amendment + (conditional) divergence, see dealBuyMsaHTML.
function dealIsBuyMsa(){var t=(PROJECTS[CURPROJ]||{}).traits||{};return !!(t.existingMSA&&t.supplierChosen&&!t.competitive&&!t.renewal);}
function ensureDealCss(){ if(document.getElementById('deal-css'))return; var s=document.createElement('style'); s.id='deal-css'; s.textContent=
 '.dealbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 14px}'+
 '.dmodes{display:inline-flex;background:var(--well,#DDDCD8);border:1px solid var(--line2,#E0DCD5);border-radius:10px;padding:3px}'+
 '.dmode{border:0;background:none;font:600 13px var(--sans,system-ui,sans-serif);color:var(--mut2,var(--mut2));padding:6px 14px;border-radius:8px;cursor:pointer}'+
 '.dmode.on{background:var(--surface);color:var(--ink,#1A1A1A);box-shadow:0 1px 5px rgba(0,0,0,.17)}'+
 '.deallinks{display:inline-flex;gap:14px;flex-wrap:wrap;align-items:center}'+
 '.dlk{font:600 12.5px var(--sans,system-ui,sans-serif);color:var(--emph);text-decoration:none;cursor:pointer}'+ /* #1 (Marc): action links = burnt orange (take-action/emphasis); critical flags stay red */
 /* #8 (Marc): Key-issue cards adopt the native project-detail card chrome, subtle white card, thin plum top-rule (--pri-tx), 9px radius + the standard card shadow, so they read like the Overview / RFx-report cards instead of a bespoke box. */
 '.dissue{border:1px solid var(--line2,#E0DCD5);border-top:3px solid var(--pri-tx);border-radius:9px;padding:12px 14px;margin:0 0 10px;background:var(--surface);box-shadow:0 1px 2px rgba(28,28,34,.04),0 4px 11px -4px rgba(28,28,34,.09)}'+
 '.dihd{display:flex;align-items:center;gap:9px;margin-bottom:8px}'+
 '.din{font-weight:700;font-size:13.5px;color:var(--ink,#1A1A1A)}'+
 '.dibody{display:grid;grid-template-columns:1fr 1fr;gap:14px}'+
 '@media(max-width:760px){.dibody{grid-template-columns:1fr}}'+
 '.dicolh{font:700 10px var(--sans,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:var(--mut2,#8A827C);margin-bottom:5px}'+
 '.dirow{display:flex;gap:8px;font-size:12.5px;margin-bottom:3px;line-height:1.4}'+
 '.dik{flex:0 0 62px;color:var(--mut2,#8A827C)}.div{color:var(--ink,#1A1A1A)}.div.hs{color:#C8202E;font-weight:600}'+
 '.direvd{font-size:12.5px;color:var(--ink,#1A1A1A);margin-bottom:5px;line-height:1.4}'+
 '.difix{font-size:12.5px;color:var(--mut,#4A4540);line-height:1.4}.direv.none{font-size:12px;color:var(--mut2,#8A827C);font-style:italic}'+
 '.zline{margin:0 0 15px}.zlhd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}'+
 /* #8 (Marc): ZOPA ask read uses the 3-colour system with purpose, within-range = teal (positive), above-walk-away = burnt orange (emphasis, not a system-critical red). */
 '.zlname{font-weight:600;font-size:13px}.zlask{font-size:11.5px;font-weight:600}.zlask.over{color:var(--emph)}.zlask.ok{color:var(--sec)}'+
 '.ztrack{position:relative;height:24px;margin:2px 0}'+
 '.zmkt{position:absolute;top:50%;transform:translateY(-50%);height:7px;background:var(--line2,#E0DCD5);border-radius:4px}'+
 '.zmed{position:absolute;top:calc(50% - 8px);width:2px;height:16px;background:var(--teal)}'+ /* #1 (Marc): market median = teal (secondary reference accent) */
 '.zzopa{position:absolute;top:50%;transform:translateY(-50%);height:15px;background:rgba(92,43,80,.13);border:1px solid rgba(92,43,80,.4);border-radius:4px}'+
 '.ztgt,.zwalk{position:absolute;top:calc(50% - 9px);width:2px;height:18px;background:var(--plum)}'+
 '.zask{position:absolute;top:calc(50% - 12px);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid var(--plum)}'+
 '.zask.over{border-top-color:var(--emph)}'+
 '.zopen{position:absolute;top:calc(50% - 5px);width:10px;height:10px;margin-left:-5px;border-radius:50%;background:var(--surface);border:2px solid var(--plum);box-sizing:border-box}'+
 '.zlleg{display:flex;gap:14px;font-size:10.5px;color:var(--mut2,#8A827C);margin-top:3px}.zlleg .zztgt{color:var(--plum);font-weight:600}'+
 '.zopalegend{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:var(--mut2,#8A827C);margin-top:10px;padding-top:9px;border-top:1px solid var(--line,#EEE)}'+
 '.zopalegend i{display:inline-block;width:14px;height:8px;border-radius:2px;margin-right:5px;vertical-align:middle}'+
 '.zlg.mkt{background:var(--line2,#E0DCD5)}.zlg.zopa{background:rgba(92,43,80,.18);border:1px solid rgba(92,43,80,.5)}.zlg.open{width:10px;height:10px;background:var(--surface);border:2px solid var(--plum);border-radius:50%}.zlg.ask{width:0;height:0;background:none;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid var(--plum);border-radius:0}'+
 '.suplane{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 13px;margin:0 0 9px;background:var(--surface)}'+
 '.suplh{display:flex;align-items:center;justify-content:space-between;gap:10px}'+
 '.supln{font-weight:700;font-size:13.5px}.suplst{font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px;white-space:nowrap}'+
 '.suplst.win{background:rgba(92,43,80,.12);color:var(--plum)}.suplst.neg{background:var(--tint-f4f1ec,#F4F1EC);color:var(--mut2)}.suplst.hold{background:var(--tint-fbefc9,#FBEFC9);color:#8A6D00}'+
 '.dealcancel{display:inline-flex;gap:14px;margin-top:7px}'+
 '.fpbanner{padding:10px 13px;border-radius:9px;font-size:12.5px;margin-bottom:12px;line-height:1.45}'+
 '.fpbanner.ok{background:rgba(92,43,80,.08);border:1px solid rgba(92,43,80,.25);color:var(--ink,#1A1A1A)}'+
 '.fpbanner.warn{background:var(--tint-fbefc9,#FBEFC9);border:1px solid #E7C66B;color:#6E5600}'+
 '.fprow{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line,#EEE)}.fprow:first-child{border-top:none}'+
 '.fpi{flex:none;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;margin-top:1px}'+
 '.fprow.ok .fpi{background:var(--plum)}.fprow.flag .fpi{background:#C8202E}'+
 '.fpk{font-weight:600;font-size:13px}.fpn{font-size:12px;color:var(--mut2,var(--mut2));margin-top:2px;line-height:1.4}'+
 '.fpacts{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}'+
 '.fpgate{margin-top:13px;padding:12px 13px;border:1px dashed var(--line2,#E0DCD5);border-radius:9px}'+
 '.fpgh{font:700 10px var(--sans,system-ui,sans-serif);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2,#8A827C);margin-bottom:9px}'+
 '.fpapprovers{display:flex;gap:9px;flex-wrap:wrap}.fpgnote{font-size:11.5px;color:var(--mut2,#8A827C);margin-top:9px}'+
 // folded pricing/benchmark detail under each ZOPA line + the whole-deal TCO ZOPA total row
 '.zdetail{margin-top:7px;padding-top:7px;border-top:1px dashed var(--line2,#DCD8D2);display:grid;gap:3px}'+
 '.zdrow{display:flex;gap:8px;font-size:12px;line-height:1.4}'+
 '.zdk{flex:0 0 116px;color:var(--mut2,#8A827C);font-weight:600}.zdv{color:var(--ink,#1A1A1A);flex:1}.zdv b{font-weight:700}'+
 '.dihd .gsev,.zdv .gsev{display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;height:fit-content;flex:none}'+
 '.dcat{display:inline-block;font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;background:var(--blue-t,#E4EBF1);color:var(--plum);height:fit-content;flex:none}'+
 '.ztotal{margin-top:6px;padding-top:12px;border-top:2px solid var(--plum)}'+
 '.zthd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px}'+
 '.ztname{font-weight:700;font-size:13.5px;color:var(--plum)}.ztsub{font-size:10.5px;color:var(--mut2,#8A827C)}'+
 '.ztband{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}'+
 '.ztchip{font:700 11.5px var(--sans,system-ui,sans-serif);border-radius:30px;padding:3px 11px;white-space:nowrap}'+
 '.ztchip.tgt{background:rgba(92,43,80,.12);color:var(--plum)}.ztchip.walk{background:var(--blue-t,#E4EBF1);color:var(--plum)}.ztchip.open{background:var(--surface);border:1.5px solid var(--plum);color:var(--plum)}'+
 '.ztchip.ok{background:var(--sec-t);color:var(--sec)}.ztchip.over{background:var(--emph-t);color:var(--emph)}'+
 '.ztarrow{font-size:11px;color:var(--mut2,#8A827C)}'+
 // demo Go/No-Go headline (rendered next to the Protection Score gauge)
 '.dggo{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--line,#E3E2DF)}'+
 '.dgpill{font:700 13px var(--sans,system-ui,sans-serif);color:#fff;border-radius:30px;padding:4px 14px;white-space:nowrap}'+
 '.dgnote{font-size:12.5px;color:var(--mut,#3E3933);flex:1;min-width:180px;line-height:1.45}'+
 // persistent, read-only contract status strip at the top of the Deal tab (process-at-a-glance)
 '.dstrip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 12px;margin:0 0 8px;background:var(--surface);border:1px solid var(--line2,#DCD8D2);border-radius:10px}'+
 '.dstripk{font:700 9px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,var(--mut2));margin-right:2px}'+
 '.dschip{font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--ink,#1A1A1A);background:var(--bg,#FBFAF9);border:1px solid var(--line2,#DCD8D2);border-radius:30px;padding:3px 10px;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}'+
 '.dschip b{font-weight:700}'+
 '.dschip .dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--mut2,var(--mut2))}'+
 '.dschip .dot.lilly{background:var(--plum)}.dschip .dot.supplier{background:#5B4FB0}'+
 '.dschip.st{border-color:#C6D7EF;background:var(--blue-t,#E4EBF1);color:var(--plum)}'+
 '.dschip.st.review{border-color:#E7C66B;background:var(--amber-t,#FBF1DA);color:var(--amber-d,#8A5A00)}'+
 '.dschip.st.supplier{border-color:#D8CFEA;background:var(--tint-ece8f2,#ECE8F2);color:#5B4FB0}'+
 '.dschip.paper{border-color:#D8CFEA;background:var(--tint-ece8f2,#ECE8F2);color:#5B4FB0}'+
 '.dschip.paper.lilly{border-color:#C6D7EF;background:var(--blue-t,#E4EBF1);color:var(--plum)}'+
 '.dstripnote{font-size:11px;color:var(--mut2,var(--mut2));font-style:italic;margin:0 0 12px;line-height:1.45}'+
 // B4: state-gated "waiting on supplier" chip that rides with the version actions
 '.cvwait{display:inline-flex;align-items:center;gap:6px;font:600 11.5px var(--sans,system-ui,sans-serif);color:var(--mut,#3E3933);background:var(--bg,#FBFAF9);border:1px solid var(--line2,#DCD8D2);border-radius:30px;padding:5px 11px}'+
 '.cvwait .dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--mut2,var(--mut2))}.cvwait .dot.supplier{background:#5B4FB0}'+
 // B5: supplier-vs-Lilly deviation folded into a Key issue + the on-supplier-paper banner
 '.dipaper{margin-top:7px;padding-top:7px;border-top:1px dashed var(--line2,#DCD8D2);display:grid;gap:3px}'+
 '.diprow{display:flex;gap:8px;font-size:12px;line-height:1.4}'+
 '.dipk{flex:0 0 58px;color:var(--mut2,#8A827C);font-weight:600}'+
 '.paperbanner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--tint-ece8f2,#ECE8F2);border:1px solid #D8CFEA;border-left:3px solid #5B4FB0;border-radius:10px;padding:9px 12px;margin:0 0 11px}'+
 '.paperbanner .pbtx{flex:1;min-width:200px;font-size:12px;line-height:1.45;color:var(--ink,#1A1A1A)}'+
 // RFx structure editor (pre-lock) + evaluator submit controls
 '.rfxedit{border:1px dashed var(--line2,#E0DCD5);border-radius:10px;padding:11px 12px;margin:0 0 10px;background:var(--bg,#FBFAF9)}'+
 '.rfxedh{font-weight:700;font-size:12.5px;margin-bottom:9px}'+
 '.rfxcrit{display:flex;align-items:center;gap:8px;margin:0 0 7px}'+
 '.rfxcname{flex:1;min-width:0;border:1px solid var(--line2,#E0DCD5);border-radius:7px;padding:5px 9px;font:500 12.5px var(--sans,system-ui,sans-serif)}'+
 '.rfxcw{width:56px;border:1px solid var(--line2,#E0DCD5);border-radius:7px;padding:5px 7px;font:600 12.5px var(--sans,system-ui,sans-serif);text-align:right}'+
 '.rfxcpct{color:var(--mut2,#8A827C);font-size:12px}'+
 '.rfxcx{border:none;background:none;color:var(--mut2,#8A827C);cursor:pointer;font-size:18px;line-height:1;padding:0 4px}.rfxcx:hover{color:var(--red,#C8202E)}'+
 '.rfxedf{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:9px}'+
 '.rfxsum{font-weight:700;font-size:12px;margin-left:auto}.rfxsum.ok{color:var(--plum)}.rfxsum.bad{color:var(--red,#C8202E)}'+
 '.rfxsubwrap{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0 4px}'+
 '.rfxsubok{font-weight:700;font-size:12.5px;color:var(--plum)}'+
 // RFx must-have gate + two-level criteria rubric
 '.gate{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:30px;white-space:nowrap}'+
 '.gate.ok{background:rgba(92,43,80,.12);color:var(--plum)}.gate.fail{background:var(--pink-t,#FBE7E3);color:var(--red,#C8202E)}'+
 '.rfxgate{border-radius:9px;padding:9px 12px;margin:10px 0 0;font-size:12px;line-height:1.5}.rfxgate.warn{background:var(--tint-fbefc9,#FBEFC9);border:1px solid #E7C66B;color:#6E5600}'+
 '.rfxrubric{margin-top:11px;border-top:1px solid var(--line,#EEE);padding-top:10px}.rfxrubric summary{cursor:pointer;font-weight:700;font-size:12.5px;color:var(--plum)}'+
 '.rfxrcat{margin:9px 0 0;padding:8px 10px;border:1px solid var(--line2,#E0DCD5);border-radius:9px}'+
 '.rfxrhd{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.rfxrname{font-weight:700;font-size:12.5px}.rfxrw{font-weight:700;font-size:12px;color:var(--plum);flex:none}'+
 '.rfxrsubs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.rfxrsub{font-size:11px;color:var(--mut,#4A4540);background:var(--bg,#F7F5F1);border-radius:30px;padding:3px 9px}.rfxrsub i{color:var(--mut2,#8A827C);font-style:normal;font-weight:700}'+
 '.rfxmust{font:700 8px var(--mono,monospace);text-transform:uppercase;background:var(--pink-t,#FBE7E3);color:var(--red,#C8202E);border-radius:30px;padding:2px 6px}'+
 '.rfxbands{font-size:11px;color:var(--mut2,#8A827C);margin-top:9px;line-height:1.5}'
 ; document.head.appendChild(s);
}
// F4: the whole-deal ZOPA band (opening/target/walk/ask) computed ONCE from the
// ZOPA lines, so the Negotiation-prep combined target and the ZOPA total row share
// one reconciled source - the prep target literally sets/matches the ZOPA opening.
// Per-year values reconcile the prep card (annual) with the ZOPA total (whole horizon).
function zopaTcoBand(){
 var tgtTot=0,walkTot=0,askTot=0,openTot=0;
 (pvData('deal.zopa',ZOPA_LINES)||[]).forEach(function(l){
  var open=Math.max(l.lo,l.target-(l.walk-l.target));l.open=open;
  tgtTot+=zLineTco(l,'target');walkTot+=zLineTco(l,'walk');askTot+=zLineTco(l,'ask');openTot+=zLineTco(l,'open');
 });
 var years=(typeof DEAL_TCO!=='undefined'&&DEAL_TCO.years)||1;
 return {open:openTot,target:tgtTot,walk:walkTot,ask:askTot,years:years,
  openPerYr:years?openTot/years:openTot,targetPerYr:years?tgtTot/years:tgtTot,walkPerYr:years?walkTot/years:walkTot};
}
function zopaGanttHTML(){
 var P=pvData('deal.pricing',PRICING);var Z=pvData('deal.zopa',ZOPA_LINES);
 var rows=Z.map(function(l){
  var min=Math.min(l.lo,l.target),max=Math.max(l.hi,l.walk,l.ask),pad=(max-min)*0.08;min-=pad;max+=pad;var span=max-min||1;
  var pct=function(v){return ((v-min)/span*100);};
  var over=l.ask>l.walk;
  // Theo's suggested OPENING offer: anchor aggressively but credibly (floored at the market low),
  // below our target so there is room to negotiate up. Our own position never exceeds our walk-away.
  var open=Math.max(l.lo,l.target-(l.walk-l.target));l.open=open;
  // folded pricing detail: price (current vs proposed), market benchmark/percentile, Theo's read
  var b=zBench(l);var pctl=zPctile(l);
  var mkt=(b?b.note:'benchmarked')+(pctl!=null?' · ~'+pctl+'th pct of market range':'');
  var detail='<div class="zdetail">'+
    '<div class="zdrow"><span class="zdk">Price</span><span class="zdv">supplier ask <b>'+zfmt(l,l.ask)+'</b> vs our target '+zfmt(l,l.target)+' · walk-away '+zfmt(l,l.walk)+'</span></div>'+
    '<div class="zdrow"><span class="zdk">Theo opening</span><span class="zdv">open at <b>'+zfmt(l,open)+'</b> - leaves room to settle at the '+zfmt(l,l.target)+' target</span></div>'+
    '<div class="zdrow"><span class="zdk">Market</span><span class="zdv"><span class="gsev '+(b&&b.flag==='over'?'med':'low')+'">'+mkt+'</span></span></div>'+
    '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">'+l.read+'</span></div>'+
   '</div>';
  return '<div class="zline"><div class="zlhd"><span class="zlname">'+l.item+'</span><span class="zlask '+(over?'over':'ok')+'">supplier ask '+zfmt(l,l.ask)+(over?' · above our walk-away':' · within our range')+'</span></div>'+
   '<div class="ztrack">'+
    '<div class="zmkt" style="left:'+pct(l.lo)+'%;width:'+(pct(l.hi)-pct(l.lo))+'%"></div>'+
    '<div class="zmed" style="left:'+pct(l.med)+'%" title="market median '+zfmt(l,l.med)+'"></div>'+
    '<div class="zzopa" style="left:'+pct(l.target)+'%;width:'+(pct(l.walk)-pct(l.target))+'%" title="ZOPA '+zfmt(l,l.target)+' to '+zfmt(l,l.walk)+'"></div>'+
    '<div class="ztgt" style="left:'+pct(l.target)+'%" title="target '+zfmt(l,l.target)+'"></div>'+
    '<div class="zwalk" style="left:'+pct(l.walk)+'%" title="walk-away '+zfmt(l,l.walk)+'"></div>'+
    '<div class="zask '+(over?'over':'ok')+'" style="left:calc('+pct(l.ask)+'% - 5px)" title="supplier ask '+zfmt(l,l.ask)+'"></div>'+
    '<div class="zopen" style="left:'+pct(open)+'%" title="Theo suggested opening '+zfmt(l,open)+'"></div>'+
   '</div>'+
   '<div class="zlleg"><span>market '+zfmt(l,l.lo)+' to '+zfmt(l,l.hi)+'</span><span class="zztgt">ZOPA '+zfmt(l,l.target)+' to '+zfmt(l,l.walk)+'</span><span>median '+zfmt(l,l.med)+'</span></div>'+
   detail+'</div>';
 }).join('');
 // ---- TCO ZOPA total row: whole-deal band from the shared helper (F4: the SAME
 // band the Negotiation-prep combined target shows, so opening = the prep target) ----
 var _B=zopaTcoBand();var tgtTot=_B.target,walkTot=_B.walk,askTot=_B.ask,openTot=_B.open;
 var askOver=askTot>walkTot;var apart=Math.abs(askTot-tgtTot);
 var totRead='Supplier ask '+zTco(askTot)+' sits '+(askOver?'above':'within')+' our '+zTco(walkTot)+' walk-away; the '+zTco(tgtTot)+' target anchors the deal, about '+zTco(apart)+' below ask. The per-seat license is the biggest lever.';
 var matched={};Z.forEach(function(l){matched[l.bench]=1;});
 var extra=(P.benchmarks||[]).filter(function(b){return !matched[b.item];}); // benchmarks with no ZOPA line (e.g. sandbox)
 var total='<div class="ztotal">'+
   '<div class="zthd"><span class="ztname">Total-deal ZOPA · TCO</span><span class="ztsub">'+DEAL_TCO.seats+' seats · '+DEAL_TCO.years+'-yr term · target to walk-away for the whole deal</span></div>'+
   '<div class="ztband"><span class="ztchip open">Theo opening '+zTco(openTot)+'</span><span class="ztchip tgt">Target '+zTco(tgtTot)+'</span><span class="ztarrow">to</span><span class="ztchip walk">Walk-away '+zTco(walkTot)+'</span><span class="ztchip '+(askOver?'over':'ok')+'">Supplier ask '+zTco(askTot)+'</span></div>'+
   '<div class="zdetail">'+
     '<div class="zdrow"><span class="zdk">Current vs proposed</span><span class="zdv">supplier ask <b>'+zTco(askTot)+'</b> vs our proposed target '+zTco(tgtTot)+' ('+zTco(apart)+' apart)</span></div>'+
     '<div class="zdrow"><span class="zdk">Opening</span><span class="zdv">The <b>'+zTco(openTot)+'</b> opening is the Negotiation-prep combined target above (about '+zTco(_B.openPerYr)+'/yr), aggregated across the '+DEAL_TCO.years+'-yr horizon.</span></div>'+
     '<div class="zdrow"><span class="zdk">Normalized</span><span class="zdv">'+P.normalize.normalized+' all-in. '+P.normalize.note+'</span></div>'+
     (extra.length?'<div class="zdrow"><span class="zdk">Also benchmarked</span><span class="zdv">'+extra.map(function(b){return b.item+' '+b.ours+' ('+b.note+')';}).join('; ')+'</span></div>':'')+
     '<div class="zdrow"><span class="zdk">Model-change watch</span><span class="zdv">'+P.reconcile.delta+'</span></div>'+
     '<div class="zdrow"><span class="zdk">Read</span><span class="zdv">'+totRead+'</span></div>'+
   '</div></div>';
 return '<div class="sect"><div class="secthd"><div class="t">ZOPA by line item · pricing &amp; benchmarks</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">market range · target to walk-away · Theo opening · supplier ask · benchmark read</span></div><div class="card">'+rows+total+'<div class="zopalegend"><span><i class="zlg mkt"></i>market range</span><span><i class="zlg zopa"></i>ZOPA (target to walk-away)</span><span><i class="zlg open"></i>Theo opening</span><span><i class="zlg ask"></i>supplier ask</span></div></div></div>';
}
function dealIssuesHTML(){
 // every issue carries BOTH chips: a category chip and a severity chip (Hard-Stop / High / Med / Low)
 var sevLab=function(s){return s==='hardstop'?'Hard-Stop':s==='high'?'High':s==='med'?'Med':s==='low'?'Low':'Med';};
 var rows=pvData('deal.issues',DEAL_ISSUES).map(function(it){
  var sv=it.sev||'med';
  var cat='<span class="dcat">'+(it.cat||'Commercial')+'</span>';
  var sev='<span class="gsev '+(sv==='hardstop'?'high':sv)+'">'+sevLab(sv)+(it.sec?' · '+it.sec:'')+'</span>';
  var neg=it.neg?'<div class="dirow"><span class="dik">Target</span><span class="div">'+it.neg.target+'</span></div><div class="dirow"><span class="dik">Fallback</span><span class="div">'+it.neg.fallback+'</span></div>'+(it.neg.hs?'<div class="dirow"><span class="dik">Hard-stop</span><span class="div hs">'+it.neg.hs+'</span></div>':''):'<div class="direv none">No negotiation lever.</div>';
  var rev=it.review?'<div class="direvd">'+it.review.d+'</div><div class="difix"><b>Redline:</b> '+it.review.fix+'</div>':'<div class="direv none">No contract-review finding; commercial lever only.</div>';
  // folded paper deviation: the supplier-paper term vs the Lilly-template standard (shown when this issue deviates)
  var paper=it.paper?'<div class="dipaper"><div class="diprow"><span class="dipk">Supplier</span><span>'+it.paper.supplier+'</span></div><div class="diprow"><span class="dipk">Lilly</span><span>'+it.paper.lilly+'</span></div></div>':'';
  return '<div class="dissue"><div class="dihd">'+cat+sev+'<span class="din">'+it.name+'</span></div><div class="dibody"><div class="dicol"><div class="dicolh">Negotiation stance</div>'+neg+'</div><div class="dicol"><div class="dicolh">Contract review</div>'+rev+paper+'</div></div></div>';
 }).join('');
 // On supplier paper (review mode): a compact banner folds the deviation count in and keeps the
 // "map to Lilly template" ACTION here at the right moment - not a persistent standalone section.
 var banner='';
 if(typeof PAPER!=='undefined'&&PAPER.onSupplierPaper&&typeof DEAL_MODE!=='undefined'&&DEAL_MODE==='review'){
  var pbHi=PAPER.deviations.filter(function(x){return x.sev==='high';}).length;
  banner='<div class="paperbanner"><div class="pbtx"><b>On '+SUPPLIER_CONTACT.company+' paper.</b> This draft arrived on the supplier\'s paper - '+PAPER.deviations.length+' deviations from the Lilly template ('+pbHi+' high), folded into the issues below. Negotiate from the Lilly standard, not theirs.</div><button class="btn btn-primary btn-sm" onclick="mapToTemplate()">Map to Lilly template</button></div>';
 }
 return '<div class="sect"><div class="secthd"><div class="t">Key issues</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">each issue once · category + severity · negotiation stance + contract-review read</span></div>'+banner+rows+'</div>';
}
// F6: "Practice" preloads THIS project's context into the private sandbox via a
// same-origin sessionStorage handoff (nothing is written back to the project; the
// rehearsal stays private to the user). Reflect-only.
function practicePreload(){
 var P=(typeof PROJECTS!=='undefined'&&PROJECTS[CURPROJ])||{};
 var t=(P.type||'').toLowerCase();
 var ctype=/renew/.test(t)?'renewal amendment':/amend/.test(t)?'amendment':'new agreement';
 var objs=[];try{if(typeof NEGPREP!=='undefined'&&NEGPREP&&NEGPREP.talking)objs=NEGPREP.talking.slice(0,3);}catch(e){}
 var payload={source:'project',projectId:CURPROJ,supplier:P.supplier||'',category:P.commodity||P.type||'',contractType:ctype,objectives:objs};
 try{sessionStorage.setItem('theoPracticePreload',JSON.stringify(payload));}catch(e){}
 location.href='negotiation-practice.html';
}
function dealNegotiateExtras(){var N=pvData('deal.negprep',NEGPREP);ensureNegLegalCss();
 // Legal Negotiation surface (Wave 5a): 4-tier strategy, 5-persona playbook, tier
 // position map, multi-round concession sequencing + BATNA, SME pre-engagement, and
 // the MSA-already-covers filter. Reflect-only; all quotes/briefs are drafts for the
 // human, acceptance rates are labeled benchmarks with N, nothing is sent.
 return negStrategyHTML()+
  '<div class="sect"><div class="secthd"><div class="t">Leverage read</div><a class="dlk" href="negotiation-practice.html" onclick="practicePreload();return false;" title="Preloads this project into the private practice sandbox">Practice this negotiation (preloads this project) →</a></div><p class="cnote">'+escD(N.leverage)+'</p></div>'+
  negPlaybookHTML()+
  negPositionMapHTML()+
  '<div class="sect"><div class="secthd"><div class="t">Talking points</div></div><ul class="bullets">'+N.talking.map(function(t){return '<li>'+escD(t)+'</li>';}).join('')+'</ul></div>'+
  '<div class="sect"><div class="secthd"><div class="t">Red lines · do not cross</div></div><ul class="bullets">'+N.redlines.map(function(t){return '<li class="redline-li">'+escD(t)+'</li>';}).join('')+'</ul></div>'+
  negSequencingHTML()+
  negSmeHTML()+
  negMsaCoveredHTML()+
  dealCommercialExtras();   // Wave 5b: Commercial analysis depth (items 7-10, 12), AFTER the legal blocks
}
// Fold-in (Deal / Negotiation Strategy group): concession sequencing - give the
// low-cost, high-value trades first, in order. Reflect-only; illustrative.
function dealConcessionSeqHTML(){
 var seq=[
  {give:'Multi-year term (4-yr)',get:'Annual fee step-down + a renewal price cap'},
  {give:'Reference / case study',get:'Implementation fee waiver'},
  {give:'Faster payment (net-30)',get:'2-3% headline discount'},
  {give:'Scope trim (drop sandbox)',get:'Hold the line on the per-seat rate'}
 ];
 var rows=seq.map(function(s,i){return '<tr><td style="text-align:center;font-weight:700;color:var(--plum)">'+(i+1)+'</td><td class="iss">'+escD(s.give)+'</td><td>'+escD(s.get)+'</td></tr>';}).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Concession sequencing</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">give low-cost first, in order</span></div><div class="card" style="padding:4px 6px"><table class="agenda"><thead><tr><th>Order</th><th>Concede</th><th>In exchange for</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="spnote">Sequence concessions so the low-cost, high-value trades come first. Reflect-only; the rep decides what to actually offer.</div></div>';
}
/* ===========================================================================
 * LEGAL NEGOTIATION surface (Wave 5a), 4-tier position taxonomy, 5-persona
 * playbook, tier position map, multi-round concession sequencing + BATNA, SME
 * pre-engagement, and the MSA-already-covers filter. Reflect-only / draft-don't-
 * send. Positive accent = Bold Blue var(--plum) (never green): RED LINE = red,
 * HOLD FIRM = bold-blue, STRATEGIC TRADE = amber, EASY CONCEDE = neutral grey.
 * Every dynamic value is escaped (escD) before innerHTML.
 * ========================================================================= */
var NEG_TIER={
 'redline':{short:'RED LINE',cls:'redline',c:'#C8202E'},
 'hold-firm':{short:'HOLD FIRM',cls:'holdfirm',c:'var(--plum)'},
 'strategic-trade':{short:'STRATEGIC TRADE',cls:'trade',c:'#B45309'},
 'easy-concede':{short:'EASY CONCEDE',cls:'concede',c:'var(--mut2)'}
};
var NEG_TIER_ORDER=['redline','hold-firm','strategic-trade','easy-concede'];
var NEG_TONES=['Standard','Collaborative','Aggressive','Curious','Astonished'];
var NEG_TONE_C={Standard:'#1A1A1A',Collaborative:'var(--plum)',Aggressive:'#C8202E',Curious:'var(--plum)',Astonished:'#6B21A8'};
var negPlaybookTone='Standard';
var negShowMsaCovered=false;
// Enriched negotiation positions (aligned to the Deal Key issues but negotiation-
// only, so the shared DEAL_ISSUES / Review surface is untouched). tier + tones +
// args + pushback + rebuttal + accept + confidence per position. accept = labeled
// market benchmark with sample size (N); confidence = evidence-quality stamp.
var NEG_POSITIONS=_PVNEG.positions||[];
// Multi-round concession sequence (replaces the single give/get table) + BATNA card.
var NEG_SEQ=_PVNEG.seq||[];
var NEG_BATNA=_PVNEG.batna||{head:'',body:''};
// SME pre-engagement briefs, derived from the position clause types (privacy / legal
// / cyber). Reflect-only drafts to route before Round 1; nothing is sent.
var NEG_SME=_PVNEG.sme||[];
function ensureNegLegalCss(){ if(document.getElementById('neg-legal-css'))return; var s=document.createElement('style'); s.id='neg-legal-css'; s.textContent=
 '.ngkpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 12px}'+
 '@media(max-width:680px){.ngkpis{grid-template-columns:repeat(2,1fr)}}'+
 '.ngkpi{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 13px;background:var(--surface)}'+
 '.ngkpi .v{font:800 20px var(--sans,system-ui,sans-serif);line-height:1.1;color:var(--ink,#1A1A1A)}'+
 '.ngkpi .l{font-size:11px;color:var(--mut2,#8A827C);margin-top:3px;font-weight:600}'+
 '.ngposture{background:var(--amber-t,#FBF1DA);border:1px solid #E7C66B;border-left:3px solid #B45309;border-radius:11px;padding:12px 14px;margin:0 0 12px}'+
 '.ngposture h4{margin:0 0 5px;font:700 13.5px var(--sans,system-ui,sans-serif);color:var(--amber-d)}'+
 '.ngposture p{margin:0;font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.ngtiers{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 2px}'+
 '@media(max-width:680px){.ngtiers{grid-template-columns:repeat(2,1fr)}}'+
 '.ngtier{border-radius:11px;padding:11px 13px;border:1px solid}'+
 '.ngtier .v{font:800 20px var(--sans,system-ui,sans-serif);line-height:1.1}'+
 '.ngtier .l{font:700 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;margin-top:4px}'+
 '.ngtier.redline{background:var(--pink-t,#FBE7E3);border-color:#F1C7C2}.ngtier.redline .v,.ngtier.redline .l{color:#C8202E}'+
 '.ngtier.holdfirm{background:var(--blue-t,#E4EBF1);border-color:#C6D7EF}.ngtier.holdfirm .v,.ngtier.holdfirm .l{color:var(--plum)}'+
 '.ngtier.trade{background:var(--tint-fff0d8,#FFF0D8);border-color:#E7C66B}.ngtier.trade .v,.ngtier.trade .l{color:#B45309}'+
 '.ngtier.concede{background:var(--bg,#F4F1EC);border-color:var(--line2,#E0DCD5)}.ngtier.concede .v,.ngtier.concede .l{color:var(--mut2)}'+
 '.ngtone-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 10px}'+
 '.ngtone-lbl{font:700 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C);margin-right:3px}'+
 '.ngtone-btn{border:1px solid var(--line2,#E0DCD5);background:var(--surface);border-radius:30px;padding:5px 12px;font:600 12px var(--sans,system-ui,sans-serif);color:var(--mut,#3E3933);cursor:pointer}'+
 '.ngtone-btn.on{border-width:1.5px;font-weight:700}'+
 '.ngpos{border:1px solid var(--line2,#E0DCD5);border-radius:9px;margin:0 0 11px;background:var(--surface);overflow:hidden;box-shadow:0 1px 2px rgba(28,28,34,.04),0 4px 11px -4px rgba(28,28,34,.09)}'+
 '.ngpos.compliance{border-left:3px solid #C8202E}'+
 '.ngpos-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:11px 14px;border-bottom:1px solid var(--line,#EEE);background:var(--bg,#FBFAF9)}'+
 '.ngpos-title{font-weight:700;font-size:13.5px;color:var(--ink,#1A1A1A);flex:1;min-width:140px}'+
 '.ngtierchip{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;padding:3px 9px;border-radius:30px;white-space:nowrap}'+
 '.ngtierchip.redline{background:var(--pink-t,#FBE7E3);color:#C8202E}.ngtierchip.holdfirm{background:var(--blue-t,#E4EBF1);color:var(--plum)}.ngtierchip.trade{background:var(--tint-fff0d8,#FFF0D8);color:#B45309}.ngtierchip.concede{background:var(--bg,#F4F1EC);color:var(--mut2)}'+
 '.ngaccept{font:600 10.5px var(--mono,monospace);color:var(--plum);background:rgba(92,43,80,.10);border-radius:30px;padding:3px 9px;white-space:nowrap}'+
 '.ngconf{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:3px 8px;border-radius:30px;white-space:nowrap}'+
 '.ngconf.hi{background:rgba(92,43,80,.12);color:var(--plum)}.ngconf.md{background:var(--amber-t,#FBF1DA);color:var(--amber-d)}.ngconf.lo{background:var(--pink-t,#FBE7E3);color:#C8202E}'+
 '.ngpos-body{padding:12px 14px}'+
 '.ngquote{border-left:3px solid var(--plum);background:var(--tint-f4f6fb,#F4F6FB);border-radius:0 8px 8px 0;padding:9px 12px;margin:0 0 11px}'+
 '.ngquote .tt{font:700 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}'+
 '.ngquote .qq{font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A);font-style:italic}'+
 '.ngk{font:700 9.5px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--mut2,#8A827C);margin:9px 0 3px}'+
 '.ngk.amb{color:#B45309}.ngk.mut{color:var(--mut2,#8A827C)}'+
 '.ngtxt{font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.ngargs{margin:3px 0 0;padding-left:18px}.ngargs li{font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A);margin-bottom:3px}'+
 '.ngcomp-note{margin-top:10px;font-size:11.5px;line-height:1.45;color:#C8202E;background:var(--pink-t,#FBE7E3);border-radius:8px;padding:8px 10px}'+
 '.ngpm-h{font:700 11px var(--mono,monospace);letter-spacing:.05em;text-transform:uppercase;margin:14px 0 8px}'+
 '.ngpm-card{border:1px solid var(--line2,#E0DCD5);border-radius:11px;padding:11px 13px;margin:0 0 9px;background:var(--surface)}'+
 '.ngpm-card.compliance{border-left:3px solid #C8202E}'+
 '.ngpm-title{display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap;font-weight:700;font-size:13px;color:var(--ink,#1A1A1A);margin-bottom:7px}'+
 '.ngpm-row{display:flex;gap:8px;font-size:12.5px;line-height:1.45;margin-bottom:3px}'+
 '.ngpm-k{flex:0 0 66px;color:var(--mut2,#8A827C);font-weight:600}.ngpm-v{color:var(--ink,#1A1A1A);flex:1}.ngpm-v.hs{color:#C8202E;font-weight:600}'+
 '.ngpm-tag{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;color:#C8202E;background:var(--pink-t,#FBE7E3);border-radius:30px;padding:3px 8px;margin-top:6px;display:inline-block}'+
 '.ngseq{border:1px solid var(--line2,#E0DCD5);border-radius:12px;margin:0 0 11px;background:var(--surface);overflow:hidden}'+
 '.ngseq-h{font-weight:700;font-size:13.5px;color:#fff;padding:9px 14px;background:var(--plum)}'+
 '.ngseq.r2 .ngseq-h{background:#B45309}.ngseq.r3 .ngseq-h{background:#C8202E}'+
 '.ngseq-obj{display:flex;gap:9px;padding:10px 14px 4px}'+
 '.ngseq-obj .ol{font:700 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C);flex:0 0 66px;padding-top:2px}'+
 '.ngseq-obj .ov{font-size:12.5px;line-height:1.45;color:var(--ink,#1A1A1A);font-weight:600;flex:1}'+
 '.ngseq-moves{margin:4px 0 0;padding:0 14px}.ngseq-moves ol{margin:0;padding-left:18px}.ngseq-moves li{font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A);margin-bottom:4px}'+
 '.ngseq-risk{padding:8px 14px 12px}.ngseq-risk .rk{font:700 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C);margin-bottom:2px}.ngseq-risk .rv{font-size:12px;color:var(--mut,#3E3933);line-height:1.45}'+
 '.ngbatna{background:var(--pink-t,#FBE7E3);border:1px solid #F1C7C2;border-left:3px solid #C8202E;border-radius:11px;padding:12px 14px;margin:2px 0 0}'+
 '.ngbatna .bh{font:700 12.5px var(--sans,system-ui,sans-serif);color:#C8202E;margin-bottom:4px}'+
 '.ngbatna p{margin:0;font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A)}'+
 '.ngsme{border:1px solid var(--line2,#E0DCD5);border-radius:12px;padding:12px 14px;margin:0 0 10px;background:var(--surface)}'+
 '.ngsme-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}'+
 '.ngsme-top h4{margin:0;font:700 13.5px var(--sans,system-ui,sans-serif);color:var(--ink,#1A1A1A)}'+
 '.ngsme-mail{font:600 11.5px var(--mono,monospace);color:var(--plum);margin-top:2px}'+
 '.ngsme-tag{font:700 8.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;color:var(--plum);background:var(--blue-t,#E4EBF1);border-radius:30px;padding:3px 9px;white-space:nowrap}'+
 '.ngsme-topic{font-size:12.5px;line-height:1.5;color:var(--ink,#1A1A1A);margin-top:9px}'+
 '.ngsme-brief{font-size:12.5px;line-height:1.55;color:var(--mut,#3E3933);margin-top:7px}'+
 '.ngsme-askh{font:700 9.5px var(--mono,monospace);text-transform:uppercase;letter-spacing:.05em;color:var(--mut2,#8A827C);margin:10px 0 5px}'+
 '.ngasks{list-style:none;margin:0;padding:0}'+
 '.ngasks li{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.45;color:var(--ink,#1A1A1A);margin-bottom:5px}'+
 '.ngasks .num{flex:none;width:17px;height:17px;border-radius:50%;background:var(--plum);color:#fff;font:700 10px var(--sans,system-ui,sans-serif);display:flex;align-items:center;justify-content:center;margin-top:1px}'+
 '.ngmsa{border:1px dashed var(--line2,#DCD8D2);border-radius:11px;padding:11px 13px;background:var(--bg,#FBFAF9)}'+
 '.ngmsa-note{font-size:12.5px;line-height:1.5;color:var(--mut,#3E3933)}'+
 '.ngmsa-toggle{border:1px solid var(--line2,#E0DCD5);background:var(--surface);border-radius:8px;padding:5px 11px;font:600 12px var(--sans,system-ui,sans-serif);color:var(--plum);cursor:pointer;margin-top:9px}'+
 '.ngmsa-card{border:1px solid var(--line2,#E0DCD5);border-radius:10px;padding:10px 12px;margin-top:9px;background:var(--surface)}'+
 '.ngmsa-card .mt{font-weight:700;font-size:12.5px;color:var(--ink,#1A1A1A)}'+
 '.ngmsa-card .mr{font:600 11px var(--mono,monospace);color:var(--plum);margin:3px 0}'+
 '.ngmsa-card .mn{font-size:12px;line-height:1.45;color:var(--mut,#3E3933)}'
 ; document.head.appendChild(s);
}
function negOpenPositions(){return NEG_POSITIONS.filter(function(p){return !p.msaCovered;});}
function negMsaPositions(){return NEG_POSITIONS.filter(function(p){return p.msaCovered;});}
function negConfChip(c){var k=(''+(c||'')).toLowerCase();var cls=k.indexOf('h')===0?'hi':k.indexOf('l')===0?'lo':'md';var lab=cls==='hi'?'High':cls==='lo'?'Low':'Med';return '<span class="ngconf '+cls+'" title="Confidence based on evidence quality and sample size">Confidence: '+lab+'</span>';}
// ITEM 1, Strategy: KPI tiles + opening-posture banner + 4 tier-count tiles.
function negStrategyHTML(){
 var open=negOpenPositions();
 var counts={};NEG_TIER_ORDER.forEach(function(t){counts[t]=0;});
 var compliance=0;
 open.forEach(function(p){if(counts[p.tier]!=null)counts[p.tier]++;if(p.compliance)compliance++;});
 var redlines=counts['redline'];
 var diff=redlines>=3?'High':redlines>=1?'Moderate':'Low';
 var diffC=redlines>=3?'#C8202E':redlines>=1?'#B45309':'var(--plum)';
 var kpis='<div class="ngkpis">'+
   '<div class="ngkpi"><div class="v" style="color:'+diffC+'">'+escD(diff)+'</div><div class="l">Negotiation difficulty</div></div>'+
   '<div class="ngkpi"><div class="v" style="color:#C8202E">'+redlines+'</div><div class="l">Red lines</div></div>'+
   '<div class="ngkpi"><div class="v">'+open.length+'</div><div class="l">Open positions</div></div>'+
   '<div class="ngkpi"><div class="v" style="color:#B45309">'+compliance+'</div><div class="l">Compliance leverage</div></div>'+
  '</div>';
 var posture='<div class="ngposture"><h4>Opening posture: collaborative but firm on MSA alignment and PI protections</h4>'+
   '<p>'+escD('This is a sole-source continuation for a marquee, multi-year Acme engagement. Frame the asks as aligning the Work Order with the MSA and AI Standard both parties already executed, not as new demands. Lead with the venue concession and the MSA/DPA-alignment items to build early agreement, then hold firm on the two red lines - the PI-breach liability carve-out and the Lilly DPA/SCCs. The AI Standard §3.5 position is the item with compliance teeth; use it to anchor the ownership ask and the whole package.')+'</p></div>';
 var tiles='<div class="ngtiers">'+NEG_TIER_ORDER.map(function(t){var m=NEG_TIER[t];return '<div class="ngtier '+m.cls+'"><div class="v">'+counts[t]+'</div><div class="l">'+escD(m.short)+'</div></div>';}).join('')+'</div>';
 return '<div class="sect"><div class="secthd"><div class="t">Negotiation strategy</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">4-tier position taxonomy · reflect-only</span></div>'+kpis+posture+tiles+'</div>';
}
// ITEM 2, Playbook: 5-persona tone toggle that live-repaints per-position quotes,
// plus Position / Arguments / Likely pushback / Rebuttal / Fallback, an acceptance
// (+N) badge and a confidence stamp. negSetTone re-renders only the playbook body.
function negPlaybookHTML(){
 return '<div class="sect"><div class="secthd"><div class="t">Position playbook</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">argument · predicted pushback · rebuttal · fallback</span></div><div id="negPlaybookBody">'+negPlaybookInner()+'</div></div>';
}
function negPlaybookInner(){
 var tone=negPlaybookTone;
 var row='<div class="ngtone-row"><span class="ngtone-lbl">Argument tone</span>'+NEG_TONES.map(function(t){var on=t===tone;var c=NEG_TONE_C[t];return '<button class="ngtone-btn'+(on?' on':'')+'" onclick="negSetTone(\''+t+'\')"'+(on?' style="border-color:'+c+';color:'+c+'"':'')+'>'+t+'</button>';}).join('')+'</div>';
 var note='<div class="spnote" style="margin-bottom:11px">Each position shows the argument, the supplier pushback we expect, our rebuttal, and the fallback. Toggle the tone to see the same substance reframed across five personas - the position never changes, only the framing. Acceptance rates are labeled market benchmarks with sample size (N); nothing here is sent.</div>';
 var blocks=negOpenPositions().map(function(p){return negPosBlock(p,tone);}).join('');
 return row+note+blocks;
}
function negPosBlock(p,tone){
 var m=NEG_TIER[p.tier]||NEG_TIER['hold-firm'];var c=NEG_TONE_C[tone]||NEG_TONE_C.Standard;
 var head='<div class="ngpos-head"><span class="ngpos-title">'+escD(p.title)+'</span>'+
   '<span class="ngtierchip '+m.cls+'">'+escD(m.short)+'</span>'+
   (p.accept?'<span class="ngaccept" title="Market acceptance benchmark with sample size">'+escD(p.accept)+'</span>':'')+
   negConfChip(p.confidence)+'</div>';
 var quote='<div class="ngquote" style="border-left-color:'+c+'"><div class="tt" style="color:'+c+'">'+escD(tone)+' tone</div><div class="qq">'+escD((p.tones&&(p.tones[tone]||p.tones.Standard))||'')+'</div></div>';
 var args='<ul class="ngargs">'+(p.args||[]).map(function(a){return '<li>'+escD(a)+'</li>';}).join('')+'</ul>';
 var comp=(p.compliance&&p.complianceNote)?'<div class="ngcomp-note"><b>Compliance leverage:</b> '+escD(p.complianceNote)+'</div>':'';
 var body='<div class="ngpos-body">'+quote+
   '<div class="ngk">Position</div><div class="ngtxt">'+escD(p.position)+'</div>'+
   '<div class="ngk">Arguments</div>'+args+
   '<div class="ngk amb">Likely pushback</div><div class="ngtxt">'+escD(p.pushback)+'</div>'+
   '<div class="ngk">Rebuttal</div><div class="ngtxt">'+escD(p.rebuttal)+'</div>'+
   '<div class="ngk mut">Fallback</div><div class="ngtxt">'+escD(p.fallback)+'</div>'+
   comp+'</div>';
 return '<div class="ngpos'+(p.compliance?' compliance':'')+'">'+head+body+'</div>';
}
function negSetTone(t){negPlaybookTone=t;var el=document.getElementById('negPlaybookBody');if(el)el.innerHTML=negPlaybookInner();}
// ITEM 3, Position map grouped by the 4 tiers; each card = target + fallback +
// acceptance badge + compliance-position styling (red left border + tag).
function negPositionMapHTML(){
 var open=negOpenPositions();
 var groups=NEG_TIER_ORDER.map(function(t){
  var items=open.filter(function(p){return p.tier===t;});
  if(!items.length)return '';
  var m=NEG_TIER[t];
  var cards=items.map(function(p){
   return '<div class="ngpm-card'+(p.compliance?' compliance':'')+'">'+
    '<div class="ngpm-title"><span>'+escD(p.title)+'</span>'+(p.accept?'<span class="ngaccept">'+escD(p.accept)+'</span>':'')+'</div>'+
    '<div class="ngpm-row"><span class="ngpm-k">Target</span><span class="ngpm-v">'+escD(p.target)+'</span></div>'+
    '<div class="ngpm-row"><span class="ngpm-k">Fallback</span><span class="ngpm-v">'+escD(p.fallback)+'</span></div>'+
    (p.hs?'<div class="ngpm-row"><span class="ngpm-k">Hard stop</span><span class="ngpm-v hs">'+escD(p.hs)+'</span></div>':'')+
    (p.compliance?'<span class="ngpm-tag">Compliance leverage</span>':'')+
   '</div>';
  }).join('');
  return '<div class="ngpm-h" style="color:'+m.c+'">'+escD(m.short)+' ('+items.length+')</div>'+cards;
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">Position map</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">grouped by tier · target · fallback · acceptance</span></div>'+groups+'</div>';
}
// ITEM 4, Multi-round concession sequencing (R1/R2/R3) + BATNA card. Replaces the
// single give/get table (dealConcessionSeqHTML, retained but no longer called).
function negSequencingHTML(){
 var cards=NEG_SEQ.map(function(r){
  var moves='<div class="ngseq-moves"><ol>'+r.moves.map(function(x){return '<li>'+escD(x)+'</li>';}).join('')+'</ol></div>';
  return '<div class="ngseq '+r.cls+'"><div class="ngseq-h">'+escD(r.title)+'</div>'+
   '<div class="ngseq-obj"><div class="ol">Objective</div><div class="ov">'+escD(r.obj)+'</div></div>'+
   moves+
   '<div class="ngseq-risk"><div class="rk">Key risk</div><div class="rv">'+escD(r.risk)+'</div></div></div>';
 }).join('');
 var batna='<div class="ngbatna"><div class="bh">'+escD(NEG_BATNA.head)+'</div><p>'+escD(NEG_BATNA.body)+'</p></div>';
 return '<div class="sect"><div class="secthd"><div class="t">Concession sequencing</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">multi-round · give low-cost first · hold the red lines</span></div>'+cards+batna+'<div class="spnote">Sequence concessions so low-cost, high-value trades come first. Reflect-only; the rep decides what to actually offer, and nothing is escalated or sent on your behalf.</div></div>';
}
// ITEM 5, SME pre-engagement panel: cards with name, mailbox, tag, Topic, a
// multi-sentence brief, and numbered Specific Asks, derived from position clauses.
function negSmeHTML(){
 var cards=NEG_SME.map(function(s){
  var asks='<ul class="ngasks">'+s.asks.map(function(a,i){return '<li><span class="num">'+(i+1)+'</span><span>'+escD(a)+'</span></li>';}).join('')+'</ul>';
  var from=(s.from&&s.from.length)?'<div class="ngsme-brief" style="margin-top:5px"><b>Routed from:</b> '+escD(s.from.join(', '))+'</div>':'';
  return '<div class="ngsme"><div class="ngsme-top"><div><h4>'+escD(s.name)+'</h4>'+(s.mail?'<div class="ngsme-mail">'+escD(s.mail)+'</div>':'')+'</div><span class="ngsme-tag">'+escD(s.tag)+'</span></div>'+
   '<div class="ngsme-topic"><b>Topic:</b> '+escD(s.topic)+'</div>'+
   '<div class="ngsme-brief">'+escD(s.brief)+'</div>'+from+
   '<div class="ngsme-askh">Specific asks</div>'+asks+'</div>';
 }).join('');
 return '<div class="sect"><div class="secthd"><div class="t">SME pre-engagement</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">brief + numbered asks · route before Round 1</span></div><div class="spnote" style="margin-bottom:10px">Draft briefs to route to internal SMEs before opening the negotiation, derived from the position clause types. Drafts for the human - nothing is sent.</div>'+cards+'</div>';
}
// ITEM 6, MSA-already-covers filter: suppress positions the governing MSA already
// resolves, with a "MSA covers this" note + a toggle to reveal them.
function negMsaCoveredHTML(){
 var msa=negMsaPositions();
 if(!msa.length)return '';
 var inner;
 if(negShowMsaCovered){
  var cards=msa.map(function(p){return '<div class="ngmsa-card"><div class="mt">'+escD(p.title)+'</div><div class="mr">'+escD(p.msaRef||'')+'</div><div class="mn">'+escD(p.msaNote||'')+'</div></div>';}).join('');
  inner='<div class="ngmsa-note">'+msa.length+' position'+(msa.length===1?'':'s')+' suppressed because the executed Acme MSA (2024) already resolves them. Showing them below - they are not open negotiation items.</div>'+cards+'<button class="ngmsa-toggle" onclick="negToggleMsa()">Hide MSA-covered positions</button>';
 }else{
  inner='<div class="ngmsa-note">'+msa.length+' position'+(msa.length===1?'':'s')+' the governing MSA already resolves are suppressed from the open list above, so the negotiation focuses only on genuinely-open items ('+escD(msa.map(function(p){return p.title;}).join(', '))+').</div><button class="ngmsa-toggle" onclick="negToggleMsa()">Show MSA-covered positions</button>';
 }
 return '<div class="sect" id="negMsaSect"><div class="secthd"><div class="t">MSA already covers</div><span style="font-size:var(--fz-meta);color:var(--mut2);font-weight:500">anti-drift · suppress resolved positions</span></div><div class="ngmsa">'+inner+'</div></div>';
}
function negToggleMsa(){negShowMsaCovered=!negShowMsaCovered;var el=document.getElementById('negMsaSect');if(el)el.outerHTML=negMsaCoveredHTML();}
/* ===========================================================================
 * COMMERCIAL ANALYSIS surface (Wave 5b) - Deal / Negotiate. Six-model pricing
 * recommendation, external P10/P50/P90 benchmark bands (N>=5 gate, tier-weighted
 * sources, positioning, per-line confidence + freshness + research log), ranked
 * counters + trade payoff matrix, value-at-risk + assumptions register + discount
 * waterfall + a lever / Protection-Score model (Yr-1 / 3-yr horizon), a volume /
 * consolidation-leverage panel, and a 5-persona tone-matched counter-email DRAFT.
 * Reflect-only / draft-don't-send. Positive framing = Bold Blue var(--plum) (NEVER
 * green); amber = caution, red = risk. Every dynamic value is escaped (escD).
 * ========================================================================= */