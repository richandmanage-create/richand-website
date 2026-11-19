const visualLabels: Record<string, string> = {
 'before-your-first-viewing': '生活需求・看屋清單',
 'renewal-priorities': '空間機能・改造順序',
 'consultation-checklist': '整理想法・開始對話',
};

export default function ArticleVisual({slug,number}:{slug:string;number:number}) {
 return <div className={'journal-visual journal-visual-'+number} aria-hidden="true">
  <svg viewBox="0 0 360 230" fill="none" className="journal-illustration">
   <circle cx="184" cy="115" r="83" fill="#e6ddca"/>
   <path d="M39 191H322M59 202H299" stroke="#cfc4b0" strokeWidth="1"/>
   {slug==='before-your-first-viewing' ? <>
    <path d="M69 109L145 48L221 109" stroke="#a96532" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M83 106V182H204V106" fill="#fffdf6" stroke="#233d48" strokeWidth="3"/>
    <path d="M134 182V136H159V182M102 116H119V137H102Z" stroke="#233d48" strokeWidth="3"/>
    <rect x="190" y="80" width="91" height="116" rx="7" fill="#fffdf6" stroke="#233d48" strokeWidth="3"/>
    <rect x="213" y="73" width="45" height="15" rx="4" fill="#a96532"/>
    <path d="M207 111L213 117L223 105M207 140L213 146L223 134M207 169L213 175L223 163" stroke="#a96532" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M233 112H264M233 141H264M233 170H256" stroke="#829087" strokeWidth="3" strokeLinecap="round"/>
    <path d="M59 179V151M59 162C43 162 41 148 41 148C56 148 59 162 59 162ZM59 155C72 151 73 137 73 137C59 141 59 155 59 155Z" stroke="#778574" strokeWidth="2" fill="#c3c9b6"/>
    <path d="M48 178H71L68 192H51Z" fill="#a96532"/>
   </> : slug==='renewal-priorities' ? <>
    <path d="M69 57H228V185H69Z" fill="#fffdf6" stroke="#233d48" strokeWidth="3"/>
    <path d="M69 128H130V185M130 57V98H228M130 128H155M185 128H228" stroke="#233d48" strokeWidth="3"/>
    <path d="M155 128V100C172 100 185 111 185 128" stroke="#a96532" strokeWidth="2"/>
    <rect x="84" y="72" width="31" height="43" rx="3" fill="#d3d6c2"/>
    <path d="M84 83H115" stroke="#819079" strokeWidth="2"/>
    <rect x="147" y="65" width="54" height="20" rx="3" fill="#ddc8ac"/>
    <circle cx="174" cy="151" r="13" fill="#d3d6c2"/>
    <path d="M48 59V184M43 59H53M43 184H53" stroke="#a96532" strokeWidth="2"/>
    <g transform="rotate(18 255 138)"><rect x="234" y="70" width="29" height="128" rx="3" fill="#a96532"/><path d="M234 84H247M234 98H242M234 112H247M234 126H242M234 140H247M234 154H242M234 168H247M234 182H242" stroke="#fff5e6" strokeWidth="2"/></g>
    <path d="M277 181L300 92L309 95L286 184L278 193Z" fill="#233d48"/>
    <circle cx="91" cy="157" r="10" stroke="#a96532" strokeWidth="2"/>
   </> : <>
    <path d="M90 57H181C191 57 197 64 197 74V104C197 114 191 120 181 120H139L118 137V120H90C80 120 74 114 74 104V74C74 64 80 57 90 57Z" fill="#fffdf6" stroke="#233d48" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M99 80H170M99 95H148" stroke="#a96532" strokeWidth="3" strokeLinecap="round"/>
    <path d="M216 77H271C281 77 287 84 287 94V115C287 124 281 130 271 130H260L273 144L247 130H216C206 130 200 124 200 115V94C200 84 206 77 216 77Z" fill="#c5cdb9" stroke="#75836f" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="224" cy="102" r="3" fill="#233d48"/><circle cx="242" cy="102" r="3" fill="#233d48"/><circle cx="260" cy="102" r="3" fill="#233d48"/>
    <circle cx="107" cy="155" r="15" fill="#ead5bc" stroke="#a96532" strokeWidth="2"/>
    <path d="M77 195V186C77 172 90 169 107 169C124 169 137 172 137 186V195" fill="#233d48"/>
    <circle cx="250" cy="165" r="15" fill="#ead5bc" stroke="#a96532" strokeWidth="2"/>
    <path d="M220 204V196C220 182 233 179 250 179C267 179 280 182 280 196V204" fill="#a96532"/>
    <path d="M143 174H213M152 181H203M167 188H190" stroke="#b8ad99" strokeWidth="2" strokeLinecap="round"/>
   </>}
  </svg>
  <span className="journal-visual-label">{visualLabels[slug]}</span>
 </div>;
}
