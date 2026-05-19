import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">TravelKu</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Masuk ke manajemen pemesanan
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
