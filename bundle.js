(function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId]){return installedModules[moduleId].exports}var module=installedModules[moduleId]={i:moduleId,l:false,exports:{}};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.l=true;return module.exports}__webpack_require__.m=modules;__webpack_require__.c=installedModules;__webpack_require__.d=function(exports,name,getter){if(!__webpack_require__.o(exports,name)){Object.defineProperty(exports,name,{configurable:false,enumerable:true,get:getter})}};__webpack_require__.n=function(module){var getter=module&&module.__esModule?function getDefault(){return module["default"]}:function getModuleExports(){return module};__webpack_require__.d(getter,"a",getter);return getter};__webpack_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property)};__webpack_require__.p="";return __webpack_require__(__webpack_require__.s=1)})([function(module,exports){module.exports={browser:typeof window!=="undefined",webpack:false}},function(module,exports,__webpack_require__){const{browser:browser,webpack:webpack}=__webpack_require__(0);const Snekfetch=__webpack_require__(2);module.exports=Snekfetch;if(browser&&webpack){window.Snekfetch=Snekfetch}else if(!browser){console.warn("Warning: Attempting to use browser version of Snekfetch in a non-browser environment!")}},function(module,exports,__webpack_require__){const{browser:browser}=__webpack_require__(0);const qs=__webpack_require__(3);const Package=__webpack_require__(6);const transport=browser?__webpack_require__(7):__webpack_require__(8);class Snekfetch extends(transport.extension||Object){constructor(method,url,opts={headers:null,data:null,query:null,version:1}){super();this.request=transport.buildRequest.call(this,method,url,opts);if(opts.query)this.query(opts.query);if(opts.data)this.send(opts.data)}query(name,value){if(this.response)throw new Error("Cannot modify query after being sent!");if(name!==null&&typeof name==="object"){this.request.query=Object.assign(this.request.query||{},name)}else{this.request.query[name]=value}return this}set(name,value){if(this.response)throw new Error("Cannot modify headers after being sent!");if(name!==null&&typeof name==="object"){for(const key of Object.keys(name))this.set(key,name[key])}else{this.request.setHeader(name,value)}return this}attach(name,data,filename){if(this.response)throw new Error("Cannot modify data after being sent!");const form=this._getFormData();this.set("Content-Type",`multipart/form-data; boundary=${form.boundary}`);form.append(name,data,filename);this.data=form;return this}send(data){if(this.response)throw new Error("Cannot modify data after being sent!");if(transport.shouldSendRaw(data)){this.data=data}else if(data!==null&&typeof data==="object"){const header=this._getRequestHeader("content-type");let serialize;if(header){if(header.includes("json"))serialize=JSON.stringify;else if(header.includes("urlencoded"))serialize=qs.stringify}else{this.set("Content-Type","application/json");serialize=JSON.stringify}this.data=serialize(data)}else{this.data=data}return this}then(resolver,rejector){transport.finalizeRequest.call(this,resolver,rejector).then(({response:response,raw:raw,redirect:redirect,headers:headers})=>{if(this.request.followRedirects&&redirect){let method=this.request.method;if([301,302].includes(response.statusCode)){if(method!=="HEAD")method="GET";this.data=null}else if(response.statusCode===303){method="GET"}const redirectHeaders={};if(this.request._headerNames){for(const name of Object.keys(this.request._headerNames)){if(name.toLowerCase()==="host")continue;redirectHeaders[this.request._headerNames[name]]=this.request._headers[name]}}else{for(const name of Object.keys(this.request._headers)){if(name.toLowerCase()==="host")continue;const header=this.request._headers[name];redirectHeaders[header.name]=header.value}}return new Snekfetch(method,redirect,{data:this.data,headers:redirectHeaders})}const statusCode=response.statusCode||response.status;const res={request:this.request,get body(){delete res.body;const type=(headers||response.headers)["content-type"];if(type&&type.includes("application/json")){try{res.body=JSON.parse(res.text)}catch(err){res.body=res.text}}else if(type&&type.includes("application/x-www-form-urlencoded")){res.body=qs.parse(res.text)}else{res.body=raw}return res.body},text:raw.toString(),ok:statusCode>=200&&statusCode<400,headers:headers||response.headers,status:statusCode,statusText:response.statusText||transport.STATUS_CODES[response.statusCode]};if(res.ok){return res}else{const err=new Error(`${res.status} ${res.statusText}`.trim());Object.assign(err,res);return Promise.reject(err)}}).then(resolver,rejector)}catch(rejector){return this.then(null,rejector)}end(cb){return this.then(res=>cb?cb(null,res):res,err=>cb?cb(err,err.status?err:null):err)}_read(){this.resume();if(this.response)return;this.catch(err=>this.emit("error",err))}_shouldUnzip(res){if(res.statusCode===204||res.statusCode===304)return false;if(res.headers["content-length"]==="0")return false;return/^\s*(?:deflate|gzip)\s*$/.test(res.headers["content-encoding"])}_shouldRedirect(res){return[301,302,303,307,308].includes(res.statusCode)}_getFormData(){if(!this._formData)this._formData=new transport.FormData;return this._formData}_addFinalHeaders(){if(!this.request)return;if(!this._getRequestHeader("user-agent")){this.set("User-Agent",`snekfetch/${Snekfetch.version} (${Package.repository.url.replace(/\.?git/,"")})`)}if(this.request.method!=="HEAD")this.set("Accept-Encoding","gzip, deflate");if(this.data&&this.data.end)this.set("Content-Length",this.data.length)}get response(){return this.request?this.request.res||this.request._response||null:null}_getRequestHeader(header){try{return this.request.getHeader(header)}catch(err){return null}}}Snekfetch.version=Package.version;Snekfetch.METHODS=transport.METHODS.concat("BREW");for(const method of Snekfetch.METHODS){Snekfetch[method==="M-SEARCH"?"msearch":method.toLowerCase()]=((url,opts)=>new Snekfetch(method,url,opts))}module.exports=Snekfetch},function(module,exports,__webpack_require__){"use strict";exports.decode=exports.parse=__webpack_require__(4);exports.encode=exports.stringify=__webpack_require__(5)},function(module,exports,__webpack_require__){"use strict";function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop)}module.exports=function(qs,sep,eq,options){sep=sep||"&";eq=eq||"=";var obj={};if(typeof qs!=="string"||qs.length===0){return obj}var regexp=/\+/g;qs=qs.split(sep);var maxKeys=1e3;if(options&&typeof options.maxKeys==="number"){maxKeys=options.maxKeys}var len=qs.length;if(maxKeys>0&&len>maxKeys){len=maxKeys}for(var i=0;i<len;++i){var x=qs[i].replace(regexp,"%20"),idx=x.indexOf(eq),kstr,vstr,k,v;if(idx>=0){kstr=x.substr(0,idx);vstr=x.substr(idx+1)}else{kstr=x;vstr=""}k=decodeURIComponent(kstr);v=decodeURIComponent(vstr);if(!hasOwnProperty(obj,k)){obj[k]=v}else if(isArray(obj[k])){obj[k].push(v)}else{obj[k]=[obj[k],v]}}return obj};var isArray=Array.isArray||function(xs){return Object.prototype.toString.call(xs)==="[object Array]"}},function(module,exports,__webpack_require__){"use strict";var stringifyPrimitive=function(v){switch(typeof v){case"string":return v;case"boolean":return v?"true":"false";case"number":return isFinite(v)?v:"";default:return""}};module.exports=function(obj,sep,eq,name){sep=sep||"&";eq=eq||"=";if(obj===null){obj=undefined}if(typeof obj==="object"){return map(objectKeys(obj),function(k){var ks=encodeURIComponent(stringifyPrimitive(k))+eq;if(isArray(obj[k])){return map(obj[k],function(v){return ks+encodeURIComponent(stringifyPrimitive(v))}).join(sep)}else{return ks+encodeURIComponent(stringifyPrimitive(obj[k]))}}).join(sep)}if(!name)return"";return encodeURIComponent(stringifyPrimitive(name))+eq+encodeURIComponent(stringifyPrimitive(obj))};var isArray=Array.isArray||function(xs){return Object.prototype.toString.call(xs)==="[object Array]"};function map(xs,f){if(xs.map)return xs.map(f);var res=[];for(var i=0;i<xs.length;i++){res.push(f(xs[i],i))}return res}var objectKeys=Object.keys||function(obj){var res=[];for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))res.push(key)}return res}},function(module,exports){module.exports={name:"snekfetch",version:"3.3.1",main:"index.js",repository:{type:"git",url:"git+https://github.com/devsnek/snekfetch.git"},author:"Gus Caplan <me@gus.host>",license:"MIT",bugs:{url:"https://github.com/devsnek/snekfetch/issues"},homepage:"https://github.com/devsnek/snekfetch#readme",dependencies:{},devDependencies:{webpack:"^3.6.0"},description:"Just do http requests without all that weird nastiness from other libs",browser:{"src/node.js":false}}},function(module,exports){function buildRequest(method,url,options){return{url:url,method:method,options:options,headers:{},setHeader(name,value){this.headers[name.toLowerCase()]=value},getHeader(name){return this.headers[name.toLowerCase()]}}}function finalizeRequest(){return fetch(this.request.url,this.request).then(r=>r.text().then(t=>{const headers={};for(const[k,v]of r.headers)headers[k.toLowerCase()]=v;return{response:r,raw:t,headers:headers}}))}function shouldSendRaw(){return false}module.exports={buildRequest:buildRequest,finalizeRequest:finalizeRequest,shouldSendRaw:shouldSendRaw,METHODS:["GET","POST","PUT","DELETE","OPTIONS","HEAD"],STATUS_CODES:{},FormData:window.FormData}},function(module,exports){}]);