const axios = require('axios');
/**
 * function _render - renders a page
 *
 *	@param {Object} req - The express request object
 *	@param {Object} res - The express response object
 *	@param {Object} params - The parameters used to display the template
 *	@param {string} params.template - the name of the view to render 
 *	// depricated? @param {Object} params.context - The context / variables to pass to handlebars
 *
 *	Context Metadata
 *	@params {string} params.context.pageTitle - The title of the page
 *
 *
 *
 **/
_render = (req, res, params = {}) => {
	console.log('utils => rendering with params: ', params);
	// context is the dynamic data to use on the page
	const context = params.data || {};
	context.pageTitle = params.pageTitle || getPageTitle(params.template);
	res.render(params.template,context);

}; //end render()

blockchainRequest = (method, path = '', params = {}) => {
	console.log(`blockchainRequest(${method},${path},`,params,')');

	const host = 'localhost';
	const port = '3000';
	const blockchainPath = `http://${host}:${port}${path}`;

	switch (method){
		case 'get':
            return axios.get(blockchainPath,{
            	params: params
			}).then(response => {
				return Promise.resolve(response.data);
			}).catch(error => {
				return Promise.reject(error);
			});

		case 'post':
			return axios.post(blockchainPath,params).then(response => {
                return Promise.resolve(response.data);
            }).catch(error => {
                return Promise.reject(error);
            });

		default:
			return Promise.reject(Error('Invalid method: ' + method));
	}
};


/**
 * function getPageTitle - Returns the page title for given page
 *
 *	@param {string} template = The template being displayed.
 *
 *	@return {string} - Title of the page
 *
 **/
getPageTitle = template => {
	let pageTitles = {
		"404":  "Page Not Found"
	};

	let title = "Project Coyote";

	if(pageTitles[template]) {
		title = title + " | ${pageTitles[template]";
	}

	return title;
}; // end getPageTitle


module.exports = {
	render: _render,
    blockchainRequest
};


console.log(axios.get('http://localhost:3000/disasters?id=test'));
/*

blockchainRequest('get','/donors').then(r => {
	console.log(r);
}).catch(err => {
	console.error(err);
});*/
