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
    const types = await prisma.awardType.findMany();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: "ดึงข้อมูลประเภทรางวัลไม่สำเร็จ" });
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
