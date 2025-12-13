"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/src/components/FormInput";
import { loginUser, setAuthToken, setUserData } from "@/src/lib/api";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await loginUser({ email, password });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUserData(response.data.user);

        router.push("/chat");
      } else {
        setError(response.message || "Login failed. Please try again.");
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
        <div className="relative p-8">
          <div className="relative z-10 pt-6 space-y-8">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#e5e5e5] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="space-y-2">
              <h1 className="text-[32px] font-bold text-[#1a1a1a] leading-tight">
                Welcome Back
              </h1>
              <p className="text-[#9ca3af] text-base">
                Let's get you signed in.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                type="email"
                name="email"
                placeholder="Email address"
                icon={Mail}
                required
              />

              <FormInput
                type="password"
                name="password"
                placeholder="••••••••"
                icon={Lock}
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
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#9ca3af] pt-4">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#84cc16] hover:text-[#65a30d] transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

