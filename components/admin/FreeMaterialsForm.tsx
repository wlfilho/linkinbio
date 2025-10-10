"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { FreeMaterial } from "@/lib/types/database";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface FreeMaterialsFormProps {
  material?: FreeMaterial | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FreeMaterialsForm({
  material,
  onSuccess,
  onCancel,
}: FreeMaterialsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    material_name: "",
    email_content: "",
    thank_you_content: "",
    download_link: "",
  });

  const [errors, setErrors] = useState({
    material_name: "",
    email_content: "",
    thank_you_content: "",
    download_link: "",
  });

  useEffect(() => {
    if (material) {
      setFormData({
        material_name: material.material_name || "",
        email_content: material.email_content || "",
        thank_you_content: material.thank_you_content || "",
        download_link: material.download_link || "",
      });
    }
  }, [material]);

  const validateForm = (): boolean => {
    const newErrors = {
      material_name: "",
      email_content: "",
      thank_you_content: "",
      download_link: "",
    };

    let isValid = true;

    // Validate material name
    if (!formData.material_name.trim()) {
      newErrors.material_name = "Nome do material é obrigatório";
      isValid = false;
    }

    // Validate email content
    if (!formData.email_content.trim()) {
      newErrors.email_content = "Conteúdo do email é obrigatório";
      isValid = false;
    }

    // Validate thank you content
    if (!formData.thank_you_content.trim()) {
      newErrors.thank_you_content = "Conteúdo da página de obrigado é obrigatório";
      isValid = false;
    }

    // Validate download link
    if (!formData.download_link.trim()) {
      newErrors.download_link = "Link de download é obrigatório";
      isValid = false;
    } else {
      // Validate URL format
      try {
        new URL(formData.download_link.trim());
      } catch {
        newErrors.download_link = "URL inválida. Use o formato: https://exemplo.com/arquivo.pdf";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (material) {
        // Update existing material
        const { error } = await supabase
          .from("free_materials")
          .update({
            material_name: formData.material_name.trim(),
            email_content: formData.email_content.trim(),
            thank_you_content: formData.thank_you_content.trim(),
            download_link: formData.download_link.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", material.id);

        if (error) throw error;
        toast.success("Material atualizado com sucesso!");
      } else {
        // Create new material
        const { error } = await supabase
          .from("free_materials")
          .insert({
            user_id: user.id,
            material_name: formData.material_name.trim(),
            email_content: formData.email_content.trim(),
            thank_you_content: formData.thank_you_content.trim(),
            download_link: formData.download_link.trim(),
            order_index: 0,
          });

        if (error) throw error;
        toast.success("Material criado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving material:", error);
      toast.error("Erro ao salvar material: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#2a2727] border-[#3a3737] p-6">
      <h2 className="text-xl font-heading font-bold text-[#177245] mb-6">
        {material ? "Editar Material" : "Novo Material"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material Name */}
        <div>
          <Input
            label="Nome do Material"
            type="text"
            value={formData.material_name}
            onChange={(e) => {
              setFormData({ ...formData, material_name: e.target.value });
              setErrors({ ...errors, material_name: "" });
            }}
            placeholder="Ex: E-book Gratuito de Marketing Digital"
            required
            error={errors.material_name}
          />
        </div>

        {/* Download Link */}
        <div>
          <Input
            label="Link de Download"
            type="url"
            value={formData.download_link}
            onChange={(e) => {
              setFormData({ ...formData, download_link: e.target.value });
              setErrors({ ...errors, download_link: "" });
            }}
            placeholder="https://exemplo.com/arquivo.pdf"
            required
            error={errors.download_link}
          />
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            URL do arquivo que será enviado ao lead (PDF, ZIP, etc.)
          </p>
        </div>

        {/* Email Content */}
        <div>
          <label className="block text-sm font-medium text-[#F1FFFA]/90 mb-2">
            Conteúdo do Email do Material <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.email_content}
            onChange={(e) => {
              setFormData({ ...formData, email_content: e.target.value });
              setErrors({ ...errors, email_content: "" });
            }}
            placeholder="Digite o conteúdo do email que será enviado ao lead..."
            rows={6}
            required
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.email_content ? "border-red-500" : "border-[#3a3737]"
            } bg-[#2a2727] text-[#F1FFFA] placeholder:text-[#F1FFFA]/50 focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 outline-none transition-colors`}
          />
          {errors.email_content && (
            <p className="text-red-500 text-sm mt-1">{errors.email_content}</p>
          )}
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Este conteúdo será enviado por email para o lead após o cadastro
          </p>
        </div>

        {/* Thank You Page Content */}
        <div>
          <label className="block text-sm font-medium text-[#F1FFFA]/90 mb-2">
            Conteúdo da Página de Obrigado <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.thank_you_content}
            onChange={(e) => {
              setFormData({ ...formData, thank_you_content: e.target.value });
              setErrors({ ...errors, thank_you_content: "" });
            }}
            placeholder="Digite o conteúdo que será exibido na página de agradecimento..."
            rows={6}
            required
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.thank_you_content ? "border-red-500" : "border-[#3a3737]"
            } bg-[#2a2727] text-[#F1FFFA] placeholder:text-[#F1FFFA]/50 focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 outline-none transition-colors`}
          />
          {errors.thank_you_content && (
            <p className="text-red-500 text-sm mt-1">{errors.thank_you_content}</p>
          )}
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Este conteúdo será exibido após o lead preencher o formulário
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {material ? "Atualizar Material" : "Criar Material"}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

