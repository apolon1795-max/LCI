import { CheckCircle2, Globe, Phone, Send } from 'lucide-react';
import { Mascot } from './Mascot';

// Иконка ВКонтакте
const VkIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.162 18.994C6.551 18.994 2.531 14.444 2.378 6h3.46c.102 5.922 2.806 8.441 4.939 8.948V6h3.298v5.105c2.102-.23 4.316-2.617 5.061-5.105h3.298c-.612 3.125-2.887 5.37-4.437 6.452 1.55 1.05 4.14 3.082 5.06 6.542h-3.53c-1.02-2.79-3.235-4.832-5.02-5.06v5.06h-3.345Z"/>
  </svg>
);

export const SuccessStep = ({ onBackToStart }: { onBackToStart: () => void }) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px] overflow-y-auto">
      <div className="flex-1 flex flex-col p-[30px] items-center justify-center space-y-[30px] text-center w-full">
        <div className="relative mt-8 mb-4">
            <Mascot className="w-[180px] h-[180px] shrink-0 drop-shadow-lg" />
            <div className="absolute -bottom-4 -right-2 bg-white rounded-full p-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <CheckCircle2 size={40} className="text-[#0054A6] fill-blue-50" />
            </div>
        </div>
        
        <div className="px-2">
          <h1 className="text-[24px] font-bold text-[#1A1A1B] mb-[15px]">
            Заявка оформлена!
          </h1>
          <p className="text-[14px] text-[#65676B] leading-[1.6] text-balance">
            Мы уже передали ваши контакты администратору. Скоро мы перезвоним, чтобы подтвердить время пробного урока. Успехов вашему ребенку!
          </p>
        </div>

        <div className="w-full bg-[#F4F7F9] rounded-[16px] p-[20px] mt-[10px] border border-[#E4E6EB]">
            <h3 className="text-[13px] font-bold text-[#1A1A1B] uppercase tracking-wide mb-[15px]">
                Наши контакты
            </h3>
            
            <div className="flex flex-col gap-[12px] text-left">
                <a href="tel:88005553535" className="flex items-center gap-[12px] p-[10px] rounded-[8px] hover:bg-white transition-colors text-[#1A1A1B] text-[15px] font-semibold">
                    <div className="w-8 h-8 rounded-full bg-[#E31E24]/10 text-[#E31E24] flex items-center justify-center shrink-0">
                        <Phone size={16} />
                    </div>
                    8 (800) 555-35-35
                </a>
                
                <a href="https://lci-izh.ru" target="_blank" rel="noreferrer" className="flex items-center gap-[12px] p-[10px] rounded-[8px] hover:bg-white transition-colors text-[#1A1A1B] text-[15px] font-semibold">
                    <div className="w-8 h-8 rounded-full bg-[#0054A6]/10 text-[#0054A6] flex items-center justify-center shrink-0">
                        <Globe size={16} />
                    </div>
                    lci-izh.ru
                </a>

                <div className="flex items-center justify-center gap-[15px] mt-[10px] pt-[15px] border-t border-[#E4E6EB]">
                    <a href="#" className="w-[44px] h-[44px] rounded-full bg-[#0077FF]/10 text-[#0077FF] flex items-center justify-center hover:bg-[#0077FF]/20 transition-colors" title="ВКонтакте">
                        <VkIcon size={22} />
                    </a>
                    <a href="#" className="w-[44px] h-[44px] rounded-full bg-[#2AABEE]/10 text-[#2AABEE] flex items-center justify-center hover:bg-[#2AABEE]/20 transition-colors" title="Telegram">
                        <Send size={20} className="ml-[-2px]" />
                    </a>
                </div>
            </div>
        </div>
      </div>

      <div className="p-[20px] shrink-0">
        <button 
            onClick={onBackToStart}
            className="w-full border border-[#E4E6EB] text-[#65676B] font-semibold py-[15px] px-[24px] rounded-[12px] hover:bg-[#F4F7F9] transition-all cursor-pointer"
        >
            Вернуться на главную
        </button>
      </div>
    </div>
  );
};
