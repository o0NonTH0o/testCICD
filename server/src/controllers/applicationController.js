const prisma = require('../lib/prisma');

// 0. ดึงข้อมูลใบสมัคร (Get All / Filter)
exports.getApplications = async (req, res) => {
  try {
    const { userId, status } = req.query; // รับ query param เช่น ?userId=...&status=...

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const applications = await prisma.awardApplication.findMany({
      where: where,
      include: {
        user: true,        // ดึงข้อมูลคนสมัครมาด้วย
        awardType: true,   // ดึงประเภทรางวัลมาด้วย
        approvalLogs: true // ดึงประวัติการอนุมัติมาด้วย
      },
      orderBy: {
        id: 'desc' // เรียงจากใหม่ไปเก่า
      }
    });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
  }
};

// 1. นิสิตสร้างใบสมัคร (Create Application)
exports.createApplication = async (req, res) => {
  try {
    const { userId, typeId, ...data } = req.body; // รับข้อมูลจากหน้าบ้าน

    // Requirement: นิสิตหนึ่งคนเสนอตนเองได้เพียง 1 ประเภทรางวัล/รอบ
    // เช็คว่าเคยสมัครไปหรือยังในปีการศึกษานี้ (สมมติปี 2024)
    const existingApp = await prisma.awardApplication.findFirst({
      where: {
        userId: userId,
        year: 2024, // ในระบบจริงควรดึงจาก Current Config
        NOT: { status: 'REJECTED' } // ถ้าเคยโดนปฏิเสธ อาจจะให้สมัครใหม่ได้? แล้วแต่นโยบาย
      }
    });

    if (existingApp) {
      return res.status(400).json({ message: "คุณสมัครไปแล้วในรอบนี้ ไม่สามารถสมัครซ้ำได้" });
    }

    // สร้างใบสมัคร สถานะเริ่มที่ PENDING_DEPT_HEAD (ต้องรอหัวหน้าภาคก่อน)
    const newApp = await prisma.awardApplication.create({
      data: {
        ...data,
        userId,
        typeId,
        year: 2024,
        status: 'PENDING_DEPT_HEAD', 
        history: { // บันทึก Log ว่าส่งแล้ว
          create: {
            actorId: userId,
            action: 'SUBMITTED',
            step: 'PENDING_DEPT_HEAD',
            comment: 'นิสิตส่งใบสมัคร'
          }
        }
      }
    });

    res.json(newApp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัคร' });
  }
};

// 2. การอนุมัติ (Approve / Reject)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params; // appId
    const { action, comment, actorId, role } = req.body; 
    // action = APPROVED | REJECTED | NEEDS_EDIT

    // ดึงใบสมัครเดิมมาดูก่อน
    const app = await prisma.awardApplication.findUnique({ where: { id } });
    
    let nextStatus = app.status;

    // Logic การเลื่อนขั้น (State Machine)
    if (action === 'APPROVED') {
      switch (app.status) {
        case 'PENDING_DEPT_HEAD':
          // หัวหน้าภาคชอบ -> ส่งต่อรองคณบดี
          if (role !== 'HEAD_OF_DEPARTMENT') return res.status(403).send("ไม่ใช่หัวหน้าภาค");
          nextStatus = 'PENDING_VICE_DEAN';
          break;
        case 'PENDING_VICE_DEAN':
          // รองคณบดีชอบ -> ส่งต่อคณบดี
          nextStatus = 'PENDING_DEAN';
          break;
        case 'PENDING_DEAN':
           // คณบดีชอบ -> ส่งต่อกองพัฒนานิสิต (Admin)
          nextStatus = 'PENDING_ADMIN';
          break;
        case 'PENDING_ADMIN':
           // Admin ตรวจแก้ประเภท -> ส่งต่อกรรมการ
          nextStatus = 'PENDING_COMMITTEE';
          break;
        // กรณี Committee อาจต้องใช้ Logic โหวตแยกต่างหาก หรือถ้าเอาง่ายคือกดปุ่มเดียวผ่านเลยก็ได้
        case 'PENDING_COMMITTEE':
          nextStatus = 'APPROVED'; 
          break;
      }
    } else if (action === 'REJECTED') {
      nextStatus = 'REJECTED';
    } else if (action === 'NEEDS_EDIT') {
      nextStatus = 'NEEDS_EDIT';
      // อาจต้องมี logic ส่งกลับไปสถานะ DRAFT ให้นิสิตแก้
    }

    // อัปเดต Database
    const updatedApp = await prisma.awardApplication.update({
      where: { id },
      data: {
        status: nextStatus,
        approvalLogs: { // บันทึก Log ทุกครั้ง
          create: {
            actorId,
            action,
            step: app.status,
            comment
          }
        }
      }
    });

    res.json(updatedApp);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};