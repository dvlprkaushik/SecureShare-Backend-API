export const keepAlive = () => {
  setInterval(() => {
    fetch("https://secureshare-backend-api.onrender.com/")
      .then(() => {
        console.log("Alive");
      })
      .catch((err) => console.log("⚠ Ping failed:", err.message));
  }, 14.5 * 60 * 1000);
};
