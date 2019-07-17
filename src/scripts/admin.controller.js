const utils = require('./utils');
const auth = require('./auth');

/**
 * Renders the Admin page
 * @param req
 * @param res
 */
function render(req,res) {

    // Render Page
    utils.render(req, res, {
        template:"admin",
        data: null
    });
}

module.exports = {
    render
};