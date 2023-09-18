/**
 *
 * @param {File} file
 * @returns {Promise<String>} fileURL
 */
function loadFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) reject("No file");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener(
      "load",
      function () {
        const fileURL = reader.result;
        resolve(fileURL);
      },
      false
    );
    reader.addEventListener(
      "error",
      function (error) {
        reject(error);
      },
      false
    );
  });
}
onmessage = async function (e) {
  const file = e.data;
  const fileURL = await loadFile(file);
  postMessage(fileURL);
};
