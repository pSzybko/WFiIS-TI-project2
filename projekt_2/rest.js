var request;
var objJSON;
var id_mongo;

sessionStorage.setItem('status', 'false');

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
   console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
var req = indexedDB.deleteDatabase('user_db');
req.onsuccess = function () {
   console.log("Deleted database successfully");
};
var localDB = indexedDB.open('user_db', 1);
localDB.onupgradeneeded = function(e) {
   let db = e.target.result;
   let objectStore = db.createObjectStore('user_db', { keyPath: 'id', autoIncrement:true }); 
   objectStore.createIndex('p1', 'p1', { unique: false });
   objectStore.createIndex('p2', 'p2', { unique: false });
   objectStore.createIndex('p3', 'p3', { unique: false });
   console.log('ok');
};

function getRequestObject()      {
   if ( window.ActiveXObject)  {
      return ( new ActiveXObject("Microsoft.XMLHTTP")) ;
   } else if (window.XMLHttpRequest)  {
      return (new XMLHttpRequest())  ;
   } else {
      return (null) ;
   }
}

function _list() {
   document.getElementById('result').innerHTML = `
   <h3>Jak często dochodzi do opóźnień i jak są one poważne?</h3>
   <canvas id="delayGraph" width="1000" height="600"></canvas>
   <br>
   <h3>Jak często korzystasz z komunikacji miejskiej?</h3>
   <canvas id="freqGraph" width="1000" height="600"></canvas>
   <br>
   <h3>Jak oceniasz komunikację miejską?</h3>
   <canvas id="gradeGraph" width="1000" height="600"></canvas>`;
   document.getElementById('data').innerHTML = '';  
   var q1 = [0,0,0,0,0];
   var q2 = [0,0,0,0,0];
   var q3 = [0,0,0,0,0];
   var s1=0;
   var s2=0;
   var s3=0;
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4)    {
         objJSON = JSON.parse(request.response);
         var txt = `
         <table>
            <thead>
               <tr><th colspan="6">Jak odpowiadali ankietowani</th></tr>
            </thead>
            <tbody>
               <tr><th>Numer</th><th>Spóźnienia - regularność i waga</th><th>Regularność użytkowania</th><th>Ocena</th></tr>
         `;
         for ( var id in objJSON )  {
             txt += "<tr><td>"+id+"</td>" ;
             for ( var prop in objJSON[id] ) {             
                 if ( prop === 'p1')
                  {
                     txt += "<td>"+objJSON[id][prop]+"</td>";
                     s1+=1;
                     if(objJSON[id][prop]=="nigdy") q1[0]+=1; 
                     else if(objJSON[id][prop]=="rzadko ale są nieznaczne") q1[1]+=1; 
                     else if(objJSON[id][prop]=="rzadko i znaczne") q1[2]+=1; 
                     else if(objJSON[id][prop]=="często ale są nieznaczne") q1[3]+=1; 
                     else if(objJSON[id][prop]=="często i znaczne") q1[4]+=1; 
                     else alert("1 :(");
                  }
                  else if (prop === 'p2')
                  {
                     txt += "<td>"+objJSON[id][prop]+"</td>";
                     s2+=1;
                     if(objJSON[id][prop]=="wcale") q2[0]++; 
                     else if(objJSON[id][prop]=="okazjonalnie") q2[1]++; 
                     else if(objJSON[id][prop]=="sporadycznie") q2[2]++; 
                     else if(objJSON[id][prop]=="regularnie") q2[3]++; 
                     else if(objJSON[id][prop]=="codziennie") q2[4]++; 
                     else alert("2 :(");
                  }
                  else if (prop === 'p3')
                  {
                     txt += "<td>"+objJSON[id][prop]+"</td>";
                     s3+=1;
                     if(objJSON[id][prop]==1) q3[0]++; 
                     else if(objJSON[id][prop]==2) q3[1]++; 
                     else if(objJSON[id][prop]==3) q3[2]++; 
                     else if(objJSON[id][prop]==4) q3[3]++; 
                     else if(objJSON[id][prop]==5) q3[4]++; 
                     else alert("3 :(");
                  }
               //   else
               //     { txt += "<td>" + objJSON[id][prop]['$oid']+"</td>" ; }
             }
             txt +="</tr>";
         }
         txt+="</tbody></table>"
         document.getElementById('data').innerHTML = txt;
         draw(q1,q2,q3,s1,s2,s3);
      }
   }
   request.open("GET", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/list", true);
   request.send(null);
}

function draw(q1, q2, q3, s1, s2, s3){
   var tmp = 0;
   var colors = ['#d4afb9  ', '#d1cfe2 ', '#9cadce  ', '#7ec4cf  ', '#52b2cf'];
   var notes = ["nigdy", "rzadko ale są nieznaczne", "rzadko i znaczne", "często ale są nieznaczne", "często i znaczne"];
   var canvas =document.getElementById("delayGraph");
   var ctx=canvas .getContext('2d');
   ctx.font= "20px sans-serif"
   for (var i = 0; i < q1.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width/3, canvas.height/2);
      ctx.arc(canvas.width/3, canvas.height/2, canvas.height/2, tmp, tmp+(Math.PI*2*(q1[i]/s1)), false);
      ctx.lineTo(canvas.width/3, canvas.height/2);
      ctx.rect(canvas.width*2/3+30, canvas.height/2-70+i*30, 10, 10);
      ctx.fillText(notes[i], canvas.width*2/3+50, canvas.height/2-60+i*30);
      ctx.fill();
      tmp += Math.PI*2*(q1[i]/s1);
   }

   notes=["wcale", "okazjonalnie", "sporadycznie", "regularnie", "codziennie"];

   canvas =document.getElementById("freqGraph");
   ctx=canvas .getContext('2d');
   ctx.font= "20px sans-serif"
   for (var i = 0; i < q2.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width/3, canvas.height/2);
      ctx.arc(canvas.width/3, canvas.height/2, canvas.height/2, tmp, tmp+(Math.PI*2*(q2[i]/s2)), false);
      ctx.lineTo(canvas.width/3, canvas.height/2);
      ctx.rect(canvas.width*2/3+30, canvas.height/2-70+i*30, 10, 10);
      ctx.fillText(notes[i], canvas.width*2/3+50, canvas.height/2-60+i*30);
      ctx.fill();
      tmp += Math.PI * 2 * (q2[i] / s2);
   }
   canvas =document.getElementById("gradeGraph");
   notes=["1", "2", "3", "4", "5"];
   ctx=canvas .getContext('2d');
   ctx.font= "20px sans-serif"
   for (var i = 0; i < q3.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(canvas.width/3, canvas.height/2);
      ctx.arc(canvas.width/3, canvas.height/2, canvas.height/2, tmp, tmp + (Math.PI * 2 * (q3[i] / s3)), false);
      ctx.lineTo(canvas.width/3, canvas.height/2);
      ctx.rect(canvas.width*2/3+30, canvas.height/2-70+i*30, 10, 10);
      ctx.fillText(notes[i], canvas.width*2/3+50, canvas.height/2-60+i*30);
      ctx.fill();
      tmp += Math.PI * 2 * (q3[i] / s3);
   }
}

function _list_local() {
   var  objStore = localDB.result.transaction('user_db').objectStore('user_db');
   document.getElementById('data').innerHTML = '';
   document.getElementById('result').innerHTML = '';
   document.getElementById('result').innerHTML=`
      <table id="myTable">
         <thead>
            <tr>
               <th colspan="4">Twoje odpowiedzi</th>
            </tr>
         </thead>
         <tbody>
            <tr>
               <th>Spóźnienia - regularność i waga</th>
               <th>Regulraność użytkowania</th>
               <th>Ocena</th>
            </tr>
         `;
   objStore.openCursor().onsuccess = function(e){
      var cursor = e.target.result;
      if(cursor){
         document.getElementById('myTable').innerHTML+='<tr><td>'+cursor.value.p1+'</td><td>'+cursor.value.p2+'</td><td>'+cursor.value.p3+'</td></tr>';
         cursor.continue();
      }else {
         console.log("No more entries!");
      }
   }
   document.getElementById('result').innerHTML+=`
         </tbody>
      </table>
      `;
}

function move_data(){
   var  objStore = localDB.result.transaction('user_db').objectStore('user_db');
   objStore.openCursor().onsuccess = function(e){
      var cursor = e.target.result;
      if(cursor){
         var data = {};
         var txt;
         data.p1=cursor.value.p1;
         data.p2=cursor.value.p2;
         data.p3=cursor.value.p3;
         txt=JSON.stringify(data);
         request = getRequestObject();
         request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200 )    {
               document.getElementById('result').innerHTML = request.response;
            }
         }
         request.open("POST", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/save", true);
         request.send(txt);
         cursor.continue();
      }else {
         var tmp=localDB.result;
         tmp.close();
         var req = indexedDB.deleteDatabase('user_db');
         req.onsuccess = function () {
            console.log("Deleted database successfully");
         };
         req.onerror = function () {
            console.log("Couldn't delete database");
         };
         req.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
         };
         console.log("No more entries!");
      }
   }
}

function _ins_form() {
   var form1 = `
   <form name='add'>
      <table>
         <thead>
            <tr><th colspan="2">Wypełnij ankietę dotyczącą komunikacji miejskiej</th></tr>
         </thead>
         <tbody>
            <tr><td>Jak często dochodzi do opóźnień i jak są one poważne?</td><td>
               <select name="p1" id="p1">
                  <option value="">Wybierz</option>
                  <option value="nigdy">nigdy</option>
                  <option value="rzadko ale są nieznaczne">rzadko ale są nieznaczne</option>
                  <option value="rzadko i znaczne">rzadko i znaczne</option>
                  <option value="często ale są nieznaczne">często ale są nieznaczne</option>
                  <option value="często i znaczne">często i znaczne</option>
               </select>
            </td></tr>
            <tr><td>Jak często korzystasz z komunikacji miejskiej?</td><td>
               <select name="p2" id="p2">
                  <option value="">Wybierz</option>
                  <option value="wcale">wcale</option>
                  <option value="okazjonalnie">okazjonalnie</option>
                  <option value="sporadycznie">sporadycznie</option>
                  <option value="regularnie">regularnie</option>
                  <option value="codziennie">codziennie</option>
               </select>
            </td></tr>
            <tr><td>Jak oceniasz komunikację miejską?</td><td>
               <select name="p3" id="p3">
                  <option value="">Wybierz</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
               </select>
            </td></tr>
         </tbody>
         <tfoot>
            <tr><td colspan="2"><input type='button' value='dodaj' onclick='_insert(this.form)' ></input></td></tr>
         </tfoot>
      </table>
   </form>`;
   document.getElementById('data').innerHTML = form1;
   document.getElementById('result').innerHTML = '';
}

function _ins_form_local() {
   var form1 = `
   <form name='add'>
      <table>
         <thead>
            <tr><th colspan="2">Wypełnij lokalnie ankietę dotyczącą komunikacji miejskiej</th></tr>
         </thead>
         <tbody>
            <tr><td>Jak często dochodzi do opóźnień i jak są one poważne?</td><td>
            <select name="p1" id="p1">
               <option value="">Wybierz</option>
               <option value="nigdy">nigdy</option>
               <option value="rzadko ale są nieznaczne">rzadko ale są nieznaczne</option>
               <option value="rzadko i znaczne">rzadko i znaczne</option>
               <option value="często ale są nieznaczne">często ale są nieznaczne</option>
               <option value="często i znaczne">często i znaczne</option>
            </select>
            </td></tr>
            <tr><td>Jak często korzystasz z komunikacji miejskiej?</td><td>
               <select name="p2" id="p2">
                  <option value="">Wybierz</option>
                  <option value="wcale">wcale</option>
                  <option value="okazjonalnie">okazjonalnie</option>
                  <option value="sporadycznie">sporadycznie</option>
                  <option value="regularnie">regularnie</option>
                  <option value="codziennie">codziennie</option>
               </select>
            </td></tr>
            <tr><td>Jak oceniasz komunikację miejską?</td><td>
               <select name="p3" id="p3">
                  <option value="">Wybierz</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
               </select>
            </td></tr>
         </tbody>
         <tfoot>
            <tr><td colspan="2"><input type='button' value='dodaj' onclick='_insert_local(this.form)' ></input></td></tr>
         </tfoot>
      </table>
   </form>`;
   document.getElementById('data').innerHTML = form1;
   document.getElementById('result').innerHTML = '';
}

function _insert(form)  {
   if(form.p1.value==="" || form.p2.value==="" || form.p3.value===""){
      alert("Proszę wypełnić wszystkie pola!");
   }
   else{
      var user = {};
      user.p1 = form.p1.value;
      user.p2 = form.p2.value;
      user.p3 = form.p3.value;
      txt = JSON.stringify(user);
      document.getElementById('result').innerHTML = '';
      document.getElementById('data').innerHTML = '';  
      request = getRequestObject() ;
      request.onreadystatechange = function() {
         if (request.readyState == 4 && request.status == 200 )    {
            document.getElementById('result').innerHTML = request.response;
         }
      }
      request.open("POST", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/save", true);
      request.send(txt);
   }
}

function _insert_local(form)  {
   if(form.p1.value==="" || form.p2.value==="" || form.p3.value===""){
      alert("Proszę wypełnić wszystkie pola!");
   }
   else{
      document.getElementById('result').innerHTML = '';
      document.getElementById('data').innerHTML = '';  
      var newItem = [{p1: form.p1.value, p2: form.p2.value, p3: form.p3.value}];
      let transaction = localDB.result.transaction(['user_db'], 'readwrite');
      let objectStore = transaction.objectStore('user_db');
      objectStore.put(newItem[0]);
      transaction.oncomplete = function() {
         console.log('Transaction completed: database modification finished.');
      };
   }
}

function _log_in_form(){
   document.getElementById('result').innerHTML = '';
   document.getElementById('data').innerHTML = ''; 
   var form1 = `
      <form name="log">
         <table>
            <thead>
               <tr><th colspan="2">Wprowadź dane logowania</th></tr>
            </thead>
            <tbody>
               <tr><td><label for="mail">Email</label></td><td><input type="email" name="mail" id="mail" /></td></tr>
               <tr><td><label for="haslo">Hasło</label></td><td><input type="password" name="haslo" id="haslo" /></td></tr>
            </tbody>
            <tfoot>
               <tr><td colspan="2"><input type="button" value="Zaloguj" onclick="_log_in(this.form)" /></td></tr>
            </tfoot>
         </table>
      </form>
   `;
   document.getElementById('data').innerHTML = form1;
   document.getElementById('result').innerHTML = ''; 
}

function _log_in(form){
   if(form.mail.value==="" || form.haslo.value==="")
      alert("Proszę wypełnić wszystkie pola!");
   else{
      var user={};
      var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
      user.email=form.mail.value;
      user.password=MD5(form.haslo.value);
      // alert (user.password);
      txt=JSON.stringify(user);

      document.getElementById('result').innerHTML = ''; 
      document.getElementById('data').innerHTML = ''; 
      request = getRequestObject() ;
      request.onreadystatechange = function() {
         if (request.readyState == 4 && request.status == 200 ) {
            $array = JSON.parse(request.response);
            document.getElementById('result').innerHTML = "<p>" + $array["return"] + "</p>";
            sessionStorage.setItem('status', 'true');
            refresh();
            move_data();
         }
      }
      request.open("POST", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/log", true);
      request.send(txt);
   }
}

function _sign_up_form(){
   document.getElementById('result').innerHTML = '';
   document.getElementById('data').innerHTML = ''; 
   var form1 = `
      <form name="reg">
         <table>
            <thead>
               <tr><th colspan="2">Wprowadź dane do założenia konta</th></tr>
            </thead>
            <tbody>
               <tr><td><label for="mail_reg">Email</label></td><td><input type="email" name="mail_reg" id="mail_reg" /></td></tr>
               <tr><td><label for="haslo1">Hasło</label></td><td><input type="password" name="haslo1" id="haslo1" /></td></tr>
               <tr><td><label for="haslo2">Powtórz hasło</label></td><td><input type="password" name="haslo2" id="haslo2" /></td></tr>
            </tbody>
            <tfoot>
               <tr><td colspan="2"><input type="button" value="Zarejestruj" onclick="_sign_up(this.form)" /></td></tr>
            </tfoot>
         </table>
      </form>
   `;
   document.getElementById('data').innerHTML = form1;
   document.getElementById('result').innerHTML = ''; 
}

function _sign_up(form){
   if(form.mail_reg.value==="" || form.haslo1.value==="" || form.haslo2.value===""){
      alert("Proszę wypełnić wszystkie pola!");
   }else if(form.haslo1.value!=form.haslo2.value){
      alert("Hasła nie są jednakowe!");
   }else{
      var user={};
      var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
      
      user.email=form.mail_reg.value;
      user.password=MD5(form.haslo1.value);
      txt=JSON.stringify(user);

      document.getElementById('result').innerHTML = ''; 
      document.getElementById('data').innerHTML = '';  
      request = getRequestObject() ;
      request.onreadystatechange = function() {
         if (request.readyState == 4 && request.status == 200 ) {
            $array = JSON.parse(request.response);
            document.getElementById('result').innerHTML = "<p>" + $array["return"] + "</p>";
         }
      }
      request.open("POST", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/sign", true);
      request.send(txt);
   }
}

function _log_out(){
   document.getElementById('result').innerHTML = ''; 
   document.getElementById('data').innerHTML = '';  
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200 )    {
         $array = JSON.parse(request.response);
         document.getElementById('result').innerHTML = "<p>" + $array["return"] + "</p>";
         sessionStorage.setItem('status', 'false');
         refresh();
         localDB = indexedDB.open('user_db', 1);
         localDB.onupgradeneeded = function(e) {
            let db = e.target.result;
            let objectStore = db.createObjectStore('user_db', { keyPath: 'id', autoIncrement:true }); 
            // objectStore.createIndex('nazwa', 'nazwa', { unique: false });
            objectStore.createIndex('p1', 'p1', { unique: false });
            objectStore.createIndex('p2', 'p2', { unique: false });
            objectStore.createIndex('p3', 'p3', { unique: false });
            console.log('ok');
         };
      }
   }
   request.open("POST", "http://pascal.fis.agh.edu.pl/~9sipko/projekt_2/rest/out", true);
   request.send(txt);
}

function refresh(){
   if((sessionStorage.getItem('status'))  == 'true'){
      document.getElementById('logged').hidden = false; 
      document.getElementById('main').hidden = true; 
   }
   else{
      document.getElementById('logged').hidden = true;   
      document.getElementById('main').hidden = false; 
   }
}
