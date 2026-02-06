'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Building2, Mail, Phone, Calendar, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorDetails {
  id: string;
  name: string;
  tier: number;
  status: string;
  riskScore: number;
  services: string[];
  contactEmail?: string;
  contactPhone?: string;
  lastAssessmentDate?: string;
  childVendors?: Array<{
    id: string;
    name: string;
    riskScore: number;
  }>;
}

interface VendorDetailPanelProps {
  vendor: VendorDetails | null;
  onClose: () => void;
  className?: string;
}

export function VendorDetailPanel({ vendor, onClose, className }: VendorDetailPanelProps) {
  if (!vendor) {
    return null;
  }

  const getRiskColor = (score: number) => {
    if (score <= 5) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500';
    if (score <= 10) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500';
    if (score <= 15) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500';
    return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 5) return 'Low';
    if (score <= 10) return 'Medium';
    if (score <= 15) return 'High';
    return 'Critical';
  };

  return (
    <div
      className={cn(
        'h-full bg-background border-l shadow-xl overflow-y-auto',
        className
      )}
    >
      <Card className="border-0 rounded-none h-full">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{vendor.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Tier {vendor.tier}</Badge>
                  <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                    {vendor.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Risk Score Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Risk Assessment
            </h3>
            <div
              className={cn(
                'p-4 rounded-lg border-2 flex items-center justify-between',
                getRiskColor(vendor.riskScore)
              )}
            >
              <div>
                <p className="text-sm font-medium">Risk Level</p>
                <p className="text-2xl font-bold">{getRiskLabel(vendor.riskScore)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Score</p>
                <p className="text-3xl font-bold">{vendor.riskScore}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services Section */}
          {vendor.services && vendor.services.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Services Provided</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.services.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2">
              {vendor.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`mailto:${vendor.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {vendor.contactEmail}
                  </a>
                </div>
              )}
              {vendor.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{vendor.contactPhone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Last Assessment */}
          {vendor.lastAssessmentDate && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Last Assessment</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(vendor.lastAssessmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Child Vendors */}
          {vendor.childVendors && vendor.childVendors.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Downstream Vendors ({vendor.childVendors.length})
                </h3>
                <div className="space-y-2">
                  {vendor.childVendors.map((child) => (
                    <div
                      key={child.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{child.name}</span>
                        <Badge
                          variant={child.riskScore <= 10 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          Risk: {child.riskScore}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
