import dbConnect from './db.js';
import ProductionStage from '../models/ProductionStage.js';

const defaultStages = [
  {
    name: 'cutting',
    displayName: 'Cutting',
    order: 1,
    description: 'Fabric cutting stage',
    color: '#ef4444',
    icon: '✂️',
    isActive: true
  },
  {
    name: 'sewing',
    displayName: 'Sewing',
    order: 2,
    description: 'Garment sewing and assembly',
    color: '#f59e0b',
    icon: '🧵',
    isActive: true
  },
  {
    name: 'washing',
    displayName: 'Washing',
    order: 3,
    description: 'Garment washing and treatment',
    color: '#3b82f6',
    icon: '💧',
    isActive: true
  },
  {
    name: 'finishing',
    displayName: 'Finishing',
    order: 4,
    description: 'Final finishing and quality check',
    color: '#8b5cf6',
    icon: '✨',
    isActive: true
  },
  {
    name: 'dispatch',
    displayName: 'Dispatch',
    order: 5,
    description: 'Packaging and dispatch',
    color: '#10b981',
    icon: '📦',
    isActive: true
  }
];

async function seedProductionStages() {
  try {
    await dbConnect();
    
    console.log('🏭 Seeding production stages...\n');

    for (const stage of defaultStages) {
      const existing = await ProductionStage.findOne({ name: stage.name });
      
      if (existing) {
        console.log(`✅ ${stage.displayName} already exists`);
      } else {
        await ProductionStage.create(stage);
        console.log(`✅ Created ${stage.displayName}`);
      }
    }

    console.log('\n🎉 Production stages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production stages:', error);
    process.exit(1);
  }
}

seedProductionStages();
