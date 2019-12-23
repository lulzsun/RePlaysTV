import fs from 'fs';
import shortid from 'shortid';
import { GameDVRService } from '../../../../../../src/service/GameDVRService';
import { log } from '../../../../../../src/core/Logger';
import ReplaysSettingsService from '../../replaysSettingsService';
import {createUploadNotification} from '../../uploads';

function upload(location, video, title='untitled') {
  return new Promise((accept, reject) => {
    let thumbPath = GameDVRService.getSaveDir() + video.posterUrl.replace('http://localhost:9000/s/thumbnails', '').replace(/%20/g, ' ');

    fs.copyFile(thumbPath, thumbPath.replace('-thumb', '-uthumb'), () => {
      thumbPath = thumbPath.replace('-thumb', '-uthumb').replace(GameDVRService.getSaveDir(), 'http://localhost:9000/s/thumbnails').replace(/ /g, '%20');
      console.log(thumbPath);
    });

    let size = fs.lstatSync(video.filePath).size;
    let bytes = 0;
    let notfication = createUploadNotification(video, title);

    //before doing anything, make sure file does not exist yet, if it does, 
    //we will add some random characters to the
    if (fs.existsSync(`${location}\\${title}.mp4`)) {
        location = `${location}\\${title}-${shortid.generate()}.mp4`;
    } else location = `${location}\\${title}.mp4`;

    var rd = fs.createReadStream(video.filePath);
    rd.on('error', function(err) {
        log.error(`Error occured during uploading: ${title}`);
        log.error(err);
        notfication.dom.remove();
        alert(`Error occured during uploading: ${title}`);
        reject(err);
    });
    rd.on('data', (chunk) => {
        notfication.progressbar.style ='width: ' + ((bytes += chunk.length) / size)*100 + '%';
    });
    var wr = fs.createWriteStream(location);
    wr.on('error', function(err) {
        log.error(err);
        notfication.dom.remove();
        alert(`Error occured during uploading: ${title}`);
        reject(err);
    });
    wr.on('close', function() { // should be successful
        const data = {
            'title': title,
            'url': location,
            'id': video.id,
            'posterUrl': thumbPath,
            'uploadPlatform': "Shared Folder",
            'createdTime': new Date(),
        }
        ReplaysSettingsService.addUploadClip(data.url, data);
        notfication.dom.remove();
        accept(data);
    });
    rd.pipe(wr);
  });
}

export default {upload};