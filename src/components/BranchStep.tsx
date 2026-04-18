import { ArrowLeft, MapPin } from 'lucide-react';
import { BRANCHES } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (branchId: string) => void;
  onBack: () => void;
}

export const BranchStep = ({ state, onNext, onBack }: Props) => {
  const selectedBranchObj = BRANCHES.find(b => b.id === state.branch);
  
  // Default coordinates for Izhevsk if no branch is selected
  const mapLat = selectedBranchObj?.coordinates?.[0] || 56.85;
  const mapLng = selectedBranchObj?.coordinates?.[1] || 53.21;
  const mapZ = selectedBranchObj ? 16 : 11;
  const ptParam = selectedBranchObj ? `&pt=${mapLng},${mapLat},pm2rdm` : '';

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Удобный филиал</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 4 ИЗ 5</div>
        </div>
      </header>

      <div className="flex-1 p-[30px] overflow-y-auto space-y-[20px]">
        {/* Yandex Maps Iframe */}
        <div className="w-full h-[220px] rounded-[16px] overflow-hidden border border-[#E4E6EB] mb-[20px] shadow-sm relative shrink-0">
          <iframe 
            src={`https://yandex.ru/map-widget/v1/?ll=${mapLng},${mapLat}&z=${mapZ}${ptParam}`}
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen={true}
            className="absolute inset-0"
          />
        </div>

        <div className="space-y-[12px] pb-[10px]">
        {BRANCHES.map((branch) => {
          const isSelected = state.branch === branch.id;
          return (
            <button
              key={branch.id}
              onClick={() => onNext(branch.id)}
              className={`w-full flex items-start p-[16px] rounded-[16px] border-2 transition-all cursor-pointer text-left ${
                isSelected 
                  ? 'border-[#E31E24] bg-white ring-1 ring-[#E31E24]' 
                  : 'border-white bg-white/60 hover:border-[#0054A6] hover:bg-white'
              }`}
            >
              <div className={`p-2 rounded-full mr-[15px] shrink-0 ${isSelected ? 'bg-[#E31E24]/10 text-[#E31E24]' : 'bg-[#F4F7F9] text-[#65676B]'}`}>
                <MapPin size={24} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="font-bold text-[15px] text-[#1A1A1B]">
                    {branch.name}
                </div>
                <div className="text-[13px] text-[#65676B] mt-[2px]">
                    {branch.address}
                </div>
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};
