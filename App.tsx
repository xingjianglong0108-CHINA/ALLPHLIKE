
import React, { useState, useMemo } from 'react';
import { 
  Dna, 
  Stethoscope, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  FlaskConical, 
  Pill,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ClipboardCheck
} from 'lucide-react';
import { PhLikeDecision, IKZF1PlusDecision, DecisionResult, IKZF1Status, GeneStatus } from './logic';

type Tab = 'ph-like' | 'ikzf1-plus' | 'summary';

const GENE_SIGNIFICANCE: Record<string, string> = {
  ikzf1_del: "IKZF1缺失常涉及4-6外显子。杂合缺失（Heterozygous Deletion）指等位基因单份拷贝丢失，在ALL中最为常见。这会导致Ikaros蛋白功能单倍不足（Haploinsufficiency），是公认的高危预后指标。纯合缺失预后往往更差，但杂合缺失已具备显著临床干预价值 (N Engl J Med 2009, Leukemia 2015)。",
  cdkn2a_b_del: "CDKN2A/B杂合或纯合缺失在B-ALL中均有显著临床意义。在BCR-ABL1阳性及Ph-like亚型中，该缺失与化疗耐药和更短的生存期相关 (Blood 2015)。",
  par1_del: "PAR1区（CRLF2, CSF2RA, IL3RA, P2RY8, SHOX）缺失。杂合缺失足以导致P2RY8-CRLF2融合，引起CRLF2过表达，与不良预后相关。重复(Dup)通常无临床意义。",
  pax5_del: "B系发育关键转录因子。PAX5 杂合缺失（单拷贝丢失）在 B-ALL 中极为常见。在 IKZF1 PLUS 的定义中，PAX5 的杂合缺失与纯合缺失具有同等的临床判定权重 (Blood 2017)。",
  ebf1_del: "EBF1杂合缺失会导致B细胞早期分化关键转录因子不足，是ALL复发的重要预测指标，常与IKZF1缺失协同作用。",
  rb1_del: "RB1杂合缺失会导致细胞周期G1/S期检查点失控。在GEN-PR分层中，RB1任何形式的缺失均被纳入中高危预后组 (Blood 2014)。",
  btg1_del: "BTG1调节细胞增殖及糖皮质激素敏感性。其杂合缺失是GC治疗反应不良的决定因子。BTG1+IKZF1双缺失预后极差。",
  etv6_del: "ETV6基因缺失（常为杂合）在儿童B-ALL中多见。在ETV6-RUNX1亚型中，额外伴随的ETV6缺失通常不恶化预后，甚至预示更好。 (BJLH 2011)。",
  erg_del: "强力保护因素。伴ERG缺失（即使是杂合形式）的患者预后极佳，可中和IKZF1缺失的高危效应。",
  dux4_rearrange: "DUX4重排定义了特定的预后良好亚型，具有独特的表达谱，临床预后优异。",
  iamp21: "21号染色体扩增。判定标准：RUNX1信号≥5个或≥3个信号聚集。提示极高危预后 (NCCN 2024)。"
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ph-like');
  const [selectedGenes, setSelectedGenes] = useState<Set<string>>(new Set());
  const [ikzf1Status, setIkzf1Status] = useState<IKZF1Status>({
    ikzf1_del: false,
    cdkn2a_b_del: false,
    pax5_del: false,
    par1_genes: {
      CRLF2: 'none',
      CSF2RA: 'none',
      IL3RA: 'none',
      P2RY8: 'none',
      SHOX: 'none'
    },
    ebf1_del: false,
    rb1_del: false,
    btg1_del: false,
    etv6_del: false,
    erg_del: false,
    dux4_rearrange: false,
    iamp21: false
  });

  const toggleGene = (gene: string) => {
    const next = new Set(selectedGenes);
    if (next.has(gene)) next.delete(gene);
    else next.add(gene);
    setSelectedGenes(next);
  };

  const phLikeResult = useMemo(() => PhLikeDecision(Array.from(selectedGenes)), [selectedGenes]);
  const ikzf1Result = useMemo(() => IKZF1PlusDecision(ikzf1Status), [ikzf1Status]);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-[#f2f2f7]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-5">
        <h1 className="text-[19px] font-bold text-center tracking-tight text-gray-900 leading-tight">
          ALL Ph-like & IKZF1 PLUS 决策工具 <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">LZRYEK</span>
        </h1>
        <p className="text-[12px] text-gray-500 text-center mt-1.5 font-medium">
          参考 SCCCG-2023 & 国际主流指南 (NCCN/Blood)
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="bg-gray-200/50 p-1 rounded-xl flex items-center mb-2">
          {['ph-like', 'ikzf1-plus', 'summary'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              {tab === 'ph-like' ? 'Ph-like' : tab === 'ikzf1-plus' ? 'IKZF1+' : '综合决策'}
            </button>
          ))}
        </div>

        {activeTab === 'ph-like' && (
          <PhLikeSection selectedGenes={selectedGenes} toggleGene={toggleGene} result={phLikeResult} />
        )}

        {activeTab === 'ikzf1-plus' && (
          <IKZF1Section status={ikzf1Status} setStatus={setIkzf1Status} result={ikzf1Result} />
        )}

        {activeTab === 'summary' && (
          <SummarySection phResult={phLikeResult} ikResult={ikzf1Result} />
        )}
      </main>

      <div className="safe-area-bottom pb-6" />
    </div>
  );
};

const StandardCard = ({ title, items, icon: Icon }: { title: string, items: string[], icon: any }) => (
  <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 mb-4 animate-in fade-in slide-in-from-top-1">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-blue-600" />
      <h3 className="text-[14px] font-bold text-blue-900">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2 text-[12px] text-blue-800/80 leading-relaxed">
          <span className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  </div>
);

const PhLikeSection: React.FC<{ selectedGenes: Set<string>, toggleGene: (g: string) => void, result: DecisionResult }> = ({ selectedGenes, toggleGene, result }) => {
  const geneGroups = [
    { title: 'JAK-STAT 通路', genes: ['CRLF2', 'EPOR', 'JAK1', 'JAK2', 'JAK3', 'TYK2', 'SH2B3', 'IL7R'] },
    { title: 'ABL-class 通路', genes: ['ABL1', 'ABL2', 'CSF1R', 'PDGFRA', 'PDGFRB', 'FGFR1'] },
    { title: '其他靶向可能', genes: ['NTRK', 'FLT3', 'KRAS', 'NRAS', 'PTPN11'] }
  ];

  const phLikeStandards = [
    "<strong>核心定义：</strong> 基因表达谱 (GEP) 与 Ph+ ALL 极其相似，但 <strong>BCR-ABL1 融合阴性</strong>。",
    "<strong>致病驱动：</strong> 约 90% 存在激酶活化突变或重排 (ABL-class 或 JAK-STAT 通路)。",
    "<strong>靶向窗口：</strong> ABL-class 阳性者对 TKI (达沙替尼) 敏感；JAK 通路异常者对 JAK 抑制剂 (鲁索利替尼) 潜在敏感。"
  ];

  return (
    <div className="space-y-6">
      <StandardCard title="Ph-like 判定标准" items={phLikeStandards} icon={ClipboardCheck} />
      
      <div className="bg-white rounded-2xl p-5 ios-shadow border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FlaskConical className="text-blue-500" size={20} /> Ph-like 基因筛选
        </h2>
        {geneGroups.map((group, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            <h3 className="text-[12px] font-semibold text-gray-400 uppercase mb-3">{group.title}</h3>
            <div className="grid grid-cols-3 gap-2">
              {group.genes.map(gene => (
                <button
                  key={gene}
                  onClick={() => toggleGene(gene)}
                  className={`py-2 px-1 rounded-xl text-[13px] font-bold border transition-all ${
                    selectedGenes.has(gene) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {gene}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ResultDisplay result={result} title="Ph-like 判定结果" />
    </div>
  );
};

const IKZF1Section: React.FC<{ status: IKZF1Status, setStatus: (s: IKZF1Status) => void, result: DecisionResult }> = ({ status, setStatus, result }) => {
  const [infoGene, setInfoGene] = useState<string | null>(null);
  const [par1Expanded, setPar1Expanded] = useState(false);
  
  const toggle = (key: keyof IKZF1Status) => {
    if (key === 'par1_genes') return;
    setStatus({ ...status, [key]: !status[key] });
  };

  const updatePar1Gene = (gene: keyof IKZF1Status['par1_genes'], next: GeneStatus) => {
    setStatus({
      ...status,
      par1_genes: {
        ...status.par1_genes,
        [gene]: next
      }
    });
  };

  const ikzf1PlusStandards = [
    "<strong>IKZF1 PLUS 定义：</strong> 具备 <strong>IKZF1 缺失</strong> 且 <strong>同时合并</strong> 以下至少一项缺失：CDKN2A/B (单/双单倍体), PAX5, 或 PAR1 (P2RY8-CRLF2)。",
    "<strong>杂合缺失：</strong> 无论是 IKZF1 还是 PAX5 等，杂合缺失（单拷贝丢失）在临床报告中均视为 <strong>'Positive (del)'</strong>。",
    "<strong>排除标准：</strong> 必须 <strong>不存在 ERG 缺失</strong>。若伴有 ERG 缺失，则预后转为良好，不再定义为 PLUS。",
    "<strong>专家共识：</strong> 典型的 <strong>IKZF1 del + PAX5 杂合缺失 - ERG del</strong> 是最常见的 IKZF1 PLUS 组合。"
  ];

  const items = [
    { key: 'ikzf1_del', label: 'IKZF1 基因缺失', color: 'text-red-600' },
    { key: 'cdkn2a_b_del', label: 'CDKN2A/B 缺失', color: 'text-gray-800' },
    { key: 'pax5_del', label: 'PAX5 基因缺失', color: 'text-gray-800' },
  ];

  const others = [
    { key: 'ebf1_del', label: 'EBF1 基因缺失', color: 'text-gray-800' },
    { key: 'rb1_del', label: 'RB1 基因缺失', color: 'text-gray-800' },
    { key: 'btg1_del', label: 'BTG1 基因缺失', color: 'text-gray-800' },
    { key: 'iamp21', label: 'iAMP21 (21号扩增)', color: 'text-red-700 font-bold' },
    { key: 'etv6_del', label: 'ETV6 基因缺失', color: 'text-green-600' },
    { key: 'erg_del', label: 'ERG 缺失 (保护因素)', color: 'text-green-600' },
    { key: 'dux4_rearrange', label: 'DUX4 重排 (预后良好)', color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <StandardCard title="IKZF1 PLUS 判定标准" items={ikzf1PlusStandards} icon={ClipboardCheck} />

      <div className="bg-white rounded-2xl overflow-hidden ios-shadow border border-gray-100 relative">
        <div className="p-5 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-2">
            <Dna className="text-purple-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">IKZF1 PLUS 综合判定</h2>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full">
             <Info size={12} className="text-blue-500" />
             <span className="text-[10px] text-blue-600 font-bold">支持杂合缺失</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 px-5">
          {/* Main Genes */}
          {items.map((item) => (
            <div key={item.key} className="py-4 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span className={`text-[15px] font-medium ${item.color}`}>{item.label}</span>
                <button onClick={() => setInfoGene(item.key)} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
                  <Info size={14} />
                </button>
              </div>
              <ToggleSwitch active={status[item.key as keyof IKZF1Status] as boolean} onToggle={() => toggle(item.key as keyof IKZF1Status)} />
            </div>
          ))}

          {/* PAR1 Detailed Section */}
          <div className="py-4">
            <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => setPar1Expanded(!par1Expanded)}>
               <div className="flex items-center gap-2">
                 <span className={`text-[15px] font-medium text-gray-800`}>PAR1 区域 (拟常染色体区1)</span>
                 <button onClick={(e) => { e.stopPropagation(); setInfoGene('par1_del'); }} className="p-1 text-gray-300 hover:text-blue-500">
                   <Info size={14} />
                 </button>
               </div>
               {par1Expanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
            </div>
            
            {par1Expanded && (
              <div className="space-y-3 mt-4 mb-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                {(Object.keys(status.par1_genes) as Array<keyof IKZF1Status['par1_genes']>).map((gene) => (
                  <div key={gene} className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-600">{gene}</span>
                    <div className="flex bg-gray-200 p-0.5 rounded-lg shadow-inner">
                      {(['none', 'del', 'dup'] as GeneStatus[]).map((val) => (
                        <button
                          key={val}
                          onClick={() => updatePar1Gene(gene, val)}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            status.par1_genes[gene] === val 
                            ? (val === 'del' ? 'bg-red-500 text-white shadow-sm' : val === 'dup' ? 'bg-orange-400 text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm') 
                            : 'text-gray-500'
                          }`}
                        >
                          {val === 'none' ? '无' : val === 'del' ? '缺失' : '重复'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-400 italic mt-2 font-medium leading-relaxed italic font-medium">
                  * 临床说明：检出的缺失通常涵盖杂合缺失（单拷贝丢失），具有显著预后意义。
                </p>
              </div>
            )}
          </div>

          {/* Other Markers */}
          {others.map((item) => (
            <div key={item.key} className="py-4 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span className={`text-[15px] font-medium ${item.color}`}>{item.label}</span>
                <button onClick={() => setInfoGene(item.key)} className="p-1 text-gray-300 hover:text-blue-500 transition-colors">
                  <Info size={14} />
                </button>
              </div>
              <ToggleSwitch active={status[item.key as keyof IKZF1Status] as boolean} onToggle={() => toggle(item.key as keyof IKZF1Status)} />
            </div>
          ))}
        </div>

        {/* Info Modal Overlay */}
        {infoGene && (
          <div className="absolute inset-0 bg-white/95 z-20 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-blue-600">临床意义参考</h4>
              <button onClick={() => setInfoGene(null)} className="p-1"><XCircle size={20} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                {GENE_SIGNIFICANCE[infoGene]}
              </p>
            </div>
            <div className="mt-4 text-[10px] text-gray-400 border-t pt-4 font-semibold uppercase tracking-wider">
              数据源：SCCCG-2023, NCCN-2024, Blood (2014-2017)
            </div>
          </div>
        )}
      </div>

      <ResultDisplay result={result} title="IKZF1 预后分析" />
    </div>
  );
};

const ResultDisplay: React.FC<{ result: DecisionResult, title: string }> = ({ result, title }) => {
  const colorMap = {
    positive: 'bg-red-50 border-red-100 text-red-700 icon-red',
    negative: 'bg-green-50 border-green-100 text-green-700 icon-green',
    neutral: 'bg-gray-50 border-gray-100 text-gray-600 icon-gray'
  };
  const theme = colorMap[result.status];

  return (
    <div className={`rounded-2xl p-5 ios-shadow border transition-all ${theme}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-xl bg-white/50`}>
          {result.status === 'positive' ? <AlertTriangle size={24} /> : result.status === 'negative' ? <CheckCircle2 size={24} /> : <Info size={24} />}
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-bold uppercase opacity-60 mb-1 tracking-wider">{title}</h3>
          <p className="text-xl font-black mb-2">{result.label}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 rounded bg-white/80 text-[10px] font-bold shadow-sm uppercase">
              危险度: {result.risk}
            </span>
            {result.type && (
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                {result.type}
              </span>
            )}
          </div>
          {result.detail && <p className="mt-3 text-[12px] leading-snug opacity-80 font-medium italic">"{result.detail}"</p>}
          
          {result.therapy && (
            <div className="mt-4 p-4 bg-white/60 rounded-xl border border-blue-100/30 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-1.5 mb-2 text-blue-700">
                <Pill size={16} />
                <span className="text-[13px] font-bold">推荐靶向方案</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap mt-0.5">药物:</span>
                  <span className="text-[13px] font-bold text-gray-900">{result.therapy.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap mt-0.5">剂量:</span>
                  <span className="text-[13px] text-gray-800 font-medium">{result.therapy.dose}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap mt-0.5">时机:</span>
                  <span className="text-[12px] text-blue-800 font-semibold">{result.therapy.timing}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummarySection: React.FC<{ phResult: DecisionResult, ikResult: DecisionResult }> = ({ phResult, ikResult }) => {
  const recs = useMemo(() => {
    const r = [];
    if (phResult.therapy) {
      r.push({ t: phResult.therapy.name, d: `${phResult.type}阳性。建议使用剂量为 ${phResult.therapy.dose}，时机为 ${phResult.therapy.timing}。`, k: '靶向首选' });
    }
    if (ikResult.risk === 'HR' || phResult.status === 'positive') r.push({ t: '强化化疗/移植', d: '高危遗传学异常，建议进入高危组化疗。若12周MRD持续阳性，考虑异基因HSCT。', k: '路径调整' });
    if (ikResult.label.includes('良好') || (phResult.status === 'negative' && ikResult.status === 'neutral')) r.push({ t: '维持现状', d: '分子预后良好或无显著高危因素，维持常规SCCCG方案。', k: '常规方案' });
    return r;
  }, [phResult, ikResult]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-6 ios-shadow border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Pill className="text-blue-500" size={24} /> 临床综合建议
        </h2>
        
        <div className="space-y-5">
          {recs.map((rec, i) => (
            <div key={i} className="group p-5 bg-blue-50/40 rounded-2xl border border-blue-100/50 hover:bg-white hover:shadow-lg transition-all">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-gray-900">{rec.t}</h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-bold">{rec.k}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{rec.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 bg-amber-50/30 -mx-6 px-6 pb-6">
          <div className="flex items-center gap-2 text-amber-700 mb-3">
            <Info size={18} />
            <span className="font-bold text-sm">核心临床证据依据</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <EvidenceCard title="NCCN-2024" content="明确 iAMP21 及 Ph-like 属于极高危亚型。规范 RUNX1 FISH 判定标准。" />
             <EvidenceCard title="Blood 2014-2017" content="定义 GEN-PR 组及 PAX5 内部扩增与预后的相关性。" />
             <EvidenceCard title="Leukemia 2014-2015" content="明确 ERG 缺失的保护作用及 IKZF1 缺失的可变预后。" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EvidenceCard = ({ title, content }: { title: string, content: string }) => (
  <div className="bg-white/60 rounded-xl p-3 border border-amber-100/50 shadow-sm">
    <div className="text-[10px] font-black text-amber-800 uppercase mb-1">{title}</div>
    <div className="text-[11px] text-gray-600 leading-tight">{content}</div>
  </div>
);

const ToggleSwitch: React.FC<{ active: boolean, onToggle: () => void }> = ({ active, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-11 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${active ? 'left-[22px]' : 'left-[2px]'}`} />
  </button>
);

export default App;
