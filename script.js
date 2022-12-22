function view_file() {
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();
  let output = document.getElementById('output');
  output.innerHTML = "処理中、そのままお待ち下さい。万が一動かなければ<a href='https://my-site.chakkun1121haru.repl.co/form/' target='_target'>お問い合わせください</a>。";
  reader.addEventListener("load", function() {
    const fileURL = reader.result;
    output.innerText = fileURL
  }, false);
  if (file) {
    reader.readAsDataURL(file)
  };
  return
};

function open() {
  location.href(fileURL)
};
