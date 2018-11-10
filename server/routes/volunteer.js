'use strict';

let express = require('express');
let auth = require('../middleware/auth');
let volunteerRouter = express.Router();
let Volunteer = require('../models/volunteer');
let Schedule = require('../models/schedule');

// authentication middleware
volunteerRouter.use((req, res, next) => {
	auth.authenticate(req, res, next, 'volunteer');
});

/*
	GET /volunteer
	response: view with variables { user (username) }
*/
volunteerRouter.get('/', (req, res) => {
	console.log('GET /volunteer');
	res.render('volunteerHome.ejs', {
		user: req.user
	});
});

/*
	GET /volunteer/details
	response: json { success (boolean), name, email, username }
*/
volunteerRouter.get('/details', (req, res) => {
	console.log('GET /volunteer/details');
	Volunteer.findOne({
		username: req.user.username
	}, (err, volunteer) => {
		if (err) throw err;
		if (volunteer == null) return res.json({
			success: false
		});
		res.json({
			success: true,
			name: volunteer.name,
			email: volunteer.email,
			username: volunteer.username,
			classPref: volunteer.classPref,
			subjectPref: volunteer.subjectPref,
			daysPref: volunteer.daysPref
		});
	});
});

/*
	GET /volunteer/schedules/all, /volunteer/schedules/preferred
	response: json { name, workDescription, class, days, subject, optedFor }
*/
volunteerRouter.get('/schedules/:type', (req, res) => {
	console.log('GET /volunteer/schedules');
	if (req.params.type == "all") {
		Schedule.find().populate('volunteersOpted').exec((err, schedules) => {
			if (err) throw err;
			let finalSchedules = [];
			schedules.forEach((schedule) => {
				let optedFor = false;
				for (let i = 0; i < schedule.volunteersOpted.length; i++) {
					if (schedule.volunteersOpted[i].username == req.user.username) {
						optedFor = true;
						break;
					}
				}
				let sched = schedule.toObject();
				delete sched.volunteersOpted;
				sched.optedFor = optedFor;
				finalSchedules.push(sched);
			});
			res.json(finalSchedules);
		});
	} else if (req.params.type == "preferred") {
		Volunteer.findOne({
			username: req.user.username
		}, (err, volunteer) => {
			if (err || !volunteer) throw err;
			Schedule.find({
				class: volunteer.classPref,
				subject: volunteer.subjectPref,
				days: volunteer.daysPref
			}, (err, schedules) => {
				if (err) throw err;
				let finalSchedules = [];
				schedules.forEach((schedule) => {
					let optedFor = false;
					for (let i = 0; i < schedule.volunteersOpted.length; i++) {
						if (schedule.volunteersOpted[i].username == req.user.username) {
							optedFor = true;
							break;
						}
					}
					let sched = schedule.toObject();
					delete sched.volunteersOpted;
					sched.optedFor = optedFor;
					finalSchedules.push(sched);
				});
				res.json(finalSchedules);
			});
		});
	}
});

module.exports = volunteerRouter;