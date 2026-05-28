import { useState, useEffect } from 'react';
import { PlusCircle, Wallet, History, Home, BarChart2, Settings, Loader2, WifiOff } from 'lucide-react';
import { useAppData } from './hooks/useAppData';
import SetupScreen from './components/SetupScreen';
import AddExpense from './components/AddExpense';
import Balances from './components/Balances';
import HistoryTab from './components/History';
import Rent from './components/Rent';
import Reports from './components/Reports';
import SettingsTab from './components/Settings';
import { computeDebts } from './utils/balances';

const TABS = [
  { id: 'add',      label: 'إضافة',    Icon: PlusCircle },
  { id: 'balances', label: 'الأرصدة',  Icon: Wallet     },
  { id: 'history',  label: 'السجل',    Icon: History    },
  { id: 'rent',     label: 'الإيجار',  Icon: Home       },
  { id: 'reports',  label: 'التقارير', Icon: BarChart2  },
];

// ── Spinner screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 gap-4"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <Loader2 className="w-12 h-12 text-white animate-spin" />
      <p className="text-white text-lg font-bold">جارٍ تحميل البيانات…</p>
      <p className="text-teal-200 text-sm">يتم الاتصال بقاعدة البيانات</p>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 gap-5"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <WifiOff className="w-14 h-14 text-red-400" />
      <div className="text-center max-w-sm">
        <p className="text-xl font-bold text-gray-800 mb-2">تعذّر الاتصال</p>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const {
    roommates, expenses, settlements, rentData,
    loading, error, loadAll,
    setupRoommates, addExpense, deleteExpense,
    addSettlement, updateRentData, reset,
  } = useAppData();

  const [tab, setTab]                   = useState('add');
  const [showSettings, setShowSettings] = useState(false);
  const [opError, setOpError]           = useState(null);

  const [installPrompt, setInstallPrompt]       = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        setInstallPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  const withErrorHandling = (fn) => async (...args) => {
    try {
      setOpError(null);
      await fn(...args);
    } catch (err) {
      console.error(err);
      setOpError('فشلت العملية. تحقق من اتصالك بالإنترنت وحاول مجدداً.');
      setTimeout(() => setOpError(null), 5000);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={loadAll} />;

  if (!roommates) {
    return <SetupScreen onSetup={withErrorHandling(setupRoommates)} />;
  }

  const activeDebts = computeDebts(roommates, expenses, settlements);

  const handleAddExpense    = withErrorHandling(addExpense);
  const handleDeleteExpense = withErrorHandling(deleteExpense);
  const handleSettle        = withErrorHandling(addSettlement);
  const handleUpdateRent    = withErrorHandling(updateRentData);
  const handleReset         = withErrorHandling(async () => {
    await reset();
    window.location.reload();
  });

  // ── Sidebar nav item ────────────────────────────────────────────────────────
  const SidebarItem = ({ id, label, Icon }) => {
    const active    = tab === id && !showSettings;
    const showBadge = id === 'balances' && activeDebts.length > 0;
    return (
      <button
        onClick={() => { setTab(id); setShowSettings(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl font-medium text-sm transition-colors ${
          active ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <div className="relative flex-shrink-0">
          <Icon className="w-5 h-5" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {activeDebts.length}
            </span>
          )}
        </div>
        <span className="flex-1 text-right">{label}</span>
      </button>
    );
  };

  return (
    /*
     * RTL flex-row: first DOM child = physical RIGHT, second = physical LEFT.
     * Layout: [main (right/content)] [aside (left/sidebar)]
     * This places the sidebar on the physical left of the screen as requested.
     */
    <div
      className="flex flex-col min-h-screen md:h-screen bg-gray-50 max-w-lg md:max-w-none lg:max-w-7xl mx-auto"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      {/* ── Header ── */}
      <header className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md flex-shrink-0">
        {/* Settings shortcut — always visible, useful on all screen sizes */}
        <button
          onClick={() => setShowSettings(s => !s)}
          className="p-2 rounded-xl hover:bg-teal-600"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg leading-tight">مصاريف السكن</h1>
          <p className="text-teal-200 text-xs">{roommates.join(' · ')}</p>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center ${
          activeDebts.length === 0 ? 'bg-green-500' : 'bg-orange-400'
        }`}>
          {activeDebts.length === 0 ? '✓' : activeDebts.length}
        </div>
      </header>

      {/* ── Operation error banner ── */}
      {opError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between gap-3 flex-shrink-0 z-20">
          <p className="text-sm text-red-700 font-medium">{opError}</p>
          <button onClick={() => setOpError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
        </div>
      )}

      {/* ── Install banner ── */}
      {showInstallBanner && (
        <div className="bg-teal-50 border-b border-teal-200 px-4 py-2 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-sm text-teal-800 font-medium">📱 إضافة للشاشة الرئيسية</p>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={handleInstall} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold">تثبيت</button>
            <button onClick={() => setShowInstallBanner(false)} className="text-xs text-teal-600 px-2 py-1.5">لاحقاً</button>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 md:overflow-hidden">

        {/*
         * ① Main content — DOM FIRST → physical RIGHT in RTL.
         *   On desktop, 'add' tab splits into [form (right)] + [balances panel (left)].
         */}
        <main className="flex-1 pb-24 md:pb-6 md:overflow-y-auto min-w-0">

          {showSettings && (
            <SettingsTab roommates={roommates} onReset={handleReset} />
          )}

          {/* 'add' tab ── single column on mobile/tablet, 2-col on desktop */}
          {!showSettings && tab === 'add' && (
            <>
              {/* < lg: plain form */}
              <div className="lg:hidden">
                <AddExpense roommates={roommates} onAdd={handleAddExpense} />
              </div>

              {/* ≥ lg: form (right) + balances snapshot (left) */}
              <div className="hidden lg:flex h-full">
                {/* Add form — first child = physical RIGHT in RTL */}
                <div className="flex-1 overflow-y-auto">
                  <AddExpense roommates={roommates} onAdd={handleAddExpense} />
                </div>
                {/* Balances panel — second child = physical LEFT in RTL */}
                <div className="w-96 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
                  <Balances
                    compact
                    roommates={roommates}
                    expenses={expenses}
                    settlements={settlements}
                    onSettle={handleSettle}
                  />
                </div>
              </div>
            </>
          )}

          {!showSettings && tab === 'balances' && (
            <Balances roommates={roommates} expenses={expenses} settlements={settlements} onSettle={handleSettle} />
          )}
          {!showSettings && tab === 'history'  && (
            <HistoryTab roommates={roommates} expenses={expenses} onDelete={handleDeleteExpense} />
          )}
          {!showSettings && tab === 'rent'     && (
            <Rent roommates={roommates} rentData={rentData} onUpdateRent={handleUpdateRent} />
          )}
          {!showSettings && tab === 'reports'  && (
            <Reports roommates={roommates} expenses={expenses} />
          )}
        </main>

        {/*
         * ② Sidebar — DOM SECOND → physical LEFT in RTL.
         *   Visible from md (768 px) upward; hidden on mobile.
         */}
        <aside className="hidden md:flex flex-col w-52 lg:w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-3 lg:p-4">
            <p className="text-xs font-bold text-gray-400 px-3 mb-2 mt-1">القائمة</p>
            <nav className="space-y-1">
              {TABS.map(({ id, label, Icon }) => (
                <SidebarItem key={id} id={id} label={label} Icon={Icon} />
              ))}
            </nav>
          </div>
          <div className="mt-auto p-3 lg:p-4 border-t border-gray-100">
            <button
              onClick={() => setShowSettings(s => !s)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl font-medium text-sm transition-colors ${
                showSettings ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-right">الإعدادات</span>
            </button>
          </div>
        </aside>

      </div>

      {/* ── Bottom tab bar — mobile only (< md) ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex z-20 shadow-lg md:hidden">
        {TABS.map(({ id, label, Icon }) => {
          const active    = tab === id && !showSettings;
          const showBadge = id === 'balances' && activeDebts.length > 0;
          return (
            <button
              key={id}
              onClick={() => { setTab(id); setShowSettings(false); }}
              className={`flex-1 flex flex-col items-center py-2 pt-2.5 relative ${
                active ? 'text-teal-700' : 'text-gray-400'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {activeDebts.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowSettings(s => !s)}
          className={`flex-none px-3 flex flex-col items-center py-2 pt-2.5 relative ${
            showSettings ? 'text-teal-700' : 'text-gray-400'
          }`}
        >
          {showSettings && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
          )}
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">إعدادات</span>
        </button>
      </nav>
    </div>
  );
}
