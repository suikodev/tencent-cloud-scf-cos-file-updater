const axios = require('axios').default;
const COS = require("cos-nodejs-sdk-v5")

const SECRET_ID = process.env.SECRET_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const REGION = process.env.REGION;
const BUCKET_NAME = process.env.BUCKET_NAME;
const GITHUB_REPO = process.env.GITHUB_REPO; // 'project/repo'
const RELEASE_NAME_REGEX = process.env.RELEASE_NAME_REGEX;
const COS_FILE_NAME_WITH_PATH = process.env.FILE_NAME_WITH_PATH; // 'public/XXX.tar.gz'

let cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
})

const cosGithubReleaseUpdater = async (event, context, callback) => {
    const releaseInfoResponse = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);

    const regex = new RegExp(RELEASE_NAME_REGEX);
    const asset = releaseInfoResponse.data.assets.find(asset => regex.test(asset.name));
    const downloadUrl = asset.browser_download_url;
    console.log(`Downloading ${downloadUrl}`);
    const fileResponse = await axios.get(downloadUrl, {
        responseType: "arraybuffer"
    })
    
    const buffer = Buffer.from(fileResponse.data);
    cos.putObject({
        Bucket: BUCKET_NAME,
        Region: REGION,
        Key: COS_FILE_NAME_WITH_PATH,
        Body: buffer,
    }, (err, data) => {
        console.log(err || data);
    });
}

exports.main_handler = cosGithubReleaseUpdater;