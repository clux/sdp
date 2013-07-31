var tap = require('tap')
  , fs = require('fs')
  , test = tap.test
  , main = require('../')
  , parse = main.parse
  , parseFmtpConfig = main.parseFmtpConfig;

test("normal.sdp", function (t) {
  fs.readFile('./normal.sdp', function (err, sdp) {
    if (err) {
      t.ok(false, "failed to read file:" + err);
      t.end();
      return;
    }
    var session = parse(sdp+'');
    t.ok(session, "got session info");
    var media = session.media;
    t.ok(media && media.length > 0, "got media");

    //t.equal(session.identifier, '- 20518 0 IN IP4 203.0.113.1', 'identifier');
    t.equal(session.origin.username, '-', 'origin username');
    t.equal(session.origin.sessionId, 20518, 'origin sessionId');
    t.equal(session.origin.sessionVersion, 0, 'origin sessionVersion');
    t.equal(session.origin.netType, 'IN', 'origin netType');
    t.equal(session.origin.ipVer, 4, 'origin ipVer');
    t.equal(session.origin.address, '203.0.113.1', 'origin address');

    t.equal(session.connection.ip, '203.0.113.1');
    t.equal(session.connection.version, 4);

    // global ICE and fingerprint
    t.equal(session.iceUfrag, "F7gI", "global ufrag");
    t.equal(session.icePwd, "x9cml/YzichV2+XlhiMu8g", "global pwd");

    var audio = media[0];
    t.equal(audio.type, "audio", "audio");
    t.equal(audio.port, 54400, "audio port");
    t.equal(audio.protocol, "RTP/SAVPF", "audio protocol");
    t.equal(audio.sendrecv, "sendrecv", "audio sendrecv");
    t.equal(audio.rtp[0].payload, 0, "audio rtp 0 payload");
    t.equal(audio.rtp[0].codec, "PCMU", "audio rtp 0 codec");
    t.equal(audio.rtp[0].rate, 8000, "audio rtp 0 rate");
    t.equal(audio.rtp[1].payload, 96, "audio rtp 1 payload");
    t.equal(audio.rtp[1].codec, "opus", "audio rtp 1 codec");
    t.equal(audio.rtp[1].rate, 48000, "audio rtp 1 rate");
    t.equal(audio.ext[0].id, 1, "audio extmap 0 id");
    t.equal(audio.ext[0].uri, 'URI-toffset', "audio extmap 0 id");
    t.equal(audio.ext[1].id, 2, "audio extmap 0 id");
    t.equal(audio.ext[1].direction, 'recvonly', "audio extmap 0 id");
    t.equal(audio.ext[1].uri, 'URI-gps-string', "audio extmap 0 id");

    var video = media[1];
    t.equal(video.type, "video", "video");
    t.equal(video.port, 55400, "video port");
    t.equal(video.protocol, "RTP/SAVPF", "video protocol");
    t.equal(video.sendrecv, "sendrecv", "video sendrecv");
    t.equal(video.rtp[0].payload, 97, "video rtp 0 payload");
    t.equal(video.rtp[0].codec, "H264", "video rtp 0 codec");
    t.equal(video.rtp[0].rate, 90000, "video rtp 0 rate");
    t.equal(video.fmtp[0].payload, 97, "video fmtp 0 payload");
    var vidFmtp = parseFmtpConfig(video.fmtp[0].config);
    t.equal(vidFmtp['profile-level-id'], "4d0028", "video fmtp 0 profile-level-id");
    t.equal(vidFmtp['packetization-mode'], 1, "video fmtp 0 packetization-mode");
    t.equal(video.rtp[1].payload, 98, "video rtp 1 payload");
    t.equal(video.rtp[1].codec, "VP8", "video rtp 1 codec");
    t.equal(video.rtp[1].rate, 90000, "video rtp 1 rate");
    t.equal(video.rtcpFb[0].payload, '*', "video rtcp-fb 0 payload");
    t.equal(video.rtcpFb[0].type, 'nack', "video rtcp-fb 0 type");
    t.equal(video.rtcpFb[1].payload, 98, "video rtcp-fb 0 payload");
    t.equal(video.rtcpFb[1].type, 'nack', "video rtcp-fb 0 type");
    t.equal(video.rtcpFb[1].subtype, 'rpsi', "video rtcp-fb 0 subtype");
    t.equal(video.rtcpFbTrrInt[0].payload, 98, "video rtcp-fb trr-int 0 payload");
    t.equal(video.rtcpFbTrrInt[0].value, 100, "video rtcp-fb trr-int 0 value");
    t.equal(video.crypto[0].id, 1, "video crypto 0 id");
    t.equal(video.crypto[0].suite, 'AES_CM_128_HMAC_SHA1_32', "video crypto 0 suite");
    t.equal(video.crypto[0].config, 'inline:keNcG3HezSNID7LmfDa9J4lfdUL8W1F7TNJKcbuy|2^20|1:32', "video crypto 0 config");

    // ICE candidates (same for both audio and video in this case)
    [audio.candidates, video.candidates].forEach(function (cs, i) {
      var str = (i === 0) ? "audio " : "video ";
      var port = (i === 0) ? 54400 : 55400;
      t.equal(cs.length, 2, str + "got 2 candidates");
      t.equal(cs[0].foundation, 0, str + "ice candidate 0 foundation");
      t.equal(cs[0].component, 1, str + "ice candidate 0 component");
      t.equal(cs[0].transport, "UDP", str + "ice candidate 0 transport");
      t.equal(cs[0].priority, 2113667327, str + "ice candidate 0 priority");
      t.equal(cs[0].ip, "203.0.113.1", str + "ice candidate 0 ip");
      t.equal(cs[0].port, port, str + "ice candidate 0 port");
      t.equal(cs[0].type, "host", str + "ice candidate 0 type");
      t.equal(cs[1].foundation, 1, str + "ice candidate 1 foundation");
      t.equal(cs[1].component, 2, str + "ice candidate 1 component");
      t.equal(cs[1].transport, "UDP", str + "ice candidate 1 transport");
      t.equal(cs[1].priority, 2113667326, str + "ice candidate 1 priority");
      t.equal(cs[1].ip, "203.0.113.1", str + "ice candidate 1 ip");
      t.equal(cs[1].port, port+1, str + "ice candidate 1 port");
      t.equal(cs[1].type, "host", str + "ice candidate 1 type");
    });

    t.equal(media.length, 2, "got 2 m-lines");

    t.end();
  });
});
