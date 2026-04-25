import { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { BRANCHES } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (branchId: string) => void;
  onBack: () => void;
}

export const BranchStep = ({ state, onNext, onBack }: Props) => {
  const [localBranch, setLocalBranch] = useState<string | null>(state.branch);
  const selectedBranchObj = BRANCHES.find(b => b.id === localBranch);
  
  const mapUrl = selectedBranchObj 
    ? `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent('Ижевск, ' + selectedBranchObj.address)}&z=16`
    : `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent('Ижевск')}&z=11`;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Удобный филиал</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 4 ИЗ 6</div>
        </div>
      </header>

      <div className="flex-1 p-[30px] overflow-y-auto space-y-[20px] flex flex-col">
        {/* Yandex Maps Iframe */}
        <div className="w-full h-[220px] rounded-[16px] overflow-hidden border border-[#E4E6EB] mb-[20px] shadow-sm relative shrink-0">
          <iframe 
            src={mapUrl}
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen={true}
            className="absolute inset-0"
          />
        </div>

        <div className="space-y-[12px] pb-[10px] flex-1">
        {BRANCHES.map((branch) => {
          const isSelected = localBranch === branch.id;
          return (
            <button
              key={branch.id}
              onClick={() => setLocalBranch(branch.id)}
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
                <div className="text-[13px] text-[#65676B] mt-[2px] mb-[6px]">
                    {branch.address}
                </div>
                <div className="bg-[#F8FAFC] rounded-[8px] p-2.5 flex flex-col text-[12px] text-[#1A1A1B] leading-snug space-y-2 mt-2">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-[#65676B]">Режим работы:</span>
                        <div className="text-right whitespace-pre-line">{branch.schedule}</div>
                    </div>
                    {branch.phone && (
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#65676B]">Телефон:</span>
                            <span className="font-medium text-[#0054A6]">{branch.phone}</span>
                        </div>
                    )}
                    {branch.email && (
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#65676B]">Email:</span>
                            <span className="font-medium text-[#0054A6]">{branch.email}</span>
                        </div>
                    )}
                </div>
              </div>
            </button>
          );
        })}
        </div>

        <button 
          onClick={() => localBranch && onNext(localBranch)}
          disabled={!localBranch}
          className={`w-full py-[15px] px-[32px] rounded-[12px] font-bold text-[16px] flex items-center justify-center transition-all shrink-0 mt-[10px] ${
              localBranch
                  ? 'bg-[#E31E24] text-white hover:bg-red-700 shadow-[0_5px_15px_rgba(227,30,36,0.3)] active:scale-95 cursor-pointer' 
                  : 'bg-[#E4E6EB] text-[#65676B] cursor-not-allowed opacity-70'
          }`}
        >
          Далее
        </button>
      </div>
    </div>
  );
};
