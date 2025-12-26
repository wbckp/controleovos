
import React, { useMemo, useState } from 'react';
import { Sale } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calendar, BarChart3, Edit2, Trash2, X, Check, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface FinancesProps {
    sales: Sale[];
    onAddQuickSale: (amount: number, date: string) => void;
    onEditSale: (sale: Sale) => void;
    onDeleteSale: (id: string) => void;
}

const getLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Finances: React.FC<FinancesProps> = ({ sales, onAddQuickSale, onEditSale, onDeleteSale }) => {
    const today = new Date();
    const localToday = getLocalDateString(today);
    const [quickValue, setQuickValue] = useState('');
    const [quickDate, setQuickDate] = useState(localToday);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editDate, setEditDate] = useState('');
    const [chartPeriod, setChartPeriod] = useState<number>(30);

    // Precise filter for manual entries
    const manualSales = useMemo(() => {
        return sales
            .filter(s => {
                const name = (s.customerName || '').toLowerCase();
                const desc = (s.description || '').toLowerCase();
                return name.includes('venda avulsa') ||
                    desc.includes('lançamento rápido') ||
                    desc.includes('recebimento diário') ||
                    desc.includes('venda avulsa');
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [sales]);

    // Sum totals by date ensuring numeric values
    const dailyTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        manualSales.forEach(s => {
            const date = s.date.trim();
            const val = typeof s.value === 'string' ? parseFloat(s.value) : s.value;
            if (!isNaN(val)) {
                totals[date] = (totals[date] || 0) + val;
            }
        });
        return totals;
    }, [manualSales]);

    // Construct chart data for the selected period
    const chartData = useMemo(() => {
        const data = [];
        const base = new Date();
        base.setHours(0, 0, 0, 0);

        for (let i = chartPeriod - 1; i >= 0; i--) {
            const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
            const dateStr = getLocalDateString(date);
            const val = dailyTotals[dateStr] || 0;
            data.push({
                name: date.toLocaleDateString('pt-BR', { weekday: chartPeriod > 7 ? 'narrow' : 'short' }),
                value: Number(val.toFixed(2)),
                fullDate: dateStr,
                displayDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            });
        }
        return data;
    }, [dailyTotals, chartPeriod]);

    const totalInPeriod = useMemo(() =>
        chartData.reduce((sum, d) => sum + d.value, 0),
        [chartData]);

    const hasDataInPeriod = useMemo(() => chartData.some(d => d.value > 0), [chartData]);

    const handleQuickAdd = () => {
        const cleanValue = quickValue.replace('R$', '').replace(/\s/g, '').replace(',', '.');
        const val = parseFloat(cleanValue);
        if (isNaN(val) || val <= 0) return;
        onAddQuickSale(val, quickDate);
        setQuickValue('');
        setQuickDate(localToday);
    };

    const startEditing = (sale: Sale) => {
        setEditingId(sale.id);
        setEditValue(sale.value.toString());
        setEditDate(sale.date);
    };

    const handleSaveEdit = (sale: Sale) => {
        const cleanValue = editValue.replace(',', '.');
        const val = parseFloat(cleanValue);
        if (isNaN(val) || val <= 0) return;
        onEditSale({ ...sale, value: val, date: editDate });
        setEditingId(null);
    };

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 max-w-lg mx-auto bg-background min-h-full">
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Finanças</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1">Ganhos Manuais</p>
                </div>
                <ThemeToggle />
            </div>

            {/* Performance Chart */}
            <Card className="border shadow-sm bg-card overflow-hidden">
                <CardHeader className="p-4 pb-2 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total no Período ({chartPeriod}d)</CardTitle>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black tracking-tighter text-primary">
                                    R$ {totalInPeriod.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center gap-1 text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    <ArrowUpRight className="h-2 w-2" />
                                    Acumulado
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 bg-accent/30 p-1 rounded-lg">
                            {[7, 15, 30, 60, 90].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setChartPeriod(p)}
                                    className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${chartPeriod === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}
                                >
                                    {p === 90 ? '3m' : `${p}d`}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-40 relative mt-2">
                    {!hasDataInPeriod && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/50 backdrop-blur-[2px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-center">
                                Sem registros nos últimos {chartPeriod} dias
                            </p>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" opacity={0.05} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVal)"
                                animationDuration={1000}
                                isAnimationActive={true}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                            <XAxis
                                dataKey="name"
                                hide
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-card border shadow-xl p-3 rounded-xl border-primary/20">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                                                    {payload[0].payload.displayDate} ({payload[0].payload.name})
                                                </p>
                                                <p className="text-lg font-black text-primary">
                                                    R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Quick Record */}
            <Card className="border shadow-md bg-orange-500 text-white relative overflow-hidden">
                <CardContent className="p-6 text-center relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4">Lançamento de Caixa Manual</p>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl opacity-40">R$</span>
                                <input
                                    type="text"
                                    value={quickValue}
                                    onChange={(e) => setQuickValue(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full bg-white/10 border-2 border-white/10 rounded-2xl h-16 pl-16 text-3xl font-black focus:ring-4 focus:ring-white/20 focus:border-white/30 placeholder:text-white/20 transition-all text-center pr-6 outline-none"
                                />
                            </div>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
                                <input
                                    type="date"
                                    value={quickDate}
                                    onChange={(e) => setQuickDate(e.target.value)}
                                    className="w-full bg-white/10 border-2 border-white/10 rounded-2xl h-12 pl-12 pr-4 font-black uppercase text-xs tracking-widest focus:ring-4 focus:ring-white/20 focus:border-white/30 transition-all outline-none appearance-none"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleQuickAdd}
                            disabled={!quickValue}
                            className="h-14 rounded-2xl bg-white text-orange-600 hover:bg-white/90 shadow-2xl font-black text-md uppercase tracking-widest active:scale-95 transition-all outline-none border-none"
                        >
                            Confirmar Valor
                        </Button>
                    </div>
                </CardContent>
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
            </Card>

            {/* Daily History */}
            <div className="space-y-4">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2 px-1">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    Histórico de Lançamentos
                </h3>

                <div className="space-y-3">
                    {manualSales.map(s => (
                        <Card key={s.id} className="border shadow-sm bg-card hover:bg-accent/5 transition-colors group">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-xl bg-accent flex flex-col items-center justify-center border shadow-inner flex-none">
                                        <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">
                                            {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                        </span>
                                        <span className="text-xl font-black tracking-tighter leading-none mt-1">
                                            {s.date.split('-')[2]}
                                        </span>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        {editingId === s.id ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-orange-600">R$</span>
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full bg-accent/50 border-b-2 border-orange-500 text-lg font-black outline-none px-1 h-8"
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    value={editDate}
                                                    onChange={(e) => setEditDate(e.target.value)}
                                                    className="bg-accent/50 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest outline-none h-8"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-lg font-black tracking-tight text-orange-600">
                                                    R$ {Number(s.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                                                        {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                                                    </p>
                                                    {s.description && s.description !== 'Venda Avulsa (Lançamento Rápido)' && (
                                                        <span className="text-[7px] font-bold text-muted-foreground/40 border border-muted-foreground/20 rounded-full px-1.5 py-0 truncate max-w-[80px]">
                                                            {s.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 ml-2 transition-opacity">
                                    {editingId === s.id ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleSaveEdit(s)}
                                                className="h-11 w-11 text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-2xl shadow-sm border border-emerald-500/20"
                                            >
                                                <Check className="h-6 w-6" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingId(null)}
                                                className="h-11 w-11 text-white bg-white/10 hover:bg-white/20 rounded-2xl shadow-sm border border-white/10"
                                            >
                                                <X className="h-6 w-6" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => startEditing(s)}
                                                className="h-11 w-11 text-sky-400 bg-sky-500/20 hover:bg-sky-500/30 rounded-2xl shadow-sm border border-sky-500/20"
                                            >
                                                <Edit2 className="h-6 w-6" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteSale(s.id)}
                                                className="h-11 w-11 text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 rounded-2xl shadow-sm border border-rose-500/20"
                                            >
                                                <Trash2 className="h-6 w-6" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {manualSales.length === 0 && (
                        <div className="py-12 text-center opacity-40">
                            <Wallet className="h-10 w-10 mx-auto mb-3" />
                            <p className="text-sm font-medium">Nenhum registro encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Finances;
