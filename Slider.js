function Slider(n,e,t,o,s,u,a,c){function f(n){return t>n?-C/2>>0:n>o?u-C/2>>0:Math.pow((n-t)/(o-t),c)*u-C/2>>0}function i(n){return Math.pow((n+C/2)/u,1/c)*(o-t)+t}function l(){g.css("left",f(k))}function d(e){s(e),n&&n.val(e)}function r(n){n.preventDefault(),w=parseInt(g.css("left")),h=n.clientX,$("body").addClass("nosel"),$(p).mousemove(v),$(p).mouseup(m)}function v(n){n.preventDefault(),b=n.clientX-h+w>>0,-C/2>b?b=-C/2:b>u-C/2&&(b=u-C/2),g.css("left",b),k=i(b),d(a?k>>0:k)}function m(){$("body").removeClass("nosel"),$(p).off("mousemove",v).off("mouseup",m)}var p=document;e=$(e),n&&(n=$(n)),c||(c=1);var h,w,b,C=17,g=$("<div/>",{"class":"mark",width:C}),k=t;e.addClass("slider").width(u).append(g),this.set=function(e){k=e,n&&n.val(e),l()},this.setBG=function(n){e.css("background",n)},n&&(k=n.val(),n.change(function(){k=n.val(),l(),s(k)})),g.mousedown(r),l()}