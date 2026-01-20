import React, { useState, useMemo } from 'react';
import { Plus, FileText, Wallet, TrendingUp, TrendingDown, CircleDollarSign, Banknote, Handshake, PiggyBank, Pencil, Trash2, Search, ChevronRight, ChevronLeft, Download, Eye, Filter} from "lucide-react";
import { Button } from '@/components/ui/Button';
import { useFinancialData } from '@/context/useFinancialDataHook';
import Contribution from '../components/Contribution';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function Finances() {
  const { financialStats, transactions,updateContribution,deleteContribution} = useFinancialData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRangeFilter, setDateRangeFilter] = useState({ startDate: "", endDate: "" });
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [categoryEditModal, setCategoryEditModal] = useState({ open: false, oldCategoryName: "", form: { category: "", type: "Offering", description: "" } });
  const [categoryDeleteModal, setCategoryDeleteModal] = useState({ open: false, name: "", count: 0 });
  const handleBulkCategoryUpdate = async (e) => {
  e.preventDefault();
  
  // Find all transactions currently belonging to the old category name
  const transactionsToUpdate = transactions.filter(t => t.category === categoryEditModal.oldCategoryName);
  
  // Execute updates
  const updatePromises = transactionsToUpdate.map(t => 
    updateContribution(t.id, {
      category: categoryEditModal.form.category,
      type: categoryEditModal.form.type,
      description: categoryEditModal.form.description
    })
  );

  await Promise.all(updatePromises);
  setCategoryEditModal({ open: false, oldCategoryName: "", form: { category: "", type: "", description: "" } });
};

  // Modal and transaction state for view/edit
  const [viewModal, setViewModal] = useState({ open: false, transaction: null });
  const [editModal, setEditModal] = useState({ open: false, transaction: null });
  const itemsPerPage = 5;

  const fmt = (val) => (val || 0).toLocaleString(undefined, { style: 'currency', currency: 'GHS', currencyDisplay: 'narrowSymbol' });

  const filteredData = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(tx => {
      const matchesSearch = tx.contributor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchesType = typeFilter === "All" || tx.type === typeFilter;
      const matchesCategory = categoryFilter === "All" || tx.category === categoryFilter;
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
        const txDate = new Date(tx.date);
        if (dateRangeFilter.startDate) {
          const startDate = new Date(dateRangeFilter.startDate);
          matchesDateRange = matchesDateRange && txDate >= startDate;
        }
        if (dateRangeFilter.endDate) {
          const endDate = new Date(dateRangeFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && txDate <= endDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesDateRange;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter, categoryFilter, dateRangeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleExportExcel = () => {
  const data = [
    ["Date", "Contributor", "Amount", "Type", "Category", "Status", "Receipt ID"],
    ...filteredData.map(tx => [
      tx.date, 
      tx.contributor, 
      tx.amount, 
      tx.type, 
      tx.category, 
      tx.status || '', 
      tx.formatted_receipt_id || (tx.type === 'Expense' ? `EXP${tx.id}` : `RCPT${tx.id}`)
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transaction_History.xlsx");
  };

 const handleExportPDF = () => {
  const pdf = new jsPDF();
  
  const formatCurrency = (amount) => {
    return `GHS ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  
  // 3. Document Header and Meta Info 
  pdf.setFontSize(18);
  pdf.text("Transaction History Report", 14, 15);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 23);
  pdf.text(`Total Transactions: ${filteredData.length}`, 14, 30);
  pdf.setTextColor(0);

  const tableData = filteredData.map(tx => {
  const receiptId = tx.formatted_receipt_id || (tx.type === 'Expense' ? `EXP${tx.id}` : `RCPT${tx.id}`);

  return [
    tx.date,
    tx.contributor,
    tx.type === 'Expense' ? `-${formatCurrency(tx.amount)}` : formatCurrency(tx.amount),
    tx.type,
    tx.category,
    tx.status || '',
    receiptId
  ];
  });

  // 5. Generate the Table using autoTable 
  autoTable(pdf, {
    startY: 40,
    head: [['Date', 'Contributor', 'Amount', 'Type', 'Category', 'Status', 'Receipt ID']],
    body: tableData,
    styles: { 
      fontSize: 8, 
      cellPadding: 3,
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [59, 130, 246], // Blue color matching UI 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      2: { halign: 'right' }, // Right-align Amount
      6: { fontStyle: 'bold', halign: 'center' } // Bold and center Receipt ID
    },
    // Optional: Alternating row colors for better readability 
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 40, bottom: 20 },
    didDrawPage: (data) => {
      // Add Page Numbers in Footer 
      const str = "Page " + pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      const pageSize = pdf.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      pdf.text(str, data.settings.margin.left, pageHeight - 10);
    }
  });

  // 6. Save the file
  pdf.save(`Transaction_History.pdf`);
 };

 const handleGenerateReceipts = () => {
  const formatCurrency = (amount) => {
    return `GHS ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  if (selectedRows.length === 0) return;

  const pdf = new jsPDF();
  const selectedData = transactions.filter(tx => selectedRows.includes(tx.id));

  selectedData.forEach((tx, index) => {
    // Add a new page if it's not the first receipt
    if (index > 0) pdf.addPage();

    // --- Header Section ---
    pdf.setFontSize(22);
    pdf.setTextColor(59, 130, 246); 
    pdf.text("OFFICIAL RECEIPT", 14, 15, );

    // --- Receipt Info ---
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Receipt ID: ${tx.formatted_receipt_id || 'N/A'}`, 14, 23);
    pdf.text(`Date: ${tx.date}`, 14, 55);
    pdf.text(`Status: ${tx.status || 'Processed'}`, 14, 30);

    // --- Transaction Details Table ---
    autoTable(pdf, {
      startY: 40,
      head: [['Description', 'Category', 'Type', 'Amount']],
      body: [
        [
          tx.description || "General Contribution",
          tx.category,
          tx.type,
          formatCurrency(tx.amount)
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8, cellPadding: 3 }
    });

  });

  pdf.save(`Receipts.pdf`);
  setSelectedRows([]);
  };

  const handleGenerateReport = () => {
  const formatCurrency = (amount) => {
    return `GHS ${(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  const pdf = new jsPDF();
  const categorySummary = filteredData.reduce((acc, tx) => {
    if (!acc[tx.category]) {
      acc[tx.category] = { count: 0, total: 0, type: tx.type };
    }
    acc[tx.category].count += 1;
    acc[tx.category].total += tx.amount;
    return acc;
  }, {});
  
  // 1. Title & Metadata
  pdf.setFontSize(22);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Financial Performance Report", 14, 20);
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Period: ${dateRangeFilter.startDate || 'All Time'} to ${dateRangeFilter.endDate || 'Present'}`, 14, 28);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);

  // 2. Summary Statistics Table
  autoTable(pdf, {
    startY: 40,
    head: [['Metric', 'Total Value']],
    body: [
      ['Total Income', formatCurrency(financialStats.totalIncome)],
      ['Total Expenditure', formatCurrency(financialStats.totalExpenditure)],
      ['Net Position', formatCurrency(financialStats.netBalance)],
      ['Total Transactions', filteredData.length.toString()]
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }
  });

  // 3. Category Breakdown Table
  pdf.setFontSize(14);
  pdf.text("Breakdown by Category", 14, pdf.lastAutoTable.finalY + 15);
  
  const categoryRows = Object.entries(categorySummary).map(([name, stats]) => [
    name,
    stats.count,
    formatCurrency(stats.total)
  ]);
  

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 20,
    head: [['Category Name', 'Volume', 'Total Amount']],
    body: categoryRows,
    headStyles: { fillColor: [59, 130, 246] }
  });

  // 4. Status Integrity Check
  pdf.setFontSize(14);
  pdf.text("Transaction Integrity", 14, pdf.lastAutoTable.finalY + 15);
  
  const statusCounts = filteredData.reduce((acc, tx) => {
    const s = tx.status || 'Pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 20,
    head: [['Status', 'Count']],
    body: Object.entries(statusCounts),
  });

  pdf.save(`Financial_Report.pdf`);
  };


  const handleExport = (format) => {
    if (format === 'excel') {
      handleExportExcel();
    } else if (format === 'pdf') {
      handleExportPDF();
    }
  };
    
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredData.map(tx => tx.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  try {
    return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Contribution isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 font-normal">
          <h1 className="text-4xl text-gray-900 tracking-tight">Financial Overview</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-blue-600"><Plus size={16}/> Record New Contribution</Button>
            <Button disabled={selectedRows.length === 0} onClick={handleGenerateReceipts} className={`inline-flex items-center gap-2 rounded-sm border border-gray-300  px-4 py-2 text-sm font-medium transition-colors ${selectedRows.length > 0 ?'bg-white text-gray-700 hover:bg-gray-50':'bg-gray-100 text-gray-700 cursor-not-allowed'}`}><FileText size={16} /> Generate Receipts({selectedRows.length})</Button>
            <Button onClick={handleGenerateReport} className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"><Wallet size={16} /> View All Reports</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border p-6 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Total Income</span><TrendingUp size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.totalIncome)}</div>
          </div>
          <div className="rounded-xl border p-6 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Total Expenditure</span><TrendingDown size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.totalExpenditure)}</div>
          </div>
          <div className="rounded-xl border border-blue-100 p-6 shadow-sm bg-white ring-1 ring-blue-50">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Net Balance</span><CircleDollarSign size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.netBalance)}</div>
          </div>
          <div className="rounded-xl border border-blue-100 p-6 shadow-sm bg-white ring-1 ring-blue-50">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Total Tithes</span><Banknote size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.totalTithes)}</div>
          </div>
          <div className="rounded-xl border border-blue-100 p-6 shadow-sm bg-white ring-1 ring-blue-50">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Total Offerings</span><Handshake size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.totalOfferings)}</div>
          </div>
          <div className="rounded-xl border border-blue-100 p-6 shadow-sm bg-white ring-1 ring-blue-50">
            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 uppercase tracking-widest">Total Donations</span><PiggyBank size={18} className="text-gray-400"/></div>
            <div className="text-2xl font-normal">{fmt(financialStats.totalDonations)}</div>
          </div>
        </div>

        
        <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Income vs. Expenditure Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialStats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="income" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={18} />
                <Bar dataKey="expenditure" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-500 font-normal">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-500 font-normal">Expenditure</span>
            </div>
          </div>
        </div>

        {/* Contribution Categories Summary */}
        <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Categories</h3>
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-sm text-sm px-4 py-2 font-normal flex items-center gap-2 transition-all duration-200 shadow-sm border-none outline-none"><Plus size={14} strokeWidth={2.5} />Add Category</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-normal">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-400">
                  <th className="pb-4 font-normal">Name</th>
                  <th className="pb-4 font-normal">Description</th>
                  <th className="pb-4 text-center font-normal">Contributions</th>
                  <th className="pb-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(financialStats.categoryStats).length === 0 ? (
                  <tr><td colSpan="4" className="py-10 text-center text-gray-400 italic">No contributions recorded yet.</td></tr>
                ) : (
                  Object.entries(financialStats.categoryStats).map(([name, stats]) => (
                    <tr key={name} className="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">{name}</td>
                      <td className="py-4 text-sm text-gray-500">{stats.lastDesc}</td>
                      <td className="py-4 text-center"><span className="px-2 py-1 rounded-full bg-transparent text-gray-700 text-xs font-normal">{stats.count}</span></td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2 text-gray-400">
                          <button onClick={() => {const existing = transactions.find(t => t.category === name) || {};setCategoryEditModal({ open: true, oldCategoryName: name, form: { category: name, type: existing.type || "Offering", description: existing.description || "" } });}} className="text-gray-600 bg-transparent"><Pencil size={16}/></button>
                          <button onClick={() => setCategoryDeleteModal({ open: true, name: name, count: stats.count })} className="text-red-600 bg-transparent"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Transaction History</h3>
          {/* SEARCH AND FILTERS BAR */}
          <div className="space-y-4 mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group ml-auto">
                <Button 
                  onClick={() => setShowDateRangeModal(!showDateRangeModal)}
                  className={`flex items-center gap-2 px-4 py-2 border-gray-200 font-medium rounded-md h-10 transition-all ${
                    dateRangeFilter.startDate || dateRangeFilter.endDate ? "bg-transparent hover:bg-gray-50 border-blue-200 text-blue-700" : "text-gray-700 bg-transparent hover:bg-gray-50 border"
                  }`}
                >
                  <Filter size={18} /> Date Range
                </Button>
                {showDateRangeModal && (
                  <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateRangeFilter.startDate}
                          onChange={(e) => {
                            setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value });
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateRangeFilter.endDate}
                          onChange={(e) => {
                            setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value });
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setDateRangeFilter({ startDate: "", endDate: "" });
                          setCurrentPage(1);
                        }}
                        className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border-t border-gray-200 mt-2"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button 
                  onClick={() => setShowTypeModal(!showTypeModal)}
                  className={`flex items-center gap-2 px-4 py-2 border-gray-200 font-medium rounded-md h-10 transition-all ${
                    typeFilter !== "All" ? "bg-transparent hover:bg-gray-50 border-blue-200 text-blue-700" : "text-gray-700 bg-transparent hover:bg-gray-50 border"
                  }`}
                >
                  <Filter size={18} /> Type {typeFilter !== "All" && `: ${typeFilter}`}
                </Button>
                {showTypeModal && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {["All", "Tithe", "Offering", "Donation", "Expense"].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTypeFilter(type);
                          setShowTypeModal(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          typeFilter === type
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        } ${type !== "Expense" ? "border-b border-gray-100" : ""}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button 
                  onClick={() => setShowCategoryModal(!showCategoryModal)}
                  className={`flex items-center gap-2 px-4 py-2 border-gray-200 font-medium rounded-md h-10 transition-all ${
                    categoryFilter !== "All" ? "bg-transparent hover:bg-gray-50 border-blue-200 text-blue-700" : "text-gray-700 bg-transparent hover:bg-gray-50 border"
                  }`}
                >
                  <Filter size={18} /> Category {categoryFilter !== "All" && `: ${categoryFilter}`}
                </Button>
                {showCategoryModal && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setCategoryFilter("All");
                        setShowCategoryModal(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm border-b border-gray-100 ${
                        categoryFilter === "All" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All
                    </button>
                    {Object.keys(financialStats.categoryStats || {}).map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setCategoryFilter(category);
                          setShowCategoryModal(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm border-b border-gray-100 ${
                          categoryFilter === category
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <Button 
                  onClick={() => setShowStatusModal(!showStatusModal)}
                  className={`flex items-center gap-2 px-4 py-2 border-gray-200 font-medium rounded-md h-10 transition-all ${
                    statusFilter !== "All" ? "bg-transparent hover:bg-gray-50 border-blue-200 text-blue-700" : "text-gray-700 border bg-transparent hover:bg-gray-50"
                  }`}
                >
                  <Filter size={18} /> 
                  {statusFilter === "All" ? "Status" : `Status: ${statusFilter}`}
                </Button>
                {showStatusModal && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    {["All", "Processed", "Pending", "Failed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusModal(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          statusFilter === status
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-transparent"
                        } ${status !== "Failed" ? "border-b border-gray-100" : ""}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative group">
                <Button variant="outline" className="flex items-center gap-2 px-4 py-2 border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 h-10">
                  <Download size={18} /> Export Data
                </Button>
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                  <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <FileText size={16} /> Export as Excel
                  </button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FileText size={16} /> Export as PDF
                  </button>
                </div>
              </div>
              <Button disabled={selectedRows.length === 0} onClick={handleGenerateReceipts} className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md h-10 transition-colors ${ selectedRows.length > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed' }`}><FileText size={18} /> Generate Receipt ( {selectedRows.length} )
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-sm text-gray-500">
                  <th className="py-4 px-4 w-12"><input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300" 
                  onChange={toggleSelectAll}
                  checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                /></th>
                  <th className="py-4 px-2 font-normal">Date</th>
                  <th className="py-4 px-2 font-normal">Contributor</th>
                  <th className="py-4 px-2 font-normal">Amount</th>
                  <th className="py-4 px-2 font-normal">Type</th>
                  <th className="py-4 px-2 font-normal">Category</th>
                  <th className="py-4 px-2 font-normal">Status</th>
                  <th className="py-4 px-2 font-normal">Receipt ID</th>
                  <th className="py-4 px-2 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginatedData?.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-300 hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-4"><input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300"
                    checked={selectedRows.includes(tx.id)}
                    onChange={() => toggleRow(tx.id)}
                  /></td>
                    <td className="py-5 px-2 text-gray-600 font-medium">{tx.date}</td>
                    <td className="py-5 px-2 text-gray-700">{tx.contributor}</td>
                    <td className="py-5 px-2 font-semibold">
                      {tx.type === 'Expense' ? `-${fmt(tx.amount)}` : fmt(tx.amount)}
                    </td>
                    <td className="py-5 px-2 text-gray-600">{tx.type}</td>
                    <td className="py-5 px-2 text-gray-600">{tx.category}</td>
                    <td className="py-5 px-2">
                      {tx.status ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.status === 'Failed' ? 'bg-red-100 text-red-600' : 
                          tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {tx.status}
                        </span>
                        ) : (
                        <span className="text-gray-300 italic text-xs">Waiting...</span>
                      )}
                    </td>
                    <td className="py-5 px-2 text-gray-400 font-mono">
                      {tx.formatted_receipt_id || (tx.type === 'Expense' ? `EXP${tx.id}` : `RCPT${tx.id}`)}
                    </td>
                    <td className="py-5 px-2 text-right">
                      <div className="flex justify-end gap-3 text-gray-400">
                        <button className="text-gray-600" onClick={() => setViewModal({ open: true, transaction: tx })}><Eye size={16} /></button>
                        <button className="text-gray-600" onClick={() => setEditModal({ open: true, transaction: tx })}><Pencil size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end mt-6 gap-2 text-sm text-gray-500 font-medium">
            <button 
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors ${
              currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronLeft size={18}/>
          </button>

          {/* Page Indicator */}
          <span className="px-2 text-gray-700 font-sans">
            Page {currentPage} of {totalPages}
          </span>

          {/* Right Arrow Button */}
          <button 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors ${
              currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronRight size={18}/>
           </button>
          </div>
        </div>
      </main>
      {viewModal.open && viewModal.transaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setViewModal({ open: false, transaction: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Date:</span> {viewModal.transaction.date}</div>
              <div><span className="font-medium">Contributor:</span> {viewModal.transaction.contributor}</div>
              <div><span className="font-medium">Amount:</span> {fmt(viewModal.transaction.amount)}</div>
              <div><span className="font-medium">Type:</span> {viewModal.transaction.type}</div>
              <div><span className="font-medium">Category:</span> {viewModal.transaction.category}</div>
              <div><span className="font-medium">Status:</span> {viewModal.transaction.status || 'Processed'}</div>
              <div><span className="font-medium">Description:</span> {viewModal.transaction.description || '-'}</div>
              <div><span className="font-medium">Receipt ID:</span> {viewModal.transaction.formatted_receipt_id || (viewModal.transaction.type === 'Expense' ? `EXP${viewModal.transaction.id}` : `RCPT${viewModal.transaction.id}`)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editModal.open && editModal.transaction && (
        <EditTransactionModal 
          transaction={editModal.transaction}
          onClose={() => setEditModal({ open: false, transaction: null })}
        />
      )}
      {categoryEditModal.open && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Edit Category Group</h3>
        <button 
          onClick={() => setCategoryEditModal({ ...categoryEditModal, open: false })}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
      </div>
      
      <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg mb-6 border border-blue-100">
        You are editing <strong>{transactions.filter(t => t.category === categoryEditModal.oldCategoryName).length}</strong> transactions simultaneously.
      </p>

      <form onSubmit={handleBulkCategoryUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input 
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={categoryEditModal.form.category}
            onChange={(e) => setCategoryEditModal({
              ...categoryEditModal, 
              form: { ...categoryEditModal.form, category: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select 
            className="w-full px-4 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white"
            value={categoryEditModal.form.type}
            onChange={(e) => setCategoryEditModal({
              ...categoryEditModal, 
              form: { ...categoryEditModal.form, type: e.target.value }
            })}
          >
            <option value="Tithe">Tithe</option>
            <option value="Offering">Offering</option>
            <option value="Donation">Donation</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Global Description</label>
          <textarea 
            rows="3"
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            placeholder="Apply a standard description to all records..."
            value={categoryEditModal.form.description}
            onChange={(e) => setCategoryEditModal({
              ...categoryEditModal, 
              form: { ...categoryEditModal.form, description: e.target.value }
            })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setCategoryEditModal({ ...categoryEditModal, open: false })}
            className="px-6 border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700 px-8 shadow-sm"
          >
            Update All Records
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
   {categoryDeleteModal.open && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
        <Trash2 size={32} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
      <p className="text-sm text-gray-500 mb-8">
        Are you sure you want to delete the <strong>"{categoryDeleteModal.name}"</strong> category? 
        This will permanently remove <strong>{categoryDeleteModal.count}</strong> records. This action cannot be undone.
      </p>
      
      <div className="flex flex-col gap-3">
        <Button 
          onClick={() => {
            const targets = transactions.filter(t => t.category === categoryDeleteModal.name);
            targets.forEach(t => deleteContribution(t.id));
            setCategoryDeleteModal({ open: false, name: "", count: 0 });
          }}
          className="w-full bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
        >
          Yes, Delete Everything
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setCategoryDeleteModal({ open: false, name: "", count: 0 })}
          className="w-full bg-transparent text-gray-500 border-none hover:bg-gray-100 py-2"
        >
          Go Back
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
    );
  } catch (error) {
    console.error('Finances component error:', error);
    return <div className="p-4 text-red-600">Error loading finances page: {error.message}</div>;
  }
}

// Edit Transaction Modal Component
function EditTransactionModal({ transaction, onClose }) {
  const { updateContribution } = useFinancialData();
  const [form, setForm] = useState({ ...transaction });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    updateContribution(transaction.id, {
      ...form,
      amount: parseFloat(form.amount) || 0,
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Contributor</label>
            <input name="contributor" value={form.contributor} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Amount</label>
            <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border px-3 py-2 rounded">
              <option value="Tithe">Tithe</option>
              <option value="Offering">Offering</option>
              <option value="Donation">Donation</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select name="status" value={form.status || 'Processed'} onChange={handleChange} className="w-full border px-3 py-2 rounded">
              <option value="Processed">Processed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}