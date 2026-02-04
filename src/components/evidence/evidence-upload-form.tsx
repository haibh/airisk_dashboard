'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface EvidenceUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'video/mp4',
];

export function EvidenceUploadForm({ onSuccess, onCancel }: EvidenceUploadFormProps) {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [entityType, setEntityType] = useState<string>('');
  const [entityId, setEntityId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(t('errors.fileTooLarge'));
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error(t('errors.noFile'));
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) formData.append('description', description);
      if (entityType) formData.append('entityType', entityType);
      if (entityId) formData.append('entityId', entityId);
      if (validUntil) formData.append('validUntil', validUntil);

      setUploadProgress(30);

      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      toast.success(t('uploadSuccess'));

      // Reset form
      setFile(null);
      setDescription('');
      setEntityType('');
      setEntityId('');
      setValidUntil('');
      setUploadProgress(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : t('errors.uploadFailed'));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label>{t('form.file')} *</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('form.dragDrop')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('form.allowedTypes')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('form.maxSize')}: 50MB
              </p>
              <Input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.mp4"
                disabled={uploading}
              />
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('form.uploading')}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('form.descriptionPlaceholder')}
          rows={3}
          disabled={uploading}
        />
      </div>

      {/* Entity Linking (Optional) */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="entityType">{t('form.linkTo')} ({tCommon('optional')})</Label>
          <Select
            value={entityType}
            onValueChange={setEntityType}
            disabled={uploading}
          >
            <SelectTrigger id="entityType">
              <SelectValue placeholder={t('form.selectEntityType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AI_SYSTEM">{t('entityTypes.aiSystem')}</SelectItem>
              <SelectItem value="ASSESSMENT">{t('entityTypes.assessment')}</SelectItem>
              <SelectItem value="RISK">{t('entityTypes.risk')}</SelectItem>
              <SelectItem value="CONTROL">{t('entityTypes.control')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {entityType && (
          <div className="space-y-2">
            <Label htmlFor="entityId">{t('form.entityId')}</Label>
            <Input
              id="entityId"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder={t('form.entityIdPlaceholder')}
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Valid Until (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="validUntil">
          {t('form.validUntil')} ({tCommon('optional')})
        </Label>
        <Input
          type="date"
          id="validUntil"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          disabled={uploading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={uploading}
          >
            {tCommon('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? t('form.uploading') : t('upload')}
        </Button>
      </div>
    </form>
  );
}
