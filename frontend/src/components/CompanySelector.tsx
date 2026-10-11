'use client';

import React, { useState } from 'react';
import { Building2, Search, X } from 'lucide-react';

interface CompanySelectorProps {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  customCompany?: string;
  onCustomCompanyChange?: (company: string) => void;
}

const FEATURED_COMPANIES = [
  // Indian IT Services
  { name: 'TCS', category: 'Indian IT Services' },
  { name: 'Infosys', category: 'Indian IT Services' },
  { name: 'Wipro', category: 'Indian IT Services' },
  { name: 'HCLTech', category: 'Indian IT Services' },
  { name: 'Tech Mahindra', category: 'Indian IT Services' },
  
  // Consulting
  { name: 'Accenture', category: 'Consulting' },
  { name: 'Cognizant', category: 'Consulting' },
  { name: 'Capgemini', category: 'Consulting' },
  { name: 'Deloitte', category: 'Consulting' },
  
  // Product Companies
  { name: 'Amazon', category: 'Tech Giants' },
  { name: 'Microsoft', category: 'Tech Giants' },
  { name: 'Google', category: 'Tech Giants' },
  { name: 'IBM', category: 'Tech Giants' },
  { name: 'Oracle', category: 'Tech Giants' },
  { name: 'SAP', category: 'Tech Giants' },
  { name: 'Adobe', category: 'Tech Giants' },
  { name: 'Salesforce', category: 'Tech Giants' },
  { name: 'NVIDIA', category: 'Tech Giants' },
  
  // Indian Product
  { name: 'Zoho', category: 'Indian Product' },
  { name: 'Freshworks', category: 'Indian Product' },
];

export default function CompanySelector({
  selectedCompany,
  onCompanyChange,
  customCompany,
  onCustomCompanyChange,
}: CompanySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(
    selectedCompany === 'Other' && !!customCompany
  );

  const filteredCompanies = FEATURED_COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompanySelect = (companyName: string) => {
    if (companyName === 'Other Company') {
      setShowOtherInput(true);
      onCompanyChange('Other');
    } else {
      setShowOtherInput(false);
      onCompanyChange(companyName);
      if (onCustomCompanyChange) {
        onCustomCompanyChange('');
      }
    }
  };

  const groupedCompanies = filteredCompanies.reduce((acc, company) => {
    if (!acc[company.category]) {
      acc[company.category] = [];
    }
    acc[company.category].push(company);
    return acc;
  }, {} as Record<string, typeof FEATURED_COMPANIES>);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Building2 className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Choose Your Target Company
        </h3>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Company Grid */}
      <div className="max-h-96 overflow-y-auto space-y-4 p-1">
        {Object.entries(groupedCompanies).map(([category, companies]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {companies.map((company) => (
                <button
                  key={company.name}
                  type="button"
                  onClick={() => handleCompanySelect(company.name)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                    selectedCompany === company.name
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {company.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Other Company Option */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Not Listed?
          </h4>
          <button
            type="button"
            onClick={() => handleCompanySelect('Other Company')}
            className={`w-full p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
              selectedCompany === 'Other'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Other Company
          </button>
        </div>
      </div>

      {/* Custom Company Input */}
      {showOtherInput && (
        <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Enter Company Name
          </label>
          <input
            type="text"
            placeholder="e.g., Your Startup Name"
            value={customCompany || ''}
            onChange={(e) => onCustomCompanyChange && onCustomCompanyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
      )}

      {/* Selected Company Display */}
      {selectedCompany && selectedCompany !== 'Other' && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            <span className="font-semibold">Selected:</span> {selectedCompany}
          </p>
        </div>
      )}

      {selectedCompany === 'Other' && customCompany && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            <span className="font-semibold">Selected:</span> {customCompany}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 italic mt-2">
        Note: Interview questions are AI-generated practice questions based on your selections.
        They are not verified actual interview questions from these companies.
      </p>
    </div>
  );
}
