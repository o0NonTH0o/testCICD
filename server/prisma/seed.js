const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. สร้างประเภทรางวัล (AwardType)
  const awardTypes = [
    { 
      name: 'ด้านกิจกรรมเสริมหลักสูตร',
      description: 'เพื่อให้การส่งเสริมและสนับสนุนรวมทั้งเป็นกำลังใจให้นิสิตที่มีผลงานดีเด่นด้านกิจกรรมเสริมหลักสูตร',
      tags: ['Leader', 'Activity', 'GPA > 2.50'],
      criteria: 'ผู้สมัครต้องเป็นนิสิตชั้นปีที่ 2 ขึ้นไป และมีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.50'
    },
    { 
      name: 'ด้านความคิดสร้างสรรค์และนวัตกรรม',
      description: 'เพื่อส่งเสริมและสนับสนุนให้นิสิตได้มีความคิดริเริ่มสร้างสรรค์ในสิ่งที่เป็นประโยชน์ต่อสังคม และประเทศชาติ',
      tags: ['Portfolio ★', 'GPA > 2.50'],
      criteria: 'ผลงานต้องเป็นนวัตกรรมใหม่ที่ไม่เคยได้รับรางวัลระดับชาติมาก่อน'
    },
    { 
      name: 'ด้านความประพฤติดี',
      description: 'เพื่อส่งเสริมและสนับสนุนให้นิสิตมีความประพฤติดีเด่น และปฏิบัติตนเป็นแบบอย่างที่ดีแก่สังคม',
      tags: ['Behaviour', 'Good Conduct'],
      criteria: 'ต้องไม่มีประวัติการทำผิดวินัยนิสิต'
    },
  ];

  for (const type of awardTypes) {
    // Check by name
    const exist = await prisma.awardType.findFirst({ where: { awardName: type.name } });
    if (!exist) {
      await prisma.awardType.create({ 
        data: { 
          awardName: type.name,
          description: type.description,
          tags: type.tags,
          criteria: type.criteria
        } 
      });
      console.log(`- Created AwardType: ${type.name}`);
    } else {
      // Update existing
      await prisma.awardType.update({
        where: { id: exist.id },
        data: {
          description: type.description,
          tags: type.tags,
          criteria: type.criteria
        }
      });
      console.log(`- Updated AwardType: ${type.name}`);
    }
  }

  // 2. สร้างวิทยาเขต (Campus), คณะ (Faculty), ภาควิชา (Department) และ Admin ประจำวิทยาเขต
  const hierarchy = [
    {
      campus: 'บางเขน',
      adminEmail: 'admin.bkn@ku.th',
      faculties: [
        { name: 'คณะวิทยาศาสตร์', depts: ['วิทยาการคอมพิวเตอร์', 'คณิตศาสตร์', 'เคมี'] },
        { name: 'คณะวิศวกรรมศาสตร์', depts: ['วิศวกรรมคอมพิวเตอร์', 'วิศวกรรมไฟฟ้า', 'วิศวกรรมโยธา'] },
        { name: 'คณะบริหารธุรกิจ', depts: ['การบัญชี', 'การตลาด', 'การจัดการ'] },
      ]
    },
    {
      campus: 'กำแพงแสน',
      adminEmail: 'admin.kps@ku.th',
      faculties: [
        { name: 'คณะศิลปศาสตร์และวิทยาศาสตร์', depts: ['วิทยาศาสตร์และนวัตกรรมชีวภาพ', 'วิทยาศาสตร์กายภาพและวัสดุศาสตร์', 'วิทยาการคำนวณและเทคโนโลยีดิจิทัล'] },
        { name: 'คณะวิศวกรรมศาสตร์', depts: ['วิศวกรรมคอมพิวเตอร์', 'วิศวกรรมเครื่องกล', 'วิศวกรรมโยธา'] },
        { name: 'คณะเกษตร', depts: ['ปฐพีวิทยา', 'โรคพืช', 'พืชไร่นา'] },
      ]
    },
    {
      campus: 'ศรีราชา',
      adminEmail: 'admin.src@ku.th',
      faculties: [
        { name: 'คณะวิทยาศาสตร์', depts: ['วิทยาการคอมพิวเตอร์', 'ฟิสิกส์', 'วิทยาการและเทคโนโลยีดิจิทัล'] },
        { name: 'คณะวิศวกรรมศาสตร์', depts: ['วิศวกรรมคอมพิวเตอร์และสารสนเทศศาสตร์', 'วิศวกรรมเครื่องกลและการออกแบบ', 'วิศวกรรมโยธา'] },
        { name: 'คณะวิทยาการจัดการ', depts: ['การจัดการโลจิสติกส์', 'การเงินและการลงทุน', 'การบัญชี'] },
      ]
    },
    {
      campus: 'เฉลิมพระเกียรติ สกลนคร',
      adminEmail: 'admin.csc@ku.th',
      faculties: [
        { name: 'คณะทรัพยากรธรรมชาติและอุตสาหกรรมการเกษตร', depts: ['เทคโนโลยีการอาหาร', 'สัตวศาสตร์', 'พืชศาสตร์'] },
        { name: 'คณะวิทยาศาสตร์และวิศวกรรมศาสตร์', depts: ['วิทยาการคอมพิวเตอร์', 'วิศวกรรมคอมพิวเตอร์', 'วิศวกรรมไฟฟ้า'] },
        { name: 'คณะศิลปศาสตร์และวิทยาการจัดการ', depts: ['การจัดการ', 'การบัญชี', 'การตลาด'] },
      ]
    }
  ];

  for (const cData of hierarchy) {
    // 2.1 สร้างหรือค้นหา Campus
    let campus = await prisma.campus.findFirst({ where: { campusName: cData.campus } });
    if (!campus) {
      campus = await prisma.campus.create({ data: { campusName: cData.campus } });
      console.log(`- Created Campus: ${cData.campus}`);
    }

    // 2.2 Create Admin for this Campus
    await prisma.user.upsert({
      where: { email: cData.adminEmail },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
        campusId: campus.id
      },
      create: {
        email: cData.adminEmail,
        name: `Admin ${cData.campus}`,
        role: 'ADMIN',
        status: 'ACTIVE',
        campusId: campus.id
      }
    });
    console.log(`  └- Upserted Admin: ${cData.adminEmail}`);
    
    // 2.3 Create Initial Application Period (Example: 2568 Semester 1)
    const existingPeriod = await prisma.applicationPeriod.findFirst({
      where: {
        campusId: campus.id,
        academicYear: '2568',
        semester: '1'
      }
    });
    
    if (!existingPeriod) {
      await prisma.applicationPeriod.create({
        data: {
          campusId: campus.id,
          academicYear: '2568',
          semester: '1',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2026-12-31') // Extended for testing
        }
      });
      console.log(`  └- Created Application Period: 2568/1 for ${cData.campus}`);
    }

    // 2.4 Loop สร้าง Faculty ใน Campus นั้น
    for (const fac of cData.faculties) {
      let faculty = await prisma.faculty.findFirst({ 
        where: { 
          facultyName: fac.name,
          campusId: campus.id
        } 
      });
      
      if (!faculty) {
        faculty = await prisma.faculty.create({
          data: {
            facultyName: fac.name,
            campusId: campus.id
          }
        });
        // console.log(`  └- Created Faculty: ${fac.name}`);
      }

      // 2.5 Loop สร้าง Department ใน Faculty นั้น
      for (const deptName of fac.depts) {
        const existDept = await prisma.department.findFirst({
           where: { name: deptName, facultyId: faculty.id }
        });

        if (!existDept) {
          await prisma.department.create({
             data: {
               name: deptName,
               facultyId: faculty.id
             }
          });
          // console.log(`    └- Created Dept: ${deptName}`);
        }
      }
    }
  }
 
  // Super Admin (Global - optional or link to a primary campus)
  const superAdminEmail = "surapat.pak@ku.th"; 
  // Let's link super admin to Bangkhen by default or leave campusId null if system supports it
  // For strict campus isolation, maybe link to Bangkhen
  const bknCampus = await prisma.campus.findFirst({ where: { campusName: 'บางเขน' }});
  
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      campusId: bknCampus?.id 
    },
    create: {
      email: superAdminEmail,
      name: "Super Admin",
      role: 'ADMIN',
      status: 'ACTIVE',
      campusId: bknCampus?.id
    }
  });
  console.log(`- Upserted Super Admin: ${superAdminEmail}`);

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