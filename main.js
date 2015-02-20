if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher')
  }
}(jQuery);



+function ($) {

	'use strict';
	
	$(function() {
	  // Handler for .ready() called.

		var iBytesUploaded = 0;
		var iBytesTotal = 0;
		var iPreviousBytesLoaded = 0;
		var iMaxFilesize = 1048576; // 1MB
		var oTimer = 0;
		var sResultFileSize = '';

		function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
		    var hr = Math.floor(secs / 3600);
		    var min = Math.floor((secs - (hr * 3600))/60);
		    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

		    if (hr < 10) {hr = "0" + hr; }
		    if (min < 10) {min = "0" + min;}
		    if (sec < 10) {sec = "0" + sec;}
		    if (hr) {hr = "00";}
		    return hr + ':' + min + ':' + sec;
		};

		function bytesToSize(bytes) {
		    var sizes = ['Bytes', 'KB', 'MB'];
		    if (bytes == 0) return 'n/a';
		    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		    console.log('Math.log(bytes)', Math.log(bytes), 'Math.log(1024)', Math.log(1024))
		    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
		};

		$('#image_file').change(function () {


			    // get selected file element
			    var oFile = this.files[0];

			    // filter for image files
			    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
			    
			    if (!rFilter.test(oFile.type)) {
			        document.getElementById('error').style.display = 'block';
			        return;
			    }

			    // little test for filesize
			    if (oFile.size > iMaxFilesize) {
			        document.getElementById('warnsize').style.display = 'block';
			        return;
			    }

			    // get preview element
			    var oImage = $('#preview');

			    // prepare HTML5 FileReader
			    var oReader = new FileReader();

			    // read selected file as DataURL
			    oReader.readAsDataURL(oFile);

			    oReader.onload = function(e){

			        // e.target.result contains the DataURL which we will use as a source of the image
			        oImage.attr('src', e.target.result);

			        oImage.load(function () { // binding onload event
			        	var element = $('#fileinfo');
			            // we are going to display some custom image information here
			            element.css('display', 'block')
			            .append(' Name: ' + oFile.name)
			            .append(' Size: ' + bytesToSize(oFile.size))
			            .append(' Type: ' + oFile.type)
			            .append(' Dimension: ' + oImage.width() + ' x ' + oImage.height());
			        });

			    };

			}

		);
		$('#startUploading').click(
			function startUploading() {
			    // cleanup all temp states
			    iPreviousBytesLoaded = 0;
			    document.getElementById('upload_response').style.display = 'none';
			    document.getElementById('error').style.display = 'none';
			    document.getElementById('error2').style.display = 'none';
			    document.getElementById('abort').style.display = 'none';
			    document.getElementById('warnsize').style.display = 'none';
			    document.getElementById('progress_percent').innerHTML = '';
			    var oProgress = document.getElementById('progress');
			    oProgress.style.display = 'block';
			    oProgress.style.width = '0px';

			    // get form data for POSTing

			    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
			    var oXHR = new XMLHttpRequest();        
			    oXHR.upload.addEventListener('progress', uploadProgress, false); // notice .upload.addEventListener  html5 feature
			    oXHR.addEventListener('load', uploadFinish, false);
			    oXHR.addEventListener('error', uploadError, false);
			    oXHR.addEventListener('abort', uploadAbort, false);
			    oXHR.open('POST', 'upload.php');
			    oXHR.send(new FormData(document.getElementById('upload_form'))); //document.getElementById('upload_form').getFormData(); // for FF3

			    // set inner timer
			    oTimer = setInterval(doInnerUpdates, 300);
			}

		);

		function doInnerUpdates() { //  display speed and time remainig
		    var iCB = iBytesUploaded;
		    var iDiff = iCB - iPreviousBytesLoaded;

		    // if nothing new loaded - exit
		    if (iDiff == 0)
		        return;

		    iPreviousBytesLoaded = iCB;
		    iDiff = iDiff * 2;
		    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
		    var secondsRemaining = iBytesRem / iDiff;

		    // update speed info
		    var iSpeed = iDiff.toString() + 'B/s';
		    if (iDiff > 1024 * 1024) {
		        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
		    } else if (iDiff > 1024) {
		        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
		    }

		    document.getElementById('speed').innerHTML = iSpeed;
		    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);        
		}

		function uploadProgress(e) { // upload process in progress
		    if (e.lengthComputable) {
		        iBytesUploaded = e.loaded;
		        iBytesTotal = e.total;
		        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
		        var iBytesTransfered = bytesToSize(iBytesUploaded);

		        document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
		        document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
		        document.getElementById('b_transfered').innerHTML = iBytesTransfered;
		        if (iPercentComplete == 100) {
		            var oUploadResponse = document.getElementById('upload_response');
		            oUploadResponse.innerHTML = '<h1>Please wait...processing</h1>';
		            oUploadResponse.style.display = 'block';
		        }
		    } else {
		        document.getElementById('progress').innerHTML = 'unable to compute';
		    }
		}

		function uploadFinish(e) { // upload successfully finished
		    var oUploadResponse = document.getElementById('upload_response');
		    oUploadResponse.innerHTML = e.target.responseText;
		    oUploadResponse.style.display = 'block';

		    document.getElementById('progress_percent').innerHTML = '100%';
		    document.getElementById('progress').style.width = '400px';
		    document.getElementById('filesize').innerHTML = sResultFileSize;
		    document.getElementById('remaining').innerHTML = '| 00:00:00';

		    clearInterval(oTimer);
		}

		function uploadError(e) { // upload error
		    document.getElementById('error2').style.display = 'block';
		    clearInterval(oTimer);
		}  

		function uploadAbort(e) { // upload abort
		    document.getElementById('abort').style.display = 'block';
		    clearInterval(oTimer);
		}

	});


}(jQuery);