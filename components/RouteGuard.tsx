"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RouteGuard({ children }: { children: any }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    if (!router.isReady) return;

    const handleRouteChange = (url: string) => {
      setIsLoginPage(url === "/login");
      setIsLoggedIn(url !== "/login" && url !== "/");
    };

    handleRouteChange(router.pathname);
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.isReady, router]);

  if (!isMounted) return null; // Ensure nothing is rendered until mounted

  return children({ isLoginPage, isLoggedIn });
}
