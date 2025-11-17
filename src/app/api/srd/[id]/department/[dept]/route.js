import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SRD from '@/models/SRD';
import pusher from '@/lib/pusher-server';

export async function PATCH(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id, dept } = params;
    const body = await request.json();

    const srd = await SRD.findById(id);

    if (!srd) {
      return NextResponse.json({ success: false, error: 'SRD not found' }, { status: 404 });
    }

    // Validate required comment when flagging
    if (body.status === 'flagged' && (!body.comment || !body.comment.text)) {
      return NextResponse.json({ success: false, error: 'Comment is required when flagging an SRD' }, { status: 400 });
    }

    // 🔹 FIX: Update status properly
    if (!srd.status) {
      srd.status = {};
    }
    
    // Create a new object to ensure Mongoose detects the change
    const updatedStatus = { ...srd.status };
    updatedStatus[dept] = body.status;
    srd.status = updatedStatus;
    srd.markModified('status');
    
    // --- MOVED PROGRESS CALCULATION LOGIC HERE ---
    const departmentStatuses = srd.status;
    const excludedDepts = ['admin', 'production-manager', 'vmd'];
    let relevantDeptCount = 0;
    let approvedDeptCount = 0;

    for (const deptKey in departmentStatuses) {
      if (!excludedDepts.includes(deptKey)) {
        relevantDeptCount++;
        if (departmentStatuses[deptKey] === 'approved') {
          approvedDeptCount++;
        }
      }
    }

    if (relevantDeptCount > 0) {
      srd.progress = Math.round((approvedDeptCount / relevantDeptCount) * 100);
      srd.readyForProduction = approvedDeptCount === relevantDeptCount;
    } else {
      srd.progress = 0;
      srd.readyForProduction = false;
    }
    // --- END OF MOVED LOGIC ---

    srd.updatedAt = new Date();

    // Update dynamic fields
    if (body.fields && Array.isArray(body.fields) && body.fields.length > 0) {
      // Update existing dynamicFields array
      body.fields.forEach(updatedField => {
        const existingFieldIndex = srd.dynamicFields.findIndex(
          f => f.name === updatedField.name && f.department === dept
        );
        
        if (existingFieldIndex > -1) {
          // Update existing field
          srd.dynamicFields[existingFieldIndex].value = updatedField.value;
        } else {
          // Add new field
          srd.dynamicFields.push({
            department: dept,
            name: updatedField.name,
            value: updatedField.value
          });
        }
      });
      srd.markModified('dynamicFields');
    }

    // Add comment if provided
    if (body.comment && body.comment.text) {
      srd.comments.push({
        department: dept,
        author: body.comment.author,
        role: body.comment.role,
        text: body.comment.text,
        date: new Date(),
      });
    }

    // Add audit record
    srd.audit.push({
      department: dept,
      author: body.comment?.author || 'System',
      action: body.status,
      comment: body.comment?.text,
      date: new Date(),
    });

    // Save and get fresh document
    const updatedSRD = await srd.save();
    
    // 🔹 FIX: Fetch the document again to ensure all fields are populated correctly
    const freshSRD = await SRD.findById(id).lean();

    // Trigger Pusher event
    const eventName = body.status === 'flagged' ? 'srd:flag' : 'srd:update';
    await pusher.trigger(`srd-${id}`, eventName, {
      department: dept,
      status: body.status,
      comment: body.comment,
    });

    return NextResponse.json({
      success: true,
      data: freshSRD, // Return the fresh document
      message: `${dept.toUpperCase()} department updated successfully`,
    });
  } catch (error) {
    console.error('Error updating SRD department:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}