const mongoose = require('mongoose');
const Club = require('../Models/ClubModel');
const ReportModel = require('../Models/ReportModel');

exports.createClub = async (req, res) => {
  try {
    const {
      clubName,
      description,
      category,
      rules,
      createdBy
    } = req.body;

    // Validate required fields
    if (!clubName || !description || !category || !createdBy) {
      return res.status(400).json({
        message: "Club name, description and category are required"
      });
    }

    // The owner must come from authenticated server-side identity.


    // Check whether a similar active club already exists.
    const existingClub = await Club.findOne({
      clubName: {
        $regex: `^${clubName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      },
      status: "active"
    });

    if (existingClub) {
      return res.status(409).json({
        message: "A club with this name already exists"
      });
    }

    const club = await Club.create({
      clubName: clubName.trim(),
      description,
      category,
      rules: rules || "",
      image: req.file ? `/clubs/${req.file.filename}` : "",
      createdBy: createdBy,
      members: [createdBy],
      status: 'active'
    });

    return res.status(201).json({
      message: "Club created successfully",
      club
    });

  } catch (error) {
    console.error("Create club error:", error);

    return res.status(500).json({
      message: "Unable to create club"
    });
  }
};

exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({
      status: "active"
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Clubs fetched successfully",
      clubs
    });

  } catch (error) {
    console.error("Get clubs error:", error);

    return res.status(500).json({
      message: "Unable to fetch clubs"
    });
  }
};


exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findOne({
      _id: req.params.id,
      status: "active"
    })
      .populate("createdBy", "name email")
      .populate("members", "name email department year");

    if (!club) {
      return res.status(404).json({
        message: "Club not found"
      });
    }

    return res.status(200).json({ club });

  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch club details"
    });
  }
};


exports.joinClub = async (req, res) => {
  try {

    // Get IDs from URL parameters
    const studentId = req.params.studentId;
    const clubId = req.params.clubId;

    // Validate IDs
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID"
      });
    }

    // Check whether club exists and is active
    const existingClub = await Club.findOne({
      _id: clubId,
      status: "active"
    });

    if (!existingClub) {
      return res.status(404).json({
        success: false,
        message: "Club not found or inactive"
      });
    }

    // Check whether student already joined
    if (existingClub.members.some(
      member => member.toString() === studentId
    )) {
      return res.status(409).json({
        success: false,
        message: "You have already joined this club"
      });
    }

    // Add student to club
    const club = await Club.findByIdAndUpdate(
      clubId,
      {
        $addToSet: {
          members: studentId
        }
      },
      {
        new: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "You joined the club successfully",
      club
    });

  } catch (error) {

    console.error("Join club error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join club",
      error: error.message
    });
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const clubId = req.params.clubId;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid club ID"
      });
    }
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    const club = await Club.findOne({
      _id: clubId,
      status: "active"
    });

    if (!club) {
      return res.status(404).json({
        message: "Club not found"
      });
    }

    if (club.createdBy.toString() === studentId.toString()) {
      return res.status(400).json({
        message: "The club owner cannot leave their own club"
      });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      {
        $pull: {
          members: studentId
        }
      },
      {
        new: true
      }
    );

    return res.status(200).json({
      message: "You left the club successfully",
      club: updatedClub
    });

  } catch (error) {
    console.error("Leave club error:", error);

    return res.status(500).json({
      message: "Unable to leave club"
    });
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const reason = req.body.reason;
    const clubId = req.params.clubId;
    const deletedBy = req.body.deletedBy;

    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid club ID"
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Please provide a reason for deletion"
      });
    }

    const club = await Club.findOneAndUpdate(
      {
        _id: clubId,
        status: "active"
      },
      {
        $set: {
          status: "deleted",
          deletedBy: deletedBy,
          deletionReason: reason.trim(),
          deletedAt: new Date()
        }
      },
      {
        new: true
      }
    );

    if (!club) {
      return res.status(404).json({
        message: "Active club not found"
      });
    }

    return res.status(200).json({
      message: "Club deleted successfully",
      club
    });

  } catch (error) {
    console.error("Delete club error:", error);

    return res.status(500).json({
      message: "Unable to delete club"
    });
  }
};


exports.reportClub = async (req, res) => {
  try {
    const clubId = req.body.clubId;
    const studentId = req.body.studentId;
    const ReportMessage = req.body.reason;
    console.log(clubId,studentId,ReportMessage);
    if (!mongoose.isValidObjectId(clubId)) {
      return res.status(400).json({
        message: "Invalid club ID"
      });
    }
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        message: "Invalid Member ID"
      });
    }
    if (!ReportMessage || !ReportMessage.trim()) {
      return res.status(400).json({
        message: "Please provide a ReportMessage for Report"
      });
    }
    const club = await Club.findOne(
      {
        _id: clubId,
        status: "active"
      })
    if (!club) {
      return res.status(400).json({
        message: "Club Not Found"
      })
    }
    await ReportModel.create(
      {
        clubId: clubId,
        studentId: studentId,
        ReportMessage: ReportMessage
      }
    )
    return res.status(201).json({
      message: "Report successfully"
    })
  } catch (err) {
    return res.status(400).json(
      {
        message: "Unable to report", err
      }
    )
  }
}

exports.fetchAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find({
      status: "active"
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch report counts club-wise
    const reportCounts = await ReportModel.aggregate([
      {
        $group: {
          _id: "$clubId",
          totalReports: { $sum: 1 }
        }
      }
    ]);
    // console.log(reportCounts);
    // Convert report counts into a map
    const reportMap = {};

    reportCounts.forEach((report) => {
      reportMap[report._id.toString()] = report.totalReports;
    });

    // Attach report count to each club
    const clubsWithReports = clubs.map((club) => ({
      ...club,
      totalReports: reportMap[club._id.toString()] || 0
    }));

    return res.status(200).json({
      message: "Clubs fetched successfully",
      clubs: clubsWithReports
    });

  } catch (error) {
    console.error("Get clubs error:", error);

    return res.status(500).json({
      message: "Unable to fetch clubs"
    });
  }
};