import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown, Building2 } from "lucide-react";

const COMPANIES = [
  "9419-0238 Quebec Inc",
  "Distribution Koalas",
  "SARL Les Entreprises Koalas France",
  "SASU Expérience Koalas",
  "Gorup Signature",
];

const BRANCHES = {
  "9419-0238 Quebec Inc": ["Distribution Koalas", "2KAI Project Investissement", "Gorup Signature"],
  "Distribution Koalas": ["Atelier Cyclo Koalas", "2Kbike.fr", "Pimp mon bike", "Noyer & Co"],
  "SARL Les Entreprises Koalas France": ["SASU Expérience Koalas"],
  "SASU Expérience Koalas": ["Que Faire en Dordogne", "Dordogne en vélo", "Gîte et cabane"],
  "Gorup Signature": ["Group Wine Wall Cellars", "Aménagement et conception mobilier"],
};

export default function CompanyBranchSelector({ onCompanyChange, onBranchChange, defaultCompany = "SARL Les Entreprises Koalas France" }) {
  const [activeCompany, setActiveCompany] = useState(defaultCompany);
  const [activeBranch, setActiveBranch] = useState(BRANCHES[defaultCompany]?.[0]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const availableBranches = BRANCHES[activeCompany] || [];

  const handleCompanySelect = (company) => {
    setActiveCompany(company);
    const firstBranch = BRANCHES[company]?.[0];
    setActiveBranch(firstBranch);
    setShowCompanyDropdown(false);
    onCompanyChange?.(company);
    onBranchChange?.(firstBranch);
  };

  const handleBranchSelect = (branch) => {
    setActiveBranch(branch);
    setShowBranchDropdown(false);
    onBranchChange?.(branch);
  };

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
      {/* Company Selector */}
      <div className="relative flex-1">
        <button
          onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-sm"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-semibold truncate">{activeCompany}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showCompanyDropdown ? "rotate-180" : ""}`} />
        </button>

        {showCompanyDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            {COMPANIES.map((company) => (
              <button
                key={company}
                onClick={() => handleCompanySelect(company)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  activeCompany === company ? "bg-primary/10 text-primary font-semibold" : ""
                }`}
              >
                {company}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-border" />

      {/* Branch Selector */}
      <div className="relative flex-1">
        <button
          onClick={() => setShowBranchDropdown(!showBranchDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-sm"
        >
          <span className="font-semibold truncate">{activeBranch || "Sélectionner branche"}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showBranchDropdown ? "rotate-180" : ""}`} />
        </button>

        {showBranchDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            {availableBranches.map((branch) => (
              <button
                key={branch}
                onClick={() => handleBranchSelect(branch)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  activeBranch === branch ? "bg-primary/10 text-primary font-semibold" : ""
                }`}
              >
                {branch}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}