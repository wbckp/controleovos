
import React from 'react';
import { AppScreen } from '../types';
import { LayoutDashboard, Users, Wallet, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onAddClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, onAddClick }) => {
  return (
    <div className="fixed bottom-0 w-full max-w-lg mx-auto bg-card/95 backdrop-blur-lg border-t z-30 pb-6 px-4 left-0 right-0">
      <div className="flex justify-around items-center h-16 relative">
        <button
          onClick={() => onNavigate(AppScreen.DASHBOARD)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${currentScreen === AppScreen.DASHBOARD ? 'text-primary scale-110' : 'text-muted-foreground opacity-60'}`}
        >
          <LayoutDashboard className={`h-5 w-5 ${currentScreen === AppScreen.DASHBOARD ? 'fill-primary/40' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
        </button>

        <button
          onClick={() => onNavigate(AppScreen.CLIENT_LIST)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${currentScreen === AppScreen.CLIENT_LIST || currentScreen === AppScreen.CLIENT_DETAIL ? 'text-primary scale-110' : 'text-muted-foreground opacity-60'}`}
        >
          <Users className={`h-5 w-5 ${currentScreen === AppScreen.CLIENT_LIST ? 'fill-primary/40' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Clientes</span>
        </button>

        <div className="relative flex-1 flex justify-center h-full">
          <div className="absolute -top-10">
            <Button
              onClick={onAddClick}
              size="icon"
              className="bg-primary text-primary-foreground rounded-3xl w-16 h-16 shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 group border-4 border-background"
            >
              <Plus className="h-10 w-10 transition-transform group-hover:rotate-90" />
            </Button>
          </div>
        </div>

        <button
          onClick={() => onNavigate(AppScreen.FINANCES)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${currentScreen === AppScreen.FINANCES ? 'text-primary scale-110' : 'text-muted-foreground opacity-60'}`}
        >
          <Wallet className={`h-5 w-5 ${currentScreen === AppScreen.FINANCES ? 'fill-primary/40' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Finanças</span>
        </button>

        <button
          onClick={() => onNavigate(AppScreen.SETTINGS)}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${currentScreen === AppScreen.SETTINGS ? 'text-primary scale-110' : 'text-muted-foreground opacity-60'}`}
        >
          <Settings className={`h-5 w-5 ${currentScreen === AppScreen.SETTINGS ? 'fill-primary/40' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;

