# hexo-deployer-oss-aliyun


### Install 

``` bash
npm install --save hexo-deployer-oss-aliyun
```


### Configuration

```yaml
# https://oss.console.aliyun.com/bucket/oss-us-west-1/f9a329b03
deploy:
    type: aliyunoss
    region: <Region Code> # oss-us-west-1
    bucket: <Bucket Name> # f9a329b03
    accessKeyId: <Aliyun AccessKeyId> 
    accessKeySecret: <Aliyun AccessKeySecret>
```

### Deploying

```bash 
hexo d
```
