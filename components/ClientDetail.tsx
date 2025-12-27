
import React, { useMemo } from 'react';
import { Customer, Sale, PaymentStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MoreVertical, Phone, CreditCard, Edit, ShoppingBasket, BarChart3, Egg, Package, History, Info, CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Input } from '@/components/ui/input';

interface ClientDetailProps {
  customer: Customer;
  sales: Sale[];
  onBack: () => void;
  onPaymentRegistered: (saleId: string, paymentDate: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onNewSale: (customerId: string) => void;
}

const PaymentDateDialog: React.FC<{
  isOpen: boolean;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onCancel} />
      <Card className="relative w-full max-w-sm border-none shadow-2xl animate-in zoom-in-95 bg-card overflow-hidden">
        <div className="h-1.5 w-full bg-primary" />
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Data do Pagamento</h3>
            <p className="text-sm text-muted-foreground">Informe quando o cliente realizou o pagamento desta dívida.</p>
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-xl border-2 border-primary/20 focus:border-primary transition-all font-bold"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={() => onConfirm(date)}>
              Confirmar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientDetail: React.FC<ClientDetailProps> = ({
  customer,
  sales,
  onBack,
  onPaymentRegistered,
  onEditCustomer,
  onDeleteCustomer,
  onEditSale,
  onDeleteSale,
  onNewSale
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [historyFilter, setHistoryFilter] = React.useState<'all' | 'paid' | 'pending'>('all');
  const [paymentDialog, setPaymentDialog] = React.useState<{ isOpen: boolean, saleId: string | null }>({
    isOpen: false,
    saleId: null
  });

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch = s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = historyFilter === 'all' ||
        (historyFilter === 'paid' && s.status === PaymentStatus.PAID) ||
        (historyFilter === 'pending' && s.status === PaymentStatus.PENDING);
      return matchesSearch && matchesStatus;
    });
  }, [sales, searchTerm, historyFilter]);
  const totalDebt = useMemo(() =>
    sales
      .filter(s => s.status === PaymentStatus.PENDING)
      .reduce((acc, s) => acc + s.value, 0)
    , [sales]);

  const metrics = useMemo(() => {
    const totalOrders = sales.length;
    const totalValue = sales.reduce((acc, s) => acc + s.value, 0);
    const avgValue = totalOrders > 0 ? totalValue / totalOrders : 0;
    const totalDozens = sales.reduce((acc, s) => acc + s.quantity, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = sales.filter(s => new Date(s.date) >= thirtyDaysAgo).length;

    return {
      totalOrders,
      avgValue,
      totalDozens,
      recentOrders
    };
  }, [sales]);

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <header className="sticky top-0 z-10 flex items-center bg-background/95 backdrop-blur-md p-4 space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold flex-1">Detalhes do Cliente</h2>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Profile Card */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div
              className="h-28 w-28 rounded-3xl border-4 border-card bg-card shadow-xl bg-cover bg-center transition-transform group-hover:scale-105"
              style={{ backgroundImage: `url(${customer.avatarUrl || `https://ui-avatars.com/api/?name=${customer.name}&background=oklch(0.85%200.22%20153)&color=102219`})` }}
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-2xl p-2.5 shadow-lg border-4 border-background">
              <Phone className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
            <Badge variant="outline" className="text-primary font-bold border-primary/20 bg-primary/5 px-3 py-1">
              {customer.phone}
            </Badge>
          </div>
        </section>

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            className="flex-1 min-w-[200px] h-12 rounded-2xl font-bold shadow-lg bg-emerald-500 hover:bg-emerald-600 border-none text-white"
            onClick={() => onNewSale(customer.id)}
          >
            <ShoppingBasket className="mr-2 h-4 w-4 text-white" />
            Nova Venda
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-2xl shadow-md flex-none bg-sky-500/20 text-sky-400 border border-sky-500/20 active:scale-95 transition-all shadow-sky-500/10"
              onClick={() => onEditCustomer(customer)}
            >
              <Edit className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-2xl shadow-md text-rose-400 flex-none bg-rose-500/20 border border-rose-500/20 active:scale-95 transition-all shadow-rose-500/10"
              onClick={() => onDeleteCustomer(customer.id)}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Global Debt Status */}
        <Card className={`border-none ${totalDebt > 0 ? 'bg-destructive/10' : 'bg-primary/10'} shadow-md`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Financeiro</p>
                <p className={`text-3xl font-black tracking-tighter ${totalDebt > 0 ? 'text-destructive' : 'text-primary'}`}>
                  R$ {totalDebt.toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${totalDebt > 0 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                {totalDebt > 0 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Frequência', value: `${metrics.recentOrders}`, sub: 'Últimos 30 dias', icon: ShoppingBasket, color: 'text-blue-500' },
            { label: 'Ticket Médio', value: `R$ ${metrics.avgValue.toFixed(2)}`, sub: 'Por pedido', icon: BarChart3, color: 'text-purple-500' },
            { label: 'Volume Total', value: `${metrics.totalDozens} dz`, sub: 'Vendas totais', icon: Egg, color: 'text-orange-500' },
            { label: 'Pedido Total', value: `${metrics.totalOrders}`, sub: 'Desde o início', icon: Package, color: 'text-emerald-500' }
          ].map((m, i) => (
            <Card key={i} className="border shadow-sm bg-card transition-all hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className={`p-2 w-fit rounded-lg bg-slate-100 dark:bg-slate-800 ${m.color}`}>
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-tight">{m.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mt-1">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Observations Accordion (Simulated) */}
        <Card className="border shadow-sm bg-card">
          <CardHeader className="p-4 flex flex-row items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Observações</CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-border/50" />
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground italic">
              {customer.notes || "Sem observações para este cliente."}
            </p>
          </CardContent>
        </Card>

        {/* Shopping History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-black tracking-tight text-foreground">Histórico</h3>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-10 rounded-xl bg-card border-none shadow-sm"
                placeholder="Buscar no histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'paid', label: 'Pagos' }
              ].map(f => (
                <Button
                  key={f.id}
                  variant={historyFilter === f.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={`rounded-xl px-4 h-8 text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === f.id ? 'shadow-md scale-105' : 'bg-card/40 border-primary/10'}`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredSales.length > 0 ? (
              filteredSales.map(sale => (
                <Card key={sale.id} className="group border shadow-sm bg-card hover:translate-x-1 transition-transform overflow-hidden">
                  <div className="flex p-3 gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-14 bg-accent/50 rounded-xl flex-none border">
                      <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60">
                        {new Date(sale.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-xl font-black tracking-tighter leading-none mt-1">
                        {sale.date.split('-')[2]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold truncate text-sm">{sale.description}</h4>
                        <span className="font-black text-sm whitespace-nowrap">R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-[10px] font-medium font-mono uppercase">ID #{sale.id.substring(0, 6)}</p>
                          <div className="flex items-center gap-2 ml-2 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditSale(sale); }}
                              className="p-2.5 hover:bg-sky-500/30 rounded-xl text-sky-400 transition-all bg-sky-500/20 active:scale-90 border border-sky-500/20 shadow-sm"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSale(sale.id);
                              }}
                              className="p-2.5 hover:bg-rose-500/30 rounded-xl text-rose-400 transition-all bg-rose-500/20 active:scale-90 border border-rose-500/20 shadow-sm"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <Badge
                          onClick={() => sale.status === PaymentStatus.PENDING && setPaymentDialog({ isOpen: true, saleId: sale.id })}
                          className={`text-[9px] font-black uppercase px-2 py-0 border-none rounded-md transition-colors ${sale.status === PaymentStatus.PENDING
                            ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 cursor-pointer'
                            : 'bg-primary/20 text-primary hover:bg-primary/30'
                            }`}
                        >
                          {sale.status === PaymentStatus.PENDING ? 'Devedor' : 'Pago'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-12 text-center opacity-40">
                <Package className="h-10 w-10 mx-auto mb-3" />
                <p className="text-sm font-medium">Nenhum registro de venda</p>
              </div>
            )}
          </div>
        </div>
        <PaymentDateDialog
          isOpen={paymentDialog.isOpen}
          onCancel={() => setPaymentDialog({ isOpen: false, saleId: null })}
          onConfirm={(date) => {
            if (paymentDialog.saleId) {
              onPaymentRegistered(paymentDialog.saleId, date);
            }
            setPaymentDialog({ isOpen: false, saleId: null });
          }}
        />
      </main>
    </div>
  );
};

export default ClientDetail;

