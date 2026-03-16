"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCompanyAction } from "@/modules/company/infrastructure/company.actions";

interface CompanyInfo {
  name: string;
  logoUrl: string | null;
}

const defaultInfo: CompanyInfo = { name: "Reto Factus", logoUrl: null };

const CompanyCtx = createContext<CompanyInfo>(defaultInfo);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<CompanyInfo>(defaultInfo);

  useEffect(() => {
    getCompanyAction()
      .then((company) => {
        setInfo({
          name: company.name || "Reto Factus",
          logoUrl: company.logoUrl || null,
        });
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  return <CompanyCtx.Provider value={info}>{children}</CompanyCtx.Provider>;
}

export function useCompanyInfo(): CompanyInfo {
  return useContext(CompanyCtx);
}
