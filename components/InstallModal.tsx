import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, ArrowUpCircle } from 'lucide-react';

interface InstallModalProps {
  deferredPrompt: any;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ deferredPrompt, onClose }) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check for iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIos);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-primary/10 p-8 flex justify-center">
          <div className="relative">
            <Smartphone className="w-16 h-16 text-primary" />
            <Download className="w-6 h-6 text-primary absolute -bottom-1 -right-1 bg-card rounded-full p-1" />
          </div>
        </div>
        
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Instalar App</h3>
          <p className="text-sm text-muted-foreground mb-8">
            {isIOS 
              ? 'Adicione à tela de início para usar o OvoControl como um aplicativo nativo e ter acesso offline.'
              : 'Deseja instalar o OvoControl no seu celular para acesso rápido e modo offline?'}
          </p>

          {isIOS ? (
            <div className="space-y-4 mb-6 text-left bg-muted/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-xs">Toque no ícone de <b>Compartilhar</b> <Share className="w-4 h-4 inline mb-1" /></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-xs">Role para baixo e selecione <b>"Adicionar à Tela de Início"</b> <PlusSquare className="w-4 h-4 inline mb-1" /></p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {!isIOS && deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="w-full py-4 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Instalar Agora
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all active:scale-95"
            >
              {isIOS ? 'Entendi' : 'Agora Não'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
