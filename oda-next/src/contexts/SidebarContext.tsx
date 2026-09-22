"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  sidebarWidthClass: string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "insight_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const collapsed = saved === "true";
        setIsCollapsedState(collapsed);
        if (collapsed) {
          document.documentElement.classList.add("sidebar-collapsed");
        } else {
          document.documentElement.classList.remove("sidebar-collapsed");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
      if (collapsed) {
        document.documentElement.classList.add("sidebar-collapsed");
      } else {
        document.documentElement.classList.remove("sidebar-collapsed");
      }
    } catch {
      // ignore
    }
  };

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
        if (next) {
          document.documentElement.classList.add("sidebar-collapsed");
        } else {
          document.documentElement.classList.remove("sidebar-collapsed");
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const sidebarWidthClass = isCollapsed ? "lg:pl-20" : "lg:pl-64";

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        sidebarWidthClass,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      sidebarWidthClass: "lg:pl-64",
    };
  }
  return context;
}
