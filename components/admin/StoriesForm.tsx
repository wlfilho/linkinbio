"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Story } from "@/lib/types/database";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import FileUpload from "@/components/ui/FileUpload";
import { replaceFile } from "@/lib/utils/storage";

interface StoriesFormProps {
  story?: Story | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StoriesForm({
  story,
  onSuccess,
  onCancel,
}: StoriesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    video_url: "",
    link_url: "",
    duration: "5",
    expires_in_hours: "24",
  });

  const [errors, setErrors] = useState({
    title: "",
    image_url: "",
    video_url: "",
    link_url: "",
    duration: "",
    expires_in_hours: "",
  });

  useEffect(() => {
    if (story) {
      // Calculate hours until expiration
      const expiresAt = new Date(story.expires_at);
      const now = new Date();
      const hoursUntilExpiration = Math.max(
        1,
        Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
      );

      setFormData({
        title: story.title || "",
        image_url: story.image_url || "",
        video_url: story.video_url || "",
        link_url: story.link_url || "",
        duration: story.duration.toString(),
        expires_in_hours: hoursUntilExpiration.toString(),
      });
    }
  }, [story]);

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      image_url: "",
      video_url: "",
      link_url: "",
      duration: "",
      expires_in_hours: "",
    };

    let isValid = true;

    // Validate that at least one media is provided
    if (!formData.image_url.trim() && !formData.video_url.trim()) {
      newErrors.image_url = "Forneça uma imagem ou vídeo";
      newErrors.video_url = "Forneça uma imagem ou vídeo";
      isValid = false;
    }

    // Validate link URL if provided
    if (formData.link_url.trim()) {
      try {
        new URL(formData.link_url.trim());
      } catch {
        newErrors.link_url = "URL inválida";
        isValid = false;
      }
    }

    // Validate duration
    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      newErrors.duration = "Duração deve ser entre 1 e 60 segundos";
      isValid = false;
    }

    // Validate expiration
    const expiresInHours = parseInt(formData.expires_in_hours);
    if (isNaN(expiresInHours) || expiresInHours < 1) {
      newErrors.expires_in_hours = "Deve ser pelo menos 1 hora";
      isValid = false;
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

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(formData.expires_in_hours));

      if (story) {
        // Delete old files if they were replaced
        if (story.image_url && story.image_url !== formData.image_url) {
          await replaceFile(story.image_url, formData.image_url, "stories");
        }
        if (story.video_url && story.video_url !== formData.video_url) {
          await replaceFile(story.video_url, formData.video_url, "stories");
        }

        // Update existing story
        const { error } = await supabase
          .from("stories")
          .update({
            title: formData.title.trim() || null,
            image_url: formData.image_url.trim() || null,
            video_url: formData.video_url.trim() || null,
            link_url: formData.link_url.trim() || null,
            duration: parseInt(formData.duration),
            expires_at: expiresAt.toISOString(),
          })
          .eq("id", story.id);

        if (error) throw error;
        toast.success("Story atualizado com sucesso!");
      } else {
        // Get the highest order number
        const { data: existingStories } = await supabase
          .from("stories")
          .select("order")
          .eq("user_id", user.id)
          .order("order", { ascending: false })
          .limit(1);

        const nextOrder = existingStories && existingStories.length > 0
          ? existingStories[0].order + 1
          : 0;

        // Create new story
        const { error } = await supabase
          .from("stories")
          .insert({
            user_id: user.id,
            title: formData.title.trim() || null,
            image_url: formData.image_url.trim() || null,
            video_url: formData.video_url.trim() || null,
            link_url: formData.link_url.trim() || null,
            duration: parseInt(formData.duration),
            expires_at: expiresAt.toISOString(),
            order: nextOrder,
            is_active: true,
          });

        if (error) throw error;
        toast.success("Story criado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving story:", error);
      toast.error("Erro ao salvar story: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#2a2727] border-[#3a3737] p-6">
      <h2 className="text-xl font-heading font-bold text-[#177245] mb-6">
        {story ? "Editar Story" : "Novo Story"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <Input
            label="Título (opcional)"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              setErrors({ ...errors, title: "" });
            }}
            placeholder="Ex: Novo Produto"
            error={errors.title}
          />
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Aparece abaixo do círculo do story
          </p>
        </div>

        {/* Image Upload */}
        <FileUpload
          label="Imagem do Story"
          accept="image/jpeg,image/png,image/webp,image/gif"
          maxSize={10 * 1024 * 1024} // 10MB
          currentUrl={formData.image_url}
          onUploadComplete={(url) => {
            setFormData({ ...formData, image_url: url });
            setErrors({ ...errors, image_url: "", video_url: "" });
          }}
          onRemove={() => {
            setFormData({ ...formData, image_url: "" });
          }}
          error={errors.image_url}
          disabled={isLoading}
          type="image"
        />

        {/* Video Upload */}
        <FileUpload
          label="Vídeo do Story (opcional)"
          accept="video/mp4,video/webm,video/quicktime"
          maxSize={50 * 1024 * 1024} // 50MB
          currentUrl={formData.video_url}
          onUploadComplete={(url) => {
            setFormData({ ...formData, video_url: url });
            setErrors({ ...errors, video_url: "", image_url: "" });
          }}
          onRemove={() => {
            setFormData({ ...formData, video_url: "" });
          }}
          error={errors.video_url}
          disabled={isLoading}
          type="video"
        />
        <p className="text-[#F1FFFA]/50 text-sm -mt-4">
          Se fornecido, o vídeo será exibido ao invés da imagem
        </p>

        {/* Link URL */}
        <div>
          <Input
            label="Link (Call-to-Action) - Opcional"
            type="url"
            value={formData.link_url}
            onChange={(e) => {
              setFormData({ ...formData, link_url: e.target.value });
              setErrors({ ...errors, link_url: "" });
            }}
            placeholder="https://exemplo.com/produto"
            error={errors.link_url}
          />
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Botão "Ver mais" que aparece no story
          </p>
        </div>

        {/* Duration */}
        <div>
          <Input
            label="Duração (segundos)"
            type="number"
            min="1"
            max="60"
            value={formData.duration}
            onChange={(e) => {
              setFormData({ ...formData, duration: e.target.value });
              setErrors({ ...errors, duration: "" });
            }}
            placeholder="5"
            required
            error={errors.duration}
          />
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Tempo que o story ficará visível (1-60 segundos)
          </p>
        </div>

        {/* Expiration */}
        <div>
          <Input
            label="Expira em (horas)"
            type="number"
            min="1"
            value={formData.expires_in_hours}
            onChange={(e) => {
              setFormData({ ...formData, expires_in_hours: e.target.value });
              setErrors({ ...errors, expires_in_hours: "" });
            }}
            placeholder="24"
            required
            error={errors.expires_in_hours}
          />
          <p className="text-[#F1FFFA]/50 text-sm mt-1">
            Após este período, o story não será mais exibido (padrão: 24h)
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
            {story ? "Atualizar Story" : "Criar Story"}
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

