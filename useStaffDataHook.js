import { useContext } from 'react';
import { StaffContext } from '../context/StaffContext';

export const useStaffData = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaffData must be used within a StaffDataProvider');
  }
  return context;
};