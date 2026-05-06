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

const getAllDoctors = (status, page = 1, limit = 10) => {
  const filter = { role: ROLES.DOCTOR };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  return Promise.all([
    User.find(filter).select('-password -refreshToken').skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]).then(([doctors, total]) => ({ doctors, total, page, pages: Math.ceil(total / limit) }));
};

const setDoctorStatus = async (doctorId, status) => {
  if (!Object.values(DOCTOR_STATUS).includes(status) || status === DOCTOR_STATUS.PENDING) {
    const err = new Error('Status must be verified or rejected');
    err.statusCode = 400;
    throw err;
  }

  const update = {
    status,
    verificationStatus: status === DOCTOR_STATUS.VERIFIED ? 'approved' : 'rejected',
    isVerified: status === DOCTOR_STATUS.VERIFIED,
  };

  const doctor = await User.findOneAndUpdate(
    { _id: doctorId, role: ROLES.DOCTOR },
    update,
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
