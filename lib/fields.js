/*
Copyright 2011 Timothy J Fontaine <tjfontaine@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

*/

"use strict";

var struct = require('struct'),
  ipaddr = require('ipaddr.js'),
  name = require('./name');

var Struct = exports.Struct = function (field_name, format) {
  var field = {
    name: field_name,
    value: 0,
    pack: function (value) {
      return struct.pack('>' + format, value);
    },
    unpack: function (buff, pos) {
      var size, value;
      size = struct.calcsize(format);
      value = struct.unpack('>' + format, buff, undefined, pos)[0];
      return {
        read: size,
        value: value,
      };
    },
  };

  return field;
};

var SubField = exports.SubField = function (field_name, parent, shift, mask) {
  var field = {
    name: field_name,
    get: function (self) {
      return (self[parent] >> shift) & mask;
    },
    set: function (self, value) {
      console.log('set', field_name, value);
      var newval = (value << shift) & mask;
      var curval = self[parent]
      console.log(curval, newval, curval + newval);
      self[parent] += newval;
    },
  };
  return field;
};

var Label = exports.Label = function (field_name) {
  var field = {
    name: field_name,
    value: '',
    pack: function (value) {
      return name.pack(value);
    },
    unpack: name.unpack,
  };

  return field;
};

var IPAddress = exports.IPAddress = function (field_name, byte_length) {
  var field = {
    name: field_name,
    value: undefined,
    pack: function (value) {
      var i, bytes, ret;

      bytes = ipaddr.parse(value).toByteArray();
      ret = new Buffer(bytes.length);

      for (i = 0; i < bytes.length; i++) {
        ret.writeUInt8(bytes[i], i);
      }

      return ret;
    },
    unpack: function (buff, pos) {
      var i, read, bytes, Kind;
      
      for (i = 0; i < byte_length; i++) {
        bytes.push(buff.readUInt8(pos + i));
      }

      return {
        read: byte_length,
        value: new Kind(bytes).toString(),
      };
    },
  };

  return field;
};