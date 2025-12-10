"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, FileText, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    title: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      console.log("Already processing registration, ignoring duplicate request");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    console.log("Starting registration for:", formData.email);

    try {
      // Call API route to create user and profile
      console.log("Calling /api/auth/register...");
      const response = await fetch("/links/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          title: formData.title,
        }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      console.log("User created successfully, signing in...");

      // Now sign in the user
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw signInError;
      }

      console.log("Sign in successful, redirecting...");
      toast.success("Conta criada com sucesso!");

      // Small delay before redirect to ensure toast is visible
      await new Promise(resolve => setTimeout(resolve, 500));

      window.location.href = "/links/admin/dashboard";
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Erro ao criar conta");
      setIsLoading(false); // Only reset loading on error
    }
    // Don't reset isLoading on success - let the redirect happen
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Comece a criar sua página de links
          </p>
        </div>

        <Card>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              type="text"
              name="fullName"
              label="Nome Completo"
              placeholder="Seu nome completo"
              value={formData.fullName}
              onChange={handleChange}
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              type="text"
              name="title"
              label="Título/Descrição (opcional)"
              placeholder="Ex: Designer | Desenvolvedor"
              value={formData.title}
              onChange={handleChange}
              icon={<FileText className="w-5 h-5" />}
            />

            <Input
              type="password"
              name="password"
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar Senha"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              icon={<UserPlus className="w-5 h-5" />}
            >
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

