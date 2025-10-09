"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { FreeMaterial } from "@/lib/types/database";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function FreeMaterialsPage() {
  const [materials, setMaterials] = useState<FreeMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<FreeMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    download_link: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (editingMaterial) {
        // Update existing material
        const { error } = await supabase
          .from("free_materials")
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            download_link: formData.download_link.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMaterial.id);

        if (error) throw error;
        toast.success("Material atualizado com sucesso!");
      } else {
        // Create new material
        const maxOrder = materials.length > 0 
          ? Math.max(...materials.map(m => m.order_index))
          : -1;

        const { error } = await supabase
          .from("free_materials")
          .insert({
            user_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            download_link: formData.download_link.trim() || null,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
        toast.success("Material criado com sucesso!");
      }

      setFormData({ title: "", description: "", download_link: "" });
      setShowForm(false);
      setEditingMaterial(null);
      fetchMaterials();
    } catch (error: any) {
      console.error("Error saving material:", error);
      toast.error("Erro ao salvar material");
    }
  };

  const handleEdit = (material: FreeMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || "",
      download_link: material.download_link || "",
    });
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

  const cancelEdit = () => {
    setShowForm(false);
    setEditingMaterial(null);
    setFormData({ title: "", description: "", download_link: "" });
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
        <Card className="bg-[#2a2727] border-[#3a3737] p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-[#177245] mb-4">
            {editingMaterial ? "Editar Material" : "Novo Material"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: E-book Gratuito de Marketing"
              required
            />
            <div>
              <label className="block text-sm font-medium text-[#F1FFFA]/90 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do material..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-[#3a3737] bg-[#2a2727] text-[#F1FFFA] placeholder:text-[#F1FFFA]/50 focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 outline-none"
              />
            </div>
            <Input
              label="Link de Download"
              type="url"
              value={formData.download_link}
              onChange={(e) => setFormData({ ...formData, download_link: e.target.value })}
              placeholder="https://..."
              icon={<Download className="w-5 h-5" />}
            />
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {editingMaterial ? "Atualizar" : "Criar"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card className="bg-[#2a2727] border-[#3a3737] p-12 text-center">
          <Download className="w-16 h-16 text-[#F1FFFA]/30 mx-auto mb-4" />
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
              className={`bg-[#2a2727] border-[#3a3737] p-4 ${
                !material.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="text-[#F1FFFA]/50 hover:text-[#177245] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === materials.length - 1}
                    className="text-[#F1FFFA]/50 hover:text-[#177245] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <GripVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-bold text-[#177245]">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="text-[#F1FFFA]/70 text-sm mt-1">
                      {material.description}
                    </p>
                  )}
                  {material.download_link && (
                    <a
                      href={material.download_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#177245] text-sm mt-2 inline-flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-4 h-4" />
                      Ver link
                    </a>
                  )}
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

