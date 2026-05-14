import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasSeenWelcome: boolean;
  currentStep: number;
  setHasSeenWelcome: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      currentStep: 0,
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set({ hasSeenWelcome: false, currentStep: 0 }),
    }),
    {
      name: 'morocco-platform-onboarding',
    }
  )
);
