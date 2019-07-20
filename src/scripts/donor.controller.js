const utils = require('./utils');
const User = require('./classes/User');
const Org = require('./classes/Org');
const auth = require('./auth');
const organization = require('./organization.controller');

function _render(req,res,pageConfig={}) {
	console.log('^^^^ rendering donor');
	let params = {
        template: pageConfig.template || 'internal/donor/donor',
        pageTitle: pageConfig.pageTitle || '',
        data: pageConfig.data || {}
	};
	utils.render(req,res,params);
}

function donorDetail({ req, res, donorBlockchain }) {

    // Get data from blockchain server
    utils.blockchainRequest('get','/donor',{
        donorID: req.params.donorID
    }).then(donorData => {

        let pageConfig = {};
        pageConfig.template = 'internal/donor/donorDetails';
        pageConfig.data = donorData;
        pageConfig.pageTitle = `${donorData.city}, ${donorData.country}`;
        _render(req,res,pageConfig);

    }).catch(err => {
        res.send(err);
    });
}

function listDonors({ req, res, donorBlockchain }) {

    // Get data from blockchain server
    utils.blockchainRequest('get','/donors').then(donors => {

        // Render Page
        const pageConfig = {
            template: "internal/donor/donorList",
            pageTitle: "Current Donor List",
            data: { donors: donors}
        };
        _render(req,res,pageConfig);

    }).catch(err => {
        res.send(err);
    });
} // end listDonors()

function newDonor({ req, res}) {

    // Render Page
    const pageConfig = {
        template: "internal/donor/donorNew",
        pageTitle: "New Donor Form"
    };
    _render(req,res,pageConfig);
} // end newDonor()


/**
 * OBSOLETE??  Handled in User and Org classes
 *
 * Adds a donor to the blockchain
 * @param {string} type - Type of donor: 'org' or 'user'
 * @param {object} donorData - Object containing the donor's data
 * @param {string=} donorData.name - for 'org': the name of the organization
 * @param {string=} donorData.fName - for 'user': the first name of the user
 * @param {string=} donorData.lName - for 'user': the last name of the user
 * @param {string=} donorData.email - for 'user': the email of the user
 * @param {string=} donorData.uid - for 'user': the uid of the user
 * @returns {Promise}
 */
/*function addDonor(type,donorData){

    let postData = {};
    postData.type = type;

    switch(type){
        case 'org':

            postData.name = donorData.name;
            postData.wallet_id = donorData.oid;

            break;
        case 'user':

            postData.fname = donorData.fName;
            postData.lname = donorData.lName;
            postData.email = donorData.email;
            postData.wallet_id = donorData.uid;

            break;
        default:
            return Promise.reject('Invalid donor type: ' + type);
    }

    return utils.blockchainRequest('get','/donor/new').then(donorID=>{
        return Promise.resolve(donorID);
    }).catch(err => {
        return Promise.reject(err);
    })
}*/


function initDonors() {

    // Init users
    let userInit = new Promise((resolve,reject)=>{
        auth.listUsers().then(userList => {

            // Iteration
            let userIt = Object.keys(userList).length;
            console.log(userIt + ' users to init.');

            userList.forEach(user => {
                let newUser = new User(user);
                newUser.createDonorEntry().then(()=>{

                    // Decrement counter, resolve if done
                    userIt--;
                    if(userIt === 0){
                        resolve('User donor init finished')
                    }
                }).catch(err=>{
                    reject(err);
                });
            });
        }).catch(err=>{
            reject(err);
        });
    });

    // Init orgs
    let orgInit = new Promise((resolve,reject)=>{
        organization.listOrgs().then(orgList => {

            // Iteration
            let orgIt = Object.keys(orgList).length;

            orgList.forEach(org => {

                let newOrg = new Org(org);
                newOrg.createDonorEntry().then(()=>{

                    // Decrement counter, resolve if done
                    orgIt--;
                    if(orgIt === 0){
                        resolve('Org donor init finished')
                    }
                }).catch(err=>{
                    reject(err);
                });
            });
        }).catch(err=>{
            reject(err);
        });
    });

    return Promise.all([
        userInit,
        orgInit
    ]).then(()=>{
        return Promise.resolve('Init donors done');
    }).catch(err => {
        return Promise.reject(err);
    });

}


module.exports = {
	render: _render,
    listDonors,
    donorDetail,
	newDonor,
    initDonors
};