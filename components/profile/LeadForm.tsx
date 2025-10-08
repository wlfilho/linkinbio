"use client";

import { useState } from "react";
import { User, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

interface LeadFormProps {
  userId: string;
}

export default function LeadForm({ userId }: LeadFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      console.log("Already submitting, ignoring duplicate request");
      return;
    }

    setIsLoading(true);
    console.log("=== LEAD SUBMISSION START ===");
    console.log("User ID:", userId);
    console.log("Form data:", formData);

    try {
      const supabase = createClient();

      const leadData = {
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
      };

      console.log("Inserting lead data:", leadData);

      const { data, error } = await supabase.from("leads").insert(leadData).select();

      console.log("Insert response:", { data, error });

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log("✅ Lead submitted successfully:", data);
      toast.success("Obrigado! Você receberá o material em breve.");
      setIsSubmitted(true);
      setFormData({ fullName: "", email: "", whatsapp: "" });
    } catch (error: any) {
      console.error("❌ Lead submission error:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error || {}));

      // More detailed error message
      const errorMessage = error?.message || error?.error_description || "Erro desconhecido";
      toast.error(`Erro ao enviar formulário: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log("=== LEAD SUBMISSION END ===");
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Cadastro Realizado!
          </h3>
          <p className="text-green-700">
            Obrigado pelo seu interesse. Em breve você receberá o material gratuito.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-cyan-50 border-primary/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text mb-2">
          📥 Baixe Meu Material Gratuito
        </h2>
        <p className="text-gray-600">
          Preencha o formulário abaixo e receba conteúdo exclusivo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="fullName"
          placeholder="Nome Completo"
          value={formData.fullName}
          onChange={handleChange}
          icon={<User className="w-5 h-5" />}
          required
        />

        <Input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleChange}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <Input
          type="tel"
          name="whatsapp"
          placeholder="(00) 00000-0000"
          value={formData.whatsapp}
          onChange={handleChange}
          icon={<Phone className="w-5 h-5" />}
          required
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Quero Receber
        </Button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Seus dados estão seguros e não serão compartilhados com terceiros.
      </p>
    </Card>
  );
}

