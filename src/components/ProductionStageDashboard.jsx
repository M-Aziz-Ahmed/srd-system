'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scissors, CheckCircle, Clock, Package, 
  Droplet, Sparkles, Truck 
} from 'lucide-react';
import Link from 'next/link';

const stageIcons = {
  cutting: Scissors,
  sewing: Package,
  washing: Droplet,
  finishing: Sparkles,
  dispatch: Truck
};

export default function ProductionStageDashboard({ stageName }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [srds, setSRDs] = useState([]);
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Allow stage role, production-manager, and admin
    const allowedRoles = [stageName, 'admin', 'production-manager'];
    if (!allowedRoles.includes(session.user.role)) {
      router.push(`/dashboard/${session.user.role}`);
      return;
    }

    fetchData();
  }, [session, status, router, stageName]);

  const fetchData = async () => {
    try {
      // Fetch the stage
      const stagesRes = await fetch('/api/production-stages');
      const stagesData = await stagesRes.json();
      if (stagesData.success) {
        const currentStage = stagesData.data.find(s => s.name === stageName);
        setStage(currentStage);

        if (currentStage) {
          // Fetch SRDs in this stage
          const srdsRes = await fetch(`/api/srd?inProduction=true&currentProductionStage=${currentStage._id}`);
          const srdsData = await srdsRes.json();
          if (srdsData.success) {
            setSRDs(srdsData.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStage = async (srdId) => {
    try {
      const response = await fetch(`/api/srd/${srdId}/production/complete-stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stageName: stageName,
          completedBy: session.user.name
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message || 'Stage completed successfully');
        fetchData(); // Refresh data
      } else {
        console.error('Failed to complete stage:', result.error);
        alert(result.error || 'Failed to complete stage');
      }
    } catch (error) {
      console.error('Error completing stage:', error);
      alert('Error completing stage');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const StageIcon = stageIcons[stageName] || Package;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl p-8 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${stage?.color || '#3b82f6'} 0%, ${stage?.color || '#3b82f6'}dd 100%)` 
          }}
        >
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-white/20 backdrop-blur-sm shadow-xl"
            >
              <StageIcon className="h-8 w-8" />
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold capitalize">
                {stage?.displayName || stageName}
              </h1>
              <p className="text-white/90 mt-1 text-lg">{stage?.description || `${stageName} stage`}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 hover:shadow-lg transition-shadow" 
            style={{ borderLeftColor: stage?.color || '#3b82f6' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In {stage?.displayName || stageName}</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stage?.color || '#3b82f6'}20` }}>
                <StageIcon className="h-5 w-5" style={{ color: stage?.color || '#3b82f6' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: stage?.color || '#3b82f6' }}>
                {srds.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently in this stage</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {srds.length > 0 
                  ? Math.round(srds.reduce((sum, srd) => sum + (srd.productionProgress || 0), 0) / srds.length)
                  : 0}%
              </div>
              <Progress value={srds.length > 0 
                ? Math.round(srds.reduce((sum, srd) => sum + (srd.productionProgress || 0), 0) / srds.length)
                : 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">SRDs completed today</p>
            </CardContent>
          </Card>
        </div>

        {/* SRDs List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              SRDs in {stage?.displayName || stageName}
            </h2>
            {srds.length > 0 && (
              <Badge variant="outline" className="text-lg px-4 py-2">
                {srds.length} {srds.length === 1 ? 'Item' : 'Items'}
              </Badge>
            )}
          </div>
          
          {srds.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${stage?.color || '#3b82f6'}20` }}>
                  <StageIcon className="h-10 w-10" style={{ color: stage?.color || '#3b82f6' }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No SRDs in {stage?.displayName || stageName}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  SRDs will appear here when they enter the {stageName} stage. Check back soon or contact the production manager.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {srds.map((srd) => (
                <Card key={srd._id} className="hover:shadow-xl transition-all duration-300 border-l-4 hover:scale-105"
                  style={{ borderLeftColor: stage?.color || '#3b82f6' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 line-clamp-2">{srd.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">{srd.refNo}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Production Progress</p>
                        <span className="text-sm font-bold" style={{ color: stage?.color || '#3b82f6' }}>
                          {srd.productionProgress || 0}%
                        </span>
                      </div>
                      <Progress value={srd.productionProgress || 0} className="h-2" />
                    </div>

                    {srd.productionStartDate && (
                      <div className="flex items-center text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                        <Clock className="h-3.5 w-3.5 mr-2 text-blue-600" />
                        <span>Started: {new Date(srd.productionStartDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Link href={`/srd/${srd._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full hover:bg-gray-50">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleCompleteStage(srd._id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
