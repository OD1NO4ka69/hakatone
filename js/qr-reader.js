document.getElementById('qrInput').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                document.getElementById('output').innerText = code.data;
            } else {
                document.getElementById('output').innerText = 'QR-код не распознан.';
            }
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});
