import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { env } from '../config/env';
import { ROLES, type Role } from '../constants/roles';
import { Branch } from '../modules/branch/branch.model';
import { Center } from '../modules/center/center.model';
import { Area } from '../modules/area/area.model';
import { Somiti } from '../modules/somiti/somiti.model';
import { User } from '../modules/user/user.model';

const DEMO_PASSWORD = 'Password@123';

async function upsertUser(input: {
  name: string;
  email: string;
  phone: string;
  role: Role;
  somiti?: mongoose.Types.ObjectId;
  branch?: mongoose.Types.ObjectId;
}) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    existing.name = input.name;
    existing.role = input.role;
    existing.somiti = input.somiti;
    existing.branch = input.branch;
    existing.isApproved = true;
    existing.isActive = true;
    await existing.save();
    return existing;
  }

  return User.create({
    ...input,
    password: DEMO_PASSWORD,
    isApproved: true,
    isActive: true,
  });
}

async function seed() {
  await connectDb();

  let superAdmin = await User.findOne({ email: 'admin@somitysolution.com' });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: 'System Owner',
      email: 'admin@somitysolution.com',
      phone: '01700000000',
      password: 'Admin@123',
      role: ROLES.SUPER_ADMIN,
      isApproved: true,
      isActive: true,
    });
  }

  let somiti = await Somiti.findOne({ code: 'DEMO01' });
  if (!somiti) {
    somiti = await Somiti.create({
      name: 'Demo Somiti',
      code: 'DEMO01',
      address: 'Dhaka, Bangladesh',
      phone: '01711111111',
      email: 'demo@somitysolution.com',
      registrationNo: 'REG-DEMO-001',
      createdBy: superAdmin._id,
      settings: { currency: 'BDT', collectionFrequency: 'weekly' },
      subscription: {
        plan: 'standard',
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  let branch = await Branch.findOne({ somiti: somiti._id, code: 'HQ' });
  if (!branch) {
    branch = await Branch.create({
      name: 'Head Office',
      code: 'HQ',
      somiti: somiti._id,
      address: 'Dhaka, Bangladesh',
      phone: '01711111111',
    });
  }

  const staff = [
    { name: 'Chairman Rahman', email: 'chairman@demo-somiti.com', phone: '01710000001', role: ROLES.SOMITI_ADMIN },
    { name: 'Secretary Akter', email: 'secretary@demo-somiti.com', phone: '01710000002', role: ROLES.SECRETARY },
    { name: 'Cashier Hasan', email: 'cashier@demo-somiti.com', phone: '01710000003', role: ROLES.CASHIER },
    { name: 'Accountant Karim', email: 'accountant@demo-somiti.com', phone: '01710000004', role: ROLES.ACCOUNTANT },
    { name: 'Collector Nila', email: 'collector@demo-somiti.com', phone: '01710000005', role: ROLES.FIELD_OFFICER, branch: branch._id },
    { name: 'Branch Manager Alam', email: 'manager@demo-somiti.com', phone: '01710000006', role: ROLES.BRANCH_MANAGER, branch: branch._id },
    { name: 'Member Fatema', email: 'member@demo-somiti.com', phone: '01710000007', role: ROLES.MEMBER },
  ] as const;

  for (const person of staff) {
    await upsertUser({
      name: person.name,
      email: person.email,
      phone: person.phone,
      role: person.role,
      somiti: somiti._id,
      branch: 'branch' in person ? person.branch : undefined,
    });
  }

  const manager = await User.findOne({ email: 'manager@demo-somiti.com' });
  if (manager && !branch.manager) {
    branch.manager = manager._id;
    await branch.save();
  }

  let area = await Area.findOne({ somiti: somiti._id, name: 'Ward 12' });
  if (!area) {
    area = await Area.create({
      name: 'Ward 12',
      somiti: somiti._id,
      branch: branch._id,
    });
  }

  const collector = await User.findOne({ email: 'collector@demo-somiti.com' });
  const existingCenter = await Center.findOne({ branch: branch._id, name: 'Center A' });
  if (!existingCenter) {
    await Center.create({
      name: 'Center A',
      somiti: somiti._id,
      branch: branch._id,
      area: area._id,
      leaderName: 'Rina Begum',
      leaderMobile: '01720000001',
      meetingDay: 'SATURDAY',
      meetingTime: '10:00',
      fieldWorker: collector?._id,
      address: 'North lane, Ward 12',
    });
  }

  console.log('Seed complete');
  console.log('--- Demo logins ---');
  console.log('Super Admin     admin@somitysolution.com / Admin@123');
  console.log(`Somiti staff    <role>@demo-somiti.com / ${DEMO_PASSWORD}`);
  console.log('Member join code: DEMO01');
  console.log(`MongoDB: ${env.mongoUri}`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
