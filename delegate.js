/**
 * 简单的事件委托
 * 如果携带的委托是一个数组 则依次执行 如果对应事件返回Promise 则resolve后执行下一个
 * @param {Node} target 携带委托的对象或者受理委托的对象
 * @param {string|object} eventName 监听的事件名称 | 携带的事件委托
 * @param {object} [opt] 受理委托配置 数组则是移除模式
 * @return {Node} target 返回target
 */
function delegate(target,eventName,opt) {
  if (opt) {
    var isRemove = Array.isArray(opt);
    // 受理委托
    var dg = target.delegate=target.delegate||{};
    var ev = dg[eventName];
    if(!ev){
      if(isRemove)return target;
      ev = dg[eventName] = {};
      var fn =ev._fn = function (e) {
        var node = e.target;
        var es = node.delegateEvents;
        es&&(es = es[eventName]);
        if(es){
          var type = Object.prototype.toString.call(es);
          if('[object String]'===type){
              var fn=ev[es];
              if(fn)fn.call(node,e);
          }else if('[object Array]'===type){
            var x=0;
            var run = function () {
              var arg=[e];
              for(var i=0,l=arguments.length;i<l;i++){
                arg.push(arguments[i]);
              }
              var  fn = ev[es[x++]];
              if(fn){
                var next =fn.apply(node,arg);
                if(next&&next.then){
                  next.then(run)
                }else run()
              }
            };
            run();
          }
        }
      };
      target.addEventListener(eventName,fn);
    }
    var i,l;
    if(isRemove){
      for(i=0,l=opt.length;i<l;i++){
        delete ev[opt[i]]
      }
    }else {
      var ks = Object.keys(opt);
      for(i=0,l=ks.length;i<l;i++){
        var k = ks[i];
         ev[k]= opt[k];
      }
    }
  } else {
    // 携带委托
    target.delegateEvents=eventName;
  }
  return target;
}

//简单的模拟

var a = document.createElement('div');
var b = a.appendChild(document.createElement('div'));
b.innerHTML='Click Me';
document.body.appendChild(a);

var open = function () {
  console.log('open');
  var _cb;
  setTimeout(function () {
    _cb();
  },5000);
  return {
    then:function (cb) {
      _cb = cb
    }
  }
};
var show = function () {
  console.log('show');
};
var close = function () {
  console.log('close');
};

//添加委托受理
delegate(a,'click',{
  open: open,
  show: show,
  close: close
});

//携带委托
delegate(b,{click: ['open','show','close']});

//移除委托受理
//delegate(a,'click',['open','show','close']);
