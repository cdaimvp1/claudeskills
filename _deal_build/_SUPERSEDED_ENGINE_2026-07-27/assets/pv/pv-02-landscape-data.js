var _PV02=(typeof Theo!=='undefined'&&Theo.data&&Theo.data.projectViewSeed)?Theo.data.projectViewSeed():null;
var _PVLAND=(_PV02&&typeof Theo!=='undefined'&&!Theo.isDNA(_PV02)&&Array.isArray(_PV02.landscape))?_PV02.landscape:[];
const LANDSCAPE=_PVLAND;
// ---- canned example projects ----------------------------------------------
// Each project carries its OWN meta, its OWN set of present dashboards (mats),
// and its OWN supplier landscape. The example switcher in the subhead flips
// CURPROJ between these; the tabs, subhead and Materials list all read from
// PROJECTS[CURPROJ]. This shows that different projects surface DIFFERENT
// skill-output dashboards, driven by data, not one hardcoded flag set.