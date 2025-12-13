"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Mail, User, Phone, Home } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/src/components/FormInput";
import { registerUser, setAuthToken, setUserData } from "@/src/lib/api";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const address = formData.get("address") as string;

    try {
      const response = await registerUser({
        name,
        email,
        phone,
        password,
        address,
      });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUserData(response.data.user);

        router.push("/chat");
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-3xl">
        <div className="relative overflow-hidden p-8">
          <div className="relative z-10 pt-6 space-y-6">
            <Link
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#e5e5e5] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="space-y-2">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] leading-tight">
                Create Account
              </h1>
              <p className="text-[#9ca3af] text-base">
                Let's get you started.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex sm:flex-row flex-col w-full justify-between gap-5">
                <FormInput
                  type="text"
                  name="name"
                  placeholder="Full name"
                  icon={User}
                  required
                  className="w-full sm:w-1/2"
                />
                <FormInput
                  type="email"
                  name="email"
                  placeholder="demo@example.com"
                  icon={Mail}
                  required
                  className="w-full"
                />
              </div>

              <FormInput
                type="tel"
                name="phone"
                placeholder="Phone number"
                icon={Phone}
                required
              />

              <FormInput
                type="password"
                name="password"
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <FormInput
                type="text"
                name="address"
                placeholder="address"
                icon={Home}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-full bg-[#2d3748] px-6 py-5 text-white text-base font-medium hover:bg-[#1a202c] transition-all duration-200 flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#9ca3af] pt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#84cc16] hover:text-[#65a30d] transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

