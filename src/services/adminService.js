const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { ROLES, DOCTOR_STATUS } = require('../constants/roles');

const getAdminDashboard = async () => {
  const [totalPatients, totalDoctors, pendingDoctors, totalAppointments] = await Promise.all([
    User.countDocuments({ role: ROLES.PATIENT }),
    User.countDocuments({ role: ROLES.DOCTOR, status: DOCTOR_STATUS.VERIFIED }),
    User.countDocuments({ role: ROLES.DOCTOR, status: DOCTOR_STATUS.PENDING }),
    Appointment.countDocuments(),
  ]);
  return { totalPatients, totalDoctors, pendingDoctors, totalAppointments };
};

const getAllDoctors = (status) => {
  const filter = { role: ROLES.DOCTOR };
  if (status) filter.status = status;
  return User.find(filter).select('-password -refreshToken');
};

const setDoctorStatus = async (doctorId, status) => {
  if (!Object.values(DOCTOR_STATUS).includes(status) || status === DOCTOR_STATUS.PENDING) {
    const err = new Error('Status must be verified or rejected');
    err.statusCode = 400;
    throw err;
  }

  const doctor = await User.findOneAndUpdate(
    { _id: doctorId, role: ROLES.DOCTOR },
    { status },
    { new: true }
  ).select('-password -refreshToken');

  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }

  return doctor;
};

module.exports = { getAdminDashboard, getAllDoctors, setDoctorStatus };
