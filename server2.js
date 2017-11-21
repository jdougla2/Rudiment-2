const express = require('express');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');

const app = express();
var config = {
	host: 'localhost',
	user: 'workshop2',
	password: 'ru]:6jyt/?}MP5~Y',
	database: 'workshop2',
};

var pool = new Pool(config);

app.set('port', (8080));

app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));

//app.listen(8080);

app.get('/list-users', async (req, res) => {
	//console.log(req.body);
	var path = req.path;
	console.log("You are here ");
	var query = req.query.type;
	console.log(query);
	if(query === "summary") {
		try{
			var response = await pool.query('select firstname, lastname from users');
			var ary = [];
			for(var i = 0; i < response.rows.length; i++){
				var obj = response.rows[i];
				ary[i]= "{firstname: " + obj.firstname + ", lastname: " + obj.lastname + "}";
			}
			res.json({users:ary});
		} catch(e) {
			console.error('Error running query ' + e);
		}
	} else if(query === "full") {
	                try{
                        var response = await pool.query('select firstname, lastname, username, email from users');
                        var ary = [];
                        for(var i=0; i < response.rows.length; i++){
                                var obj = response.rows[i];
                                ary[i] = "{firstname: " + obj.firstname + ", lastname: " + obj.lastname + ", username: " + obj.username + ", email: " + obj.email + "}";
                        }
                        res.json({users: ary});
                } catch(e) {
                        console.error('Error running query ' + e);
                }
        }	
});

app.get('/list-workshops', async (req, res) => {
	console.log("we out here");
	try{
		console.log("as well as here");
		var response = await pool.query('select * from workshops');
		var ary = [];
		for(var i=0; i < response.rows.length; i++){
			var obj = response.rows[i];
			ary[i]= "{title: " + obj.title + ", date: " + obj.wsdate + ", location: " + obj.location + "}";
		}
		console.log("we also here");
		res.json({workshop: ary});
	} catch(e) {
		console.error('Error running query ' + e);
	}
});

app.get('/attendees', async (req, res) => {
	var title = req.query.title;
	var date = req.query.date;
	var locations = req.query.locations;
	try{
		var response = await pool.query('select users.firstname, users.lastname from users join username on users.username = enrolledusers.username where title = $1 and wsdate = $2 and location = $3', [title, date, locations]);
		var ary = [];
		for(var i=0; i < response.rows.length; i++){
			var obj = response.rows[i];
			ary[i]= "{firstname: " + obj.firstname + ", lastname: " + obj.lastname + "}";
		}
		res.json({workshop: ary});
	} catch(e) {
		console.error('Error running query ' + e);
	}
});

//let userlist = response.rows.map(function(row) {
// return row.attendees;
// }
// 	)

app.post('/create-user', async (req, res) => {
	var firstname = req.body.firstname;
	console.log(firstname);
	var lastname = req.body.lastname;
	var username = req.body.username;
	console.log(username);
	var email = req.body.email;
	try{
		var newUser = await pool.query('select * from users where username = $1', [username]);
		if(newUser.rows.length === 0) {
			newUser = await pool.query('insert into users (username, firstname, lastname, email) values ($1, $2, $3, $4)', [username, firstname, lastname, email]);
			res.json({status: 'user added'});
		} else {
			res.json({status: 'username taken'});
		}
	} catch(e) {
		console.error('Error running query ' + e);
	}					
});

app.post('/add-workshop', async(req, res) => {
	var title = req.body.title;
	var date = req.body.date;
	var wslocation = req.body.location;
	var maxseats = req.body.maxseats;
	var instructor = req.body.instructor;
	try{
		var newWorkshop = await pool.query('select * from workshops where title = $1 and wsdate = $2 and location = $3', [title, date, wslocation]);
		if(newWorkshop.rows.length === 0) {
			newWorkshop = await pool.query('insert into workshops values ($1, $2, $3, $4, $5)', [title, date, wslocation, maxseats, instructor]);
			res.json({status: 'workshop added'});
		} else {
			res.json({status: 'workshop already in database'});
		}
	} catch(e) {
		console.error('Error running query ' + e);
	}	
});

app.post('/enroll', async(req, res) => {
	var username = req.body.username;
	var title = req.body.title;
	var date = req.body.date;
	var location = req.body.location;

	try{
		var enroll1 = await pool.query('select * from users where username = $1', [username]);
		var enroll2 = await pool.query('select * from workshops where title = $1 and wsdate = $2 and location = $3', [title, date, location]);
		var enroll3 = await pool.query('select * from enrolledusers where title = $1 and wsdate = $2 and location = $3', [title, date, location]);
		var enroll4 = await pool.query('select maxseats from workshops where title = $1 and wsdate = $2 and location = $3', [title, date, location]);
		if(enroll1.rows.length === 0) {
			res.json({status: 'user does not exist'});
		} else if (enroll2.rows.length === 0) {
			res.json({status: 'workshop does not exist'});
		} else if (enroll3.rows.length >= enroll4){
			res.json({status: 'no seats available'});
		} else {
			var enrollee = await pool.query('insert into enrolledusers values ($1, $2, $3, $4)', [username, title, date, location]);
			res.json({status: 'user added'});
		}	
	}
});

app.delete('/delete-user', async(req, res) => {
	var username = req.query.username;
	try{
		//var response = await pool.query('select * from users where users = $1', [username]);
		/*if(response.rows.length === 0){
			res.json({status: 'not a valid user'});
		} else {*/
			var deleter = await pool.query('delete from users where username = $1', [username]);
			deleter = await pool.query('delete from enrolledusers where username = $1', [username]);
			res.json({status: 'deleted'});
		//}
	}catch(e) {
		console.error('Error running query ' + e);
	}
});

app.listen(app.get('port'), () => {
	console.log('Running');
})
