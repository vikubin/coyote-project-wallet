const utils = require('./utils');
const organization = require('./organization.controller');
const auth = require('./auth');

/**
 * Renders the Admin page
 * @param req
 * @param res
 */
function render(req,res) {

    // Get data for page
    Promise.all([
        organization.listOrgs()
    ]).then(data => {

        let pageData = {
            orgList: data[0]
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