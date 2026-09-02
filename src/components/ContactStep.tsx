import { FormEvent, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, LockKeyhole, Mail, Phone, User } from 'lucide-react';
import { AppState, ContactDetails } from '../types';
import {
  createLeadId,
  getLeadErrorMessage,
  getPrivacyUrl,
  isEmailValid,
  isPhoneValid,
  LeadFormMeta,
} from '../lib/leadCapture';

interface Props {
  state: AppState;
  onSubmit: (contact: ContactDetails, meta: LeadFormMeta) => Promise<void>;
  onBack: () => void;
}

export const ContactStep = ({ state, onSubmit, onBack }: Props) => {
  const [name, setName] = useState(state.parentName || '');
  const [phone, setPhone] = useState(state.parentPhone || '');
  const [email, setEmail] = useState(state.parentEmail || '');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [website, setWebsite] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const formStartedAt = useRef(new Date().toISOString());
  const leadId = useRef(createLeadId());

  const isNameValid = name.trim().length >= 2;
  const canSubmit = isNameValid
    && isPhoneValid(phone)
    && isEmailValid(email)
    && acceptedPrivacy
    && !isSending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!canSubmit) {
      setErrorMessage('Проверьте имя, телефон и согласие на обработку данных.');
      return;
    }

    setIsSending(true);
    try {
      await onSubmit(
        { name, phone, email },
        {
          acceptedPrivacy,
          formStartedAt: formStartedAt.current,
          website,
          leadId: leadId.current,
        },
      );
    } catch (error) {
      setErrorMessage(getLeadErrorMessage(error));
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Вернуться к выбору преподавателя"
          className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
          <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Контакты</h2>
          <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 6 ИЗ 6</div>
        </div>
      </header>

      <div className="flex-1 p-[24px] sm:p-[30px] overflow-y-auto">
        <div className="bg-[#E8F1F8] border border-[#0054A6]/10 rounded-[16px] p-[16px] flex items-center text-left gap-4 shadow-sm mb-[20px]">
          <div className="w-12 h-12 bg-white rounded-full shrink-0 flex items-center justify-center shadow-sm">
            <span className="text-[#FFB800] drop-shadow-sm text-[24px]" aria-hidden="true">⭐</span>
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-[#1A1A1B] leading-snug">Все 5 звёзд собраны!</div>
            <div className="text-[13px] text-[#65676B] leading-tight mt-1">
              Оставьте контакты — после сохранения заявки откроется код приветственного подарка.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[18px]" noValidate>
          <div>
            <label htmlFor="parent-name" className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Ваше имя
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <User size={20} />
              </div>
              <input
                id="parent-name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Как к вам обращаться?"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="parent-phone" className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Номер телефона
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <Phone size={20} />
              </div>
              <input
                id="parent-phone"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                maxLength={24}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="parent-email" className="block text-[13px] font-bold text-[#1A1A1B] mb-[8px] uppercase tracking-wide">
              Электронная почта <span className="normal-case font-medium text-[#65676B]">— необязательно</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none text-[#65676B]">
                <Mail size={20} />
              </div>
              <input
                id="parent-email"
                type="email"
                autoComplete="email"
                maxLength={160}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@mail.ru"
                className="w-full pl-[45px] pr-[15px] py-[15px] bg-[#F4F7F9] border border-[#E4E6EB] rounded-[12px] text-[16px] text-[#1A1A1B] focus:border-[#0054A6] focus:bg-white focus:ring-1 focus:ring-[#0054A6] outline-none transition-all placeholder-[#65676B]/50"
              />
            </div>
          </div>

          <div className="hidden" aria-hidden="true">
            <input
              id="company-website"
              name="website"
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>

          <label className="flex items-start gap-3 text-[12px] leading-[1.45] text-[#65676B] cursor-pointer select-none">
            <span className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(event) => setAcceptedPrivacy(event.target.checked)}
                className="peer absolute inset-0 z-10 h-5 w-5 cursor-pointer opacity-0"
              />
              <span className="pointer-events-none w-5 h-5 rounded-[6px] border-2 border-[#B8BDC5] bg-white peer-checked:bg-[#0054A6] peer-checked:border-[#0054A6] peer-focus-visible:ring-2 peer-focus-visible:ring-[#0054A6]/40 flex items-center justify-center transition-colors">
                <Check size={14} className={`text-white ${acceptedPrivacy ? 'opacity-100' : 'opacity-0'}`} />
              </span>
            </span>
            <span>
              Я согласен на обработку персональных данных и принимаю{' '}
              <a href={getPrivacyUrl()} target="_blank" rel="noreferrer" className="text-[#0054A6] underline underline-offset-2 hover:text-[#E31E24]">
                условия обработки данных LCI
              </a>.
            </span>
          </label>

          {errorMessage ? (
            <div role="alert" className="flex items-start gap-2 rounded-[12px] border border-[#E31E24]/20 bg-[#E31E24]/5 p-3 text-[13px] leading-snug text-[#9F1116]">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="pt-[8px]">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-[15px] px-[32px] rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all ${
                canSubmit
                  ? 'bg-[#E31E24] text-white hover:bg-red-700 shadow-[0_5px_15px_rgba(227,30,36,0.3)] active:scale-95 cursor-pointer'
                  : 'bg-[#E4E6EB] text-[#65676B] cursor-not-allowed opacity-70'
              }`}
            >
              <LockKeyhole size={18} />
              {isSending ? 'Сохраняем заявку…' : 'Получить код подарка'}
            </button>
            <p className="text-[11px] text-center text-[#65676B] mt-[12px]">
              Заявка считается принятой только после появления кода.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
