$(document).ready(function() {
  $("#ajaxform").submit(function(e)
  {
      var postData = $(this).serializeArray();
      var formURL = $(this).attr("action");
      $.ajax(
      {
          url : formURL,
          type: $(this).attr("method"),
          data : postData,
          success:function(data) 
          {
            $("#converted").html(data.date + ': $' + data.value);
          },
          error: function() 
          {
            alert('error');
          }
      });
      e.preventDefault(); //STOP default action
      e.unbind(); //unbind. to stop multiple form submit.
  });
});
