// 🔁 Redirect automatico da "/" a "/home"
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push("/home");
  }, [router]);
  return null;
}
