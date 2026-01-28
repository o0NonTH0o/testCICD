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
      tel 
    } = req.body;

    // Validation: ถ้าขอเป็น STUDENT ต้องมี รหัสนิสิต
    if (role === 'STUDENT' && !actualId) {
      return res.status(400).json({ error: "นิสิตต้องกรอกรหัสนิสิต" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,           // บันทึก Role ที่ขอมา
        actualId,
        tel,
        facultyId,
        departmentId,
        status: 'PENDING_APPROVAL' // <-- เปลี่ยนสถานะเป็น "รออนุมัติ"
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
      
      // (Optional) เช็ค Role ก่อนว่าคนกดเป็น ADMIN หรือไม่
      // if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No Permission" });

      await prisma.user.update({
          where: { id },
          data: { status: 'ACTIVE' }
      });
      
      res.json({ message: "อนุมัติผู้ใช้งานเสร็จสิ้น สถานะเป็น ACTIVE แล้ว" });
  } catch (error) {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
};