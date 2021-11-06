const axios = require('axios').default;
const COS = require("cos-nodejs-sdk-v5")

let cos = new COS({
    SecretId: process.env.SECRET_ID,
    SecretKey: process.env.SECRET_KEY,
})

axios.get(process.env.FILE_LINK, {
    responseType: "arraybuffer"
})
    .then(res => {
        const buffer = Buffer.from(res.data);
        cos.putObject({
            Bucket: process.env.BUCKET_NAME,
            Region: process.env.REGION,
            Key: process.env.FILE_NAME_WITH_PATH,
            Body: buffer,
        }, (err, data) => {
            console.log(err || data);
        });
    })
    .catch(err => {
        console.log(err);
    })