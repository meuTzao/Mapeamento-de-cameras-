
import React from 'react';
import { Camera as CameraIcon, FilePlus, FolderOpen, Eye } from 'lucide-react';

interface LandingPageProps {
  onCreate: () => void;
  onOpen: () => void;
  onView: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onCreate, onOpen, onView }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
      <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-blue-500/20 mb-8 shadow-2xl shadow-blue-500/10">
          <CameraIcon className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-4 flex items-center gap-2">
          SECURITY<span className="text-blue-500">CAM</span> <span className="font-light text-slate-400">PRO</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md text-center leading-relaxed">
          Gestão e posicionamento inteligente de câmeras para a sua empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card 
          icon={<FilePlus className="w-8 h-8 text-blue-400" />}
          title="Novo Projeto"
          description="Selecione um mapa e comece o planejamento do zero."
          onClick={onCreate}
        />
        <Card 
          icon={<FolderOpen className="w-8 h-8 text-emerald-400" />}
          title="Abrir Projeto"
          description="Carregue um arquivo .json para continuar editando."
          onClick={onOpen}
        />
        <Card 
          icon={<Eye className="w-8 h-8 text-amber-400" />}
          title="Apenas Visualizar"
          description="Explore o mapa e as informações sem realizar alterações."
          onClick={onView}
        />
      </div>

      <div className="mt-20 text-slate-600 text-[10px] tracking-[0.2em] font-bold uppercase">
        v3.0 Enterprise - PT-BR
      </div>
    </div>
  );
};

const Card: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900/60 hover:border-blue-500/40 transition-all duration-300 group text-left flex flex-col gap-4 shadow-xl hover:shadow-blue-500/5 active:scale-[0.98]"
  >
    <div className="p-3 bg-slate-950 rounded-xl group-hover:scale-110 transition-transform duration-300 w-fit border border-slate-800">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-500 leading-snug text-sm">{description}</p>
    </div>
  </button>
);

export default LandingPage;
