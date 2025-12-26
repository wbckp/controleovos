
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'destructive' | 'primary';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'destructive'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Dialog */}
            <Card className="relative w-full max-w-sm border-none shadow-2xl animate-in zoom-in-95 fade-in duration-200 bg-card overflow-hidden">
                <div className={`h-1.5 w-full ${variant === 'destructive' ? 'bg-destructive' : 'bg-primary'}`} />
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl flex-none ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tight">{title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl font-bold border-muted-foreground/20"
                            onClick={onCancel}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            variant={variant === 'destructive' ? 'destructive' : 'default'}
                            className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-destructive/20"
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </CardContent>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-accent transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </Card>
        </div>
    );
};

export default ConfirmDialog;
