const is_prod = process.env.NODE_ENV === 'production';

// Pull git revision for display
const git = require('git-rev');
let rev = 'GitHub';
let gitUrl = 'https://github.com/mxmeinhold/impeach';
git.short((commit) => {
  if (commit) {
    gitUrl = gitUrl + '/tree/' + commit;
    rev = commit;
  }
});

const getUser = (req) => {
  const { preferred_username, given_name, groups } = req.user._json;
  return {
    eboard: groups.includes('eboard'),
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
