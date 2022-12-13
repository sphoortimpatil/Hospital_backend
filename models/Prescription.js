const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReadingSchema = new Schema({
	date: {
		type: String,
		required: true,
	},
	weight: {
		type: Number,
		required: false,
	},
	oxygen: {
		type: Number,
	},
	bloodPressure: {
		type: Number,
	},
	temperature: {
		type: Number,
	},
	impression: {
		type: String,
	},
	followUp: {
		type: String,
	},
});

const PrescriptionSchema = new Schema({
	doctorId: {
		type: String,
		required: true,
	},
	patientId: {
		type: String,
	},
	readings: ReadingSchema,
	prescribed: [],
});

const Readings = mongoose.model("Readings", ReadingSchema);
const Prescription = mongoose.model("PatientMedicines", PrescriptionSchema);

module.exports = {
	Readings,
	Prescription,
};
