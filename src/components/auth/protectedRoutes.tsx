"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/useAuthModalStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "SUPERADMIN" | "ADMIN" | "USER";
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, accessToken, openModal } = useAuthModal();

  useEffect(() => {
    // Check if user is authenticated
    if (!accessToken || !user) {
      // Store the intended destination
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      }

      // Open login modal
      openModal("login");

      // Optionally redirect to home or another page
      router.push(redirectTo);
      return;
    }

    // Check if user has required role
    if (requiredRole) {
      const roleHierarchy = {
        SUPERADMIN: 3,
        ADMIN: 2,
        USER: 1,
      };

      const userRoleLevel = roleHierarchy[user.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        // User doesn't have required permissions
        router.push(redirectTo);
      }
    }
  }, [user, accessToken, requiredRole, router, openModal, redirectTo]);

  // Show loading or nothing while checking auth
  if (!accessToken || !user) {
    return null;
  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy = {
      SUPERADMIN: 3,
      ADMIN: 2,
      USER: 1,
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return null;
    }
  }

  return <>{children}</>;
};
