var _PV14=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVDC=(_PV14&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV14)&&_PV14.docsComms)?_PV14.docsComms:{};
var docSel=null;               // {path, fn} of the selected document (path = folder path, e.g. 'Contracts/Executed/2024')
var docOpen=new Set();          // folder paths the user has expanded (persists across re-render)
function curDocQ(){return (document.getElementById('docsearch')||{}).value||'';}
// escape a value for use inside a single-quoted JS string embedded in an inline handler
function jarg(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
// walk TREE by a '/'-separated folder path -> the folder node (or null)
function folderByPath(path){if(!path)return null;var parts=String(path).split('/');var list=pvData('tree',TREE),node=null;for(var i=0;i<parts.length;i++){node=(list||[]).find(function(t){return t.f===parts[i];});if(!node)return null;list=node.sub;}return node;}
// first folder (any depth) whose name matches, used to resolve a misfile target
function folderByName(name){var found=null;(function walk(list){(list||[]).forEach(function(n){if(found)return;if(n.f===name){found=n;return;}walk(n.sub);});})(pvData('tree',TREE));return found;}
// does this folder (or any descendant) contain a file matching the query?
function folderMatch(node,q){if(!q)return true;if((node.files||[]).some(function(f){return (f.n||'').toLowerCase().includes(q);}))return true;return (node.sub||[]).some(function(s){return folderMatch(s,q);});}
// one file row, compact: type glyph · name · (flags) · modified date · status
function fileRowHTML(f,path){var pj=jarg(path),nj=jarg(f.n);
 var sel=(docSel&&docSel.path===path&&docSel.fn===f.n)?' sel':'';
 var nm=escapeHtmlPV(f.n),cc=escapeHtmlPV(f.c||'DOC'),st=escapeHtmlPV(f.st||'');
 var misf=f.misfiled?'<span class="misfit" title="'+escapeHtmlPV(f.misfiled.why)+'" onclick="event.stopPropagation();reviewMisfiled(\''+pj+'\',\''+nj+'\')">&#9873; Misfiled &rarr; '+escapeHtmlPV(f.misfiled.to)+'</span>':'';
 var cold=f.tier==='cold'?'<span class="tier cold" title="Restore this archived document to the active library" onclick="event.stopPropagation();restoreDoc(\''+pj+'\',\''+nj+'\')">Archived &#8634;</span>':'';
 var ret=f.ret?'<span class="retpill" title="'+escapeHtmlPV((f.ret.p||'')+' - draft retention label, pending records SME')+'">'+escapeHtmlPV(f.ret.c)+'<span class="rd">*</span></span>':'';
 var mod=f.modified?'<span class="fdate" title="Modified '+escapeHtmlPV(f.modified)+'">'+escapeHtmlPV(f.modified)+'</span>':'';
 return '<div class="tfile'+sel+'" draggable="true" ondragstart="docDragStart(event,\''+pj+'\',\''+nj+'\')" onclick="selectDoc(event,\''+pj+'\',\''+nj+'\')"><div class="fic">'+cc+'</div><div class="fn">'+nm+'</div>'+misf+cold+ret+mod+'<span class="fst '+(f.cls||'')+'">'+st+'</span></div>';}
// one folder (recursive), header row + a nested children container (subfolders first, then files)
function folderHTML(node,parentPath,q){var path=parentPath?parentPath+'/'+node.f:node.f;
 if(node.f==='(root)'){return (node.files||[]).filter(function(f){return !q||(f.n||'').toLowerCase().includes(q);}).map(function(f){return fileRowHTML(f,path);}).join('');}
 if(q&&!folderMatch(node,q))return '';
 var open=q?true:docOpen.has(path);
 var subs=(node.sub||[]).filter(function(s){return !q||folderMatch(s,q);});
 var ff=(node.files||[]).filter(function(f){return !q||(f.n||'').toLowerCase().includes(q);});
 var childHTML=subs.map(function(s){return folderHTML(s,path,q);}).join('')+ff.map(function(f){return fileRowHTML(f,path);}).join('');
 if(!childHTML)childHTML='<div class="tempty">'+(q?'no matches':'empty')+'</div>';
 var pj=jarg(path);
 var parts=[];if(subs.length)parts.push(subs.length+' folder'+(subs.length===1?'':'s'));parts.push(ff.length+' file'+(ff.length===1?'':'s'));
 var sor=/risk & deviation/i.test(node.f)?'<span title="System of record for risk acceptances, policy-deviation approvals, and cross-border SCC / TIA documentation" style="font:700 9px var(--mono);color:var(--navy);background:rgba(15,58,133,.12);border-radius:20px;padding:2px 7px;margin-left:8px;letter-spacing:.04em">SoR</span>':'';
 var addsub='<span class="tsub" title="Create a subfolder inside this folder (demo)" onclick="event.stopPropagation();addSubfolder(\''+pj+'\')">+ Subfolder</span>';
 return '<div class="tfolder'+(open?' open':'')+'" onclick="toggleFolder(event,\''+pj+'\')" ondragover="docFolderDragOver(event)" ondragleave="this.classList.remove(\'dragover\')" ondrop="docDrop(event,\''+pj+'\')"><span class="tw">&#9656;</span><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>'+escapeHtmlPV(node.f)+sor+addsub+'<span class="tfc">'+parts.join(' &middot; ')+'</span></div><div class="tfiles'+(open?' open':'')+'" ondragover="docFolderDragOver(event)" ondrop="docDrop(event,\''+pj+'\')">'+childHTML+'</div>';}
function treeHTML(q){q=(q||'').toLowerCase();var h=pvData('tree',TREE).map(function(node){return folderHTML(node,'',q);}).join('');
 if(q&&!h.replace(/\s/g,''))h='<div style="text-align:center;color:var(--mut2);font-size:13px;padding:18px">No documents match.</div>';
 return h;}
// expand/collapse a folder in place (persists the state in docOpen; no full re-render)
function toggleFolder(e,path){e.stopPropagation();var row=e.currentTarget;var willOpen=!row.classList.contains('open');row.classList.toggle('open',willOpen);var kids=row.nextElementSibling;if(kids&&kids.classList&&kids.classList.contains('tfiles'))kids.classList.toggle('open',willOpen);if(willOpen)docOpen.add(path);else docOpen.delete(path);}
// select a document -> highlight the row + open the bottom detail panel
function selectDoc(e,path,fn){if(e)e.stopPropagation();docSel={path:path,fn:fn};document.querySelectorAll('#doctree .tfile.sel').forEach(function(x){x.classList.remove('sel');});var row=e&&e.currentTarget;if(row&&row.classList)row.classList.add('sel');var d=document.getElementById('docDetail');if(d)d.innerHTML=docDetailHTML(path,fn);}
// bottom split panel, metadata + a clearly-labelled, system-generated summary (illustrative)
function docDetailEmpty(){return '<div class="ddempty">Select a document to see its details.</div>';}
function docDetailHTML(path,fn){var fo=folderByPath(path);var f=fo&&(fo.files||[]).find(function(x){return x.n===fn;});if(!f)return docDetailEmpty();
 var disp=(path==='(root)')?'Project root':escapeHtmlPV(String(path).split('/').join(' / '));
 function kv(k,v){return '<div class="k">'+k+'</div><div class="v">'+v+'</div>';}
 var rows=kv('Name',escapeHtmlPV(f.n))+kv('Type',escapeHtmlPV(f.c||'DOC'))+kv('Folder',disp)+kv('Created',escapeHtmlPV(f.created||'&mdash;'))+kv('Modified',escapeHtmlPV(f.modified||'&mdash;'))+kv('Status',escapeHtmlPV(f.st||'&mdash;'));
 if(f.ret)rows+=kv('Retention',escapeHtmlPV(f.ret.c)+' <span class="rd" title="draft retention label, pending records SME">*</span>');
 var badge=f.tier==='cold'?'<span class="tier cold" style="cursor:default">Archived</span>':'';
 var desc=f.desc?escapeHtmlPV(f.desc):'No summary available for this document yet.';
 var cap=infoHover('An illustrative one-line summary Theo generates from the document&rsquo;s name, folder and status. Reflect-only, not an authoritative description and not written back to the document.');
 return '<div class="ddhd"><div class="ddname"><span class="fic">'+escapeHtmlPV(f.c||'DOC')+'</span>'+escapeHtmlPV(f.n)+'</div>'+badge+'</div>'+
  '<div class="kv ddkv">'+rows+'</div>'+
  '<div class="ddsumm"><div class="ddsummhd">Summary <span class="ddgen">&middot; generated by Theo</span> '+cap+'</div><p class="ddsummtx">'+desc+'</p></div>';}
// #E13: flag a MISFILED doc -> show the justification + suggested folder -> refile on confirm
function reviewMisfiled(path,fn){var fo=folderByPath(path);if(!fo)return;var file=(fo.files||[]).find(function(x){return x.n===fn;});if(!file||!file.misfiled)return;var m=file.misfiled;var pj=jarg(path),fj=jarg(fn);
 $('#drawer').innerHTML='<div class="dh"><div><h3>Possibly misfiled</h3><div class="dsub">'+escapeHtmlPV(fn)+'</div></div><div class="dc" onclick="closeDrawer()">&times;</div></div><div class="db"><div class="kv"><div class="k">Currently in</div><div class="v">'+escapeHtmlPV(fo.f)+'</div><div class="k">Theo suggests</div><div class="v"><b>'+escapeHtmlPV(m.to)+'</b></div></div><div class="sect" style="margin-top:13px"><div class="secthd"><div class="t">Why Theo thinks so</div></div><blockquote class="srcquote">'+escapeHtmlPV(m.why)+'</blockquote></div><button class="btn btn-primary btn-sm" onclick="refileDoc(\''+pj+'\',\''+fj+'\')">Refile to '+escapeHtmlPV(m.to)+'</button> <button class="btn btn-ghost btn-sm" onclick="keepFiled(\''+pj+'\',\''+fj+'\')">Keep where it is</button><div class="anote">Theo only refiles on your confirm. Nothing moves automatically.</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');}
function refileDoc(path,fn){var from=folderByPath(path);if(!from)return;var file=(from.files||[]).find(function(x){return x.n===fn;});if(!file||!file.misfiled)return;var to=folderByName(file.misfiled.to);if(to){from.files.splice(from.files.indexOf(file),1);delete file.misfiled;(to.files=to.files||[]).push(file);toast('Refiled '+fn+' to '+to.f);}closeDrawer();docSel=null;filterDocs(curDocQ());}
function keepFiled(path,fn){var from=folderByPath(path);if(!from)return;var file=(from.files||[]).find(function(x){return x.n===fn;});if(file)delete file.misfiled;toast('Kept '+fn+' where it is');closeDrawer();filterDocs(curDocQ());}
// #E14: one-click restore a cold-archived doc from blob back to the hot SharePoint library
function restoreDoc(path,fn){var fo=folderByPath(path);if(!fo)return;var file=(fo.files||[]).find(function(x){return x.n===fn;});if(!file||file.tier!=='cold')return;delete file.tier;toast('Restored '+fn+' to the active library');filterDocs(curDocQ());}
// drag a file to another folder (mirrors a SharePoint move via Graph)
let docDrag=null;
function docDragStart(e,path,fn){docDrag={path:path,fn:fn};try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',fn);}catch(_){}}
function docFolderDragOver(e){if(!docDrag)return;e.preventDefault();const fold=e.currentTarget.classList.contains('tfolder')?e.currentTarget:e.currentTarget.previousElementSibling;if(fold&&fold.classList)fold.classList.add('dragover');}
// Documents #3: filing intelligence. On drop, Theo checks filing rules (doc-type -> allowed folders,
// naming, required metadata) and, if the drop looks misfiled, recommends the right folder and lets you
// confirm or reject. Reflect-only; the system also files documents correctly on its own.
var DOC_FILING={
 'Master Agreement':{folders:/contract|executed|legal|agreement|msa/i,rec:'Contracts'},
 'Work Order':{folders:/contract|work order|executed|order/i,rec:'Contracts'},
 'SOW':{folders:/contract|sow|statement|executed/i,rec:'Contracts'},
 'Order Form':{folders:/contract|order|executed/i,rec:'Contracts'},
 'Amendment':{folders:/contract|amendment|executed/i,rec:'Contracts'},
 'CDA / NDA':{folders:/contract|legal|nda|cda|confidential/i,rec:'Contracts'},
 'Invoice':{folders:/invoice|finance|payment|billing/i,rec:'Invoices'},
 'Risk / Security':{folders:/risk|review|security|assessment|compliance|onboarding/i,rec:'Reviews'},
 'Draft / Redline':{folders:/draft|redline|negotiat|working/i,rec:'Working drafts'}
};
function docFilingCheck(file,toFolderName){var t=docTypeOf(file),rule=DOC_FILING[t];if(!rule)return {ok:true};if(rule.folders.test(toFolderName||''))return {ok:true};var recNode=folderByName(rule.rec);return {ok:false,type:t,recommend:recNode?recNode.f:rule.rec,recExists:!!recNode};}
function docMoveFile(fromPath,toPath,fn){var from=folderByPath(fromPath),to=folderByPath(toPath);if(!from||!to)return;var idx=(from.files||[]).findIndex(function(x){return x.n===fn;});if(idx>=0){var moved=from.files.splice(idx,1)[0];(to.files=to.files||[]).push(moved);if(docSel&&docSel.path===fromPath&&docSel.fn===moved.n)docSel={path:toPath,fn:moved.n};toast('Moved '+moved.n+' to '+to.f);}filterDocs(curDocQ());}
function docDropConfirm(fromPath,fn,toPath,chk){var to=folderByPath(toPath),esc=escapeHtmlPV,pjf=jarg(fromPath),njf=jarg(fn),pjt=jarg(toPath),rec=jarg(chk.recommend);
 $('#drawer').innerHTML='<div class="dh"><div><h3>Check this filing</h3><div class="dsub">'+esc(fn)+'</div></div><div class="dc" onclick="closeDrawer()">&times;</div></div><div class="db"><div class="filechk"><div class="filechk-hd"><span class="filechk-ic">&#9873;</span>This looks misfiled</div><p class="filechk-msg"><b>'+esc(chk.type)+'</b> documents do not belong in <b>'+esc(to?to.f:toPath)+'</b>. Recommended folder: <b>'+esc(chk.recommend)+'</b>.</p><div class="filechk-btns">'+(chk.recExists?'<button class="btn btn-primary btn-sm" onclick="docFileRecommended(\''+pjf+'\',\''+njf+'\',\''+rec+'\')">File in '+esc(chk.recommend)+'</button>':'')+'<button class="btn btn-ghost btn-sm" onclick="docFileAnyway(\''+pjf+'\',\''+njf+'\',\''+pjt+'\')">Keep in '+esc(to?to.f:toPath)+' anyway</button><button class="btn btn-ghost btn-sm" onclick="closeDrawer()">Cancel</button></div><div class="filechk-note">Reflect-only: Theo files documents automatically and flags likely misfiles on drop. You confirm or reject; nothing is enforced. Filing rules also cover naming conventions and required metadata.</div></div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');}
function docFileRecommended(fromPath,fn,recFolderName){var to=folderByName(recFolderName),from=folderByPath(fromPath);if(!to||!from){toast('Recommended folder not found');closeDrawer();return;}var idx=(from.files||[]).findIndex(function(x){return x.n===fn;});if(idx>=0){var moved=from.files.splice(idx,1)[0];(to.files=to.files||[]).push(moved);delete moved.misfiled;toast('Filed '+fn+' in '+to.f+' (recommended)');}closeDrawer();docSel=null;filterDocs(curDocQ());}
function docFileAnyway(fromPath,fn,toPath){docMoveFile(fromPath,toPath,fn);closeDrawer();}
function docDrop(e,toPath){if(!docDrag)return;e.preventDefault();e.stopPropagation();document.querySelectorAll('.tfolder.dragover').forEach(function(x){x.classList.remove('dragover');});var from=folderByPath(docDrag.path),to=folderByPath(toPath);if(from&&to&&from!==to){var file=(from.files||[]).find(function(x){return x.n===docDrag.fn;});if(file){if(docMeta(file,to.f).home==='LEAH source'){docDrag=null;toast('"'+file.n+'" is a LEAH source document (read-only reference). Executed source contracts stay in LEAH and are not managed in the SharePoint library. (demo)');filterDocs(curDocQ());return;}var chk=docFilingCheck(file,to.f);if(!chk.ok){var fp=docDrag.path,fn=docDrag.fn;docDrag=null;docDropConfirm(fp,fn,toPath,chk);return;}docMoveFile(docDrag.path,toPath,docDrag.fn);}}docDrag=null;filterDocs(curDocQ());}
// create a folder at the top level of the library (reflect-only demo)
function addFolder(){var T=pvData('tree',TREE);var base='New folder',name=base,i=2;while(T.some(function(t){return t.f===name;})){name=base+' '+(i++);}T.splice(Math.max(0,T.length-1),0,{f:name,files:[],sub:[]});filterDocs(curDocQ());toast('Folder "'+name+'" created in the SharePoint library (demo, nothing written)');}
// create a subfolder at ANY level, inside the folder at parentPath (reflect-only demo)
function addSubfolder(parentPath){var parent=folderByPath(parentPath);if(!parent)return;parent.sub=parent.sub||[];var base='New subfolder',name=base,i=2;while(parent.sub.some(function(s){return s.f===name;})){name=base+' '+(i++);}parent.sub.push({f:name,files:[],sub:[]});docOpen.add(parentPath);docOpen.add(parentPath+'/'+name);filterDocs(curDocQ());toast('Subfolder "'+name+'" created in '+parent.f+' (demo, nothing written)');}
function filterDocs(q){if(DOCVIEW==='list'){var _lb=document.getElementById('docviewbody');if(_lb)_lb.innerHTML=docListHTML();return;}var t=document.getElementById('doctree');if(t)t.innerHTML=treeHTML(q);var d=document.getElementById('docDetail');if(d){var fo=docSel&&folderByPath(docSel.path);var f=fo&&(fo.files||[]).find(function(x){return x.n===docSel.fn;});d.innerHTML=(docSel&&f)?docDetailHTML(docSel.path,docSel.fn):docDetailEmpty();}}
// esc helper for LIVE/server values on this page (uses the shared api.js esc; falls
// back to the local PV escaper). ALWAYS wrap server values before innerHTML.
function escD(s){return (window.LillyAPI&&LillyAPI.esc)?LillyAPI.esc(s):escapeHtmlPV(s);}
// Scheme allow-list for document links: only http(s) may reach an href. Blocks a
// javascript:/data: URI (an XSS vector that HTML-escaping does NOT stop); returns
// '#' otherwise. Defense-in-depth alongside the server-side url schema.
function safeHref(u){try{var p=new URL(u);return (p.protocol==='http:'||p.protocol==='https:')?u:'#';}catch(_e){return '#';}}
// cloud-object-storage Gap 2/3: reflect-only LIVE document index for the current
// project, rendered ABOVE the demo library when a real platform record is loaded.
// Each row carries a retention label (Gap 2) + a version chip (Gap 3). Read-only.
function liveDocsHTML(){
 if(!Array.isArray(LIVEDOCS)||!LIVEDOCS.length)return '';
 var rows=LIVEDOCS.filter(function(d){return d&&d.status!=='superseded';});
 if(!rows.length)return '';
 var body=rows.map(function(d){
  var name=escD(d.name||'Document');
  var cat=escD((d.category||'').toString().slice(0,4).toUpperCase());
  var st=escD(d.status||'');
  var folder=d.folder?escD(d.folder):'';
  var ret=d.retention||{};
  var rc=ret.class?escD(ret.class):'';
  var rp=escD((ret.period||'')+(ret.draft?' - draft retention label, pending records SME':''));
  var pill=rc?'<span class="retpill" title="'+rp+'">'+rc+(ret.draft?'<span class="rd" title="Draft, not yet reconciled with the records schedule">*</span>':'')+'</span>':'';
  var vchip=(Number(d.version)>1)?'<button type="button" class="docvers-chip" data-docid="'+escD(d.id)+'" data-docname="'+name+'" title="View the version history (read-only)">'+escD(d.version)+' versions</button>':'';
  var link=d.url?'<a class="docopen" href="'+escD(safeHref(d.url))+'" target="_blank" rel="noopener" title="Open in SharePoint / Word">Open</a>':'';
  return '<div class="livedocrow"><span class="fic">'+(cat||'DOC')+'</span><span class="ldn">'+name+(folder?' <span class="ldf">/ '+folder+'</span>':'')+'</span>'+pill+vchip+'<span class="fst2">'+st+'</span>'+link+'</div>';
 }).join('');
 return '<div class="livedocwrap"><div class="livedochd">Live document index ('+rows.length+' document'+(rows.length===1?'':'s')+', reflect-only)</div>'+body+'<div class="livedocnote">Retention labels are DRAFT defaults pending a records / compliance SME. Microsoft Purview / the M365 records policy stays the enforcer and system of record. Documents open in SharePoint / Word.</div></div>';
}
// cloud-object-storage Gap 3: read-only version-history drawer for a document.
// Walks the DMS supersedes chain (newest first) via LillyAPI.documentVersions.
async function openDocVersions(id,name){
 var dr=$('#drawer');if(!dr)return;
 var head='<div class="dh"><div><h3>Version history</h3><div class="dsub">'+escD(name||'Document')+'</div></div><div class="dc" onclick="closeDrawer()">&times;</div></div>';
 dr.innerHTML=head+'<div class="db"><div class="spnote">Loading versions...</div></div>';
 $('#scrim').classList.add('on');dr.classList.add('on');
 var r=await LillyAPI.tryLive(function(){return LillyAPI.documentVersions(id);},null);
 var data=r.source==='live'?r.data:null;
 var vs=(data&&Array.isArray(data.versions))?data.versions:[];
 var body;
 if(!vs.length){
  body='<div class="spnote">No version history available for this document.</div>';
 }else{
  body=vs.map(function(v){
   var vn=escD('v'+(v.version!=null?v.version:'?'));
   var nm=escD(v.name||'Document');
   var stt=escD(v.status||'');
   var who=escD(v.uploadedBy||'unknown');
   var when=escD(v.createdAt||'');
   var ret=v.retention||{};
   var rc=ret.class?escD(ret.class):'';
   var rp=escD((ret.period||'')+(ret.draft?' - draft retention label, pending records SME':''));
   var pill=rc?'<span class="retpill" title="'+rp+'">'+rc+(ret.draft?'<span class="rd">*</span>':'')+'</span>':'';
   var link=v.url?'<a class="docopen" href="'+escD(safeHref(v.url))+'" target="_blank" rel="noopener">Open</a>':'';
   var cur=(data.current&&v.id===data.current)?' <span class="vcur">current</span>':'';
   return '<div class="vrow"><div class="vtop"><span class="vnum">'+vn+cur+'</span>'+pill+link+'</div><div class="vname">'+nm+'</div><div class="vmeta">status: '+stt+' - '+who+' - '+when+'</div></div>';
  }).join('');
 }
 dr.innerHTML=head+'<div class="db">'+body+'<div class="anote">Read-only version chain from SharePoint, newest first. Open a version to view it in SharePoint / Word. Retention labels are draft, pending a records SME. Nothing is changed here.</div></div>';
}
// delegated (never inline-onclick-with-data): open the version drawer from a chip.
document.addEventListener('click',function(e){
 var t=e.target;if(!t||!t.closest)return;
 var c=t.closest('.docvers-chip');
 if(c){e.preventDefault();e.stopPropagation();openDocVersions(c.getAttribute('data-docid'),c.getAttribute('data-docname'));}
});
// ===== CL.2: Communications, own project tab (vertical timeline, no bubbles) =====
// Reflect-only relationship history: filter / sort / search, per-entry one-line
// summary, clickable rows -> a detail drawer. Hide-until-data per source: email +
// calls are M365-gated (the demo shows a representative set with a connector note).
// Positive accent = Bold Blue #0F3A85; every dynamic value escaped (escD).
// state: 'included' = in the project comms record; 'candidate' = surfaced but human-gated (review queue);
// 'removed'/'skipped' = curated out by the user. Reflect-only, flipping state never sends or files anything.
var COMM_LOG=_PVDC.commLog||[];
var COMM_F={q:'',ch:'',topic:'',sort:'date'};
function ensureCommCss(){ if(document.getElementById('comm-css'))return; var s=document.createElement('style'); s.id='comm-css'; s.textContent=
 '.cml{margin:2px 0 0}'+
 '.cmrow{display:flex;align-items:flex-start;gap:14px;padding:11px 6px;border-top:1px solid var(--line2,#CECCC7);cursor:pointer;transition:background .12s}'+
 '.cmrow:hover{background:var(--blue-t,#E4EBF1)}'+
 '.cmrow.neg,.cmrow.off{box-shadow:inset 3px 0 0 var(--red,#C8202E)}'+
 '.cmrow.unres{box-shadow:inset 3px 0 0 var(--amber,#FFC709)}'+
 '.cmmain{flex:1;min-width:0}'+
 '.cmsubj{font-size:13px;font-weight:700;color:var(--ink);line-height:1.3}'+
 '.cmsnip{font-size:12px;color:var(--mut);line-height:1.45;margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
 '.cmflags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}'+
 '.cmmeta{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:4px;text-align:right;max-width:230px}'+
 '.cmwho{font:600 10.5px var(--mono,monospace);color:var(--mut);line-height:1.35;word-break:break-word}'+
 '.cmwhen{font:600 10.5px var(--mono,monospace);color:var(--mut2);letter-spacing:.02em}'+
 '.cmchip{font:600 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:20px;background:var(--blue-t,#E4EBF1);color:var(--navy);white-space:nowrap}'+
 '.cmchip.warn{background:var(--amber-t,#FBF1DA);color:var(--amber-d,#8A5A00)}.cmchip.bad{background:var(--pink-t,#FBE7E3);color:var(--red,#C8202E)}'+
 '.cmchip.mut{background:var(--well,#DDDCD8);color:var(--mut2)}'+
 '.cmx{flex:0 0 auto;align-self:center;border:1px solid var(--line2,#CECCC7);background:var(--surface);color:var(--mut2);border-radius:20px;font:600 10px var(--mono,monospace);text-transform:uppercase;letter-spacing:.04em;padding:4px 9px;cursor:pointer;opacity:.55;transition:.12s;white-space:nowrap}'+
 '.cmrow:hover .cmx{opacity:1}.cmx:hover{border-color:var(--red,#C8202E);color:var(--red,#C8202E)}'+
 '.cmrq{display:flex;align-items:flex-start;gap:13px;padding:12px 13px;border-top:1px solid var(--line2,#CECCC7)}'+
 '.cmrq:first-child{border-top:0}'+
 '.cmrq.amber{background:var(--amber-t,#FBF1DA)}.cmrq.pers{background:var(--pink-t,#FBE7E3)}'+
 '.cmask{font:600 11px var(--mono,monospace);color:var(--mut2);margin-top:6px;font-style:italic}'+
 '.cmqacts{flex:0 0 auto;display:flex;gap:7px;align-self:center}.cmqacts .btn-sm{flex:none}'+
 '.cmbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}'+
 '.cmbar select,.cmbar input{border:1px solid var(--line2,#CECCC7);border-radius:8px;padding:7px 10px;font:inherit;font-size:12.5px}'+
 '.cmhidden{font:600 10.5px var(--mono,monospace);color:var(--mut2);margin-top:10px}.cmhidden a{color:var(--navy);cursor:pointer;text-decoration:underline}'+
 '.cmparties{display:flex;gap:5px;flex-wrap:wrap}.cmpp{font:600 10px var(--mono,monospace);color:var(--mut);background:var(--well,#DDDCD8);border-radius:20px;padding:2px 7px}'
 ; document.head.appendChild(s);
}
function commChLbl(c){return {email:'Email',meeting:'Meeting',call:'Call',chat:'Chat',teams:'Teams',portal:'Portal'}[c]||c;}
// Sender → recipient(s), compact, for the right-hand metadata rail.
function commWho(e){
 var p=e.parties||[];if(!p.length)return '';
 if(p.length===1)return escD(p[0]);
 return escD(p[0])+' → '+escD(p.slice(1).join(', '));
}
// Compact divider row: subject/snippet LEFT, sender/date-time/channel pushed RIGHT, per-row Remove control.
function commRow(e){
 var cls=[e.offChannel?'off':'',e.unresolved&&!e.offChannel?'unres':'',e.sentiment==='neg'?'neg':''].filter(Boolean).join(' ');
 var flags='';
 if(e.sentiment==='neg')flags+='<span class="cmchip bad">Negative</span>';
 if(e.unresolved)flags+='<span class="cmchip warn">Unresolved'+(e.deadline?' · deadline '+escD(e.deadline):'')+'</span>';
 if(e.offChannel)flags+='<span class="cmchip bad">Off-channel</span>';
 if(e.facing==='internal')flags+='<span class="cmchip mut">Internal</span>';
 var when=escD(e.date)+(e.time?' · '+escD(e.time):'');
 var main='<div class="cmmain">'+(e.subject?'<div class="cmsubj">'+escD(e.subject)+'</div>':'')
  +'<div class="cmsnip">'+escD(e.summary||'')+'</div>'
  +(flags?'<div class="cmflags">'+flags+'</div>':'')+'</div>';
 var meta='<div class="cmmeta"><div class="cmwho">'+commWho(e)+'</div><div class="cmwhen">'+when+'</div><span class="cmchip">'+escD(commChLbl(e.channel))+'</span></div>';
 var rm='<button class="cmx" title="Remove from the project communications (reflect-only)" onclick="event.stopPropagation();commRemove(\''+e.id+'\')">Remove</button>';
 return '<div class="cmrow '+cls+'" onclick="commOpen(\''+e.id+'\')">'+main+meta+rm+'</div>';
}
// Review-queue row: a candidate Theo surfaced but held. Human-gated Add / Skip. Never auto-included.
function commCandRow(e){
 var band=e.personal?'pers':'amber';
 var when=escD(e.date)+(e.time?' · '+escD(e.time):'');
 var ask=e.personal
  ? 'This looks personal but may pertain to the RFx, add it?'
  : 'Theo isn’t sure this pertains to the RFx, add it?';
 var flags=(e.facing==='internal'?'<span class="cmchip mut">Internal</span>':'')
  +(e.personal?'<span class="cmchip bad">Personal / sensitive</span>':'<span class="cmchip warn">Borderline</span>');
 var main='<div class="cmmain" onclick="commOpen(\''+e.id+'\')"><div class="cmsubj">'+escD(e.subject||'')+'</div>'
  +'<div class="cmsnip">'+escD(e.summary||'')+'</div>'
  +'<div class="cmflags">'+flags+'</div>'
  +'<div class="cmask">'+escD(ask)+'</div></div>';
 var meta='<div class="cmmeta"><div class="cmwho">'+commWho(e)+'</div><div class="cmwhen">'+when+'</div><span class="cmchip">'+escD(commChLbl(e.channel))+'</span></div>';
 var acts='<div class="cmqacts"><button class="btn btn-ghost btn-sm" onclick="commSkip(\''+e.id+'\')">Skip</button><button class="btn btn-primary btn-sm" onclick="commAdd(\''+e.id+'\')">Add</button></div>';
 return '<div class="cmrq '+band+'">'+main+meta+acts+'</div>';
}
// --- Curation actions. Reflect-only: flip local state + toast; nothing is sent, filed, or disqualified. ---
function commReRender(){if(curtab==='comm')$('#tabbody').innerHTML=commHTML();}
function commAdd(id){var e=pvData('commLog',COMM_LOG).find(function(x){return x.id===id;});if(!e)return;e.state='included';commReRender();toast('Added to the project communications, reflect-only; nothing was sent or filed.');}
function commSkip(id){var e=pvData('commLog',COMM_LOG).find(function(x){return x.id===id;});if(!e)return;e.state='skipped';commReRender();toast('Skipped, kept out of the project record. Nothing was sent or filed.');}
function commRemove(id){var e=pvData('commLog',COMM_LOG).find(function(x){return x.id===id;});if(!e)return;e.state='removed';commReRender();toast('Removed from the project communications, reflect-only; the source item is untouched.');}
function commRestoreAll(){pvData('commLog',COMM_LOG).forEach(function(e){if(e.state==='removed')e.state='included';});commReRender();toast('Restored the items you had removed.');}
function commFiltered(){
 var q=(COMM_F.q||'').toLowerCase();
 var list=pvData('commLog',COMM_LOG).filter(function(e){
  if((e.state||'included')!=='included')return false; // curation: only items the human kept
  if(COMM_F.ch&&e.channel!==COMM_F.ch)return false;
  if(COMM_F.topic&&e.topic!==COMM_F.topic)return false;
  if(q){var hay=((e.subject||'')+' '+(e.summary||'')+' '+(e.parties||[]).join(' ')+' '+(e.topic||'')).toLowerCase();if(hay.indexOf(q)<0)return false;}
  return true;
 });
 list.sort(function(a,b){return COMM_F.sort==='date'?(b.date<a.date?-1:b.date>a.date?1:0):((a.channel||'')<(b.channel||'')?-1:1);});
 return list;
}
// Review queue is deliberately NOT hidden by the search/channel filters, the guard must always be visible.
function commCandidates(){return pvData('commLog',COMM_LOG).filter(function(e){return e.state==='candidate';});}
function commRemovedCount(){return pvData('commLog',COMM_LOG).filter(function(e){return e.state==='removed';}).length;}
function commSet(k,v){COMM_F[k]=v;if(curtab==='comm')$('#tabbody').innerHTML=commHTML();}
function commHTML(){
 // Communications = the vanilla "signal map" (pv-comms-signalmap.js), a faithful port of the React CommsTab.
 // Falls back to the legacy timeline below only if the module failed to load.
 if(typeof cmTabHTML==='function')return cmTabHTML();
 ensureCommCss();
 var incl=pvData('commLog',COMM_LOG).filter(function(e){return (e.state||'included')==='included';});
 var chans=Array.from(new Set(incl.map(function(e){return e.channel;})));
 var topics=Array.from(new Set(incl.map(function(e){return e.topic;})));
 var chOpts='<option value="">All channels</option>'+chans.map(function(c){return '<option value="'+escD(c)+'"'+(COMM_F.ch===c?' selected':'')+'>'+escD(commChLbl(c))+'</option>';}).join('');
 var tpOpts='<option value="">All topics</option>'+topics.map(function(t){return '<option value="'+escD(t)+'"'+(COMM_F.topic===t?' selected':'')+'>'+escD(t)+'</option>';}).join('');
 var rows=commFiltered();
 var cands=commCandidates();

 var curationInfo=infoHover('Theo <b>surfaces candidates and lets you decide</b>, it never auto-includes personal or sensitive content. Anything that reads personal (e.g. an internal email that critiques a colleague but happens to mention the RFx) is held in the review queue for a human to add or skip. You can also remove any item; removing only hides it from this project record. Reflect-only, nothing here is sent, filed, or disqualified.',{aria:'How curation works'});
 var h='<p class="dashintro"><b>Communications · '+escD((PROJECTS[CURPROJ]&&PROJECTS[CURPROJ].supplier)||'Supplier')+'</b> - the relationship history across channels, newest first. You curate this record: <b>add or remove</b> items, and <b>review the candidates Theo held back</b> rather than auto-including. '+curationInfo+' Reflect-only; off-channel and unresolved items are surfaced, not adjudicated.</p>';

 // Review queue, the "don't silently grab" guard. Always shown (not hidden by the filters).
 if(cands.length){
  h+='<div class="sect"><div class="secthd"><div class="t">Review queue · '+cands.length+' held</div></div>';
  h+='<div class="card" style="padding:0">'+cands.map(commCandRow).join('')+'</div>';
  h+='<div class="spnote" style="margin-top:8px">Theo held these because they look personal or their relevance is unclear. <b>It never files sensitive content on its own</b>, add or skip each one. Nothing is sent or filed either way.</div></div>';
 }

 h+='<div class="sect"><div class="secthd"><div class="t">Communications · '+rows.length+'</div></div>';
 h+='<div class="cmbar"><input placeholder="Search interactions…" value="'+escD(COMM_F.q)+'" oninput="commSet(\'q\',this.value)" style="flex:1;min-width:180px">'
  +'<select onchange="commSet(\'ch\',this.value)">'+chOpts+'</select>'
  +'<select onchange="commSet(\'topic\',this.value)">'+tpOpts+'</select>'
  +'<select onchange="commSet(\'sort\',this.value)"><option value="date"'+(COMM_F.sort==='date'?' selected':'')+'>Newest first</option><option value="channel"'+(COMM_F.sort==='channel'?' selected':'')+'>By channel</option></select></div>';
 h+=rows.length?'<div class="cml">'+rows.map(commRow).join('')+'</div>':'<div class="spnote" style="text-align:center;padding:18px">No interactions match.</div>';
 var removed=commRemovedCount();
 if(removed)h+='<div class="cmhidden">'+removed+' item'+(removed>1?'s':'')+' hidden by you. <a onclick="commRestoreAll()">Restore</a></div>';
 h+='</div>';

 h+='<div class="spnote"><b>Email and calls connect via M365.</b> With the connector on, Theo mirrors Outlook / Teams interactions here (read-only) with a one-line summary per entry, holding anything personal or borderline in the review queue above. Until then this shows the interactions logged in-app. Nothing here sends, replies, or chases.</div>';
 return h;
}
function commOpen(id){
 var e=pvData('commLog',COMM_LOG).find(function(x){return x.id===id;});if(!e)return;
 var parties=(e.parties||[]).map(function(p){return '<span class="cmpp">'+escD(p)+'</span>';}).join('');
 var isCand=e.state==='candidate';
 var candBg=e.personal?'var(--pink-t,#FBE7E3)':'var(--amber-t,#FBF1DA)';
 var candBd=e.personal?'var(--red,#C8202E)':'var(--amber-d,#8A5A00)';
 var candNote=isCand?'<div style="margin-top:12px;padding:10px 12px;background:'+candBg+';border-left:3px solid '+candBd+';border-radius:0 8px 8px 0;font-size:12.5px;color:var(--ink);line-height:1.5">'+(e.personal?'<b>Held in the review queue.</b> It reads personal but may pertain to the RFx. Theo did not include it on its own, a human decides.':'<b>Held in the review queue.</b> Theo isn’t sure it pertains to the RFx. A human decides whether it belongs here.')+'</div>'
  +'<div class="cvacts"><button class="btn btn-ghost btn-sm" onclick="commSkip(\''+e.id+'\');closeDrawer()">Skip</button><button class="btn btn-primary btn-sm" onclick="commAdd(\''+e.id+'\');closeDrawer()">Add to communications</button></div>':'';
 $('#drawer').innerHTML='<div class="dh"><div><h3>'+escD(e.subject||commChLbl(e.channel))+'</h3><div class="dsub">'+escD(e.date+(e.time?' · '+e.time:'')+' · '+commChLbl(e.channel))+'</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><div class="kv"><div class="k">Channel</div><div class="v">'+escD(commChLbl(e.channel))+'</div><div class="k">Topic</div><div class="v">'+escD(e.topic||'')+'</div><div class="k">Facing</div><div class="v">'+escD(e.facing==='supplier-facing'?'Supplier-facing':'Internal')+'</div><div class="k">Sentiment</div><div class="v">'+escD(e.sentiment==='neg'?'Negative':e.sentiment==='pos'?'Positive':'Neutral')+'</div><div class="k">In record</div><div class="v">'+escD(isCand?'Candidate, not yet added':(e.state==='removed'?'Removed by you':'Included'))+'</div>'+(e.unresolved?'<div class="k">Status</div><div class="v">Unresolved'+(e.deadline?' · deadline '+escD(e.deadline):'')+'</div>':'')+'</div><div class="sect" style="margin-top:13px"><div class="secthd"><div class="t">Summary</div></div><p class="narr">'+escD(e.detail||e.summary||'')+'</p></div>'+(parties?'<div class="sect"><div class="secthd"><div class="t">Parties</div></div><div class="cmparties">'+parties+'</div></div>':'')+(e.offChannel?'<div class="scope info" style="margin-top:10px"><span class="d"></span><span>Off-channel contact - routed to the rep, the Lead, and Legal. Surface-only; nothing is disqualified.</span></div>':'')+candNote+'<div style="font-size:var(--fz-meta);color:var(--mut2);font-style:italic;margin-top:10px">Reflect-only. Mirrored from the interaction record; Theo does not send, reply, or chase.</div></div>';
 $('#scrim').classList.add('on');$('#drawer').classList.add('on');
}
// ===== Documents #1/#2: metadata columns + List view (owner-directed 2026-07-13) =====
// Deterministic illustrative metadata per file (this project's OWN docs, demo data, not fabricated
// supplier facts). Sortable/filterable List view toggles with the folder Tree. Owners reassignable
// (reflect-only; labeled seam that Ariba / SAP S4HANA updates flow in). Demo state, not persisted.
var DOCVIEW='tree', DOCSORT={col:'name',dir:1}, DOC_OWNER_OVR={};
var _DOCMON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function docHashN(s){var h=0;s=String(s||'');for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function docTypeOf(f){var n=(f.n||'').toLowerCase();
 if(/msa|master service|master agreement/.test(n))return 'Master Agreement';
 if(/work order|\bwo[_\-. ]|\bwo\d/.test(n))return 'Work Order';
 if(/\bsow\b|statement of work/.test(n))return 'SOW';
 if(/invoice/.test(n))return 'Invoice';
 if(/\bcda\b|\bnda\b|non.?disclosure|confidential/.test(n))return 'CDA / NDA';
 if(/order form|\bof[_\-. ]/.test(n))return 'Order Form';
 if(/amendment|addendum/.test(n))return 'Amendment';
 if(/risk|wwtp|assessment|\biss\b|security|soc\s?2/.test(n))return 'Risk / Security';
 if(/redline|draft/.test(n))return 'Draft / Redline';
 return 'Document';}
function docUSD(n){if(!n)return '';return n>=1e6?('$'+(n/1e6).toFixed(1)+'M'):('$'+Math.round(n/1000)+'K');}
function docMeta(f,path){var t=docTypeOf(f),h=docHashN(f.n+'|'+path);
 var contract=/Master Agreement|Work Order|SOW|Order Form|Amendment/.test(t);
 var yr=2021+(h%4),mo=1+((h>>3)%12),day=1+((h>>6)%27),term=[1,2,3,3,5][h%5],exYr=yr+term;
 var ppl=['Priya Shah','Aisha Khan','Dan Reed','Lee Davis'],ovr=DOC_OWNER_OVR[f.n]||{},isMsa=/Master Agreement/.test(t);
 return {type:t,executed:contract?(_DOCMON[mo-1]+' '+day+', '+yr):'',executedT:contract?(yr*10000+mo*100+day):0,
   expires:contract?(_DOCMON[mo-1]+' '+day+', '+exYr):'',expiresT:contract?(exYr*10000+mo*100+day):0,
   annual:contract?((50+((h>>4)%60))*10000):0,tco:contract?((50+((h>>4)%60))*10000*term):0,
   businessOwner:(ovr.business||ppl[h%ppl.length]),boRole:isMsa?'Engagement owner':(/Invoice/.test(t)?'Invoice approver':'Business owner'),
   sourcingRep:(ovr.sourcing||'Marc Lane'),
   home:(f.tier==='cold'?'SoR archive':((/executed|signed|fully.?executed|final/i.test(f.n||'')&&/Master Agreement|Work Order|SOW|Order Form|Amendment/.test(t))?'LEAH source':'SharePoint'))};}
function docHomeCls(home){return home==='LEAH source'?'leah':home==='SoR archive'?'sor':'sp';}
function docFlatten(){var out=[];(function walk(list,parent){(list||[]).forEach(function(n){var p=parent?parent+'/'+n.f:n.f;(n.files||[]).forEach(function(f){out.push({f:f,path:p,folder:n.f});});walk(n.sub,p);});})(pvData('tree',TREE));return out;}
function docSortVal(d,col){var f=d.r.f,m=d.m;switch(col){case 'name':return (f.n||'').toLowerCase();case 'type':return m.type;case 'executed':return m.executedT;case 'expires':return m.expiresT;case 'annual':return m.annual;case 'tco':return m.tco;case 'owner':return m.businessOwner;case 'rep':return m.sourcingRep;case 'home':return m.home;case 'status':return (f.st||'');default:return '';}}
function docListHTML(){var esc=escapeHtmlPV,q=curDocQ().toLowerCase();
 var data=docFlatten().map(function(r){return {r:r,m:docMeta(r.f,r.path)};});
 if(q)data=data.filter(function(d){return (d.r.f.n+' '+d.m.type+' '+d.r.folder+' '+d.m.businessOwner+' '+d.m.sourcingRep+' '+d.m.home+' '+(d.r.f.st||'')).toLowerCase().indexOf(q)>=0;});
 var col=DOCSORT.col,dir=DOCSORT.dir;
 data.sort(function(a,b){var av=docSortVal(a,col),bv=docSortVal(b,col);return (av<bv?-1:av>bv?1:0)*dir;});
 var cols=[['name','Document'],['type','Type'],['executed','Executed'],['expires','Expires'],['annual','Annual $'],['tco','TCO'],['owner','Business owner'],['rep','Sourcing rep'],['home','Home'],['status','Status']];
 var head=cols.map(function(c){var on=col===c[0];return '<th class="dlh'+(on?' on':'')+'" onclick="docSort(\''+c[0]+'\')">'+esc(c[1])+(on?(dir>0?' ▲':' ▼'):'')+'</th>';}).join('');
 var body=data.map(function(d){var f=d.r.f,m=d.m,pj=jarg(d.r.path),nj=jarg(f.n);
   return '<tr class="dlr" onclick="docOpenDrawer(\''+pj+'\',\''+nj+'\')">'
    +'<td class="dlname"><span class="fic">'+esc(f.c||'DOC')+'</span>'+esc(f.n)+(f.misfiled?' <span class="misfit sm" title="'+esc(f.misfiled.why)+'">&#9873;</span>':'')+'</td>'
    +'<td>'+esc(m.type)+'</td><td>'+esc(m.executed||'—')+'</td><td>'+esc(m.expires||'—')+'</td>'
    +'<td class="dlnum">'+esc(docUSD(m.annual)||'—')+'</td><td class="dlnum">'+esc(docUSD(m.tco)||'—')+'</td>'
    +'<td><span class="dlown" onclick="event.stopPropagation();docReassign(\''+nj+'\',\'business\')" title="Reassign the business owner (owner / admin / sourcing rep). Would sync from Ariba / SAP S4HANA.">'+esc(m.businessOwner)+' <small>'+esc(m.boRole)+'</small></span></td>'
    +'<td><span class="dlown" onclick="event.stopPropagation();docReassign(\''+nj+'\',\'sourcing\')" title="Reassign the sourcing rep (owner / admin / sourcing rep).">'+esc(m.sourcingRep)+'</span></td>'
    +'<td><span class="dlhome '+docHomeCls(m.home)+'" title="Where this document lives">'+esc(m.home)+'</span></td>'
    +'<td><span class="fst '+(f.cls||'')+'">'+esc(f.st||'')+'</span></td></tr>';}).join('');
 return '<div class="doclistwrap"><table class="doclist"><thead><tr>'+head+'</tr></thead><tbody>'+body+'</tbody></table>'+(data.length?'':'<div class="dlempty">No documents match your search.</div>')+'</div>';}
function docSort(col){if(DOCSORT.col===col)DOCSORT.dir=-DOCSORT.dir;else{DOCSORT.col=col;DOCSORT.dir=1;}docRerenderView();}
function docViewBodyHTML(){if(DOCVIEW==='list')return docListHTML();var fo=docSel&&folderByPath(docSel.path);var f=fo&&(fo.files||[]).find(function(x){return x.n===docSel.fn;});return '<div class="docsplit"><div class="doctreewrap"><div id="doctree" class="tree">'+treeHTML(curDocQ())+'</div></div><div id="docDetail" class="docdetail">'+((docSel&&f)?docDetailHTML(docSel.path,docSel.fn):docDetailEmpty())+'</div></div>';}
function docRerenderView(){var el=document.getElementById('docviewbody');if(el)el.innerHTML=docViewBodyHTML();var tb=document.getElementById('docviewtoggle');if(tb){var bs=tb.querySelectorAll('.docvt');for(var i=0;i<bs.length;i++)bs[i].classList.toggle('on',bs[i].getAttribute('data-v')===DOCVIEW);}}
function docSetView(v){DOCVIEW=v;docRerenderView();}
function docOpenDrawer(path,fn){docSel={path:path,fn:fn};$('#drawer').innerHTML='<div class="dh"><div><h3>'+escapeHtmlPV(fn)+'</h3><div class="dsub">'+escapeHtmlPV(path)+'</div></div><div class="dc" onclick="closeDrawer()">&times;</div></div><div class="db">'+docDetailHTML(path,fn)+'</div>';$('#scrim').classList.add('on');$('#drawer').classList.add('on');}
function docReassign(fn,which){var ppl=['Priya Shah','Aisha Khan','Dan Reed','Lee Davis','Marc Lane'];var ovr=DOC_OWNER_OVR[fn]||(DOC_OWNER_OVR[fn]={});var cur=which==='business'?(ovr.business||''):(ovr.sourcing||'');var idx=ppl.indexOf(cur);var next=ppl[(idx+1)%ppl.length];if(which==='business')ovr.business=next;else ovr.sourcing=next;docRerenderView();toast('Reassigned '+(which==='business'?'business owner':'sourcing rep')+' for '+fn+' to '+next+'. Reflect-only: owner / admin / sourcing rep can do this, and it would sync from Ariba / SAP S4HANA. (demo)');}
// Documents #4: archive final / fully-executed copies to the system of record (reflect-only; runs at
// project completion). Source docs (LEAH) stay in LEAH, not the SoR-from-SharePoint path.
function docArchiveSoR(){var n=docFlatten().filter(function(r){return /executed|signed|fully.?executed|final/i.test(r.f.n||'');}).length;toast('Archiving '+n+' final / fully-executed cop'+(n===1?'y':'ies')+' to the system of record. Reflect-only: runs on project completion; LEAH source documents stay in LEAH. (demo)');}
function docsHTML(){
 return liveDocsHTML()+'<div class="docsbar"><div style="position:relative;flex:1"><svg viewBox="0 0 24 24" style="position:absolute;left:11px;top:9px;width:15px;height:15px;stroke:var(--mut2);fill:none;stroke-width:2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="docsearch" placeholder="Search documents…" oninput="filterDocs(this.value)" style="width:100%;box-sizing:border-box;padding:8px 12px 8px 33px;border:1px solid var(--line2);border-radius:9px;font-size:13px;font-family:var(--sans)"></div><span id="docviewtoggle" class="docvtg"><button class="docvt on" data-v="tree" onclick="docSetView(\'tree\')">Tree</button><button class="docvt" data-v="list" onclick="docSetView(\'list\')">List</button></span><button class="btn btn-ghost btn-sm" onclick="addFolder()" title="Create a folder in the SharePoint library"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M12 11v6M9 14h6"/></svg>Folder</button></div>'
  +'<div id="docviewbody">'+docViewBodyHTML()+'</div>'
  +'<div class="archnote"><span style="font:700 10px var(--mono);color:var(--navy);background:rgba(15,58,133,.1);border-radius:20px;padding:3px 9px;letter-spacing:.04em">SHAREPOINT-BACKED</span> <span style="color:var(--mut)"><b>SharePoint</b> holds documents being negotiated now plus internal / risk docs. <b>LEAH source</b> documents (executed MSAs, work orders) stay in LEAH as read-only references, accessible for review but never pulled in. On completion, final / fully-executed copies archive to the <b>system of record</b>. </span><a class="dlk" onclick="event.preventDefault();docArchiveSoR();return false;">Archive final copies to the SoR &rarr;</a></div>';
}
function openDetails(){$('#drawer').innerHTML=`<div class="dh"><div><h3>Project details</h3><div class="dsub">P-1042 · Analytics SaaS, Acme AI</div></div><div class="dc" onclick="closeDrawer()">×</div></div><div class="db"><p class="narr">A new engagement to stand up an <b>AI-powered employee-analytics platform</b> from <b>Acme Analytics</b>, a vendor not previously under contract. Because it will <b>process employee PI</b> and involves <b>AI</b>, intake classified it <b>Orange</b> and fanned the work out to Legal, Cyber (ISS), the AI Registry (AIS) and WwTP risk in parallel, with contract authoring in LEAH and supplier enablement. Sourcing was skipped (sole source). It's a 3-year MSA + initial WO, ~$1.8M, currently held at the Reviews gate awaiting WwTP and the Cyber questionnaire.</p><div class="kv"><div class="k">Type</div><div class="v">New supplier engagement</div><div class="k">Supplier</div><div class="v">Acme Analytics (new) · HQ USA</div><div class="k">Contracts</div><div class="v">New MSA (full MPT) + initial Work Order</div><div class="k">Spend</div><div class="v">$1.8M TCO · 3 yrs</div><div class="k">CCI classification</div><div class="v">Orange, employee PI</div><div class="k">Standards</div><div class="v">SPS · ISS · AIS</div><div class="k">Owner</div><div class="v">Priya Shah</div><div class="k">Rep</div><div class="v">Marc Lane</div><div class="k">Started</div><div class="v">2026-06-23</div><div class="k">Target PO</div><div class="v">2026-07-31</div></div></div>`;$('#scrim').classList.add('on');$('#drawer').classList.add('on');}
const PCOLOR={'Priya Shah':'#7A2436','Marc Lane':'#2F6E6B','Aisha Khan':'#123C82','Dan Reed':'#2E6B47','Sam Patel':'#5C2B50','Jordan Avery':'#A6541C','Lee Davis':'#8A5A00'};
const PAL=['#123C82','#A6541C','#2F6E6B','#7A2436','#2E6B47','#8A5A00','#5C2B50','#403A33']; // navy copper teal burgundy green gold plum graphite (system palette hues)
function pvAvColor(name){if(!name)return PAL[0];if(PCOLOR[name])return PCOLOR[name];var h=0;for(var i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))>>>0;var c=PAL[h%PAL.length];PCOLOR[name]=c;return c;}
/* round-3 (F13): the Theo dino mark, inlined so the docked project chat is offline-safe. */
const THEO_MARK_SRC='data:image/png;base64,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';
function colorFor(m,isMe){if(isMe)return 'var(--red)';if(m.cls==='ai')return 'var(--ai)';if(m.cls==='sys')return '#4A4540';return pvAvColor(m.who);}
// round-3 (F13/F15): ONE assistant identity, every AI-draft turn AND every plain Theo status turn is "Theo",
// rendered with the dino avatar and one name colour. AI-draft turns additionally carry a compact brand+model tag.
function theoAssistantTurn(m){return (m.cls==='ai')||(m.who==='Theo');}
function theoAvatarHTML(){return `<div class="mav theo" title="Theo"><img src="${(typeof THEO_MARK_SRC!=='undefined')?THEO_MARK_SRC:''}" alt="Theo"></div>`;}
/* Real brand marks (extracted from theo-brand.js PROVIDER_LOGOS) so the chat model tag shows the brand icon, not the word "Anthropic". */
var AI_BRAND_LOGO={"Claude":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"#D97757\" d=\"m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z\"/></svg>","OpenAI":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"#000\" d=\"M22.282 9.821a6 6 0 0 0-.516-4.91 6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9 6.05 6.05 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206 6 6 0 0 0 3.997-2.9 6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023-.141-.085-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z\"/></svg>","Copilot":"<svg viewBox=\"0 23.3 512.1 465.4\" aria-hidden=\"true\" fill=\"#0078D4\"><path d=\"M374 62c-6.7-22.9-27.8-38.7-51.7-38.7h-15.7c-26 0-48.3 18.6-53 44.2l-26.9 146.8 6.7-22.9c6.7-23 27.8-38.8 51.7-38.8h91.4l38.3 14.9 36.9-14.9H441c-23.9 0-45-15.8-51.7-38.7z\"/><path d=\"M143.5 449.8c6.7 23 27.8 38.9 51.8 38.9h33.4c29.2 0 53.1-23.3 53.9-52.5l3.6-141.5-7.6 26c-6.7 23-27.8 38.7-51.7 38.7h-92.2l-32.9-17.8-35.6 17.8h10.6c24 0 45.1 15.9 51.8 38.9z\"/><path d=\"M320 23.3H133.4C80 23.3 48 93.7 26.7 164.2 1.4 247.7-31.6 359.4 64 359.4h80.6c24.1 0 45.2-15.9 51.8-39.1 14-49 38.6-134.5 57.9-199.6 9.8-33.1 18-61.5 30.5-79.2 7.1-9.9 18.8-18.2 35.2-18.2z\"/><path d=\"M192 488.7h186.7c53.3 0 85.3-70.5 106.7-141 25.3-83.5 58.3-195.2-37.3-195.2h-80.6c-24.1 0-45.2 15.9-51.8 39.1-14 49-38.6 134.6-57.9 199.7-9.8 33.1-18 61.5-30.5 79.2-7.2 9.9-18.9 18.2-35.3 18.2z\"/></svg>"};
function aiModelTag(m){
 var raw=String((m&&m.model)||(typeof llm!=='undefined'?llm:'Claude')||'Claude');
 var key=['Claude','OpenAI','Copilot'].find(function(k){return raw.indexOf(k)>=0;})||(typeof llm!=='undefined'?llm:'Claude');
 var rest=raw.replace(key,'').trim();
 var model=(key==='Copilot')?'Copilot':(rest||(typeof llmModel!=='undefined'?llmModel:'')||key);
 var logo=(typeof AI_BRAND_LOGO!=='undefined'&&AI_BRAND_LOGO[key])?AI_BRAND_LOGO[key]:'';
 return logo+escapeHtmlPV(model);
}
function renderChat(q){
 const v=VIEWS[view];q=(q||'').toLowerCase();let h='';
 CHAT.forEach(m=>{const isTheo=theoAssistantTurn(m)&&m.who!==v.nm;if(q&&!((m.tx||'')+m.who+(isTheo?' theo':'')).toLowerCase().includes(q))return;const isMe=m.who===v.nm;
  if(isTheo){const tag=m.cls==='ai'?`<span class="aibadge">${aiModelTag(m)}</span>`:'';const nm=`<div class="bnm" style="color:var(--navy)">Theo${tag}<span class="tm">${m.tm||''}</span></div>`;h+=`<div class="msg ai">${theoAvatarHTML()}<div class="bcol">${nm}<div class="bub ai">${m.tx||''}${m.draft?draftCard(m.draft):''}${m.skill?skillSuggestCard(m.skill):''}${m.artifact?artifactCard(m.artifact):''}</div></div></div>`;return;}
  const c=colorFor(m,isMe);const avSty=`style="background:${c};color:#fff"`;const bubSty=isMe?'':`style="border-color:${c}"`;const nm=isMe?`<div class="bnm me"><span class="tm">${m.tm}</span></div>`:`<div class="bnm" style="color:${c}">${m.who}<span class="tm">${m.tm}</span></div>`;h+=`<div class="msg ${isMe?'me':''}"><div class="mav ${m.cls}" ${avSty}>${m.av}</div><div class="bcol">${nm}<div class="bub ${m.cls}" ${bubSty}>${m.tx||''}${m.draft?draftCard(m.draft):''}${m.skill?skillSuggestCard(m.skill):''}${m.artifact?artifactCard(m.artifact):''}</div></div></div>`;});
 // Theo's active contextual suggestions render as Theo MESSAGES appended INSIDE the thread, so they
 // scroll with the conversation (the scrollbar runs through them) - they are not a rail at the bottom.
 if(!q && window.THEO_WORKFLOW && window.THEO_WORKFLOW.active){ try{ window.THEO_WORKFLOW.active().forEach(function(sg){ if(sg.surface!=='chat')return; h+=theoSuggestMsgHTML(sg); }); }catch(e){} }
 if(!h)h='<div style="text-align:center;color:var(--mut2);font-size:var(--fz-sm);padding:20px">No messages match.</div>';
 $('#tin').innerHTML=h;if(!q)$('#thread').scrollTop=$('#thread').scrollHeight;
}
const NUDGE_KEY='theo_nudge_dismissed';
function nudgeDismissed(){try{return JSON.parse(localStorage.getItem(NUDGE_KEY)||'[]');}catch(e){return [];}}
function isNudgeDismissed(id){return nudgeDismissed().indexOf(id)>=0;}
function dismissNudge(id){const d=nudgeDismissed();if(d.indexOf(id)<0){d.push(id);try{localStorage.setItem(NUDGE_KEY,JSON.stringify(d));}catch(e){}}renderPinned();}
// Pinned-nudge tray collapse state, persisted. Collapsed by default; the chip
// shows the count and expands to the rows. When there are 0 nudges, nothing shows.
const PIN_OPEN_KEY='theo_pin_tray_open';
function pinTrayOpen(){try{return localStorage.getItem(PIN_OPEN_KEY)==='1';}catch(e){return false;}}
function togglePinTray(){const open=!pinTrayOpen();try{localStorage.setItem(PIN_OPEN_KEY,open?'1':'0');}catch(e){}renderPinned();}
function renderPinned(){const v=VIEWS[view],f=v.nm.split(' ')[0];
 const nudges=[
  {id:'pv-draft-chase',cls:'assist',pz:'✦',msg:`<b>${llm}</b> can draft a status-chase email to Acme`,act:`<button class="btn btn-ghost btn-sm" onclick="aiDraft()">Draft</button>`},
  {id:'pv-status-update',cls:'assist',pz:'✦',msg:`<b>${llm}</b> can draft a status update to stakeholders`,act:`<button class="btn btn-ghost btn-sm" onclick="draftStatusUpdate()">Draft</button>`}
 ].concat(proactiveNudges()).filter(n=>!isNudgeDismissed(n.id));
 // user-pinned skill suggestions (pinned from an inline chat card) also live in the tray
 pinnedSkills().forEach(function(k){var s=SKILLS[k];if(!s)return;nudges.push({id:'pin-'+k,cls:'assist',pz:'📌',msg:`<b>Pinned</b> · ${s.name}`,act:`<button class="btn btn-ghost btn-sm" onclick="runSkill('${k}')">Run</button>`,unpin:k});});
 // Theo's active contextual suggestions ALSO live in the actions tray (not only the chat)
 try{ if(window.THEO_WORKFLOW&&window.THEO_WORKFLOW.active){ window.THEO_WORKFLOW.active().forEach(function(s){
  if(s.surface!=='dropdown')return;
  if(isNudgeDismissed('twf-'+s.id))return;
  var lbl=s.confirmLabel||(s.choices&&s.choices[0]?s.choices[0].label:'Open');
  var go=(s.choices&&s.choices[0])?("theoTrayAct('"+s.id+"','"+s.choices[0].key+"')"):("theoTrayAct('"+s.id+"')");
  var extra=(s.choices&&s.choices[1])?('<button class="btn btn-ghost btn-sm" onclick="theoTrayAct(\''+s.id+'\',\''+s.choices[1].key+'\')">'+s.choices[1].label+'</button>'):'';
  nudges.push({id:'twf-'+s.id,cls:'assist',pz:'T',msg:'<b>Theo</b> · '+(s.taskLabel||'suggestion'),act:'<button class="btn btn-ghost btn-sm" onclick="'+go+'">'+lbl+'</button>'+extra});
 }); } }catch(e){}
 const host=$('#pinned');
 if(!nudges.length){host.innerHTML='';return;}   // 0 nudges -> show nothing
 const open=pinTrayOpen();
 const rows=nudges.map(n=>`<div class="pinrow ${n.cls}"><div class="pz">${n.pz}</div><div class="pmsg" title="${String(n.msg).replace(/<[^>]+>/g,'').replace(/"/g,'&quot;')}">${n.msg}</div>${n.act}<button class="pno" onclick="${n.unpin?`togglePinSkill('${n.unpin}')`:`dismissNudge('${n.id}')`}" title="${n.unpin?'Unpin':'Dismiss'}" aria-label="${n.unpin?'Unpin':'Dismiss'}">✕</button></div>`).join('');
 host.innerHTML=`<div class="pintray${open?' open':''}"><button class="pinchip" onclick="togglePinTray()" aria-expanded="${open}" title="${open?'Hide':'Show'} pinned actions"><span class="pcz">⚑</span><span class="pcc">${nudges.length}</span> action${nudges.length===1?'':'s'}<span class="pccar">▾</span></button><div class="pinrows">${rows}</div></div>`;}
// Render ONE Theo suggestion as a chat MESSAGE (Theo avatar + bubble + inline actions), styled like the
// assistant turns so it reads as part of the conversation. Rationale ("why") is the bubble tooltip.
function theoSuggestMsgHTML(sg){
 var ctx=(typeof theoWorkflowCtx==='function')?theoWorkflowCtx():{};
 var title=(typeof sg.titleHtml==='function')?sg.titleHtml(ctx):escapeHtmlPV(sg.titleHtml||'');
 var acts;
 if(sg.choices&&sg.choices.length){
  acts=sg.choices.map(function(c){return '<button class="btn btn-primary btn-sm" onclick="theoTrayAct(\''+sg.id+'\',\''+c.key+'\')">'+escapeHtmlPV(c.label)+'</button>';}).join('');
 }else{
  acts='<button class="btn btn-primary btn-sm" onclick="theoTrayAct(\''+sg.id+'\')">'+escapeHtmlPV(sg.confirmLabel||'Confirm')+'</button>';
 }
 acts+='<button class="btn btn-ghost btn-sm" onclick="theoChatDismiss(\''+sg.id+'\')">Not now</button>';
 return '<div class="msg ai">'+theoAvatarHTML()+'<div class="bcol"><div class="bnm" style="color:var(--navy)">Theo <span class="tm">'+escapeHtmlPV(nowStamp())+'</span></div><div class="bub ai" title="'+escapeHtmlPV(sg.why||'')+'">'+title+'<div class="aacts" style="margin-top:8px">'+acts+'</div></div></div></div>';
}
// act on / dismiss a Theo suggestion (from the chat message OR the actions tray), then refresh both surfaces
function theoRefresh(){ try{if(typeof renderChat==='function')renderChat(($('#csearch')||{}).value||'');}catch(e){} try{if(typeof renderPinned==='function')renderPinned();}catch(e){} }
function theoTrayAct(id,choice){ try{ if(window.THEO_WORKFLOW&&window.THEO_WORKFLOW.act) window.THEO_WORKFLOW.act(id,choice||''); }catch(e){} theoRefresh(); }
function theoChatDismiss(id){ try{ if(window.THEO_WORKFLOW&&window.THEO_WORKFLOW.dismiss) window.THEO_WORKFLOW.dismiss(id); }catch(e){} theoRefresh(); }
function draftCard(d){return `<div class="aidraft"><div class="akv">To: <b>${d.to}</b></div><div class="akv">Subject: <b>${d.subj}</b></div><div class="abody">${d.body}</div><div class="aacts"><button class="btn btn-primary btn-sm" onclick="toast('Opened in Outlook, review &amp; send')">Send via Outlook</button><button class="btn btn-ghost btn-sm" onclick="toast('Edit, demo')">Edit</button></div><div class="anote">Drafted by ${llm} ${llmModel} · review before sending, nothing is sent on your behalf</div></div>`;}
function aiDraft(){CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'Here\'s a draft to Acme asking for status on the security questionnaire and an ETA, review and send when you\'re happy:',draft:{to:'sam@acme.ai',subj:'Status check, security questionnaire (ref P-1042)',body:'Hi Sam,\n\nFollowing up on the information-security questionnaire we shared for the analytics engagement. Could you share the current status and an estimated date you\'ll return it? It\'s the last item the third-party risk review is waiting on before we can proceed.\n\nHappy to jump on a quick call if easier.\n\nThanks,\nPriya'}});renderChat($('#csearch').value);}
// #E2: a status-UPDATE variant (to internal stakeholders) alongside the supplier chase
function draftStatusUpdate(){CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'Here is a status update you can send to the project stakeholders. It summarizes where P-1042 stands, what it is waiting on, and the projected date. Review and send when you are happy:',draft:{to:'priya.shah@lilly.com; it-procurement-leads@lilly.com',subj:'Status · P-1042 Acme Analytics (Orange) · awaiting WwTP + Cyber',body:'Team,\n\nQuick status on the Acme Analytics engagement (P-1042 · $1.8M · 3-yr MSA):\n\n- Stage: parallel reviews. Legal (MSA) on track; AI Registry cleared.\n- Waiting on: Acme to return the WwTP risk questionnaire (overdue) and the Cyber/ISS questionnaire (at risk).\n- Contract: on v3; held the 1x liability cap with a PI carve-out.\n- Projected: the reviews gate clears ~7/1 if the questionnaires land this week; target PO 7/31.\n\nI will flag if WwTP slips further.\n\nThanks,\nMarc'}});renderChat(($('#csearch')||{}).value||'');}
// #E5: PROACTIVE nudges - when a step is overdue/at-risk, surface a one-click notify to its blocker
function proactiveNudges(){
 return (typeof LIVESLA!=='undefined'?LIVESLA:[]).filter(function(s){return s.st==='over'||s.st==='warn';}).map(function(s){
  var w=(s.wait&&s.wait[0])?s.wait[0]:null; if(!w) return null;
  var lab=s.st==='over'?'overdue':'at risk';
  return {id:'proactive-'+s.node,cls:'wait',pz:'⚑',msg:`<b>${s.n}</b> is ${lab} · ${w.who} owes the next step`,act:`<button class="btn btn-ghost btn-sm" onclick="notifyBlocker('${s.node}')">Notify</button>`};
 }).filter(Boolean);
}
function notifyBlocker(node){
 var s=(typeof LIVESLA!=='undefined'?LIVESLA:[]).find(function(x){return x.node===node;}); if(!s) return;
 var w=(s.wait&&s.wait[0])?s.wait[0]:{who:'the owner',act:'the next step'};
 var lab=s.st==='over'?'overdue':'at risk of slipping';
 CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'I drafted a nudge to '+w.who+' about "'+s.n+'" ('+(s.st==='over'?'overdue':'at risk')+'). Review and send - it goes out via the channel they prefer (email or Teams):',draft:{to:w.who,subj:'Action needed · '+s.n+' ('+(s.st==='over'?'overdue':'at risk')+')',body:'Hi,\n\nThe step "'+s.n+'" is '+lab+' and is waiting on you to '+w.act.toLowerCase()+'. Could you action it or share an ETA? It is the last item blocking the next gate.\n\nThanks,\nMarc'}});
 renderChat(($('#csearch')||{}).value||'');
}
// #E10: summarize a long supplier turn (what changed / what's asked) into the chat
function summarizeTurn(){var sum='Here is Acme\'s last turn ('+(INBOUND.from?INBOUND.from.name:'Acme')+', '+(INBOUND.attachment||'redline')+') summarized - what changed and what they are asking:<br><br>'+
 '<b>Accepted (7):</b> the Lilly DPA + EU SCCs, the 30-day termination-for-convenience notice, the sub-processor audit cadence, the insurance levels, the SOC 2 cadence, the venue, and the order-of-precedence clause.<br><br>'+
 '<b>Countered (5):</b><br>1. Liability cap - Acme wants 2x fees (we hold 1x + PI carve-out).<br>2. Sub-processors - Acme wants notice-only (we want prior-approval).<br>3. Renewal - then-current list (we want a CPI / 3% cap).<br>4. IP - Acme retains models trained on Lilly data (we want Lilly-data outputs).<br>5. Indemnity - Acme caps PI-breach indemnity (we want it uncapped).<br><br>'+
 '<b>Asks:</b> a 30-minute call to close the liability + sub-processor points; no new asks on price. <b>Net:</b> 2 high-severity gaps remain (liability, sub-processors).';
 CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:sum});renderChat(($('#csearch')||{}).value||'');}
function nowStamp(){const d=new Date();return d.toLocaleDateString('en-US')+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
// supplier landscape is GATED / on-demand: deliberately requested to support a new-supplier justification, never auto-run
function runLandscape(){toast('Generating a supplier landscape on demand · internal base + TPRM, then a market scan with fit scores');if(typeof CHAT!=='undefined'){CHAT.push({who:llm+' assistant',av:'✦',cls:'ai',model:llm,tm:nowStamp(),tx:'Running a supplier landscape on demand to test the market for this need. I will start with our internal base and TPRM, then a multi-pass market scan, and return a fit-scored shortlist to support (or challenge) the sole-source justification.'});var cs=$('#csearch');if(typeof renderChat==='function')renderChat(cs?cs.value:'');}}
function meMsg(tx,extra){const v=VIEWS[view];const ini=v.nm.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();return Object.assign({who:v.nm,av:ini,cls:v.mcls||'',tm:nowStamp(),tx:tx},extra||{});}
function aiMsg(tx,extra){return Object.assign({who:llm+' assistant',av:'✦',cls:'ai',model:llm+' '+llmModel,tm:nowStamp(),tx:tx},extra||{});}
function nodeSkillsHTML(id){const ks=NODESKILLS[id];if(!ks)return'';return `<div class="sect"><div class="secthd"><div class="t">Skills at this step</div></div><div class="sklist">`+ks.map(k=>`<div class="skrow"><div class="ski">✦</div><div class="skmeta"><div class="skn">${SKILLS[k].name}${SKILLS[k].concept?' <span class="cbadge">Concept</span>':''}</div><div class="skd">${SKILLS[k].desc}</div></div><button class="btn btn-primary btn-sm" onclick="runSkill('${k}')">Run →</button></div>`).join('')+`</div></div>`;}
function skillSuggestCard(k){const s=SKILLS[k];const pin=isSkillPinned(k);return `<div class="sksug" title="Suggested skill"><span class="ssk">✦</span><span class="ssn">${s.name}${s.concept?' <span class="cbadge">Concept</span>':''}</span><button class="sspin${pin?' on':''}" onclick="togglePinSkill('${k}')" title="${pin?'Pinned to the actions tray, click to unpin':'Pin to the actions tray'}" aria-label="Pin to the actions tray">⚑</button><button class="ssrun" onclick="runSkill('${k}')">Run</button><button class="ssno" onclick="toast('You can run it anytime from + Skills')" title="Dismiss" aria-label="Dismiss">✕</button></div>`;}
// pin an inline suggestion card to the collapsible actions tray (renderPinned merges these)
const PIN_SKILL_KEY='theo_pinned_skills';
function pinnedSkills(){try{return JSON.parse(localStorage.getItem(PIN_SKILL_KEY)||'[]');}catch(e){return [];}}
function isSkillPinned(k){return pinnedSkills().indexOf(k)>=0;}
function togglePinSkill(k){const p=pinnedSkills();const i=p.indexOf(k);if(i>=0){p.splice(i,1);toast('Unpinned from actions');}else{p.push(k);try{localStorage.setItem(PIN_OPEN_KEY,'1');}catch(e){}toast((SKILLS[k]?SKILLS[k].name:'Action')+' pinned to actions');}try{localStorage.setItem(PIN_SKILL_KEY,JSON.stringify(p));}catch(e){}renderPinned();var cs=$('#csearch');renderChat(cs?cs.value:'');}
function artifactCard(k){const s=SKILLS[k];const dl=s.file?`<button class="btn btn-ghost btn-sm" onclick="toast('Downloaded ${s.file}')">Download</button>`:'';const ext=s.email?`<button class="btn btn-ghost btn-sm" onclick="toast('Opened in Outlook, review &amp; send. Nothing is sent on your behalf.')"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${MAIL_ICON}</svg>Outlook</button>`:`<button class="btn btn-ghost btn-sm" onclick="toast('Shared to the project Teams channel, demo')"><svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${TEAMS_ICON}</svg>Teams</button>`;return `<div class="artifact"><div class="arth"><div class="arti">✦</div><div><div class="artt">${s.out}</div><div class="arts">from ${s.name}</div></div><span class="arttag">${s.concept?'Concept · Draft':'Draft'}</span></div><pre class="artbody">${s.preview}</pre><div class="aacts"><button class="btn btn-ghost btn-sm" onclick="refineSkill('${k}')">Refine</button>${dl}<button class="btn btn-primary btn-sm" onclick="uploadFinal('${k}')">Upload final →</button>${ext}</div><div class="anote">Generated by ${llm} ${llmModel} · a draft for you to review, refine, then download or upload the final. Nothing is filed or sent automatically.</div></div>`;}
function runSkill(k){closeDrawer();const sp=$('#skpop');if(sp)sp.classList.remove('on');const s=SKILLS[k];CHAT.push(meMsg('Run the skill: '+s.name));renderChat('');setTimeout(()=>{CHAT.push(aiMsg('Done, here\'s a draft '+s.out+'. Review it, refine if needed, then download or upload the final and the step continues.',{artifact:k}));renderChat('');},520);}
function refineSkill(k){const s=SKILLS[k];CHAT.push(meMsg('Refine: '+s.refine));renderChat('');setTimeout(()=>{CHAT.push(aiMsg('Updated the '+s.out+', '+s.refine+'. Revised draft:',{artifact:k}));renderChat('');},480);}
function uploadFinal(k){const s=SKILLS[k];const t=NODE[s.node]?NODE[s.node].title.replace('Gate · ','').replace('Track · ',''):'the step';toast('Uploaded the final '+s.out+', '+t+' continues.');CHAT.push({who:'Theo',av:'T',cls:'sys',tm:nowStamp(),tx:'Final '+s.out+' uploaded to the project library, '+t+' advances.'});renderChat('');}
function toggleSkills(e){e.stopPropagation();const p=$('#skpop');if(!p)return;p.classList.toggle('on');if(p.classList.contains('on'))p.innerHTML=`<div class="skph">Run a skill</div>`+ALLSKILLS.map(k=>`<div class="li" onclick="event.stopPropagation();runSkill('${k}')"><span class="lin">${SKILLS[k].name}${SKILLS[k].concept?' <span class="cbadge">Concept</span>':''}</span><span class="lid">${NODE[SKILLS[k].node]?NODE[SKILLS[k].node].title.replace('Gate · ','').replace(', skipped',''):''}</span></div>`).join('');}
document.addEventListener('click',()=>{closeProv();const p=$('#skpop');if(p)p.classList.remove('on');});
/* per-provider model selector lives in provPick/setModel (above) */
function renderPeople(){const v=VIEWS[view];let h='';people.forEach(p=>{const isMe=p.n===v.me,canSelf=isMe&&p.r==='Stakeholder',canOther=(view==='owner'||view==='rep')&&p.r==='Stakeholder'&&!isMe;const x=canSelf?`<span class="x" title="Leave" onclick="leave('${p.n}')">−</span>`:(canOther?`<span class="x" title="Remove" onclick="removePerson('${p.n}')">×</span>`:'');h+=`<div class="pa ${p.cls}" style="background:${pvAvColor(p.n)};color:#fff">${p.i}${x}<span class="tip">${p.n}<span class="r"> · ${p.r}${isMe?' · you':''}</span></span></div>`;});if(view==='owner'||view==='rep')h+=`<button class="paadd" title="Add a stakeholder" onclick="toggleAdd(event)">+</button>`;$('#avstack').innerHTML=h;}
function toggleAdd(e){e.stopPropagation();const p=$('#addpop');p.classList.toggle('on');if(p.classList.contains('on')){p.innerHTML=`<input id="atinput" placeholder="@mention to add…" oninput="dir(this.value)"><div id="dirlist"></div><div class="adnote">Resolved against Microsoft 365 / Entra.</div>`;setTimeout(()=>{const i=$('#atinput');if(i)i.focus();},10);}}
function dir(q){q=(q||'').replace('@','').toLowerCase().trim();const l=$('#dirlist');if(!l)return;const hits=DIR.filter(d=>d.n.toLowerCase().includes(q)&&!people.find(p=>p.n===d.n));l.innerHTML=hits.map(d=>`<div class="diritem" onclick="addPerson('${d.n}','${d.i}')"><div class="pa" style="margin:0;background:${pvAvColor(d.n)};color:#fff">${d.i}</div><div><div class="dn">${d.n}</div><div class="dr">${d.d} · Entra</div></div></div>`).join('');}
function addPerson(n,i){people.push({n,i,r:'Stakeholder',cls:''});$('#addpop').classList.remove('on');renderPeople();if(curtab==='overview')wireOverview();toast(n+' added, can now see and contribute');}
function removePerson(n){people=people.filter(p=>p.n!==n);renderPeople();if(curtab==='overview')wireOverview();toast(n+' removed');}
function leave(n){people=people.filter(p=>p.n!==n);view='owner';applyView();toast('You left the project');}
function renderPeoplePop(){const v=VIEWS[view];const canManage=(view==='owner'||view==='rep'||view==='admin');let h=`<div class="pph">People & roles</div>`;people.forEach(p=>{const isMe=p.n===v.me;let act='';if(isMe&&p.r!=='Stakeholder')act=`<span class="pa2" onclick="handOff('${p.n}')">Hand off →</span>`;else if(isMe)act=`<span class="pa2" onclick="leave('${p.n}')">Leave</span>`;else if(p.r==='Owner'&&(view==='rep'||view==='admin'))act=`<span class="pa2" onclick="reassignOwner()">Reassign</span>`;else if(p.r==='Stakeholder'&&canManage)act=`<span class="pa2" onclick="event.stopPropagation();removePerson('${p.n}');renderPeoplePop()">Remove</span>`;h+=`<div class="pplrow"><div class="pa ${p.cls}" style="margin:0;background:${pvAvColor(p.n)};color:#fff">${p.i}</div><div class="pplm"><div class="ppn">${p.n}${isMe?' · you':''}</div><div class="ppr">${p.r}</div></div>${act}</div>`;});if(canManage)h+=`<div class="pplrow add" onclick="event.stopPropagation();toggleAdd(event)"><div class="paadd2">+</div><div class="ppn">Add a stakeholder (@mention)</div></div>`;h+=`<div class="pplbulk" onclick="toast('Bulk reassign owners & reps, admin portfolio surface (demo)')">Admin · bulk reassign owners &amp; reps →</div>`;$('#peoplepop').innerHTML=h;}
function togglePeople(e){e.stopPropagation();const p=$('#peoplepop');p.classList.toggle('on');if(p.classList.contains('on'))renderPeoplePop();}
function handOff(n){toast('Hand off your role, pick a successor (demo)');}
function reassignOwner(){toast('Reassign the project owner, pick a new owner (demo)');}
// Rep actions are gated by project STAGE (derived from type), RV24. You can't run
// a sourcing event on a renewal already in contracting, or advance a gate at intake.
const MANAGE_RULES={advance:'active',routing:'active',source:'intake'};
// IA (header controls, 2026-07-05): "Manage routing" and "Override" are RELOCATED
// out of the header, routing lives on the Workflow tab (it re-sequences the flow),
// override lives on the specific gate's node drawer (with the justification inline).
const MANAGE_MOVED={routing:1,override:1};
function manageStage(){return /intake|scoping/i.test((PROJECTS[CURPROJ]||{}).type||'')?'intake':'active';}
function renderManage(){const v=VIEWS[view],w=$('#mgwrap');if(!w)return;if(!v.manage){w.innerHTML='';return;}const st=manageStage();
 w.innerHTML=v.manage.filter(function(a){if(MANAGE_MOVED[a[0]])return false;const r=MANAGE_RULES[a[0]];return !r||r===st;}).map(a=>`<button class="ia ${a[2]?'warn':''}" onclick="toast('${a[1]}, demo')" title="${a[1]}"><svg viewBox="0 0 24 24">${MIC[a[0]]}</svg><span class="tip">${a[1]}</span></button>`).join('');}
document.addEventListener('click',()=>{['#addpop','#llmpop','#peoplepop'].forEach(s=>{const e=$(s);if(e)e.classList.remove('on');});});
const ta=$('#ta'),sendBtn=$('#sendBtn'),pill=$('#pill');
ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,132)+'px';sendBtn.disabled=!ta.value.trim();});
ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}});
ta.addEventListener('focus',()=>pill.classList.add('focus'));ta.addEventListener('blur',()=>pill.classList.remove('focus'));
sendBtn.onclick=sendMsg;
['dragenter','dragover'].forEach(ev=>pill.addEventListener(ev,e=>{e.preventDefault();pill.classList.add('over');}));
['dragleave','drop'].forEach(ev=>pill.addEventListener(ev,e=>{e.preventDefault();if(ev==='dragleave'&&pill.contains(e.relatedTarget))return;pill.classList.remove('over');}));
pill.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];toast((f?f.name:'document')+' attached, demo');});
function sendMsg(){const t=ta.value.trim();if(!t)return;const v=VIEWS[view];CHAT.push({who:v.nm,av:v.av,cls:v.mcls,tm:nowStamp(),tx:t});ta.value='';ta.style.height='auto';sendBtn.disabled=true;$('#csearch').value='';renderChat();if(/draft|email|chase|status/i.test(t))setTimeout(aiDraft,500);}
function applyView(){const v=VIEWS[view];$('#av').textContent=v.av;$('#rname').textContent=v.nm;$('#rrole').textContent=v.role;renderPeople();renderManage();renderChat($('#csearch').value);renderPinned();buildTabs();renderTab();}
function cycleView(){const o=['owner','rep','stakeholder'];view=o[(o.indexOf(view)+1)%3];applyView();toast('Viewing as '+VIEWS[view].role);}
// Canonical role -> this page's view (lead maps to the read-only observer surface).
window.theoSetRole=function(k){view=({rep:'rep',owner:'owner',lead:'stakeholder'})[k]||'rep';applyView();};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200);}
// ---- canned-example project switching --------------------------------------
const CCIVAR={orange:'var(--cci-orange)',red:'var(--cci-red)',yellow:'var(--amber)',green:'var(--teal-d)'};
function renderExSwitch(){const w=$('#exswitch');if(!w)return;let h='<span class="exlbl">Example:</span>';
 Object.keys(PROJECTS).forEach(function(k){h+=`<button class="expill${k===CURPROJ?' on':''}" onclick="pickProject('${k}')">${PROJECTS[k].short}</button>`;});
 w.innerHTML=h;}
function applyProject(){if(typeof PV_UNRESOLVED!=='undefined'&&PV_UNRESOLVED){if(typeof pvUnresolvedRender==='function')pvUnresolvedRender(PV_UNRESOLVED);return;}
 const p=PROJECTS[CURPROJ];
 selectWorkflowModel();   // rfx-lifecycle: pick the competitive vs sole-source workflow spine for this project
 const t=document.querySelector('.ptitle');if(t)t.textContent=p.title;
 const m=document.querySelector('.pmeta');
 if(m)m.innerHTML=`<span>${p.code}</span><span>·</span><span>${p.type}</span><span>·</span><span><span class="swatch" style="background:${CCIVAR[p.cci]||'var(--cci-orange)'}"></span>${p.cciLabel}</span><span>·</span><span>${p.tco}</span>`;
 renderExSwitch();renderManage();
 curtab='overview';document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t==='overview'));
 closeDrawer();buildTabs();renderTab();}
function pickProject(k){if(!PROJECTS[k]||k===CURPROJ){if(k===CURPROJ)return;}CURPROJ=k;applyProject();toast('Example project: '+PROJECTS[k].title);}
// Running a not-yet-produced skill surfaces its dashboard tab live.
function surfaceDash(id){PROJECTS[CURPROJ].mats[id]=true;const d=DASHTABS.find(function(x){return x.id===id;});buildTabs();tab(id);toast((d?d.label:'Dashboard')+' produced, opening the tab');}
// Honest placeholder for a projects.html card whose project isn't wired into the detailed view.
// Never silently show the default (acme) project's data for a different card.
function pvUnresolvedRender(reqKey){try{
 var bar=document.getElementById('tabs'); if(bar) bar.style.display='none';   // hide, don't wipe (core tabs are static)
 var t=document.querySelector('.ptitle'); if(t) t.textContent='Example project';
 var m=document.querySelector('.pmeta'); if(m) m.innerHTML='<span>'+escapeHtmlPV(reqKey)+'</span><span>·</span><span>detailed view not yet wired</span>';
 var tb=document.getElementById('tabbody'); if(tb) tb.innerHTML='<div class="sect" style="max-width:660px;margin:34px auto"><div class="card" style="text-align:center;padding:40px 26px"><div style="font-size:15px;font-weight:800;color:var(--ink)">This example isn’t wired into the detailed view yet</div><div style="font-size:13px;color:var(--mut);line-height:1.65;margin-top:11px">The demo details <b>11 representative projects</b> spanning every sourcing type, sole-source, competitive RFx, renewal, buy-under-MSA and early scoping. This card (<b>'+escapeHtmlPV(reqKey)+'</b>) is one of the additional example rows on the Projects list; its per-project detail hasn’t been authored. <br><br><a href="projects.html" style="color:var(--blue-d);font-weight:700;text-decoration:none">← Back to Projects</a></div></div></div>';
}catch(e){}}
// Extract the project key the hash is REQUESTING (or '' for a filter token / empty hash).
function pvReqKey(){try{var rh=(location.hash||'').replace(/^#/,'');var mm=rh.match(/(?:^|[?&])p=([a-z0-9_-]+)/i);var rk=mm?mm[1]:(/^[a-z0-9_-]+$/i.test(rh)?rh:'');
 return (rk && !/^(review|approval|sourcing|active|renewing)$/i.test(rk) && !/cdrconfirm/i.test(rk))?rk:'';}catch(e){return '';}}
// Re-pick the project from the hash now that ALL project modules (incl. the per-project pv-proj-*.js
// files loaded after pv-03) are registered, pv-03's early pick can miss projects defined later. If the
// hash requests a project that DOESN'T resolve, flag it so every render shows the placeholder (not acme).
var _hp2=null; try{_hp2=(typeof curprojFromHash==='function')?curprojFromHash():null;}catch(e){}
if(_hp2){PV_UNRESOLVED=null;CURPROJ=_hp2;}
else {var _rk=pvReqKey();if(_rk)PV_UNRESOLVED=_rk;}
applyView();applyProject();
// E11: deep-link from the PR-gate task ("#cdrconfirm=1") opens the contract-data confirm gate.
try{ if(/cdrconfirm=1/i.test(location.hash||'')) setTimeout(function(){ if(typeof window.openCdrConfirm==='function') window.openCdrConfirm(); },250); }catch(e){}
// Demo router injects the hash AFTER this script runs -> re-apply on hashchange.
window.addEventListener('hashchange',function(){var k=curprojFromHash();
 if(k){ if(PV_UNRESOLVED||k!==CURPROJ){PV_UNRESOLVED=null;CURPROJ=k;applyProject();} }
 else { var rk=pvReqKey(); if(rk){PV_UNRESOLVED=rk;applyProject();} }
 liveOverlay();});

/* Live overlay: when this view is opened for a REAL platform project id
   (#p=<id> that is not one of the canned examples), pull the live record from
   the kernel and overlay the header + surface live drafts/suggestions. The
   example workflow materials below stay demo: the kernel does not emit
   page-ready dashboard artifacts, so fabricating them would misrepresent. */
function liveBadgeHolder(){
 var b=document.getElementById('livebadge');
 if(!b){var t=document.querySelector('.ptitle');if(t&&t.parentNode){b=document.createElement('span');b.id='livebadge';b.style.marginLeft='10px';t.parentNode.insertBefore(b,t.nextSibling);}}
 return b;
}
// #134 (b), derive FE traits from a LIVE record when it carries none, so the
// workflow variant (wfKey) is honest for a real backend id. Mirrors the
// legacy type-regex predicates (renew/competitive) the trait booleans replaced.
function pvTraitsFromType(type){var s=String(type||'');
 var renewal=/renew/i.test(s),competitive=/competitive|rfp|rfx/i.test(s);
 return {competitive:competitive,newSupplier:!renewal,existingMSA:null,supplierPaper:true,renewal:renewal,supplierChosen:!competitive,stage:'active'};}
// #134 (b), synthesize a minimal project-view descriptor from a LIVE backend
// record so a real `proj-*` id renders NATIVELY (not the "not wired" placeholder).
// The rich per-project scan/requirement mocks are intentionally EMPTY: real
// projects' depth comes from the materialized-analysis artifacts (the live panel),
// not slug-hardcoded mocks. Empty-safe defaults keep the demo tab renderers from
// throwing on the sparse descriptor.
function pvSynthLiveDescriptor(p){
 var cciMap={Green:'green',Yellow:'yellow',Orange:'orange',Red:'red'};
 var cciLc=cciMap[p.cci]||String(p.cci||'').toLowerCase()||'orange';
 var cciLabel=p.cci||(cciLc?cciLc.charAt(0).toUpperCase()+cciLc.slice(1):'');
 var v=p.estimatedValue,tco=v?('$'+(v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1e3)+'K')+' TCO'):'—';
 var traits=(p.traits&&typeof p.traits==='object')?p.traits:pvTraitsFromType(p.type);
 return {title:p.name||p.id,code:p.id,type:p.type||'',cci:cciLc,cciLabel:cciLabel,tco:tco,
  supplier:'',short:(p.name||p.id),traits:traits,mats:{},landscape:[],requirements:[],
  riskDimensions:[],__live:true,slug:p.slug||null};
}
async function liveOverlay(){
 if(!window.LillyAPI)return;
 var mm=(location.hash||'').match(/p=([a-z0-9_-]+)/i);
 var id=mm&&mm[1];
 if(!id||PROJECTS[id])return;            // canned example (or already-synthesized) -> stays demo
 liveBadgeHolder();
 var r=await LillyAPI.tryLive(function(){return LillyAPI.project(id);},null);
 if(r.source!=='live'||!r.data){if(LillyAPI.badge)LillyAPI.badge('livebadge','demo');return;}
 var p=r.data;
 // #134 (b), PROMOTE a resolvable LIVE record to a native render: register a
 // synthesized descriptor, make it the working project, clear PV_UNRESOLVED, and
 // re-render so the workflow variant derives from the record's traits and the
 // live-analysis panel mounts (pvLiveAnalysisMount no longer self-suppresses).
 // OFFLINE this branch is never reached (tryLive returns demo above), so the
 // placeholder path is byte-identical.
 try{
  PROJECTS[id]=pvSynthLiveDescriptor(p);
  if(typeof PV_UNRESOLVED!=='undefined')PV_UNRESOLVED=null;
  CURPROJ=id;
  if(typeof applyProject==='function')applyProject();
 }catch(e){}
 var t=document.querySelector('.ptitle');if(t&&p.name)t.textContent=p.name;
 var m=document.querySelector('.pmeta');
 if(m){var v=p.estimatedValue;var spend=v?('$'+(v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1e3)+'K')):'—';
  m.innerHTML='<span>'+LillyAPI.esc(p.id||'')+'</span><span>·</span><span>'+LillyAPI.esc(p.type||'')+'</span><span>·</span><span><span class="swatch" style="background:'+(CCIVAR[p.cci]||'var(--cci-orange)')+'"></span>'+LillyAPI.esc(p.cci||'')+'</span><span>·</span><span>'+spend+'</span><span>·</span><span>'+LillyAPI.esc(p.status||'')+'</span>';}
 if(LillyAPI.badge)LillyAPI.badge('livebadge','live');
 var dr=await LillyAPI.tryLive(function(){return LillyAPI.projectDrafts(id);},null);
 var sg=await LillyAPI.tryLive(function(){return LillyAPI.suggestions(id);},null);
 var drafts=Array.isArray(dr.data)?dr.data:[];
 var nd=drafts.length, ns=Array.isArray(sg.data)?sg.data.length:0;
 var strip=document.getElementById('liveprojstrip');
 if(!strip){var m2=document.querySelector('.pmeta');if(m2&&m2.parentNode){strip=document.createElement('div');strip.id='liveprojstrip';strip.style.cssText='margin:8px 0 0;font:600 12px var(--mono,monospace);color:var(--mut2,#6b6b6b)';m2.parentNode.insertBefore(strip,m2.nextSibling);}}
 if(strip)strip.textContent='Live platform record · '+nd+' draft'+(nd===1?'':'s')+', '+ns+' suggestion'+(ns===1?'':'s')+' from the kernel.';
 renderLiveDrafts(drafts);
 // B-batch reads for the live project (B9 obligations + B1 contract versions).
 // Demo objects (OBLIGATIONS / CVERSIONS) remain the canned-example fallback;
 // here we surface the live register for the actual platform record.
 var ob=await LillyAPI.tryLive(function(){return LillyAPI.listObligations(id);},null);
 // OT.1 enrichment (additive): the reflect-only per-duty tracker read (status /
 // consequence / owner). Quiet on failure; the register renders without it.
 var obtr=await LillyAPI.tryLive(function(){return LillyAPI.obligationsTrackerForProject(id);},null);
 renderLiveObligations(ob.source==='live'?ob.data:null,obtr.source==='live'?obtr.data:null);
 var cv=await LillyAPI.tryLive(function(){return LillyAPI.listVersions(id);},null);
 renderLiveVersions(cv.source==='live'?cv.data:null);
 // servicenow-integration Gap 1: reflect the linked ITSM request + risk screening
 // status. Read-only; the proposal (when ServiceNow reports the request cleared) is
 // surfaced as a NON-destructive suggestion. Nothing here advances a gate.
 var it=await LillyAPI.tryLive(function(){return LillyAPI.itsmStatus(id);},null);
 renderLiveItsm(it.source==='live'?it.data:null);
 var sc=await LillyAPI.tryLive(function(){return LillyAPI.screeningStatus(id);},null);
 renderLiveScreening(sc.source==='live'?sc.data:null);
 // Renewal horizon (additive, reflect-only): the record's own contract expiry +
 // the deterministic renewal-recommendation read. Quiet when the record carries
 // no expiry; nothing is renewed, noticed, or terminated on your behalf.
 await renderLiveRenewal(p);
 // cloud-object-storage Gap 2/3: the live document index (each row carries a
 // reflect-only retention label + version chain). Surfaces in the Documents tab.
 var dv=await LillyAPI.tryLive(function(){return LillyAPI.documentsBy({projectId:id});},null);
 LIVEDOCS=(dv.source==='live'&&Array.isArray(dv.data))?dv.data:null;
 if(curtab==='docs'&&typeof renderTab==='function')renderTab();   // refresh if the tab is already open
}
/* Live ITSM (ServiceNow) request status + optional advance PROPOSAL. Reflect-only:
   the proposal is a suggestion the human acts on in the review workflow; this page
   never auto-advances anything. */
function renderLiveItsm(data){
 var host=document.getElementById('liveitsm');
 var anchor=document.getElementById('liveversions')||document.getElementById('liveobls')||document.getElementById('livedrafts')||document.getElementById('liveprojstrip')||document.querySelector('.pmeta');
 if(!host){if(!anchor||!anchor.parentNode)return;host=document.createElement('div');host.id='liveitsm';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}
 if(data===null){host.innerHTML='';return;}          // not live -> stay quiet
 var itsm=data.itsm;
 if(!itsm){host.innerHTML='';return;}                 // no linked request -> quiet
 var num=escapeHtmlPV(itsm.number||itsm.requestId||'request');
 var st=escapeHtmlPV(itsm.status||'unknown');
 var upd=escapeHtmlPV(itsm.lastUpdated||'');
 var html='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">ServiceNow request · live</div>'+
  '<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-radius:12px;padding:9px 12px;margin:0 0 7px"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+num+'</div><div style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">status: '+st+(upd?' · updated '+upd:'')+'</div></div></div>';
 if(data.proposal){
  var note=escapeHtmlPV(data.proposal.note||'ServiceNow reports this request cleared. The linked review can advance.');
  html+='<div style="background:var(--tint-eaf0f9,#EAF0F9);border:1px solid #C6D7EF;border-left:3px solid #0F3A85;border-radius:10px;padding:9px 12px;margin:0 0 7px;font-size:12px;line-height:1.5;color:#1A1A1A"><b style="color:var(--navy)">Suggestion, not applied.</b> '+note+' Advance it in the review workflow when you are ready.</div>';
 }
 host.innerHTML=html;
}
/* ===== Renewal horizon flag (ADDITIVE, reflect-only) =====
   For a LIVE platform record that carries a contract expiry, surface a compact
   renewal-horizon strip: the real expiry date + days out, enriched with the
   deterministic renewal-recommendation reflection (POST /api/renewal-
   recommendation via LillyAPI.tryLive) when the engine accepts the record's
   facts. Anti-fabrication: no expiry on the record -> nothing renders; a failed
   or empty call renders only the record's own dates plus "Data not available".
   Severity accents: red inside 30 days, amber inside 120, otherwise Bold Blue
   #0F3A85 (never green). Advisory only: no renewal, renegotiation, recompete,
   termination, or notice is issued on your behalf. */
function liveRenewalExpiry(p){
 if(!p)return null;
 var c=p.contract||{},rn=p.renewal||{},d=p.dates||{};
 var exp=p.currentExpiryISO||p.expiryIso||p.contractExpiryIso||c.currentExpiryISO||c.expiryIso||c.expiry||rn.currentExpiryISO||rn.expiryIso||d.renewalDate||d.expiry||null;
 return (typeof exp==='string'&&/^\d{4}-\d{2}-\d{2}/.test(exp))?exp.slice(0,10):null;
}
async function renderLiveRenewal(p){
 var host=document.getElementById('liverenewal');
 var anchor=document.getElementById('livescreening')||document.getElementById('liveitsm')||document.getElementById('liveversions')||document.getElementById('liveobls')||document.getElementById('livedrafts')||document.getElementById('liveprojstrip')||document.querySelector('.pmeta');
 if(!host){if(!anchor||!anchor.parentNode)return;host=document.createElement('div');host.id='liverenewal';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}
 var exp=liveRenewalExpiry(p);
 if(!exp){host.innerHTML='';return;}   // no contract expiry on the record -> quiet (never invented)
 var days=Math.round((new Date(exp+'T00:00:00Z').getTime()-Date.now())/86400000);
 var col=days<=30?'#C8202E':days<=120?'var(--amber-d,#8A5A00)':'#0F3A85';
 var recTxt='';
 var input={contract:{id:p.contractId||undefined,name:p.name||undefined,supplier:p.supplier||undefined},expiryIso:exp,value:(typeof p.estimatedValue==='number'?p.estimatedValue:undefined),asOf:new Date().toISOString()};
 var r=await LillyAPI.tryLive(function(){return LillyAPI.renewalRecommendation(input);},null);
 if(r.source==='live'&&r.data){
  var refl=r.data;var rec=refl.recommendation||refl.direction||null;
  if(rec&&typeof rec==='object')rec=rec.direction||rec.label||rec.value||null;
  var conf=refl.confidence;if(conf&&typeof conf==='object')conf=conf.level||conf.label||null;
  if(typeof rec==='string'&&rec)recTxt=' · read: <b style="color:var(--navy)">'+escapeHtmlPV(rec)+'</b>'+((typeof conf==='string'&&conf)?' <span style="color:var(--mut2,#6b6b6b)">('+escapeHtmlPV(conf)+' confidence)</span>':'');
 }
 host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">Renewal horizon · live</div>'+
  '<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-left:3px solid '+col+';border-radius:12px;padding:9px 12px;margin:0 0 7px"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:'+col+'">Contract expires '+escapeHtmlPV(exp)+(days>=0?' · '+days+'d out':' · '+Math.abs(days)+'d past')+'</div><div style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">'+(days>=0&&days<=120?'inside the 120-day decision window':'decision window opens 120 days before expiry')+(recTxt||' · recommendation: Data not available')+'</div></div></div>';
}
/* Live third-party risk-screening status. Read-only reflection. */
function renderLiveScreening(data){
 var host=document.getElementById('livescreening');
 var anchor=document.getElementById('liveitsm')||document.getElementById('liveversions')||document.getElementById('liveobls')||document.getElementById('livedrafts')||document.querySelector('.pmeta');
 if(!host){if(!anchor||!anchor.parentNode)return;host=document.createElement('div');host.id='livescreening';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}
 if(data===null){host.innerHTML='';return;}
 var sc=data.screening;
 if(!sc){host.innerHTML='';return;}
 var st=escapeHtmlPV(sc.status||'unknown');
 var open=(typeof sc.openQuestionCount==='number')?sc.openQuestionCount:null;
 var upd=escapeHtmlPV(sc.lastUpdated||'');
 var openTxt=open!=null?(open+' open question'+(open===1?'':'s')):'';
 host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">Risk screening · live</div>'+
  '<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-radius:12px;padding:9px 12px;margin:0 0 7px"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+escapeHtmlPV(sc.screeningId||'screening')+'</div><div style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">status: '+st+(openTxt?' · '+openTxt:'')+(upd?' · updated '+upd:'')+'</div></div></div>';
}
/* Live B9 obligations register. The canned example keeps the rich OBLIGATIONS
   demo (rendered by termsObligationsHTML); for a LIVE project we surface the
   register + alert windows returned by GET /api/projects/:id/obligations. */
function renderLiveObligations(data,tracker){
 var rows=data&&Array.isArray(data.obligations)?data.obligations:[];
 var host=document.getElementById('liveobls');
 var anchor=document.getElementById('livedrafts')||document.getElementById('liveprojstrip')||document.querySelector('.pmeta');
 if(!host){if(!anchor||!anchor.parentNode)return;host=document.createElement('div');host.id='liveobls';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}
 if(data===null){host.innerHTML='';return;}                 // not live -> stay quiet
 if(!rows.length){host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b)">Obligations register · live · none registered yet</div>';return;}
 var win=data.alertWindows||{};
 // OT.1 enrichment (additive, reflect-only): index the tracker's per-duty reads
 // (status / consequenceText / owner) by id or name; a duty with no tracker row
 // simply renders without the extra fields (nothing is invented).
 var tmap={};
 var td=tracker&&(Array.isArray(tracker.duties)?tracker.duties:(Array.isArray(tracker.obligations)?tracker.obligations:(Array.isArray(tracker.items)?tracker.items:null)));
 (td||[]).forEach(function(t){[t.obligationId,t.id,t.term,t.name].forEach(function(k){if(k!=null&&!tmap[''+k])tmap[''+k]=t;});});
 var obStColor=function(st){return /overdue|at-risk|breach/.test(st)?'#C8202E':/due-soon|attention/.test(st)?'var(--amber-d,#8A5A00)':'#0F3A85';};
 host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">Obligations register · live · '+rows.length+' duty'+(rows.length===1?'':'ies')+(win&&win.due!=null?' · '+escapeHtmlPV(win.due)+' due':'')+'</div>'+
  rows.slice(0,12).map(function(o){var label=escapeHtmlPV(o.term||o.name||o.ob||o.label||'Obligation');var due=escapeHtmlPV(o.dueIso||o.due||o.target||'');var sev=escapeHtmlPV(o.severity||o.sev||'');
   var t=tmap[''+(o.id!=null?o.id:'')]||tmap[''+(o.term||o.name||o.ob||'')]||{};
   var owner=o.owner||o.ownerName||t.owner||t.ownerName||'';
   var cons=o.consequence||o.consequenceText||t.consequenceText||t.consequence||'';
   var st=(''+(t.status||o.status||'')).toLowerCase();
   var stChip=st?' · <span style="font-weight:700;color:'+obStColor(st)+'">'+escapeHtmlPV(st)+'</span>':'';
   var consLine=cons?'<div style="font-size:11.5px;color:var(--mut,#4A4540);margin-top:2px">consequence: '+escapeHtmlPV(cons)+'</div>':'';
   return '<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-radius:12px;padding:9px 12px;margin:0 0 7px"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+label+'</div><div style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">'+(sev?sev+' · ':'')+(due||'no date')+(owner?' · owner: '+escapeHtmlPV(owner):'')+stChip+'</div>'+consLine+'</div></div>';}).join('');
}
/* Live B1 contract-version chain. The canned example keeps CVERSIONS (the Deal
   tab's Review mode); for a LIVE project we surface the recorded turn chain +
   the WORM contract state from GET /api/contracts/:id/versions. */
function renderLiveVersions(data){
 var versions=data&&Array.isArray(data.versions)?data.versions:[];
 var host=document.getElementById('liveversions');
 var anchor=document.getElementById('liveobls')||document.getElementById('livedrafts')||document.querySelector('.pmeta');
 if(!host){if(!anchor||!anchor.parentNode)return;host=document.createElement('div');host.id='liveversions';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}
 if(data===null){host.innerHTML='';return;}
 if(!versions.length){host.innerHTML='';return;}            // no contract turns recorded -> quiet
 var state=escapeHtmlPV((data.state&&(data.state.status||data.state))||'');
 host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">Contract versions · live · '+versions.length+' turn'+(versions.length===1?'':'s')+(state?' · '+state:'')+'</div>'+
  versions.slice(0,10).map(function(v){var who=escapeHtmlPV((v.side||'')+(v.channel?' · '+v.channel:''));var final=v.final?' · FINAL':'';
   return '<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-radius:12px;padding:9px 12px;margin:0 0 7px"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">'+escapeHtmlPV(v.versionId||v.id||'Version')+final+'</div><div style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">'+(who||'turn')+'</div></div></div>';}).join('');
}
function escapeHtmlPV(s){return (''+s).replace(/[&<>"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
/* C2 write path: live drafts awaiting human dispatch are rendered with
   Dispatch / Discard actions. Reflect-don't-enforce: the kernel only DRAFTS;
   the user explicitly dispatches (writes to the system of record) or discards. */
function renderLiveDrafts(drafts){
 var host=document.getElementById('livedrafts');
 if(!host){var anchor=document.getElementById('liveprojstrip')||document.querySelector('.pmeta');if(anchor&&anchor.parentNode){host=document.createElement('div');host.id='livedrafts';host.style.cssText='margin:12px 0 0';anchor.parentNode.insertBefore(host,anchor.nextSibling);}}
 if(!host)return;
 if(!drafts||!drafts.length){host.innerHTML='';return;}
 var primary='font:700 12px var(--sans);border:none;border-radius:30px;padding:6px 13px;cursor:pointer;background:#0F3A85;color:#fff';
 var ghost='font:700 12px var(--sans);border:1.5px solid var(--line2,#DCD8D2);border-radius:30px;padding:6px 13px;cursor:pointer;background:var(--surface);color:var(--ink,#1A1A1A)';
 host.innerHTML='<div style="font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--mut2,#6b6b6b);margin:0 0 8px">Drafts awaiting your dispatch</div>'+
  drafts.map(function(d){return '<div class="ldraft" data-id="'+escapeHtmlPV(d.id)+'" style="display:flex;align-items:center;gap:10px;border:1px solid var(--line,#E3E2DF);border-radius:12px;padding:10px 12px;margin:0 0 8px"><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">'+escapeHtmlPV(d.title||d.kind||'Draft')+'</div><div class="lds" style="font:11px var(--mono,monospace);color:var(--mut2,#6b6b6b)">'+escapeHtmlPV((d.kind||'')+' · '+(d.status||'ready'))+'</div></div><button data-act="dispatch" style="'+primary+'">Dispatch</button><button data-act="discard" style="'+ghost+'">Discard</button></div>';}).join('');
 host.querySelectorAll('.ldraft').forEach(function(row){
  var did=row.getAttribute('data-id');
  row.querySelector('[data-act="dispatch"]').onclick=function(){draftAction(did,'dispatch',row);};
  row.querySelector('[data-act="discard"]').onclick=function(){draftAction(did,'discard',row);};
 });
}
async function draftAction(id,act,row){
 // Double-submit guard: disable both row buttons before the live write so a
 // rapid second click cannot fire a second dispatch/discard.
 var btns=row.querySelectorAll('button');
 btns.forEach(function(b){b.disabled=true;b.style.cursor='default';});
 try{
  if(act==='dispatch')await LillyAPI.dispatchDraft(id); else await LillyAPI.discardDraft(id);
  row.style.opacity='.55';
  // success: leave the buttons disabled (this draft is now actioned).
  var s=row.querySelector('.lds'); if(s)s.textContent=(act==='dispatch'?'dispatched':'discarded');
  if(typeof toast==='function')toast('Draft '+(act==='dispatch'?'dispatched - written to the system of record':'discarded')+'.');
 }catch(e){
  // failed: re-enable so the user can retry, preserving the 403/409/error toast.
  btns.forEach(function(b){b.disabled=false;b.style.cursor='pointer';});
  var msg=(e&&e.status===403)?'You are not the owner of this draft.':(e&&e.status===409)?'This draft was already actioned.':'Could not reach the platform.';
  if(typeof toast==='function')toast(msg);
 }
}
liveOverlay();
// ===========================================================================
// THEO CONTRACT-WORKFLOW SUGGESTIONS (reflect-only) - project/contract context.
// Declares the config that assets/theo-connectors.js reads to render the five
// contextual Theo chat chips above the composer and to record matching tasks.
// Reflect-don't-enforce: every confirm runs an existing reflect-only flow (a
// draft / a chat summary / a demo toast); nothing is auto-set, auto-registered,
// or auto-sent. Only this page sets the config, so the rail is contextual and
// does not appear on other pages.
// ===========================================================================
function theoWorkflowCtx(){
 var cur=(typeof cvCurrent==='function')?cvCurrent():null;
 var inbound=!!(typeof INBOUND!=='undefined'&&INBOUND&&INBOUND.pending);
 var supplierSide=!!(cur&&(cur.side==='supplier'||cur.st==='Received'));
 var proc=(typeof dealProcStatus==='function')?dealProcStatus():{k:'review'};
 var gov=''; try{ if(typeof dealStripMSA==='function') gov=dealStripMSA(); }catch(e){}
 var proj='this contract'; try{ if(typeof PROJECTS!=='undefined'&&typeof CURPROJ!=='undefined'&&PROJECTS[CURPROJ]) proj=PROJECTS[CURPROJ].short||proj; }catch(e){}
 return {
  hasContract:true,
  projectLabel:proj,
  governingMsa:gov,
  supplierName:(typeof SUPPLIER_CONTACT!=='undefined'&&SUPPLIER_CONTACT.company)||'the supplier',
  onSupplierPaper:!!(typeof PAPER!=='undefined'&&PAPER.onSupplierPaper),
  hasSupplierDraft:!!(inbound||(cur&&cur.side==='supplier')),
  supplierTurn:!!(inbound||supplierSide),
  nearExecution:/ready|final|executed/.test(proc.k)
 };
}
window.THEO_WORKFLOW_CONFIG={
 host:'#theoWorkflowRail',
 getContext:theoWorkflowCtx,
 toast:function(m){ if(typeof toast==='function') toast(m); },
 // fired by theo-connectors once THEO_WORKFLOW is defined -> render the suggestions inline in the chat
 onReady:function(){ theoRefresh(); },
 // reflect-only wiring: each confirm returns a short toast; the underlying action
 // is a draft / a chat summary / a note. Nothing sends, sets, or registers.
 onAct:function(id,choice){
  try{
   if(id==='order-form'){ if(typeof runSkill==='function') runSkill('order-form'); return 'Drafting the Order Form on Lilly paper · added to your tasks. Review before anything is sent.'; }
   if(id==='turn-summary'){ if(typeof summarizeTurn==='function') summarizeTurn(); return 'Posted the summary of the supplier turn to the chat · added to your tasks.'; }
   if(id==='register-obligations') return 'Confirmed · obligations will register at execution. Nothing is registered now · added to your tasks.';
  }catch(e){}
  return '';
 }
};
try{ if(window.THEO_WORKFLOW&&window.THEO_WORKFLOW.mount){ window.THEO_WORKFLOW.mount(); if(typeof renderPinned==='function') renderPinned(); } }catch(e){}