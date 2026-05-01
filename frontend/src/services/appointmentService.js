import api from "./api";

const APPT_PREFIXES = [
  "/api/appointments",    // preferred
  "/appointments"         // legacy mount
];

const postFirst = async (paths, segment, body) => {
  for (const p of paths) {
    try {
      const { data } = await api.post(`${p}${segment}`, body);
      return data;
    } catch (e) {}
  }
  throw new Error("All appointment endpoints failed");
};

const getFirst = async (paths, segment) => {
  for (const p of paths) {
    try {
      const { data } = await api.get(`${p}${segment}`);
      return data;
    } catch (e) {}
  }
  throw new Error("All appointment endpoints failed");
};

const delFirst = async (paths, segment) => {
  for (const p of paths) {
    try {
      const { data } = await api.delete(`${p}${segment}`);
      return data;
    } catch (e) {}
  }
  throw new Error("All appointment endpoints failed");
};

const putFirst = async (paths, segment, body) => {
  for (const p of paths) {
    try {
      const { data } = await api.put(`${p}${segment}`, body);
      return data;
    } catch (e) {}
  }
  throw new Error("All appointment endpoints failed");
};

export const bookAppointment = async ({ doctorId, doctorProfileId, date, time, reason }) => {
  // preferred body: doctor (profile id), date, time, reason
  const payload = { doctor: doctorProfileId || doctorId, date, time, reason };
  // RESTful: POST /api/appointments or legacy /appointments/createAppointment
  try {
    return await postFirst(APPT_PREFIXES, "", payload);
  } catch {
    const { data } = await api.post(`/appointments/createAppointment`, payload);
    return data;
  }
};

export const getMyAppointments = async () => {
  try {
    return await getFirst(APPT_PREFIXES, "/my");
  } catch {
    const { data } = await api.get(`/appointments/myAppointments`);
    return data;
  }
};

export const cancelAppointment = async (id) => {
  try {
    return await delFirst(APPT_PREFIXES, `/${id}`);
  } catch {
    const { data } = await api.post(`/appointments/deleteAppointment/${id}`);
    return data;
  }
};

export const doctorApprove = async (id) => {
  return await putFirst(APPT_PREFIXES, `/doctor/appointments/${id}/approve`, {});
};

export const doctorReject = async (id) => {
  return await putFirst(APPT_PREFIXES, `/doctor/appointments/${id}/reject`, {});
};

export const doctorAppointments = async () => {
  try {
    return await getFirst(APPT_PREFIXES, `/doctor/appointments`);
  } catch {
    const { data } = await api.get(`/appointments/doctor`);
    return data;
  }
};
