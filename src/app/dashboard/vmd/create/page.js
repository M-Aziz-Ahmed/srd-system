'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/use-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import UploadImage from '@/components/UploadImage';

export default function CreateSRDPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    refNo: '',
    images: []
  });

  const [dynamicDefs, setDynamicDefs] = useState([]);
  const [dynamicValues, setDynamicValues] = useState({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'vmd') {
      router.push('/login');
      return;
    }
    
    (async function fetchDynamic() {
      try {
        // 🔹 FIX 1: Fetch ALL fields, not just 'vmd'
        const res = await fetch('/api/newField'); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // 🔹 Filter for active fields for 'vmd' OR 'global'
          const activeFields = data.filter(
            (f) => f.active && (f.department === 'vmd' || f.department === 'global')
          );
          setDynamicDefs(activeFields);

          // 🔹 FIX 2: Use field 'name' as the key, not '_id'
          const initial = {};
          activeFields.forEach(d => { 
            initial[d.name] = d.defaultValue || ''; 
          });
          setDynamicValues(initial);
        }
      } catch (err) {
        console.error('Failed to load dynamic fields', err);
      }
    })();
  }, [session, status, router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔹 FIX 2 (Handler): Use 'name' as the key
  const handleDynamicChange = (name, value) => {
    setDynamicValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 FIX 2 (Validation): Validate using 'def.name'
      for (const def of dynamicDefs) {
        if (def.isRequired) {
          const val = dynamicValues[def.name]; // Use name
          if (val === undefined || val === null || String(val).trim() === '') {
            toast({ title: 'Validation', description: `Please fill required field: ${def.name}`, variant: 'destructive' });
            setLoading(false);
            return;
          }
        }
      }
      
      const response = await fetch('/api/srd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          refNo: formData.refNo,
          createdBy: {
            id: session.user.email,
            name: session.user.name,
            role: session.user.role
          },
          status: {
            vmd: 'pending',
            cad: 'pending',
            commercial: 'pending',
            mmc: 'pending'
          },
          
          // 🔹 FIX 3: Pass the 'dynamicValues' object to 'vmdFields'
          vmdFields: dynamicValues, 

          images: formData.images || [],
          
          // This archival array also needs to use 'd.name' to get the value
          dynamicFields: dynamicDefs.map(d => ({
            field: d._id,
            department: d.department || 'vmd',
            name: d.name,
            slug: d.slug || d.name.replace(/\s+/g, '_').toLowerCase(),
            type: d.type,
            // 🔹 FIX 2 (Payload): Get value from state using 'd.name'
            value: dynamicValues[d.name] ?? null, 
            isRequired: !!d.isRequired
          }))
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'SRD created successfully',
        });
        router.push(`/srd/${data.data.id}`);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create SRD',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create SRD',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/dashboard/vmd">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New SRD</h1>
            <p className="text-gray-600">Fill in the details to create a new sample request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">SRD Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter SRD title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the sample request"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* VMD Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">VMD Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dynamicDefs.length === 0 ? (
                <div className="text-gray-600">No dynamic fields defined for VMD. Add fields from Admin → Manage SRD Fields.</div>
              ) : (
                <div className="space-y-4">
                  {dynamicDefs.map((def) => {
                    // 🔹 FIX 2 (Renderer): Get value using 'def.name'
                    const val = dynamicValues[def.name] ?? ''; 
                    return (
                      <div key={def._id}>
                        <Label>{def.name}{def.isRequired ? ' *' : ''}</Label>
                        {/* 🔹 Pass 'def.name' to the change handler */}
                        {def.type === 'textarea' ? (
                          <Textarea value={val} onChange={(e) => handleDynamicChange(def.name, e.target.value)} />
                        ) : def.type === 'number' ? (
                          <Input type="number" value={val} onChange={(e) => handleDynamicChange(def.name, e.target.value)} />
                        ) : def.type === 'image' ? (
                          <div>
                            <div className="mt-2">
                              <UploadImage onUploaded={(urls) => setFormData(prev => ({ ...prev, images: Array.isArray(urls) ? urls : (urls ? [urls] : []) }))} />
                            </div>
                          </div>
                        ): def.type === 'date' ? (
                          <Input type="date" value={val} onChange={(e) => handleDynamicChange(def.name, e.target.value)} />
                        ) : def.type === 'boolean' ? (
                          <label className="inline-flex items-center space-x-2">
                            <input type="checkbox" checked={!!val} onChange={(e) => handleDynamicChange(def.name, e.target.checked)} />
                            <span className="text-sm text-gray-700">{def.placeholder || ''}</span>
                          </label>
                        ) : (
                          <Input value={val} onChange={(e) => handleDynamicChange(def.name, e.target.value)} placeholder={def.placeholder || ''} />
                        ) }
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Image upload */}
              
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/dashboard/vmd">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create SRD
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}