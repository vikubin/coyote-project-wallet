// App
// Requires
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const path = require('path');

// Server-side scripts
const utils = require('./scripts/utils');
const auth = require('./scripts/auth');


app.set('views', __dirname + '/views');
app.set('view engine', 'html');


// Session Management
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MemcachedStore = require('connect-memjs')(session);

app.use(cookieParser());
app.use(session({
    secret: 'cdf12hm3t1aopf1q8dzasfm3e',
    key: 'coyote',
    proxy: 'true',
    store: new MemcachedStore({
        servers: ['memcached-13484.c14.us-east-1-3.ec2.cloud.redislabs.com:13484'],
        username: 'mc-Qmibs',
        password: 'spGkyRUqP6Q7Ig5dmMBOKjRO5IpBeOmz'
    })
}));


// Set up static styles directory
app.use(express.static(path.join(__dirname,'assets')));

// register handlebars
app.engine('html', exphbs( {
	extname: '.html',
	defaultView: 'index',
	defaultLayout: 'main',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials'
}));

// Page controllers
const external = require('./scripts/external.controller');
const index = require('./scripts/index.controller');
const disaster = require('./scripts/disaster.controller');
const donor = require('./scripts/donor.controller');
const resource = require('./scripts/resource.controller');
const donation = require('./scripts/donation.controller');
const errorPage = require('./scripts/errorPage.controller');


// Other variables needed
let pageData = {}; // data that will be passed to the page to display

// Parse Requests
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Log Requests
app.use((req,res,next)=>{
    console.log('==========================');
    console.log('______   Request   _______');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Body:', req.body);
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    console.log('==========================');
    next();
});

// External pages
app.get('/', (req,res) => {
	external.landing(req,res);
});

app.get('/login', (req,res) => {
    external.login(req,res);
});
app.post('/login', (req,res) => {
	auth.loginUser(req,res).then(userData=>{
        req.session.loggedIn = true;
        req.session.userData = userData;
        res.redirect(303, '/index');
    });
});

app.get('/register', (req,res) => {
    external.register(req,res);
});
app.post('/register', (req,res) => {
	auth.register(req,res);
});

// Log Requests
app.use((req,res,next)=>{
    console.log('__   Internal Request   __');
    console.log('Session Data:', req.session);
    console.log('==========================');
    next();
});

app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

/******************* Index Page */
app.get('/index', (req,res) => {
	index.render(req,res);
});

app.get('/setup', (req, res) => {
    index.setupAll(req,res);
});


/////////// ALl routes here need set up in their respective controllers
/******************* Disaster Routes */
// get page
// Disaster Actions
app.get('/disaster', (req,res) => {
	disaster.render(req,res,{});
});
// List Disasters
app.get('/disasters?/list', (req,res) => {
	disaster.listDisasters({ req, res });
});
// New Disaster Form
app.get('/disasters?/new', (req,res) => {
	disaster.newDisaster({ req, res});
});
// Disaster Details
app.get('/disasters?/detail/:disasterID', (req,res) => {
	disaster.disasterDetail({ req, res });
});

/** Disaster Admin */
// add
app.get('/api/blockchain/disaster/add', (req,res) => {

    console.log("'/api/blockchain/disaster/add' received data: ", req.query);

    disaster.addDisaster(req,res);
});



/******************* Donor Routes */
// get page
// Donor Actions
app.get('/donors?', (req,res) => {
	donor.render(req,res,pageData);
});
// List Donors
app.get('/donors?/list', (req,res) => {
    donor.listDonors({ req, res });
});
// New Donor form
app.get('/donors?/new', (req,res) => {
    donor.newDonor({ req, res});
});
// Donor Details
app.get('/donors?/detail/:donorID', (req,res) => {
    donor.donorDetail({ req, res });
});

/** Donor Admin */
// add
app.get('/api/blockchain/donor/add', (req,res) => {

    utils.blockchainRequest('post','/donor/new',{
        email: req.query.email,
        fname: req.query.fname,
        lname: req.query.lname,
        organization: req.query.organization
    }).then(donorID => {
    	res.redirect(`/donors/detail/${donorID}`);
    }).catch(err => {
        res.send(err);
    });
});


/******************* Resource Routes */
// get page
app.get('/resource', (req,res) => {
	resource.render(req,res,pageData);
});

// list resouces
app.get('/resources?/list', (req,res) => {
	resource.listResources({ req, res });
});

// add
app.get('/resource/addInitialResources', (req,res) => {
	resource.addInitialResources({ req, res });
});



/******************* Donation Routes */
// get page
app.get('/donation', (req,res) => {
	donation.render(req,res,pageData);
});

// add [TODO: change contents]
app.get('/donor/addDonation', (req,res) => {
	// get donor info from donor #1
	const donorBlockData = donorBlockchain.chain[1];
	const donor = donorBlockData.donors[0];

	// get disaster info from disaster #1
	const disasterBlockData = disasterBlockchain.chain[1];
	const disaster = disasterBlockData.disasters[0];


	const resources = [
		{
			UNNumber: "UN-WATER-001",
			Qty: 1000
		},

		{
			UNNumber: "UN-FOOD-001",
			Qty: 2000
		},
		{
			UNNumber: "UN-CLOTHING-001",
			Qty: 2500
		}
	];


	const donationObject = {
		dateTime: new Date(),
		disasterID: disaster.disasterID,
		donorID: donor.donorID,
		resources: resources,
		sendDate: null,
		arriveDate: null
	}

	donationBlockchain.addDonationToPendingDonations(donationBlockchain.createNewDonation(donationObject));
	donationBlockchain.mine();
	res.redirect(303, `/donations/list`);
});

// list
app.get('/donations?/list', (req,res) => {
	// list all donations
	const donationBlock = donationBlockchain.chain[1];
	const donations = donationBlock.donations;

	let output = "";

	donations.forEach((donation) =>{
		output += `(Disaster ID: ${donation.disasterID}<br>DOnor ID: ${donation.donorID}<br>Resources:<br>`;
		
		donation.resources.forEach((resource) => {
			output += `Quantity: ${resource.Qty} / UN Part number: ${resource.UNNumber}<br>`;
		});
		output += "<br><br>";
	});

	res.send(`<a href='/donation'>Donation Home</a><br><br>${output}`);
});

// List all donated resouces for a given disaster
app.get('/donations/list/:disasterID', (req,res) => {
	donation.listDonations({ req, res });
});

/******************* 404 error page */
app.get('*', (req,res) => {
	errorPage.render(req,res);
});



app.listen(8080, () => {console.log('Project Coyote Wallet listening on port 8080');});