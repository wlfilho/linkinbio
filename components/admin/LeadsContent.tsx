"use client";

import { useState, useMemo } from "react";
import { Search, Download, Trash2, Users, Calendar, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";
import type { Lead } from "@/lib/types/database";

interface LeadsContentProps {
  initialLeads: Lead[];
  userId: string;
}

export default function LeadsContent({ initialLeads, userId }: LeadsContentProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: leads.length,
      today: leads.filter(
        (lead) => new Date(lead.created_at) >= today
      ).length,
      week: leads.filter(
        (lead) => new Date(lead.created_at) >= weekAgo
      ).length,
      month: leads.filter(
        (lead) => new Date(lead.created_at) >= monthAgo
      ).length,
    };
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.full_name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.whatsapp.includes(query)
      );
    }

    // Apply period filter
    if (filterPeriod !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (filterPeriod === "today") {
        filtered = filtered.filter(
          (lead) => new Date(lead.created_at) >= today
        );
      } else if (filterPeriod === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (lead) => new Date(lead.created_at) >= weekAgo
        );
      } else if (filterPeriod === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (lead) => new Date(lead.created_at) >= monthAgo
        );
      }
    }

    return filtered;
  }, [leads, searchQuery, filterPeriod]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este lead?")) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) throw error;

      setLeads(leads.filter((lead) => lead.id !== id));
      toast.success("Lead deletado com sucesso!");
    } catch (error: any) {
      console.error("Delete lead error:", error);
      toast.error("Erro ao deletar lead");
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error("Nenhum lead para exportar");
      return;
    }

    // Create CSV content
    const headers = ["Nome", "Email", "WhatsApp", "Data"];
    const rows = filteredLeads.map((lead) => [
      lead.full_name,
      lead.email,
      lead.whatsapp,
      new Date(lead.created_at).toLocaleString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exportado com sucesso!");
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Leads</h1>
        <p className="text-base text-gray-700 dark:text-gray-300">
          Gerencie os leads capturados pela sua página
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total de Leads</p>
              <p className="text-3xl font-bold text-primary dark:text-blue-400">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-primary dark:text-blue-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hoje</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.today}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Esta Semana</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.week}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Este Mês</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.month}</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
            </select>

            <Button
              variant="secondary"
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              Exportar CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="mb-4">
          <p className="text-base font-medium text-text">
            Mostrando {filteredLeads.length} de {leads.length} leads
          </p>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum lead encontrado</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-4 px-6 font-bold text-base text-text">
                      Nome
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-base text-text">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-base text-text">
                      WhatsApp
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-base text-text">
                      Data
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-base text-text">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6 text-base font-medium text-text">{lead.full_name}</td>
                      <td className="py-4 px-6 text-base text-text">{lead.email}</td>
                      <td className="py-4 px-6 text-base text-text">{lead.whatsapp}</td>
                      <td className="py-4 px-6 text-base text-gray-700 dark:text-gray-300">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                          icon={<Trash2 className="w-4 h-4" />}
                        >
                          Deletar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-5 border-2 border-border rounded-lg bg-white dark:bg-gray-800">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Nome</p>
                      <p className="text-base font-semibold text-text">{lead.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Email</p>
                      <p className="text-base text-text break-all">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">WhatsApp</p>
                      <p className="text-base text-text">{lead.whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Data</p>
                      <p className="text-base text-gray-700 dark:text-gray-300">{formatDate(lead.created_at)}</p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(lead.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                      className="w-full mt-3"
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

