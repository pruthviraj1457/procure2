"use client";

import React, { createContext, useContext, useState } from "react";

type Role = "officer" | "supplier";

type RoleContextType = {
  role: Role;
  setRole: (r: Role) => void;
  isOfficer: boolean;
  isSupplier: boolean;
};

const RoleContext = createContext<RoleContextType>({
  role: "officer",
  setRole: () => {},
  isOfficer: true,
  isSupplier: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("officer");

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isOfficer: role === "officer",
        isSupplier: role === "supplier",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
