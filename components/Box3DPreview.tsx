import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Move3d, Box as BoxIcon, Scan, Package, Layers, Maximize2, Minimize2 } from 'lucide-react';

interface Box3DPreviewProps {
  length: number | '';
  width: number | '';
  height: number | '';
  pcsPerMaster?: number | '';
  hasInnerCarton?: boolean;
  innerCartonsPerMaster?: number | '';
}

// Helper types for dimensions
type Dimensions = { w: number; h: number; d: number; count: number };
type PackingLayout = { nx: number; ny: number; nz: number };

export const Box3DPreview: React.FC<Box3DPreviewProps> = ({ 
  length, 
  width, 
  height,
  pcsPerMaster,
  hasInnerCarton,
  innerCartonsPerMaster
}) => {
  const l = Number(length) || 10;
  const w = Number(width) || 10;
  const h = Number(height) || 10;
  
  // Total Products
  const totalPcs = Number(pcsPerMaster) || 1;
  // Total Inners
  const totalInners = hasInnerCarton ? (Number(innerCartonsPerMaster) || 0) : 0;
  // Products per Inner (if inner exists)
  const pcsPerInner = (hasInnerCarton && totalInners > 0) ? (totalPcs / totalInners) : 0;

  // View Mode: 0 = Master Only, 1 = Hierarchy (Exploded), 2 = Packed (X-Ray)
  const [viewMode, setViewMode] = useState<0 | 1 | 2>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [zoom, setZoom] = useState(0.9);
  const [isDragging, setIsDragging] = useState(false);
  
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalização de escala base (Dynamic for fullscreen)
  const MAX_SIZE = isFullscreen ? 280 : 120;
  const maxDim = Math.max(l, w, h);
  const scale = maxDim > 0 ? MAX_SIZE / maxDim : 1;

  // Dimensões Visuais Master (Pixels)
  const masterW = l * scale; 
  const masterH = h * scale; 
  const masterD = w * scale; 

  // --- ALGORITMO DE CORTE (PACKING LOGIC) ---
  const calculatePackingLayout = (parentW: number, parentH: number, parentD: number, count: number): PackingLayout => {
    if (count <= 1) return { nx: 1, ny: 1, nz: 1 };

    let bestLayout = { nx: 1, ny: 1, nz: count }; // fallback stack vertically
    let minDiff = Number.MAX_VALUE;

    for (let x = 1; x <= count; x++) {
      if (count % x === 0) {
        const remaining = count / x;
        for (let y = 1; y <= remaining; y++) {
          if (remaining % y === 0) {
            const z = remaining / y;
            
            // Dimensões resultantes
            const dimX = parentW / x;
            const dimY = parentH / y; 
            const dimZ = parentD / z;

            const diff = Math.abs(dimX - dimY) + Math.abs(dimY - dimZ) + Math.abs(dimZ - dimX);
            
            if (diff < minDiff) {
              minDiff = diff;
              bestLayout = { nx: x, ny: y, nz: z };
            }
          }
        }
      }
    }
    return bestLayout;
  };

  // 1. Calculate Inner Dimensions
  const innerLayout = calculatePackingLayout(masterW, masterH, masterD, totalInners);
  const innerDims = {
    w: masterW / innerLayout.nx,
    h: masterH / innerLayout.ny,
    d: masterD / innerLayout.nz
  };
  const innerRealDims = {
    l: (l / innerLayout.nx).toFixed(1),
    h: (h / innerLayout.ny).toFixed(1),
    w: (w / innerLayout.nz).toFixed(1)
  };

  // 2. Calculate Product Dimensions
  let productParentW = hasInnerCarton ? innerDims.w : masterW;
  let productParentH = hasInnerCarton ? innerDims.h : masterH;
  let productParentD = hasInnerCarton ? innerDims.d : masterD;
  let productCountToCheck = hasInnerCarton ? pcsPerInner : totalPcs;

  const productLayout = calculatePackingLayout(productParentW, productParentH, productParentD, productCountToCheck);
  const productDims = {
    w: productParentW / productLayout.nx,
    h: productParentH / productLayout.ny,
    d: productParentD / productLayout.nz
  };
  const productRealDims = {
    l: (Number(hasInnerCarton ? innerRealDims.l : l) / productLayout.nx).toFixed(1),
    h: (Number(hasInnerCarton ? innerRealDims.h : h) / productLayout.ny).toFixed(1),
    w: (Number(hasInnerCarton ? innerRealDims.w : w) / productLayout.nz).toFixed(1)
  };

  // --- POSITIONING LOGIC FOR EXPLODED VIEW ---
  let pivotShiftX = 0;
  const posInnerDefault = masterW/2 + innerDims.w/2 + 30;
  const posUnitDefault = hasInnerCarton && totalInners > 0
      ? (masterW/2 + innerDims.w + 60 + productDims.w/2) 
      : (masterW/2 + productDims.w/2 + 30);

  if (viewMode === 1 && hasInnerCarton && totalInners > 0) {
    pivotShiftX = -posInnerDefault;
  } else if (viewMode === 1) {
    pivotShiftX = -posUnitDefault / 2; 
  }

  // --- HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;
    setRotation(prev => ({ x: prev.x - deltaY * 0.5, y: prev.y + deltaX * 0.5 }));
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: WheelEvent) => {
    if (containerRef.current && containerRef.current.contains(e.target as Node)) {
      e.preventDefault();
      e.stopPropagation();
      setZoom(prev => Math.min(Math.max(prev - e.deltaY * 0.001, 0.4), 2.5));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', handleWheel); };
  }, [isFullscreen]); // Re-attach listener if portal status changes

  // --- RENDER HELPERS ---
  const RenderDimensions = ({ w, h, d, realL, realH, realW }: { w: number, h: number, d: number, realL: string|number, realH: string|number, realW: string|number }) => (
    <>
      <div className="absolute pointer-events-none" style={{ transform: `translate3d(-${w/2}px, ${h/2 + 10}px, ${d/2}px)` }}>
          <div className="dimension-line" style={{ width: `${w}px`, height: '1px' }}></div>
          <div className="dimension-tick" style={{ height: '4px', width: '1px', left: '0', top: '-2px' }}></div>
          <div className="dimension-tick" style={{ height: '4px', width: '1px', right: '0', top: '-2px' }}></div>
          <div className="dimension-label" style={{ left: '50%', top: '0', transform: 'translate(-50%, 4px) scale(0.8)' }}>{realL}</div>
      </div>
      <div className="absolute pointer-events-none" style={{ transform: `translate3d(${w/2 + 10}px, -${h/2}px, ${d/2}px)` }}>
          <div className="dimension-line" style={{ height: `${h}px`, width: '1px' }}></div>
          <div className="dimension-tick" style={{ width: '4px', height: '1px', top: '0', left: '-2px' }}></div>
          <div className="dimension-tick" style={{ width: '4px', height: '1px', bottom: '0', left: '-2px' }}></div>
          <div className="dimension-label" style={{ top: '50%', left: '0', transform: 'translate(6px, -50%) scale(0.8)' }}>{realH}</div>
      </div>
      <div className="absolute pointer-events-none" style={{ transform: `translate3d(${w/2}px, ${h/2 + 10}px, ${d/2}px) rotateY(90deg)`, transformOrigin: '0 0' }}>
          <div className="dimension-line" style={{ width: `${d}px`, height: '1px' }}></div>
          <div className="dimension-tick" style={{ height: '4px', width: '1px', left: '0', top: '-2px' }}></div>
          <div className="dimension-tick" style={{ height: '4px', width: '1px', right: '0', top: '-2px' }}></div>
          <div className="dimension-label" style={{ left: '50%', top: '0', transform: 'translate(-50%, 4px) scale(0.8)' }}>{realW}</div>
      </div>
    </>
  );

  const renderBox = (
    width: number, 
    height: number, 
    depth: number, 
    styleClass: string,
    offset: { x: number, y: number, z: number } = {x:0,y:0,z:0},
    key?: string | number,
    label?: string,
    showDims?: { realL: string|number, realH: string|number, realW: string|number }
  ) => {
    return (
      <div 
        key={key}
        className="cube-3d absolute"
        style={{ 
          width: 0, height: 0,
          transform: `translate3d(${offset.x}px, ${offset.y}px, ${offset.z}px)`
        }}
      >
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: width, height: height, marginLeft: -width/2, marginTop: -height/2, transform: `translateZ(${depth/2}px)` }} />
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: width, height: height, marginLeft: -width/2, marginTop: -height/2, transform: `rotateY(180deg) translateZ(${depth/2}px)` }} />
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: depth, height: height, marginLeft: -depth/2, marginTop: -height/2, transform: `rotateY(90deg) translateZ(${width/2}px)` }} />
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: depth, height: height, marginLeft: -depth/2, marginTop: -height/2, transform: `rotateY(-90deg) translateZ(${width/2}px)` }} />
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: width, height: depth, marginLeft: -width/2, marginTop: -depth/2, transform: `rotateX(90deg) translateZ(${height/2}px)` }} />
        <div className={`face absolute border box-border ${styleClass} transition-all duration-300`} style={{ width: width, height: depth, marginLeft: -width/2, marginTop: -depth/2, transform: `rotateX(-90deg) translateZ(${height/2}px)` }} />
        
        {label && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-[#121212] border border-[#FFC72C] text-[#FFC72C] px-2 py-0.5 rounded text-[8px] font-black tracking-wider whitespace-nowrap shadow-lg z-50 pointer-events-none"
            style={{ 
              transform: `translate3d(-50%, -${height/2 + 25}px, 0)` 
            }}
          >
            {label}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#FFC72C]"></div>
          </div>
        )}

        {showDims && (
          <RenderDimensions w={width} h={height} d={depth} {...showDims} />
        )}
      </div>
    );
  };

  // --- RENDER MODES ---
  const getGridCoords = (layout: PackingLayout, dims: {w:number, h:number, d:number}, parentOffset: {x:number, y:number, z:number}, parentSize: {w:number, h:number, d:number}) => {
    const coords = [];
    const startX = parentOffset.x - parentSize.w/2 + dims.w/2;
    const startY = parentOffset.y - parentSize.h/2 + dims.h/2;
    const startZ = parentOffset.z - parentSize.d/2 + dims.d/2;
    for(let x=0; x<layout.nx; x++) {
      for(let y=0; y<layout.ny; y++) {
        for(let z=0; z<layout.nz; z++) {
          coords.push({ x: startX + x * dims.w, y: startY + y * dims.h, z: startZ + z * dims.d });
        }
      }
    }
    return coords;
  }

  const getColorStyle = (idx: number, isProduct: boolean = false) => {
    const palette = [
      { border: 'border-emerald-500', bg: 'bg-emerald-500' }, 
      { border: 'border-amber-500', bg: 'bg-amber-500' },
      { border: 'border-violet-600', bg: 'bg-violet-600' },
      { border: 'border-red-500', bg: 'bg-red-500' },
      { border: 'border-cyan-400', bg: 'bg-cyan-400' },
      { border: 'border-pink-500', bg: 'bg-pink-500' },
    ];
    const theme = palette[idx % palette.length];
    const opacity = isProduct ? '40' : '10';
    const borderOpacity = '50';
    return `${theme.border}/${borderOpacity} ${theme.bg}/${opacity}`;
  };

  const renderPackedContent = () => {
    const boxes = [];
    const maxRender = 500; 
    const isPackingInners = hasInnerCarton && totalInners > 0;
    
    if (isPackingInners) {
      const innerCoords = getGridCoords(innerLayout, innerDims, {x:0,y:0,z:0}, {w:masterW, h:masterH, d:masterD});
      innerCoords.forEach((coord, idx) => {
        if (idx >= maxRender) return;
        boxes.push(renderBox(
          innerDims.w - 1, innerDims.h - 1, innerDims.d - 1,
          getColorStyle(idx, false), 
          coord,
          `inner-${idx}`
        ));
        const prodCoords = getGridCoords(productLayout, productDims, coord, {w: innerDims.w, h: innerDims.h, d: innerDims.d});
        prodCoords.forEach((pCoord, pIdx) => {
            if ((boxes.length) >= 800) return; 
            boxes.push(renderBox(
              productDims.w - 1, productDims.h - 1, productDims.d - 1,
              getColorStyle(idx, true), 
              pCoord,
              `prod-${idx}-${pIdx}`
            ));
        });
      });
    } else {
      const prodCoords = getGridCoords(productLayout, productDims, {x:0,y:0,z:0}, {w:masterW, h:masterH, d:masterD});
      prodCoords.forEach((coord, idx) => {
        if (idx >= maxRender) return;
        boxes.push(renderBox(
          productDims.w - 1, productDims.h - 1, productDims.d - 1,
          "border-emerald-400/40 bg-emerald-400/20",
          coord,
          `prod-${idx}`
        ));
      });
    }
    return boxes;
  };

  const Content = (
    <div 
      ref={containerRef}
      className={`${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] bg-[#0A0A0A] w-screen h-screen' 
          : 'w-full h-full min-h-[300px] relative'
      } flex flex-col items-center justify-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-all duration-300`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {isFullscreen && (
        <>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,199,44,0.08)_0%,transparent_70%)] pointer-events-none"></div>
           <div className="absolute inset-0 opacity-[0.07] bg-[size:40px_40px] bg-[linear-gradient(to_right,#FFC72C_1px,transparent_1px),linear-gradient(to_bottom,#FFC72C_1px,transparent_1px)] pointer-events-none"></div>
        </>
      )}

      {/* Controls Top Right */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-50 pointer-events-none">
        <button
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}
            className="pointer-events-auto p-2.5 bg-[#1F1F1F]/80 backdrop-blur-md rounded-xl border border-[#FFC72C]/20 text-[#FFC72C] hover:bg-[#FFC72C] hover:text-black transition-all shadow-lg group"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <div className="text-neutral-500 flex items-center gap-1 justify-end bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
           <Move3d size={12} />
           <span className="text-[9px] font-bold uppercase tracking-widest">Gire e Zoom</span>
        </div>
      </div>

      {/* Mode Selector Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="bg-[#121212]/90 backdrop-blur-md p-1.5 rounded-xl border border-neutral-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode(0); }}
            className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 0 ? 'bg-[#FFC72C] text-black shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            title="Apenas a caixa Master"
          >
            <BoxIcon size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">Master</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode(1); }}
            className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 1 ? 'bg-[#FFC72C] text-black shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            title="Comparativo de tamanhos lado a lado"
          >
            <Scan size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">Exploded</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setViewMode(2); }}
            className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${viewMode === 2 ? 'bg-[#FFC72C] text-black shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            title="Visualizar empilhamento interno"
          >
            <Layers size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider">X-Ray</span>
          </button>
        </div>
      </div>

      <style>
        {`
          .scene-3d { perspective: 1000px; }
          .cube-3d { transform-style: preserve-3d; }
          .face { backface-visibility: visible; box-shadow: 0 0 20px rgba(255, 199, 44, 0.02) inset; }
          .dimension-line { position: absolute; background-color: #FFC72C; opacity: 0.8; }
          .dimension-tick { position: absolute; background-color: #FFC72C; width: 6px; height: 1px; }
          .dimension-label {
            position: absolute; color: #FFC72C; font-family: monospace; font-size: 10px; font-weight: bold;
            text-shadow: 0 0 5px rgba(0,0,0,0.8); white-space: nowrap; background: rgba(0,0,0,0.6);
            padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(255, 199, 44, 0.3);
          }
        `}
      </style>
      
      <div className="scene-3d w-[200px] h-[200px] flex items-center justify-center relative">
        <div 
          className="cube-3d relative w-0 h-0 transition-transform duration-75"
          style={{ transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
            {/* --- MASTER BOX --- */}
            {renderBox(
              masterW, masterH, masterD, 
              viewMode === 2 
                ? "border-[#FFC72C]/30 bg-transparent border-dashed" 
                : (viewMode === 1 ? "border-[#FFC72C]/30 bg-[#FFC72C]/5" : "border-[#FFC72C] bg-[#FFC72C]/10"),
              { x: 0 + pivotShiftX, y: 0, z: 0 },
              "master-box",
              viewMode === 1 ? undefined : "MASTER",
              viewMode === 0 ? { realL: l, realH: h, realW: w } : undefined
            )}

            {/* --- MODE 1: HIERARCHY --- */}
            {viewMode === 1 && (
              <>
                {hasInnerCarton && totalInners > 0 && (
                  renderBox(
                    innerDims.w, innerDims.h, innerDims.d, 
                    "border-cyan-400/80 bg-cyan-400/10",
                    { x: posInnerDefault + pivotShiftX, y: 0, z: 0 },
                    "hierarchy-inner",
                    `${totalInners}x INNER`,
                    { realL: innerRealDims.l, realH: innerRealDims.h, realW: innerRealDims.w }
                  )
                )}
                {renderBox(
                  productDims.w, productDims.h, productDims.d, 
                  "border-emerald-400/80 bg-emerald-400/10",
                  { x: posUnitDefault + pivotShiftX, y: 0, z: 0 },
                  "hierarchy-unit",
                  `${Math.round(hasInnerCarton ? pcsPerInner : totalPcs)}x PRODUTO`,
                  { realL: productRealDims.l, realH: productRealDims.h, realW: productRealDims.w }
                )}
              </>
            )}

            {/* --- MODE 2: PACKED --- */}
            {viewMode === 2 && renderPackedContent()}
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return createPortal(Content, document.body);
  }

  return Content;
};