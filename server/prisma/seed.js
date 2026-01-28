const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. สร้างประเภทรางวัล (AwardType)
  const awardTypes = [
    { name: 'ด้านกิจกรรมเสริมหลักสูตร' },
    { name: 'ด้านความคิดสร้างสรรค์และนวัตกรรม' },
    { name: 'ด้านความประพฤติดี' },
  ];

  for (const type of awardTypes) {
    const exist = await prisma.awardType.findFirst({ where: { awardName: type.name } });
    if (!exist) {
      await prisma.awardType.create({ data: { awardName: type.name } });
      console.log(`- Created AwardType: ${type.name}`);
    }
  }

  // 2. สร้างวิทยาเขต (Campus)
  // [หมายเหตุ] ใน Schema เดิม CampusName เป็น String ธรรมดา ไม่ใช่ Enum แล้วนะครับ
  const campusesData = [
    { name: 'บางเขน', faculties: ['คณะวิศวกรรมศาสตร์', 'คณะวิทยาศาสตร์', 'คณะบริหารธุรกิจ'] },
    { name: 'กำแพงแสน', faculties: ['คณะเกษตร กำแพงแสน', 'คณะวิศวกรรมศาสตร์ กำแพงแสน'] },
    { name: 'ศรีราชา', faculties: ['คณะวิศวกรรมศาสตร์ ศรีราชา', 'คณะวิทยาการจัดการ'] },
    { name: 'เฉลิมพระเกียรติ จังหวัดสกลนคร', faculties: ['คณะทรัพยากรธรรมชาติและอุตสาหกรรมเกษตร'] },
  ];

  for (const c of campusesData) {
    // เช็คก่อนว่ามี Campus นี้ยัง
    let campus = await prisma.campus.findFirst({ where: { campusName: c.name } });
    
    if (!campus) {
      campus = await prisma.campus.create({
        data: { campusName: c.name }
      });
      console.log(`- Created Campus: ${c.name}`);
    }

    // 3. สร้างคณะ (Faculty) ผูกกับ Campus นี้
    for (const facName of c.faculties) {
      let faculty = await prisma.faculty.findFirst({ where: { facultyName: facName } });
      
      if (!faculty) {
        // สร้าง Faculty แบบใหม่ (ไม่มี field department แล้ว)
        faculty = await prisma.faculty.create({
          data: {
            facultyName: facName,
            campusId: campus.id
          }
        });
        console.log(`  └- Created Faculty: ${facName}`);

        // แถม: สร้าง Department default ให้ด้วย 1 อัน (เพราะในอนาคตต้องใช้ departmentId)
        await prisma.department.create({
          data: {
            name: "ภาควิชาทั่วไป",
            facultyId: faculty.id
          }
        });
      }
    }
  }

  const adminEmail = "surapat.pak@ku.th"; 
  
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: adminEmail,
      name: "Super Admin",
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log(`- Upserted Admin: ${superAdmin.email}`);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });