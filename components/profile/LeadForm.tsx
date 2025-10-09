"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Download, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MaskedInput from "@/components/ui/MaskedInput";
import Card from "@/components/ui/Card";
import { toast } from "sonner";
import type { FreeMaterial } from "@/lib/types/database";

interface LeadFormProps {
  userId: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  selectedMaterial?: string;
}

interface FormTouched {
  fullName: boolean;
  email: boolean;
  whatsapp: boolean;
  selectedMaterial: boolean;
}

export default function LeadForm({ userId }: LeadFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    selectedMaterial: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({
    fullName: false,
    email: false,
    whatsapp: false,
    selectedMaterial: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [materials, setMaterials] = useState<FreeMaterial[]>([]);

  // Buscar materiais disponíveis
  useEffect(() => {
    const fetchMaterials = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("free_materials")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (!error && data) {
        setMaterials(data);
      }
    };

    fetchMaterials();
  }, [userId]);

  // Validação em tempo real
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length === 10 || numbers.length === 11;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nome
    if (touched.fullName && formData.fullName.trim().length < 3) {
      newErrors.fullName = "Nome deve ter pelo menos 3 caracteres";
    }

    // Validar email
    if (touched.email && formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar WhatsApp
    if (touched.whatsapp && formData.whatsapp && !validatePhone(formData.whatsapp)) {
      newErrors.whatsapp = "Telefone deve ter 10 ou 11 dígitos";
    }

    // Validar material selecionado
    if (touched.selectedMaterial && !formData.selectedMaterial) {
      newErrors.selectedMaterial = "Selecione um material";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (rawValue: string, maskedValue: string) => {
    setFormData({
      ...formData,
      whatsapp: rawValue,
    });
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos os campos como touched
    setTouched({
      fullName: true,
      email: true,
      whatsapp: true,
      selectedMaterial: true,
    });

    // Validar antes de submeter
    const newErrors: FormErrors = {};

    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!validatePhone(formData.whatsapp)) {
      newErrors.whatsapp = "Telefone deve ter 10 ou 11 dígitos";
    }

    if (!formData.selectedMaterial) {
      newErrors.selectedMaterial = "Selecione um material";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

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
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsapp: formData.whatsapp,
        selected_material_id: formData.selectedMaterial,
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

      // Buscar o material selecionado para redirecionar
      const selectedMaterial = materials.find(m => m.id === formData.selectedMaterial);

      if (selectedMaterial?.download_link) {
        toast.success("Redirecionando para o material...");
        setTimeout(() => {
          window.open(selectedMaterial.download_link!, "_blank");
        }, 1000);
      } else {
        toast.success("Obrigado! Você receberá o material em breve.");
      }

      setIsSubmitted(true);
      setFormData({ fullName: "", email: "", whatsapp: "", selectedMaterial: "" });
      setTouched({ fullName: false, email: false, whatsapp: false, selectedMaterial: false });
      setErrors({});
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

  const isFormValid =
    formData.fullName.trim().length >= 3 &&
    validateEmail(formData.email) &&
    validatePhone(formData.whatsapp) &&
    formData.selectedMaterial !== "" &&
    Object.keys(errors).length === 0;

  if (isSubmitted) {
    return (
      <Card className="bg-[#2a2727] border-[#3a3737] shadow-lg animate-in fade-in zoom-in duration-500">
        <div className="text-center py-12 px-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#177245] rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-[#177245] rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white animate-in zoom-in duration-300 delay-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[#177245] mb-3 animate-in slide-in-from-bottom duration-300 delay-300">
            🎉 Cadastro Realizado!
          </h3>
          <p className="text-lg text-[#F1FFFA] mb-2 animate-in slide-in-from-bottom duration-300 delay-400">
            Obrigado pelo seu interesse!
          </p>
          <p className="text-[#F1FFFA]/80 animate-in slide-in-from-bottom duration-300 delay-500">
            Em breve você receberá o material gratuito no seu email.
          </p>
          <div className="mt-6 pt-6 border-t border-[#3a3737] animate-in slide-in-from-bottom duration-300 delay-600">
            <p className="text-sm text-[#F1FFFA]/70 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Fique de olho na sua caixa de entrada
              <Sparkles className="w-4 h-4" />
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#2a2727] border-[#3a3737] shadow-md hover:shadow-xl transition-all duration-300 p-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-[#177245] mb-2">
          Material Gratuito
        </h2>
        <p className="text-[#F1FFFA]/90 text-base font-body">
          Preencha o formulário e receba conteúdo exclusivo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          name="fullName"
          placeholder="Digite seu nome completo"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={() => handleBlur("fullName")}
          icon={<User className="w-5 h-5" />}
          error={touched.fullName ? errors.fullName : undefined}
          success={touched.fullName && !errors.fullName && formData.fullName.length >= 3}
          required
          autoComplete="name"
          aria-label="Nome Completo"
        />

        <Input
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          icon={<Mail className="w-5 h-5" />}
          error={touched.email ? errors.email : undefined}
          success={touched.email && !errors.email && formData.email.length > 0}
          required
          autoComplete="email"
          aria-label="Email"
        />

        <MaskedInput
          name="whatsapp"
          placeholder="(00) 00000-0000"
          value={formData.whatsapp}
          onChange={handlePhoneChange}
          onBlur={() => handleBlur("whatsapp")}
          icon={<Phone className="w-5 h-5" />}
          error={touched.whatsapp ? errors.whatsapp : undefined}
          mask="phone"
          required
          autoComplete="tel"
          aria-label="WhatsApp"
        />

        {/* Dropdown de seleção de material */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F1FFFA]/70 pointer-events-none">
            <Download className="w-5 h-5" />
          </div>
          <select
            name="selectedMaterial"
            value={formData.selectedMaterial}
            onChange={handleChange}
            onBlur={() => handleBlur("selectedMaterial")}
            className={`
              w-full px-4 py-2.5 pl-11 rounded-lg border transition-all duration-200 text-[#F1FFFA] bg-[#2a2727]
              ${errors.selectedMaterial && touched.selectedMaterial
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-[#3a3737] focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 hover:border-[#4a4747]"
              }
              outline-none appearance-none
              disabled:bg-[#212020] disabled:cursor-not-allowed
            `}
            required
            aria-label="Selecione o material desejado"
          >
            <option value="" disabled>Escolha um material...</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.title}
              </option>
            ))}
          </select>
          {errors.selectedMaterial && touched.selectedMaterial && (
            <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top duration-200">
              {errors.selectedMaterial}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full group relative overflow-hidden"
            size="lg"
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  Quero Receber Agora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#177245] to-[#1a8a52] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-[#3a3737]">
        <div className="flex items-center justify-center gap-2 text-sm text-[#F1FFFA]/70">
          <svg className="w-4 h-4 text-[#177245]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <p>
            Seus dados estão <strong className="text-[#F1FFFA]">100% seguros</strong> e não serão compartilhados
          </p>
        </div>
      </div>
    </Card>
  );
}

