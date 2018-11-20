let obj = null;
function login() {
  const email = $("#email").val();
  const password = $('#psw').val();
  obj = new Object({
    email: email,
    password: password
  })
  $.ajax({
    type: "POST",
    url: "/auth/",
    data: JSON.stringify(obj),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status, xhr) {
      window.location.href = data.redirect;
    },
    error: function (errMsg, status, xhr) {
      $('#warning').text(errMsg.responseText)
    }
  })
}
function register() {
  const name = $("#name").val();
  const email = $("#email").val();
  const password = $("#psw").val();
  const cfmPassword = $("#cfmPsw").val();

  if (password !== cfmPassword) return alert('Password is not match')

  obj = new Object({
    name: name,
    email: email,
    password: password
  })
  console.log(obj)
  $.ajax({
    type: "POST",
    url: "/users/",
    data: JSON.stringify(obj),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status, xhr) {
      window.location.href = data.redirect;
    },
    error: function (errMsg) {
      $('#warning').text(errMsg.responseText)
    }
  })
  
}