import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SRD from '@/models/SRD';

export async function POST(request) {
  await dbConnect();

  try {
    // Find all SRDs
    const srds = await SRD.find({});
    
    let fixed = 0;
    const excludedRoles = ['admin', 'production-manager'];
    const results = [];

    for (const srd of srds) {
      let needsUpdate = false;
      const removed = [];

      // Check if status has admin or production-manager
      if (srd.status) {
        for (const role of excludedRoles) {
          if (srd.status.has(role)) {
            srd.status.delete(role);
            needsUpdate = true;
            removed.push(role);
          }
        }
      }

      // Save if updated (this will trigger pre-save hook to recalculate)
      if (needsUpdate) {
        await srd.save();
        fixed++;
        results.push({
          refNo: srd.refNo,
          removed: removed,
          readyForProduction: srd.readyForProduction,
          progress: srd.progress
        });
      }
    }

    // Count ready for production
    const readyCount = await SRD.countDocuments({ 
      readyForProduction: true, 
      inProduction: false 
    });

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} SRDs`,
      data: {
        totalChecked: srds.length,
        fixed: fixed,
        alreadyCorrect: srds.length - fixed,
        readyForProduction: readyCount,
        details: results
      }
    });
  } catch (error) {
    console.error('Error fixing SRD status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
