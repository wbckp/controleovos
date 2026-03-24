import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';
import { getActivityLogs, deleteActivityLogs, clearActivityLogs } from '../lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, CheckCircle, XCircle, Loader2, Activity, Trash } from 'lucide-react';

interface ActivityLogsProps {
  onBack: () => void;
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === logs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(logs.map(l => l.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    // Log para depuração
    console.log('Tentando excluir IDs:', Array.from(selectedIds));

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) {
        alert('Erro do Supabase: ' + error.message);
        throw error;
      }
      
      setSelectedIds(new Set());
      await fetchLogs();
    } catch (error: any) {
      console.error('Error deleting logs:', error);
      alert('Erro ao excluir: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Deseja realmente limpar TODO o histórico de atividades?')) return;

    try {
      setDeleting(true);
      await clearActivityLogs();
      setSelectedIds(new Set());
      await fetchLogs();
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      alert('Erro ao limpar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 max-w-lg mx-auto bg-background min-h-full">
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl bg-card border shadow-sm h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Gerenciar Logs</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1">Histórico de Operações</p>
          </div>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-inner border border-primary/20">
          <Activity className="h-6 w-6" />
        </div>
      </header>

      <div className="flex items-center justify-between px-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSelectAll}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          {selectedIds.size === logs.length && logs.length > 0 ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
        </Button>
        {selectedIds.size > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Excluir ({selectedIds.size})
          </Button>
        )}
      </div>

      <Card className="border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs font-bold text-muted-foreground">Nenhuma atividade encontrada.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  onClick={() => toggleSelect(log.id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${selectedIds.has(log.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.has(log.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                    {selectedIds.has(log.id) && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-card-foreground leading-tight tracking-tight pr-2">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold uppercase tracking-widest text-[10px]"
          onClick={handleClearAll}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
          Limpar Todo o Histórico
        </Button>
      )}
    </div>
  );
};

export default ActivityLogs;
