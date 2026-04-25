import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { TEACHERS } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (teacherId: string) => void;
  onBack: () => void;
}

export const TeacherStep = ({ state, onNext, onBack }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const matchingTeachers = TEACHERS.filter(t => 
    (!state.subject || t.subjects.includes(state.subject)) && 
    (!state.branch || t.branches.includes(state.branch))
  );

  const displayTeachers = matchingTeachers.length > 0 ? matchingTeachers : TEACHERS;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -clientWidth : clientWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      if(index !== activeIndex) {
          setActiveIndex(index);
      }
    };
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-2 flex-1 pt-1">
            <h2 className="font-bold text-[18px] text-[#1A1A1B] leading-none">Выбор преподавателя</h2>
            <div className="text-[11px] font-semibold uppercase text-[#65676B] mt-1 track-widest">ШАГ 5 ИЗ 6</div>
        </div>
      </header>

      <div className="flex-1 relative bg-transparent overflow-hidden flex flex-col sm:rounded-b-[24px]">
        
        <div 
          ref={scrollRef}
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
        >
          {displayTeachers.map((teacher) => (
             <div key={teacher.id} className="w-full shrink-0 snap-center flex justify-center p-[20px] pb-[105px]">
                <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-y-auto flex flex-col w-full max-w-sm border border-[#E4E6EB]">
                   <div className="w-full h-[280px] shrink-0 bg-gray-100 relative">
                       <img 
                          src={teacher.photoUrl} 
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                   </div>
                   
                   <div className="p-[20px] flex-1 flex flex-col items-center text-center">
                        <h3 className="font-bold text-[22px] text-[#1A1A1B] mb-[15px]">
                          {teacher.name}
                        </h3>
                        
                        <div className="bg-[rgba(227,30,36,0.06)] text-[#0054A6] p-[15px] rounded-[12px] mb-[15px] w-full border-l-4 border-[#E31E24]">
                           <p className="font-bold text-[15px] italic leading-snug">
                             {teacher.quote}
                           </p>
                        </div>
                        
                        <p className="text-[14px] text-[#65676B] leading-[1.6]">
                          {teacher.description}
                        </p>
                    </div>
                </div>
             </div>
          ))}
        </div>

        {/* Pagination & Arrows */}
        <div className="absolute top-[35%] -translate-y-1/2 left-[10px]">
           <button 
              onClick={() => scroll('left')}
              disabled={activeIndex === 0}
              className={`p-2 rounded-full bg-white/95 backdrop-blur shadow-lg text-[#1A1A1B] transition-all hover:scale-110 active:scale-95 ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           >
              <ChevronLeft size={28} />
           </button>
        </div>
        <div className="absolute top-[35%] -translate-y-1/2 right-[10px]">
           <button 
              onClick={() => scroll('right')}
              disabled={activeIndex === displayTeachers.length - 1}
              className={`p-2 rounded-full bg-white/95 backdrop-blur shadow-lg text-[#1A1A1B] transition-all hover:scale-110 active:scale-95 ${activeIndex === displayTeachers.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           >
              <ChevronRight size={28} />
           </button>
        </div>
        
        {/* Dots */}
        <div className="absolute bottom-[95px] left-0 right-0 flex justify-center gap-2 pointer-events-none">
            {displayTeachers.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-[#0054A6]' : 'w-2 bg-[#E4E6EB]'}`} />
            ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-[20px] bg-white border-t border-[#E4E6EB] sm:rounded-b-[24px] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
           <button 
             onClick={() => onNext(displayTeachers[activeIndex].id)}
             className="w-full py-[15px] px-[32px] rounded-[12px] font-bold text-[16px] text-white bg-[#E31E24] hover:bg-red-700 transition-all shadow-[0_5px_15px_rgba(227,30,36,0.3)] active:scale-95 flex items-center justify-center cursor-pointer"
           >
             К оформлению заявки
           </button>
        </div>
      </div>
    </div>
  );
};
