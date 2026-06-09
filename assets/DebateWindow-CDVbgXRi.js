import{W as _e,X as $e,Y as ye,M as ke,l as Se,f as S,h as P,_ as j,j as c,c as d,b as t,F as D,r as T,s as M,t as b,p as r,x as Z,y as ee,k as q,n as B,q as R,d as G,E as Ae,D as we,B as W,A as xe}from"./index-CnTiHtdX.js";import{M as se}from"./MarkdownRenderer-BQ9fdI-U.js";import{C as Ie}from"./ConfirmDialog-Bor-s1gQ.js";import"./docx-parser-Dy7ynTs_.js";import"./markdown-29QtDZyf.js";const F=[{id:"pro",name:"正方",icon:"👍",color:"#3B82F6",role:"正方",systemPrompt:"你是辩论正方。你的任务是坚定支持辩题观点，用逻辑严密、证据充分的论证说服观众。你擅长：引用数据、逻辑推理、列举好处、反驳反方观点。风格：理性、自信、有说服力。每次发言控制在200字以内，使用中文。"},{id:"con",name:"反方",icon:"👎",color:"#EF4444",role:"反方",systemPrompt:"你是辩论反方。你的任务是质疑和反驳正方观点，指出逻辑漏洞和潜在风险。你擅长：发现逻辑矛盾、提出反例、分析风险、质疑假设。风格：尖锐、批判、善于发现漏洞。每次发言控制在200字以内，使用中文。"},{id:"tech-expert",name:"技术专家",icon:"💻",color:"#8B5CF6",role:"专家",systemPrompt:"你是一位资深技术专家，拥有20年行业经验。你从技术可行性、架构方案、工程成本角度分析问题。你喜欢引用具体技术案例和数据。风格：务实、深入浅出、技术导向。每次发言控制在200字以内，使用中文。"},{id:"business-analyst",name:"商业分析师",icon:"📊",color:"#F59E0B",role:"专家",systemPrompt:"你是一位顶级商业分析师。你从市场前景、商业模式、ROI、竞争格局角度分析问题。你擅长用数据说话，引用行业报告和市场趋势。风格：商业敏锐、数据驱动、注重落地。每次发言控制在200字以内，使用中文。"},{id:"ux-designer",name:"用户体验师",icon:"🎨",color:"#EC4899",role:"专家",systemPrompt:"你是一位资深的用户体验设计师。你从用户需求、交互体验、可用性角度分析问题。你关注用户真实场景，善于发现体验痛点。风格：同理心强、用户视角、注重细节。每次发言控制在200字以内，使用中文。"},{id:"product-manager",name:"产品经理",icon:"🎯",color:"#10B981",role:"专家",systemPrompt:"你是一位资深产品经理。你从用户价值、商业价值、产品策略、资源优先级角度分析问题。你擅长权衡取舍，找到最优解。风格：全局视角、务实平衡、善于拆解。每次发言控制在200字以内，使用中文。"},{id:"professor",name:"教授",icon:"🎓",color:"#6366F1",role:"专家",systemPrompt:"你是一位大学教授，学术造诣深厚。你从学术理论、研究方法、学科前沿角度分析问题。你引用经典理论和最新论文，注重严谨性。风格：严谨、深入、富有启发性。每次发言控制在200字以内，使用中文。"},{id:"researcher",name:"研究员",icon:"🔬",color:"#14B8A6",role:"专家",systemPrompt:"你是一位资深研究员，在一线从事科研工作。你从实验设计、数据验证、实证研究角度分析问题。你喜欢提出可验证的假设和具体研究方案。风格：实证导向、严谨务实、细节丰富。每次发言控制在200字以内，使用中文。"},{id:"student",name:"学生代表",icon:"✋",color:"#F97316",role:"专家",systemPrompt:"你是一位善于思考的大学生。你从年轻人视角、学习体验、实际感受角度分析问题。你勇于提出不同看法，代表学生的真实声音。风格：真诚、接地气、敢于质疑。每次发言控制在200字以内，使用中文。"},{id:"host",name:"主持人",icon:"🎤",color:"#9CA3AF",role:"主持",systemPrompt:"你是辩论主持人。你的任务是：1) 在辩论开始时用简洁的语言介绍辩题和规则；2) 控制辩论节奏；3) 在辩论结束时做客观公正的总结，概括各方核心观点，给出综合评价。风格：公正、简洁、有分寸感。每次发言控制在150字以内，使用中文。"}],oe=[{id:"pro-con",name:"正反辩论",desc:"正方与反方的经典辩论，3轮交锋",icon:"⚔️",agentIds:["pro","con"],rounds:3,roundLabels:["开篇立论","自由辩论","总结陈词"]},{id:"expert-roundtable",name:"专家圆桌",desc:"四位不同领域专家多角度讨论",icon:"🪑",agentIds:["tech-expert","business-analyst","ux-designer","product-manager"],rounds:2,roundLabels:["观点阐述","深入讨论"]},{id:"academic",name:"学术研讨",desc:"教授、研究员与学生三方探讨",icon:"📚",agentIds:["professor","researcher","student"],rounds:2,roundLabels:["学术观点","自由探讨"]}];async function Ce(h,e,n={}){const $=[{role:"system",content:h.systemPrompt},...e],i={model:$e.model,messages:$,temperature:n.temperature??.7,max_tokens:n.maxTokens??400,stream:!0},v=await _e("/chat/completions",i,{signal:n.signal});return{response:v,[Symbol.asyncIterator]:()=>ye(v,{onToken:n.onToken})}}async function te(h,e,n={}){let $="";try{const i=await Ce(h,e,{temperature:n.temperature,maxTokens:n.maxTokens,signal:n.signal,onToken:v=>{$+=v,n.onToken&&n.onToken(v)}});for await(const v of i);}catch(i){if(i.name==="AbortError")throw i;if(console.warn(`Agent ${h.name} API failed, using mock:`,i.message),$=Re(h,e),n.onToken)for(const v of $)await new Promise(y=>setTimeout(y,30+Math.random()*40)),n.onToken(v)}return{agentId:h.id,agentName:h.name,agentIcon:h.icon,agentColor:h.color,role:h.role,content:$}}function Re(h,e){var i;const n=e.length>0&&((i=e.find(v=>v.role==="user"))==null?void 0:i.content)||"这个话题";return{pro:`针对"${n.slice(0,30)}"这个话题，我认为确实值得支持。

首先，从实际效果来看，这个方向能带来显著的积极影响。我们看过很多成功案例都证明了这一点。

其次，从可行性角度，现有技术和资源完全能够支撑。关键在于执行力和持续投入。

综上所述，我坚定支持这一观点，希望能给大家新的启发。`,con:`关于"${n.slice(0,30)}"，我有不同的看法。

正方提到了一些好处，但我们需要冷静分析其中的风险和问题。

首先，理想和现实之间往往有差距。很多看起来美好的方案在执行中会遇到意想不到的困难。

其次，我们需要考虑代价和替代方案，而不是盲目支持。

因此，我建议谨慎对待，至少要先解决几个关键问题。`,"tech-expert":`从技术角度来看"${n.slice(0,30)}"，有几点值得关注：

**技术可行性**：目前的技术栈可以支撑，但有几个关键技术难点需要攻克。

**架构建议**：我推荐采用渐进式方案，先做MVP验证核心假设。

**成本评估**：技术投入大概需要团队3-6个月的努力，建议分阶段推进。`,"business-analyst":`从商业角度分析"${n.slice(0,30)}"：

**市场规模**：这个方向的市场空间是真实存在的，预计年增长在15-20%。

**竞争格局**：目前头部玩家不多，存在窗口期。

**商业模式**：核心变现路径清晰，单位经济效益可算。建议尽快验证PMF。`,"ux-designer":`从用户体验视角看"${n.slice(0,30)}"：

**用户需求**：目标用户确实有这方面的痛点，且目前没有很好的解决方案。

**体验关键**：核心体验路径需要打磨，尤其要注意首次使用的引导和上手成本。

**建议**：做几轮用户访谈，验证几个关键假设后再定型。`,"product-manager":`作为产品经理，对"${n.slice(0,30)}"的思考：

**用户价值**：需求真实存在，但要区分"锦上添花"和"雪中送炭"。

**优先级**：如果有P0问题没解决，建议先解决核心痛点。

**MVP建议**：第一版聚焦最核心的一个场景，做深做透。`,professor:`从学术角度审视"${n.slice(0,30)}"：

**理论基础**：这方面的研究可以追溯到几个经典理论框架，理论支撑是充分的。

**研究前沿**：近两年的顶会论文在这个方向有不少突破，值得关注。

**建议**：先做文献综述，避免重复发明轮子。`,researcher:`从实证研究角度看"${n.slice(0,30)}"：

**研究设计**：建议设计对照实验来验证核心假设。

**关键指标**：需要明确定义成功的量化标准。

**潜在偏差**：注意几个常见的认知偏差可能影响判断。

**下一步**：先做探索性研究，确认方向后再做验证性研究。`,student:`作为学生，对"${n.slice(0,30)}"我有些真实想法：

说实话，这个问题对我们学生来说真的很实际。我之前也思考过类似的问题。

我觉得老师们说得很对，但有时候理论和实际体验还是有差距的。

我的看法是，这个方向确实不错，但希望能更多考虑我们学生的真实需求和困难。`,host:`好的，感谢各位精彩的讨论！

**辩论总结**：

围绕"${n.slice(0,30)}"，各位从不同角度给出了深入的分析。

正方强调了其积极意义和可行性，反方提醒我们注意潜在的风险和挑战。各位专家也从技术、商业、用户体验等维度给出了专业的见解。

**综合评价**：这个话题确实值得深入探讨，建议在实际推进中平衡各方观点，既看到机遇也正视挑战。

感谢所有参与者！`}[h.id]||`关于"${n.slice(0,30)}"，作为${h.name}，我认为这是一个值得深入探讨的话题。

大家从不同角度给出了很好的见解，给我很多启发。

综合来看，我们需要在多方面做出平衡和权衡，才能找到最优解。`}function De(){return"debate-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6)}function ne(){return"dmsg-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,6)}const ae=ke("debate",()=>{const h=Se(),e=S(re()),n=S(ue()),$=S(""),i=S([]),v=S(3),y=S(["开篇立论","自由辩论","总结陈词"]),I=S(0),g=S(0),o=S([]),p=S(!1),k=S(!1),_=S(""),w=S(null),u=S(""),f=S("setup");let l=null;if(n.value){const s=e.value.find(a=>a.id===n.value);s?H(s):(n.value=null,E())}const m=P(()=>e.value.find(s=>s.id===n.value)),L=P(()=>{const s={};for(const a of o.value)s[a.round]||(s[a.round]=[]),s[a.round].push(a);return s}),le=P(()=>g.value<i.value.length?i.value[g.value]:null);function N(s){const a=h.getUserPrefix();return`debate-${s}-${a}`}function re(){try{return JSON.parse(localStorage.getItem(N("sessions")))||[]}catch{return[]}}function O(){localStorage.setItem(N("sessions"),JSON.stringify(e.value))}function ue(){try{return localStorage.getItem(N("active-session"))||null}catch{return null}}function E(){n.value?localStorage.setItem(N("active-session"),n.value):localStorage.removeItem(N("active-session"))}function ie(s){try{return JSON.parse(localStorage.getItem(`debate-msgs-${s}`))||[]}catch{return[]}}function U(s){localStorage.setItem(`debate-msgs-${s}`,JSON.stringify(o.value))}function H(s){$.value=s.topic||"",i.value=s.agents||[],v.value=s.totalRounds||3,y.value=s.roundLabels||[],I.value=s.currentRound||0,o.value=ie(s.id)||[],k.value=s.isCompleted||!1,f.value=k.value?"completed":o.value.length>0?"running":"setup"}function K(s){$.value=s.topic,i.value=s.agents,v.value=s.rounds,y.value=s.roundLabels,I.value=0,g.value=0,o.value=[],p.value=!1,k.value=!1,_.value="",w.value=null,u.value="",f.value="setup"}function ce(s){const a=oe.find(A=>A.id===s);if(!a)return;const x=a.agentIds.map(A=>F.find(C=>C.id===A)).filter(Boolean);K({topic:"",agents:x,rounds:a.rounds,roundLabels:a.roundLabels})}function de(){const s=F.find(a=>a.id==="host");s&&!i.value.find(a=>a.id==="host")&&(i.value=[...i.value,s])}function X(){const s={id:De(),topic:$.value,agents:i.value,totalRounds:v.value,roundLabels:y.value,currentRound:I.value,isCompleted:k.value,createdAt:Date.now(),updatedAt:Date.now()};return e.value.unshift(s),O(),n.value=s.id,E(),U(s.id),s}async function ve(){if(!$.value.trim()||i.value.length<2||p.value)return;n.value||X(),f.value="running",p.value=!0,k.value=!1,o.value=[];const s=new AbortController;l=s;try{for(let x=0;x<v.value;x++){I.value=x+1,g.value=-1;for(let A=0;A<i.value.length;A++){if(l!=null&&l.signal.aborted)return;g.value=A;const C=i.value[A];w.value=C.id,_.value="";const z=me(C,x);let V="";try{V=(await te(C,z,{signal:l.signal,onToken:be=>{V+=be,_.value=V}})).content,o.value.push({id:ne(),agentId:C.id,agentName:C.name,agentIcon:C.icon,agentColor:C.color,role:C.role,content:V,round:x+1,timestamp:Date.now()})}catch(J){if(J.name==="AbortError")return;u.value=J.message||"辩论出错"}}n.value&&(U(n.value),Q())}const a=i.value.find(x=>x.id==="host");if(a&&!(l!=null&&l.signal.aborted)){g.value=i.value.indexOf(a),w.value=a.id,_.value="";const x=ge();let A="";try{A=(await te(a,x,{signal:l.signal,onToken:z=>{A+=z,_.value=A}})).content}catch(C){if(C.name==="AbortError")return}o.value.push({id:ne(),agentId:a.id,agentName:a.name,agentIcon:a.icon,agentColor:a.color,role:"主持",content:A,round:v.value+1,timestamp:Date.now()}),n.value&&U(n.value)}k.value=!0,f.value="completed"}catch(a){a.name!=="AbortError"&&(u.value=a.message||"辩论出错")}finally{p.value=!1,w.value=null,_.value="",l===s&&(l=null),g.value=-1,n.value&&(Q(),m.value&&(m.value.updatedAt=Date.now(),O()),U(n.value))}}function me(s,a){const x=[];x.push({role:"user",content:`【辩论主题】${$.value}

【当前轮次】第${a+1}轮：${y.value[a]}

【你的角色】${s.name} - ${s.role}

请根据你的角色定位，就此辩题发表你的观点。注意回顾之前各方的发言，进行有针对性的回应。`});for(const A of o.value){const C=A.agentId===s.id?"assistant":"user";x.push({role:C,content:`[${A.agentName}(${A.role}) - 第${A.round}轮]: ${A.content}`})}return x}function ge(){const s=o.value.map(a=>`[${a.agentName}(${a.role}) - 第${a.round}轮]: ${a.content}`).join(`

`);return[{role:"user",content:`【辩论主题】${$.value}

以下是全部辩论记录：

${s}

请作为主持人对本次辩论进行总结：概括各方核心观点，进行客观评价，给出综合结论。控制在200字以内。`}]}function pe(){l&&(l.abort(),l=null),p.value=!1,w.value=null,_.value="",f.value=o.value.length>0?"completed":"setup"}function fe(s){if(e.value=e.value.filter(a=>a.id!==s),localStorage.removeItem(`debate-msgs-${s}`),n.value===s){const a=e.value[0];a?(n.value=a.id,E(),H(a)):Y()}O()}function he(s){n.value=s,E();const a=e.value.find(x=>x.id===s);a&&H(a)}function Y(){n.value=null,$.value="",i.value=[],v.value=3,y.value=[],I.value=0,g.value=0,o.value=[],p.value=!1,k.value=!1,_.value="",w.value=null,u.value="",f.value="setup",E()}function Q(){m.value&&(m.value.currentRound=I.value,m.value.isCompleted=k.value,m.value.updatedAt=Date.now(),O())}return{sessions:e,activeSessionId:n,activeSession:m,topic:$,agents:i,totalRounds:v,roundLabels:y,currentRound:I,currentAgentIdx:g,messages:o,isRunning:p,isCompleted:k,streamingContent:_,streamingAgentId:w,error:u,phase:f,roundMessages:L,currentAgent:le,setupDebate:K,applyPreset:ce,addHostAgent:de,createSession:X,startDebate:ve,stopDebate:pe,deleteSession:fe,switchSession:he,resetAll:Y}}),Te={class:"debate-setup"},Pe={class:"setup-card"},Me={class:"setup-section"},Le={class:"preset-grid"},Ne=["onClick"],Ee={class:"preset-icon"},Be={class:"preset-info"},Fe={class:"setup-section"},Oe={class:"setup-section"},Ue={class:"agent-grid"},Ve=["onClick"],je={class:"agent-chip-icon"},He={class:"agent-chip-name"},ze={class:"agent-chip-role"},Je={class:"setup-section"},qe={class:"setup-label"},We={class:"round-labels-preview"},Ge=["disabled"],Ke={key:0,class:"start-hint"},Xe={__name:"DebateSetup",props:{topic:{type:String,default:""},agents:{type:Array,default:()=>[]},rounds:{type:Number,default:3},roundLabels:{type:Array,default:()=>[]}},emits:["start"],setup(h,{emit:e}){const n=h,$=oe,i=S(n.topic),v=S(new Set(n.agents.map(f=>f.id))),y=S(n.rounds||3),I=S(""),g=F.filter(f=>f.id!=="host"),o=P(()=>F.filter(f=>v.value.has(f.id))),p=P(()=>i.value.trim().length>0&&v.value.size>=2),k=["开篇立论","自由辩论","深入交锋","补充观点","总结陈词"],_=P(()=>y.value===3?["开篇立论","自由辩论","总结陈词"]:y.value===2?["观点阐述","深入讨论"]:k.slice(0,y.value));function w(f){I.value=f.id,v.value=new Set(f.agentIds),y.value=f.rounds}function u(f){const l=new Set(v.value);l.has(f.id)?l.size>2&&l.delete(f.id):l.add(f.id),v.value=l,I.value&&(I.value="")}return(f,l)=>(c(),d("div",Te,[t("div",Pe,[l[8]||(l[8]=t("h2",{class:"setup-title"},"配置辩论",-1)),t("div",Me,[l[3]||(l[3]=t("label",{class:"setup-label"},"快速预设",-1)),t("div",Le,[(c(!0),d(D,null,T(r($),m=>(c(),d("button",{key:m.id,class:M(["preset-card",{active:I.value===m.id}]),onClick:L=>w(m)},[t("span",Ee,b(m.icon),1),t("div",Be,[t("strong",null,b(m.name),1),t("span",null,b(m.desc),1)])],10,Ne))),128))])]),t("div",Fe,[l[4]||(l[4]=t("label",{class:"setup-label"},"辩论主题",-1)),Z(t("textarea",{"onUpdate:modelValue":l[0]||(l[0]=m=>i.value=m),class:"topic-input",placeholder:"输入你想要辩论的主题，例如：人工智能是否会取代人类工作？",rows:"3"},null,512),[[ee,i.value]])]),t("div",Oe,[l[5]||(l[5]=t("label",{class:"setup-label"},[q(" 参与角色 "),t("span",{class:"label-hint"},"（至少选择 2 个）")],-1)),t("div",Ue,[(c(!0),d(D,null,T(r(g),m=>(c(),d("button",{key:m.id,class:M(["agent-chip",{selected:v.value.has(m.id)}]),style:B(v.value.has(m.id)?{"--chip-color":m.color}:{}),onClick:L=>u(m)},[t("span",je,b(m.icon),1),t("span",He,b(m.name),1),t("span",ze,b(m.role),1)],14,Ve))),128))])]),t("div",Je,[t("label",qe,[l[6]||(l[6]=q("辩论轮次：",-1)),t("strong",null,b(y.value),1),l[7]||(l[7]=q(" 轮",-1))]),Z(t("input",{type:"range","onUpdate:modelValue":l[1]||(l[1]=m=>y.value=m),min:"2",max:"5",class:"rounds-slider"},null,512),[[ee,y.value,void 0,{number:!0}]]),t("div",We,[(c(!0),d(D,null,T(_.value,(m,L)=>(c(),d("span",{key:L,class:"round-label-chip"}," R"+b(L+1)+": "+b(m),1))),128))])]),t("button",{class:"start-btn",disabled:!p.value,onClick:l[2]||(l[2]=m=>f.$emit("start",{topic:i.value,agents:o.value,rounds:y.value,roundLabels:_.value}))}," 开始辩论 ⚡ ",8,Ge),p.value?R("",!0):(c(),d("p",Ke,"请填写主题并选择至少 2 个角色"))])]))}},Ye=j(Xe,[["__scopeId","data-v-e2a2dc50"]]),Qe={class:"msg-round-badge"},Ze={class:"msg-header"},et={class:"msg-avatar"},tt={class:"msg-agent-name"},nt={class:"msg-body"},st={__name:"DebateMessage",props:{message:{type:Object,required:!0}},setup(h){return(e,n)=>(c(),d("div",{class:"debate-msg",style:B({"--agent-color":h.message.agentColor})},[t("div",Qe,"R"+b(h.message.round),1),t("div",Ze,[t("span",et,b(h.message.agentIcon),1),t("span",tt,b(h.message.agentName),1),t("span",{class:M(["msg-role-tag",h.message.role])},b(h.message.role),3)]),t("div",nt,[G(se,{content:h.message.content},null,8,["content"])])],4))}},ot=j(st,[["__scopeId","data-v-5b123c68"]]),at={class:"debate-arena"},lt={class:"agent-bar"},rt={class:"agent-dot"},ut={class:"agent-emoji"},it={key:0,class:"pulse-ring"},ct={class:"agent-status-name"},dt={class:"agent-status-state"},vt={class:"round-progress"},mt={class:"round-track"},gt={class:"round-num"},pt={class:"round-labels"},ft={key:0,class:"round-separator"},ht={class:"msg-header"},bt={class:"msg-avatar"},_t={class:"msg-agent-name"},$t={class:"msg-body"},yt={__name:"DebateArena",setup(h){const e=ae(),n=S(null),$=P(()=>e.agents.find(o=>o.id===e.streamingAgentId)),i=P(()=>new Set(e.messages.map(o=>o.agentId)));function v(o){return o===0?!0:e.messages[o].round!==e.messages[o-1].round}function y(o){return i.value.has(o)}Ae(()=>[e.messages.length,e.streamingContent],()=>we(g));function I(){if(!n.value)return!0;const o=n.value;return o.scrollHeight-o.scrollTop-o.clientHeight<120}function g(){n.value&&I()&&requestAnimationFrame(()=>{n.value&&(n.value.scrollTop=n.value.scrollHeight)})}return(o,p)=>{var k,_,w;return c(),d("div",at,[t("div",lt,[(c(!0),d(D,null,T(r(e).agents,u=>(c(),d("div",{key:u.id,class:M(["agent-status",{speaking:r(e).streamingAgentId===u.id,done:y(u.id),waiting:!y(u.id)&&r(e).streamingAgentId!==u.id}]),style:B({"--agent-color":u.color})},[t("div",rt,[t("span",ut,b(u.icon),1),r(e).streamingAgentId===u.id?(c(),d("div",it)):R("",!0)]),t("span",ct,b(u.name),1),t("span",dt,b(r(e).streamingAgentId===u.id?"发言中...":y(u.id)?"已发言":"等待中"),1)],6))),128))]),t("div",vt,[t("div",mt,[(c(!0),d(D,null,T(r(e).totalRounds,u=>(c(),d("div",{key:u,class:M(["round-dot",{completed:u<r(e).currentRound,active:u===r(e).currentRound,pending:u>r(e).currentRound}])},[t("span",gt,b(u),1)],2))),128)),t("div",{class:"round-progress-fill",style:B({width:(r(e).currentRound-1)/Math.max(r(e).totalRounds-1,1)*100+"%"})},null,4)]),t("div",pt,[(c(!0),d(D,null,T(r(e).roundLabels,(u,f)=>(c(),d("span",{key:f,class:M(["round-label-text",{active:f+1<=r(e).currentRound}])},b(u),3))),128))])]),t("div",{class:"arena-messages",ref_key:"msgContainer",ref:n},[(c(!0),d(D,null,T(r(e).messages,(u,f)=>(c(),d(D,{key:u.id},[v(f)?(c(),d("div",ft,[t("span",null,"第 "+b(u.round)+" 轮",1)])):R("",!0),G(ot,{message:u},null,8,["message"])],64))),128)),r(e).streamingContent&&r(e).streamingAgentId?(c(),d("div",{key:0,class:"debate-msg streaming",style:B({"--agent-color":(k=$.value)==null?void 0:k.color})},[t("div",ht,[t("span",bt,b((_=$.value)==null?void 0:_.icon),1),t("span",_t,b((w=$.value)==null?void 0:w.name),1),p[0]||(p[0]=t("span",{class:"msg-role-tag"},"发言中",-1))]),t("div",$t,[G(se,{content:r(e).streamingContent},null,8,["content"]),p[1]||(p[1]=t("span",{class:"cursor-blink"},"|",-1))])],4)):R("",!0)],512)])}}},kt=j(yt,[["__scopeId","data-v-fb18293a"]]),St={class:"debate-page"},At={class:"debate-sidebar"},wt={key:0,class:"session-list"},xt=["onClick"],It={class:"session-main"},Ct={class:"session-topic"},Rt={class:"session-meta"},Dt=["onClick"],Tt={key:1,class:"sidebar-empty"},Pt={class:"debate-main"},Mt={key:0,class:"debate-header"},Lt={class:"debate-topic-title"},Nt={class:"debate-header-meta"},Et={key:0,class:"badge-completed"},Bt={key:1,class:"badge-running"},Ft={key:3,class:"completed-actions"},Ot={__name:"DebateWindow",setup(h){const e=ae(),n=S(null);function $(g){e.setupDebate(g),F.find(o=>o.id==="host"),g.agents.find(o=>o.id==="host")||e.addHostAgent(),e.startDebate()}function i(){e.resetAll()}function v(g){n.value=g}function y(){n.value&&e.deleteSession(n.value.id),n.value=null}function I(){let g=`# 多智能体辩论记录

`;g+=`**辩题**: ${e.topic}

`,g+=`**参与者**: ${e.agents.map(_=>`${_.icon} ${_.name}`).join(" | ")}

`,g+=`**轮次**: ${e.totalRounds}

`,g+=`---

`;for(let _=1;_<=Math.max(...e.messages.map(w=>w.round));_++){const w=e.messages.filter(u=>u.round===_);if(w.length){g+=`## 第 ${_} 轮

`;for(const u of w)g+=`### ${u.agentIcon} ${u.agentName}（${u.role}）

${u.content}

`}}g+=`---
*生成时间: ${new Date().toLocaleString()}*`;const o=new Blob([g],{type:"text/markdown"}),p=URL.createObjectURL(o),k=document.createElement("a");k.href=p,k.download=`debate-${e.topic.slice(0,20)||"record"}-${Date.now()}.md`,k.click(),URL.revokeObjectURL(p)}return(g,o)=>(c(),d("div",St,[t("aside",At,[t("div",{class:"sidebar-header"},[o[3]||(o[3]=t("h3",null,"辩论记录",-1)),t("button",{class:"new-debate-btn",onClick:i,title:"新建辩论"},[...o[2]||(o[2]=[t("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round"},[t("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),t("line",{x1:"5",y1:"12",x2:"19",y2:"12"})],-1)])])]),r(e).sessions.length?(c(),d("div",wt,[(c(!0),d(D,null,T(r(e).sessions,p=>{var k;return c(),d("button",{key:p.id,class:M(["session-item",{active:p.id===r(e).activeSessionId}]),onClick:_=>r(e).switchSession(p.id)},[t("div",It,[t("span",Ct,b(p.topic||"未命名辩论"),1),t("span",Rt,b(((k=p.agents)==null?void 0:k.length)||0)+"人 · "+b(p.totalRounds)+"轮",1)]),t("button",{class:"session-delete",onClick:xe(_=>v(p),["stop"]),title:"删除"},[...o[4]||(o[4]=[t("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2"},[t("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),t("line",{x1:"6",y1:"6",x2:"18",y2:"18"})],-1)])],8,Dt)],10,xt)}),128))])):(c(),d("div",Tt,"暂无辩论记录"))]),t("main",Pt,[r(e).topic?(c(),d("header",Mt,[t("h2",Lt,b(r(e).topic),1),t("div",Nt,[t("span",null,b(r(e).agents.length)+" 位参与者",1),o[5]||(o[5]=t("span",null,"·",-1)),t("span",null,b(r(e).totalRounds)+" 轮",1),r(e).isCompleted?(c(),d("span",Et,"已完成")):r(e).isRunning?(c(),d("span",Bt,"进行中")):R("",!0)]),r(e).isRunning?(c(),d("button",{key:0,class:"stop-btn",onClick:o[0]||(o[0]=p=>r(e).stopDebate())}," 停止辩论 ")):R("",!0)])):R("",!0),r(e).phase==="setup"?(c(),W(Ye,{key:1,topic:r(e).topic,agents:r(e).agents,rounds:r(e).totalRounds,"round-labels":r(e).roundLabels,onStart:$},null,8,["topic","agents","rounds","round-labels"])):R("",!0),r(e).phase==="running"||r(e).phase==="completed"?(c(),W(kt,{key:2})):R("",!0),r(e).phase==="completed"?(c(),d("div",Ft,[t("button",{class:"action-btn primary",onClick:i},"开始新辩论"),t("button",{class:"action-btn secondary",onClick:I},"导出 Markdown")])):R("",!0)]),n.value?(c(),W(Ie,{key:0,title:"删除辩论",message:`确定删除辩论「${n.value.topic||"未命名"}」？此操作不可恢复。`,onConfirm:y,onCancel:o[1]||(o[1]=p=>n.value=null)},null,8,["message"])):R("",!0)]))}},Jt=j(Ot,[["__scopeId","data-v-75273942"]]);export{Jt as default};
