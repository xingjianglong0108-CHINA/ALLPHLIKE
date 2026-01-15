
export interface DecisionResult {
  status: 'positive' | 'negative' | 'neutral';
  label: string;
  risk: string;
  type?: string;
  detail?: string;
  therapy?: {
    name: string;
    dose: string;
    timing: string;
  };
}

export const PhLikeDecision = (selectedGenes: string[]): DecisionResult => {
  const JAK_STAT_LIST = ['CRLF2', 'EPOR', 'JAK1', 'JAK2', 'JAK3', 'TYK2', 'SH2B3', 'IL7R'];
  const ABL_CLASS_LIST = ['ABL1', 'ABL2', 'CSF1R', 'PDGFRA', 'PDGFRB', 'FGFR1'];
  
  const hasJakStat = selectedGenes.some(g => JAK_STAT_LIST.includes(g));
  const hasAblClass = selectedGenes.some(g => ABL_CLASS_LIST.includes(g));
  const hasOthers = selectedGenes.some(g => !JAK_STAT_LIST.includes(g) && !ABL_CLASS_LIST.includes(g));

  if (hasJakStat || hasAblClass || hasOthers) {
    let type = '其他 Ph-like';
    let therapy;

    if (hasAblClass) {
      type = 'ABL-class';
      therapy = {
        name: '达沙替尼 (Dasatinib)',
        dose: '60-80 mg/m².d',
        timing: '诱导缓解阶段(Induction)第3天起尽早加入'
      };
    } else if (hasJakStat) {
      type = 'JAK-STAT (如 CRLF2+)';
      therapy = {
        name: '鲁索利替尼 (Ruxolitinib)',
        dose: '40-50 mg/m².d (通常参考临床试验方案)',
        timing: '诱导缓解或巩固治疗早期加入'
      };
    }

    return {
      status: 'positive',
      label: 'Ph-like ALL 阳性',
      risk: 'IR/HR (中高危)',
      type: type,
      therapy: therapy
    };
  }

  return {
    status: 'negative',
    label: '非 Ph-like ALL',
    risk: '常规风险'
  };
};

export type GeneStatus = 'none' | 'del' | 'dup';

export interface IKZF1Status {
  ikzf1_del: boolean;
  cdkn2a_b_del: boolean;
  pax5_del: boolean;
  // PAR1 细化
  par1_genes: {
    CRLF2: GeneStatus;
    CSF2RA: GeneStatus;
    IL3RA: GeneStatus;
    P2RY8: GeneStatus;
    SHOX: GeneStatus;
  };
  ebf1_del: boolean;
  rb1_del: boolean;
  btg1_del: boolean;
  etv6_del: boolean;
  erg_del: boolean;
  dux4_rearrange: boolean;
  iamp21: boolean;
}

export const IKZF1PlusDecision = (status: IKZF1Status): DecisionResult => {
  const hasAnyPar1Del = Object.values(status.par1_genes).some(s => s === 'del');
  const hasAnyPar1Dup = Object.values(status.par1_genes).some(s => s === 'dup');

  // 1. iAMP21 判定 (高危)
  if (status.iamp21) {
    return {
      status: 'positive',
      label: 'iAMP21 阳性',
      risk: 'HR (高危)',
      detail: 'NCCN-2024 指南标准：RUNX1 FISH探针信号≥5个或≥3个RUNX1扩增信号聚集。预后不良。'
    };
  }

  // 2. ERG 缺失或 DUX4 重排的保护作用 (Leukemia 2014)
  if (status.erg_del || status.dux4_rearrange) {
    return {
      status: 'negative',
      label: status.erg_del ? '伴 ERG 缺失 (保护因素)' : '伴 DUX4 重排 (预后良好)',
      risk: 'Standard/Low (标/低危)',
      detail: '研究显示 ERG 缺失患者预后良好，即使同时有 IKZF1 突变，预后仍较好 (Leukemia 2014)。'
    };
  }

  // 3. IKZF1 PLUS 定义 (Blood 2015)
  // 定义: IKZF1 del 同时合并 CDKN2A/B、PAX5 或 PAR1 缺失，且无 ERG 缺失。
  const ikzf1PlusCoDels = status.cdkn2a_b_del || status.pax5_del || hasAnyPar1Del;
  if (status.ikzf1_del && ikzf1PlusCoDels) {
    return {
      status: 'positive',
      label: 'IKZF1 PLUS',
      risk: 'HR (高危)',
      detail: '符合 IKZF1 del 伴随 CDKN2A/B、PAX5 或 PAR1 缺失。预后较单纯缺失更差。',
      therapy: {
        name: '化疗方案强化',
        dose: '建议按高危组(HR)方案执行',
        timing: '高危IKZF1 PLUS，考虑短期强化的诱导和巩固方案，并密切监测MRD。'
      }
    };
  }

  // 4. GEN-PR 预后组 (Blood 2014)
  // 定义: IKZF1, PAR1, EBF1, RB1 任何一个缺失均提示预后较差。
  const isGenPR = status.ikzf1_del || hasAnyPar1Del || status.ebf1_del || status.rb1_del;
  if (isGenPR) {
    return {
      status: 'positive',
      label: 'GEN-PR 预后不良组',
      risk: 'IR/HR (中高危)',
      detail: 'Blood 2014: IKZF1, PAR1, EBF1, RB1 中任何一个缺失均提示预后较差。'
    };
  }

  // 5. BTG1 + IKZF1 双缺失 (Blood 2015)
  if (status.ikzf1_del && status.btg1_del) {
    return {
      status: 'positive',
      label: 'IKZF1 + BTG1 双缺失',
      risk: 'HR (极高危)',
      detail: 'BTG1 缺失是 GC 治疗反应的决定因子。双缺失预后较单纯缺失显著恶化。'
    };
  }

  // 6. 仅有重复 (Duplication) 处理
  if (hasAnyPar1Dup && !hasAnyPar1Del && !status.ikzf1_del) {
    return {
      status: 'neutral',
      label: 'PAR1 重复 (无显著意义)',
      risk: '常规评估',
      detail: 'PAR1 区域的重复通常无意义，因为它与 ALL 的发病和预后没有直接关联。'
    };
  }

  // 7. ETV6 缺失 (BJLH 2011)
  if (status.etv6_del) {
    return {
      status: 'negative',
      label: 'ETV6 缺失',
      risk: 'Standard/Low (较好)',
      detail: '在 ETV6-RUNX1 阳性 ALL 中，ETV6 基因缺失通常预示更好的预后。'
    };
  }

  // 8. 单纯 IKZF1 缺失 (Leukemia 2015)
  if (status.ikzf1_del) {
    return {
      status: 'positive',
      label: 'IKZF1 缺失 (Simple)',
      risk: 'IR (中危)',
      detail: 'IKZF1 基因缺失在 ALL 中预后不良 (NEJM 2009)，但不同类型的预后具有可变性。'
    };
  }

  return {
    status: 'neutral',
    label: '未见高危基因缺失',
    risk: '常规风险评估'
  };
};
