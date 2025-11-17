'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DepartmentPanel({
  srd,
  department,
  onUpdate,
  isLoading,
  canEdit
}) {
  const [status, setStatus] = useState(srd.status?.[department] || 'pending');
  const [fields, setFields] = useState(srd.dynamicFields?.filter(f => f.department === department) || []);
  const [fieldDefs, setFieldDefs] = useState([]); 

  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagComment, setFlagComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch(`/api/newField?department=${department}`);
        const data = await res.json();
        const activeFields = Array.isArray(data) ? data.filter(f => f.active) : [];
        setFieldDefs(activeFields);
        
        // Initialize fields if they don't exist
        const existingFieldNames = fields.map(f => f.name);
        const newFields = [...fields];
        
        activeFields.forEach(fieldDef => {
          if (!existingFieldNames.includes(fieldDef.name)) {
            newFields.push({
              name: fieldDef.name,
              value: fieldDef.type === 'boolean' ? false : '',
              department: department
            });
          }
        });
        
        if (newFields.length > fields.length) {
          setFields(newFields);
        }
      } catch (err) {
        console.error('Failed to fetch fields', err);
      }
    }
    fetchFields();
  }, [department]);

  // Update status when SRD changes
  useEffect(() => {
    setStatus(srd.status?.[department] || 'pending');
  }, [srd, department]);

  const handleFieldChange = (name, value) => {
    setFields(prev => {
      const existingFieldIndex = prev.findIndex(f => f.name === name);
      if (existingFieldIndex > -1) {
        const newFields = [...prev];
        newFields[existingFieldIndex] = { ...newFields[existingFieldIndex], value };
        return newFields;
      } else {
        return [...prev, { name, value, department }];
      }
    });
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'flagged') {
      setShowFlagDialog(true);
    } else {
      setStatus(newStatus);
      handleUpdate(newStatus);
    }
  };

  const handleFlagSubmit = () => {
    if (!flagComment.trim()) return;

    setStatus('flagged');
    handleUpdate('flagged', flagComment);
    setShowFlagDialog(false);
    setFlagComment('');
  };

  // 🔹 FIXED: Now sends proper object structure
  const handleUpdate = async (newStatus, comment = null) => {
    setIsSubmitting(true);

    const updateData = {
      status: newStatus,  // Send status as string
      fields: fields,     // Send fields array
    };

    if (comment) {
      updateData.comment = {
        author: srd.createdBy?.name || 'Unknown',
        role: srd.createdBy?.role || 'user',
        text: comment,
      };
    }

    console.log('[Frontend] Sending update data:', department, updateData);

    try {
      await onUpdate(updateData);  // 🔹 FIXED: Only pass updateData, not department
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDynamicFields = () => {
    if (!fieldDefs.length)
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No fields defined for this department.
          </AlertDescription>
        </Alert>
      );

    return (
      <div className="space-y-6">
        {fieldDefs.map((field) => {
          const { _id, name, type, placeholder, isRequired } = field;
          const fieldValue = fields.find(f => f.name === name)?.value ?? '';

          switch (type) {
            case 'text':
            case 'number':
            case 'date':
              return (
                <div key={_id}>
                  <Label htmlFor={name}>{name}</Label>
                  <Input
                    id={name}
                    type={type}
                    placeholder={placeholder || ''}
                    value={fieldValue}
                    onChange={(e) => handleFieldChange(name, e.target.value)}
                    required={isRequired}
                    disabled={!canEdit}
                  />
                </div>
              );

            case 'textarea':
              return (
                <div key={_id}>
                  <Label htmlFor={name}>{name}</Label>
                  <Textarea
                    id={name}
                    placeholder={placeholder || ''}
                    value={fieldValue}
                    onChange={(e) => handleFieldChange(name, e.target.value)}
                    required={isRequired}
                    disabled={!canEdit}
                  />
                </div>
              );

            case 'boolean':
              return (
                <div key={_id} className="flex items-center justify-between">
                  <Label htmlFor={name}>{name}</Label>
                  <Switch
                    id={name}
                    checked={!!fieldValue}
                    onCheckedChange={(checked) =>
                      handleFieldChange(name, checked)
                    }
                    disabled={!canEdit}
                  />
                </div>
              );

            case 'image':
              const deptImages = Array.isArray(fieldValue)
                ? fieldValue
                : fieldValue
                  ? [fieldValue]
                  : [];
              
              const globalImages = Array.isArray(srd.images) ? srd.images : [];
              const allImages = Array.from(new Set([...globalImages, ...deptImages]));

              return (
                <div key={_id}>
                  <Label>{name}</Label>
                  {allImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {allImages.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group cursor-pointer"
                          onClick={() => {
                            setImageModalIndex(idx);
                            setModalImages(allImages);
                            setIsImageModalOpen(true);
                          }}
                        >
                          <Image
                            src={src}
                            alt={`${name}-${idx}`}
                            width={120}
                            height={120}
                            className="object-cover rounded-lg border border-gray-200 w-full h-24"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                            View
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-1">
                      No images uploaded.
                    </p>
                  )}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {department.toUpperCase()} Department
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Status:</span>
          <Badge
            className={cn(
              status === 'approved' && 'bg-green-100 text-green-800',
              status === 'in-progress' && 'bg-blue-100 text-blue-800',
              status === 'flagged' && 'bg-red-100 text-red-800',
              status === 'pending' && 'bg-gray-100 text-gray-800'
            )}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {renderDynamicFields()}

        {canEdit && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Update Status
            </h4>
            <div className="flex items-center space-x-3">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flag Issue</option>
              </select>

              <Button
                onClick={() => handleUpdate(status)}
                disabled={isSubmitting}
                className="px-4 py-2"
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag SRD Issue</DialogTitle>
          </DialogHeader>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please provide a detailed explanation of the issue. This comment
              will be visible to all departments.
            </AlertDescription>
          </Alert>

          <Textarea
            value={flagComment}
            onChange={(e) => setFlagComment(e.target.value)}
            placeholder="Describe the issue..."
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFlagDialog(false);
                setFlagComment('');
                setStatus(srd.status[department]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFlagSubmit}
              disabled={!flagComment.trim() || isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Flagging...' : 'Flag Issue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}