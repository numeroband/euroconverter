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
            alert(JSON.stringify(data));
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
