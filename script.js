// グローバルスコープで要素を取得
const inputElement = document.getElementById("input");
const outputElement = document.getElementById("output");
const errorElement = document.getElementById("error");
const fileInfoElement = document.getElementById("file-info");
const copyButton = document.getElementById("copy-button");
const loadingIndicator = document.getElementById("loading-indicator");
const dropZone = document.getElementById("drop-zone");

// --- イベントリスナーの設定 ---

// ファイル選択が変更されたときの処理
inputElement.addEventListener("change", handleFileSelect);

// ドラッグ＆ドロップのイベントリスナー
dropZone.addEventListener("dragover", handleDragOver);
dropZone.addEventListener("dragleave", handleDragLeave);
dropZone.addEventListener("drop", handleDrop);
// ファイル選択のラベルクリックで input をトリガー (label forがあるので基本不要だが念のため)
// dropZone.addEventListener("click", () => inputElement.click()); // HTMLのlabelで実現

// --- 関数定義 ---

// ファイルが選択されたときのハンドラ (input変更 or ドロップ)
function handleFileSelect(event) {
  // inputからの選択か、ドロップイベントかを判定
  const file = event.target.files
    ? event.target.files[0]
    : event.dataTransfer.files[0];
  if (file) {
    processFile(file);
  }
}

// ファイル処理のメイン関数
async function processFile(file) {
  // UIリセット
  errorElement.textContent = "";
  outputElement.value = ""; // textareaなのでvalueを使う
  copyButton.classList.add("hidden");
  loadingIndicator.classList.remove("hidden"); // スピナー表示
  fileInfoElement.textContent = `処理中: ${file.name} (${formatBytes(
    file.size
  )})`;

  try {
    const worker = new Worker("webWorker.js");

    // Web Workerからのメッセージ受信
    const fileURL = await new Promise((resolve, reject) => {
      worker.onmessage = function (e) {
        resolve(e.data);
        worker.terminate(); // 処理が終わったらWorkerを終了
      };
      // Web Workerのエラーハンドリング
      worker.onerror = function (e) {
        console.error("Web Worker Error:", e);
        reject(
          new Error(`ファイルの処理中にエラーが発生しました: ${e.message}`)
        );
        worker.terminate(); // エラー時もWorkerを終了
      };

      // Web Workerにファイルを送信
      worker.postMessage(file);
    });

    outputElement.value = fileURL; // 結果をtextareaに表示
    copyButton.classList.remove("hidden"); // コピーボタン表示
    fileInfoElement.textContent = `完了: ${file.name} (${formatBytes(
      file.size
    )})`;
  } catch (e) {
    console.error("Error processing file:", e);
    errorElement.textContent =
      e.message || "ファイルの処理中に不明なエラーが発生しました。";
    fileInfoElement.textContent = `エラー: ${file.name}`;
  } finally {
    loadingIndicator.classList.add("hidden"); // スピナー非表示
    // input要素の値をリセットして、同じファイルを再度選択できるようにする
    inputElement.value = "";
  }
}

// 結果をクリップボードにコピーする関数
function copyResult() {
  if (!outputElement.value) {
    alert("コピーする内容がありません。");
    return;
  }
  navigator.clipboard
    .writeText(outputElement.value)
    .then(() => {
      // コピー成功時のフィードバック（任意）
      const originalText = copyButton.textContent;
      copyButton.textContent = "コピーしました!";
      copyButton.classList.add("bg-green-500", "hover:bg-green-600");
      copyButton.classList.remove("bg-blue-500", "hover:bg-blue-600");
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.classList.remove("bg-green-500", "hover:bg-green-600");
        copyButton.classList.add("bg-blue-500", "hover:bg-blue-600");
      }, 1500); // 1.5秒後に元に戻す
    })
    .catch(err => {
      console.error("コピーに失敗しました: ", err);
      alert("クリップボードへのコピーに失敗しました。");
    });
}

// ドラッグオーバー時の処理
function handleDragOver(event) {
  event.preventDefault(); // デフォルトの動作（ファイルを開くなど）をキャンセル
  event.stopPropagation();
  dropZone.classList.add("drag-over"); // UI: ドラッグ中のスタイル適用
}

// ドラッグがエリア外に出たときの処理
function handleDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  dropZone.classList.remove("drag-over"); // UI: スタイル解除
}

// ドロップ時の処理
function handleDrop(event) {
  event.preventDefault(); // デフォルトの動作（ファイルを開くなど）をキャンセル
  event.stopPropagation();
  dropZone.classList.remove("drag-over"); // UI: スタイル解除

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    // 最初のファイルのみ処理する
    inputElement.files = files; // input要素にもファイルをセット（changeイベントを発火させるため）
    const changeEvent = new Event("change", { bubbles: true }); // changeイベントを手動で発火
    inputElement.dispatchEvent(changeEvent);
    // handleFileSelect({ dataTransfer: event.dataTransfer }); // 直接ハンドラを呼んでも良い
  }
}

// ファイルサイズを読みやすい形式にフォーマットする関数
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 不要になった古い関数 (コメントアウトまたは削除)
// function viewFile() { ... } // handleFileSelect と processFile に置き換え
// function open() { ... } // 使用されていないため削除
