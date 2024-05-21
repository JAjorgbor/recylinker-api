const allRoles = {
  manager: ['getPortalUsers', 'getPortalAgencies', 'manageUsers', 'consoleUserInvite'],
  administrator: ['getPortalUsers', 'getPortalAgencies', 'manageUsers', 'consoleUserInvite'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
