
import React, { useState } from 'react';
import { Customer, Sale, PaymentStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Save, UserPlus, Package, DollarSign, Calendar, CheckCircle2, Clock, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NewSaleFormProps {
  customers: Customer[];
  onSave: (sale: Sale) => void;
  onCancel: () => void;
  onAddNewCustomer: (customer: Customer) => void;
  onNavigateToNewCustomer?: () => void;
  initialData?: Sale;
  initialCustomerId?: string;
}

const NewSaleForm: React.FC<NewSaleFormProps> = ({ customers, onSave, onCancel, onAddNewCustomer, onNavigateToNewCustomer, initialData, initialCustomerId }) => {
  const [customerId, setCustomerId] = useState(initialData?.customerId || initialCustomerId || '');
  const [quantity, setQuantity] = useState(initialData?.quantity.toString() || '');
  const [value, setValue] = useState(initialData?.value.toString() || '');
  const [status, setStatus] = useState<PaymentStatus>(initialData?.status || PaymentStatus.PAID);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);



  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSave = () => {
    if (!customerId || !quantity || !value) return;

    const client = customers.find(c => c.id === customerId);

    const saleData: Sale = {
      id: initialData?.id || Math.floor(Math.random() * 10000).toString(),
      customerId,
      customerName: client?.name || 'Cliente Desconhecido',
      quantity: Number(quantity),
      value: Number(value),
      date,
      status,
      description: `${quantity} Dúzias - Ovos`
    };

    onSave(saleData);
  };

  const isFormValid = customerId && quantity && value;

  return (
    <div className="flex flex-col h-full bg-background max-w-lg mx-auto w-full">
      <header className="flex items-center justify-between px-4 pt-8 pb-4 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-md">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground font-bold">
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <h1 className="text-lg font-black tracking-tight">
          {initialData ? 'Editar Venda' : 'Nova Venda'}
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!isFormValid}
            className={`font-black uppercase tracking-widest text-xs ${isFormValid ? 'text-primary' : 'text-muted-foreground opacity-50'}`}
          >
            {isFormValid && <Save className="mr-2 h-3.5 w-3.5" />}
            {initialData ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        {/* Customer Select */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cliente</Label>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary font-bold text-xs group"
              onClick={onNavigateToNewCustomer}
            >
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              Novo Cliente
            </Button>
          </div>
          <div className="relative group">
            <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-base font-bold text-foreground">
                <SelectValue placeholder="Selecione um cliente..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl border-none">
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id} className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qtd. Ovos</Label>
            <div className="relative group">
              <Package className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="number"
                className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-lg font-black"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <span className="absolute right-4 top-4.5 text-[10px] font-black text-muted-foreground uppercase opacity-40">dz</span>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor Total</Label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="number"
                step="0.01"
                className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-lg font-black"
                placeholder="0,00"
                value={value}
                onChange={handleValueChange}
              />
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status Final</Label>
          <div className="bg-accent/50 p-1 rounded-2xl flex relative h-14 border shadow-inner">
            <button
              className={`flex-1 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${status === PaymentStatus.PAID ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground opacity-60'}`}
              onClick={() => setStatus(PaymentStatus.PAID)}
            >
              <CheckCircle2 className={`mr-2 h-4 w-4 ${status === PaymentStatus.PAID ? 'fill-primary text-background' : ''}`} />
              Pago
            </button>
            <button
              className={`flex-1 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${status === PaymentStatus.PENDING ? 'bg-background text-destructive shadow-sm' : 'text-muted-foreground opacity-60'}`}
              onClick={() => setStatus(PaymentStatus.PENDING)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Pendente
            </button>
          </div>
        </div>

        {/* Date Section */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data do Pedido</Label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-4 h-5 w-5 text-primary" />
            <Input
              type="date"
              className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-base font-bold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12 z-20 max-w-lg mx-auto">
        <Button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`w-full h-14 rounded-2xl shadow-xl font-black text-lg transition-all active:scale-[0.97] uppercase tracking-tighter ${isFormValid ? 'bg-primary text-primary-foreground' : 'bg-muted opacity-50'}`}
        >
          <Save className="mr-2 h-5 w-5" />
          {initialData ? 'Atualizar Venda' : 'Finalizar Pedido'}
        </Button>
      </div>
    </div>
  );
};

export default NewSaleForm;

