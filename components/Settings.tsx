
import React, { useState } from 'react';
import { AppSettings as AppSettingsType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save, Image as ImageIcon, Type, Palette, ShieldCheck, LogOut, X, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SettingsProps {
    settings: AppSettingsType;
    onSaveSettings: (settings: AppSettingsType) => void;
    onLogout: () => void;
    loading?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings, onLogout, loading }) => {
    const [appName, setAppName] = useState(settings.appName);
    const [appLogo, setAppLogo] = useState(settings.appLogo);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('A imagem deve ter no máximo 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAppLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSaveSettings({ appName, appLogo });
    };

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 max-w-lg mx-auto bg-background min-h-full">
            <header className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">{settings.appName}</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1">Configurações do Sistema</p>
                </div>
                <ThemeToggle />
            </header>

            <div className="space-y-6">
                {/* Branding Section */}
                <Card className="border shadow-sm bg-card overflow-hidden">
                    <CardHeader className="p-4 pb-2 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Personalização</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Aplicativo</Label>
                            <div className="relative group">
                                <Type className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    className="h-14 pl-12 rounded-2xl border bg-card shadow-sm text-lg font-black uppercase"
                                    placeholder="Ex: OvoControl"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo do Aplicativo</Label>
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-3xl bg-accent/20 border-4 border-dashed border-muted flex items-center justify-center overflow-hidden shadow-inner transition-all group-hover:border-primary/50 relative">
                                        {appLogo ? (
                                            <img src={appLogo} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                                        )}
                                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                            />
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <Save className="h-6 w-6" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Mudar Foto</span>
                                            </div>
                                        </label>
                                    </div>
                                    {appLogo && (
                                        <button
                                            onClick={() => setAppLogo('')}
                                            className="absolute -top-2 -right-2 h-8 w-8 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg border-2 border-card active:scale-90 transition-transform"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-bold">Toque na imagem para subir a foto</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Tamanho máximo recomendado: 2MB</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card className="border shadow-sm bg-card overflow-hidden">
                    <CardHeader className="p-4 pb-2 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Conta e Sessão</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Button
                            variant="destructive"
                            className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-destructive/10"
                            onClick={onLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Finalizar Sessão (Sair)
                        </Button>
                    </CardContent>
                </Card>

                {/* Action Button */}
                <Button
                    onClick={handleSave}
                    disabled={loading || appName === ''}
                    className="w-full h-14 rounded-2xl shadow-xl font-black text-lg transition-all active:scale-[0.97] uppercase tracking-tighter bg-primary text-primary-foreground"
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    {loading ? 'Sincronizando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
