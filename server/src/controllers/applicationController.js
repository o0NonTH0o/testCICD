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
      // เห็นเฉพาะนิสิตในภาควิชาตัวเอง — ทุก status (ไม่จำกัด stage)
      if (currentUser.departmentId) {
        where.user = {
           ...where.user,
           departmentId: currentUser.departmentId
        };
      }
      // ซ่อน DRAFT ของคนอื่น (ยังไม่ submit)
      if (!status) {
        where.status = { not: 'DRAFT' };
      }
    } else if (currentUser.role === 'VICE_DEAN') {
      // เห็นทุก application ในคณะตัวเอง ที่ผ่าน HoD มาแล้ว
      if (currentUser.facultyId) {
        where.user = {
           ...where.user,
           facultyId: currentUser.facultyId
        };
      }
      if (!status) {
        where.status = {
          notIn: ['DRAFT', 'PENDING_DEPT_HEAD']
        };
      }
    } else if (currentUser.role === 'DEAN') {
      // เห็นทุก application ในคณะตัวเอง ที่ผ่าน Vice Dean มาแล้ว
      if (currentUser.facultyId) {
        where.user = {
           ...where.user,
           facultyId: currentUser.facultyId
        };
      }
      if (!status) {
        where.status = {
          notIn: ['DRAFT', 'PENDING_DEPT_HEAD', 'ACCEPTED_BY_DEPT_HEAD', 'REJECTED_BY_DEPT_HEAD', 'PENDING_VICE_DEAN']
        };
      }
    } else if (currentUser.role === 'ADMIN') {
      // เห็นทุก application ใน campus ตัวเอง ที่ผ่าน Dean มาแล้ว
      if (!status) {
        where.status = {
          notIn: [
            'DRAFT', 'PENDING_DEPT_HEAD', 'ACCEPTED_BY_DEPT_HEAD', 'REJECTED_BY_DEPT_HEAD',
            'PENDING_VICE_DEAN', 'ACCEPTED_BY_VICE_DEAN', 'REJECTED_BY_VICE_DEAN',
            'PENDING_DEAN'
          ]
        };
      }
    } else if (currentUser.role === 'COMMITTEE') {
      // เห็นทุก application ใน campus ตัวเอง ที่ผ่าน Admin มาแล้ว
      if (!status) {
        where.status = {
          notIn: [
            'DRAFT', 'PENDING_DEPT_HEAD', 'ACCEPTED_BY_DEPT_HEAD', 'REJECTED_BY_DEPT_HEAD',
            'PENDING_VICE_DEAN', 'ACCEPTED_BY_VICE_DEAN', 'REJECTED_BY_VICE_DEAN',
            'PENDING_DEAN', 'ACCEPTED_BY_DEAN', 'REJECTED_BY_DEAN',
            'PENDING_ADMIN'
          ]
        };
      }
    } else {
      // Others (Super Admin?)
      if (userId) where.userId = userId;
    }

    // 4. Merge Filters (Fix: Ensure Role constraints are respected if necessary, or allow "View All in Scope" if explicit status requested)
    // Current behavior: If user requests ?status=..., it overrides the default "Inbox" view.
    // We apply the "Expanded Status" logic here.

    if (status) {
        let statusFilter = {};
        
        // Advanced Filtering for "Has Passed Stage X"
        if (status === 'ACCEPTED_BY_DEPT_HEAD') {
             // Anything that successfully passed Dept Head
             statusFilter = { in: ['ACCEPTED_BY_DEPT_HEAD', 'PENDING_VICE_DEAN', 'ACCEPTED_BY_VICE_DEAN', 'REJECTED_BY_VICE_DEAN', 'PENDING_DEAN', 'ACCEPTED_BY_DEAN', 'REJECTED_BY_DEAN', 'PENDING_ADMIN', 'ACCEPTED_BY_ADMIN', 'REJECTED_BY_ADMIN', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED'] };
        } else if (status === 'ACCEPTED_BY_VICE_DEAN') {
             statusFilter = { in: ['ACCEPTED_BY_VICE_DEAN', 'PENDING_DEAN', 'ACCEPTED_BY_DEAN', 'REJECTED_BY_DEAN', 'PENDING_ADMIN', 'ACCEPTED_BY_ADMIN', 'REJECTED_BY_ADMIN', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED'] };
        } else if (status === 'ACCEPTED_BY_DEAN') {
             statusFilter = { in: ['ACCEPTED_BY_DEAN', 'PENDING_ADMIN', 'ACCEPTED_BY_ADMIN', 'REJECTED_BY_ADMIN', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED'] };
        } else if (status === 'ACCEPTED_BY_ADMIN') {
             statusFilter = { in: ['ACCEPTED_BY_ADMIN', 'PENDING_COMMITTEE', 'APPROVED', 'REJECTED'] };
        } else if (status === 'PENDING_DEPT_HEAD') {
             statusFilter = 'PENDING_DEPT_HEAD';
        } else if (status === 'PENDING_VICE_DEAN') {
             // Explicit Pending Vice Dean + Implicit (Accepted by Dept Head but not processed by Vice Dean yet if strict flow isn't instant)
             // In our flow, AcceptedByDeptHead IS the queue for Vice Dean.
             statusFilter = { in: ['ACCEPTED_BY_DEPT_HEAD', 'PENDING_VICE_DEAN'] };
        } else if (status === 'PENDING_DEAN') {
             statusFilter = { in: ['ACCEPTED_BY_VICE_DEAN', 'PENDING_DEAN'] };
        } else if (status === 'PENDING_ADMIN') {
             statusFilter = { in: ['ACCEPTED_BY_DEAN', 'PENDING_ADMIN'] };
        } else if (status === 'PENDING_COMMITTEE') {
             statusFilter = { in: ['ACCEPTED_BY_ADMIN', 'PENDING_COMMITTEE'] };
        } else {
             // Normal strict filter
             statusFilter = status;
        }

        where.status = statusFilter;
    }
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
             campus: true,
             tel: true,
            }
        },
        awardType: true,
        approvalLogs: { 
            include: { actor: { select: { id: true, name: true, role: true } } },
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
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ: ' + error.message });
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
            include: { actor: { select: { id: true, name: true, role: true } } },
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
          nextStatus = 'ACCEPTED_BY_DEPT_HEAD'; // This implies Pending Vice Dean
          break;
        case 'ACCEPTED_BY_DEPT_HEAD':
        case 'PENDING_VICE_DEAN': // Explicit pending state if used
            if (role !== 'VICE_DEAN') return res.status(403).json({ error: "Waiting for Vice Dean" });
            nextStatus = 'ACCEPTED_BY_VICE_DEAN'; // This implies Pending Dean
            break;
        case 'ACCEPTED_BY_VICE_DEAN':
        case 'PENDING_DEAN':
           if (role !== 'DEAN') return res.status(403).json({ error: "Waiting for Dean" });
           nextStatus = 'ACCEPTED_BY_DEAN'; // This implies Pending Admin
           break;
        case 'ACCEPTED_BY_DEAN':
        case 'PENDING_ADMIN':
           if (role !== 'ADMIN') return res.status(403).json({ error: "Waiting for Admin" });
           nextStatus = 'ACCEPTED_BY_ADMIN'; // This implies Pending Committee
           break;
        case 'ACCEPTED_BY_ADMIN':
        case 'PENDING_COMMITTEE':
            // Committee needs special voting logic? Or simple approve for now?
            // Assuming simplified flow where Committee Member act creates vote, 
            // but here we check who is calling. 
            // If Single 'COMMITTEE' role approves, does it count as final?
            // Let's keep the voting logic we saw earlier or simplify.
            // Re-using the voting logic block below for PENDING_COMMITTEE
            if (role !== 'COMMITTEE') return res.status(403).json({ error: "Waiting for Committee" });
            nextStatus = 'PENDING_COMMITTEE'; // Logic stays inside voting block
            break;
        default:
             // Already approved or rejected?
             break;
      }
      
      // Special Logic for Committee Voting
      if (app.status === 'PENDING_COMMITTEE' || app.status === 'ACCEPTED_BY_ADMIN') {
          if (role !== 'COMMITTEE') return res.status(403).json({ error: "Waiting for Committee" });
          
          const totalCommittee = await prisma.user.count({
              where: { role: 'COMMITTEE', campusId: app.user.campusId }
          });
          
          // Check existing vote (Step could be PENDING_COMMITTEE or ACCEPTED_BY_ADMIN)
          const existingVote = await prisma.approvalLog.findFirst({
              where: { 
                  applicationId: id, 
                  actorId, 
                  step: { in: ['PENDING_COMMITTEE', 'ACCEPTED_BY_ADMIN'] }
              }
          });
          
          if (existingVote) return res.status(400).json({ error: "You have already voted." });
          
          // Count APPROVED votes
          const currentVotes = await prisma.approvalLog.count({
              where: { 
                  applicationId: id, 
                  step: { in: ['PENDING_COMMITTEE', 'ACCEPTED_BY_ADMIN'] },
                  action: 'APPROVED' 
              }
          });
          
          if ((currentVotes + 1) > totalCommittee / 2) {
              nextStatus = 'APPROVED';
          } else {
              nextStatus = 'PENDING_COMMITTEE'; 
          }
      }

    } else if (action === 'REJECTED') {
       // Identify WHO is rejecting to set specific status
       if (role === 'HEAD_OF_DEPARTMENT') nextStatus = 'REJECTED_BY_DEPT_HEAD';
       else if (role === 'VICE_DEAN') nextStatus = 'REJECTED_BY_VICE_DEAN';
       else if (role === 'DEAN') nextStatus = 'REJECTED_BY_DEAN';
       else if (role === 'ADMIN') nextStatus = 'REJECTED_BY_ADMIN';
       else if (role === 'COMMITTEE') {
           // Voting Logic for Reject
           const totalCommittee = await prisma.user.count({
              where: { role: 'COMMITTEE', campusId: app.user.campusId }
          });
          
          const existingVote = await prisma.approvalLog.findFirst({
              where: { 
                  applicationId: id, 
                  actorId, 
                  step: { in: ['PENDING_COMMITTEE', 'ACCEPTED_BY_ADMIN'] } 
              }
          });
          if (existingVote) return res.status(400).json({ error: "You have already voted." });

          const currentRejects = await prisma.approvalLog.count({
              where: { 
                  applicationId: id, 
                  step: { in: ['PENDING_COMMITTEE', 'ACCEPTED_BY_ADMIN'] }, 
                  action: 'REJECTED' 
              }
          });
          
          if ((currentRejects + 1) > totalCommittee / 2) {
              nextStatus = 'REJECTED'; // Consistently Rejected
          } else {
              nextStatus = 'PENDING_COMMITTEE';
              // Just record the vote
          }
       } else {
           nextStatus = 'REJECTED'; // Default reject
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
