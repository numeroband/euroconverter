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
            if (data.error)
            {
              alert(data.error);
              return;
            }
            $("#converted").html('');
            for (var i = 0; i < data.length; ++i) {
              if (data[i].error)
              {
                $("#converted").append('<p>' + data[i].error + '</p>');
              } else {
                $("#converted").append('<p>' + data[i].date + ' $' + data[i].value + '</p>');                
              }
            }
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
