import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { AppStep, AppState } from './types';
import { WelcomeStep } from './components/WelcomeStep';
import { SubjectStep } from './components/SubjectStep';
import { AssessmentStep } from './components/AssessmentStep';
import { GradeStep } from './components/GradeStep';
import { BranchStep } from './components/BranchStep';
import { TeacherStep } from './components/TeacherStep';
import { ContactStep } from './components/ContactStep';
import { SuccessStep } from './components/SuccessStep';

const STEP_ORDER: AppStep[] = ['welcome', 'grade', 'subject', 'assessment', 'branch', 'teacher', 'contact', 'success'];

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [state, setState] = useState<AppState>({
    subject: null,
    assessment: null,
    grade: null,
    branch: null,
    teacher: null,
    parentName: null,
    parentPhone: null,
    parentEmail: null,
  });

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = (target: AppStep) => {
    setStep(target);
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  
  // Calculate collected stars based on current step progress
  const starsCount = useMemo(() => {
     let count = 0;
     if (stepIndex >= STEP_ORDER.indexOf('subject')) count++;
     if (stepIndex >= STEP_ORDER.indexOf('assessment')) count++;
     if (stepIndex >= STEP_ORDER.indexOf('branch')) count++;
     if (stepIndex >= STEP_ORDER.indexOf('teacher')) count++;
     if (stepIndex >= STEP_ORDER.indexOf('contact')) count++;
     return count;
  }, [stepIndex]);

  const maxStars = 5;

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={() => nextStep('grade')} />;
      case 'grade':
        return (
          <GradeStep
            state={state}
            onNext={(grade) => {
              updateState({ grade });
              nextStep('subject');
            }}
            onBack={() => nextStep('welcome')}
          />
        );
      case 'subject':
        return (
          <SubjectStep
            state={state}
            onNext={(sub) => {
              updateState({ subject: sub });
              nextStep('assessment');
            }}
            onBack={() => nextStep('grade')}
          />
        );
      case 'assessment':
        return (
          <AssessmentStep
            state={state}
            onNext={(ass) => {
              updateState({ assessment: ass });
              nextStep('branch');
            }}
            onBack={() => nextStep('subject')}
          />
        );
      case 'branch':
        return (
          <BranchStep
            state={state}
            onNext={(branch) => {
              updateState({ branch });
              nextStep('teacher');
            }}
            onBack={() => nextStep('assessment')}
          />
        );
      case 'teacher':
        return (
          <TeacherStep
            state={state}
            onNext={(teacher) => {
              updateState({ teacher });
              nextStep('contact');
            }}
            onBack={() => nextStep('branch')}
          />
        );
      case 'contact':
        return (
          <ContactStep
            state={state}
            onNext={({name, phone, email}) => {
              const finalState = { ...state, parentName: name, parentPhone: phone, parentEmail: email };
              updateState({ parentName: name, parentPhone: phone, parentEmail: email });
              
              // ЗДЕСЬ ВСЕ НАКОПЛЕННЫЕ ДАННЫЕ ОТПРАВЛЯЮТСЯ В CRM / Telegram / СМС
              console.log('--- ОТПРАВКА ЗАЯВКИ В CRM ---');
              console.log('Собранные данные:', JSON.stringify(finalState, null, 2));
              
              nextStep('success');
            }}
            onBack={() => nextStep('teacher')}
          />
        );
      case 'success':
        return <SuccessStep onBackToStart={() => {
            setState({ subject: null, assessment: null, grade: null, branch: null, teacher: null, parentName: null, parentPhone: null, parentEmail: null });
            nextStep('welcome');
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-['Helvetica_Neue',Arial,sans-serif] text-[#1A1A1B] flex flex-col justify-center items-center">
      <main className="w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] max-w-[480px] sm:rounded-[24px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative flex flex-col overflow-hidden">
        {step !== 'welcome' && step !== 'success' && (
           <div className="bg-[#E8F1F8] text-[#0054A6] px-4 py-2.5 flex items-center justify-between text-[13px] font-medium shrink-0 border-b border-[#0054A6]/10 z-20">
             <div className="flex items-center gap-2">
               <Star size={16} className={stepIndex > 1 ? 'fill-[#FFB800] text-[#FFB800] drop-shadow-sm' : 'text-[#0054A6] opacity-50'} />
               <span>Копите звезды для подарка!</span>
             </div>
             <div className="bg-white/90 px-3 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={starsCount}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="inline-block text-[#0054A6]"
                  >
                     {starsCount}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[#65676B] font-medium text-[12px]">/ {maxStars}</span>
             </div>
           </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 flex flex-col h-full min-h-0"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
