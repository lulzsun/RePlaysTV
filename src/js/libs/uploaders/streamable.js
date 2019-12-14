import fs from 'fs';
import request from 'request';
import { GameDVRService } from '../../../../../../src/service/GameDVRService';
import ReplaysSettingsService from '../../replaysSettingsService';
import {createUploadNotification} from '../../uploads';

function upload(email, password, video, title='untitled') {
  return new Promise((accept, reject) => {
    let thumbPath = GameDVRService.getSaveDir() + video.posterUrl.replace('http://localhost:9000/s/thumbnails', '').replace(/%20/g, ' ');

    fs.copyFile(thumbPath, thumbPath.replace('-thumb', '-uthumb'), () => {
      thumbPath = thumbPath.replace('-thumb', '-uthumb').replace(GameDVRService.getSaveDir(), 'http://localhost:9000/s/thumbnails').replace(/ /g, '%20');
      console.log(thumbPath);
    });

    let size = fs.lstatSync(video.filePath).size;
    let bytes = 0;
    let notfication = createUploadNotification(video, title);

    let formData = {
      'file': fs.createReadStream(video.filePath).on('data', (chunk) => {
        notfication.progressbar.style ='width: ' + ((bytes += chunk.length) / size)*100 + '%';
        //console.log(bytes += chunk.length, size);
      }),
      'title': title
    };
  
    let credentials = `${email}:${password}`;
    let authorization = Buffer.from(credentials).toString('base64');
  
    request.post({
      url: 'https://api.streamable.com/upload',
      formData: formData,
      headers: {
        authorization: `Basic ${authorization}`,
      }
    }, function(err, response, body) {
      if (err) {
        console.log(err);
        notfication.dom.remove();
        alert('Error occured during uploading: ' + err);
        reject(err);
      }
      else {
        const data = {
          'title': title,
          'url': 'https://streamable.com/' + JSON.parse(body).shortcode,
          'id': video.id,
          'posterUrl': thumbPath,
          'createdTime': new Date(),
        }
        ReplaysSettingsService.addUploadClip(data.url, data);
        notfication.dom.remove();
        accept(data);
      }
    });
  });
}

export default {upload};