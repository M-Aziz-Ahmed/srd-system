import mongoose from 'mongoose';
import SRD from '../models/SRD.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixSRDStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all valid departments
    const allDepartments = await Department.find({});
    const excludedRoles = ['admin', 'production-manager'];
    const validDepartments = allDepartments.filter(d => !excludedRoles.includes(d.slug));
    
    console.log(`\nValid departments: ${validDepartments.map(d => d.slug).join(', ')}`);

    // Find all SRDs
    const srds = await SRD.find({});
    console.log(`Found ${srds.length} SRDs to check\n`);

    let fixed = 0;

    for (const srd of srds) {
      let needsUpdate = false;

      // Initialize status if it doesn't exist
      if (!srd.status) {
        srd.status = {};
      }

      // Check if status has admin or production-manager
      for (const role of excludedRoles) {
        if (role in srd.status) {
          delete srd.status[role];
          needsUpdate = true;
          console.log(`  Removed ${role} from SRD ${srd.refNo}`);
        }
      }

      // Add missing departments
      for (const dept of validDepartments) {
        if (!(dept.slug in srd.status)) {
          srd.status[dept.slug] = 'pending';
          needsUpdate = true;
          console.log(`  Added ${dept.slug} to SRD ${srd.refNo} as pending`);
        }
      }
      
      // Mark status as modified for Mongoose
      if (needsUpdate) {
        srd.markModified('status');
      }

      // Save if updated (this will trigger pre-save hook to recalculate)
      if (needsUpdate) {
        await srd.save();
        fixed++;
        console.log(`  ✅ Fixed SRD ${srd.refNo} - readyForProduction: ${srd.readyForProduction}, progress: ${srd.progress}%\n`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} SRDs`);
    console.log(`✅ ${srds.length - fixed} SRDs were already correct`);

    // Show ready for production count
    const readyCount = await SRD.countDocuments({ readyForProduction: true, inProduction: false });
    console.log(`\n📊 SRDs ready for production: ${readyCount}`);

  } catch (error) {
    console.error('Error fixing SRD status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixSRDStatus();
