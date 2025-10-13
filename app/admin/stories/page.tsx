"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Story } from "@/lib/types/database";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StoriesForm from "@/components/admin/StoriesForm";
import { deleteFileByUrl } from "@/lib/utils/storage";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("order", { ascending: true });

      if (error) throw error;

      setStories(data || []);
    } catch (error: any) {
      console.error("Error fetching stories:", error);
      toast.error("Erro ao carregar stories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStory(null);
    fetchStories();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStory(null);
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este story?")) {
      return;
    }

    try {
      const supabase = createClient();

      // Get story data to delete associated files
      const story = stories.find((s) => s.id === id);

      // Delete the story from database
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Delete associated files from storage
      if (story) {
        if (story.image_url) {
          await deleteFileByUrl(story.image_url, "stories");
        }
        if (story.video_url) {
          await deleteFileByUrl(story.video_url, "stories");
        }
      }

      toast.success("Story excluído com sucesso!");
      fetchStories();
    } catch (error: any) {
      console.error("Error deleting story:", error);
      toast.error("Erro ao excluir story");
    }
  };

  const toggleActive = async (story: Story) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("stories")
        .update({ is_active: !story.is_active })
        .eq("id", story.id);

      if (error) throw error;

      toast.success(story.is_active ? "Story desativado" : "Story ativado");
      fetchStories();
    } catch (error: any) {
      console.error("Error toggling story:", error);
      toast.error("Erro ao atualizar story");
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newStories = [...stories];
    const temp = newStories[index].order;
    newStories[index].order = newStories[index - 1].order;
    newStories[index - 1].order = temp;

    await updateOrder(newStories[index], newStories[index - 1]);
  };

  const moveDown = async (index: number) => {
    if (index === stories.length - 1) return;

    const newStories = [...stories];
    const temp = newStories[index].order;
    newStories[index].order = newStories[index + 1].order;
    newStories[index + 1].order = temp;

    await updateOrder(newStories[index], newStories[index + 1]);
  };

  const updateOrder = async (story1: Story, story2: Story) => {
    try {
      const supabase = createClient();
      
      await supabase
        .from("stories")
        .update({ order: story1.order })
        .eq("id", story1.id);

      await supabase
        .from("stories")
        .update({ order: story2.order })
        .eq("id", story2.id);

      fetchStories();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast.error("Erro ao reordenar stories");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#F1FFFA]/70">Carregando...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold text-[#177245]">
            {editingStory ? "Editar Story" : "Novo Story"}
          </h1>
        </div>
        <StoriesForm
          story={editingStory}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#177245]">Stories</h1>
          <p className="text-[#F1FFFA]/70 mt-1">
            Gerencie seus stories (estilo Instagram)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Story
        </Button>
      </div>

      {stories.length === 0 ? (
        <Card className="bg-[#2a2727] border-[#3a3737] p-12 text-center">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-xl font-heading font-bold text-[#177245] mb-2">
            Nenhum Story Criado
          </h2>
          <p className="text-[#F1FFFA]/50 mb-6">
            Crie seu primeiro story para engajar seus visitantes
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Criar Primeiro Story
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map((story, index) => {
            const expired = isExpired(story.expires_at);
            return (
              <Card
                key={story.id}
                className={`bg-[#2a2727] border-[#3a3737] p-6 ${
                  !story.is_active || expired ? "opacity-60" : ""
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
                      disabled={index === stories.length - 1}
                      className="text-[#F1FFFA]/50 hover:text-[#177245] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover para baixo"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#3a3737]">
                      {story.image_url ? (
                        <img
                          src={story.image_url}
                          alt={story.title || "Story"}
                          className="w-full h-full object-cover"
                        />
                      ) : story.video_url ? (
                        <video
                          src={story.video_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#177245]/20 flex items-center justify-center">
                          <span className="text-2xl">📸</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-heading font-bold text-[#177245] mb-1">
                          {story.title || "Sem título"}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs text-[#F1FFFA]/50">
                          <span>Duração: {story.duration}s</span>
                          <span>•</span>
                          <span>Expira: {formatDate(story.expires_at)}</span>
                          {expired && (
                            <>
                              <span>•</span>
                              <span className="text-red-500">EXPIRADO</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          story.is_active && !expired
                            ? "bg-[#177245]/20 text-[#177245]"
                            : "bg-[#F1FFFA]/10 text-[#F1FFFA]/50"
                        }`}
                      >
                        {expired ? "Expirado" : story.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-[#F1FFFA]/70 mb-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{story.views_count} visualizações</span>
                      </div>
                      {story.link_url && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{story.clicks_count} cliques</span>
                        </div>
                      )}
                    </div>

                    {/* Link */}
                    {story.link_url && (
                      <div className="text-xs text-[#F1FFFA]/50">
                        Link: <a href={story.link_url} target="_blank" rel="noopener noreferrer" className="text-[#177245] hover:underline">{story.link_url}</a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleActive(story)}
                      className="p-2 rounded-lg hover:bg-[#3a3737] transition-colors"
                      title={story.is_active ? "Desativar" : "Ativar"}
                    >
                      {story.is_active ? (
                        <Eye className="w-5 h-5 text-[#177245]" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-[#F1FFFA]/50" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="p-2 rounded-lg hover:bg-[#3a3737] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5 text-[#F1FFFA]/70" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

