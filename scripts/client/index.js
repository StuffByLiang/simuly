import './init/';
import Controller from './controller/';

socket.on('connect', () => {
  window.controller = new Controller(socket.id);

  controller.addVideo(socket.id, $('#localVideo')[0]);
  controller.start();
})

socket.on('peer', data => {
  controller.addPeer(data.peerId, data.initiator);
});

socket.on('disconnect', (id) => {
  controller.deletePeer(id);
  controller.deleteVideo(id);
})


if(windowlocation.hash=="") {
  window.location.href = location.href.replace(location.hash,"")
}
