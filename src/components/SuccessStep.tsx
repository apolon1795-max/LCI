import { CheckCircle2, Globe, Phone, Send, Star } from 'lucide-react';
import { Mascot } from './Mascot';

// Иконка ВКонтакте
const VkIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.162 18.994C6.551 18.994 2.531 14.444 2.378 6h3.46c.102 5.922 2.806 8.441 4.939 8.948V6h3.298v5.105c2.102-.23 4.316-2.617 5.061-5.105h3.298c-.612 3.125-2.887 5.37-4.437 6.452 1.55 1.05 4.14 3.082 5.06 6.542h-3.53c-1.02-2.79-3.235-4.832-5.02-5.06v5.06h-3.345Z"/>
  </svg>
);

// Иконка WhatsApp
const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const SuccessStep = ({ onBackToStart }: { onBackToStart: () => void }) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px] overflow-y-auto">
      <div className="flex-1 flex flex-col p-[30px] items-center justify-center space-y-[20px] text-center w-full">
        <div className="relative mt-4 mb-2">
            <Mascot className="w-[140px] h-[140px] shrink-0 drop-shadow-lg" />
            <div className="absolute -bottom-2 -right-1 bg-white rounded-full p-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <CheckCircle2 size={32} className="text-[#0054A6] fill-blue-50" />
            </div>
        </div>
        
        <div className="px-2">
          <h1 className="text-[24px] font-bold text-[#1A1A1B] mb-[10px]">
            Заявка оформлена!
          </h1>
          <p className="text-[14px] text-[#65676B] leading-[1.5] text-balance">
            Мы уже передали ваши контакты администратору. Скоро мы перезвоним, чтобы подтвердить время пробного урока. Успехов вашему ребенку!
          </p>
        </div>

        <div className="w-full bg-[#E8F1F8] border border-[#0054A6]/10 rounded-[16px] p-[16px] flex items-center text-left gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.04] pointer-events-none">
                <Star size={100} className="fill-[#0054A6]" />
            </div>
            <div className="w-12 h-12 bg-white rounded-full shrink-0 flex items-center justify-center shadow-sm relative z-10">
                <Star size={24} className="fill-[#FFB800] text-[#FFB800] drop-shadow-sm" />
            </div>
            <div className="relative z-10 flex-1">
                <div className="text-[13px] text-[#0054A6] font-semibold leading-tight mb-1">Вы собрали все звезды!</div>
                <div className="text-[14px] font-bold text-[#1A1A1B] leading-snug">Приветственный набор ждет ребенка на пробном занятии</div>
            </div>
        </div>

        <div className="w-full bg-[#F4F7F9] rounded-[16px] p-[20px] mt-[10px] border border-[#E4E6EB]">
            <h3 className="text-[13px] font-bold text-[#1A1A1B] uppercase tracking-wide mb-[15px]">
                Наши контакты
            </h3>
            
            <div className="flex flex-col gap-[12px] text-left">
                <a href="tel:+79127502304" className="flex items-center gap-[12px] p-[10px] rounded-[8px] hover:bg-white transition-colors text-[#1A1A1B] text-[15px] font-semibold">
                    <div className="w-8 h-8 rounded-full bg-[#E31E24]/10 text-[#E31E24] flex items-center justify-center shrink-0">
                        <Phone size={16} />
                    </div>
                    +7 (912) 750-23-04
                </a>
                
                <a href="https://lci-izh.ru" target="_blank" rel="noreferrer" className="flex items-center gap-[12px] p-[10px] rounded-[8px] hover:bg-white transition-colors text-[#1A1A1B] text-[15px] font-semibold">
                    <div className="w-8 h-8 rounded-full bg-[#0054A6]/10 text-[#0054A6] flex items-center justify-center shrink-0">
                        <Globe size={16} />
                    </div>
                    lci-izh.ru
                </a>

                <div className="flex items-center justify-center gap-[15px] mt-[10px] pt-[15px] border-t border-[#E4E6EB]">
                    <a href="https://vk.com/lci_izh" target="_blank" rel="noreferrer" className="w-[44px] h-[44px] rounded-full bg-[#0077FF]/10 text-[#0077FF] flex items-center justify-center hover:bg-[#0077FF]/20 transition-colors" title="ВКонтакте">
                        <VkIcon size={22} />
                    </a>
                    <a href="#" className="w-[44px] h-[44px] rounded-full bg-[#2AABEE]/10 text-[#2AABEE] flex items-center justify-center hover:bg-[#2AABEE]/20 transition-colors" title="Telegram">
                        <Send size={20} className="ml-[-2px]" />
                    </a>
                    <a href="https://wa.me/79127502304" target="_blank" rel="noreferrer" className="w-[44px] h-[44px] rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors" title="WhatsApp">
                        <WhatsAppIcon size={22} />
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
