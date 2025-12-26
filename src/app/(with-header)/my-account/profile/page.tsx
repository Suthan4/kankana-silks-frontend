"use client";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import React from "react";
import ProfileDesktop from "../_desktop/profileDesktop";
import ProfileMobile from "../_mobile/profileMobile";
import { Variant } from "motion";

export default function ProfilePage() {
  const { isMobile } = useBreakpoint();
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };
    const profileData = {
      name: "Aisha Kapoor",
      email: "aisha.kapoor@example.com",
      phone: "+91 98765 43210",
      avatar: "👩",
    };
  return isMobile ? (
    <ProfileMobile pageVariants={pageVariants} profileData={profileData} />
  ) : (
    <ProfileDesktop pageVariants={pageVariants} profileData={profileData} />
  );
}
