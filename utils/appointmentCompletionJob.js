import Appointment from "../models/AppointmentSchema.js";

const DEFAULT_INTERVAL_MINUTES = 30;

let completionJobStarted = false;
let completionJobRunning = false;

const getAppointmentDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;

    const baseDate = new Date(dateValue);

    if (Number.isNaN(baseDate.getTime())) return null;

    const [hours, minutes] = timeValue.split(":");

    if (hours === undefined || minutes === undefined) return null;

    const appointmentDateTime = new Date(baseDate);
    appointmentDateTime.setHours(Number(hours), Number(minutes), 0, 0);

    if (Number.isNaN(appointmentDateTime.getTime())) return null;

    return appointmentDateTime;
};

const completePastAppointments = async () => {
    if (completionJobRunning) return;

    completionJobRunning = true;

    try {
        const now = new Date();

        const approvedAppointments = await Appointment.find({
            status: "approved",
        }).select("_id date time status");

        const appointmentsToComplete = approvedAppointments.filter((appointment) => {
            const appointmentDateTime = getAppointmentDateTime(
                appointment.date,
                appointment.time
            );

            if (!appointmentDateTime) return false;

            return appointmentDateTime <= now;
        });

        if (appointmentsToComplete.length === 0) {
            console.log("APPOINTMENT_COMPLETION_JOB: no appointments to complete");
            return;
        }

        const operations = appointmentsToComplete.map((appointment) => ({
            updateOne: {
                filter: {
                    _id: appointment._id,
                    status: "approved",
                },
                update: {
                    $set: {
                        status: "completed",
                    },
                },
            },
        }));

        await Appointment.bulkWrite(operations);

        console.log(
            `APPOINTMENT_COMPLETION_JOB: completed ${appointmentsToComplete.length} appointment(s)`
        );
    } catch (error) {
        console.error(
            "APPOINTMENT_COMPLETION_JOB_ERROR:",
            error?.message || error
        );
    } finally {
        completionJobRunning = false;
    }
};

export const startAppointmentCompletionJob = () => {
    if (completionJobStarted) {
        console.log("APPOINTMENT_COMPLETION_JOB: already started");
        return;
    }

    completionJobStarted = true;

    const intervalMinutes =
        Number(process.env.APPOINTMENT_COMPLETION_INTERVAL_MINUTES) ||
        DEFAULT_INTERVAL_MINUTES;

    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(
        `APPOINTMENT_COMPLETION_JOB: started, checking every ${intervalMinutes} minutes`
    );

    completePastAppointments();

    setInterval(() => {
        completePastAppointments();
    }, intervalMs);
};