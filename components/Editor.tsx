
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera as CameraIcon, Home, Download, Plus, Layers, Eye, Maximize, Lock, Unlock, 
  ZoomIn, ZoomOut, X, Trash2, CheckCircle, Server, Info, Pencil, AlertTriangle
} from 'lucide-react';
import { Camera, Zone, CameraStatus, DVR, AppMode } from '../types';
import CameraFieldOfVision from './CameraFieldOfVision';

interface EditorProps {
  mode: AppMode;
  cameras: Camera[];
  zones: Zone[];
  dvr: DVR | null;
  mapImage: string | null;
  onBack: () => void;
  onUpdateCameras: (cams: Camera[]) => void;
  onUpdateZones: (zones: Zone[]) => void;
  onUpdateDVR: (dvr: DVR | null) => void;
  onExport: () => void;
  onToggleViewMode: () => void;
}

const Editor: React.FC<EditorProps> = ({ 
  mode, cameras, zones, dvr, mapImage, onBack, 
  onUpdateCameras, onUpdateZones, onUpdateDVR, onExport, onToggleViewMode 
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'camera' | 'zone' | 'dvr'>('select');
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.6 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggedCameraId, setDraggedCameraId] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'camera' | 'zone' } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isReadOnly = mode === 'viewer';

  // Bloqueia a ferramenta ativa se mudar para modo visualização
  useEffect(() => {
    if (isReadOnly) setActiveTool('select');
  }, [isReadOnly]);

  // --- CONTROLES DE ZOOM "AT CURSOR" ---
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = 0.15;
    const delta = e.deltaY > 0 ? -1 : 1;
    
    setViewport(prev => {
      const newZoom = Math.min(Math.max(0.05, prev.zoom + (delta * scaleFactor * prev.zoom)), 10);
      if (newZoom === prev.zoom) return prev;
      const ratio = newZoom / prev.zoom;
      const newX = mouseX - (mouseX - prev.x) * ratio;
      const newY = mouseY - (mouseY - prev.y) * ratio;
      return { x: newX, y: newY, zoom: newZoom };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => el?.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    if (activeTool === 'zone' && !isReadOnly) {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setDrawCurrent({ x, y });
    } else {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDrawing) {
      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      setDrawCurrent({ x, y });
    } else if (draggedCameraId && !isReadOnly) {
      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      
      onUpdateCameras(cameras.map(c => 
        c.id === draggedCameraId && !c.locked ? { ...c, x, y } : c
      ));
    } else if (isPanning) {
      setViewport(v => ({
        ...v,
        x: v.x + e.movementX,
        y: v.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      const width = Math.abs(drawCurrent.x - drawStart.x);
      const height = Math.abs(drawCurrent.y - drawStart.y);
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);

      if (width > 20 && height > 20) {
        const newZone: Zone = {
          id: `zone-${Date.now()}`,
          name: `Setor ${zones.length + 1}`,
          type: 'Geral',
          x, y, width, height,
          color: 'rgba(59, 130, 246, 0.2)'
        };
        onUpdateZones([...zones, newZone]);
        setSelectedZoneId(newZone.id);
        setActiveTool('select');
      }
      setIsDrawing(false);
    }
    setDraggedCameraId(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isPanning || isDrawing || draggedCameraId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    if (activeTool === 'camera' && !isReadOnly) {
      const newCam: Camera = {
        id: `cam-${Date.now()}`,
        name: `Câmera ${cameras.length + 1}`,
        x, y, rotation: 0, fov: 60, range: 150,
        status: CameraStatus.NORMAL,
        notes: '',
        locked: false
      };
      onUpdateCameras([...cameras, newCam]);
      setSelectedCameraId(newCam.id);
      setActiveTool('select');
    } else if (activeTool === 'dvr' && !isReadOnly) {
      onUpdateDVR({ x, y });
      setActiveTool('select');
    } else if (activeTool === 'select' && e.target === e.currentTarget) {
      setSelectedCameraId(null);
      setSelectedZoneId(null);
      setShowTooltip(null);
    }
  };

  const updateCamera = (updated: Camera) => {
    onUpdateCameras(cameras.map(c => c.id === updated.id ? updated : c));
  };

  const updateZone = (updated: Zone) => {
    onUpdateZones(zones.map(z => z.id === updated.id ? updated : z));
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'camera') {
      onUpdateCameras(cameras.filter(c => c.id !== confirmDelete.id));
      setSelectedCameraId(null);
    } else {
      onUpdateZones(zones.filter(z => z.id !== confirmDelete.id));
      setSelectedZoneId(null);
    }
    setConfirmDelete(null);
  };

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  return (
    <div className="flex flex-col h-full select-none text-slate-200">
      {/* HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Home className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <CameraIcon className="w-5 h-5 text-blue-500" />
            <div>
              <h1 className="text-sm font-bold">SecurityCam Manager</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                {isReadOnly ? 'MODO APENAS VISUALIZAÇÃO' : 'EDITOR DE PROJETO'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isReadOnly && (
            <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold border border-slate-700">
              <Download className="w-4 h-4" /> EXPORTAR JSON
            </button>
          )}
          <button 
            onClick={onToggleViewMode} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isReadOnly ? 'bg-amber-600 shadow-lg shadow-amber-600/20' : 'bg-slate-800 border border-slate-700'}`}
          >
            {isReadOnly ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isReadOnly ? 'ATIVAR EDIÇÃO' : 'APENAS VISUALIZAR'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden bg-slate-950">
        {!isReadOnly && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-40">
            <ToolBtn active={activeTool === 'select'} icon={<Maximize className="w-5 h-5" />} label="Mover / Selecionar" onClick={() => setActiveTool('select')} />
            <div className="h-px bg-slate-800 mx-2" />
            <ToolBtn active={activeTool === 'camera'} icon={<Plus className="w-5 h-5" />} label="Adicionar Câmera" onClick={() => setActiveTool('camera')} />
            <ToolBtn active={activeTool === 'zone'} icon={<Layers className="w-5 h-5" />} label="Mapear Setor (Desenhar)" onClick={() => setActiveTool('zone')} />
            <ToolBtn active={activeTool === 'dvr'} icon={<Server className="w-5 h-5" />} label="Posicionar DVR" onClick={() => setActiveTool('dvr')} />
          </div>
        )}

        {/* ÁREA DO MAPA */}
        <div 
          ref={containerRef}
          className={`flex-1 overflow-hidden relative ${isPanning ? 'cursor-grabbing' : isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        >
          <div 
            className="absolute transition-transform duration-75 origin-top-left"
            style={{ 
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            }}
          >
            <div className="relative shadow-2xl bg-slate-900" style={{ width: 4000, height: 3000 }}>
              {mapImage ? (
                <img src={mapImage} className="w-full h-full object-contain pointer-events-none opacity-90" alt="Mapa" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-4xl">
                  {isReadOnly ? 'Nenhuma planta carregada' : 'Selecione uma imagem de planta baixa'}
                </div>
              )}

              {isDrawing && (
                <div 
                  className="absolute border-2 border-blue-500 bg-blue-500/20 z-50 pointer-events-none"
                  style={{
                    left: Math.min(drawStart.x, drawCurrent.x),
                    top: Math.min(drawStart.y, drawCurrent.y),
                    width: Math.abs(drawCurrent.x - drawStart.x),
                    height: Math.abs(drawCurrent.y - drawStart.y),
                  }}
                />
              )}

              {zones.map(zone => (
                <div 
                  key={zone.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isReadOnly) setSelectedZoneId(zone.id);
                  }}
                  className={`absolute border flex flex-col items-center justify-center transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${selectedZoneId === zone.id && !isReadOnly ? 'ring-2 ring-white border-white' : 'border-dashed border-white/20'}`}
                  style={{ 
                    left: zone.x, top: zone.y, width: zone.width, height: zone.height, 
                    backgroundColor: zone.color
                  }}
                >
                  <span className="text-[12px] font-black text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm shadow-lg border border-white/10">{zone.name}</span>
                </div>
              ))}

              {dvr && (
                <div 
                  className={`absolute z-40 -translate-x-1/2 -translate-y-1/2 p-4 bg-amber-500 rounded-2xl shadow-2xl ${isReadOnly ? '' : 'cursor-move active:scale-110'} transition-transform`}
                  style={{ left: dvr.x, top: dvr.y }}
                >
                  <Server className="w-10 h-10 text-slate-950" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-xl border-2 border-slate-950/10 uppercase tracking-widest">DVR CENTRAL</div>
                </div>
              )}

              {cameras.map(camera => (
                <div key={camera.id} className="absolute z-30" style={{ left: camera.x, top: camera.y }}>
                  <CameraFieldOfVision rotation={camera.rotation} fov={camera.fov} range={camera.range} status={camera.status} />
                  
                  <div className="relative">
                    <button 
                      onMouseDown={(e) => {
                        if (!isReadOnly && !camera.locked) {
                          e.stopPropagation();
                          setDraggedCameraId(camera.id);
                          setSelectedCameraId(camera.id);
                          setShowTooltip(null);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isReadOnly) {
                          setShowTooltip(showTooltip === camera.id ? null : camera.id);
                        } else {
                          setSelectedCameraId(camera.id);
                          setShowTooltip(null);
                        }
                      }}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all -translate-x-1/2 -translate-y-1/2 border-[6px] border-slate-900 shadow-2xl
                        ${camera.status === CameraStatus.NORMAL ? 'bg-emerald-500' : ''}
                        ${camera.status === CameraStatus.MANUTENCAO ? 'bg-amber-500' : ''}
                        ${camera.status === CameraStatus.PROBLEMA ? 'bg-rose-500' : ''}
                        ${selectedCameraId === camera.id && !isReadOnly ? 'scale-125 ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}
                        ${camera.locked ? 'cursor-default' : 'cursor-move'}
                      `}
                    >
                      <CameraIcon className="w-6 h-6 text-slate-950" />
                      {camera.locked && (
                        <div className="absolute -top-1 -right-1 bg-slate-900 p-0.5 rounded-full border border-slate-700">
                          <Lock className="w-2.5 h-2.5 text-amber-500" />
                        </div>
                      )}
                    </button>

                    {showTooltip === camera.id && (
                      <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-in zoom-in-90 fade-in duration-300 z-[100]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-lg text-blue-400 leading-tight uppercase tracking-tight">{camera.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`w-2 h-2 rounded-full ${camera.status === CameraStatus.NORMAL ? 'bg-emerald-500 animate-pulse' : camera.status === CameraStatus.MANUTENCAO ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{camera.status}</span>
                            </div>
                          </div>
                          <button onClick={() => setShowTooltip(null)} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Observações Técnicas</label>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 italic min-h-[60px]">
                            {camera.notes || "Nenhuma ressalva cadastrada para este dispositivo."}
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <Info className="w-3.5 h-3.5" /> Informações do Ativo
                            </div>
                            <span className="text-[9px] font-mono text-slate-700">#{camera.id.split('-')[1]}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent border-t-slate-900" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR DE EDIÇÃO DE CÂMERA */}
        {selectedCamera && !isReadOnly && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 z-50 animate-in slide-in-from-right overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Configurar Câmera</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateCamera({ ...selectedCamera, locked: !selectedCamera.locked })}
                  className={`p-2 rounded-lg transition-all ${selectedCamera.locked ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title={selectedCamera.locked ? "Desbloquear Posição" : "Bloquear Posição"}
                >
                  {selectedCamera.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button onClick={() => setSelectedCameraId(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Dispositivo</label>
              <input 
                disabled={selectedCamera.locked}
                value={selectedCamera.name}
                onChange={(e) => updateCamera({ ...selectedCamera, name: e.target.value })}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all ${selectedCamera.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Operacional</label>
              <select 
                disabled={selectedCamera.locked}
                value={selectedCamera.status}
                onChange={(e) => updateCamera({ ...selectedCamera, status: e.target.value as CameraStatus })}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer ${selectedCamera.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {Object.values(CameraStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className={`space-y-6 py-4 ${selectedCamera.locked ? 'opacity-50 pointer-events-none' : ''}`}>
              <Slider label="DIREÇÃO (ROTAÇÃO)" value={selectedCamera.rotation} min={0} max={360} suffix="°" onChange={(v) => updateCamera({ ...selectedCamera, rotation: v })} />
              <Slider label="ABERTURA (FOV)" value={selectedCamera.fov} min={10} max={180} suffix="°" onChange={(v) => updateCamera({ ...selectedCamera, fov: v })} />
              <Slider label="ALCANCE VISUAL" value={selectedCamera.range} min={50} max={1500} suffix="px" onChange={(v) => updateCamera({ ...selectedCamera, range: v })} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações Técnicas</label>
              <textarea 
                disabled={selectedCamera.locked}
                value={selectedCamera.notes || ''}
                onChange={(e) => updateCamera({ ...selectedCamera, notes: e.target.value })}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none h-32 resize-none shadow-inner ${selectedCamera.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Adicione detalhes sobre o local, pontos cegos ou notas de manutenção..."
              />
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={() => setConfirmDelete({ id: selectedCamera.id, type: 'camera' })}
                className="w-full py-4 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir Câmera
              </button>
              <button onClick={() => setSelectedCameraId(null)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
                <CheckCircle className="w-4 h-4" /> Finalizar Edição
              </button>
            </div>
          </aside>
        )}

        {/* SIDEBAR DE EDIÇÃO DE ZONA */}
        {selectedZone && !isReadOnly && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 z-50 animate-in slide-in-from-right overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Mapear Setor</h3>
              <button onClick={() => setSelectedZoneId(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Setor / Área</label>
              <input 
                value={selectedZone.name}
                onChange={(e) => updateZone({ ...selectedZone, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: Banheiro, Cozinha, Recepção..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cor de Destaque</label>
              <div className="grid grid-cols-4 gap-2">
                {['rgba(59, 130, 246, 0.2)', 'rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(244, 63, 94, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)', 'rgba(100, 116, 139, 0.2)', 'rgba(255, 255, 255, 0.1)'].map(c => (
                  <button 
                    key={c}
                    onClick={() => updateZone({...selectedZone, color: c})}
                    className={`h-8 rounded-lg border-2 transition-all ${selectedZone.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={() => setConfirmDelete({ id: selectedZone.id, type: 'zone' })}
                className="w-full py-4 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Excluir Área
              </button>
              <button onClick={() => setSelectedZoneId(null)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all">
                <CheckCircle className="w-4 h-4" /> Salvar Setor
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/95 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-slate-800 shadow-2xl z-40">
        <button onClick={() => setViewport(v => ({...v, zoom: Math.max(0.05, v.zoom - 0.2)}))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"><ZoomOut className="w-5 h-5" /></button>
        <span className="text-[11px] font-black w-14 text-center text-blue-400 tracking-widest">{Math.round(viewport.zoom * 100)}%</span>
        <button onClick={() => setViewport(v => ({...v, zoom: Math.min(10, v.zoom + 0.2)}))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"><ZoomIn className="w-5 h-5" /></button>
        <div className="w-px h-6 bg-slate-800 mx-1" />
        <button onClick={() => setViewport({ x: 0, y: 0, zoom: 0.6 })} className="px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-slate-200">Resetar</button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6 mb-10">
              <div className="p-5 bg-rose-500/10 rounded-full border border-rose-500/20 shadow-inner">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Confirmar Exclusão</h2>
                <p className="text-slate-400 text-sm leading-relaxed px-4">
                  Tem certeza que deseja remover {confirmDelete.type === 'camera' ? 'esta câmera' : 'este setor'}? Esta ação removerá permanentemente os dados.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeleteConfirmed}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all text-xs shadow-xl shadow-rose-600/30 active:scale-95"
              >
                Sim, Remover Permanentemente
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black uppercase tracking-widest transition-all text-xs active:scale-95"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolBtn: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-xl transition-all group relative flex items-center justify-center ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {icon}
    <div className="absolute left-full ml-5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-[11px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
      {label}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-700" />
    </div>
  </button>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; suffix: string; onChange: (v: number) => void }> = ({ label, value, min, max, suffix, onChange }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-[9px] font-black text-slate-500 tracking-widest uppercase">{label}</label>
      <span className="text-[11px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg" />
  </div>
);

export default Editor;
