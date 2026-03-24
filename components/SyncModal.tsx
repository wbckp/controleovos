import React, { useState } from 'react';
import { CloudUpload, Wifi, WifiOff, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { OfflineQueueItem, PaymentStatus } from '../types';
import { 
  createCustomer, 
  createSale, 
  updateCustomer, 
  updateSale, 
  updateSaleStatus, 
  deleteCustomer, 
  deleteSale 
} from '../lib/queries';
import { removeFromOfflineQueue, clearOfflineQueue } from '../lib/offlineStorage';

interface SyncModalProps {
  items: OfflineQueueItem[];
  onSyncComplete: () => void;
  onClose: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ items, onSyncComplete, onClose }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: items.length });
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    let count = 0;

    try {
      for (const item of items) {
        setProgress({ current: count + 1, total: items.length });
        
        const { action, payload } = item;

        switch (action) {
          case 'CREATE_CUSTOMER':
            await createCustomer(payload.customer);
            break;
          case 'CREATE_SALE':
            await createSale(payload.sale);
            break;
          case 'UPDATE_CUSTOMER':
            if (payload.id) await updateCustomer(payload.id, payload.customer);
            break;
          case 'UPDATE_SALE':
            if (payload.id) await updateSale(payload.id, payload.sale);
            break;
          case 'UPDATE_SALE_STATUS':
            if (payload.id && payload.status) await updateSaleStatus(payload.id, payload.status, payload.paymentDate);
            break;
          case 'DELETE_CUSTOMER':
            if (payload.id) await deleteCustomer(payload.id);
            break;
          case 'DELETE_SALE':
            if (payload.id) await deleteSale(payload.id);
            break;
        }

        removeFromOfflineQueue(item.id);
        count++;
      }
      
      onSyncComplete();
    } catch (err: any) {
      console.error('Error syncing:', err);
      setError(`Erro na sincronização: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CloudUpload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sincronização Pendente</h3>
                <p className="text-sm text-muted-foreground">Você tem {items.length} alterações offline</p>
              </div>
            </div>
            {!isSyncing && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="max-h-[30vh] overflow-y-auto mb-6 pr-2 -mr-2 space-y-3 thin-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{item.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {isSyncing ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Enviando dados...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <button disabled className="w-full py-3.5 rounded-xl font-bold bg-muted text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando...
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onClose}
                className="py-3.5 rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all active:scale-95"
              >
                Depois
              </button>
              <button 
                onClick={handleSync}
                className="py-3.5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Sincronizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
