const utils = require('./utils');

function _render(req,res,pageData={}) {
	let params = {
		template: '404',
		pageData: pageData
	};
	utils.render(req,res,params);
}



module.exports = {
	render: _render
};