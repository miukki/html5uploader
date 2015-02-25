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
		    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
		};

		$('#image_file').change(function () {


			    // get selected file element
			    var oFile = this.files[0];

			    // filter for image files
			    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
			    
			    if (!rFilter.test(oFile.type)) {
			        $('#error').html('').removeClass('hidden')
			        .append('You should select valid image files only!');
			        return;
			    }

			    // little test for filesize
			    if (oFile.size > iMaxFilesize) {
			    	$('#error').html('').removeClass('hidden')
			    	.append('Your file is very big. We can\'t accept it. Please select more small file');
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
			            element.removeClass('hidden')
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
			    var oProgress = $('#progress');

			    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
			    var oXHR = new XMLHttpRequest();        
			    oXHR.upload.addEventListener('progress', uploadProgress, false); // notice .upload.addEventListener  html5 feature
			    oXHR.addEventListener('load', uploadFinish, false);
			    oXHR.addEventListener('error', uploadError, false);
			    oXHR.addEventListener('abort', uploadAbort, false);
			    oXHR.open('POST', 'upload.php');
			    oXHR.send(new FormData($('#upload_form')[0])); //get form data for POSTing
			    //$('#upload_form')[0].getFormData(); // for FF3

			    // set inner timer
			    //oTimer = setInterval(doInnerUpdates, 300);
			}

		);

	
		function uploadProgress(e) { // upload process in progress
		    if (e.lengthComputable) {
		        iBytesUploaded = e.loaded;
		        iBytesTotal = e.total;
		        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
		        var iBytesTransfered = bytesToSize(iBytesUploaded);

		        $('#status').html('').removeClass('hidden')
		        .append(iPercentComplete.toString() + '%<br/>')
		        .append(bytesToSize(iBytesUploaded) + '<br/>');

		    } else {
		    	$('#status').html('').removeClass('hidden')
		    	.append('unable to compute');
		    }
		}

		function uploadFinish(e) { // upload successfully finished
			$('#status').removeClass('hidden')
			.append(e.target.responseText + '<br/>')
			.append('| 00:00:00');

		}

		function uploadError(e) { // upload error
			$('#status').html('').removeClass('hidden')
			.append('An error occurred while uploading the file');

		}  

		function uploadAbort(e) { // upload abort
			$('#status').html('').removeClass('hidden')
			.append('The upload has been canceled by the user or the browser dropped the connection');

		}

	});


}(jQuery);