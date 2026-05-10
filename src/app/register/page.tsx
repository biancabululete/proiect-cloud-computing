"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/validators";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateAll(): FieldErrors {
    return {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
  }

  function setFieldError(field: keyof FieldErrors, error: string | null) {
    setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const v = validateAll();
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Eroare la inregistrare");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputCls = (hasError?: boolean) =>
    `w-full border rounded px-3 py-2 ${
      hasError ? "border-red-400 focus:outline-red-500" : ""
    }`;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Cont nou</h1>
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div>
          <label className="block text-sm font-medium mb-1">Nume</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setFieldError("name", validateName(name))}
            className={inputCls(!!errors.name)}
            placeholder="Prenume Nume"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setFieldError("email", validateEmail(email))}
            className={inputCls(!!errors.email)}
            placeholder="nume@exemplu.ro"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Numar de telefon{" "}
            <span className="text-xs text-gray-500 font-normal">
              (format romanesc, ex: 0712345678)
            </span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setFieldError("phone", validatePhone(phone))}
            className={inputCls(!!errors.phone)}
            placeholder="07xx xxx xxx"
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Parola{" "}
            <span className="text-xs text-gray-500 font-normal">
              (min 8 caractere, litera + cifra)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldError("password", validatePassword(password))}
            className={inputCls(!!errors.password)}
          />
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {serverError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white rounded py-2 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Se creeaza..." : "Creeaza cont"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Ai deja cont?{" "}
        <Link href="/login" className="text-brand font-semibold underline">
          Autentifica-te
        </Link>
      </p>
    </div>
  );
}
