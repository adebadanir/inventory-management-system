"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  // const router = useRouter();
  return <>{children}</>;
}
