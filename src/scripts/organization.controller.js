const utils = require('./utils');
const orgs = require('./orgs');

const render = {
    /**
     * Renders the page of an organization
     * @param {object} req
     * @param {object} res
     * @param {string} orgID
     */
    organization(req,res,orgID) {

        // Get data
        let org = new orgs.Org();
        org.get(orgID).then(()=>{

            // Render Page
            utils.render(req, res, {
                template:"organization",
                data: org
            });

        }).catch(err=>{
            res.send(err);
        });
    },
    /**
     * Renders the form used to create an organization
     * @param {object} req
     * @param {object} res
     */
    creationForm(req,res){
        utils.render(req,res,{template:'organizationNew'});
    }
};




module.exports = {render};