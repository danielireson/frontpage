export const logInfo = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.info(data);
  }
};

export const logError = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(data);
  }
};

export default {
  logInfo,
  logError,
};
