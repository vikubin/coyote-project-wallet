const utils = require('./utils');

function _render(req,res,pageData={}) {
	let params = {
		template: 'internal/resource/resource',
		pageData: pageData
	};
	utils.render(req,res,params);
}

function listResources({ req, res, resourceBlockchain}) {

    // Get data from blockchain server
    utils.blockchainRequest('get','/resources').then(resources => {

        let output = "";
        resources.forEach((resource) => {
            output += `title: ${resource.title}<br> desc: ${resource.description}<br>UNNumber: ${resource.UNNumber}<br><br>`;
        });
        res.send(`<b>resource list::</b><br>${output}<br><br><a href="/resource">Main resource page</a>`);

    }).catch(err => {
        res.send(err);
    });
}

function addInitialResources({ req, res }) {

    // Get data from blockchain server
    utils.blockchainRequest('get','/resources/addInitial').then(data => {

        // Redirect user (w/ 303) to the donor detail page of the newly created donor.
        res.redirect(303, `/resources/list`);

    }).catch(err => {
        res.send(err);
    });

} // end addInitialResources()

module.exports = {
	render: _render,
	listResources,
	addInitialResources
};
