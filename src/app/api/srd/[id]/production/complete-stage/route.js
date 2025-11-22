import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SRD from '@/models/SRD';
import ProductionStage from '@/models/ProductionStage';

export async function POST(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { stageName, completedBy, notes } = body;

    const srd = await SRD.findById(id);
    if (!srd) {
      return NextResponse.json({ success: false, error: 'SRD not found' }, { status: 404 });
    }

    if (!srd.inProduction) {
      return NextResponse.json({ success: false, error: 'SRD is not in production' }, { status: 400 });
    }

    // Get current stage
    const currentStage = await ProductionStage.findById(srd.currentProductionStage);
    if (!currentStage || currentStage.name !== stageName) {
      return NextResponse.json({ 
        success: false, 
        error: 'SRD is not in this stage' 
      }, { status: 400 });
    }

    // Add to production history
    srd.productionHistory.push({
      stage: currentStage._id,
      stageName: currentStage.name,
      startDate: srd.productionStartDate || new Date(),
      endDate: new Date(),
      completedBy: completedBy || 'Unknown',
      notes: notes || '',
      status: 'completed'
    });

    // Get next stage
    const nextStage = await ProductionStage.findOne({ 
      order: currentStage.order + 1,
      isActive: true 
    });

    if (nextStage) {
      // Move to next stage
      srd.currentProductionStage = nextStage._id;
      srd.productionProgress = Math.round(((currentStage.order) / 5) * 100); // Assuming 5 stages
    } else {
      // All stages complete
      srd.inProduction = false;
      srd.productionEndDate = new Date();
      srd.productionProgress = 100;
      srd.currentProductionStage = null;
    }

    srd.updatedAt = new Date();
    await srd.save();

    return NextResponse.json({
      success: true,
      data: srd,
      message: nextStage 
        ? `Moved to ${nextStage.displayName}` 
        : 'Production completed'
    });
  } catch (error) {
    console.error('Error completing stage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
