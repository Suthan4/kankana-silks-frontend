"use client";

import Link from "next/link";
import type { User } from "@/store/useAuthModalStore";

interface MobileMenuProfileProps {
  user: User | null;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function MobileMenuProfile({
  user,
  onClose,
  onLogin,
  onLogout,
}: MobileMenuProfileProps) {
  if (!user) {
    return (
      <button
        onClick={onLogin}
        className="mb-6 w-full rounded-lg bg-black py-3 font-semibold text-white"
      >
        Sign In / Sign Up
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-gray-50 p-4">
      <p className="font-semibold text-gray-900">Hello, {user.firstName}!</p>
      <p className="text-sm text-gray-600">{user.email}</p>
      <div className="mt-3 space-y-2">
        <Link href="/my-account" onClick={onClose} className="block text-sm text-gray-700 hover:text-black">
          My Account
        </Link>
        <Link href="/my-account/orders" onClick={onClose} className="block text-sm text-gray-700 hover:text-black">
          My Orders
        </Link>
        <Link href="/my-account/addresses" onClick={onClose} className="block text-sm text-gray-700 hover:text-black">
          Address
        </Link>
        <button onClick={onLogout} className="block w-full text-left text-sm text-red-600">
          Sign Out
        </button>
      </div>
    </div>
  );
}
