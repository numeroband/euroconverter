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
            var converted = '';
            for (var i = 0; i < data.length; ++i) {
              if (data[i].error)
              {
                converted += data[i].error + '\n';
              } else {
                converted += data[i].date + '\t' + data[i].value.toFixed(2) + '\n';
              }
            }
            $("#converted").val(converted);
          },
          error: function() 
          {
            alert('error');
          }
      });
      e.preventDefault(); //STOP default action
  });
});
