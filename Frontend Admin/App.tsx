
import React, { useState, useEffect, useCallback } from 'react';
import { Permissions, PermissionKey, RequestStatus } from './types';
import { COLORS } from './constants';
import PermissionRow from './components/PermissionRow';
import { ConfigService } from './services/ConfigService';

const App: React.FC = () => {
  const [permissions, setPermissions] = useState<Permissions>({
    copy: false,
    paste: false,
    screenshot: false,
    file_download: false,
    print: false,
    usb: false,
    git_clone: false,
    log_events: true,
    kill_switch: false,
    internet: true
  });
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      setStatus(RequestStatus.LOADING);
      try {
        const data = await ConfigService.fetchConfig();
        setPermissions(data.permissions);
        setVersion(data.config_version);
        setStatus(RequestStatus.IDLE);
      } catch (err) {
        setErrorMsg("Failed to connect to endpoint server.");
        setStatus(RequestStatus.ERROR);
      }
    };
    loadData();
  }, []);

  const handleToggle = useCallback(async (key: PermissionKey, value: boolean) => {
    // Optimistic UI update
    const updatedPermissions = { ...permissions, [key]: value };
    const prevPermissions = { ...permissions };
    
    setPermissions(updatedPermissions);
    setStatus(RequestStatus.LOADING);
    setErrorMsg(null);

    try {
      const result = await ConfigService.updateConfig(updatedPermissions, version);
      setVersion(result.config_version);
      setStatus(RequestStatus.SUCCESS);
      showToast();
    } catch (err) {
      // Rollback on failure
      setPermissions(prevPermissions);
      setErrorMsg(err instanceof Error ? err.message : "Internal Server Error");
      setStatus(RequestStatus.ERROR);
    }
  }, [permissions, version]);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const openGrafana = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('http://localhost:3000', '_blank');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none" style={{ backgroundColor: COLORS.bg }}>
      {/* Windows Style Header */}
      <header className="bg-white border-b border-[#DADDE1] px-6 py-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#2C3E50] rounded-sm flex items-center justify-center text-white font-bold text-xs">
                ITDR
            </div>
            <div>
                <h1 className="text-lg font-bold text-[#2C3E50] leading-none">Admin Dashboard</h1>
                <p className="text-[10px] text-[#7F8C8D] mt-1 uppercase tracking-wider">Insider Threat Detection & Response System</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="text-[10px] text-[#7F8C8D] uppercase">Config Version</p>
                <p className="text-sm font-mono font-bold text-[#2C3E50]">v{version}.0.4</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status === RequestStatus.LOADING ? 'bg-amber-400 animate-pulse' : 'bg-[#2ECC71]'}`}></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        
        {/* Left Panel - Permissions List */}
        <section className="flex-1 flex flex-col bg-white border border-[#DADDE1] rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DADDE1] bg-gray-50">
            <h2 className="text-[#2C3E50] font-bold text-sm uppercase tracking-tight">System Security Permissions</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
            <div className="max-w-2xl mx-auto">
              {(Object.keys(permissions) as PermissionKey[]).map((key) => (
                <PermissionRow
                  key={key}
                  id={key}
                  value={permissions[key]}
                  onToggle={handleToggle}
                  disabled={status === RequestStatus.LOADING}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel - Visualization Card */}
        <aside className="w-[320px] space-y-6">
          <div className="bg-white border border-[#DADDE1] rounded-lg shadow-sm p-6">
            <div className="mb-4">
                <h2 className="text-[#2C3E50] font-bold text-lg">Grafana Visualization</h2>
                <div className="w-12 h-1 bg-[#2C3E50] mt-1"></div>
            </div>
            <p className="text-[#7F8C8D] text-sm leading-relaxed mb-6">
              Access the real-time behavioral analytics engine to monitor endpoint anomalies and triggered alerts based on current permissions.
            </p>
            
            <div className="bg-[#F5F7FA] border border-[#DADDE1] rounded p-4 mb-6">
                <p className="text-[10px] text-[#7F8C8D] uppercase font-bold mb-1">Local Server Address</p>
                <a 
                    href="https://localhost:3000" 
                    onClick={openGrafana}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center"
                >
                    https://localhost:3000
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>

            <button 
                onClick={openGrafana}
                className="w-full bg-[#2C3E50] text-white py-2.5 rounded font-medium text-sm hover:bg-[#34495E] transition-colors flex items-center justify-center"
            >
                Launch Visualizer
            </button>
          </div>

          <div className="bg-white border border-[#DADDE1] rounded-lg shadow-sm p-6">
             <h3 className="text-[#2C3E50] font-bold text-sm mb-2">Endpoint Status</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F8C8D]">Connected Nodes</span>
                    <span className="font-bold">42 Active</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2ECC71] w-[85%] h-full"></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F8C8D]">Policy Sync Delay</span>
                    <span className="font-bold text-[#2ECC71]">12ms</span>
                </div>
             </div>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="bg-white border-t border-[#DADDE1] px-4 py-1.5 flex justify-between items-center text-[11px] text-[#7F8C8D]">
        <div className="flex items-center space-x-4">
            <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71] mr-1.5"></span>
                Server Online: https://localhost:8889
            </span>
            <span className="border-l border-[#DADDE1] pl-4">
                Session: Admin_Svc_01
            </span>
        </div>
        <div className="flex items-center">
            {errorMsg && (
                <span className="text-[#E74C3C] font-bold mr-4 animate-pulse flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errorMsg}
                </span>
            )}
            <span>MSVC Toolchain 14.3 | Qt 6.5.0 Simulator</span>
        </div>
      </footer>

      {/* Success Toast */}
      {toastVisible && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#2ECC71] text-white px-6 py-3 rounded-md shadow-lg border border-white/20 flex items-center space-x-3 z-50 animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span className="font-bold">Config updated successfully on central server</span>
        </div>
      )}

      {/* Loading Overlay */}
      {status === RequestStatus.LOADING && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-40">
              <div className="bg-white p-4 rounded-lg shadow-xl border border-[#DADDE1] flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-[#2C3E50] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-[#2C3E50]">Writing config.json...</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
