'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { AISystemWithOwner, AISystemListResponse } from '@/types/ai-system';
import { AISystemType, LifecycleStatus, RiskTier } from '@prisma/client';

export default function AISystemsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [systems, setSystems] = useState<AISystemWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSystems();
  }, [search, typeFilter, statusFilter, riskFilter, page]);

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
      });

      if (search) params.append('search', search);
      if (typeFilter !== 'all') params.append('systemType', typeFilter);
      if (statusFilter !== 'all') params.append('lifecycleStatus', statusFilter);
      if (riskFilter !== 'all') params.append('riskTier', riskFilter);

      const response = await fetch(`/api/ai-systems?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data: AISystemListResponse = await response.json();
      setSystems(data.systems);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (tier: RiskTier | null) => {
    if (!tier) return 'secondary';
    switch (tier) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: LifecycleStatus) => {
    switch (status) {
      case 'PRODUCTION': return 'default';
      case 'DEVELOPMENT': return 'secondary';
      case 'PILOT': return 'outline';
      case 'DEPRECATED': return 'destructive';
      case 'RETIRED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('aiSystems.title')}</h1>
          <p className="text-muted-foreground">{t('aiSystems.subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/ai-systems/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('aiSystems.addSystem')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('aiSystems.systemType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="GENAI">{t('aiSystems.types.genai')}</SelectItem>
              <SelectItem value="ML">{t('aiSystems.types.ml')}</SelectItem>
              <SelectItem value="RPA">{t('aiSystems.types.rpa')}</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
              <SelectItem value="OTHER">{t('aiSystems.types.other')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('aiSystems.lifecycleStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DEVELOPMENT">{t('aiSystems.lifecycle.development')}</SelectItem>
              <SelectItem value="PILOT">{t('aiSystems.lifecycle.pilot')}</SelectItem>
              <SelectItem value="PRODUCTION">{t('aiSystems.lifecycle.production')}</SelectItem>
              <SelectItem value="DEPRECATED">{t('aiSystems.lifecycle.deprecated')}</SelectItem>
              <SelectItem value="RETIRED">{t('aiSystems.lifecycle.retired')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('aiSystems.riskTier')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="HIGH">{t('risk.levels.high')}</SelectItem>
              <SelectItem value="MEDIUM">{t('risk.levels.medium')}</SelectItem>
              <SelectItem value="LOW">{t('risk.levels.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Systems Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-medium">{t('aiSystems.systemName')}</th>
                <th className="p-4 font-medium">{t('aiSystems.systemType')}</th>
                <th className="p-4 font-medium">{t('aiSystems.lifecycleStatus')}</th>
                <th className="p-4 font-medium">{t('aiSystems.riskTier')}</th>
                <th className="p-4 font-medium">{t('aiSystems.owner')}</th>
                <th className="p-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : systems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No AI systems found
                  </td>
                </tr>
              ) : (
                systems.map((system) => (
                  <tr
                    key={system.id}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/ai-systems/${system.id}`)}
                  >
                    <td className="p-4">
                      <div className="font-medium">{system.name}</div>
                      {system.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {system.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{system.systemType}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(system.lifecycleStatus)}>
                        {system.lifecycleStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {system.riskTier ? (
                        <Badge variant={getRiskBadgeVariant(system.riskTier)}>
                          {system.riskTier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">{system.owner.name || system.owner.email}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(system.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
