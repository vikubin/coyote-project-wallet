const Cloudant = require('@cloudant/cloudant');
const cloudant = Cloudant({
    account:"ServiceId-3433c9c5-2f5e-46a5-8a60-f899ff657dac",
    key:"froldedsteatchadedintarn",
    password:"db24ed72b829a14c9b79c4847cb566d2f6e1e422",
    url:"https://a2777322-7e2f-4f00-88ff-5544d827c57f-bluemix.cloudant.com"
});
const orgDB = cloudant.db.use('organizations');
const uuidv4 = require('uuid/v4');
const Org = require('./classes/Org');

/**
 * List organizations
 * @returns {Promise<orgList>}
 */
function listOrgs() {
    return orgDB.list().then(r => {
        return Promise.resolve(r.rows);
    }).catch((err) => {
        return Promise.reject(err);
    });
}

/**
 * Creates a new organization
 * @param req
 * @param res
 */
function newOrg(req,res) {

    let orgData = {
        oid: uuidv4(),
        name: req.body.orgName,
        createdBy: req.session.userData.uid,
        admins: [req.session.userData.uid],
        members: [req.session.userData.uid]
    };

    let newOrg = new Org(orgData);
    newOrg.push().then(()=>{
        res.redirect('/organization/' + orgData.oid);
    }).catch(err => {
        res.send(err);
    });
}

module.exports = {
    newOrg,
    Org
};