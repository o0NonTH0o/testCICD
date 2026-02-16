const prisma = require('../lib/prisma');

// Helper to get active period
const getActivePeriod = async (campusId) => {
  const now = new Date();
  return await prisma.applicationPeriod.findFirst({
    where: {
      campusId: campusId,
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });
};

// 0. ดึงข้อมูลใบสมัคร (Get All / Filter)
exports.getApplications = async (req, res) => {
  try {
    const { userId, status, semester, year } = req.query; 
    const currentUserId = req.user.id; 
    
    // ดึง User ปัจจุบันเพื่อเช็ค Campus/Role
    const currentUser = await prisma.user.findUnique({ 
      where: { id: currentUserId },
      include: { campus: true }
    });

    if (!currentUser) return res.status(401).json({ error: "User not found" });

    const where = {};

    // 1. Filter by Campus (Isolation Policy)
    // admin หรือ user ทั่วไป เห็นได้แค่ campus ตัวเอง
    // SUPER_ADMIN (ถ้ามี) อาจจะเห็นหมด แต่ใน seed เรายังไม่มี role นี้ชัดเจน ให้ใช้ logic ปกติ
    if (currentUser.role !== 'ADMIN' || (currentUser.role === 'ADMIN' && currentUser.campusId)) {
       // ถ้ามี campusId ให้ filter ตามนั้น
       if (currentUser.campusId) {
          where.user = {
              campusId: currentUser.campusId
          };
       }
    }

    // 2. Access Control
    if (currentUser.role === 'STUDENT') {
      // นิสิตเห็นแค่ของตัวเอง
      where.userId = currentUserId; 
    } else if (currentUser.role === 'HEAD_OF_DEPARTMENT') {
      // Filter เฉพาะนิสิตในภาควิชาเดียวกัน
      if (currentUser.departmentId) {
        where.user = {
           ...where.user, // merge with campus if exists
           departmentId: currentUser.departmentId
        };
      }
    } else if (currentUser.role === 'VICE_DEAN' || currentUser.role === 'DEAN') {
      // Filter นิสิตในคณะเดียวกัน
      if (currentUser.facultyId) {
        where.user = {
           ...where.user, 
           facultyId: currentUser.facultyId
        };
      }
    } else {
      // Admin/Committee เห็นของคนอื่นได้ ระดับ Campus (บังคับด้วย campus logic ด้านบนแล้ว)
      if (userId) where.userId = userId;
    }

    if (status) where.status = status;
    if (year) where.academicYear = year;
    if (semester) where.semester = semester;

    const applications = await prisma.awardApplication.findMany({
      where: where,
      include: {
        user: {
           select: { 
             name: true, 
             actualId: true, 
             email: true, 
             faculty: true, 
             department: true,
             image: true,
            }
        },
        awardType: true,
        approvalLogs: { 
            include: { actor: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        },
        workItems: {
            include: {
                attachments: true
            }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
  }
};

// 0.1 ดึงข้อมูลใบสมัครรายใบ (Get One)
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const application = await prisma.awardApplication.findUnique({
      where: { id },
      include: {
        user: {
           select: { 
             name: true, 
             actualId: true, 
             email: true, 
             faculty: true, 
             department: true,
             image: true,
             campusId: true, // Need this for permission check
             departmentId: true,
             facultyId: true
            }
        },
        awardType: true,
        approvalLogs: { 
            include: { actor: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        },
        workItems: {
            include: {
                attachments: true
            }
        }
      }
    });

    if (!application) return res.status(404).json({ error: "ไม่พบใบสมัครนี้" });

    // Check Permissions
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    let hasAccess = false;

    if (currentUser.role === 'ADMIN') {
        // Admin sees all in their campus (or all if SUPER_ADMIN)
        if (!currentUser.campusId || currentUser.campusId === application.user.campusId) {
            hasAccess = true;
        }
    } else if (currentUser.role === 'COMMITTEE') {
        // Committee sees all in their campus
         if (!currentUser.campusId || currentUser.campusId === application.user.campusId) {
            hasAccess = true;
        }
    } else if (currentUser.role === 'STUDENT') {
        // Owner only
        if (application.userId === currentUserId) hasAccess = true;
    } else if (currentUser.role === 'HEAD_OF_DEPARTMENT') {
        // Same department
        if (currentUser.departmentId === application.user.departmentId) hasAccess = true;
    } else if (currentUser.role === 'VICE_DEAN' || currentUser.role === 'DEAN') {
        // Same faculty
        if (currentUser.facultyId === application.user.facultyId) hasAccess = true;
    }

    if (!hasAccess) return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึงใบสมัครนี้" });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// 1. นิสิตสร้างใบสมัคร (Create Application)
exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    // data structure expected: 
    // { typeId, transcriptFile, workItems: [{ title, ..., attachments: [{fileUrl, fileName}] }] }
    const { typeId, transcriptFile, gpa, workItems } = req.body; 

    // 1. Check User & Campus
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.campusId) {
        // Fallback: ถ้ายังไม่มี campusId (อาจจะเป็น user เก่า) ต้องบังคับให้ update profile หรือดึงจาก faculty
        // แต่ใน flow ใหม่ user ควรมี campusId ตั้งแต่ onboard
        return res.status(400).json({ error: "ไม่พบข้อมูลวิทยาเขตของนิสิต กรุณาติดต่อเจ้าหน้าที่" });
    }

    // 2. Check Active Period
    const activePeriod = await getActivePeriod(user.campusId);
    if (!activePeriod) {
        return res.status(400).json({ error: "ไม่อยู่ในช่วงเวลาเปิดรับสมัครของวิทยาเขตท่าน" });
    }

    // 3. User Constraint: 1 Application per Term (Year/Semester)
    // Requirement Update: "ถ้าโดน reject ก็จะส่งอีกไม่ได้" -> เช็คแค่ว่ามี Record หรือไม่
    const existingApp = await prisma.awardApplication.findFirst({
      where: {
        userId: userId,
        academicYear: activePeriod.academicYear,
        semester: activePeriod.semester
      }
    });

    if (existingApp) {
      if (existingApp.status === 'REJECTED') {
          return res.status(400).json({ message: "ใบสมัครของคุณในรอบนี้ถูกปฏิเสธแล้ว ไม่สามารถส่งใหม่ได้" });
      }
      return res.status(400).json({ message: `คุณได้ส่งใบสมัครในรอบปี ${activePeriod.academicYear} เทอม ${activePeriod.semester} ไปแล้ว` });
    }

    // 4. Validate WorkItems
    if (!workItems || workItems.length === 0) {
        return res.status(400).json({ error: "ต้องกรอกรายละเอียดผลงานอย่างน้อย 1 รายการ" });
    }
    
    // Check constraint: "1 รายละเอียดผลงานต้องแนบ file อย่างน้อย 1 file"
    for (const item of workItems) {
        if (!item.attachments || item.attachments.length === 0) {
            return res.status(400).json({ error: `ผลงาน "${item.title}" ต้องแนบไฟล์อย่างน้อย 1 ไฟล์` });
        }
    }

    // 5. Create
    const newApp = await prisma.awardApplication.create({
      data: {
        userId,
        typeId,
        academicYear: activePeriod.academicYear,
        semester: activePeriod.semester,
        transcriptFile: transcriptFile || null, // Optional
        gpax: gpa ? parseFloat(gpa) : null,
        status: 'PENDING_DEPT_HEAD',
        
        // Nested Create for WorkItems & Attachments
        workItems: {
            create: workItems.map(item => ({
                title: item.title,
                competitionName: item.competitionName,
                organizer: item.organizer,
                awardDate: item.awardDate ? new Date(item.awardDate) : null,
                level: item.level,
                rank: item.rank,
                isTeam: item.isTeam || false,
                teamName: item.isTeam ? item.teamName : null,
                attachments: {
                    create: item.attachments.map(file => ({
                        fileUrl: file.fileUrl,
                        fileName: file.fileName
                    }))
                }
            }))
        },

        approvalLogs: {
          create: {
            actorId: userId,
            action: 'SUBMITTED',
            step: 'PENDING_DEPT_HEAD',
            comment: 'นิสิตส่งใบสมัคร'
          }
        }
      },
      include: {
          workItems: { include: { attachments: true } }
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
    const { action, comment } = req.body; 
    const { id: actorId, role } = req.user; 
    
    // action = APPROVED | REJECTED | NEEDS_EDIT

    const app = await prisma.awardApplication.findUnique({ where: { id } });
    if (!app) return res.status(404).json({ error: "Application not found" });

    let nextStatus = app.status;

    // Logic การเลื่อนขั้น (State Machine)
    if (action === 'APPROVED') {
      switch (app.status) {
        case 'DRAFT':
           // Student submit
           if (role !== 'STUDENT') return res.status(403).json({ error: "Only student can submit draft" });
           nextStatus = 'PENDING_DEPT_HEAD';
           break;
        case 'PENDING_DEPT_HEAD':
          if (role !== 'HEAD_OF_DEPARTMENT') return res.status(403).json({ error: "Waiting for Department Head" });
          nextStatus = 'PENDING_VICE_DEAN';
          break;
        case 'PENDING_VICE_DEAN':
          if (role !== 'VICE_DEAN') return res.status(403).json({ error: "Waiting for Vice Dean" });
          nextStatus = 'PENDING_DEAN';
          break;
        case 'PENDING_DEAN':
          if (role !== 'DEAN') return res.status(403).json({ error: "Waiting for Dean" });
          nextStatus = 'PENDING_ADMIN';
          break;
        case 'PENDING_ADMIN':
          if (role !== 'ADMIN') return res.status(403).json({ error: "Waiting for Admin" });
          nextStatus = 'PENDING_COMMITTEE';
          break;
        case 'PENDING_COMMITTEE':
          if (role !== 'COMMITTEE') return res.status(403).json({ error: "Waiting for Committee" });
          
          // Count total committee members in this campus
          const totalCommittee = await prisma.user.count({
              where: { 
                  role: 'COMMITTEE',
                  campusId: app.user.campusId
              }
          });

          // Check if this user already voted
          const existingVote = await prisma.approvalLog.findFirst({
              where: {
                  applicationId: id,
                  actorId,
                  step: 'PENDING_COMMITTEE'
              }
          });
          
          if (existingVote) return res.status(400).json({ error: "You have already voted." });
          
          // Log this vote first (We'll do it in the update block below, but for calculation we add 1)
          const currentVotes = await prisma.approvalLog.count({
              where: {
                  applicationId: id,
                  step: 'PENDING_COMMITTEE',
                  action: 'APPROVED'
              }
          });
          
          const newVoteCount = currentVotes + 1;
          
          // Logic: Approved if > 50%
          if (newVoteCount > totalCommittee / 2) {
              nextStatus = 'APPROVED';
          } else {
              // Stay PENDING_COMMITTEE until majority reached
              // However, check if it's impossible to reach majority (Rejected)?
              // e.g. if 'REJECTED' votes > 50%?
              // Implementation detail: User asked "Status approved if > 50%, rejected if < 50%".
              // This implies "At the end of voting". But let's trigger 'APPROVED' eagerly.
              // For rejection, we'd need a 'REJECTED' action from committee too.
              nextStatus = 'PENDING_COMMITTEE'; 
          }
          break;
      }
    } else if (action === 'REJECTED') {
       // Committee voting REJECTED
       if (app.status === 'PENDING_COMMITTEE' && role === 'COMMITTEE') {
          // Similar logic for rejection votes
           const totalCommittee = await prisma.user.count({
              where: { role: 'COMMITTEE', campusId: app.user.campusId }
          });
          const existingVote = await prisma.approvalLog.findFirst({
              where: { applicationId: id, actorId, step: 'PENDING_COMMITTEE' }
          });
          if (existingVote) return res.status(400).json({ error: "You have already voted." });

          const currentRejects = await prisma.approvalLog.count({
              where: { applicationId: id, step: 'PENDING_COMMITTEE', action: 'REJECTED' }
          });
          
          if ((currentRejects + 1) > totalCommittee / 2) {
              nextStatus = 'REJECTED'; // Consistently Rejected
          } else {
              nextStatus = 'PENDING_COMMITTEE';
              // Just record the vote
          }
       } else {
          // Others: Immediate Reject
          nextStatus = 'REJECTED';
       }
    } else if (action === 'NEEDS_EDIT') {
      nextStatus = 'NEEDS_EDIT';
      // User can edit and resubmit (State -> DRAFT or Special state?)
      // Usually goes back to user. Let's send to NEEDS_EDIT.
    }

    // อัปเดต Database
    const updatedApp = await prisma.awardApplication.update({
      where: { id },
      data: {
        status: nextStatus,
        approvalLogs: { 
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
