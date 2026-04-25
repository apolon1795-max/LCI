import { ArrowLeft } from 'lucide-react';
import { SUBJECTS } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (subjectId: string) => void;
  onBack: () => void;
}

export const SubjectStep = ({ state, onNext, onBack }: Props) => {
  const gradeNum = parseInt(state.grade?.match(/\d+/)?.[0] || '1', 10);
  const availableSubjects = SUBJECTS.filter(s => !s.minGrade || gradeNum >= s.minGrade);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Выберите предмет</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 2 ИЗ 5</div>
        </div>
      </header>

      <div className="flex-1 p-[30px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-[20px]">
          {availableSubjects.map((sub) => {
            const isSelected = state.subject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onNext(sub.id)}
                className={`flex flex-col items-center p-[20px] rounded-[16px] border-2 transition-all cursor-pointer text-center gap-[10px] ${
                  isSelected 
                    ? 'border-[#E31E24] bg-[rgba(227,30,36,0.02)] shadow-sm' 
                    : 'border-[#E4E6EB] bg-white hover:border-[#0054A6] hover:bg-[rgba(0,84,166,0.02)] shadow-sm'
                }`}
              >
                <div className="text-[40px] leading-none drop-shadow-sm mb-1 text-center flex justify-center w-full">
                    {sub.emoji}
                </div>
                <span className="font-bold text-[16px] text-[#1A1A1B]">
                    {sub.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
