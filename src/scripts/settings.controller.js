const utils = require('./utils');
const auth = require('./auth');

/**
 * Renders the settings page
 * @param req
 * @param res
 */
function render(req,res) {

    // Get data
    auth.fetchUser(req.session.userData.uid).then(userData=>{

        // Scrub password
        userData.pass = '******';

        // Render Page
        utils.render(req, res, {
            template:"settings",
            data: userData
        });

    }).catch(err=>{
        res.send(err);
    });
}

module.exports = {
    render
};