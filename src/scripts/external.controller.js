const utils = require('./utils');

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
            pageTile: "Donations",
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
            pageTile: "Donations",
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
        let params = {
            template: "external/register",
            pageTile: "Donations",
            pageData: pageData
        };
        utils.render(req,res,params,"external");
    }
};

module.exports = render;