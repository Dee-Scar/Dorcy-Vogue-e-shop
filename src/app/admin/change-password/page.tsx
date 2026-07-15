"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Check, Loader2, ShieldCheck } from "lucide-react";

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the recovery token in the URL hash — wait for it to be consumed
  useEffect(() => {
    // onAuthStateChange fires with event PASSWORD_RECOVERY when the reset link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    // Also check if already in a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess(true);
      // Redirect to admin login after 3 seconds
      setTimeout(() => router.replace("/admin/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1007] p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 bg-[#FAF7F2] rounded-full border border-[#C9956A]/20">
              <ShieldCheck className="h-9 w-9 text-[#C9956A]" />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1512]">Change Admin Password</h1>
            <p className="font-sans text-sm text-[#8C8682] mt-1">
              Set a new strong password for your admin account.
            </p>
          </div>
        </div>

        {success ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-green-50 rounded-full border border-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-green-700">Password updated successfully!</p>
              <p className="font-sans text-xs text-[#8C8682] mt-1">Redirecting to admin login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl text-base font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3.5 text-[#8C8682] hover:text-[#1C1512] cursor-pointer"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-bold text-[#1C1512] uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8C8682]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl text-base font-sans focus:outline-none focus:border-[#C9956A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-[#8C8682] hover:text-[#1C1512] cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || !sessionReady}
              className="w-full py-3.5 bg-[#C9956A] hover:bg-[#A87A52] text-white font-sans text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Updating...</span></>
              ) : !sessionReady ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying link...</span></>
              ) : (
                "Update Password"
              )}
            </button>

            {!sessionReady && (
              <p className="text-xs text-[#8C8682] text-center font-sans">
                Waiting for the reset link to be verified...
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1C1007]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9956A]" />
      </div>
    }>
      <ChangePasswordContent />
    </Suspense>
  );
}
