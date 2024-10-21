const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const FormData = require("form-data");
const utils = require("../utils");
/**
 *
 * @param {*} key 企业微信机器人推送的key
 * @returns 配置信息
 */
const getConfig = (key = "6f6f568d-8516-429e-ae76-2428b7e8af7e") => {
  const hookKey = key || process.env?.WECHAT_WEBHOOK_KEY || "xxxxxxxx";
  if (typeof hookKey !== "string" && !hookKey)
    throw new Error(`${hookKey} must be string , no empty`);
  return {
    key: hookKey,
    url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${hookKey}`,
    uploadByURL: `https://qyapi.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${hookKey}`,
    uploadURL: `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${hookKey}&type=file&debug=1&access_token=${hookKey}`,
    queryURL: `https://qyapi.weixin.qq.com/cgi-bin/media/get_upload_by_url_result?access_token=${hookKey}`,
  };
};

/**
 *
 * @param { string } text 普通文本的内容
 * @param {*} options
 * @param {string[]} options.mentioned_list userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人，如果开发者获取不到userid，可以使用mentioned_mobile_list
 * @param {string[]} options.mentioned_mobile_list 手机号列表，提醒手机号对应的群成员(@某个成员)，@all表示提醒所有人
 * @see {@link https://developer.work.weixin.qq.com/document/path/91770#%E6%96%87%E6%9C%AC%E7%B1%BB%E5%9E%8B | 企业微信机器人配置}
 * @returns
 */
function sendTextToEnterpriseWeChatGroup(text = "", options = {}) {
  const url = getConfig().url;
  const data = {
    msgtype: "text",
    text: {
      content: text,
      mentioned_mobile_list: ["@all"],
      ...options,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

/**
 *
 * @param {*} filename 文件路径
 * @returns
 */
function sendImgToEnterpriseWeChatGroup(filename) {
  if (typeof filename === "string" && !fs.existsSync(filename))
    throw new Error(`${filename} no exist`);
  const url = getConfig().url;
  const file = filename ?? path.join(__dirname, "./performance-banner.png");
  const buffer = fs.readFileSync(file);
  const base64data = buffer.toString("base64");

  // 获取该版本node模块的算法签名列表和hash算法列表
  // console.log(crypto.getCiphers());
  // console.log(crypto.getHashes());

  // https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options
  const md5 = crypto.createHash("md5").update(buffer).digest("hex");
  const data = {
    msgtype: "image",
    image: {
      base64: base64data,
      md5,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

/**
 * 上传文件到企业微信
 * @param {string} filename 上传的文件
 * @return Promise<response>
 *
 * response:
 * ```
 * {
 *   errcode: 0,
 *   errmsg: 'ok',
 *   type: 'file',
 *   media_id: '3-txPJzsW5L5IMXDcQjlcp5OxUenF_YB_ib8zRJwE4AgEVb97RbjG-PtF-pjP42jk',
 *   created_at: '1662452066'
 * }
 * ```https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=
 */
async function uploadFileToEnterpriseWeChat(filename) {
  const url = getConfig().uploadURL;
  const readStream = fs.createReadStream(filename);
  // 上传文件使用FormData
  // const bolbStream = await utils.streamToBlob(readStream);
  // bolbStream.filename = "zzzz.7z"
  const formData = new FormData();
  formData.append("media", readStream);
  return axios
    .post(url, formData, {
      headers: {
        // contentType: `multipart/form-data`,
        ...formData.getHeaders(),
      },
    })
    .then((res) => {
      return res.status === 200 && res.data;
    })
    .catch((e) => {
      debugger;
    });
}

/**
 * 发送文件到企业微信群
 * @param {string} media_id 通过上传接口获取的`media_id`
 */
function sendFileToEnterpriseWeChatGroup(media_id) {
  const url = getConfig().url;
  const data = {
    msgtype: "file",
    file: {
      media_id,
    },
  };

  return axios({
    url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

/**
 *
 * @param {*} filename 文件路径
 * @returns
 */
function sendImgToEnterpriseWeChatGroup(filename) {
  if (typeof filename === 'string' && !fs.existsSync(filename)) throw new Error(`${filename} no exist`);
  const url = getConfig().url;
  const file = filename;
  const buffer = fs.readFileSync(file);
  const base64data = buffer.toString('base64');

  // 获取该版本node模块的算法签名列表和hash算法列表
  // console.log(crypto.getCiphers());
  // console.log(crypto.getHashes());

  // https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  const data = {
    msgtype: 'image',
    image: {
      base64: base64data,
      md5,
    },
  };

  return axios({
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}
async function sendFileToWeChatGroup(filename) {
  const file = await uploadFileToEnterpriseWeChat(filename);
  return sendFileToEnterpriseWeChatGroup(file.media_id);
}

module.exports = {
  sendImgToEnterpriseWeChatGroup,
  sendTextToEnterpriseWeChatGroup,
  sendFileToWeChatGroup,
};
