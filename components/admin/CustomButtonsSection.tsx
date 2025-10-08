"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";
import type { CustomButton } from "@/lib/types/database";

interface CustomButtonsSectionProps {
  userId: string;
  initialCustomButtons: CustomButton[];
}

const linkTypeOptions = [
  { value: "external", label: "Link Externo" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
];

export default function CustomButtonsSection({
  userId,
  initialCustomButtons,
}: CustomButtonsSectionProps) {
  const [customButtons, setCustomButtons] = useState<CustomButton[]>(
    initialCustomButtons
  );
  const [isLoading, setIsLoading] = useState(false);

  const addCustomButton = () => {
    const newButton: Partial<CustomButton> = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      title: "",
      subtitle: "",
      url: "",
      icon: "#0891B2",
      link_type: "external",
      order: customButtons.length,
      created_at: new Date().toISOString(),
    };
    setCustomButtons([...customButtons, newButton as CustomButton]);
  };

  const removeCustomButton = (id: string) => {
    setCustomButtons(customButtons.filter((button) => button.id !== id));
  };

  const updateCustomButton = (id: string, field: string, value: string) => {
    setCustomButtons(
      customButtons.map((button) =>
        button.id === id ? { ...button, [field]: value } : button
      )
    );
  };

  const handleSave = async () => {
    // Validate
    for (const button of customButtons) {
      if (!button.title.trim() || !button.url.trim()) {
        toast.error("Preencha título e URL de todos os botões");
        return;
      }
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Delete all existing custom buttons
      await supabase.from("custom_buttons").delete().eq("user_id", userId);

      // Insert new custom buttons
      const buttonsToInsert = customButtons.map((button, index) => ({
        user_id: userId,
        title: button.title,
        subtitle: button.subtitle || null,
        url: button.url,
        icon: button.icon || null,
        link_type: button.link_type,
        order: index,
      }));

      if (buttonsToInsert.length > 0) {
        const { error } = await supabase
          .from("custom_buttons")
          .insert(buttonsToInsert);

        if (error) throw error;
      }

      toast.success("Botões atualizados com sucesso!");

      // Refresh data
      const { data } = await supabase
        .from("custom_buttons")
        .select("*")
        .eq("user_id", userId)
        .order("order", { ascending: true });

      if (data) {
        setCustomButtons(data);
      }
    } catch (error: any) {
      console.error("Custom buttons update error:", error);
      toast.error("Erro ao atualizar botões");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Botões Customizados</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={addCustomButton}
          icon={<Plus className="w-4 h-4" />}
        >
          Adicionar
        </Button>
      </div>

      <div className="space-y-4">
        {customButtons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum botão adicionado. Clique em "Adicionar" para começar.
          </p>
        ) : (
          customButtons.map((button) => (
            <div
              key={button.id}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="Título do botão"
                  value={button.title}
                  onChange={(e) =>
                    updateCustomButton(button.id, "title", e.target.value)
                  }
                  label="Título"
                  required
                />

                <Input
                  type="text"
                  placeholder="Subtítulo (opcional)"
                  value={button.subtitle || ""}
                  onChange={(e) =>
                    updateCustomButton(button.id, "subtitle", e.target.value)
                  }
                  label="Subtítulo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="https://... ou email@exemplo.com"
                  value={button.url}
                  onChange={(e) =>
                    updateCustomButton(button.id, "url", e.target.value)
                  }
                  label="URL"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Tipo de Link
                  </label>
                  <select
                    value={button.link_type}
                    onChange={(e) =>
                      updateCustomButton(button.id, "link_type", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {linkTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-text">
                    Cor do Ícone:
                  </label>
                  <input
                    type="color"
                    value={button.icon || "#0891B2"}
                    onChange={(e) =>
                      updateCustomButton(button.id, "icon", e.target.value)
                    }
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    {button.icon || "#0891B2"}
                  </span>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeCustomButton(button.id)}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {customButtons.length > 0 && (
        <div className="mt-6">
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            icon={<Save className="w-5 h-5" />}
          >
            Salvar Botões
          </Button>
        </div>
      )}
    </Card>
  );
}

