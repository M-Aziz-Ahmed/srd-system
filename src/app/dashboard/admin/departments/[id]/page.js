'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/use-toast';
import { PlusCircle, Trash, ArrowLeft } from 'lucide-react';

export default function DepartmentFieldsPage() {
  const [department, setDepartment] = useState(null);
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ name: '', type: 'text', placeholder: '' });
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchDepartmentAndFields();
    }
  }, [id]);

  const fetchDepartmentAndFields = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/departments/${id}`);
      const data = await res.json();
      if (data.success) {
        setDepartment(data.data.department);
        setFields(data.data.fields);
      } else {
        toast({ title: 'Error fetching department', variant: 'destructive' });
        router.push('/dashboard/admin/departments');
      }
    } catch (error) {
      toast({ title: 'Error fetching data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    if (!department) return;
    const fieldData = { ...newField, department: department.slug, slug: newField.name.toLowerCase().replace(/\s+/g, '-') };
    try {
      const res = await fetch('/api/newField', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });
      const data = await res.json();
      if (data._id) {
        toast({ title: 'Field created' });
        setNewField({ name: '', type: 'text', placeholder: '' });
        fetchDepartmentAndFields();
      } else {
        toast({ title: 'Error creating field', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error creating field', variant: 'destructive' });
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      const res = await fetch(`/api/newField?id=${fieldId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Field deleted' });
        fetchDepartmentAndFields();
      } else {
        toast({ title: 'Error deleting field', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error deleting field', variant: 'destructive' });
    }
  };

  if (isLoading || !department) {
    return <Layout><p>Loading...</p></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/admin/departments')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Departments
          </Button>
          <h1 className="text-3xl font-bold">Fields for {department.name}</h1>
          <p className="text-gray-500">{department.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.length > 0 ? fields.map(field => (
                    <div key={field._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{field.name}</h3>
                        <p className="text-sm text-gray-500">Type: {field.type} | Placeholder: {field.placeholder || 'None'}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteField(field._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )) : <p>No fields found for this department.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create New Field</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateField} className="space-y-4">
                  <div>
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input id="fieldName" value={newField.name} onChange={e => setNewField({...newField, name: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select value={newField.type} onValueChange={value => setNewField({...newField, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="boolean">Checkbox (Yes/No)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input id="placeholder" value={newField.placeholder} onChange={e => setNewField({...newField, placeholder: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Field
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
