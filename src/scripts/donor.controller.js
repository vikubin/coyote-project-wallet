const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	console.log('^^^^ rendering donor');
	let params = {
        template: pageConfig.template || 'donor',
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
        pageConfig.template = 'donorDetails';
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
            template: "donorList",
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
        template: "donorNew",
        pageTitle: "New Donor Form"
    };
    _render(req,res,pageConfig);
} // end newDonor()


module.exports = {
	render: _render,
    listDonors,
    donorDetail,
	newDonor
};