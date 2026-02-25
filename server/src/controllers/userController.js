const prisma = require('../lib/prisma');

exports.onboardUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      role,          // User เลือก Role เอง (เช่น ขอเป็น STUDENT หรือ DEAN)
      campusId,      // (อาจจะไม่ต้อง save ลง user โดยตรง ถ้า save faculty/dept แล้ว)
      facultyId, 
      departmentId, 
      actualId, 
      tel,
      name           // รับชื่อ-สกุล มาอัปเดตด้วย
    } = req.body;

    // Validation: ถ้าขอเป็น STUDENT ต้องมี รหัสนิสิต
    if (role === 'STUDENT' && !actualId) {
      return res.status(400).json({ error: "นิสิตต้องกรอกรหัสนิสิต" });
    }

    // Validation: roles ที่ต้องการ faculty
    const needsFaculty = ['STUDENT', 'HEAD_OF_DEPARTMENT', 'VICE_DEAN', 'DEAN'].includes(role);
    const needsDept    = ['STUDENT', 'HEAD_OF_DEPARTMENT'].includes(role);

    if (needsFaculty && !facultyId) {
      return res.status(400).json({ error: "กรุณาเลือกคณะ" });
    }
    if (needsDept && !departmentId) {
      return res.status(400).json({ error: "กรุณาเลือกสาขา" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role,
        actualId: role === 'STUDENT' ? actualId : null,
        tel,
        campusId,
        facultyId:    needsFaculty ? facultyId    : null,
        departmentId: needsDept    ? departmentId : null,
        status: 'PENDING_APPROVAL'
      }
    });

    res.json({ message: "ส่งคำขอสำเร็จ รอแอดมินอนุมัติ", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
};

// เพิ่มฟังก์ชัน Approve User ต่อท้ายตรงนี้
exports.approveUser = async (req, res) => {
  try {
      const { id } = req.params;
      
      // เช็ค Role ว่าคนกดเป็น ADMIN เท่านั้น
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "สำหรับ Admin เท่านั้น" });
      }

      await prisma.user.update({
          where: { id },
          data: { status: 'ACTIVE' }
      });
      
      res.json({ message: "อนุมัติผู้ใช้งานเสร็จสิ้น สถานะเป็น ACTIVE แล้ว" });
  } catch (error) {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
};

exports.rejectUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // เช็ค Role ว่าคนกดเป็น ADMIN เท่านั้น
        // (จริงๆ แล้ว Middleware checkRole('ADMIN') แนะนำกว่า แต่ใส่ตรงนี้ก็ได้)
        if (req.user.role !== 'ADMIN') {
          return res.status(403).json({ error: "สำหรับ Admin เท่านั้น" });
        }
  
        await prisma.user.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
        
        res.json({ message: "ปฏิเสธผู้ใช้งานเรียบร้อย สถานะเป็น REJECTED" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการปฏิเสธคำขอ" });
    }
  };

// Admin แก้ไขข้อมูล User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // เช็ค Role ว่าคนกดเป็น ADMIN เท่านั้น
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "สำหรับ Admin เท่านั้น" });
    }

    const { 
        name, 
        role, 
        actualId, 
        campusId, 
        facultyId, 
        departmentId, 
        email, 
        tel,
        status 
    } = req.body;

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            name,
            role,
            actualId,
            campusId,
            facultyId,
            departmentId,
            email,
            tel,
            status
        }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
  }
};

// ดึงรายชื่อ User (สำหรับ Admin เอาไว้ดูว่าใครรออนุมัติบ้าง)
exports.getUsers = async (req, res) => {
  try {
    // จำกัดสิทธิ์ Admin เท่านั้นถึงดูได้
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "สำหรับ Admin เท่านั้น" });
    }

    const { status } = req.query;
    const where = status ? { status } : {};

    const users = await prisma.user.findMany({
      where,
      include: {
        faculty: {
          include: {
            campus: true
          }
        },
        department: true,
        campus: true
      },
      orderBy: { 
        // เรียงตามเวลาล่าสุดที่สมัครเข้ามา (ถ้าไม่มี createdAt ใน user schema ให้ใช้วิธีอื่น)
        // แต่ User Schema ปกติจะมี createdAt หรือไม่ก็ดูจาก id
      } 
    });

    res.json(users);
  } catch (error) {
    // fallback ถ้าไม่มี createdAt ให้เอา orderBy ออก
    console.error(error); 
    res.status(500).json({ error: "ดึงข้อมูล User ไม่สำเร็จ" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        faculty: true,
        department: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};