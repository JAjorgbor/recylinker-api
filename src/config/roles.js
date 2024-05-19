const allRoles = {
  manager: ['getPortalUsers', 'manageUsers', 'consoleUserInvite'],
  administrator: ['getPortalUsers', 'manageUsers', 'consoleUserInvite'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
