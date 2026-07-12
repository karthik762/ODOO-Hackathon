/**
 * Health Check Controller
 * Returns the status of the AssetFlow backend server.
 */
export const getHealth = (req, res) => {
  res.json({
    success: true,
    message: "AssetFlow Backend Running"
  });
};
