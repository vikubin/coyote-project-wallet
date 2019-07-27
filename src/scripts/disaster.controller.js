/**
 * @ToDo List:
 *
 * 1. Ability to mark a disaster as "over" (admin) and not display the disaster in this list
 * 2. Ability to list active and completed disasters separately
 *
 *
 *
 **/
const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	let params = {
		template: pageConfig.template || 'internal/disaster/disaster',
		pageTitle: pageConfig.pageTitle || '',
		data: pageConfig.data || {}
	};

	utils.render(req,res,params);
}

function disasterDetail({ req, res }) {

	// Get data from blockchain server
    Promise.all([
        utils.blockchainRequest('get','/disaster',{
            disasterID: req.params.disasterID
        }),
        getRequestedResources(req.params.disasterID),
        getDonations(req.params.disasterID)
    ]).then(disasterData => {

    	// Render Page
        let pageConfig = {};
        pageConfig.template = 'internal/disaster/disasterDetails';
        pageConfig.data = disasterData[0];
        pageConfig.data.requestedResources = disasterData[1];
        pageConfig.data.donations = disasterData[2];
        pageConfig.pageTitle = `${disasterData.city}, ${disasterData.country}`;
        _render(req,res,pageConfig);

    }).catch(err => {
        res.send(err);
    });
}

function listDisasters({ req, res }) {

    // Get data from blockchain server
    utils.blockchainRequest('get','/disasters').then(disasters => {

        // Render Page
        const pageConfig = {
            template: "internal/disaster/disasterList",
            pageTitle: "Current Natural Disaster List",
            data: { disasters: disasters}
        };
        _render(req,res,pageConfig);

    }).catch(err => {
        res.send(err);
    });
} // end listDisasters()

function addDisaster(req,res) {

	utils.blockchainRequest('post','/disaster/new',{
        type: req.body.type,
        owner: req.body.owner,
        creator: req.session.userData.uid,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        recipientName: req.body.recipientName,
        recipientAddressLine1: req.body.recipientAddressLine1,
        recipientAddressLine2: req.body.recipientAddressLine2,
        recipientCity: req.body.recipientCity,
        recipientState: req.body.recipientState,
        recipientPostalCode: req.body.recipientPostalCode,
        recipientCountry: req.body.recipientCountry,
        isActive: true
	}).then(disasterID => {
        res.redirect(`/disaster/requestResources/${disasterID}`);
	}).catch(err => {
		res.send(err);
	});
}

function newDisaster({req,res}) {

    // Render Page
    const pageConfig = {
        template: "internal/disaster/disasterNew",
        pageTitle: "New Disaster Form"
    };
    _render(req,res,pageConfig);
} // end newDisaster()

function addResourcesForm(req,res){
    // Render Page
    const pageConfig = {
        template: "internal/disaster/requestResources",
        pageTitle: "Add resources to disaster",
        data: {
            disasterID:req.params.disasterID
        }
    };
    _render(req,res,pageConfig);
}

function addResourcesSubmit(req,res) {
    let disasterID = req.params.disasterID;

    let resourceArray = [];
    for(let item in req.body){
        let itemNumber = parseInt(item.slice(0,1));

        if(resourceArray[itemNumber] === undefined){
            resourceArray[itemNumber] = {};
            resourceArray[itemNumber].disasterID = disasterID;
        }

        resourceArray[itemNumber][item.slice(1)] = req.body[item];
    }

    console.log('disaster: ', disasterID);
    console.log('ResourceArray: ',resourceArray);

    utils.blockchainRequest('post','/resources/new',{resources:resourceArray}).then(()=>{
        res.redirect('/disaster/detail/' + disasterID);
    }).catch(err => {
        res.send(err);
    });
}

function getRequestedResources(disasterID) {
    return utils.blockchainRequest('get','/resources/disaster/' + disasterID).then(resourceArray => {
        console.log('Resource Array: ', resourceArray);
        return Promise.resolve(resourceArray);
    }).catch(err => {
        return Promise.reject(err);
    });
}

function getDonations(disasterID) {
    return utils.blockchainRequest('get','/donations/disaster/' + disasterID).then(donationArray => {
        console.log('Donation Array: ', donationArray);
        return Promise.resolve(donationArray);
    }).catch(err => {
       return Promise.reject(err);
    });
}


module.exports = {
	render: _render,
	listDisasters,
	disasterDetail,
	addDisaster,
    newDisaster,
    addResourcesForm,
    addResourcesSubmit
};
