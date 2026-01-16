
import React, { useState } from 'react';
import { Camera as CameraIcon, FilePlus, Eye, FolderOpen, ImageIcon, ChevronRight, Layout, MapPin, Server, Type, Layers } from 'lucide-react';

interface LandingPageProps {
  onCreate: () => void;
  onOpen: () => void;
  onView: () => void;
  isMobile: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onCreate, onOpen, onView, isMobile }) => {
  const [showSubMenu, setShowSubMenu] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-4 lg:p-6 py-12 lg:py-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 overflow-y-auto">
      <div className="mb-8 lg:mb-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
        <div className="bg-slate-900/50 p-4 lg:p-6 rounded-[2rem] border border-blue-500/20 mb-8 shadow-2xl shadow-blue-500/10 relative shrink-0">
          <CameraIcon className="w-16 h-16 lg:w-24 lg:h-24 text-blue-500" />
          <div className="absolute -bottom-2 -right-2 bg-blue-600 w-8 h-8 rounded-full border-4 border-slate-950 flex items-center justify-center font-black text-[10px] text-white">PRO</div>
        </div>
        <h1 className="text-4xl xs:text-5xl lg:text-8xl font-black tracking-tighter mb-2 flex flex-wrap justify-center items-center gap-2 text-center uppercase text-white">
          RAY<span className="text-blue-500">CAM</span> <span className="font-light text-slate-400">PRO</span>
        </h1>
        <p className="text-blue-400/80 text-[10px] lg:text-sm font-black tracking-[0.4em] uppercase mb-8 animate-pulse text-center">
          feito por Anderson M.S
        </p>
        <p className="text-slate-400 text-xs lg:text-xl max-w-md text-center leading-relaxed px-4 font-medium opacity-80">
          Solução profissional para gestão e posicionamento estratégico de câmeras.
        </p>
      </div>

      {!showSubMenu ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12 lg:pb-0">
          <MenuCard 
            icon={<Eye className="w-10 h-10 lg:w-14 lg:h-14 text-amber-400" />}
            title="Visualizar Projeto"
            description="Abra um arquivo exportado (.json) apenas para consulta do mapa."
            onClick={onView}
            color="amber"
          />
          <MenuCard 
            icon={<FilePlus className="w-10 h-10 lg:w-14 lg:h-14 text-blue-400" />}
            title="Criar Novo Projeto"
            description="Inicie um novo planejamento ou continue um projeto anterior."
            onClick={() => setShowSubMenu(true)}
            color="blue"
          />
        </div>
      ) : (
        <div className="w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300 px-2 pb-12 lg:pb-0">
          <div className="bg-slate-900/40 border border-slate-800 p-6 lg:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center justify-between mb-8 lg:mb-12">
              <h2 className="text-xl lg:text-4xl font-black uppercase tracking-tight text-white">Configurar Projeto</h2>
              <button 
                onClick={() => setShowSubMenu(false)}
                className="text-slate-400 hover:text-white text-[10px] lg:text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
              >
                Voltar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-10 lg:mb-12">
              <ActionItem 
                icon={<ImageIcon className="w-6 h-6 text-blue-400" />}
                title="Novo Mapa"
                description="Carregar imagem de planta baixa"
                onClick={onCreate}
              />
              <ActionItem 
                icon={<FolderOpen className="w-6 h-6 text-emerald-400" />}
                title="Carregar Projeto"
                description="Continuar de onde você parou (.json)"
                onClick={onOpen}
              />
            </div>

            <div className="p-6 lg:p-8 bg-slate-950/50 rounded-3xl border border-slate-800/50">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Recursos Disponíveis</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <Feature label="Padrão de Edição" icon={<Layout className="w-3 h-3"/>} />
                <Feature label="Colocação de Câmeras" icon={<MapPin className="w-3 h-3"/>} />
                <Feature label="Marcação de Áreas" icon={<Layers className="w-3 h-3"/>} />
                <Feature label="Setar os Nomes" icon={<Type className="w-3 h-3"/>} />
                <Feature label="Onde fica o DVR" icon={<Server className="w-3 h-3"/>} />
                <Feature label="Campo de Visão" icon={<ChevronRight className="w-3 h-3"/>} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 lg:mt-16 text-slate-700 text-[10px] tracking-[0.4em] font-black uppercase text-center opacity-50 shrink-0">
        RAYCAM PRO v3.5 Enterprise
      </div>
    </div>
  );
};

const MenuCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void; color: 'blue' | 'amber' }> = ({ icon, title, description, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`bg-slate-900/40 border border-slate-800 p-8 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] hover:bg-slate-900/60 transition-all duration-300 group text-left flex flex-col gap-6 shadow-2xl active:scale-[0.98] ${color === 'blue' ? 'hover:border-blue-500/40' : 'hover:border-amber-500/40'}`}
  >
    <div className={`p-4 lg:p-6 bg-slate-950 rounded-[1.2rem] lg:rounded-[2rem] group-hover:scale-110 transition-all duration-500 w-fit border border-slate-800 shadow-inner`}>
      {icon}
    </div>
    <div>
      <h3 className="text-xl lg:text-4xl font-black mb-2 group-hover:text-white transition-colors uppercase tracking-tighter text-white">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-xs lg:text-base font-medium">{description}</p>
    </div>
  </button>
);

const ActionItem: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-slate-950/60 border border-slate-800 p-6 rounded-3xl hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-300 group text-left flex items-start gap-4"
  >
    <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-slate-800 border border-slate-800 transition-colors shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm lg:text-base font-black text-slate-200 uppercase tracking-tight mb-1 group-hover:text-white flex items-center gap-2">
        {title}
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
      </h4>
      <p className="text-slate-500 text-[11px] lg:text-xs leading-snug font-medium">{description}</p>
    </div>
  </button>
);

const Feature: React.FC<{ label: string; icon: React.ReactNode }> = ({ label, icon }) => (
  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-blue-400 transition-colors">
    <div className="w-5 h-5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
      {icon}
    </div>
    <span className="truncate">{label}</span>
  </div>
);

export default LandingPage;
