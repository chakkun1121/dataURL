async function viewFile() {
  const file = document.querySelector("input[type=file]").files[0];
  output.innerHTML = "処理中、そのままお待ち下さい。";
  const worker = new Worker("webWorker.js");
  worker.postMessage(file);
  const fileURL = await new Promise((resolve) => {
    worker.onmessage = function (e) {
      const fileURL = e.data;
      resolve(fileURL);
    };
  });
  output.innerHTML = fileURL;
  return;
}

function open() {
  location.href(fileURL);
}
