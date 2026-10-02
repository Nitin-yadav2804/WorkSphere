// Both task forms accept populated memberships or a list of user documents.
export const normalizeMembers = (members) => {
  const workspaceMembers = Array.isArray(members) ? members : [];
  return workspaceMembers
    .map((member) => {
      if (member?.user && typeof member.user === "object") {
        return { ...member, user: member.user };
      }
      if (member?._id && member?.name) {
        return { user: member };
      }
      return null;
    })
    .filter((member) => member?.user?._id);
};
