import React from 'react';
import { CompanyRecord } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StatsDashboardProps {
  data: CompanyRecord[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Calculate Manufacturer vs Trader
  const typeDistribution = data.reduce((acc, curr) => {
    const type = curr.manufacturer_type === 'Factory' || curr.manufacturer_type === 'Manufacturer' ? 'Factory' : 'Trader/Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(typeDistribution).map(key => ({
    name: key,
    value: typeDistribution[key]
  }));

  // Calculate Score Distribution
  const scoreRanges = [
    { name: 'High (8-10)', min: 8, max: 10, count: 0 },
    { name: 'Med (5-8)', min: 5, max: 7.9, count: 0 },
    { name: 'Low (<5)', min: 0, max: 4.9, count: 0 }
  ];

  data.forEach(item => {
    const range = scoreRanges.find(r => item.verification_score >= r.min && item.verification_score <= r.max);
    if (range) range.count++;
  });

  const COLORS = ['#4f46e5', '#94a3b8', '#fbbf24', '#f87171'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* KPI Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
        <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Verified</h4>
        <span className="text-4xl font-bold text-slate-900">{data.length}</span>
        <span className="text-xs text-slate-400 mt-2">Companies Found</span>
      </div>

      {/* Type Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-slate-800 text-sm font-semibold mb-4 text-center">Factory vs. Trader</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-xs">
           {pieData.map((entry, index) => (
             <div key={index} className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
               <span>{entry.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Quality Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h4 className="text-slate-800 text-sm font-semibold mb-4 text-center">Data Confidence</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreRanges}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};