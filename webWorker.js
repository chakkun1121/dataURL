// webWorker.js
self.onmessage = function (e) {
  const file = e.data;
  const reader = new FileReader();

  reader.onload = function (event) {
    // 読み込み成功時にメインスレッドに結果を返す
    self.postMessage(event.target.result);
  };

  reader.onerror = function (event) {
    // エラー情報をメインスレッドに送ることも検討可能
    console.error("FileReader error:", event.target.error);
    // エラーをpostMessageで送る場合:
    // self.postMessage({ error: event.target.error.message });
    // 現在の実装ではメインスレッドの worker.onerror でキャッチする
    throw event.target.error; // エラーを発生させて worker.onerror をトリガー
  };

  // ファイルをDataURLとして読み込む
  reader.readAsDataURL(file);
};
