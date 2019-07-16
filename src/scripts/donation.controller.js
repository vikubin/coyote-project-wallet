const utils = require('./utils');

function _render(req,res,pageData={}) {
	let params = {
		template: "donation",
		pageTile: "Donations"
	};
	utils.render(req,res,params);
}


function listDonations({ req, res, donationBlockchain, resourceBlockchain, donorBlockchain, disasterBlockchain }) {
	// get the disaster name
    // Get data from blockchain server
    utils.blockchainRequest('get','/donations',{
        disasterID: req.params.disasterID
    }).then(donationData => {

        console.log('allDonations: ',donationData.allDonations);

        const pageConfig = {
            template: "listDonations",
            pageTitle: "Donations for this disaster",
            data: donationData
        };

        utils.render(req, res, pageConfig);

    }).catch(err => {
        res.send(err);
    });

} // end listDonations


module.exports = {
	render: _render,
	listDonations
};
