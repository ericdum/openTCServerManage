$(document).ready(function(){
    function EricUpdateOrder(iAppId,iDirId,iNodeId,iOrder,iUpDown,callback)
    {					
        function ascend(iAppId,iRegId,iServId,json){ 
            var isReg = iRegId == -1 ? true : false;
            var ele = isReg ? $('#reg_' + iServId) : $('#serv_' + iServId);
            var orderId = json[iServId]
            $(ele.find('.ascend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + iServId +"','" + orderId + "','1');")
            $(ele.find('.descend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + iServId +"','" + orderId + "','0');")		
            var preEle = ele.prev();
            var preId = preEle.attr('id').split('_')[1];
            orderId = json[preId]
            $(preEle.find('.ascend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + preId +"','" + orderId + "','1');")
            $(preEle.find('.descend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + preId +"','" + orderId + "','0');")				
            preEle.before(ele);		
        }
        
        function descend(iAppId,iRegId,iServId,json){
            var isReg = iRegId == -1 ? true : false;
            var ele = isReg ? $('#reg_' + iServId) : $('#serv_' + iServId);
            var orderId = json[iServId]
            $(ele.find('.ascend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + iServId +"','" + orderId + "','1');")
            $(ele.find('.descend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + iServId +"','" + orderId + "','0');")		
            var nextEle = ele.next();
            var nextId = nextEle.attr('id').split('_')[1];
            orderId = json[nextId]
            $(nextEle.find('.ascend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + nextId +"','" + orderId + "','1');")
            $(nextEle.find('.descend')).attr("href","javascript:UpdateOrder('"+ iAppId +"','" + iRegId + "','" + nextId +"','" + orderId + "','0');")				
            nextEle.after(ele);				
        }
        
        function fcallback()
        {
            if(typeof(JSON_UpdateOrder)!="undefined" && JSON_UpdateOrder!=null)
            {
                if(JSON_UpdateOrder.iRet=="0")
                {
                    //self.document.location.relo
                    if (iUpDown == 1){ 
                        ascend(iAppId,iDirId,iNodeId,JSON_UpdateOrder);
                        next( JSON_UpdateOrder );
                    }else{ 
                        descend(iAppId,iDirId,iNodeId,JSON_UpdateOrder);}
                }else{
                    sMsg('调整节点顺序出现错误:'+JSON_UpdateOrder.msg)
                    try_again();
                }
            }else{
                sMsg('系统繁忙，请稍后再试');
                try_again();
            }
        }

        function next( json ){
            var node = $('#serv_'+iNodeId);
            var prev = node.prev();
            if( node && prev.length ){
                var prev_node_id = parseInt(prev.attr('inodeid').replace(/\D/g,''));
                if( prev_node_id < parseInt(iNodeId) ){
                    EricUpdateOrder(iAppId,iDirId,iNodeId,json[iNodeId],iUpDown,callback);
                    return;
                }
            }
            callback();
        }

        function try_again(){
            if($('#currency_pop_tips .button_s1:visible'))
                $('#currency_pop_tips .button_s1:visible').click();

            setTimeout(function(){
                send();
            }, 1000);
        }

        function send(){
            var sUrl = "http://wlop.ieodopen.qq.com/UpdateOrder.php?iAppId="+iAppId+"&iDirId="+iDirId+"&iNodeId="+iNodeId+"&iOrder="+iOrder+"&iUpDown="+iUpDown+"&rd="+Math.random();
            window.LoginManager.checkLogin(function(){FileLoadManager.ajaxRequest({
                    'url': sUrl,
                    'showLoadingStr': '正在调整大区服务器顺序...',
                    'onLoadSuccessEvent': fcallback,
                    'onLoadErrorEvent': fcallback
                });}, 
                f_unloginCallback);
            //return false;
        }

        callback=callback||function(){};
        send();
    }

    function autoOrdering(){
        if( $(this).css('color') == '#aaa' ) return false;
        $(this).css('color', '#aaa');
        var last_sev = 9999;
        var current = 0;
        $('#ServersContainer tr[id^=serv_]').each(trloop);

        function trloop(i,v){
            console.log('looping');
            var tr = $(v);
            var nodeid = tr.attr('id').split('_')[1];
            var idirid = tr.attr('idirid').split('_')[1];
            var orderid = tr.index()+1;
            var sev = parseInt(tr.find('.area-level-name, .area-level-name-focus').text());
            current = orderid-1;
            if( !last_sev && sev || sev > last_sev ){
                console.log(i,v);
                EricUpdateOrder('100616996',idirid,nodeid,orderid,'1',function(){
                    $('#ServersContainer tr[id^=serv_]:gt('+current+')').each(trloop);
                });
                console.log('end of loop');
                return false; 
            }else{
                last_sev = sev;
            }
        }
        return false;
    }

    $(".area-operation ul").append($('<li>').append($('<a href="#!">自动排序</a>').click(autoOrdering)));
});
