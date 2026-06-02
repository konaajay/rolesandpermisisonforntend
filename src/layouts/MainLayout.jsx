import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 transition-colors duration-300">
      <Topbar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent -z-10" />
          
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
