import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SRD from '@/models/SRD';
import Department from '@/models/Department';
import Stage from '@/models/Stage';
import Field from '@/models/Field';

export async function GET(request, { params }) {
  await dbConnect();
  const { department } = await params;

  try {
    // Fetch department info
    const deptData = await Department.findOne({ slug: department });
    
    // Fetch SRDs for this department
    const srds = await SRD.find({}).lean();
    
    // Filter SRDs relevant to this department
    const departmentSRDs = department === 'admin' 
      ? srds 
      : srds.filter(srd => srd.status && srd.status[department]);

    // Fetch active stages
    const stages = await Stage.find({ isActive: true }).sort({ order: 1 });

    // Fetch fields for this department
    const fields = await Field.find({ 
      active: true,
      $or: [
        { department: department },
        { department: 'global' }
      ]
    });

    // Calculate statistics
    const stats = {
      total: departmentSRDs.length,
      byStage: {}
    };

    // Count by stage
    stages.forEach(stage => {
      stats.byStage[stage.slug] = departmentSRDs.filter(srd => 
        srd.status && srd.status[department] === stage.slug
      ).length;
    });

    // Additional stats for admin
    if (department === 'admin') {
      stats.completed = srds.filter(srd => srd.progress === 100).length;
      stats.flagged = srds.filter(srd => {
        if (!srd.status) return false;
        return Object.values(srd.status).includes('flagged');
      }).length;
      stats.inProgress = srds.filter(srd => srd.progress > 0 && srd.progress < 100).length;
    }

    return NextResponse.json({
      success: true,
      data: {
        department: deptData,
        stats,
        stages,
        fields,
        recentSRDs: departmentSRDs.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
