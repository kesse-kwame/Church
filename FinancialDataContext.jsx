import { useState, useMemo, useCallback, useEffect } from 'react';
import { FinancialDataContext } from './FinancialDataContextFile';
import { supabase } from '../config/supabaseClient'; 

export const FinancialDataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Fetch from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();

    // 2. Set up Real-time Subscription
    const subscription = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTransactions((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTransactions((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
        } else if (payload.eventType === 'DELETE') {
          setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addContribution = useCallback(async (newEntry) => {
  const { error } = await supabase
    .from('transactions')
    .insert([{
      ...newEntry,
      status: 'Processed',
      date: newEntry.date || new Date().toISOString().split('T')[0]
    }]);

  if (error) console.error("Real-time add failed:", error.message);
}, []);

  const updateContribution = useCallback(async (id, updatedEntry) => {
    const { error } = await supabase
      .from('transactions')
      .update(updatedEntry)
      .eq('id', id);

    if (error) console.error('Error updating contribution:', error.message);
  }, []);

  const deleteContribution = useCallback(async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting contribution:', error.message);
  }, []);

  const financialStats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type !== 'Expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenditure = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalTithes = transactions.filter(t => t.type === 'Tithe').reduce((a, c) => a + c.amount, 0);
    const totalOfferings = transactions.filter(t => t.type === 'Offering').reduce((a, c) => a + c.amount, 0);
    const totalDonations = transactions.filter(t => t.type === 'Donation').reduce((a, c) => a + c.amount, 0);

    const categoryStats = transactions.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { count: 0, lastDesc: curr.description || "No description" };
      }
      acc[curr.category].count += 1;
      acc[curr.category].lastDesc = curr.description || acc[curr.category].lastDesc;
      return acc;
    }, {});

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const chartData = months.map(m => {
      const monthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.toLocaleString('en-us', { month: 'short' }) === m;
      });
      return {
        month: m,
        income: monthTxs.filter(t => t.type !== 'Expense').reduce((a, c) => a + c.amount, 0),
        expenditure: monthTxs.filter(t => t.type === 'Expense').reduce((a, c) => a + c.amount, 0)
      };
    });

    return {
      totalIncome,
      totalExpenditure,
      netBalance: totalIncome - totalExpenditure,
      totalTithes,
      totalOfferings,
      totalDonations,
      categoryStats,
      chartData
    };
  }, [transactions]);

  return (
    <FinancialDataContext.Provider value={{ 
      financialStats, 
      transactions, 
      addContribution, 
      updateContribution, 
      deleteContribution,
      loading 
    }}>
      {children}
    </FinancialDataContext.Provider>
  );
};