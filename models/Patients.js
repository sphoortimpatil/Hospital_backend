const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const patientSchema = new Schema({
	name: {
		type: String,
		maxlength: 255,
		required: true,
	},
	phone: {
		type: Number,
		required: true,
		unique: true,
	},
	age: {
		type: Number,
		max: 110,
	},
	sex: {
		type: String,
	},
});

module.exports = mongoose.model("Patients", patientSchema);
