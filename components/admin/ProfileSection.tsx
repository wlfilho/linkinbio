"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User, FileText, Upload, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Card from "@/components/ui/Card";
import { toast } from "sonner";
import type { Profile } from "@/lib/types/database";

interface ProfileSectionProps {
  profile: Profile | null;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    title: profile?.title || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile?.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setImageError(false);
      toast.success("Avatar atualizado com sucesso!");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error("Erro ao fazer upload do avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          title: formData.title || null,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Perfil</h2>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
              {avatarUrl && !imageError ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
                  {formData.fullName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Avatar
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG ou WebP. Máx 2MB.
            </p>
          </div>
        </div>

        {/* Form Fields */}
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

        <Textarea
          name="title"
          label="Título/Descrição"
          placeholder="Ex: Designer | Desenvolvedor | Criador de Conteúdo"
          value={formData.title}
          onChange={handleChange}
          rows={3}
        />

        <Button
          onClick={handleSave}
          isLoading={isLoading}
          icon={<Save className="w-5 h-5" />}
        >
          Salvar Perfil
        </Button>
      </div>
    </Card>
  );
}

