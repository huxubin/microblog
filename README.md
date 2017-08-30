# microblog
microblog is a simple rudiment , include login , register , publish blog and show them , base on Express + Node + Bootstrap .

# introduction
because old microblog project base on Express 3.X and it has a lot of differences compare with Express 4.X . So to illustrate:<br/>
1 static is the only build-in middleware of Express 4.X <br/>
&nbsp;&nbsp;&nbsp;require('express-session') is the right reference way.<br/>
2 no longer support partial since Express 3.X unless check out ejs-locals for expresss 3. we use include instead of partial.<br/>
&nbsp;&nbsp;&nbsp;eg: <%- include say %>

# start
1 npm install <br/>
2 download,unzip and start \Mongodb\bin\mongod.exe as local server <br/>
3 node ./bin/www <br/>
4 input browser : http://localhost:3000/ <br/>


