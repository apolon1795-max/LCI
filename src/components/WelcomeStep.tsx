import { Mascot } from './Mascot';

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] p-[30px] sm:rounded-[24px] shadow-[0_10px_30px_rgba(0,84,166,0.05)]">
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-[10px]">
        
        <Mascot className="w-[240px] h-[240px] mb-[20px] shrink-0 drop-shadow-xl" />
        
        <div className="mt-[10px] text-center w-full">
          <h1 className="text-[26px] font-bold mb-[12px] text-[#1A1A1B]">
            Привет! Я LCI-Бот
          </h1>
          <p className="text-[15px] font-medium leading-[1.6] text-[#65676B] text-balance">
            Помогу быстро подобрать идеального преподавателя для вашего ребенка. Начнем?
          </p>
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full mt-[30px] bg-[#E31E24] hover:bg-red-700 text-white font-bold py-[16px] px-[40px] uppercase rounded-[16px] shadow-[0_5px_15px_rgba(227,30,36,0.3)] transition-all active:scale-95 text-[16px] shrink-0"
      >
        Начать запись
      </button>
    </div>
  );
};
