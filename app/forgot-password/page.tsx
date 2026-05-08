import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <h1 className="font-[Georgia,'Times_New_Roman',serif] text-2xl text-[var(--ink)]">
          Forgot your password?
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </header>
      <ForgotPasswordForm />
    </div>
  );
}
