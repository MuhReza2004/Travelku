import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">TravelKu</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Daftar staf baru
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <RegisterForm />
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
