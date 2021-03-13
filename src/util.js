const is_prod = process.env.NODE_ENV === 'production';

// Pull git revision for display
const shell = require('shelljs');
let commit = '';
if (shell.which('git')) {
  commit = shell.exec('git rev-parse --short HEAD').stdout.trim();
}
const rev = commit || 'GitHub';
const gitUrl = `https://github.com/mxmeinhold/impeach/tree/${
  commit || 'master'
}`;

const getUser = (req) => {
  const { preferred_username, given_name, groups } = req.user._json;
  return {
    eboard: groups.some((group) => group.includes('eboard-')),
    profileImage: `https://profiles.csh.rit.edu/image/${preferred_username}`,
    name: `${given_name} (${preferred_username})`,
    is_prod: is_prod,
  };
};

module.exports = {
  getUser: getUser,
  rev: rev,
  gitUrl: gitUrl,
  is_prod: is_prod,
};
