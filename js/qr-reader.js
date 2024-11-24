function extractAndRound(str) {
    const regex = /&s=([0-9.]+)&fn=/;
    const match = str.match(regex);

    if (match && match[1]) {
        return Math.round(parseFloat(match[1]));
    }

    return null;
}
let qr_inf = "";
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
                qr_inf = code.data;
                let summ = extractAndRound(qr_inf);
                console.log(sum);
            } else {
                qr_inf = "";
            }
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});