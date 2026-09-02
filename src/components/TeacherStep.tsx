import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, Sparkles, VideoOff } from 'lucide-react';
import { SUBJECTS, TEACHERS } from '../data';
import { AppState } from '../types';

interface Props {
  state: AppState;
  onNext: (teacherId: string) => void;
  onBack: () => void;
}

export const TeacherStep = ({ state, onNext, onBack }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayTeachers = useMemo(() => {
    const matching = TEACHERS.filter((teacher) => (
      (!state.subject || teacher.subjects.includes(state.subject))
      && (!state.branch || teacher.branches.includes(state.branch))
    ));
    return matching.length > 0 ? matching : TEACHERS;
  }, [state.branch, state.subject]);

  const selectedSubjectName = SUBJECTS.find((subject) => subject.id === state.subject)?.name;

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0 });
  }, [state.branch, state.subject]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const handleScroll = () => {
      const index = Math.round(element.scrollLeft / Math.max(element.clientWidth, 1));
      setActiveIndex((previous) => previous === index ? previous : index);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction === 'left' ? -element.clientWidth : element.clientWidth,
      behavior: 'smooth',
    });
  };

  const selectedTeacher = displayTeachers[activeIndex] || displayTeachers[0];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-[#E8F1F8] to-[#FFFFFF] sm:rounded-[24px]">
      <header className="px-[30px] h-[70px] flex items-center border-b border-[#E4E6EB]/50 bg-transparent sm:rounded-t-[24px] z-10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Вернуться к выбору филиала"
          className="p-2 -ml-2 text-[#65676B] hover:text-[#1A1A1B] rounded-full hover:bg-black/5 transition-colors"
        >
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
            <article key={teacher.id} className="w-full shrink-0 snap-center flex justify-center p-[20px] pb-[110px]">
              <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-y-auto flex flex-col w-full max-w-sm border border-[#E4E6EB]">
                <div className="w-full h-[270px] shrink-0 bg-gray-100 relative overflow-hidden">
                  {teacher.videoUrl ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={teacher.videoPosterUrl || teacher.photoUrl}
                      aria-label={`Видеовизитка: ${teacher.name}`}
                      className="w-full h-full object-cover bg-black"
                    >
                      <source src={teacher.videoUrl} type="video/mp4" />
                      Ваш браузер не поддерживает видео.
                    </video>
                  ) : (
                    <>
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-xl bg-black/55 px-3 py-2 text-left text-white backdrop-blur-sm">
                        <VideoOff size={18} className="shrink-0" />
                        <span className="text-[12px] font-semibold">Видеовизитка появится после съёмки LCI</span>
                      </div>
                    </>
                  )}

                  {teacher.isDemo ? (
                    <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-[#0054A6]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur">
                      Демо-профиль
                    </span>
                  ) : null}
                </div>

                <div className="p-[20px] flex-1 flex flex-col items-center text-center">
                  <div className="mb-3 flex items-center gap-1.5 rounded-full bg-[#FFB800]/10 px-3 py-1.5 text-[12px] font-bold text-[#8A6200]">
                    <Sparkles size={15} />
                    Подходит по выбору{selectedSubjectName ? `: ${selectedSubjectName}` : ''}
                  </div>

                  <h3 className="font-bold text-[22px] text-[#1A1A1B] mb-[14px]">
                    {teacher.name}
                  </h3>

                  <div className="bg-[rgba(227,30,36,0.06)] text-[#0054A6] p-[15px] rounded-[12px] mb-[14px] w-full border-l-4 border-[#E31E24]">
                    <p className="font-bold text-[14px] italic leading-snug">{teacher.quote}</p>
                  </div>

                  <p className="text-[13px] text-[#65676B] leading-[1.55]">{teacher.description}</p>

                  {teacher.videoUrl ? (
                    <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#0054A6]">
                      <PlayCircle size={17} />
                      Посмотрите видео перед выбором
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute top-[35%] -translate-y-1/2 left-[10px]">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={activeIndex === 0}
            aria-label="Предыдущий преподаватель"
            className={`p-2 rounded-full bg-white/95 backdrop-blur shadow-lg text-[#1A1A1B] transition-all hover:scale-110 active:scale-95 ${
              activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronLeft size={28} />
          </button>
        </div>
        <div className="absolute top-[35%] -translate-y-1/2 right-[10px]">
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={activeIndex === displayTeachers.length - 1}
            aria-label="Следующий преподаватель"
            className={`p-2 rounded-full bg-white/95 backdrop-blur shadow-lg text-[#1A1A1B] transition-all hover:scale-110 active:scale-95 ${
              activeIndex === displayTeachers.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="absolute bottom-[100px] left-0 right-0 flex justify-center gap-2 pointer-events-none" aria-hidden="true">
          {displayTeachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-[#0054A6]' : 'w-2 bg-[#C8CDD3]'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-[20px] bg-white border-t border-[#E4E6EB] sm:rounded-b-[24px] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => selectedTeacher && onNext(selectedTeacher.id)}
            disabled={!selectedTeacher}
            className="w-full py-[15px] px-[24px] rounded-[12px] font-bold text-[16px] text-white bg-[#E31E24] hover:bg-red-700 transition-all shadow-[0_5px_15px_rgba(227,30,36,0.3)] active:scale-95 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {selectedTeacher ? `Выбрать: ${selectedTeacher.name}` : 'Выбрать преподавателя'}
          </button>
        </div>
      </div>
    </div>
  );
};
