
import React, { useState, useMemo, useEffect } from 'react';
import { AppScreen, Sale, Customer, PaymentStatus, AppSettings } from './types';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import NewSaleForm from './components/NewSaleForm';
import CustomerForm from './components/CustomerForm';
import Finances from './components/Finances';
import BottomNav from './components/BottomNav';
import Settings from './components/Settings';
import Reports from './components/Reports';
import ActivityLogs from './components/ActivityLogs';
import ConfirmDialog from './components/ConfirmDialog';
import SyncModal from './components/SyncModal';
import InstallModal from './components/InstallModal';
import { WifiOff, Signal, AlertTriangle } from 'lucide-react';
import { getOfflineQueue, isOnline as checkOnline } from './lib/offlineStorage';
import { OfflineQueueItem } from './types';
import {
  getCustomers,
  getSales,
  createCustomer,
  createSale,
  updateSaleStatus,
  updateCustomer,
  deleteCustomer,
  updateSale,
  deleteSale,
  getAppSettings,
  getPublicAppSettings,
  updateAppSettings
} from './lib/queries';

import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [editingSale, setEditingSale] = useState<Sale | undefined>();
  const [preSelectedCustomerId, setPreSelectedCustomerId] = useState<string | undefined>();
  const [settings, setSettings] = useState<AppSettings>({ appName: 'OvoControl', appLogo: '' });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'sale' | 'customer' | 'logout';
    id: string;
    title: string;
    message: string;
    confirmLabel?: string;
  }>({
    isOpen: false,
    type: 'sale',
    id: '',
    title: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(checkOnline());
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersData, salesData, settingsData] = await Promise.all([
        getCustomers(),
        getSales(),
        getAppSettings()
      ]);
      setCustomers(customersData);
      setSales(salesData);
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial branding fetch for login screen
    getPublicAppSettings().then(data => {
      if (data) setSettings(data);
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setScreen(AppScreen.DASHBOARD);
        fetchData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN') {
        setScreen(AppScreen.DASHBOARD);
        fetchData();
      } else if (event === 'SIGNED_OUT') {
        setScreen(AppScreen.LOGIN);
      }
    });

    const handleOnlineStatus = () => {
      const online = checkOnline();
      setIsOnline(online);
      if (online) {
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          setOfflineQueue(queue);
          setShowSyncModal(true);
        }
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar o modal se ainda não foi mostrado nesta sessão
      if (!sessionStorage.getItem('pwa_prompt_shown')) {
        setShowInstallModal(true);
        sessionStorage.setItem('pwa_prompt_shown', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Lógica para iOS e fallback mobile (que não dispara beforeinstallprompt imediatamente ou nunca)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isMobile && !isStandalone && !sessionStorage.getItem('pwa_prompt_shown')) {
      const timer = setTimeout(() => {
        setIsOnline(checkOnline()); // Re-check connection
        setShowInstallModal(true);
        sessionStorage.setItem('pwa_prompt_shown', 'true');
      }, 5000); // Wait 5 seconds to give browser time to fire event
      
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // Initial check for offline data
    const initialQueue = getOfflineQueue();
    if (initialQueue.length > 0 && checkOnline()) {
      setOfflineQueue(initialQueue);
      setShowSyncModal(true);
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash.replace('#', '') !== screen) {
      window.history.pushState(null, '', `#${screen}`);
    }
    // Sempre volta pro topo ao trocar de tela
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as AppScreen;
      if (Object.values(AppScreen).includes(hash)) {
        setScreen(hash);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = () => {
    // Session is handled by onAuthStateChange
  };

  const confirmLogout = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'logout',
      id: 'session',
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar o sistema.',
      confirmLabel: 'Sair'
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setCustomers([]);
      setSales([]);
      setScreen(AppScreen.LOGIN);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddSale = async (newSale: Sale) => {
    try {
      await createSale({
        customerId: newSale.customerId,
        quantity: newSale.quantity,
        value: newSale.value,
        date: newSale.date,
        status: newSale.status,
        description: newSale.description
      });
      await fetchData(); // Refresh data
      setPreSelectedCustomerId(undefined);
      setScreen(AppScreen.DASHBOARD);
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('Erro ao salvar venda.');
    }
  };

  const handleQuickSale = async (amount: number, date: string) => {
    try {
      setLoading(true);
      let avulsa = customers.find(c => c.name === 'Venda Avulsa');
      if (!avulsa) {
        avulsa = await createCustomer({
          name: 'Venda Avulsa',
          phone: '',
          notes: 'Cliente para vendas rápidas/balcão',
          initials: 'VA'
        });
      }

      await createSale({
        customerId: avulsa.id,
        quantity: 1,
        value: amount,
        date: date,
        status: PaymentStatus.PAID,
        description: 'Venda Avulsa (Lançamento Rápido)'
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding quick sale:', error);
      alert('Erro ao registrar venda rápida.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSale = async (updatedSale: Sale) => {
    try {
      await updateSale(updatedSale.id, updatedSale);
      await fetchData();
      if (screen !== AppScreen.FINANCES && screen !== AppScreen.CLIENT_DETAIL) {
        setScreen(AppScreen.CLIENT_DETAIL);
      }
      setEditingSale(undefined);
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Erro ao atualizar venda.');
    }
  };

  const confirmDeleteSale = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'sale',
      id,
      title: 'Excluir Venda',
      message: 'Tem certeza que deseja excluir este registro de venda? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir'
    });
  };

  const confirmDeleteCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setConfirmDialog({
      isOpen: true,
      type: 'customer',
      id,
      title: 'Excluir Cliente',
      message: `Deseja realmente excluir ${customer?.name}? Todos os registros relacionados serão perdidos.`,
      confirmLabel: 'Excluir'
    });
  };

  const handleExecuteConfirm = async () => {
    try {
      setLoading(true);
      if (confirmDialog.type === 'logout') {
        await handleLogout();
      } else if (confirmDialog.type === 'sale') {
        await deleteSale(confirmDialog.id);
        await fetchData();
      } else if (confirmDialog.type === 'customer') {
        await deleteCustomer(confirmDialog.id);
        setScreen(AppScreen.CLIENT_LIST);
        await fetchData();
      }
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Error executing action:', error);
      alert('Erro ao processar ação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    confirmDeleteCustomer(id);
  };

  const handleDeleteSale = async (id: string) => {
    confirmDeleteSale(id);
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      const created = await createCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        notes: newCustomer.notes,
        avatarUrl: newCustomer.avatarUrl,
        initials: newCustomer.initials
      });
      setCustomers(prev => [...prev, created]);
      setScreen(AppScreen.CLIENT_LIST);
      return created;
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Erro ao cadastrar cliente.');
    }
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    try {
      await updateCustomer(updatedCustomer.id, updatedCustomer);
      await fetchData();
      setScreen(AppScreen.CLIENT_DETAIL);
      setEditingCustomer(undefined);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Erro ao atualizar cliente.');
    }
  };

  const goToClientDetail = (id: string) => {
    setSelectedCustomerId(id);
    setScreen(AppScreen.CLIENT_DETAIL);
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      setLoading(true);
      await updateAppSettings(newSettings);
      setSettings(newSettings);
      alert('Configurações salvas no Supabase!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao sincronizar com nuvem. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRegistered = async (saleId: string, paymentDate: string) => {
    try {
      await updateSaleStatus(saleId, PaymentStatus.PAID, paymentDate);
      setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: PaymentStatus.PAID, paymentDate } : s));
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Erro ao registrar pagamento.');
    }
  };

  const renderScreen = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          {screen === AppScreen.LOGIN && <p className="text-muted-foreground animate-pulse text-sm">Validando sessão...</p>}
        </div>
      );
    }

    switch (screen) {
      case AppScreen.LOGIN:
        return (
          <LoginForm
            onLogin={handleLogin}
            settings={settings}
          />
        );
      case AppScreen.DASHBOARD:
        return (
          <Dashboard
            sales={sales}
            onNavigateToClients={() => setScreen(AppScreen.CLIENT_LIST)}
            onLogout={confirmLogout}
            settings={settings}
          />
        );
      case AppScreen.CLIENT_LIST:
        return (
          <ClientList
            customers={customers}
            sales={sales}
            onSelectClient={goToClientDetail}
          />
        );
      case AppScreen.CLIENT_DETAIL:
        const client = customers.find(c => c.id === selectedCustomerId);
        const clientSales = sales.filter(s => s.customerId === selectedCustomerId);
        if (!client) return <Dashboard sales={sales} onNavigateToClients={() => setScreen(AppScreen.CLIENT_LIST)} />;
        return (
          <ClientDetail
            customer={client}
            sales={clientSales}
            onBack={() => setScreen(AppScreen.CLIENT_LIST)}
            onPaymentRegistered={handlePaymentRegistered}
            onEditCustomer={(c) => { setEditingCustomer(c); setScreen(AppScreen.EDIT_CLIENT); }}
            onDeleteCustomer={handleDeleteCustomer}
            onEditSale={(s) => { setEditingSale(s); setScreen(AppScreen.EDIT_SALE); }}
            onDeleteSale={handleDeleteSale}
            onNewSale={(id) => { setPreSelectedCustomerId(id); setScreen(AppScreen.NEW_SALE); }}
          />
        );
      case AppScreen.NEW_SALE:
      case AppScreen.EDIT_SALE:
        return (
          <NewSaleForm
            customers={customers}
            initialData={editingSale}
            initialCustomerId={preSelectedCustomerId}
            onSave={editingSale ? handleUpdateSale : handleAddSale}
            onCancel={() => {
              setScreen(editingSale ? AppScreen.CLIENT_DETAIL : AppScreen.DASHBOARD);
              setEditingSale(undefined);
              setPreSelectedCustomerId(undefined);
            }}
            onAddNewCustomer={handleAddCustomer}
            onNavigateToNewCustomer={() => setScreen(AppScreen.NEW_CLIENT)}
          />
        );
      case AppScreen.SETTINGS:
        return (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onLogout={confirmLogout}
            onViewLogs={() => setScreen(AppScreen.ACTIVITY_LOGS)}
            loading={loading}
          />
        );
      case AppScreen.ACTIVITY_LOGS:
        return (
          <ActivityLogs 
            onBack={() => setScreen(AppScreen.SETTINGS)}
          />
        );
      case AppScreen.NEW_CLIENT:
      case AppScreen.EDIT_CLIENT:
        return (
          <CustomerForm
            initialData={editingCustomer}
            onSave={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
            onCancel={() => {
              setScreen(editingCustomer ? AppScreen.CLIENT_DETAIL : AppScreen.CLIENT_LIST);
              setEditingCustomer(undefined);
            }}
          />
        );
      case AppScreen.FINANCES:
        return (
          <Finances
            sales={sales}
            onAddQuickSale={handleQuickSale}
            onEditSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
            onNavigateToReports={() => setScreen(AppScreen.REPORTS)}
          />
        );
      case AppScreen.REPORTS:
        return (
          <Reports 
            sales={sales}
            customers={customers}
            onBack={() => setScreen(AppScreen.FINANCES)}
            onNavigateToClient={goToClientDetail}
          />
        );
      default:
        return <LoginForm onLogin={handleLogin} />;
    }
  };

  const showNav = screen !== AppScreen.LOGIN &&
    screen !== AppScreen.NEW_SALE &&
    screen !== AppScreen.EDIT_SALE &&
    screen !== AppScreen.EDIT_CLIENT &&
    screen !== AppScreen.NEW_CLIENT &&
    screen !== AppScreen.ACTIVITY_LOGS &&
    screen !== AppScreen.REPORTS;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background relative overflow-x-hidden shadow-2xl border-x border-border/50">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-4 flex items-center justify-center gap-2 animate-pulse sticky top-0 z-50">
          <WifiOff className="w-3 h-3" />
          MODO OFFLINE ATIVO - AS ALTERAÇÕES SERÃO SALVAS LOCALMENTE
        </div>
      )}
      
      <main className={`flex-1 ${showNav ? 'pb-24' : ''}`}>
        {renderScreen()}
      </main>

      {showNav && (
        <BottomNav
          currentScreen={screen}
          onNavigate={(s) => setScreen(s)}
          onAddClick={() => {
            setPreSelectedCustomerId(undefined);
            if (screen === AppScreen.CLIENT_LIST) {
              setScreen(AppScreen.NEW_CLIENT);
            } else {
              setScreen(AppScreen.NEW_SALE);
            }
          }}
        />
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={handleExecuteConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {showSyncModal && (
        <SyncModal 
          items={offlineQueue}
          onSyncComplete={() => {
            setShowSyncModal(false);
            setOfflineQueue([]);
            fetchData();
          }}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {showInstallModal && (
        <InstallModal 
          deferredPrompt={deferredPrompt}
          onClose={() => setShowInstallModal(false)}
        />
      )}
    </div>
  );
};

export default App;