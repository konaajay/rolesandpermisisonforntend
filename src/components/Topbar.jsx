import { useState } from 'react';
import { Bell, Search, Menu, X, Moon, Sun, LayoutDashboard, Users, ShoppingCart, FileText, CreditCard, TrendingUp, ShieldAlert } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/vendor-dashboard/analytics', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor-dashboard/vendors', label: 'Vendors', icon: Users },
  { path: '/vendor-dashboard/assets', label: 'Assets', icon: ShoppingCart },
  { path: '/vendor-dashboard/contracts', label: 'Contracts', icon: FileText },
  { path: '/vendor-dashboard/invoices', label: 'Invoices', icon: CreditCard },
  { path: '/vendor-dashboard/performance', label: 'Performance', icon: TrendingUp },
  { path: '/vendor-dashboard/risk-compliance', label: 'Risk & Compliance', icon: ShieldAlert },
];

const Topbar = () => {
  const { searchQuery, setSearchQuery, theme, toggleTheme, currentUser } = useAppStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex flex-col w-full z-20 sticky top-0 transition-colors duration-300 relative">
      <div className="h-16 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-2 mr-6">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors mr-1"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent hidden sm:block">
            VendorOS
          </span>
        </div>

        <div className="flex items-center flex-1 max-w-xl hidden md:block px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search vendors, POs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 w-full transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="relative p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
          </button>

          <div className="flex items-center space-x-3 pl-2 sm:pl-4 sm:border-l border-slate-800 relative group">
            <div className="text-right hidden lg:block">
              <div className="text-sm font-medium text-slate-200">{currentUser || 'Guest'}</div>
              <div className="text-xs text-slate-500">Procurement Manager</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 cursor-pointer">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border border-slate-700/50">
                <span className="text-sm font-semibold text-slate-200">
                  {currentUser ? currentUser.substring(0, 2).toUpperCase() : 'G'}
                </span>
              </div>
            </div>

            {/* Logout Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <NavLink 
                to="/dashboard"
                className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors border-b border-slate-800"
              >
                Switch to Platform
              </NavLink>
              <button 
                onClick={() => {
                  useAppStore.getState().logout();
                }}
                className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search vendors, POs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950/50 border border-slate-800 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 w-full transition-all placeholder:text-slate-600"
          />
        </div>
      </div>
      
      {/* Navigation Bar (Tablet / Desktop) */}
      <div className="hidden md:flex overflow-x-auto custom-scrollbar border-t border-slate-800/50">
        <div className="flex space-x-2 py-2 px-4 mx-auto min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-cyan-500 font-medium border border-cyan-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' 
                      : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} className="mr-2 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col px-4 py-3 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 space-y-2 shadow-2xl absolute w-full top-full left-0 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-cyan-500 font-medium border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} className="mr-3 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Topbar;
