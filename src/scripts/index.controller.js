const utils = require('./utils');

function _render(req,res,pageConfig={}) {
	let params = {
		template: 'index',
		data: {}
	};
	utils.render(req,res,params);
}

function setupAll(req, res) {

	utils.blockchainRequest('get','/setup').then(()=>{
        res.send('All set.  A disaster, donot, 6 resource, and one donation has been initialized.<br><br><a href="/">Home</a>');
    }).catch(err => {
        res.send(err);
    });

    }

module.exports = {
	render: _render,
	setupAll
};
