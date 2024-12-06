function main() {
  // 注册扩展
  let ext = seal.ext.find('Notices');
  if (!ext) {
    ext = seal.ext.new('Notices', 'Sheyiyuan', '1.0.0');
    seal.ext.register(ext);
    seal.ext.registerStringConfig(ext, "协议地址", "http://127.0.0.1:63000");
  }

  const NOTICES_API = "/_send_group_notice"

  // 编写指令
  const cmdNotice = seal.ext.newCmdItemInfo();
  cmdNotice.name = '挂团';
  cmdNotice.help = `使用“.挂团 + 挂团公告”来发布挂团公告。公告前两行格式必须为：\n模组：XXX\n规则：XXX\n格式错误将导致指令失效。`;

  cmdNotice.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case 'help': {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        let noticeText = cmdArgs.rawArgs;
        console.log(noticeText);
        let args = noticeText.split('\n');
        console.log(JSON.stringify(args));
        if (args.length < 2||!args[0].startsWith('模组')||!args[1].startsWith('规则')) {
          seal.replyToSender(ctx,msg, '公告格式错误，请检查')
          return seal.ext.newCmdExecuteResult(true);
        }
        const WebUrl = seal.ext.getStringConfig(ext, "协议地址");
        const data = {
          group_id: ctx.group.groupId.match(/:(\d+)/)[1],
          content: noticeText
        }
        fetch(WebUrl + NOTICES_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("执行公告发布：", JSON.stringify(data, null, 2));
          })
          .catch((error) => {
            if (error instanceof TypeError) {
              console.error("网络连接问题，请检查网络设置。", error);
            } else {
              console.error("公告发布操作失败，请查看日志详情。", error);
            }
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  }

  // 注册命令
  ext.cmdMap['挂团'] = cmdNotice;
  ext.cmdMap['notice'] = cmdNotice;
}
main();
