/* global hexo */
'use strict';

hexo.extend.deployer.register('aliyunoss', async function (args) {
    //导入ali-oss sdk
    const OSS = require('ali-oss');
    const rd = require('rd');
    const path = require('path');
    const chalk = require('chalk');
    // 获取需要部署的文件 

    // 获取配置信息
    const oss_config = {
        region: args.region,
        accessKeyId: args.accessKeyId,
        accessKeySecret: args.accessKeySecret,
        bucket: args.bucket,
    }

    if (!oss_config.accessKeySecret || !oss_config.accessKeyId || !oss_config.bucket || !oss_config.region) {
        let help = '';
        help += chalk.red('ERROR');
        help += ' 您应该在_config.yml 文件中进行部署配置的设置\n\n'
        help += chalk.rgb(42, 92, 170)('配置示例如下：\n');
        help += chalk.rgb(42, 92, 170)('  deploy:\n');
        help += chalk.rgb(42, 92, 170)('    type: aliyunoss\n');
        help += chalk.rgb(42, 92, 170)('    region: <您的oss存储桶所在区域代码>\n');
        help += chalk.rgb(42, 92, 170)('    bucket: <您的oss存储桶名称>\n');
        help += chalk.rgb(42, 92, 170)('    accessKeyId: <您的oss accessKeyId>\n');
        help += chalk.rgb(42, 92, 170)('    accessKeySecret: <您的oss accessKeySecret>\n');
        help += '如需更多帮助，您可以查看文档：' + chalk.underline('https://github.com/du5/hexo-deployer-oss-aliyun');
        console.log(help);
        return;
    }

    var client = new OSS(oss_config)
    var localDir = hexo.public_dir
    var remoteDir = args.remotePath || '/'
    remoteDir = path.join(remoteDir)

    if (remoteDir == path.join("/")) {
        remoteDir = ""
    }

    async function doput(localPath, AgainNum = 0) {
        var objectKey = path.join(remoteDir, localPath.split(localDir)[1])
        objectKey = objectKey.split('\\').join('/');

        try {
            let result = await client.put(objectKey, localPath);
            if (result['res']['status'] == 200) {
                return
            }
        } catch (e) {
            AgainNum++
            if (AgainNum > 3) {
                console.log("%s 部署异常[ 文件路径 : %s,对象键 : %s] \n", chalk.red('ERROR'), localPath, objectKey)
                console.log(e);
            } else {
                return doput(localPath, AgainNum)
            }
        }
    }

    async function del() {
        let result = await client.list();
        if (result['objects'] != undefined) {
            let filelist = []
            result['objects'].forEach(iteam => {
                filelist.push(iteam['name']);
            });
            console.log(result['objects'].length)
            await client.deleteMulti(filelist)
            return del()
        }
        if (result['objects'] == undefined || result['objects'].length == 0) {
            console.log("%s 成功清空 oss 内容，开始部署！", chalk.green("INFO"))
            return
        }
    }

    async function put() {
        let filelist = []
        rd.eachFileSync(localDir, function (f) {
            filelist.push(f);
        });
        for (const iteam of filelist) {
            await doput(iteam)
        }
        console.log("%s 成功部署 oss 内容！", chalk.red("INFO"))
    }

    await del()
    await put()

});
