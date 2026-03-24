import React, { useState, useMemo } from 'react';
import { Sale, Customer } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, DollarSign, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsProps {
  sales: Sale[];
  customers: Customer[];
  onBack: () => void;
  onNavigateToClient: (id: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ sales, customers, onBack, onNavigateToClient }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const filteredSales = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    return sales.filter(s => {
      const saleDate = new Date(s.date + 'T00:00:00');
      return saleDate >= start && saleDate <= end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, startDate, endDate]);

  const totalValue = filteredSales.reduce((acc, s) => acc + s.value, 0);

  const getCustomerName = (id: string, name: string) => {
    if (name) return name;
    if (id) {
      const c = customers.find(c => c.id === id);
      if (c) return c.name;
    }
    return 'Venda Avulsa';
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 max-w-lg mx-auto bg-background min-h-full">
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl bg-card border shadow-sm h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Relatórios</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1">Detalhamento de Vendas</p>
          </div>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-inner border border-primary/20">
          <FileText className="h-6 w-6" />
        </div>
      </div>

      <Card className="border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-muted-foreground uppercase tracking-widest">
            <Filter className="h-4 w-4" /> Filtro de Período
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">De</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-accent text-xs font-bold rounded-xl px-3 h-10 border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Até</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-accent text-xs font-bold rounded-xl px-3 h-10 border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm bg-card flex-1">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Quantidade</p>
            <p className="text-2xl font-black mt-1 text-primary">{filteredSales.length}</p>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1 mt-1">Registros</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-card flex-1">
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Valor Total</p>
            <p className="text-2xl font-black mt-1 text-primary">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1 mt-1">Acumulado</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight flex items-center gap-2 px-1">
          <Calendar className="h-5 w-5 text-primary" />
          Faturamento no Período
        </h3>

        <div className="space-y-3">
          {filteredSales.length === 0 ? (
            <div className="py-12 text-center opacity-40">
              <DollarSign className="h-10 w-10 mx-auto mb-3" />
              <p className="text-sm font-medium">Nenhum registro encontrado</p>
            </div>
          ) : (
            filteredSales.map(sale => (
              <Card 
                key={sale.id} 
                onClick={() => sale.customerId && onNavigateToClient(sale.customerId)}
                className="border shadow-sm bg-card hover:bg-accent/5 transition-colors group cursor-pointer"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-black tracking-tight">{getCustomerName(sale.customerId, sale.customerName)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                       {new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                      {sale.description && sale.description !== 'Venda Avulsa (Lançamento Rápido)' && (
                        <span className="text-[8px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                          {sale.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-lg font-black tracking-tighter text-primary">
                      R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm mt-1 ${sale.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                      {sale.status === 'PAID' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
