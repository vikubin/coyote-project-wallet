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
		template: pageConfig.template || 'disaster',
		pageTitle: pageConfig.pageTitle || '',
		data: pageConfig.data || {}
	};

	utils.render(req,res,params);
}

function disasterDetail({ req, res }) {

	// Get data from blockchain server
    utils.blockchainRequest('get','/disaster',{
    	disasterID: req.params.disasterID
    }).then(disasterData => {

    	// Render Page
        let pageConfig = {};
        pageConfig.template = 'disasterDetails';
        pageConfig.data = disasterData;
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
            template: "disasterList",
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
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        city: req.query.city,
        state: req.query.state,
        country: req.query.country,
        type: req.query.type,
        description: req.query.description
	}).then(disasterID => {
        res.redirect(303, `/disaster/detail/${disasterID}`);
	}).catch(err => {
		res.send(err);
	});


}

function newDisaster({ req, res}) {

    // Render Page
    const pageConfig = {
        template: "disasterNew",
        pageTitle: "New Disaster Form"
    };
    _render(req,res,pageConfig);
} // end newDisaster()

module.exports = {
	render: _render,
	listDisasters,
	disasterDetail,
	addDisaster,
    newDisaster
};
