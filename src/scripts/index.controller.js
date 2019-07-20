const utils = require('./utils');

function _render(req,res,pageConfig={}) {

	// Get data
	Promise.all([
        utils.blockchainRequest('get','/disasters')
	]).then(pageData => {
		let disasters = pageData[0];

		// Render page
        let params = {
            template: 'index',
            data: {
                disasters:disasters,
				userName:req.session.userData.dName,
				organizations:req.session.userData.org
            }
        };
        utils.render(req,res,params);

	}).catch(err => {
		res.send(err);
	});

}

function setupAll(req, res) {

	utils.blockchainRequest('get','/setup').then(()=>{
        res.send('All set.  A disaster, donot, 6 resource, and one donation has been initialized.<br><br><a href="/">Home</a>');
    }).catch(err => {
        res.send(err);
    });
}

function getDisasters() {
    // Get data from blockchain server
    return utils.blockchainRequest('get','/disasters').then(disasters => {

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
}

module.exports = {
	render: _render,
	setupAll
};
