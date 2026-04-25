import { useState, FormEvent } from 'react';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (contact: { name: string; phone: string; email: string }) => void;
  onBack: () => void;
}

export const ContactStep = ({ state, onNext, onBack }: Props) => {
  const [name, setName] = useState(state.parentName || '');
  const [phone, setPhone] = useState(state.parentPhone || '');
  const [email, setEmail] = useState(state.parentEmail || '');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;
    
    setIsSending(true);
    
    // Эмуляция отправки данных (здесь будет интеграция с Telegram/Google Sheets)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onNext({ name, phone, email });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Оформление</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 6 ИЗ 6</div>
        </div>
      </header>

      <div className="flex-1 p-[30px] overflow-y-auto">
        <div className="bg-[#E8F1F8] border border-[#0054A6]/10 rounded-[16px] p-[16px] flex items-center text-left gap-4 shadow-sm mb-[20px]">
            <div className="w-12 h-12 bg-white rounded-full shrink-0 flex items-center justify-center shadow-sm relative z-10">
                <span className="text-[#FFB800] drop-shadow-sm text-[24px]">⭐</span>
            </div>
            <div className="relative z-10 flex-1">
                <div className="text-[14px] font-bold text-[#1A1A1B] leading-snug">Супер! Вы собрали все 5 звезд!</div>
                <div className="text-[13px] text-[#65676B] leading-tight mt-1">Оставьте контакты, чтобы забронировать место и забрать приветственный набор.</div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[20px]">
          <div>
            <label className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Ваше имя
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <User size={20} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться?"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Номер телефона
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Электронная почта
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div className="pt-[20px]">
             <button 
                type="submit"
                disabled={!name.trim() || !phone.trim() || !email.trim() || isSending}
                className={`w-full py-[15px] px-[32px] rounded-[12px] font-bold text-[16px] flex items-center justify-center transition-all ${
                    name.trim() && phone.trim() && email.trim() && !isSending
                        ? 'bg-[#E31E24] text-white hover:bg-red-700 shadow-[0_5px_15px_rgba(227,30,36,0.3)] active:scale-95 cursor-pointer' 
                        : 'bg-[#E4E6EB] text-[#65676B] cursor-not-allowed opacity-70'
                }`}
             >
                {isSending ? 'Отправка...' : 'Отправить заявку'}
             </button>
             <p className="text-[11px] text-center text-[#65676B] mt-[15px]">
                Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности.
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};
