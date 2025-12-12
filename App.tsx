import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Layers, 
  Ruler, 
  ChevronDown,
  ArrowDown,
  PackageCheck,
  Scale,
  Settings2,
  Container,
  Trophy,
  Activity,
  Zap,
  Barcode
} from 'lucide-react';
import { InputGroup } from './components/InputGroup';
import { Box3DPreview } from './components/Box3DPreview';
import { BoxData, HierarchyResults, MassUnit, InputMassUnit } from './types';

const App: React.FC = () => {
  // UI State
  const [outputUnit, setOutputUnit] = useState<MassUnit>('kg');

  // Data State
  const [data, setData] = useState<BoxData>({
    weightType: 'net',
    inputValue: '',
    inputUnit: 'g', // Default input unit
    pcsPerMaster: '',
    masterTare: 2000,
    hasInnerCarton: false,
    innerCartonsPerMaster: '',
    calculateVolume: true, // Defaulting to true so the big preview has data initially
    length: '',
    width: '',
    height: ''
  });

  // Results State
  const [results, setResults] = useState<HierarchyResults>({
    unit: { net: 0, gross: 0, pcs: 1 },
    master: { net: 0, gross: 0, pcs: 0 }
  });

  // Calculation Logic
  useEffect(() => {
    // Convert Input Value based on Input Unit to Grams for calculation
    let rawVal = typeof data.inputValue === 'number' ? data.inputValue : 0;
    if (data.inputUnit === 'kg') {
      rawVal = rawVal * 1000;
    }

    const val = rawVal;
    const pcsMaster = typeof data.pcsPerMaster === 'number' && data.pcsPerMaster > 0 ? data.pcsPerMaster : 1;
    const tare = typeof data.masterTare === 'number' ? data.masterTare : 0;
    
    let unitNet = 0;
    let unitGross = 0;
    let masterNet = 0;
    let masterGross = 0;

    if (data.weightType === 'net') {
      unitNet = val;
      masterNet = unitNet * pcsMaster;
      masterGross = masterNet + tare;
      unitGross = masterGross / pcsMaster;
    } else {
      unitGross = val;
      masterGross = unitGross * pcsMaster;
      masterNet = Math.max(0, masterGross - tare);
      unitNet = masterNet / pcsMaster;
    }

    let innerResult: { net: number; gross: number; pcs: number } | undefined = undefined;
    if (data.hasInnerCarton && typeof data.innerCartonsPerMaster === 'number' && data.innerCartonsPerMaster > 0) {
      const pcsInner = pcsMaster / data.innerCartonsPerMaster;
      const innerNet = unitNet * pcsInner;
      const innerGross = unitGross * pcsInner; 

      innerResult = {
        net: innerNet,
        gross: innerGross,
        pcs: pcsInner
      };
    }

    let masterCbm = 0;
    if (data.calculateVolume) {
      const l = typeof data.length === 'number' ? data.length : 0;
      const w = typeof data.width === 'number' ? data.width : 0;
      const h = typeof data.height === 'number' ? data.height : 0;
      masterCbm = (l * w * h) / 1000000;
    }

    setResults({
      unit: { net: unitNet, gross: unitGross, pcs: 1 },
      inner: innerResult,
      master: { net: masterNet, gross: masterGross, pcs: pcsMaster, cbm: masterCbm }
    });

  }, [data]);

  const handleInputChange = (field: keyof BoxData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const displayValue = (grams: number) => {
    let val = grams;
    let unitLabel = 'g';
    let decimals = 0;

    if (outputUnit === 'kg') {
      val = grams / 1000;
      unitLabel = 'kg';
      decimals = 3;
    }
    
    if (!isFinite(grams)) {
      return { value: '0', unit: unitLabel };
    }

    return {
      value: new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(val),
      unit: unitLabel
    };
  };

  const formatCbm = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-200 font-sans pb-32 selection:bg-[#FFC72C] selection:text-black relative overflow-x-hidden">
      
      {/* 1. BACKGROUND GRID & DECORATION */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Neutral Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Top spotlight effect - Pure Gray */}
        <div className="absolute left-0 top-0 w-full h-[500px] bg-gradient-to-b from-[#1F1F1F] to-transparent opacity-80"></div>
        {/* Yellow Glow Blob - Reduced intensity */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#FFC72C] opacity-[0.03] rounded-full blur-[150px]"></div>
      </div>

      {/* 2. HEADER - Floating Neutral Glass Bar */}
      <header className="fixed top-6 left-4 right-4 md:left-10 md:right-10 z-50">
        <div className="max-w-7xl mx-auto bg-[#1F1F1F]/90 backdrop-blur-xl border border-[#FFC72C]/20 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-[#FFC72C] p-2.5 rounded-xl shadow-[0_0_15px_rgba(255,199,44,0.4)] border border-[#FFC72C]">
               <PackageCheck size={22} className="text-[#121212]" strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
               <h1 className="text-lg font-black tracking-tight text-white leading-none">
                 STAR<span className="text-[#FFC72C]">TOOLS</span>
               </h1>
               <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mt-1">
                 Calculadora Logística
               </span>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] border border-[#FFC72C]/20 shadow-inner">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Ready</span>
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 pt-32 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* === LEFT COLUMN: CONTROL PANEL === */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-[-10px] px-2 opacity-60">
            <Settings2 size={16} className="text-[#FFC72C]" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#FFC72C]">Input Parameters</span>
          </div>

          {/* MAIN INPUT CARD - NEON UPDATE */}
          <div className="bg-[#1F1F1F] rounded-[2rem] shadow-[0_0_20px_rgba(255,199,44,0.05)] border border-[#FFC72C]/30 relative overflow-hidden group hover:border-[#FFC72C]/50 transition-colors duration-500">
             {/* Hover Glow Effect */}
             <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FFC72C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
             
             {/* Content Layer */}
            <div className="relative p-8 space-y-8 bg-[#1F1F1F] rounded-[2rem]">
              
              {/* Toggle Switch Design */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 pl-1">Modo de Cálculo</span>
                <div className="bg-[#121212] p-1.5 rounded-2xl flex relative shadow-inner border border-neutral-800">
                  {/* Sliding Pill */}
                  <div 
                     className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#333333] rounded-xl shadow-lg border border-neutral-600 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${data.weightType === 'net' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                  >
                     {/* Pill Glow */}
                     <div className="absolute inset-0 bg-[#FFC72C] opacity-10 rounded-xl"></div>
                  </div>
                  
                  <button
                    onClick={() => handleInputChange('weightType', 'net')}
                    className={`flex-1 relative py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 z-10 ${
                      data.weightType === 'net' ? 'text-[#FFC72C]' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Net Weight
                  </button>
                  <button
                    onClick={() => handleInputChange('weightType', 'gross')}
                    className={`flex-1 relative py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 z-10 ${
                      data.weightType === 'gross' ? 'text-[#FFC72C]' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    Gross Weight
                  </button>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                 <div className="col-span-1 relative">
                   {/* Custom Input Wrapper for Unit Selection */}
                   <div className="relative">
                      <InputGroup
                        label="Peso Unitário"
                        // Sublabel removed here as we have the switch inside
                        value={data.inputValue}
                        onChange={(v) => handleInputChange('inputValue', v)}
                        icon={<Scale size={18} />}
                        placeholder="0"
                      />
                      {/* Unit Toggler Floating inside Input */}
                      <div className="absolute top-[36px] right-2 z-20 flex bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
                         {['g', 'kg'].map((u) => (
                           <button
                             key={u}
                             onClick={() => handleInputChange('inputUnit', u as InputMassUnit)}
                             className={`px-2 py-1 text-[9px] font-black uppercase rounded-[6px] transition-all ${
                               data.inputUnit === u ? 'bg-[#FFC72C] text-black shadow-sm' : 'text-neutral-400 hover:text-white'
                             }`}
                           >
                             {u}
                           </button>
                         ))}
                      </div>
                   </div>
                 </div>
                 <div className="col-span-1">
                  <InputGroup
                    label="Qtd por Master"
                    subLabel="(pcs)"
                    value={data.pcsPerMaster}
                    onChange={(v) => handleInputChange('pcsPerMaster', v)}
                    icon={<Box size={18} />}
                    placeholder="0"
                  />
                 </div>
                 <div className="col-span-2">
                   <InputGroup
                    label="Tara da Embalagem"
                    subLabel="Total em Gramas"
                    value={data.masterTare}
                    onChange={(v) => handleInputChange('masterTare', v)}
                    icon={<PackageCheck size={18} />}
                    placeholder="2000"
                  />
                 </div>
              </div>

              {/* Inner Carton Toggle */}
              <div className="pt-6 border-t border-dashed border-neutral-700">
                <label className="flex items-center gap-4 cursor-pointer group select-none">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" checked={data.hasInnerCarton} onChange={() => handleInputChange('hasInnerCarton', !data.hasInnerCarton)} />
                    <div className="w-12 h-7 bg-[#121212] border border-neutral-700 rounded-full peer-checked:bg-[#FFC72C] peer-checked:border-[#FFC72C] transition-all duration-300"></div>
                    <div className="absolute left-1 top-1 w-5 h-5 bg-neutral-400 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5 peer-checked:bg-[#121212] flex items-center justify-center">
                      {data.hasInnerCarton && <span className="text-[8px] font-bold text-[#FFC72C]">ON</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${data.hasInnerCarton ? 'text-white' : 'text-neutral-500'}`}>
                    Adicionar Inner Box?
                  </span>
                </label>

                {data.hasInnerCarton && (
                  <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                      <InputGroup
                        label="Inners por Master"
                        subLabel="Quantidade"
                        value={data.innerCartonsPerMaster}
                        onChange={(v) => handleInputChange('innerCartonsPerMaster', v)}
                        icon={<Layers size={18} />}
                        placeholder="0"
                      />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CBM Calculator Widget - Compact Inputs Only */}
          <div className={`rounded-[1.5rem] border transition-all duration-500 overflow-hidden ${data.calculateVolume ? 'bg-[#1F1F1F] border-[#FFC72C] shadow-[0_0_20px_rgba(255,199,44,0.15)]' : 'bg-[#1F1F1F] border-[#FFC72C]/30 hover:border-[#FFC72C]/50'}`}>
             <button 
               onClick={() => handleInputChange('calculateVolume', !data.calculateVolume)}
               className="w-full px-8 py-6 flex justify-between items-center text-left"
             >
                <div className="flex items-center gap-4">
                   <div className={`p-2.5 rounded-xl transition-colors duration-300 ${data.calculateVolume ? 'bg-[#FFC72C] text-black shadow-[0_0_15px_rgba(255,199,44,0.4)]' : 'bg-[#121212] text-neutral-500'}`}>
                      <Ruler size={20} />
                   </div>
                   <div>
                     <span className={`block text-base font-black tracking-tight ${data.calculateVolume ? 'text-white' : 'text-neutral-400'}`}>
                       Cálculo de CBM
                     </span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Dimensões Master</span>
                   </div>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${data.calculateVolume ? 'rotate-180 text-[#FFC72C]' : 'text-neutral-500'}`} />
             </button>
             
             {data.calculateVolume && (
               <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                 {/* Inputs now take full width since Preview moved to Right Column */}
                 <div className="grid grid-cols-3 gap-4">
                    <InputGroup label="Comp." subLabel="(cm)" value={data.length} onChange={(v) => handleInputChange('length', v)} icon={<span className="text-[10px] font-black">L</span>} placeholder="0" />
                    <InputGroup label="Larg." subLabel="(cm)" value={data.width} onChange={(v) => handleInputChange('width', v)} icon={<span className="text-[10px] font-black">W</span>} placeholder="0" />
                    <InputGroup label="Altura" subLabel="(cm)" value={data.height} onChange={(v) => handleInputChange('height', v)} icon={<span className="text-[10px] font-black">H</span>} placeholder="0" />
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* === RIGHT COLUMN: RESULTS & PREVIEW === */}
        <div className="lg:col-span-7 flex flex-col h-full relative">
          
          {/* Header & Unit Toggle */}
          <div className="flex items-center justify-between mb-8 pl-4 pr-1">
            <div className="flex items-center gap-2 opacity-60">
               <Trophy size={16} className="text-[#FFC72C]" />
               <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#FFC72C]">Logistics Report</span>
            </div>
            
            {/* Toggle Container - Neon Border */}
            <div className="bg-[#1F1F1F] rounded-xl p-1 shadow-sm border border-[#FFC72C]/20 flex">
              {['g', 'kg'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => setOutputUnit(unit as MassUnit)}
                  className={`relative px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-300 overflow-hidden ${
                    outputUnit === unit 
                    ? 'text-black shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-[#262626]'
                  }`}
                >
                  {outputUnit === unit && (
                    <div className="absolute inset-0 bg-[#FFC72C] z-0"></div>
                  )}
                  <span className="relative z-10">{unit}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* HERO PREVIEW SECTION (MOVED HERE) */}
          <div className="relative w-full h-[500px] bg-[#0A0A0A] rounded-[2.5rem] mb-10 overflow-hidden border border-[#FFC72C]/30 shadow-[0_0_40px_-5px_rgba(255,199,44,0.15)] group/hero">
             
             {/* Stage Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,199,44,0.08)_0%,transparent_70%)]"></div>
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFC72C]/50 to-transparent"></div>
             <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFC72C]/50 to-transparent"></div>
             
             {/* Tech Grid Background */}
             <div className="absolute inset-0 opacity-[0.07] bg-[size:40px_40px] bg-[linear-gradient(to_right,#FFC72C_1px,transparent_1px),linear-gradient(to_bottom,#FFC72C_1px,transparent_1px)]"></div>

             {/* The 3D Component */}
             <div className="relative z-10 w-full h-full">
                <Box3DPreview 
                  length={data.length} 
                  width={data.width} 
                  height={data.height}
                  pcsPerMaster={data.pcsPerMaster}
                  hasInnerCarton={data.hasInnerCarton}
                  innerCartonsPerMaster={data.innerCartonsPerMaster}
                />
             </div>

             {/* Overlay Decoration */}
             <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 bg-[#FFC72C] rounded-full animate-pulse shadow-[0_0_10px_#FFC72C]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Live Render</span>
             </div>
          </div>

          <div className="relative flex flex-col gap-6 flex-1">
            
            {/* The Timeline Connector (Dark Mode) */}
            <div className="absolute left-[35px] top-0 bottom-20 w-[2px] bg-gradient-to-b from-neutral-800 via-neutral-800 to-transparent z-0 opacity-50"></div>

            {/* 1. UNIT CARD - NEON UPDATE */}
            <div className="relative z-10 flex gap-8 items-stretch group">
               {/* Timeline Node */}
               <div className="w-[70px] flex-shrink-0 flex justify-center pt-8">
                  <div className="w-4 h-4 bg-[#1F1F1F] rounded-full border-[3px] border-[#FFC72C] shadow-[0_0_15px_rgba(255,199,44,0.4)] z-10 group-hover:scale-125 transition-transform duration-300"></div>
               </div>
               
               {/* Card Content */}
               <div className="flex-1 bg-[#1F1F1F] rounded-2xl p-6 shadow-[0_0_20px_rgba(255,199,44,0.05)] border border-[#FFC72C]/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,199,44,0.1)] hover:-translate-y-1 relative group-hover:border-[#FFC72C]/60">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight">Unitário</h4>
                      <p className="text-[10px] font-bold text-neutral-500 mt-1 uppercase tracking-widest">Produto Individual</p>
                    </div>
                    <div className="w-10 h-10 bg-[#121212] border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 group-hover:text-[#FFC72C] group-hover:border-[#FFC72C]/40 transition-all duration-300">
                       <span className="font-black text-xs">1</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                       <span className="block text-[9px] uppercase font-black text-neutral-500 tracking-[0.2em] mb-2">Net Weight</span>
                       <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-white tracking-tighter">{displayValue(results.unit.net).value}</span>
                          <span className="text-xs font-bold text-neutral-400 bg-neutral-800 px-1.5 rounded">{displayValue(results.unit.net).unit}</span>
                       </div>
                    </div>
                    <div>
                       <span className="block text-[9px] uppercase font-black text-neutral-500 tracking-[0.2em] mb-2">Gross Weight</span>
                       <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-white tracking-tighter">{displayValue(results.unit.gross).value}</span>
                          <span className="text-xs font-bold text-neutral-400 bg-neutral-800 px-1.5 rounded">{displayValue(results.unit.gross).unit}</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* 2. INNER CARD (Conditional) - NEON UPDATE */}
            {data.hasInnerCarton && results.inner && (
              <div className="relative z-10 flex gap-8 items-stretch group animate-in slide-in-from-left-4 fade-in duration-500">
                 <div className="w-[70px] flex-shrink-0 flex justify-center pt-8">
                    <div className="w-3 h-3 bg-neutral-700 rounded-full ring-4 ring-[#1F1F1F] z-10"></div>
                 </div>
                 
                 <div className="flex-1 bg-[#262626]/80 backdrop-blur rounded-2xl p-6 border border-[#FFC72C]/20 hover:border-[#FFC72C]/40 hover:bg-[#262626] hover:shadow-[0_0_20px_rgba(255,199,44,0.05)] transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-bold text-neutral-200 text-lg">Inner Box</h4>
                        <p className="text-[10px] font-bold text-neutral-500 mt-1 uppercase tracking-widest">Sub-Embalagem</p>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-neutral-200 leading-none block">{Math.round(results.inner.pcs)}</span>
                         <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Pcs</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                         <span className="block text-[9px] uppercase font-black text-neutral-500 tracking-[0.2em] mb-1">Net Weight</span>
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-neutral-300">{displayValue(results.inner.net).value}</span>
                            <span className="text-[10px] font-bold text-neutral-500">{displayValue(results.inner.net).unit}</span>
                         </div>
                      </div>
                      <div>
                         <span className="block text-[9px] uppercase font-black text-neutral-500 tracking-[0.2em] mb-1">Gross Weight</span>
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-neutral-300">{displayValue(results.inner.gross).value}</span>
                            <span className="text-[10px] font-bold text-neutral-500">{displayValue(results.inner.gross).unit}</span>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {/* 3. MASTER HERO CARD - NEON MONOLITH UPDATE */}
            <div className="relative z-10 flex gap-8 items-stretch pt-4 flex-1">
               {/* Timeline End Node */}
               <div className="w-[70px] flex-shrink-0 flex items-start justify-center pt-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#FFC72C] blur-md opacity-50 animate-pulse"></div>
                    <div className="w-6 h-6 bg-[#0A0A0A] rounded rotate-45 border-[3px] border-[#FFC72C] z-20 relative"></div>
                  </div>
               </div>
               
               {/* The Card - Uses Pure Dark Gray */}
               <div className="flex-1 bg-[#0A0A0A] text-white rounded-[2rem] shadow-[0_0_40px_-10px_rgba(255,199,44,0.1)] p-8 md:p-10 transition-all transform hover:scale-[1.01] duration-500 relative overflow-hidden group border border-[#FFC72C]/40">
                  
                  {/* Decorative Industrial Backgrounds */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-[#FFC72C] to-transparent opacity-[0.05] rounded-full blur-[100px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC72C] to-transparent opacity-40"></div>
                  
                  {/* Subtle Grid Texture on Card */}
                  <div className="absolute inset-0 opacity-[0.05]" 
                      style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #333 25%, #333 26%, transparent 27%, transparent 74%, #333 75%, #333 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}>
                  </div>

                  <div className="relative z-10">
                    
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-6">
                      <div className="flex items-center gap-4">
                         <div className="bg-white/5 p-3 rounded-xl border border-[#FFC72C]/30 shadow-[0_0_20px_rgba(255,199,44,0.1)]">
                           <Container size={32} className="text-[#FFC72C]" />
                         </div>
                         <div>
                           <h4 className="text-4xl font-black text-white tracking-tighter leading-none">MASTER</h4>
                           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 block mt-1">
                             Consolidação Final
                           </span>
                         </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="text-right px-4 border-r border-white/10">
                           <span className="block text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">Quantidade</span>
                           <span className="text-2xl font-bold text-white tabular-nums">{data.pcsPerMaster || 0}</span>
                           <span className="text-[10px] text-[#FFC72C] font-bold ml-1">PCS</span>
                        </div>
                        {data.calculateVolume && (
                           <div className="text-right">
                              <span className="block text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">Volume</span>
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-2xl font-bold text-white tabular-nums">{formatCbm(results.master.cbm || 0)}</span>
                                <span className="text-[10px] text-[#FFC72C] font-bold">M³</span>
                              </div>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Big Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
                      {/* Net Weight */}
                      <div className="group/stat relative pl-6 transition-all duration-300">
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-neutral-800 rounded-full overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-full bg-[#FFC72C] -translate-y-full group-hover/stat:translate-y-0 transition-transform duration-500"></div>
                        </div>
                        <span className="flex items-center gap-2 text-[10px] uppercase font-black text-neutral-500 mb-2 tracking-[0.2em] group-hover/stat:text-white transition-colors">
                          <Zap size={10} className="text-[#FFC72C]" /> Total Net Weight
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {displayValue(results.master.net).value}
                          </span>
                          <span className="text-lg font-bold text-[#FFC72C] mb-2">{displayValue(results.master.net).unit}</span>
                        </div>
                      </div>
                      
                      {/* Gross Weight */}
                      <div className="group/stat relative pl-6 transition-all duration-300">
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-neutral-800 rounded-full overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-full bg-neutral-200 -translate-y-full group-hover/stat:translate-y-0 transition-transform duration-500 delay-75"></div>
                        </div>
                        <span className="block text-[10px] uppercase font-black text-neutral-500 mb-2 tracking-[0.2em] group-hover/stat:text-white transition-colors">
                          Total Gross Weight
                        </span>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl md:text-6xl font-black tracking-tighter text-neutral-200 drop-shadow-2xl group-hover/stat:text-white transition-colors">
                            {displayValue(results.master.gross).value}
                          </span>
                          <span className="text-lg font-bold text-white/40 mb-2 group-hover/stat:text-white/80">{displayValue(results.master.gross).unit}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer Tech Details */}
                    <div className="mt-12 pt-6 border-t border-dashed border-white/10 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-300">
                      <Barcode className="text-white h-8 w-24" />
                      <div className="text-right">
                         <span className="block text-[9px] font-mono text-[#FFC72C]">STARTOOLS LOGISTICS ENGINE</span>
                         <span className="block text-[9px] font-mono text-white/50">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;