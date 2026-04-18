import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStep, AppState } from './types';
import { WelcomeStep } from './components/WelcomeStep';
import { SubjectStep } from './components/SubjectStep';
import { AssessmentStep } from './components/AssessmentStep';
import { GradeStep } from './components/GradeStep';
import { BranchStep } from './components/BranchStep';
import { TeacherStep } from './components/TeacherStep';
import { ContactStep } from './components/ContactStep';
import { SuccessStep } from './components/SuccessStep';

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

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={() => nextStep('subject')} />;
      case 'subject':
        return (
          <SubjectStep
            state={state}
            onNext={(sub) => {
              updateState({ subject: sub });
              nextStep('assessment');
            }}
            onBack={() => nextStep('welcome')}
          />
        );
      case 'assessment':
        return (
          <AssessmentStep
            state={state}
            onNext={(ass) => {
              updateState({ assessment: ass });
              nextStep('grade');
            }}
            onBack={() => nextStep('subject')}
          />
        );
      case 'grade':
        return (
          <GradeStep
            state={state}
            onNext={(grade) => {
              updateState({ grade });
              nextStep('branch');
            }}
            onBack={() => nextStep('assessment')}
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
            onBack={() => nextStep('grade')}
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
              updateState({ parentName: name, parentPhone: phone, parentEmail: email });
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
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 flex flex-col h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
