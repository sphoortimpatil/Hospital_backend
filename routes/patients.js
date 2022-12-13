const express = require("express");
const router = express.Router();
const Patients = require("../models/Patients");
const { Readings } = require("../models/Prescription");
const checkAuth = require("../middlewares/check-auth");
const { Prescription } = require("../models/Prescription");

// router.get("/", async (req, res) => {
//   res.send("HIIIII");
// });

//get prescription
router.post("/patientdetails", checkAuth, async (req, res) => {
	try {
		const appointmentDetails = await Prescription.find({
			doctorId: req.body.doctorId,
			patientId: req.body.patientId,
		});
		res.status(200).json({ appointmentDetails });
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// get all patients
router.get("/all", checkAuth, async (req, res, next) => {
	try {
		const allPatients = await Patients.find({}).limit(1000);
		console.log(allPatients);
		res.status(200).json(allPatients);
	} catch (error) {
		res.status(500).json("An error occured");
	}
});

// get a Patient
router.get("/:id", checkAuth, async (req, res) => {
	try {
		const Patient = await Patients.findById(req.params.id);
		res.status(200).json(Patient);
	} catch (error) {
		res.status(500).json(error);
	}
});

//Create a Patient
router.post("/addpatient", checkAuth, async (req, res, next) => {
	console.log("HERE");
	try {
		var Patient = await new Patients({
			name: req.body.name,
			phone: req.body.phone,
			age: req.body.age,
			sex: req.body.sex || "Male",
		});
		await Patient.save()
			.then((r) => {
				// console.log("response", r);
				console.log("Patient Added", Patient);
				res.status(200).json(Patient);
			})
			.catch((e) => {
				console.log("error", e);
				res.status(401).json({ message: "Error Occured" });
			});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

//update patient
router.put("/:id", checkAuth, async (req, res) => {
	try {
		const patient = await Patients.findById(req.params.id);
		if (patient.patientId === req.body.patientId) {
			await patient.updateOne({ $set: req.body });
			res.status(200).json("post updated");
		} else {
			res.status(403).json("Only your posts can be edited");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

//Prescribing
router.post("/:id/prescribe", checkAuth, async (req, res, next) => {
	const readings = req.body["readings"];
	const medicines = req.body["prescribed"];

	console.log(req.body["prescribed"]);
	const Reading = new Readings({
		date: readings.date,
		bloodPressure: readings.bloodPressure,
		oxygen: readings.oxygen,
		temperature: readings.temperature,
		weight: readings.weight,
		impression: readings.impression,
		followUp: readings.followUp,
	});
	console.log(req.body["readings"].date);
	try {
		const DocPrescribed = await new Prescription({
			doctorId: req.body.doctorId,
			patientId: req.params.id,
			readings: Reading,
		});
		medicines.forEach((med) => {
			DocPrescribed.prescribed.push(med);
		});
		await DocPrescribed.save();
		res.status(200).json(DocPrescribed);
	} catch (error) {
		res.status(500).json({
			error: error,
			message: "An error occured",
		});
	}
});

module.exports = router;
