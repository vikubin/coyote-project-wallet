const utils = require('./utils');
const organization = require('./organization.controller');

function _render(req,res,pageConfig={}) {

    function organizationData(orgArray){
        let i = orgArray.length;
        let returnArray = [];

        return new Promise((resolve, reject) => {
            orgArray.forEach(org => {
                organization.getOrgName(org).then(orgName => {

                    returnArray.push({
                        oid:org,
                        name:orgName
                    });

                    i--;
                    if(i === 0){
                        resolve(returnArray);
                    }
                }).catch(err => {
                    reject([{oid:'none',name:err}]);
                });
            });
        });

    }


	// Get data
	Promise.all([
        utils.blockchainRequest('get','/disasters'),
        organizationData(req.session.userData.org)
	]).then(pageData => {
		let disasters = pageData[0];
		console.log(pageData[1]);

		// Render page
        let params = {
            template: 'index',
            data: {
                disasters:disasters,
				userName:req.session.userData.dName,
				organizations:pageData[1]
            }
        };
        utils.render(req,res,params);

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
	render: _render
};
