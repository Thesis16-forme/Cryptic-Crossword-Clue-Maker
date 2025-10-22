import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: 'Welcome to the Cryptic Clue Constructor!',
    content: "This short tour will guide you through creating your first clue. It's a tool to help you craft clever and stylish cryptic crossword clues with the power of AI."
  },
  {
    title: 'Step 1: The Basics',
    content: "Start with the 'Answer' and 'Definition'. The Answer is the word you want a clue for (e.g., 'CARPET'). The Definition is what the solver needs to figure out (e.g., 'Floor covering')."
  },
  {
    title: 'Step 2: The Wordplay',
    content: "Next, choose a 'Clue Type'. This is the cryptic part! For example, an 'Anagram' rearranges letters, while a 'Charade' builds the answer from smaller words (CAR + PET). If you're unsure, just leave it as 'ANY' and let the AI decide."
  },
  {
    title: 'Step 3: The Style',
    content: "This is the fun part! Emulate the style of a famous crossword 'Setter'. 'Paul' is known for witty, humorous clues, while 'Ximenes' is famous for being very precise and logical. Hover over each name for a description of their style."
  },
  {
    title: "You're Ready to Go!",
    content: "That's all you need to know to get started. Fill in the fields, click 'Generate Clue', and see what the AI comes up with. Enjoy constructing!"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-300 animate-slide-up">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          {step.title}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">{step.content}</p>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 text-sm font-bold text-white bg-[var(--color-accent)] rounded-md shadow-sm hover:bg-[var(--color-accent-hover)] focus:outline-none"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Onboarding;