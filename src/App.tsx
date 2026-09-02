
import { useState } from 'react';
import { AppStep, AppState, ContactDetails } from './types';
import { WelcomeStep } from './components/WelcomeStep';
import { SubjectStep } from './components/SubjectStep';
import { AssessmentStep } from './components/AssessmentStep';
import { GradeStep } from './components/GradeStep';
import { BranchStep } from './components/BranchStep';
import { TeacherStep } from './components/TeacherStep';
import { ContactStep } from './components/ContactStep';
import { SuccessStep } from './components/SuccessStep';
import { StarProgress } from './components/StarProgress';
import {
  buildLeadSubmission,
  LeadFormMeta,
  LeadReceipt,
  submitLead,
} from './lib/leadCapture';
import { TEACHERS } from './data';

const STAR_PROGRESS: Record<AppStep, number> = {
  welcome: 0,
  grade: 0,
  subject: 1,
  assessment: 2,
  branch: 3,
  teacher: 4,
  contact: 5,
  success: 5,
};

const EMPTY_STATE: AppState = {
  subject: null,
  assessment: null,
  grade: null,
  branch: null,
  teacher: null,
  parentName: null,
  parentPhone: null,
  parentEmail: null,
};

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [receipt, setReceipt] = useState<LeadReceipt | null>(null);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = (target: AppStep) => {
    setStep(target);
  };

  const submitContact = async (contact: ContactDetails, meta: LeadFormMeta) => {
    const finalState: AppState = {
      ...state,
      parentName: contact.name,
      parentPhone: contact.phone,
      parentEmail: contact.email,
    };
    const payload = buildLeadSubmission(finalState, contact, meta);
    const storedReceipt = await submitLead(payload);

    setState(finalState);
    setReceipt(storedReceipt);
    nextStep('success');
  };

  const restart = () => {
    setState(EMPTY_STATE);
    setReceipt(null);
    nextStep('welcome');
  };

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
            onSubmit={submitContact}
            onBack={() => nextStep('teacher')}
          />
        );
      case 'success':
        return receipt ? (
          <SuccessStep
            receipt={receipt}
            selectedTeacherName={TEACHERS.find((teacher) => teacher.id === state.teacher)?.name}
            onBackToStart={restart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-['Helvetica_Neue',Arial,sans-serif] text-[#1A1A1B] flex flex-col justify-center items-center">
      <main className="w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] max-w-[480px] sm:rounded-[24px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative flex flex-col overflow-hidden">
        {step !== 'welcome' && step !== 'success' && (
          <StarProgress earned={STAR_PROGRESS[step]} />
        )}

        <div key={step} className="flex-1 flex flex-col h-full min-h-0">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
