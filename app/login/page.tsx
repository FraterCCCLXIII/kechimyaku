import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-medium tracking-tight">Admin Login</h1>
      <LoginForm callbackUrl={callbackUrl ?? "/admin/masters"} />
    </div>
  );
}
