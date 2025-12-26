
import React, { useState } from 'react';
import { Customer, Sale, PaymentStatus } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Settings, ChevronRight, AlertCircle, CheckCircle2, User, ArrowDownNarrowWide } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from './ThemeToggle';

interface ClientListProps {
  customers: Customer[];
  sales: Sale[];
  onSelectClient: (id: string) => void;
}

type SortOption = 'name' | 'debt' | 'purchases';

const ClientList: React.FC<ClientListProps> = ({ customers, sales, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'debt' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const getClientMetrics = (clientId: string) => {
    const clientSales = sales.filter(s => s.customerId === clientId);
    const debt = clientSales
      .filter(s => s.status === PaymentStatus.PENDING)
      .reduce((acc, s) => acc + s.value, 0);
    const totalPurchases = clientSales.reduce((acc, s) => acc + s.value, 0);
    return { debt, totalPurchases, hasDebt: debt > 0 };
  };

  const sortedAndFilteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const { hasDebt } = getClientMetrics(c.id);

      if (filter === 'debt') return matchesSearch && hasDebt;
      if (filter === 'paid') return matchesSearch && !hasDebt;
      return matchesSearch;
    })
    .sort((a, b) => {
      const metricsA = getClientMetrics(a.id);
      const metricsB = getClientMetrics(b.id);

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'debt') {
        return metricsB.debt - metricsA.debt;
      } else if (sortBy === 'purchases') {
        return metricsB.totalPurchases - metricsA.totalPurchases;
      }
      return 0;
    });

  const getClientDebt = (clientId: string) => {
    return sales
      .filter(s => s.customerId === clientId && s.status === PaymentStatus.PENDING)
      .reduce((acc, s) => acc + s.value, 0);
  };

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas vendas de ovos</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="px-6 pb-4 flex gap-2">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            className="pl-10 h-11 rounded-xl"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={(val: SortOption) => setSortBy(val)}>
          <SelectTrigger className="w-[130px] h-11 rounded-xl border-dashed bg-card/40 border-primary/20 text-xs font-bold">
            <div className="flex items-center gap-2">
              <ArrowDownNarrowWide className="h-3.5 w-3.5 text-primary" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-none">
            <SelectItem value="name" className="text-xs font-medium">A - Z</SelectItem>
            <SelectItem value="debt" className="text-xs font-medium">Quem deve mais</SelectItem>
            <SelectItem value="purchases" className="text-xs font-medium">Quem compra mais</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-full px-5"
        >
          Todos
        </Button>
        <Button
          variant={filter === 'debt' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('debt')}
          className="rounded-full px-5"
        >
          Com Dívida
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
          className="rounded-full px-5"
        >
          Quitados
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
          {sortedAndFilteredCustomers.length} resultados encontrados
        </p>

        {sortedAndFilteredCustomers.length === 0 ? (
          <div className="text-center py-20">
            <User className="h-12 w-12 text-muted mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">Nenhum cliente encontrado</p>
          </div>
        ) : (
          sortedAndFilteredCustomers.map(customer => {
            const { debt, totalPurchases } = getClientMetrics(customer.id);
            return (
              <Card
                key={customer.id}
                onClick={() => onSelectClient(customer.id)}
                className="group flex items-center p-3 border shadow-sm hover:shadow-md hover:bg-accent/30 transition-all cursor-pointer bg-card"
              >
                <div className="relative flex-none">
                  {customer.avatarUrl ? (
                    <img src={customer.avatarUrl} alt={customer.name} className="h-14 w-14 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-inner uppercase">
                      {customer.initials || customer.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {debt > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive border-2 border-background"></span>
                  </span>}
                </div>
                <div className="flex-1 ml-4 min-w-0">
                  <h3 className="text-base font-bold truncate">{customer.name}</h3>
                  <div className="flex flex-col gap-1 mt-0.5">
                    {debt > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-bold text-destructive">Débito: R$ {debt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary">Status: Quitado</span>
                      </div>
                    )}
                    {sortBy === 'purchases' && (
                      <div className="flex items-center gap-1.5">
                        <ArrowDownNarrowWide className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">Total Compra: R$ {totalPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="flex-none text-muted-foreground/30 group-hover:text-primary transition-colors h-5 w-5" />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientList;

