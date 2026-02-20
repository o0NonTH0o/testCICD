const prisma = require('../lib/prisma');

exports.getCampuses = async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      include: {
        faculties: {
          include: {
            departments: true
          }
        }
      }
    }); // This fetches everything in a hierarchy: Campus -> Faculties -> Departments
    res.json(campuses);
  } catch (error) {
    res.status(500).json({ error: "ดึงข้อมูลวิทยาเขตไม่สำเร็จ" });
  }
};

exports.getAwardTypes = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    
    // Determine scope based on role
    let statFilter = {};

    if (user) {
        // Fetch full user details to get faculty/dept IDs
        const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
        
        if (currentUser) {
            if (currentUser.role === 'HEAD_OF_DEPARTMENT') {
                // Filter stats for only students in this department
                statFilter = {
                    user: { departmentId: currentUser.departmentId }
                };
            } else if (currentUser.role === 'VICE_DEAN' || currentUser.role === 'DEAN') {
                // Filter stats for only students in this faculty
                statFilter = {
                    user: { facultyId: currentUser.facultyId }
                };
            } else if (currentUser.role === 'ADMIN' && currentUser.campusId) {
                // Admin sees campus stats
                statFilter = {
                    user: { campusId: currentUser.campusId }
                };
            }
        }
    }

    const types = await prisma.awardType.findMany({
      include: {
        applications: {
          where: statFilter, // Apply filter here
          select: {
            status: true
          }
        }
      }
    });
    
    // Process the data to add counts
    const result = types.map(type => {
      const total = type.applications.length;
      const submitted = type.applications.filter(app => app.status !== 'DRAFT').length;
      const pending = type.applications.filter(app => 
        ['PENDING_DEPT_HEAD', 'PENDING_VICE_DEAN', 'PENDING_DEAN', 'PENDING_ADMIN', 'PENDING_COMMITTEE'].includes(app.status)
      ).length;

      return {
        ...type,
        stats: {
          totalApplications: total,
          submitted,
          pending
        }
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ดึงข้อมูลประเภทรางวัลไม่สำเร็จ" });
  }
};

exports.createAwardType = async (req, res) => {
  try {
    const { awardName, description, criteria, tags, iconUrl, scheduleFileUrl } = req.body;
    
    // Create new award type
    const newType = await prisma.awardType.create({
      data: {
        awardName,
        description,
        criteria,
        tags: tags || [],
        iconUrl: iconUrl || 'trophy',
        scheduleFileUrl: scheduleFileUrl || ''
      }
    });

    res.json(newType);
  } catch (error) {
    console.error("Error creating award type:", error);
    res.status(500).json({ error: "Failed to create award type" });
  }
};

exports.getAwardTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const awardType = await prisma.awardType.findUnique({
      where: { id: id }
    });
    
    if (!awardType) {
      return res.status(404).json({ error: "Award type not found" });
    }
    
    res.json(awardType);
  } catch (error) {
    console.error("Error fetching award type:", error);
    res.status(500).json({ error: "Failed to fetch award type" });
  }
};

exports.updateAwardType = async (req, res) => {
  try {
    const { id } = req.params;
    const { awardName, description, criteria, tags, iconUrl, scheduleFileUrl } = req.body;
    
    const updatedType = await prisma.awardType.update({
      where: { id: id },
      data: {
        awardName,
        description,
        criteria,
        tags: tags || [], // Ensure tags is an array
        iconUrl,
        scheduleFileUrl
      }
    });
    
    res.json(updatedType);
  } catch (error) {
    console.error("Error updating award type:", error);
    res.status(500).json({ error: "Failed to update award type" });
  }
};

exports.getActivePeriod = async (req, res) => {
  try {
    const { campusId } = req.query;
    if (!campusId) {
      return res.status(400).json({ error: "Campus ID is required" });
    }

    const now = new Date();
    const period = await prisma.applicationPeriod.findFirst({
      where: {
        campusId: campusId,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    if (!period) {
      return res.json(null); // No active period found
    }

    res.json(period);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get active period" });
  }
};
