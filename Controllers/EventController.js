const EventModel = require("../Models/EventModel");
const RegisterEventModel = require("../Models/RegisterEvent");
exports.createEvent = async (req, res) => {
    const body = req.body;
    const file = req.file;
    const isValidDate = (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return false;
        }

        const date = new Date(`${value}T00:00:00Z`);

        return !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value;
    };
    if (
        !body.title ||
        !body.description ||
        !body.eventDate ||
        !body.startTime ||
        !body.endTime ||
        !body.venue ||
        !body.organizer ||
        !body.registrationDeadline ||
        !body.maxParticipants ||
        !body.createdBy ||
        !file
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    if (
        !isValidDate(body.eventDate) ||
        !isValidDate(body.registrationDeadline)
    ) {
        return res.status(400).json({
            message: "Please enter valid dates in YYYY-MM-DD format"
        });
    }
    try {
        const event = await EventModel.create({
            title: body.title,
            description: body.description,
            category: body.category,
            eventType: body.eventType,
            eventDate: body.eventDate,
            startTime: body.startTime,
            endTime: body.endTime,
            venue: body.venue,
            organizer: body.organizer,
            registrationDeadline: body.registrationDeadline,
            image: file
                ? `/events/${file.filename}`
                : null,
            maxParticipants: body.maxParticipants,
            createdBy: body.createdBy
        });

        return res.status(201).json({
            message: "Event Created Successfully",
            event: event
        });

    } catch (error) {

        console.error("EVENT ERROR:", error);

        return res.status(500).json({
            message: "Event creation failed",
            error: error.message
        });
    }
};


exports.allEvent = async (req, res) => {
    try {
        const events = await EventModel.find()
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Events fetched successfully",
            events: events
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Unable to fetch events",
            error: error.message
        });
    }
};


exports.deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Find event
        const event = await EventModel.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event Not Found"
            });
        }

        // 2. Allow deletion only if status is upcoming
        if (event.status === "upcoming") {

            await EventModel.findByIdAndDelete(id);

            return res.status(200).json({
                message: "Event Deleted Successfully"
            });

        } else {

            return res.status(400).json({
                message: "Unable to delete event. Only upcoming events can be deleted."
            });
        }

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};


exports.registerEvent = async (req, res) => {
    try {
        const { eventId, userId } = req.body;

        // 1. Validate input
        if (!eventId || !userId) {
            return res.status(400).json({
                message: "Event ID and User ID are required"
            });
        }

        // 2. Find event
        const event = await EventModel.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event Not Found"
            });
        }

        // 3. Check registration deadline exists
        if (!event.registrationDeadline) {
            return res.json({
                message: "Registration deadline is not available for this event"
            });
        }

        // 4. Check registration deadline
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = new Date(event.registrationDeadline);
        lastDate.setHours(0, 0, 0, 0);

        if (lastDate < today) {
            return res.json({
                message: "Registration deadline has expired. You cannot register."
            });
        }

        // 5. Check event status
        if (event.status !== "upcoming") {
            return res.json({
                message: "Registration is allowed only for upcoming events."
            });
        }

        // 6. Check maximum participants
        const totalRegister = await RegisterEventModel.countDocuments({
            eventId: eventId
        });

        if (
            event.maxParticipants &&
            totalRegister >= event.maxParticipants
        ) {
            return res.json({
                message: "Total Seats Filled Up. Registration is closed."
            });
        }

        // 7. Check duplicate registration
        const isRegister = await RegisterEventModel.findOne({
            eventId: eventId,
            userId: userId
        });

        if (isRegister) {
            return res.json({
                message: "You are already registered for this event."
            });
        }

        // 8. Register student
        await RegisterEventModel.create({
            eventId: eventId,
            userId: userId
        });

        return res.json({
            message: "Successfully registered for the event."
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};
