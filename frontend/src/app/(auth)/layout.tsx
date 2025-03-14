"use client";

import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <>Loading...</>;
  }

  return <>{children}</>;
}
