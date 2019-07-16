const utils = require('./utils');

const render = {
    landing(req,res,pageData = {}){
        let params = {
            layout: "external",
            template: "external/landing",
            pageTile: "Donations",
            pageData: pageData
        };
        utils.render(req,res,params);
    },
    login(req,res,pageData = {}){
        let params = {
            layout: "external",
            template: "external/login",
            pageTile: "Donations",
            pageData: pageData
        };
        utils.render(req,res,params);
    },
    register(req,res,pageData = {}){
        let params = {
            layout: "external",
            template: "external/register",
            pageTile: "Donations",
            pageData: pageData
        };
        utils.render(req,res,params);
    }
};

module.exports = render;