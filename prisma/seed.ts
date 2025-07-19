import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hssc.org' },
    update: {},
    create: {
      fullName: 'HSSC Administrator',
      email: 'admin@hssc.org',
      mobileNumber: '9876543210',
      hsscId: 'HSSC_ADMIN_001',
      password: adminPassword,
      role: 'ADMIN',
      instituteName: 'Hydrocarbon Sector Skill Council',
      instituteCategory: 'INDUSTRY',
      pincode: '110001',
      gender: 'PREFER_NOT_TO_SAY',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create sample teacher
  const teacherPassword = await bcrypt.hash('Teacher123!', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      fullName: 'Dr. Sarah Johnson',
      email: 'teacher@example.com',
      mobileNumber: '9876543211',
      hsscId: 'HSSC_TEACHER_001',
      password: teacherPassword,
      role: 'TEACHER',
      instituteName: 'Petroleum Engineering Institute',
      instituteCategory: 'COLLEGE',
      pincode: '400001',
      gender: 'FEMALE',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create sample students
  const student1Password = await bcrypt.hash('Student123!', 12)
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      fullName: 'Rahul Kumar',
      email: 'student1@example.com',
      mobileNumber: '9876543212',
      hsscId: 'HSSC_STUDENT_001',
      password: student1Password,
      role: 'STUDENT',
      instituteName: 'Delhi Technical University',
      instituteCategory: 'COLLEGE',
      pincode: '110042',
      gender: 'MALE',
      dateOfBirth: new Date('2000-05-15'),
      isActive: true,
      emailVerified: true,
    },
  })

  const student2Password = await bcrypt.hash('Student123!', 12)
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      fullName: 'Priya Sharma',
      email: 'student2@example.com',
      mobileNumber: '9876543213',
      hsscId: 'HSSC_STUDENT_002',
      password: student2Password,
      role: 'STUDENT',
      instituteName: 'Mumbai University',
      instituteCategory: 'COLLEGE',
      pincode: '400001',
      gender: 'FEMALE',
      dateOfBirth: new Date('2001-08-22'),
      isActive: true,
      emailVerified: true,
    },
  })

  const student3Password = await bcrypt.hash('Student123!', 12)
  const student3 = await prisma.user.upsert({
    where: { email: 'student3@example.com' },
    update: {},
    create: {
      fullName: 'Amit Patel',
      email: 'student3@example.com',
      mobileNumber: '9876543214',
      hsscId: 'HSSC_STUDENT_003',
      password: student3Password,
      role: 'STUDENT',
      instituteName: 'Chennai Institute of Technology',
      instituteCategory: 'COLLEGE',
      pincode: '600001',
      gender: 'MALE',
      dateOfBirth: new Date('1999-12-10'),
      isActive: true,
      emailVerified: true,
    },
  })

  // Create sample login logs
  const loginLogsData = [
    {
      userId: admin.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId: teacher.id,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      userId: student1.id,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      success: true,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      userId: student2.id,
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      userId: student3.id,
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      success: true,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    // Some failed login attempts
    {
      userId: admin.id,
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: false,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      userId: student1.id,
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: false,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  ]

  // Create login logs one by one for SQLite compatibility
  for (const logData of loginLogsData) {
    await prisma.loginLog.create({
      data: logData,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('📋 Sample users created:')
  console.log(`   Admin: admin@hssc.org / Admin123!`)
  console.log(`   Teacher: teacher@example.com / Teacher123!`)
  console.log(`   Student 1: student1@example.com / Student123!`)
  console.log(`   Student 2: student2@example.com / Student123!`)
  console.log(`   Student 3: student3@example.com / Student123!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
