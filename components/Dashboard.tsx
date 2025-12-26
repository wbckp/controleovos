
import React from 'react';
import { Sale, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, TrendingUp, CheckCircle, Clock, Save, Edit3, ArrowUp, Target, LogOut, Egg } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './ThemeToggle';

import { AppSettings } from '../types';

interface DashboardProps {
  sales: Sale[];
  onNavigateToClients: () => void;
  onLogout: () => void;
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ sales, onNavigateToClients, onLogout, settings }) => {
  const today = new Date().toISOString().split('T')[0];
  const [period, setPeriod] = React.useState<'today' | '7d' | '30d' | 'all'>('30d');

  const stats = React.useMemo(() => {
    const now = new Date();

    const filteredSalesByPeriod = sales.filter(s => {
      const saleDate = new Date(s.date);
      if (period === 'today') return s.date === today;
      if (period === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return saleDate >= sevenDaysAgo;
      }
      if (period === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return saleDate >= thirtyDaysAgo;
      }
      return true; // all
    });

    const totalPeriod = filteredSalesByPeriod.reduce((acc, s) => acc + s.value, 0);
    const totalToday = sales.filter(s => s.date === today).reduce((acc, s) => acc + s.value, 0);

    const totalMonth = sales.reduce((acc, s) => {
      const saleDate = new Date(s.date);
      if (saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()) {
        return acc + s.value;
      }
      return acc;
    }, 0);

    const pendingSales = sales.filter(s => s.status === PaymentStatus.PENDING);
    const totalPaid = sales.filter(s => s.status === PaymentStatus.PAID).reduce((acc, s) => acc + s.value, 0);
    const totalPending = pendingSales.reduce((acc, s) => acc + s.value, 0);
    const pendingCount = pendingSales.length;

    // Meta mensal (exemplo: R$ 5000,00)
    const monthlyGoal = 5000;
    const goalPercentage = Math.min(Math.round((totalMonth / monthlyGoal) * 100), 100);

    return { totalToday, totalMonth, totalPaid, totalPending, pendingCount, goalPercentage, monthlyGoal, totalPeriod };
  }, [sales, today, period]);

  const weeklyData = React.useMemo(() => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date === dateStr);
      const amount = daySales.reduce((acc, s) => acc + s.value, 0);
      return {
        day: days[d.getDay()],
        amount,
        date: dateStr
      };
    });
    return last7Days;
  }, [sales]);

  const pieData = [
    { name: 'Pago', value: stats.totalPaid || 0, color: 'var(--primary)' },
    { name: 'Pendente', value: stats.totalPending || 0, color: 'var(--destructive)' },
  ];

  const totalValue = stats.totalPaid + stats.totalPending;

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 max-w-lg mx-auto bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border-2 border-card">
            {settings.appLogo ? (
              <img src={settings.appLogo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Egg className="text-primary-foreground h-7 w-7 fill-current" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{settings.appName}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">Gestão de Vendas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-2xl text-muted-foreground" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'today', label: 'Hoje' },
          { id: '7d', label: '7 dias' },
          { id: '30d', label: '30 dias' },
          { id: 'all', label: 'Tudo' }
        ].map(p => (
          <Button
            key={p.id}
            variant={period === p.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.id as any)}
            className={`rounded-xl px-4 h-9 text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'shadow-md scale-105' : 'bg-card/40 border-primary/10'}`}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border shadow-sm bg-card transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black">+12%</Badge>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Hoje</p>
              <p className="text-xl font-black tracking-tight">R$ {stats.totalToday.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-32">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Este Mês</p>
              <p className="text-xl font-black tracking-tight">R$ {(stats.totalMonth / 1000).toFixed(1)}k</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-none shadow-md bg-primary text-primary-foreground relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Recebido ({period})</p>
                <p className="text-3xl font-black tracking-tighter">
                  R$ {stats.totalPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white h-full rounded-full" style={{ width: `${stats.goalPercentage}%` }}></div>
            </div>
            <p className="text-[10px] font-bold mt-2 opacity-70 italic tracking-wide">{stats.goalPercentage}% da meta mensal atingida (R$ {stats.monthlyGoal})</p>
          </CardContent>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </Card>

        <Card className="border-none shadow-sm bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-destructive uppercase tracking-widest px-1">Em Aberto</p>
            <p className="text-xl font-black text-destructive tracking-tighter mt-1">
              R$ {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-destructive/60 px-1">
              <Clock className="h-3 w-3" />
              <span>{stats.pendingCount} Pendentes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Faturamento Médio</p>
            <p className="text-xl font-black tracking-tighter mt-1">R$ {(sales.length > 0 ? stats.totalMonth / sales.length : 0).toFixed(2)}</p>
            <p className="text-[10px] font-black text-emerald-500 mt-2 px-1">Por Venda</p>
          </CardContent>
        </Card>
      </div>

      {/* Meta de Lucro */}
      <Card className="border-none shadow-sm bg-accent/30">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-background rounded-2xl shadow-inner text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Meta de Lucro Diário</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black opacity-30 tracking-widest">R$</span>
              <input
                type="text"
                className="bg-transparent border-none p-0 text-xl font-black tracking-tighter focus:ring-0 w-full"
                defaultValue="200,00"
              />
              <Edit3 className="h-4 w-4 text-muted-foreground opacity-30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight px-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Análise de Performance
        </h3>

        <div className="grid gap-4">
          <Card className="border shadow-sm bg-card">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendas Diárias (7d)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.date === today ? 'var(--primary)' : 'oklch(from var(--primary) l c h / 0.2)'} />
                    ))}
                  </Bar>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--muted-foreground)' }}
                    dy={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 flex-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black">R$ {(totalValue / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {pieData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span>R$ {item.value.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-1 w-full bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: item.color,
                            width: `${totalValue > 0 ? (item.value / totalValue) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
