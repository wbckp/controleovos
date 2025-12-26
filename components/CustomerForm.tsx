
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Save, User, Phone, FileText, Camera } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface CustomerFormProps {
    initialData?: Customer;
    onSave: (customer: Customer) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [notes, setNotes] = useState(initialData?.notes || '');

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length === 0) return '';
        if (numbers.length <= 2) return `(${numbers}`;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleSave = () => {
        if (!name) return;

        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const customer: Customer = {
            id: initialData?.id || '',
            name,
            phone,
            notes,
            avatarUrl: initialData?.avatarUrl,
            initials: initials || '?'
        };

        onSave(customer);
    };

    const isFormValid = name.length > 2;

    return (
        <div className="flex flex-col h-full bg-background max-w-lg mx-auto w-full">
            <header className="flex items-center justify-between px-4 pt-8 pb-4 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-md">
                <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground font-bold">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                </Button>
                <h1 className="text-lg font-black tracking-tight">
                    {initialData ? 'Editar Cliente' : 'Novo Cliente'}
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
                        Salvar
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
                {/* Avatar Placeholder */}
                <div className="flex justify-center py-4">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-[2rem] bg-accent/50 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden">
                            {initialData?.avatarUrl ? (
                                <img src={initialData.avatarUrl} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <button className="absolute -bottom-1 -right-1 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg active:scale-95 transition-transform">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Name Input */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                    <div className="relative group">
                        <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-base font-bold"
                            placeholder="Digite o nome do cliente..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Phone Input */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone / WhatsApp</Label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-base font-bold"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                        />
                    </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Observações</Label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Textarea
                            className="min-h-32 pl-12 pt-4 rounded-3xl border bg-card shadow-sm text-base font-medium resize-none"
                            placeholder="Preferências, endereço, dias de entrega..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
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
                    {initialData ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </Button>
            </div>
        </div>
    );
};

export default CustomerForm;
