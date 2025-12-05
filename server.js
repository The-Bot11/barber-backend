const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// مبدئياً: بيانات تجريبية بدل قاعدة بيانات
let services = [
  { id: 1, name: "قص شعر", duration_minutes: 30, price: 20 },
  { id: 2, name: "لحية", duration_minutes: 20, price: 15 },
  { id: 3, name: "قص + لحية", duration_minutes: 45, price: 30 },
];

let appointments = [];

// جلب الخدمات
app.get("/api/services", (req, res) => {
  res.json(services);
});

// جلب المواعيد حسب اليوم
app.get("/api/appointments", (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "date مطلوب" });
  const list = appointments.filter((a) => a.date === date);
  res.json(list);
});

// إنشاء حجز جديد
app.post("/api/appointments", (req, res) => {
  const { customer_name, phone, service_id, date, time, note } = req.body;

  if (!customer_name || !phone || !service_id || !date || !time) {
    return res.status(400).json({ message: "الحقول الأساسية مطلوبة" });
  }

  // التحقق إن الوقت غير محجوز مسبقاً
  const exists = appointments.some(
    (a) => a.date === date && a.time === time && a.status !== "cancelled"
  );
  if (exists) {
    return res.status(400).json({ message: "الوقت هذا محجوز بالفعل" });
  }

  const newAppointment = {
    id: appointments.length + 1,
    customer_name,
    phone,
    service_id,
    date,
    time,
    note: note || "",
    status: "pending",
    created_at: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

// تغيير حالة الحجز (للإدمن)
app.put("/api/appointments/:id/status", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  const allowed = ["pending", "confirmed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "حالة غير صحيحة" });
  }

  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) {
    return res.status(404).json({ message: "الحجز غير موجود" });
  }

  appointment.status = status;
  res.json(appointment);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});