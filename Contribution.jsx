import React, { useState } from 'react';
import { X } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { useFinancialData } from '@/context/useFinancialDataHook';

export default function Contribution({ isOpen, onClose }) {
  const { addContribution } = useFinancialData();
  const [formData, setFormData] = useState({
    contributor: '',
    category: '',
    description: '',
    type: 'Tithes',
    amount: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addContribution({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      date: new Date().toISOString().split('T')[0] 
    });

    setFormData({ contributor: '', category: '', description: '', type: 'Tithes', amount: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-normal">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-black-500">Record New Contribution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field
            label="Contributor"
            id="contributor"
          >
            <Input 
              id="contributor"
              required
              placeholder="e.g. John Doe"
              value={formData.contributor}
              onChange={e => setFormData({...formData, contributor: e.target.value})}
            />
          </Field>

          <Field
            label="Category"
            id="category"
          >
            <Input 
              id="category"
              required
              placeholder="e.g. Building Fund"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            />
          </Field>

          <Field
            label="Description"
            id="description"
          >
            <Textarea 
              id="description"
              placeholder="Provide specific details..."
              className="h-20"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </Field>

          <div className="flex gap-4">
            <div className="flex-1">
              <Field
                label="Type"
                id="type"
              >
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tithes">Tithes</SelectItem>
                    <SelectItem value="Offering">Offering</SelectItem>
                    <SelectItem value="Donation">Donation</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex-1">
              <Field
                label="Amount (GHS)"
                id="amount"
              >
                <Input 
                  id="amount"
                  type="number" 
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
              Save Record
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}