"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Trash2, RefreshCw, AlertCircle } from "lucide-react";

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [orphans, setOrphans] = useState<any>(null);

  const checkOrphans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/cleanup");
      const data = await response.json();
      setOrphans(data);
    } catch (error) {
      console.error("Error checking orphans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupOrphans = async () => {
    if (!confirm("Tem certeza que deseja deletar todos os usuários órfãos?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/cleanup", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
      setOrphans(null);
      
      // Recheck after cleanup
      setTimeout(() => {
        checkOrphans();
      }, 1000);
    } catch (error) {
      console.error("Error cleaning up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">
            🧹 Limpeza de Usuários Órfãos
          </h1>
          <p className="text-gray-600">
            Remove usuários criados sem perfil correspondente
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={checkOrphans}
                isLoading={isLoading}
                icon={<RefreshCw className="w-5 h-5" />}
                variant="secondary"
                className="flex-1"
              >
                Verificar Órfãos
              </Button>

              <Button
                onClick={cleanupOrphans}
                isLoading={isLoading}
                icon={<Trash2 className="w-5 h-5" />}
                variant="danger"
                className="flex-1"
              >
                Limpar Órfãos
              </Button>
            </div>

            {orphans && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Status Atual
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Total de Usuários:</strong> {orphans.totalUsers}
                  </p>
                  <p>
                    <strong>Total de Perfis:</strong> {orphans.totalProfiles}
                  </p>
                  <p>
                    <strong>Usuários Órfãos:</strong>{" "}
                    <span
                      className={
                        orphans.orphanUsers.length > 0
                          ? "text-red-600 font-bold"
                          : "text-green-600 font-bold"
                      }
                    >
                      {orphans.orphanUsers.length}
                    </span>
                  </p>
                </div>

                {orphans.orphanUsers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Usuários Órfãos:</h4>
                    <div className="space-y-2">
                      {orphans.orphanUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className="p-2 bg-white rounded border border-gray-200 text-xs"
                        >
                          <p>
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p className="text-gray-500">
                            <strong>ID:</strong> {user.id}
                          </p>
                          <p className="text-gray-500">
                            <strong>Criado em:</strong>{" "}
                            {new Date(user.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-2 text-green-800">
                  ✅ Limpeza Concluída
                </h3>
                <p className="text-sm">{result.message}</p>
                {result.deletedUsers && result.deletedUsers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">
                      Usuários Deletados:
                    </h4>
                    <div className="space-y-1">
                      {result.deletedUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className="p-2 bg-white rounded border border-gray-200 text-xs"
                        >
                          <p>{user.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                Instruções
              </h3>
              <ol className="text-xs space-y-1 list-decimal list-inside text-gray-700">
                <li>Clique em "Verificar Órfãos" para ver usuários sem perfil</li>
                <li>Se houver órfãos, clique em "Limpar Órfãos" para deletá-los</li>
                <li>Após a limpeza, tente criar sua conta novamente</li>
                <li>
                  Acesse:{" "}
                  <a
                    href="/auth/register"
                    className="text-primary hover:underline font-medium"
                  >
                    /auth/register
                  </a>
                </li>
              </ol>
            </div>

            <div className="mt-4 text-center">
              <a
                href="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                ← Voltar para Registro
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

