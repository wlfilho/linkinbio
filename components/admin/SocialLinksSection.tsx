"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";
import type { SocialLink } from "@/lib/types/database";

interface SocialLinksSectionProps {
  userId: string;
  initialSocialLinks: SocialLink[];
}

const platformOptions = [
  { value: "youtube", label: "YouTube", defaultColor: "#FF0000" },
  { value: "instagram", label: "Instagram", defaultColor: "#E4405F" },
  { value: "linkedin", label: "LinkedIn", defaultColor: "#0077B5" },
  { value: "github", label: "GitHub", defaultColor: "#181717" },
  { value: "twitter", label: "Twitter/X", defaultColor: "#1DA1F2" },
  { value: "facebook", label: "Facebook", defaultColor: "#1877F2" },
  { value: "tiktok", label: "TikTok", defaultColor: "#000000" },
  { value: "substack", label: "Substack", defaultColor: "#FF6719" },
];

export default function SocialLinksSection({
  userId,
  initialSocialLinks,
}: SocialLinksSectionProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [isLoading, setIsLoading] = useState(false);

  const addSocialLink = () => {
    const newLink: Partial<SocialLink> = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      platform: "youtube",
      display_name: "",
      url: "",
      color: "#FF0000",
      order: socialLinks.length,
      created_at: new Date().toISOString(),
    };
    setSocialLinks([...socialLinks, newLink as SocialLink]);
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  const updateSocialLink = (id: string, field: string, value: string) => {
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const handlePlatformChange = (id: string, platform: string) => {
    const selectedPlatform = platformOptions.find((p) => p.value === platform);
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id
          ? {
              ...link,
              platform,
              color: selectedPlatform?.defaultColor || link.color,
            }
          : link
      )
    );
  };

  const handleSave = async () => {
    // Validate
    for (const link of socialLinks) {
      if (!link.display_name.trim() || !link.url.trim()) {
        toast.error("Preencha todos os campos das redes sociais");
        return;
      }
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Delete all existing social links
      await supabase.from("social_links").delete().eq("user_id", userId);

      // Insert new social links
      const linksToInsert = socialLinks.map((link, index) => ({
        user_id: userId,
        platform: link.platform,
        display_name: link.display_name,
        url: link.url,
        color: link.color,
        order: index,
      }));

      if (linksToInsert.length > 0) {
        const { error } = await supabase
          .from("social_links")
          .insert(linksToInsert);

        if (error) throw error;
      }

      toast.success("Redes sociais atualizadas com sucesso!");
      
      // Refresh data
      const { data } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", userId)
        .order("order", { ascending: true });

      if (data) {
        setSocialLinks(data);
      }
    } catch (error: any) {
      console.error("Social links update error:", error);
      toast.error("Erro ao atualizar redes sociais");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Redes Sociais</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={addSocialLink}
          icon={<Plus className="w-4 h-4" />}
        >
          Adicionar
        </Button>
      </div>

      <div className="space-y-4">
        {socialLinks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma rede social adicionada. Clique em "Adicionar" para começar.
          </p>
        ) : (
          socialLinks.map((link) => (
            <div
              key={link.id}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Plataforma
                  </label>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      handlePlatformChange(link.id, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {platformOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  type="text"
                  placeholder="Nome de exibição"
                  value={link.display_name}
                  onChange={(e) =>
                    updateSocialLink(link.id, "display_name", e.target.value)
                  }
                  label="Nome de Exibição"
                />
              </div>

              <Input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateSocialLink(link.id, "url", e.target.value)}
                label="URL"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-text">Cor:</label>
                  <input
                    type="color"
                    value={link.color}
                    onChange={(e) =>
                      updateSocialLink(link.id, "color", e.target.value)
                    }
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{link.color}</span>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {socialLinks.length > 0 && (
        <div className="mt-6">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            icon={<Save className="w-5 h-5" />}
          >
            Salvar Redes Sociais
          </Button>
        </div>
      )}
    </Card>
  );
}

