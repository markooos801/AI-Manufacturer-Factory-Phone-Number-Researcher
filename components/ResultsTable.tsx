import React from 'react';
import { CompanyRecord } from '../types';
import { Factory, Briefcase, Globe, Mail, Phone, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface ResultsTableProps {
  data: CompanyRecord[];
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = 'bg-red-100 text-red-700';
  if (score >= 8) colorClass = 'bg-green-100 text-green-700';
  else if (score >= 5) colorClass = 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}>
      {score.toFixed(1)}/10
    </span>
  );
};

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const isFactory = type.toLowerCase().includes('factory') || type.toLowerCase().includes('manufacturer');
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isFactory ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
      {isFactory ? <Factory className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
      {type}
    </span>
  );
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Identified Companies ({data.length})</h3>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Company & Type</th>
              <th className="px-6 py-3 font-medium">Contact Details</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Verification</th>
              <th className="px-6 py-3 font-medium">Export Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((company, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900 text-base">{company.company_name}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <TypeBadge type={company.manufacturer_type} />
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{company.product_category}</span>
                    </div>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
                      >
                        <Globe className="w-3 h-3" /> Website
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    {company.emails.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex flex-col">
                          {company.emails.slice(0, 2).map((e, i) => (
                            <span key={i} className="text-slate-700">{e.email} <span className="text-xs text-slate-400">({e.role})</span></span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.phone_numbers.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex flex-col">
                          {company.phone_numbers.slice(0, 2).map((p, i) => (
                            <span key={i} className="text-slate-700">{p.number} <span className="text-xs text-slate-400">({p.type})</span></span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.emails.length === 0 && company.phone_numbers.length === 0 && (
                      <span className="text-slate-400 italic">No contact info found</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="text-slate-700">{company.city}</div>
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{company.country}</div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Score:</span>
                      <ScoreBadge score={company.verification_score} />
                    </div>
                    {company.certifications && company.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.certifications.slice(0, 3).map((cert, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 truncate max-w-[120px]" title={cert}>
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-1.5">
                    {company.export_capability === 'Yes' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : company.export_capability === 'No' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <span className="w-4 h-4 block rounded-full border border-slate-300"></span>
                    )}
                    <span className="text-slate-700">{company.export_capability}</span>
                  </div>
                  {company.notes && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2" title={company.notes}>
                      {company.notes}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};