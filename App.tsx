
import React, { useState, useCallback, useRef } from 'react';
import LandingPage from './components/LandingPage';
import Editor from './components/Editor';
import { AppMode, Camera, Zone, CameraStatus, DVR, ProjectData } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('landing');
  const [requestedMode, setRequestedMode] = useState<AppMode>('editor');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dvr, setDvr] = useState<DVR | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = () => {
    fileInputRef.current?.click();
  };

  const onMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMapImage(event.target?.result as string);
        setCameras([]);
        setZones([]);
        setDvr(null);
        setMode('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const data: ProjectData = { cameras, zones, dvr, mapImage };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projeto_seguranca_${Date.now()}.json`;
    link.click();
  };

  const handleImport = () => {
    setRequestedMode('editor');
    importInputRef.current?.click();
  };

  const handleOpenViewer = () => {
    setRequestedMode('viewer');
    importInputRef.current?.click();
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data: ProjectData = JSON.parse(event.target?.result as string);
          setCameras(data.cameras || []);
          setZones(data.zones || []);
          setDvr(data.dvr || null);
          setMapImage(data.mapImage || null);
          setMode(requestedMode);
        } catch (err) {
          alert("Erro ao importar arquivo. Certifique-se de que é um JSON válido do SecurityCam Pro.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={onMapUpload} 
      />
      <input 
        type="file" 
        ref={importInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={onImportFile} 
      />

      {mode === 'landing' ? (
        <LandingPage 
          onCreate={handleCreateProject}
          onOpen={handleImport}
          onView={handleOpenViewer}
        />
      ) : (
        <Editor 
          mode={mode}
          cameras={cameras}
          zones={zones}
          dvr={dvr}
          mapImage={mapImage}
          onBack={() => setMode('landing')}
          onUpdateCameras={setCameras}
          onUpdateZones={setZones}
          onUpdateDVR={setDvr}
          onExport={handleExport}
          onToggleViewMode={() => setMode(mode === 'editor' ? 'viewer' : 'editor')}
        />
      )}
    </div>
  );
};

export default App;
