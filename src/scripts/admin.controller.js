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

module.exports = {
    render
};