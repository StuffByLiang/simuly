export default class Controller {
  constructor(id) {
    this.id = id;
    this.videos = [];
    this.peers = [];
  }
  getVideo(id) {
    return this.videos[id];
  }
  getVideoSrc(id) {
    return this.videos[id].srcObject;
  }
  addVideo(id, video) {
    this.videos[id] = video;
  }
  addVideoSrc(id, stream) {
    this.videos[id].srcObject = stream;
  }
  deleteVideo(id) {
    $(`#${id}`).remove();
    delete this.videos[id];
  }
  deletePeer(id) {
    this.peers[id].destroy();
    delete this.peers[id];
  }
  addPeer(id, isInitiator) {
    var options = {
      initiator: isInitiator,
      stream: this.getVideoSrc(this.id)
    }

    var peer = new SimplePeer(options);

    $('#video-container').append(`<video class="video" id="${id}" autoplay></video>`); //add new video!

    console.log('Peer available for connection discovered from signalling server, Peer ID: %s', id);

    socket.on('signal', data => {
      if (data.peerId == id) {
        console.log('Received signalling data', data, 'from Peer ID:', id);
        peer.signal(data.signal);
      }
    });

    peer.on('signal', data => {
      console.log('Advertising signalling data', data, 'to Peer ID:', id);
      socket.emit('signal', {
        signal: data,
        peerId: id
      });
    });
    peer.on('error', () => {
      console.log('Error sending connection to peer %s:', id, e);
    });
    peer.on('connect', () => {
      console.log('Peer connection established');
      // peer.send("hey peer");
    });
    peer.on('data', data => {
      console.log('Recieved data from peer:', data);
    });
    peer.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      this.addVideo(id, $(`#${id}`)[0]);
      this.addVideoSrc(id, stream);
    })

    this.peers[id] = peer;
  }
  start() {
    var constraints = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.addVideoSrc(this.id, stream);

        socket.emit("ready");
        this.ready();
      })
      .catch(err =>{
        console.log(err);
      });
  }
  ready() {

  }
}
