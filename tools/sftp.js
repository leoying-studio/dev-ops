const { exec } = require("child_process");
const fs = require("fs");
const SftpClicent = require("ssh2-sftp-client");
const { Client } = require("ssh2");

class Sftp {
  constructor() {
    this.sftp = null;
  }

  close = async () => {
    if (this.sftp) {
        this.sftp.end();
        this.sftp = null;
    }
  };

  createConn = async (remoteConfig) => {
    const sftp = new SftpClicent();
    await sftp.connect(remoteConfig);
    return sftp;
  };

  untargz = (remoteConfig, fileName) => {
    return new Promise((resolve) => {
      const conn = new Client();
      conn
        .on("ready", () => {
          console.log("Client :: ready");
          conn.shell((err, stream) => {
            if (err) throw err;
            stream
              .on("close", () => {
                console.log("Stream :: close");
                conn.end();
              })
              .on("data", (data) => {
                console.log("OUTPUT: " + data);
              });
            // 向远程shell发送命令
            stream.write(`cd ~\n`);
            stream.write(`cd ${remoteConfig.path}\n`);
            stream.write("pwd\n");
            stream.write("ls\n");
            stream.write("rm -r dist\n");
            const command = `tar -zxvf ${fileName} --checkpoint\n`;
            stream.end(command, resolve);
          });
        })
        .connect(remoteConfig);
    });
  };

  uploadDir = async (remoteConfig, localPath) => {
    const sftp = await this.createConn(remoteConfig);
    const status = await sftp.uploadDir(localPath, remoteConfig.path, {
      recursive: true,
    });
    return status;
  };

  rmdir = async (remoteConfig, remoteDir) => {
    const sftp = await this.createConn(remoteConfig);
    const result = await sftp.exists(remoteDir);
    if (result) {
      await sftp.rmdir(remoteDir, true);
    }
  };
}

module.exports = Sftp;