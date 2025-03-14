"use client";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <>Loading...</>;
  }
  return <div className="">Home</div>;
}
