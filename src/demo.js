// Demo cases shown until you add your own photos
const sign=`<rect x="18" y="58" width="68" height="40" fill="#f2f2ec" stroke="#555" /><text x="24" y="74" font-size="9" fill="#222">FLOOD WALL</text><text x="24" y="89" font-size="9" fill="#1a7a3a">100% DONE</text><rect x="48" y="98" width="4" height="44" fill="#555" />`;
const wall=v=>`<svg viewBox="0 0 300 225"><rect width="300" height="225" fill="#8fb4d0" /><rect y="125" width="300" height="100" fill="#6f7f4d" /><rect y="178" width="300" height="47" fill="#3f6f8c" />`+sign+[
`<rect x="96" y="112" width="200" height="42" fill="#bdbdb5" /><path d="M140 112v42M190 112v42M240 112v42" stroke="#999" />`,
`<path d="M100 154l4-14 4 14M200 154l4-12 4 12M250 154l4-13 4 13" stroke="#4a5a2a" fill="none" />`,
`<path d="M96 112h120l10 8h70v34H96z" fill="#b2b2a8" /><path d="M170 112l-9 15 11 9-7 18" stroke="#333" stroke-width="2" fill="none" /><path d="M236 120v-18M248 124v-22M260 122v-16" stroke="#b5532a" stroke-width="3" />`][v]+`</svg>`;
const rec=v=>`<svg viewBox="0 0 300 225"><rect width="300" height="225" fill="#6b5a45" />`+[0,1].map(k=>`<rect x="${24+k*140}" y="24" width="112" height="176" fill="#f4f1e6" /><text x="${34+k*140}" y="48" font-size="11" fill="#222">OFFICIAL RECEIPT</text><text x="${34+k*140}" y="68" font-size="11" fill="#a22">No. ${v&&k?'0041':'004'+(1+k)}</text><path d="M${34+k*140} 90h92M${34+k*140} 108h92M${34+k*140} 126h60" stroke="#999" /><text x="${34+k*140}" y="168" font-size="11" fill="#222">Cement, 50 bags</text></svg>`.replace('</svg>','')).join('')+`</svg>`;
export const DEMO=[
{svg:wall(0),cap:'Brgy. Riverside flood wall',a:false,why:'The wall exists at the site shown and matches the report.'},
{svg:wall(1),cap:'Brgy. Riverside flood wall, 100% done',a:true,why:'Ghost project: the sign says complete, but no wall was ever built.'},
{svg:wall(2),cap:'Brgy. Dela Paz flood wall, 100% done',a:true,why:'Substandard work: cracks and exposed rebar on a structure reported finished.'},
{svg:rec(0),cap:'Official receipts, cement supply',a:false,why:'Serial numbers run in order and the items are consistent.'},
{svg:rec(1),cap:'Official receipts, cement supply',a:true,why:'Duplicate serial number: the same receipt was used twice to bill public funds.'}];
