const utils = require('./utils');
const organization = require('./organization.controller');

const render = {
    /**
     * Renders the landing page
     * @param {object} req
     * @param {object} res
     * @param {object} pageData
     */
    landing(req,res,pageData = {}){
        let params = {
            template: "external/landing",
            pageTile: "Project Coyote",
            pageData: pageData
        };
        utils.render(req,res,params,"external");
    },
    /**
     * Renders the login page
     * @param {object} req
     * @param {object} res
     * @param {object} pageData
     */
    login(req,res,pageData = {}){
        let params = {
            template: "external/login",
            pageTile: "Login",
            pageData: pageData
        };

        utils.render(req,res,params,"external");
    },
    /**
     * Renders the register page
     * @param {object} req
     * @param {object} res
     * @param {object} pageData
     */
    register(req,res,pageData = {}){

        organization.listOrgs('idName').then(orgList => {

            pageData.orgList = utils.generateOptionList(orgList);

            let params = {
                template: "external/register",
                pageTile: "Register",
                data: pageData
            };
            utils.render(req,res,params,"external");

        });
    }
};

module.exports = render;