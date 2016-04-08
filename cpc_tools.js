        var checkForCPCTools = function() {
          var alphabet = ''
          if (message.type == 'message' && ((message.threadID && message.threadID == TEMP_CPC_GROUP_ID) || Number(message.senderID) == OWNER_ID)) {
            if (content.indexOf('/anagram ') > -1) {
              var query = encodeURIComponent(content.split('/anagram ')[1].replace('-partial', '').trim());
              var checkPartial = content.indexOf('-partial') > -1;
              var URL = 'http://anagram-solver.net/' + query + (checkPartial ? '?partial=1' : '');
              console.log(URL);
              sendMessage('Generating anagrams ' + (checkPartial ? '(using only some of the letters)' : '') + ' for \'' + query + '\'...', targets, function() {
                request(URL, function(error, response, body) {
                  if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    var results = $('ul.answers').children();
                    var anagrams = '';
                    if (results.length == 0) anagrams = 'No results found.';
                    for (var i = 0; i < (results.length >= 10 ? 10 : results.length); i++) {
                      anagrams += $(results[i]).children().text() + '\n';
                    }
                    anagrams = anagrams.toUpperCase();
                    sendMessage(anagrams, targets);
                  } else {
                    console.log(error, body);
                  }
                });
              });

            }

            var generateInfo = function(value, value_info, type) {
              console.log('Generating info for value: ' + value);
              value_info += '\nNumeric value: ' + value;
              if (type === 'b') {
                value_info += '\nASCII char code: ' + (value <= 26 ? String.fromCharCode(97 + value) : 'UNDEFINED');
              }
              if (type === 'h') {

              }
              sendMessage(value_info, targets);
            };

            if (content.replace(/[0-1]/g, '') == '') {
              // found binary
              generateInfo(parseInt(content.replace(/ /g, '').replace(/[a-z, A-Z]/g, ''), 2), 'Input binary: ' + content, 'b');
            } else if (content.match(/[0-9A-Fa-f]{6}/g) && content.length == 6) {
              // found hex
              generateInfo(parseInt(content.replace(/ /g, ''), 16), 'Input hex: ' + content, 'h');
            }

            if (content.indexOf('/index ') > -1) {
              var tokens = content.replace(/\/index/g, '').split(' ');
              var index_in = Number(tokens[tokens.length - 1]) - 1;
              tokens.pop();
              index_target = tokens.join('');
              if (index_in <= 0) {
                sendMessage('Invalid index.', targets);
              } else if (index_in > index_target.length) {
                sendMessage('Input string is too short.', targets);
              } else {
                sendMessage('Indexed char: ' + index_target[index_in], targets);
              }
            }

            if (content.indexOf('/caesar ') > -1) {
              var tokens = content.replace(/\/caesar/g, '').trim().split(' ');
              var rot = null;
              if (tokens.length > 1) {
                rot = Number(tokens[tokens.length - 1]);
                if (!isNaN(rot)) tokens.pop();
              }
              rot_target = tokens.join('');
              if (rot) {
                var rot_data = 'Original: ' + rot_target + '\n';
                var rotation = '';
                for (var j = 0; j < rot_target.length; j++) {
                  var cc = rot_target.charCodeAt(j) + rot;
                  if (cc > 122) {
                    cc -= 26;
                  }
                  rotation += String.fromCharCode(cc);
                }
                rot_data += rot + ': ' + rotation + '\n';
                sendMessage(rot_data, targets)
              } else if (!rot) {
                var rot_data = 'Original: ' + rot_target + '\n';
                for (var i = 1; i <= 26; i++) {
                  var rotation = '';
                  for (var j = 0; j < rot_target.length; j++) {
                    var cc = rot_target.charCodeAt(j) + i;
                    if (cc > 122) {
                      cc -= 26;
                    }
                    rotation += String.fromCharCode(cc);
                  }
                  rot_data += i + ': ' + rotation + '\n';
                }
                sendMessage(rot_data, targets)
              }
            }

            if (content.indexOf('/cpc') > -1) {
              sendMessage('/anagram <letters> (-partial)\n/index <phrase> (index value)\n/caesar <phrase> (shift)', targets);
            }
          }
        }
