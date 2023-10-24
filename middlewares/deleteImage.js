const fs = require("fs");

module.exports = async function deleteFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
    console.log(`File "${filePath}" has been deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file "${filePath}":`, error);
  }
};
