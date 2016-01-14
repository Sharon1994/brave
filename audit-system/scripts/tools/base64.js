// 定义不依赖其他任何脚本的公共函数 
// 

// Aes加密
var Aes = {};  

/**
 * AES Cipher function: encrypt 'input' state with Rijndael algorithm applies Nr
 * rounds (10/12/14) using key schedule w for 'add round key' stage
 * 
 * @param {Number[]}
 *            input 16-byte (128-bit) input state array
 * @param {Number[][]}
 *            w Key schedule as 2D byte-array (Nr+1 x Nb bytes)
 * @returns {Number[]} Encrypted output state array
 */
Aes.cipher = function(input, w) {    
  var Nb = 4;               
  var Nr = w.length/Nb - 1; 

  var state = [[],[],[],[]];  
  for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];

  state = Aes.addRoundKey(state, w, 0, Nb);

  for (var round=1; round<Nr; round++) {
    state = Aes.subBytes(state, Nb);
    state = Aes.shiftRows(state, Nb);
    state = Aes.mixColumns(state, Nb);
    state = Aes.addRoundKey(state, w, round, Nb);
  }

  state = Aes.subBytes(state, Nb);
  state = Aes.shiftRows(state, Nb);
  state = Aes.addRoundKey(state, w, Nr, Nb);

  var output = new Array(4*Nb);  
  for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
  return output;
};

/**
 * Perform Key Expansion to generate a Key Schedule
 * 
 * @param {Number[]}
 *            key Key as 16/24/32-byte array
 * @returns {Number[][]} Expanded key schedule as 2D byte-array (Nr+1 x Nb
 *          bytes)
 */
Aes.keyExpansion = function(key) {  
  var Nb = 4;            
  var Nk = key.length/4;
  var Nr = Nk + 6;       

  var w = new Array(Nb*(Nr+1));
  var temp = new Array(4);

  for (var i=0; i<Nk; i++) {
    var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
    w[i] = r;
  }

  for (var i=Nk; i<(Nb*(Nr+1)); i++) {
    w[i] = new Array(4);
    for (var t=0; t<4; t++) temp[t] = w[i-1][t];
    if (i % Nk == 0) {
      temp = Aes.subWord(Aes.rotWord(temp));
      for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
    } else if (Nk > 6 && i%Nk == 4) {
      temp = Aes.subWord(temp);
    }
    for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
  }

  return w;
};

/*
 * ---- remaining routines are private, not called externally ----
 */

Aes.subBytes = function(s, Nb) {    
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
  }
  return s;
};

Aes.shiftRows = function(s, Nb) {    
  var t = new Array(4);
  for (var r=1; r<4; r++) {
    for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  
    for (var c=0; c<4; c++) s[r][c] = t[c];         
  }          
  return s;  
};

Aes.mixColumns = function(s, Nb) {   
  for (var c=0; c<4; c++) {
    var a = new Array(4);  
    var b = new Array(4);  
    for (var i=0; i<4; i++) {
      a[i] = s[i][c];
      b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;

    }
    
    s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; 
    s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; 
    s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; 
    s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; 
  }
  return s;
};

Aes.addRoundKey = function(state, w, rnd, Nb) {  
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
  }
  return state;
};

Aes.subWord = function(w) {    
  for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
  return w;
};

Aes.rotWord = function(w) {    
  var tmp = w[0];
  for (var i=0; i<3; i++) w[i] = w[i+1];
  w[3] = tmp;
  return w;
};


Aes.sBox =  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
             0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
             0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
             0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
             0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
             0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
             0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
             0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
             0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
             0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
             0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
             0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
             0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
             0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
             0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
             0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];


Aes.rCon = [ [0x00, 0x00, 0x00, 0x00],
             [0x01, 0x00, 0x00, 0x00],
             [0x02, 0x00, 0x00, 0x00],
             [0x04, 0x00, 0x00, 0x00],
             [0x08, 0x00, 0x00, 0x00],
             [0x10, 0x00, 0x00, 0x00],
             [0x20, 0x00, 0x00, 0x00],
             [0x40, 0x00, 0x00, 0x00],
             [0x80, 0x00, 0x00, 0x00],
             [0x1b, 0x00, 0x00, 0x00],
             [0x36, 0x00, 0x00, 0x00] ]; 

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* AES Counter-mode implementation in JavaScript (c) Chris Veness 2005-2012 */
/*
 * - see http: /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

Aes.Ctr = {};  

/**
 * Encrypt a text using AES encryption in Counter mode of operation
 * 
 * Unicode multi-byte character safe
 * 
 * @param {String}
 *            plaintext Source text to be encrypted
 * @param {String}
 *            password The password to use to generate a key
 * @param {Number}
 *            nBits Number of bits to be used in the key (128, 192, or 256)
 * @returns {string} Encrypted text
 */
Aes.Ctr.encrypt = function(plaintext, password, nBits) {
  var blockSize = 16;  
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  
  plaintext = Utf8.encode(plaintext);
  password = Utf8.encode(password);
  

  
  
  var nBytes = nBits/8;  
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {  
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));  
  key = key.concat(key.slice(0, nBytes-16));  

  
  
  var counterBlock = new Array(blockSize);

  var nonce = (new Date()).getTime();  
  var nonceMs = nonce%1000;
  var nonceSec = Math.floor(nonce/1000);
  var nonceRnd = Math.floor(Math.random()*0xffff);

  for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
  for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
  for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;

  
  var ctrTxt = '';
  for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

  
  var keySchedule = Aes.keyExpansion(key);

  var blockCount = Math.ceil(plaintext.length/blockSize);
  var ciphertxt = new Array(blockCount);  

  for (var b=0; b<blockCount; b++) {
    
    
    for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8)

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  

    
    var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
    var cipherChar = new Array(blockLength);

    for (var i=0; i<blockLength; i++) {  
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertxt[b] = cipherChar.join(''); 
  }

  
  var ciphertext = ctrTxt + ciphertxt.join('');
  ciphertext = Base64.encode(ciphertext);  

  
  return ciphertext;
};

/**
 * Decrypt a text encrypted by AES in counter mode of operation
 * 
 * @param {String}
 *            ciphertext Source text to be encrypted
 * @param {String}
 *            password The password to use to generate a key
 * @param {Number}
 *            nBits Number of bits to be used in the key (128, 192, or 256)
 * @returns {String} Decrypted text
 */
Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
  var blockSize = 16;  
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  
  ciphertext = Base64.decode(ciphertext);
  password = Utf8.encode(password);
  

  
  var nBytes = nBits/8;  
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
  key = key.concat(key.slice(0, nBytes-16));  

  
  var counterBlock = new Array(8);
  ctrTxt = ciphertext.slice(0, 8);
  for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);

  
  var keySchedule = Aes.keyExpansion(key);

  
  var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
  var ct = new Array(nBlocks);
  for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
  ciphertext = ct;  

  
  var plaintxt = new Array(ciphertext.length);

  for (var b=0; b<nBlocks; b++) {
    
    for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  

    var plaintxtByte = new Array(ciphertext[b].length);
    for (var i=0; i<ciphertext[b].length; i++) {
      
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintxt[b] = plaintxtByte.join('');
  }

  
  var plaintext = plaintxt.join('');
  plaintext = Utf8.decode(plaintext);  

  
  return plaintext;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2012 */
/* note: depends on Utf8 class */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

var Base64 = {};

Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode string into Base64, as defined by RFC 4648 [http: (instance method
 * extending String object). As per RFC 4648, no newlines are added.
 * 
 * @param {String}
 *            str The string to be encoded as base-64
 * @param {Boolean}
 *            [utf8encode=false] Flag to indicate whether str is Unicode string
 *            to be encoded to UTF8 before conversion to base64; otherwise
 *            string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */ 
Base64.encode = function(str, utf8encode) {  
  utf8encode =  (typeof utf8encode == 'undefined') ? false : utf8encode;
  var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
  var b64 = Base64.code;

  plain = utf8encode ? str.encodeUTF8() : str;

  c = plain.length % 3;  
  if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
  

  for (c=0; c<plain.length; c+=3) {  
    o1 = plain.charCodeAt(c);
    o2 = plain.charCodeAt(c+1);
    o3 = plain.charCodeAt(c+2);

    bits = o1<<16 | o2<<8 | o3;

    h1 = bits>>18 & 0x3f;
    h2 = bits>>12 & 0x3f;
    h3 = bits>>6 & 0x3f;
    h4 = bits & 0x3f;

    
    e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  }
  coded = e.join('');  

  
  coded = coded.slice(0, coded.length-pad.length) + pad;

  return coded;
};

/**
 * Decode string from Base64, as defined by RFC 4648 [http: (instance method
 * extending String object). As per RFC 4648, newlines are not catered for.
 * 
 * @param {String}
 *            str The string to be decoded from base-64
 * @param {Boolean}
 *            [utf8decode=false] Flag to indicate whether str is Unicode string
 *            to be decoded from UTF8 after conversion from base64
 * @returns {String} decoded string
 */ 
Base64.decode = function(str, utf8decode) {
  utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
  var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
  var b64 = Base64.code;

  coded = utf8decode ? str.decodeUTF8() : str;

  for (var c=0; c<coded.length; c+=4) {  
    h1 = b64.indexOf(coded.charAt(c));
    h2 = b64.indexOf(coded.charAt(c+1));
    h3 = b64.indexOf(coded.charAt(c+2));
    h4 = b64.indexOf(coded.charAt(c+3));

    bits = h1<<18 | h2<<12 | h3<<6 | h4;

    o1 = bits>>>16 & 0xff;
    o2 = bits>>>8 & 0xff;
    o3 = bits & 0xff;

    d[c/4] = String.fromCharCode(o1, o2, o3);
    
    if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
    if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
  }
  plain = d.join('');  

  return utf8decode ? plain.decodeUTF8() : plain; 
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/*
 * Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8
 * multiple
 */
/* single-byte character encoding (c) Chris Veness 2002-2012 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

var Utf8 = {};  

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
 * (BMP / basic multilingual plane only)
 * 
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3
 * chars
 * 
 * @param {String}
 *            strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  
  
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
};

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 * 
 * @param {String}
 *            strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  
      function(c) {  
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 
      function(c) {  
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
};

function getCookie(name) {
  var allcookies = document.cookie;
  if (allcookies.length>0) { 
    c_start=allcookies.indexOf(name+"=");
    if (c_start!=-1) { 
      c_start=c_start + name.length+1 ;
      c_end=allcookies.indexOf(";",c_start);
      if (c_end==-1) 
        c_end=allcookies.length;
      return unescape(allcookies.substring(c_start,c_end));
    } 
  }
  return "";
}

function setCookie(name, value, expireminu) {
  var strExdate="";
  if( expireminu ){
    var exdate = new Date();
    exdate.setTime(exdate.getTime()+expireminu*60*1000);
    strExdate = "; expires="+exdate.toGMTString();
  }
  document.cookie = name+"="+escape(value)+strExdate+'; path=/'+';domaim=localhost'+':secure';
}
function removeCookie( name){
  setCookie( name, "", -1);
}


//对象方法mixin
mixin = function(to, from){
  for (var propertyName in from) {
      if (from.hasOwnProperty(propertyName)) {
          to[propertyName] = from[propertyName];
      }
  }
  return to;
};