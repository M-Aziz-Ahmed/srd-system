import dbConnect from './db.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const productionUsers = [
  {
    email: 'cutting@srds.com',
    name: 'Cutting Manager',
    password: 'cutting123',
    role: 'cutting',
    department: 'cutting',
    isActive: true
  },
  {
    email: 'sewing@srds.com',
    name: 'Sewing Manager',
    password: 'sewing123',
    role: 'sewing',
    department: 'sewing',
    isActive: true
  },
  {
    email: 'washing@srds.com',
    name: 'Washing Manager',
    password: 'washing123',
    role: 'washing',
    department: 'washing',
    isActive: true
  },
  {
    email: 'finishing@srds.com',
    name: 'Finishing Manager',
    password: 'finishing123',
    role: 'finishing',
    department: 'finishing',
    isActive: true
  },
  {
    email: 'dispatch@srds.com',
    name: 'Dispatch Manager',
    password: 'dispatch123',
    role: 'dispatch',
    department: 'dispatch',
    isActive: true
  }
];

async function seedProductionUsers() {
  try {
    await dbConnect();
    
    console.log('👥 Seeding production users...\n');

    for (const userData of productionUsers) {
      const existing = await User.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`✅ ${userData.name} already exists`);
      } else {
        await User.create(userData);
        console.log(`✅ Created ${userData.name} (${userData.email})`);
      }
    }

    console.log('\n🎉 Production users seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(50));
    productionUsers.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });
    console.log('─'.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production users:', error);
    process.exit(1);
  }
}

seedProductionUsers();
