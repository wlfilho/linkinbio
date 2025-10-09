"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { FreeMaterial } from "@/lib/types/database";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FreeMaterialsForm from "@/components/admin/FreeMaterialsForm";

export default function FreeMaterialsPage() {
  const [materials, setMaterials] = useState<FreeMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<FreeMaterial | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("free_materials")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setMaterials(data || []);
    } catch (error: any) {
      console.error("Error fetching materials:", error);
      toast.error("Erro ao carregar materiais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMaterial(null);
    fetchMaterials();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  const handleEdit = (material: FreeMaterial) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("free_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Material excluído com sucesso!");
      fetchMaterials();
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast.error("Erro ao excluir material");
    }
  };

  const toggleActive = async (material: FreeMaterial) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("free_materials")
        .update({ 
          is_active: !material.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", material.id);

      if (error) throw error;

      toast.success(
        material.is_active 
          ? "Material desativado" 
          : "Material ativado"
      );
      fetchMaterials();
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newMaterials = [...materials];
    [newMaterials[index], newMaterials[index - 1]] = [newMaterials[index - 1], newMaterials[index]];

    await updateOrder(newMaterials);
  };

  const moveDown = async (index: number) => {
    if (index === materials.length - 1) return;

    const newMaterials = [...materials];
    [newMaterials[index], newMaterials[index + 1]] = [newMaterials[index + 1], newMaterials[index]];

    await updateOrder(newMaterials);
  };

  const updateOrder = async (newMaterials: FreeMaterial[]) => {
    try {
      const supabase = createClient();

      const updates = newMaterials.map((material, index) => ({
        id: material.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from("free_materials")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
      }

      setMaterials(newMaterials);
      toast.success("Ordem atualizada!");
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar ordem");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#177245]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#177245]">
            Materiais Gratuitos
          </h1>
          <p className="text-[#F1FFFA]/70 mt-2">
            Gerencie os materiais disponíveis para captura de leads
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Material
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <FreeMaterialsForm
            material={editingMaterial}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card className="bg-[#2a2727] border-[#3a3737] p-12 text-center">
          <FileText className="w-16 h-16 text-[#F1FFFA]/30 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold text-[#F1FFFA]/70 mb-2">
            Nenhum material cadastrado
          </h3>
          <p className="text-[#F1FFFA]/50 mb-6">
            Crie seu primeiro material gratuito para começar a capturar leads
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Criar Primeiro Material
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => (
            <Card
              key={material.id}
              className={`bg-[#2a2727] border-[#3a3737] p-6 ${
                !material.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Order Controls */}
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="text-[#F1FFFA]/50 hover:text-[#177245] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === materials.length - 1}
                    className="text-[#F1FFFA]/50 hover:text-[#177245] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-heading font-bold text-[#177245] mb-1">
                        {material.material_name}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        material.is_active
                          ? "bg-[#177245]/20 text-[#177245]"
                          : "bg-[#F1FFFA]/10 text-[#F1FFFA]/50"
                      }`}
                    >
                      {material.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  {/* Email Content Preview */}
                  <div className="mb-3">
                    <p className="text-[#F1FFFA]/50 text-xs font-medium mb-1">
                      Conteúdo do Email:
                    </p>
                    <p className="text-[#F1FFFA]/70 text-sm line-clamp-2">
                      {material.email_content}
                    </p>
                  </div>

                  {/* Thank You Content Preview */}
                  <div>
                    <p className="text-[#F1FFFA]/50 text-xs font-medium mb-1">
                      Página de Obrigado:
                    </p>
                    <p className="text-[#F1FFFA]/70 text-sm line-clamp-2">
                      {material.thank_you_content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(material)}
                    className="p-2 text-[#F1FFFA]/70 hover:text-[#177245] transition-colors"
                    title={material.is_active ? "Desativar" : "Ativar"}
                  >
                    {material.is_active ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-2 text-[#F1FFFA]/70 hover:text-[#177245] transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-2 text-[#F1FFFA]/70 hover:text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

