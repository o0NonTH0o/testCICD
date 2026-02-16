const prisma = require('../lib/prisma');

// Set Application Period (Admin Only)
exports.setApplicationPeriod = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { academicYear, semester, startDate, endDate } = req.body;

    if (role !== 'ADMIN') {
        return res.status(403).json({ error: "Access denied. Admin only." });
    }

    // Get Admin's Campus
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.campusId) {
        return res.status(400).json({ error: "Admin account is not linked to any Campus." });
    }

    // Check if period exists
    const existing = await prisma.applicationPeriod.findFirst({
        where: {
            campusId: user.campusId,
            academicYear,
            semester
        }
    });

    if (existing) {
        // Update
        const updated = await prisma.applicationPeriod.update({
            where: { id: existing.id },
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });
        return res.json({ message: "Updated period", period: updated });
    } else {
        // Create
        const created = await prisma.applicationPeriod.create({
            data: {
                campusId: user.campusId,
                academicYear,
                semester,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });
        return res.json({ message: "Created period", period: created });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to set application period" });
  }
};

// Get Periods (for Admin dashboard)
exports.getPeriods = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!user.campusId) return res.status(400).json({ error: "No campus linked" });

        const periods = await prisma.applicationPeriod.findMany({
            where: { campusId: user.campusId },
            orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }]
        });
        res.json(periods);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch periods" });
    }
};
