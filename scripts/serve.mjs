import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const port=Number(process.env.PORT||8743);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
const server=http.createServer((request,response)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);}catch{response.writeHead(400);response.end('Bad request');return;}
 let file=path.resolve(root,'.'+pathname);if(pathname.endsWith('/'))file=path.join(file,'index.html');
 if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end('Forbidden');return;}
 let status=200;if(!fs.existsSync(file)||!fs.statSync(file).isFile()){file=path.join(root,'404.html');status=404;}
 const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 for(const line of fs.readFileSync(path.join(root,'_headers'),'utf8').split('\n')){const match=line.match(/^  ([\w-]+): (.+)$/);if(match)headers[match[1]]=match[2];}
 if(pathname==='/__qa__/probe.js'){response.writeHead(200,{...headers,'Content-Type':'text/javascript; charset=utf-8'});response.end(fs.readFileSync(new URL('./privacy-probe.js',import.meta.url)));return;}
 if(pathname==='/__qa__/controls.js'){response.writeHead(200,{...headers,'Content-Type':'text/javascript; charset=utf-8'});response.end(fs.readFileSync(new URL('./control-state-probe.js',import.meta.url)));return;}
 response.writeHead(status,headers);
 if(request.method==='HEAD')response.end();
 else if(path.extname(file)==='.html'&&new URL(request.url,'http://localhost').searchParams.get('qa')==='1')response.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script src="/__qa__/probe.js"></script>'));
 else if(path.extname(file)==='.html'&&new URL(request.url,'http://localhost').searchParams.get('audit')==='controls')response.end(fs.readFileSync(file,'utf8').replace('</head>','<script src="/__qa__/controls.js" defer></script></head>'));
 else fs.createReadStream(file).pipe(response);
});
server.listen(port,'127.0.0.1',()=>console.log(`4X Valley preview: http://127.0.0.1:${port}/`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
