$.ajax({
    type: "POST",
    url: "http://localhost:3000/api/auth/",
    data: JSON.stringify({	
        "email":"lekhanhsinh@fpt.edu.vn",
        "password":"123456"
    }),
    success: function(data){
      console.log(data);
    },
    contentType: "application/json",
    dataType: 'json'
  });