import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          {/* Mock Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-md"></div>
            <span className="text-2xl font-bold text-gray-900">Sycomp</span>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
