
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Receipt } from '../types';

interface StatsDashboardProps {
  receipts: Receipt[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatsDashboard: React.FC<StatsDashboardProps> = ({ receipts }) => {
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    receipts.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + r.totalAmount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [receipts]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      months[key] = 0;
    }

    receipts.forEach(r => {
      const date = new Date(r.date);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      if (months[key] !== undefined) {
        months[key] += r.totalAmount;
      }
    });

    return Object.entries(months).map(([name, amount]) => ({ name, amount }));
  }, [receipts]);

  const totalSpent = useMemo(() => {
    return receipts.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [receipts]);

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No data to display yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">Scan your first receipt to see spending insights and tax breakdown.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Expenses</h3>
          <p className="text-4xl font-bold text-slate-900">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-4 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
            {receipts.length} total receipts
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1 md:col-span-2">
           <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Spending by Category</h3>
           <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Monthly Spending</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
