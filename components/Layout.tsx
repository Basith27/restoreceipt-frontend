import React, { useState } from 'react';
import { AppView, Outlet } from '../types';
import { 
  LayoutDashboard, 
  Camera, 
  ListTodo, 
  FileSpreadsheet, 
  Settings, 
  Store, 
  ChevronDown,
  Bell,
  Menu,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const outlets: Outlet[] = [
  { id: '1', name: 'Downtown Kitchen', location: 'City Center' },
  { id: '2', name: 'Airport Branch', location: 'Terminal 2' },
];

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [selectedOutlet, setSelectedOutlet] = useState(outlets[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => {
          setView(view);
          setSidebarOpen(false);
        }}
        className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm
          ${isActive 
            ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200/50' 
            : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}
      >
        <Icon size={20} className={`transition-colors ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`fixed md:relative z-40 bg-[#FBFBFD] border-r border-slate-200/60 h-full w-72 transition-transform duration-300 ease-out transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-xl md:shadow-none`}>
        
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
              <span className="text-xl">R</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900 leading-none">RestoReceipt</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Enterprise Edition</p>
            </div>
          </div>

          {/* Outlet Switcher in Sidebar for Desktop */}
          <div className="relative group">
            <button className="w-full bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-orange-300 transition-colors text-left">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Store size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Current Outlet</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{selectedOutlet.name}</p>
                </div>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50">
               {outlets.map(o => (
                 <button 
                  key={o.id} 
                  onClick={() => setSelectedOutlet(o)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                 >
                   {o.name}
                 </button>
               ))}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</div>
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={AppView.CAPTURE} icon={Camera} label="Upload Receipts" />
          <NavItem view={AppView.LEDGER} icon={ListTodo} label="Ledger & Expenses" />
          <NavItem view={AppView.EXPORT} icon={FileSpreadsheet} label="Accounting Export" />
        </nav>

        <div className="p-4 border-t border-slate-200/60 space-y-1">
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-colors font-medium text-sm">
             <Settings size={20} className="text-slate-400" /> Settings
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm">
             <LogOut size={20} className="text-red-400" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full h-full">
        {/* Top Bar - Simplified for Desktop, functional for Mobile */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 md:px-10 shrink-0 z-30 sticky top-0">
           <div className="flex items-center gap-4 md:hidden">
             <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
               <Menu />
             </button>
             <span className="font-bold text-lg text-slate-900">RestoReceipt</span>
           </div>

           {/* Desktop Breadcrumbs / Context */}
           <div className="hidden md:flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                {currentView.toLowerCase().replace('_', ' ')}
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
           </div>

           <div className="flex items-center gap-4">
             <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
               <Bell size={20} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
             <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-800">Alex Morgan</p>
                  <p className="text-xs text-slate-500 font-medium">Kitchen Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
                </div>
             </div>
           </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden h-[88px] bg-white border-t border-slate-200 flex items-start justify-around px-6 pt-4 shrink-0 z-30 pb-safe">
           <button 
             onClick={() => setView(AppView.DASHBOARD)} 
             className={`flex flex-col items-center gap-1 ${currentView === AppView.DASHBOARD ? 'text-orange-600' : 'text-slate-400'}`}
           >
             <LayoutDashboard size={24} strokeWidth={currentView === AppView.DASHBOARD ? 2.5 : 2} />
             <span className="text-[10px] font-medium">Home</span>
           </button>
           
           <div className="relative -top-8">
             <button 
              onClick={() => setView(AppView.CAPTURE)}
              className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform border-4 border-[#F8F9FC]"
             >
               <Camera size={28} />
             </button>
           </div>

           <button 
             onClick={() => setView(AppView.LEDGER)} 
             className={`flex flex-col items-center gap-1 ${currentView === AppView.LEDGER ? 'text-orange-600' : 'text-slate-400'}`}
           >
             <ListTodo size={24} strokeWidth={currentView === AppView.LEDGER ? 2.5 : 2} />
             <span className="text-[10px] font-medium">Ledger</span>
           </button>
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
