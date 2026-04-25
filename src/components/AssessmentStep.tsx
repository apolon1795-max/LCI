import { ArrowLeft } from 'lucide-react';
import { ASSESSMENTS } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (assessmentId: string) => void;
  onBack: () => void;
}

export const AssessmentStep = ({ state, onNext, onBack }: Props) => {
  const gradeNum = parseInt(state.grade?.match(/\d+/)?.[0] || '1', 10);
  
  const displayAssessments = ASSESSMENTS.map(ass => {
    if (ass.id === 'exam' && gradeNum < 9) {
      return {
        ...ass,
        title: 'Подготовка к ВПР и олимпиадам',
        description: 'Целенаправленная подготовка к контрольным работам и школьным олимпиадам',
        emoji: '🏆'
      };
    }
    return ass;
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Какая у вас цель?</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 3 ИЗ 5</div>
        </div>
      </header>

      <div className="flex-1 p-[20px] overflow-y-auto space-y-[12px]">
        {displayAssessments.map((ass) => {
          const isSelected = state.assessment === ass.id;
          return (
            <button
              key={ass.id}
              onClick={() => onNext(ass.id)}
              className={`w-full flex items-start p-[16px] rounded-[16px] border-2 transition-all cursor-pointer text-left ${
                isSelected 
                  ? 'border-[#E31E24] bg-white ring-1 ring-[#E31E24]' 
                  : 'border-white bg-white/60 hover:border-[#0054A6] hover:bg-white'
              }`}
            >
              <div className="w-[44px] h-[44px] shrink-0 flex items-center justify-center bg-[#F4F7F9] rounded-full text-[22px] mr-[12px]">
                {ass.emoji}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="font-bold text-[15px] text-[#1A1A1B]">
                    {ass.title}
                </div>
                <div className="text-[13px] text-[#65676B] mt-[2px] leading-tight text-balance">
                    {ass.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
