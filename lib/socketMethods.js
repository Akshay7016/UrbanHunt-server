export let onlineUser = [];

export const addUser = (userId, socketId) => {
  const isUserExists = onlineUser.find((user) => user.userId === userId);

  if (!isUserExists) {
    onlineUser.push({ userId, socketId });
  }
};

export const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

export const getUser = (userId) =>
  onlineUser.find((user) => user.userId === userId);
