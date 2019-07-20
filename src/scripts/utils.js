const axios = require('axios');
/**
 * function _render - renders a page
 *
 *	@param {Object} req - The express request object
 *	@param {Object} res - The express response object
 *	@param {object} params - The parameters used to display the template
 *	@param {string} params.template - the name of the view to render 
 *	@param {object} params.data - Data to feed to the page
 *	@param {string} layout - Layout to use. Defaults to 'main'.
 *
 *	Context Metadata
 *	@params {string} params.context.pageTitle - The title of the page
 *
 **/
_render = (req, res, params = {}, layout) => {
	console.log('utils => rendering with params: ', params);
	// context is the dynamic data to use on the page
	const context = params.data || {};
	context.pageTitle = params.pageTitle || getPageTitle(params.template);
	context.layout = layout || 'main';
	res.render(params.template,context);

}; //end render()

/**
 * Makes a request to the blockchain application
 * @param {String}  method  - Either 'post' or 'get'
 * @param {String}  path    - The rest of the path ex) '/disaster'
 * @param {Object}  params  - The parameters to pass with the request (query w/ get, body w/ post).
 * @returns {Promise<data>}
 */
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
 *	@return {string} - Title of the page
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

/**
 * Generates an option list from a {key:value,key:value} object.
 * @params {object} keyValObj - {key:value,key:value} object
 * @returns {string} - an HTML option list
 */
function generateOptionList(keyValObj) {
	let ids = Object.keys(keyValObj);

	let html = '';
	ids.forEach(id =>{
		html += `<option value="${id}" selected>${keyValObj[id]}</option>\n`;
	});

	return html;
}


module.exports = {
	render: _render,
    blockchainRequest,
	generateOptionList
};

/*

blockchainRequest('get','/donors').then(r => {
	console.log(r);
}).catch(err => {
	console.error(err);
});*/
