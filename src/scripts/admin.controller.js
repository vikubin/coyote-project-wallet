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

}

function setupAll(req, res) {

    utils.blockchainRequest('get','/setup').then(()=>{
        render(req,res,{
            type: 'success',
            text: 'Blockchains have been setup with test data.'
        });
    }).catch(err => {
        render(req,res,{
            type: 'danger',
            text: err
        });
    });
}

module.exports = {
    render,
    setupAll
};