let currentId = 0;

const nextId = () => {
  currentId += 1;
  return currentId;
};

export default nextId;
