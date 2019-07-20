// App

// Requires
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');

// Server-side scripts
const utils = require('./scripts/utils');
const auth = require('./scripts/auth');

// Page controllers
const external = require('./scripts/external.controller');
const index = require('./scripts/index.controller');
const disaster = require('./scripts/disaster.controller');
const donor = require('./scripts/donor.controller');
const resource = require('./scripts/resource.controller');
const donation = require('./scripts/donation.controller');
const errorPage = require('./scripts/errorPage.controller');
const organization = require('./scripts/organization.controller');
const settings = require('./scripts/settings.controller');
const admin = require('./scripts/admin.controller');



// Static Content
app.use('/s',express.static('./src/static'));

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

// Handlebars
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', exphbs( {
	extname: '.html',
	defaultView: 'index',
	defaultLayout: 'main',
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials'
}));

// Other variables needed
let pageData = {};  // data that will be passed to the page to display



// External pages
app.get('/', (req,res) => {
	external.landing(req,res);
});

// Login page and submission
app.get('/login', (req,res) => {
    if(req.session.loggedIn !== true){
        external.login(req,res);
    }else{
        res.redirect('/index');
    }
});
app.post('/login', (req,res) => {
	auth.loginUser(req.body.email, req.body.pass, req).then(()=>{
        res.redirect(303, '/index');
    }).catch(err => {
        res.send(err);
    });
});

// Registration page and submission
app.get('/register', (req,res) => {
    external.register(req,res);
});
app.post('/register', (req,res) => {
	auth.register(req,res);
});

// Authenticate Further Requests
app.use((req,res,next)=>{
    console.log('__   Internal Request   __');
    console.log('Session Data:', req.session);
    console.log('==========================');
    if(req.session.loggedIn !== true){
    	res.redirect('/login');
	}else{
        next();
	}
});

// Logout request
app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

// Index Page
app.get('/index', (req,res) => {
	index.render(req,res);
});

// Setup all blockchains TODO: Remove from PROD
app.get('/setup', (req, res) => {
    index.setupAll(req,res);
});


// Disaster Page
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
// Add Disaster
app.get('/api/blockchain/disaster/add', (req,res) => {
    console.log("'/api/blockchain/disaster/add' received data: ", req.query);
    disaster.addDisaster(req,res);
});


// Donor Page
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
// Add Donor
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


// Resource Page
app.get('/resource', (req,res) => {
	resource.render(req,res,pageData);
});
// List Resources
app.get('/resources?/list', (req,res) => {
	resource.listResources({ req, res });
});
// Add Resources
app.get('/resource/addInitialResources', (req,res) => {
	resource.addInitialResources({ req, res });
});


// Donation Page
app.get('/donation', (req,res) => {
	donation.render(req,res,pageData);
});
// Add Donation
app.get('/donor/addDonation', (req,res) => {

    // TODO: Modify this to work with the split app

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
	};

	donationBlockchain.addDonationToPendingDonations(donationBlockchain.createNewDonation(donationObject));
	donationBlockchain.mine();
	res.redirect(303, `/donations/list`);
});
// List Donations
/*app.get('/donations?/list', (req,res) => {
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
});*/ // Obsolete?
// List all donated resouces for a given disaster
app.get('/donations/list/:disasterID', (req,res) => {
	donation.listDonations({ req, res });
});


// Organization API
app.get('/organization/:oid/join', (req,res) => {
    organization.member.add(req.params.oid,req.session.userData.uid).then(()=>{
    	res.redirect('/organization/' + req.params.oid);
	}).catch(err=>{
		res.send(err);
	});
});
app.get('/organization/:oid/leave', (req,res) => {
    organization.member.remove(req.params.oid,req.session.userData.uid).then(()=>{
    	res.redirect('/organization/' + req.params.oid);
	}).catch(err=>{
		res.send(err);
	});
});
app.get('/organization/:oid/delete', (req,res) => {
    organization.deleteOrg(req.params.oid).then(()=>{
    	res.redirect('/admin');
	}).catch(err=>{
		res.send(err);
	});
});

// Create a new organization form
app.get('/organizations?/new', (req,res) => {
	organization.render.creationForm(req,res);
});
app.post('/organizations?/new', (req,res) => {
    organization.newOrg(req,res);
});

app.get('/organization/:orgID', (req,res) => {
    organization.render.organization(req,res,req.params.orgID);
});


// Account Settings
app.get('/settings', (req,res) => {
	settings.render(req,res);
});

// Admin Page
app.get('/admin', (req,res) => {
    admin.render(req,res);
});
app.get('/admin/initDonors',(req,res)=>{
	donor.initDonors().then(()=>{
        admin.render(req,res,{
        	type: 'success',
			text: 'Donor blockchain initialized with data from DB.'
		});
	}).catch(err=>{
        admin.render(req,res,{
            type: 'danger',
            text: err
        });
	})
});


// 404 Error
app.get('*', (req,res) => {
	errorPage.render(req,res);
});



app.listen(8080, () => {console.log('Project Coyote Wallet listening on port 8080');});