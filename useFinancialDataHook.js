import { useContext } from 'react';
import { FinancialDataContext } from './FinancialDataContextFile';

export const useFinancialData = () => {
  const ctx = useContext(FinancialDataContext);
  if (!ctx) {
    throw new Error('useFinancialData must be used within FinancialDataProvider');
  }
  return ctx;

};
