const utils = require('./utils');

function _render(req,res,pageData={}) {
	let params = {
		template: "internal/donations/donation",
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
            template: "internal/donations/donationList",
            pageTitle: "Donations for this disaster",
            data: donationData
        };

        utils.render(req, res, pageConfig);

    }).catch(err => {
        res.send(err);
    });

} // end listDonations



function addDonationPage(req,res){

    console.log(req.query);
    if(req.query === {}){
        console.log('No specific request')
    }

    Promise.all([

    ]).then(donationData => {




    }).catch(err => {
        console.log(err);
    });


}

function addDonation(req,res){

    utils.blockchainRequest('post','donation/new',{

    })


}

module.exports = {
	render: _render,
	listDonations,
    addDonationPage,
    addDonation
};
