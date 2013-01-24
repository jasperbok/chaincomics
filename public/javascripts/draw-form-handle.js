$('#drawing-submit-btn').prop('disabled', !$('#drawing-submit-btn').prop('disabled'));

$('#drawing-submit-btn').on('click', function(e) {
  var base64Data = document.getElementById('drawing-canvas').toDataURL();
  $('input#base64').val(base64Data);
  $('input#base64').val(base64Data);
});
