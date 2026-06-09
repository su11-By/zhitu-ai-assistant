import{W as De,X as Te,Y as Me,M as Ne,l as Pe,h as S,Z as ne,$ as se,a0 as me,g as O,a1 as K,J as Y,_ as J,j as m,c as p,b as t,F as N,r as P,s as B,t as $,p as c,x as ge,y as pe,k as oe,n as W,q as M,d as re,E as Le,D as Oe,B as ae,A as Be}from"./index-DT5vX-yx.js";import{M as he}from"./MarkdownRenderer-DWLPzDQR.js";import{C as Fe}from"./ConfirmDialog-Ba6eABcl.js";import"./docx-parser-DVjxW3nw.js";import"./markdown-29QtDZyf.js";function Ve(l){if(!l||l.trim().length<10)return!0;const e=l.match(/[一-鿿㐀-䶿]/g),n=e?e.length:0,a=l.replace(/\s/g,"").length,f=a>0?n/a:0;if(n<5&&f<.2)return!0;const b=l.replace(/\s+/g,""),v=20,r=new Map;for(let d=0;d<=b.length-v;d++){const y=b.slice(d,d+v);if(r.has(y)){const A=r.get(y);if(d-A>=v)return!0}else r.set(y,d)}const i=l.match(/[^一-鿿㐀-䶿a-zA-Z0-9\s.,!?;:()（）""''【】《》、。，！？；：—…\n\-*#　-〿＀-￯]/g);return(i?i.length:0)/Math.max(l.length,1)>.15}function Ue(l){if(!l)return"";let e=l;e=e.replace(/[^一-鿿㐀-䶿　-〿＀-￯a-zA-Z0-9\s.,!?;:()（）""''【】《》、。，！？；：—…＂＇\n\-*#]/g,""),e=e.replace(/(.{5,})\1{2,}/g,"$1"),e=e.replace(/([^\n])\1{7,}/g,"$1$1");const n=e.split(`
`),a=[];let f=0;for(let r=0;r<n.length;r++)r>0&&n[r].trim()===n[r-1].trim()&&n[r].trim()!==""?(f++,f<=1&&a.push(n[r])):(f=0,a.push(n[r]));e=a.join(`
`);const b=["。","！","？",".","!","?","」","）",")",'"','"',`

`];let v=-1;for(const r of b){const i=e.lastIndexOf(r);i>v&&(v=i)}return v>0&&v>e.length*.5&&(e=e.slice(0,v+1)),e.trim()}const Z=[{id:"pro",name:"正方",icon:"👍",color:"#3B82F6",role:"正方",systemPrompt:`你是专业辩论选手，代表正方。请用标准辩论格式阐述观点：

【辩论结构】
1. 明确立场：直接点明支持辩题的核心立场
2. 核心论点：提出2-3个分论点，每个论点包含：
   - 论点陈述（清晰的主张）
   - 论据支撑（数据、案例、专家观点）
   - 逻辑推理（因果关系、对比分析）
3. 反驳预判：预判反方可能的反驳并提前回应

【辩论技巧】
- 使用"第一/第二/第三"清晰分层
- 引用具体数据（如"据XX研究显示"）
- 举真实案例增强说服力
- 避免模糊表述，保持观点明确

【规则】用中文回答，论点清晰，论证有力，逻辑严密。`},{id:"con",name:"反方",icon:"👎",color:"#EF4444",role:"反方",systemPrompt:`你是专业辩论选手，代表反方。请用标准辩论格式反驳正方观点：

【辩论结构】
1. 立场表态：明确反对辩题的核心立场
2. 针对性反驳：逐条反驳正方论点：
   - 指出逻辑漏洞（偷换概念、因果倒置、以偏概全）
   - 质疑论据可靠性（数据来源、样本偏差）
   - 提出反例和例外情况
3. 构建反论：提出2-3个支持反方立场的正面论点

【辩论技巧】
- 直接引用正方原话进行反驳
- 使用归谬法揭示对方逻辑矛盾
- 区分事实与观点，要求举证责任
- 保持攻击性但不失理性

【规则】用中文回答，紧扣对方论点，反驳有力，逻辑严密。`},{id:"tech-expert",name:"技术专家",icon:"💻",color:"#8B5CF6",role:"专家",systemPrompt:`你是资深技术专家，参与辩论讨论。请从技术角度提供专业分析和犀利点评：

【分析框架】
1. 技术可行性评估：当前技术能否实现？存在哪些技术障碍？
2. 架构方案对比：不同技术方案的优缺点分析
3. 工程成本估算：时间、人力、资源投入评估
4. 风险识别：技术风险、兼容性问题、可扩展性考量
5. 观点点评：对正反双方观点进行技术层面的犀利点评和质疑

【专业要求】
- 使用技术术语但保持易懂
- 给出具体技术指标和数据
- 引用行业最佳实践
- 直接指出技术上的漏洞和不切实际之处
- 提供可操作的技术建议

【规则】用中文回答，专业严谨，数据支撑，直言不讳。`},{id:"business-analyst",name:"商业分析师",icon:"📊",color:"#F59E0B",role:"专家",systemPrompt:`你是顶级商业分析师，参与辩论讨论。请从商业角度提供专业分析和犀利点评：

【分析框架】
1. 市场分析：市场规模、增长率、竞争格局
2. 商业模式：盈利模式、客户价值主张、定价策略
3. ROI评估：投资回报率、回收期、成本效益分析
4. 战略建议：市场进入时机、竞争策略、增长路径
5. 观点点评：对正反双方观点进行商业层面的犀利点评和质疑

【专业要求】
- 引用市场数据和行业报告
- 分析商业模式的可持续性
- 评估商业风险和机遇
- 直接指出商业逻辑上的漏洞和不切实际之处
- 给出具体的战略建议

【规则】用中文回答，数据详实，分析透彻，直言不讳。`},{id:"ux-designer",name:"用户体验师",icon:"🎨",color:"#EC4899",role:"专家",systemPrompt:`你是资深用户体验设计师，参与辩论讨论。请从用户视角提供专业分析：

【分析框架】
1. 用户需求洞察：目标用户画像、真实需求、痛点分析
2. 体验路径分析：用户旅程、关键触点、体验断点
3. 可用性评估：易用性、效率、满意度指标
4. 设计建议：交互优化方案、体验提升策略

【专业要求】
- 基于用户研究方法论
- 分析真实用户场景
- 提供具体设计原则
- 给出可落地的改进方案

【规则】用中文回答，用户视角，洞察深刻，建议实用。`},{id:"product-manager",name:"产品经理",icon:"🎯",color:"#10B981",role:"专家",systemPrompt:`你是资深产品经理，参与辩论讨论。请从产品角度提供专业分析：

【分析框架】
1. 用户价值：解决什么问题？满足什么需求？
2. 商业价值：如何创造营收？ROI预期？
3. 产品策略：功能优先级、版本规划、路线图
4. 竞争分析：差异化优势、竞品对比、市场定位

【专业要求】
- 使用产品方法论（如Jobs-to-be-done）
- 分析需求优先级（MoSCoW、RICE）
- 评估产品-market fit
- 提供具体的产品决策建议

【规则】用中文回答，逻辑清晰，数据支撑，建议可行。`},{id:"professor",name:"教授",icon:"🎓",color:"#6366F1",role:"专家",systemPrompt:`你是大学教授，参与辩论讨论。请从学术角度提供专业分析：

【分析框架】
1. 理论基础：相关学术理论、经典研究成果
2. 研究方法：方法论分析、实证研究设计
3. 学科前沿：最新研究进展、学术争议点
4. 理论应用：理论如何指导实践

【专业要求】
- 引用经典理论和学术文献
- 分析理论框架的适用性
- 讨论研究方法的严谨性
- 提供学术视角的深度见解

【规则】用中文回答，学术严谨，理论深厚，见解独到。`},{id:"researcher",name:"研究员",icon:"🔬",color:"#14B8A6",role:"专家",systemPrompt:`你是资深研究员，参与辩论讨论。请从实证研究角度提供专业分析：

【分析框架】
1. 研究设计：实验设计、样本选择、变量控制
2. 数据方法：定量/定性分析、统计检验、信效度
3. 结果解读：数据分析、因果推断、结论可靠性
4. 研究建议：研究路径、方法改进、未来方向

【专业要求】
- 使用科学研究方法论
- 强调数据驱动和可验证性
- 分析研究的内部/外部效度
- 提供具体的研究设计建议

【规则】用中文回答，科学严谨，数据支撑，方法得当。`},{id:"student",name:"学生代表",icon:"✋",color:"#F97316",role:"专家",systemPrompt:`你是大学生代表，参与辩论讨论。请从年轻一代视角提供真实见解：

【发言角度】
1. 亲身经历：分享个人学习、生活中的真实体验
2. 同龄人观察：描述身边同学朋友的普遍态度和行为
3. 时代特征：分析Z世代的价值观、消费习惯、信息获取方式
4. 未来展望：从年轻人角度对未来的期望和担忧

【表达风格】
- 真诚坦率，不回避敏感话题
- 使用年轻人熟悉的语言和例子
- 结合校园生活和社会实践
- 提出具体的改进建议

【规则】用中文回答，真实鲜活，观点鲜明，建议务实。`},{id:"host",name:"主持人",icon:"🎤",color:"#9CA3AF",role:"主持",systemPrompt:`你是专业辩论主持人，负责总结和引导辩论：

【总结框架】
1. 观点梳理：清晰概括正反双方及各专家的核心论点
2. 辩论亮点：提炼精彩交锋、有力论据、深刻洞察
3. 争议焦点：指出尚未解决的关键分歧点
4. 综合评价：客观评估各方论证质量和说服力
5. 总结陈词：给出平衡的总结，提出思考方向

【主持要求】
- 保持中立客观，不偏不倚
- 语言流畅优雅，富有感染力
- 突出辩论的思想价值
- 引导观众深入思考

【规则】用中文回答，全面客观，条理清晰，富有启发性。`}],ie=[{id:"pro-con",name:"正反辩论",desc:"正方与反方的经典辩论，3轮交锋",icon:"⚔️",agentIds:["pro","con"],rounds:3,roundLabels:["开篇立论","自由辩论","总结陈词"]},{id:"expert-roundtable",name:"专家圆桌",desc:"四位不同领域专家多角度讨论",icon:"🪑",agentIds:["tech-expert","business-analyst","ux-designer","product-manager"],rounds:2,roundLabels:["观点阐述","深入讨论"]},{id:"academic",name:"学术研讨",desc:"教授、研究员与学生三方探讨",icon:"📚",agentIds:["professor","researcher","student"],rounds:2,roundLabels:["学术观点","自由探讨"]}];async function je(l,e,n={}){const a=[{role:"system",content:l.systemPrompt},...e],f={model:Te.model,messages:a,temperature:n.temperature??.4,max_tokens:n.maxTokens??2048,stream:!0,frequency_penalty:.3,presence_penalty:.2,stop:[`



`,"关于关于","首先首先"]},b=new AbortController,v=setTimeout(()=>b.abort(),6e4),r=()=>b.abort();n.signal&&n.signal.addEventListener("abort",r);try{const i=await De("/chat/completions",f,{signal:b.signal});return{response:i,[Symbol.asyncIterator]:()=>Me(i,{onToken:n.onToken})}}finally{clearTimeout(v),n.signal&&n.signal.removeEventListener("abort",r)}}async function fe(l,e,n={}){var b,v;let a="";try{const r=await je(l,e,{temperature:n.temperature,maxTokens:n.maxTokens,signal:n.signal,onToken:i=>{a+=i,n.onToken&&n.onToken(i)}});for await(const i of r);}catch(r){if(r.name==="AbortError")throw r;if(console.warn(`Agent ${l.name} API failed:`,r.message),!a.trim()&&(a=le(l,e),n.onToken))for(const i of a){if((b=n.signal)!=null&&b.aborted||(await new Promise(u=>setTimeout(u,5)),(v=n.signal)!=null&&v.aborted))break;n.onToken(i)}}const f=Ue(a);if(Ve(f)){console.warn(`Agent ${l.name} 回复质量过低，使用模拟回复`);const r=le(l,e);return{agentId:l.id,agentName:l.name,agentIcon:l.icon,agentColor:l.color,role:l.role,content:r}}return{agentId:l.id,agentName:l.name,agentIcon:l.icon,agentColor:l.color,role:l.role,content:f||a.trim()||le(l,e)}}function le(l,e){var b;const a=(e.length>0&&((b=e.find(v=>v.role==="user"))==null?void 0:b.content)||"这个话题").slice(0,20);return{pro:`关于"${a}"，我认为确实值得支持。从实际效果来看，这个方向能带来显著的积极影响，很多成功案例都证明了这一点。从可行性角度，现有技术和资源完全能够支撑，关键在于执行力。我坚定支持这一观点。`,con:`关于"${a}"，我有不同看法。正方提到了一些好处，但我们需要冷静分析其中的风险。理想和现实之间往往有差距，很多方案在执行中会遇到意想不到的困难。建议谨慎对待，先解决关键问题。`,"tech-expert":`从技术角度看"${a}"：目前技术栈可以支撑，但有几个关键难点需要攻克。我推荐采用渐进式方案，先做MVP验证核心假设，技术投入预计需要团队3-6个月，建议分阶段推进。`,"business-analyst":`从商业角度分析"${a}"：这个方向的市场空间真实存在，头部玩家不多，存在窗口期。核心变现路径清晰，单位经济效益可算。建议尽快验证PMF，抢占先机。`,"ux-designer":`从用户体验看"${a}"：目标用户确实有这方面痛点，且目前没有很好解决方案。核心体验路径需要打磨，尤其要注意首次使用的引导。建议先做几轮用户访谈，验证关键假设后再定型。`,"product-manager":`对"${a}"的产品思考：需求真实存在，但要区分"锦上添花"和"雪中送炭"。如果有P0问题没解决，建议先解决核心痛点。MVP第一版应聚焦最核心的一个场景，做深做透。`,professor:`从学术角度审视"${a}"：这方面研究可以追溯到几个经典理论框架，理论支撑充分。近两年顶会论文在这个方向有不少突破。建议先做文献综述，避免重复造轮子。`,researcher:`从实证研究看"${a}"：建议设计对照实验来验证核心假设，需要明确定义成功的量化标准。注意常见认知偏差可能影响判断，先做探索性研究再确认方向。`,student:`作为学生，对"${a}"我的真实想法是：这个问题对我们来说真的很实际。老师们说得很对，但有时候理论和实际体验还是有差距的。希望能更多考虑我们学生的真实需求和实际困难。`,host:`围绕"${a}"，各位从不同角度给出了深入分析。正方强调了积极意义和可行性，反方提醒注意潜在风险。各专家也从技术、商业、用户体验等维度给出专业见解。建议在推进中平衡各方观点，既看机遇也正视挑战。`}[l.id]||`关于"${a}"，作为${l.name}，我认为这是一个值得深入探讨的话题。大家从不同角度给出了很好的见解。综合来看，需要在多方面做出平衡和权衡，才能找到最优解。`}const be=Ne("debate",()=>{const l=Pe(),e=S(_e()),n=S($e()),a=S(""),f=S([]),b=S(3),v=S(["开篇立论","自由辩论","总结陈词"]),r=S(0),i=S(0),u=S([]),d=S(!1),y=S(!1),A=S(""),I=S(null),x=S(""),g=S("setup");let _=null;if(n.value){const s=e.value.find(o=>o.id===n.value);s?Q(s):(n.value=null,z())}const h=O(()=>e.value.find(s=>s.id===n.value)),C=O(()=>{const s={};for(const o of u.value)s[o.round]||(s[o.round]=[]),s[o.round].push(o);return s}),F=O(()=>i.value<f.value.length?f.value[i.value]:null);function X(s){const o=l.getUserPrefix();return`debate-${s}-${o}`}function _e(){return ne(X("sessions"),[])}function q(){se(X("sessions"),e.value)}function $e(){return ne(X("active-session"),null)}function z(){n.value?se(X("active-session"),n.value):me(X("active-session"))}function ye(s){return ne(`debate-msgs-${s}`,[])}function G(s){se(`debate-msgs-${s}`,u.value)}function Q(s){a.value=s.topic||"",f.value=s.agents||[],b.value=s.totalRounds||3,v.value=s.roundLabels||[],r.value=s.currentRound||0,u.value=ye(s.id)||[],y.value=s.isCompleted||!1,g.value=s.phase||(y.value?"completed":u.value.length>0?"interrupted":"setup")}function ue(s){a.value=s.topic,f.value=s.agents,b.value=s.rounds,v.value=s.roundLabels,r.value=0,i.value=0,u.value=[],d.value=!1,y.value=!1,A.value="",I.value=null,x.value="",g.value="setup"}function ke(s){const o=ie.find(k=>k.id===s);if(!o)return;const w=o.agentIds.map(k=>Z.find(R=>R.id===k)).filter(Boolean);ue({topic:"",agents:w,rounds:o.rounds,roundLabels:o.roundLabels})}function Ce(){const s=Z.find(o=>o.id==="host");s&&!f.value.find(o=>o.id==="host")&&(f.value=[...f.value,s])}function ce(){const s={id:K("debate"),topic:a.value,agents:f.value,totalRounds:b.value,roundLabels:v.value,currentRound:r.value,isCompleted:y.value,createdAt:Date.now(),updatedAt:Date.now()};return e.value.unshift(s),q(),n.value=s.id,z(),G(s.id),s}async function Ae(){if(!a.value.trim()||f.value.length<2||d.value)return;n.value||ce(),(g.value==="completed"||g.value==="interrupted")&&(u.value=[]),g.value="running",d.value=!0,y.value=!1;const s=new AbortController;_=s;try{for(let w=0;w<b.value;w++){r.value=w+1,i.value=-1;for(let k=0;k<f.value.length;k++){if(s.signal.aborted)return;i.value=k;const R=f.value[k];I.value=R.id,A.value="";const V=Re(R,w);let T="";try{T=(await fe(R,V,{signal:s.signal,onToken:U=>{T+=U,A.value=T}})).content,u.value.push({id:K("dmsg"),agentId:R.id,agentName:R.name,agentIcon:R.icon,agentColor:R.color,role:R.role,content:T,round:w+1,timestamp:Date.now()})}catch(L){if(L.name==="AbortError")return;console.warn("[Debate Error]",L.message),x.value="智能体响应失败，请重试",T.trim()&&u.value.push({id:K("dmsg"),agentId:R.id,agentName:R.name,agentIcon:R.icon,agentColor:R.color,role:R.role,content:T+`

[回复中断]`,round:w+1,timestamp:Date.now()})}}n.value&&(G(n.value),ee())}const o=f.value.find(w=>w.id==="host");if(o&&!s.signal.aborted){i.value=f.value.indexOf(o),I.value=o.id,A.value="";const w=we();let k="";try{k=(await fe(o,w,{signal:s.signal,onToken:V=>{k+=V,A.value=k}})).content}catch(R){if(R.name==="AbortError")return;k.trim()||(k="辩论已结束，感谢各位的精彩发言！")}u.value.push({id:K("dmsg"),agentId:o.id,agentName:o.name,agentIcon:o.icon,agentColor:o.color,role:"主持",content:k,round:b.value+1,timestamp:Date.now()}),n.value&&G(n.value)}y.value=!0,g.value="completed"}catch(o){o.name!=="AbortError"&&(console.warn("[Debate Error]",o.message),x.value="智能体响应失败，请重试")}finally{d.value=!1,I.value=null,A.value="",_===s&&(_=null),i.value=-1,n.value&&(ee(),h.value&&(h.value.updatedAt=Date.now(),q()),G(n.value))}}function Re(s,o){const w=[];let k="";const R=s.id==="con",V=s.id==="pro";if(R&&u.value.length>0){const E=u.value.filter(D=>D.agentId==="pro");if(E.length>0){const D=E[E.length-1];k=`辩论主题：${a.value}
当前：第${o+1}轮 - ${v.value[o]}
你是：${s.name}（${s.role}）

正方最新观点：
${D.content}

请针对正方观点进行**针对性反驳**：
1. 指出正方论点中的逻辑漏洞
2. 质疑其论据的可靠性
3. 提出反例
4. 阐述你的反对立场
用中文回答，观点鲜明，论据充分。`}else k=`辩论主题：${a.value}
当前：第${o+1}轮 - ${v.value[o]}
你是：${s.name}（${s.role}）
请阐述你的反对立场，提出有力论据。用中文回答。`}else if(V&&o>0&&u.value.length>0){const E=u.value.filter(D=>D.agentId==="con");if(E.length>0){const D=E[E.length-1];k=`辩论主题：${a.value}
当前：第${o+1}轮 - ${v.value[o]}
你是：${s.name}（${s.role}）

反方最新反驳：
${D.content}

请**回应反方的质疑**，强化你的立场：
1. 回应反方指出的漏洞
2. 补充新论据
3. 深化你的论点
用中文回答，逻辑严密，论证有力。`}else k=`辩论主题：${a.value}
当前：第${o+1}轮 - ${v.value[o]}
你是：${s.name}（${s.role}）
请阐述你的支持立场，提出有力论据。用中文回答。`}else k=`辩论主题：${a.value}
当前：第${o+1}轮 - ${v.value[o]}
你是：${s.name}（${s.role}）
请发表你的观点。用中文回答。`;w.push({role:"user",content:k});const T=4096,L=1536,U=Y(k);let H=T-L-U;const j=[];for(let E=u.value.length-1;E>=0;E--){const D=u.value[E],te=Y(D.content)+8;if(te<=H)j.unshift(D),H-=te;else{const Ee=Math.max(H/te,.2),ve=Math.floor(D.content.length*Ee);ve>20&&j.unshift({...D,content:D.content.slice(0,ve)+"..."});break}}for(const E of j){const D=E.agentId===s.id?"assistant":"user";w.push({role:D,content:`${E.agentName}：${E.content}`})}return w}function we(){let k=2560-Y(`辩论主题：${a.value}
以下是辩论记录：



请作为资深辩论主持人深度总结。`);const R=[];for(const T of u.value){const L=`${T.agentName}：${T.content}`,U=Y(L);if(U<=k)R.push(L),k-=U;else{const H=Math.max(k/U,.1),j=Math.floor(T.content.length*H);j>10&&R.push(`${T.agentName}：${T.content.slice(0,j)}...`);break}}const V=R.join(`
`);return[{role:"user",content:`辩论主题：${a.value}
以下是辩论记录：
${V}

请作为资深辩论主持人进行深度总结：

【总结框架】
1. 观点梳理：清晰概括正反双方的核心论点和论据
2. 交锋亮点：提炼辩论中的精彩反驳和有力回应
3. 争议焦点：分析双方未能达成共识的关键分歧
4. 论证质量评估：客观评价各方论据的说服力和逻辑性
5. 深度总结：综合各方观点，给出有洞察力的结论和思考方向

要求：
- 保持中立客观，不偏不倚
- 深入分析辩论的思想价值
- 提出启发性的问题或建议
- 语言流畅，富有感染力
用中文回答。`}]}function Se(){_&&(_.abort(),_=null),d.value=!1,I.value=null,A.value="",u.value.length>0?(y.value=!1,g.value="interrupted",n.value&&(G(n.value),ee())):g.value="setup"}function Ie(s){if(e.value=e.value.filter(o=>o.id!==s),me(`debate-msgs-${s}`),n.value===s){const o=e.value[0];o?(n.value=o.id,z(),Q(o)):de()}q()}function xe(s){n.value=s,z();const o=e.value.find(w=>w.id===s);o&&Q(o)}function de(){n.value=null,a.value="",f.value=[],b.value=3,v.value=[],r.value=0,i.value=0,u.value=[],d.value=!1,y.value=!1,A.value="",I.value=null,x.value="",g.value="setup",z()}function ee(){if(h.value){const s=h.value,o=e.value.indexOf(s);o!==-1&&(e.value=e.value.map((w,k)=>k===o?{...w,currentRound:r.value,isCompleted:y.value,phase:g.value,updatedAt:Date.now()}:w)),q()}}return{sessions:e,activeSessionId:n,activeSession:h,topic:a,agents:f,totalRounds:b,roundLabels:v,currentRound:r,currentAgentIdx:i,messages:u,isRunning:d,isCompleted:y,streamingContent:A,streamingAgentId:I,error:x,phase:g,roundMessages:C,currentAgent:F,setupDebate:ue,applyPreset:ke,addHostAgent:Ce,createSession:ce,startDebate:Ae,stopDebate:Se,deleteSession:Ie,switchSession:xe,resetAll:de}}),Xe={class:"debate-setup"},ze={class:"setup-card"},Ge={class:"setup-section"},He={class:"preset-grid"},We=["onClick"],Ze={class:"preset-icon"},qe={class:"preset-info"},Ke={class:"setup-section"},Ye={class:"topic-suggestions"},Je=["onClick"],Qe={class:"setup-section"},et={class:"agent-grid"},tt=["onClick"],nt={class:"agent-chip-icon"},st={class:"agent-chip-name"},ot={class:"agent-chip-role"},at={class:"setup-section"},lt={class:"setup-label"},rt={class:"round-labels-preview"},it=["disabled"],ut={key:0,class:"start-hint"},ct={__name:"DebateSetup",props:{topic:{type:String,default:""},agents:{type:Array,default:()=>[]},rounds:{type:Number,default:3},roundLabels:{type:Array,default:()=>[]}},emits:["start"],setup(l,{emit:e}){const n=l,a=ie,f=["人工智能是否会取代人类工作？","远程办公是否比传统办公更高效？","大学生应该先就业还是继续深造？","社交媒体对青少年的影响是正面还是负面的？"],b=S(n.topic),v=S(new Set(n.agents.map(_=>_.id))),r=S(n.rounds||3),i=S(n.agents.length?"":"pro-con");if(!n.agents.length){const _=ie.find(h=>h.id==="pro-con");_&&(v.value=new Set(_.agentIds),r.value=_.rounds)}const u=Z.filter(_=>_.id!=="host"),d=O(()=>Z.filter(_=>v.value.has(_.id))),y=O(()=>b.value.trim().length>0&&v.value.size>=2),A=["开篇立论","自由辩论","深入交锋","补充观点","总结陈词"],I=O(()=>r.value===3?["开篇立论","自由辩论","总结陈词"]:r.value===2?["观点阐述","深入讨论"]:A.slice(0,r.value));function x(_){i.value=_.id,v.value=new Set(_.agentIds),r.value=_.rounds}function g(_){const h=new Set(v.value);h.has(_.id)?h.size>2&&h.delete(_.id):h.add(_.id),v.value=h,i.value&&(i.value="")}return(_,h)=>(m(),p("div",Xe,[t("div",ze,[h[9]||(h[9]=t("h2",{class:"setup-title"},"配置辩论",-1)),t("div",Ge,[h[3]||(h[3]=t("label",{class:"setup-label"},"快速预设",-1)),t("div",He,[(m(!0),p(N,null,P(c(a),C=>(m(),p("button",{key:C.id,class:B(["preset-card",{active:i.value===C.id}]),onClick:F=>x(C)},[t("span",Ze,$(C.icon),1),t("div",qe,[t("strong",null,$(C.name),1),t("span",null,$(C.desc),1)])],10,We))),128))])]),t("div",Ke,[h[5]||(h[5]=t("label",{class:"setup-label"},"辩论主题",-1)),ge(t("textarea",{"onUpdate:modelValue":h[0]||(h[0]=C=>b.value=C),class:"topic-input",placeholder:"输入你想要辩论的主题，例如：人工智能是否会取代人类工作？",rows:"3"},null,512),[[pe,b.value]]),t("div",Ye,[h[4]||(h[4]=t("span",{class:"suggestion-label"},"试试：",-1)),(m(),p(N,null,P(f,C=>t("button",{key:C,class:"suggestion-chip",onClick:F=>b.value=C},$(C),9,Je)),64))])]),t("div",Qe,[h[6]||(h[6]=t("label",{class:"setup-label"},[oe(" 参与角色 "),t("span",{class:"label-hint"},"（至少选择 2 个）")],-1)),t("div",et,[(m(!0),p(N,null,P(c(u),C=>(m(),p("button",{key:C.id,class:B(["agent-chip",{selected:v.value.has(C.id)}]),style:W(v.value.has(C.id)?{"--chip-color":C.color}:{}),onClick:F=>g(C)},[t("span",nt,$(C.icon),1),t("span",st,$(C.name),1),t("span",ot,$(C.role),1)],14,tt))),128))])]),t("div",at,[t("label",lt,[h[7]||(h[7]=oe("辩论轮次：",-1)),t("strong",null,$(r.value),1),h[8]||(h[8]=oe(" 轮",-1))]),ge(t("input",{type:"range","onUpdate:modelValue":h[1]||(h[1]=C=>r.value=C),min:"2",max:"5",class:"rounds-slider"},null,512),[[pe,r.value,void 0,{number:!0}]]),t("div",rt,[(m(!0),p(N,null,P(I.value,(C,F)=>(m(),p("span",{key:F,class:"round-label-chip"}," R"+$(F+1)+": "+$(C),1))),128))])]),t("button",{class:"start-btn",disabled:!y.value,onClick:h[2]||(h[2]=C=>_.$emit("start",{topic:b.value,agents:d.value,rounds:r.value,roundLabels:I.value}))}," 开始辩论 ⚡ ",8,it),y.value?M("",!0):(m(),p("p",ut,"请填写主题并选择至少 2 个角色"))])]))}},dt=J(ct,[["__scopeId","data-v-838f20e0"]]),vt={key:0,class:"summary-badge"},mt={class:"msg-round-badge"},gt={class:"msg-header"},pt={class:"msg-avatar"},ft={class:"msg-agent-name"},ht={class:"msg-body"},bt={__name:"DebateMessage",props:{message:{type:Object,required:!0}},setup(l){return(e,n)=>(m(),p("div",{class:B(["debate-msg",{"host-summary":l.message.role==="主持"}]),style:W({"--agent-color":l.message.agentColor})},[l.message.role==="主持"?(m(),p("div",vt,"主持人总结")):M("",!0),t("div",mt,"R"+$(l.message.round),1),t("div",gt,[t("span",pt,$(l.message.agentIcon),1),t("span",ft,$(l.message.agentName),1),t("span",{class:B(["msg-role-tag",l.message.role])},$(l.message.role),3)]),t("div",ht,[re(he,{content:l.message.content},null,8,["content"])])],6))}},_t=J(bt,[["__scopeId","data-v-f389ec35"]]),$t={class:"debate-arena"},yt={class:"agent-bar"},kt={class:"agent-dot"},Ct={class:"agent-emoji"},At={key:0,class:"pulse-ring"},Rt={class:"agent-status-name"},wt={class:"agent-status-state"},St={class:"round-progress"},It={class:"round-track"},xt={class:"round-num"},Et={class:"round-labels"},Dt={key:0,class:"error-banner"},Tt={class:"error-text"},Mt={key:0,class:"round-separator"},Nt={class:"msg-header"},Pt={class:"msg-avatar"},Lt={class:"msg-agent-name"},Ot={class:"msg-body"},Bt={__name:"DebateArena",setup(l){const e=be(),n=S(null),a=O(()=>e.agents.find(d=>d.id===e.streamingAgentId)),f=O(()=>new Set(e.messages.map(d=>d.agentId)));function b(d){return d===0?!0:e.messages[d].round!==e.messages[d-1].round}function v(d){return f.value.has(d)}function r(){e.error="",e.startDebate()}Le(()=>[e.messages.length,e.streamingContent],()=>Oe(u));function i(){if(!n.value)return!0;const d=n.value;return d.scrollHeight-d.scrollTop-d.clientHeight<120}function u(){n.value&&i()&&requestAnimationFrame(()=>{n.value&&(n.value.scrollTop=n.value.scrollHeight)})}return(d,y)=>{var A,I,x;return m(),p("div",$t,[t("div",yt,[(m(!0),p(N,null,P(c(e).agents,g=>(m(),p("div",{key:g.id,class:B(["agent-status",{speaking:c(e).streamingAgentId===g.id,done:v(g.id),waiting:!v(g.id)&&c(e).streamingAgentId!==g.id}]),style:W({"--agent-color":g.color})},[t("div",kt,[t("span",Ct,$(g.icon),1),c(e).streamingAgentId===g.id?(m(),p("div",At)):M("",!0)]),t("span",Rt,$(g.name),1),t("span",wt,$(c(e).streamingAgentId===g.id?"发言中...":v(g.id)?"已发言":"等待中"),1)],6))),128))]),t("div",St,[t("div",It,[(m(!0),p(N,null,P(c(e).totalRounds,g=>(m(),p("div",{key:g,class:B(["round-dot",{completed:g<c(e).currentRound,active:g===c(e).currentRound,pending:g>c(e).currentRound}])},[t("span",xt,$(g),1)],2))),128)),t("div",{class:"round-progress-fill",style:W({width:(c(e).currentRound-1)/Math.max(c(e).totalRounds-1,1)*100+"%"})},null,4)]),t("div",Et,[(m(!0),p(N,null,P(c(e).roundLabels,(g,_)=>(m(),p("span",{key:_,class:B(["round-label-text",{active:_+1<=c(e).currentRound}])},$(g),3))),128))])]),c(e).error?(m(),p("div",Dt,[t("span",Tt,$(c(e).error),1),t("button",{class:"retry-btn",onClick:r},"重试")])):M("",!0),t("div",{class:"arena-messages",ref_key:"msgContainer",ref:n},[(m(!0),p(N,null,P(c(e).messages,(g,_)=>(m(),p(N,{key:g.id},[b(_)?(m(),p("div",Mt,[t("span",null,"第 "+$(g.round)+" 轮",1)])):M("",!0),re(_t,{message:g},null,8,["message"])],64))),128)),c(e).streamingContent&&c(e).streamingAgentId?(m(),p("div",{key:0,class:"debate-msg streaming",style:W({"--agent-color":(A=a.value)==null?void 0:A.color})},[t("div",Nt,[t("span",Pt,$((I=a.value)==null?void 0:I.icon),1),t("span",Lt,$((x=a.value)==null?void 0:x.name),1),y[0]||(y[0]=t("span",{class:"msg-role-tag"},"发言中",-1))]),t("div",Ot,[re(he,{content:c(e).streamingContent},null,8,["content"]),y[1]||(y[1]=t("span",{class:"cursor-blink"},"|",-1))])],4)):M("",!0)],512)])}}},Ft=J(Bt,[["__scopeId","data-v-bd3734db"]]),Vt={class:"debate-page"},Ut={class:"debate-sidebar"},jt={key:0,class:"session-list"},Xt=["onClick"],zt={class:"session-main"},Gt={class:"session-topic"},Ht={class:"session-meta"},Wt=["onClick"],Zt={key:1,class:"sidebar-empty"},qt={class:"debate-main"},Kt={key:0,class:"debate-header"},Yt={class:"debate-topic-title"},Jt={class:"debate-header-meta"},Qt={key:0},en={key:1},tn={key:2,class:"badge-completed"},nn={key:3,class:"badge-interrupted"},sn={key:4,class:"badge-running"},on={key:3,class:"completed-actions"},an={__name:"DebateWindow",setup(l){const e=be(),n=S(null);function a(i){e.setupDebate(i),Z.find(u=>u.id==="host"),i.agents.find(u=>u.id==="host")||e.addHostAgent(),e.startDebate()}function f(){e.resetAll()}function b(i){n.value=i}function v(){n.value&&e.deleteSession(n.value.id),n.value=null}function r(){let i=`# 多智能体辩论记录

`;i+=`**辩题**: ${e.topic}

`,i+=`**参与者**: ${e.agents.map(A=>`${A.icon} ${A.name}`).join(" | ")}

`,i+=`**轮次**: ${e.totalRounds}

`,i+=`---

`;for(let A=1;A<=Math.max(...e.messages.map(I=>I.round));A++){const I=e.messages.filter(x=>x.round===A);if(I.length){i+=`## 第 ${A} 轮

`;for(const x of I)i+=`### ${x.agentIcon} ${x.agentName}（${x.role}）

${x.content}

`}}i+=`---
*生成时间: ${new Date().toLocaleString()}*`;const u=new Blob([i],{type:"text/markdown"}),d=URL.createObjectURL(u),y=document.createElement("a");y.href=d,y.download=`debate-${e.topic.slice(0,20)||"record"}-${Date.now()}.md`,y.click(),URL.revokeObjectURL(d)}return(i,u)=>(m(),p("div",Vt,[t("aside",Ut,[t("div",{class:"sidebar-header"},[u[3]||(u[3]=t("h3",null,"辩论记录",-1)),t("button",{class:"new-debate-btn",onClick:f,title:"新建辩论"},[...u[2]||(u[2]=[t("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round"},[t("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),t("line",{x1:"5",y1:"12",x2:"19",y2:"12"})],-1)])])]),c(e).sessions.length?(m(),p("div",jt,[(m(!0),p(N,null,P(c(e).sessions,d=>{var y;return m(),p("button",{key:d.id,class:B(["session-item",{active:d.id===c(e).activeSessionId}]),onClick:A=>c(e).switchSession(d.id)},[t("div",zt,[t("span",Gt,$(d.topic||"未命名辩论"),1),t("span",Ht,$(((y=d.agents)==null?void 0:y.length)||0)+"人 · "+$(d.totalRounds)+"轮",1)]),t("button",{class:"session-delete",onClick:Be(A=>b(d),["stop"]),title:"删除"},[...u[4]||(u[4]=[t("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2"},[t("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),t("line",{x1:"6",y1:"6",x2:"18",y2:"18"})],-1)])],8,Wt)],10,Xt)}),128))])):(m(),p("div",Zt,"暂无辩论记录"))]),t("main",qt,[c(e).topic?(m(),p("header",Kt,[t("h2",Yt,$(c(e).topic),1),t("div",Jt,[t("span",null,$(c(e).agents.length)+" 位参与者",1),u[5]||(u[5]=t("span",null,"·",-1)),c(e).isRunning?(m(),p("span",Qt,"第 "+$(c(e).currentRound)+"/"+$(c(e).totalRounds)+" 轮",1)):(m(),p("span",en,$(c(e).totalRounds)+" 轮",1)),c(e).isCompleted?(m(),p("span",tn,"已完成")):c(e).phase==="interrupted"?(m(),p("span",nn,"已中断")):c(e).isRunning?(m(),p("span",sn,"进行中")):M("",!0)]),c(e).isRunning?(m(),p("button",{key:0,class:"stop-btn",onClick:u[0]||(u[0]=d=>c(e).stopDebate())}," 停止辩论 ")):M("",!0)])):M("",!0),c(e).phase==="setup"?(m(),ae(dt,{key:1,topic:c(e).topic,agents:c(e).agents,rounds:c(e).totalRounds,"round-labels":c(e).roundLabels,onStart:a},null,8,["topic","agents","rounds","round-labels"])):M("",!0),c(e).phase==="running"||c(e).phase==="completed"?(m(),ae(Ft,{key:2})):M("",!0),c(e).phase==="completed"?(m(),p("div",on,[t("button",{class:"action-btn primary",onClick:f},"开始新辩论"),t("button",{class:"action-btn secondary",onClick:r},"导出 Markdown")])):M("",!0)]),n.value?(m(),ae(Fe,{key:0,title:"删除辩论",message:`确定删除辩论「${n.value.topic||"未命名"}」？此操作不可恢复。`,onConfirm:v,onCancel:u[1]||(u[1]=d=>n.value=null)},null,8,["message"])):M("",!0)]))}},vn=J(an,[["__scopeId","data-v-0f02f2cd"]]);export{vn as default};
