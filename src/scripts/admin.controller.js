const utils = require('./utils');
const organization = require('./organization.controller');
const auth = require('./auth');

/**
 * Renders the Admin page
 * @param req
 * @param res
 * @param {object=} alertMessage - Message to display at top of page
 * @param {string=} alertMessage.text - Text inside alert message
 * @param {string=} alertMessage.type - 'primary'=Status(blue) 'success'=Good(green) 'danger'=Error(bad)
 */
function render(req,res,alertMessage) {
    let alertShow = (alertMessage !== undefined);
    let alertType = '';
    let alertText = '';
    if(alertShow){
        alertType = alertMessage.type;
        alertText = alertMessage.text;
    }

    console.log(req.path);

    switch (req.path){
        case '/admin':

            // Get data for page
            Promise.all([
                organization.listOrgs()
            ]).then(data => {

                let pageData = {
                    orgList: data[0],
                    alertShow:alertShow,
                    alertType:alertType,
                    alertText:alertText
                };

                // Render Page
                utils.render(req, res, {
                    template:"internal/admin/admin",
                    data: pageData
                });

            }).catch(err => {
                res.send(err);
            });
            break;
        case '/admin/plainBlockchains':

            // Get data for page
            Promise.all([
                utils.blockchainRequest('get','/blockchain/all')
            ]).then(data => {

                res.json(data[0]);

/*                let pageData = {
                    disasterBlockchain: JSON.stringify(data[0].disasterBlockchain, null, 2),
                    donationBlockchain: JSON.stringify(data[0].donationBlockchain, null, 2),
                    resourceBlockchain: JSON.stringify(data[0].resourceBlockchain, null, 2),
                    donorBlockchain: JSON.stringify(data[0].donorBlockchain, null, 2),
                    alertShow:alertShow,
                    alertType:alertType,
                    alertText:alertText
                };

                // Render Page
                utils.render(req, res, {
                    template:"internal/admin/plainBlockchains",
                    data: pageData
                });*/

            }).catch(err => {
                res.send(err);
            });
            break;
        default:
            res.send(Error('Invalid admin path'));

    }
}

module.exports = {
    render
};